"""Smart CV Shortlisting: deterministic, explainable applicant scoring.

No external calls. Every number here can be recomputed from data already in
the database (or in an application's saved cv_snapshot), so results are
reproducible and auditable.

Fit score = skills * w_skills + quiz * w_quiz + experience * w_experience,
each sub-score on a 0-100 scale, weights normalized to sum to 100. A
sub-score whose underlying data doesn't exist (no required skills on the
job, or no quiz/attempt) is dropped and its weight is redistributed
proportionally across the remaining sub-scores, rather than scored as zero.
"""
import re
from datetime import date

DEFAULT_WEIGHTS = {'skills': 50.0, 'quiz': 30.0, 'experience': 20.0}
# A candidate needs this many years of relevant experience to earn full marks
# on the years-based half of the experience sub-score. Chosen as a generous
# but finite ceiling so a 20-year veteran doesn't dominate a 10-year one.
MAX_EXPERIENCE_YEARS = 10
STOPWORDS = {
    'the', 'and', 'for', 'with', 'you', 'your', 'a', 'an', 'to', 'of', 'in', 'on', 'is', 'are',
    'be', 'we', 'our', 'or', 'as', 'at', 'this', 'that', 'will', 'have', 'has', 'job', 'role',
    'work', 'working', 'team', 'skills', 'experience', 'years', 'year', 'strong', 'good',
}


def normalize_weights(w_skills, w_quiz, w_experience):
    """Scale the three weights so they sum to 100. Falls back to the defaults
    if the caller supplied nothing usable (all zero or negative)."""
    weights = {'skills': max(float(w_skills or 0), 0), 'quiz': max(float(w_quiz or 0), 0), 'experience': max(float(w_experience or 0), 0)}
    total = sum(weights.values())
    if total <= 0:
        return dict(DEFAULT_WEIGHTS)
    return {k: v / total * 100 for k, v in weights.items()}


def _redistribute(weights, drop_keys):
    """Zero out the dropped sub-scores and rescale the rest to still sum to 100."""
    kept = {k: v for k, v in weights.items() if k not in drop_keys}
    kept_total = sum(kept.values())
    if kept_total <= 0:
        # Only possible if every remaining weight was already zero; split evenly.
        equal = 100.0 / len(kept) if kept else 0
        return {k: (equal if k in kept else 0) for k in weights}
    return {k: (kept[k] / kept_total * 100 if k in kept else 0) for k in weights}


def _parse_date(value):
    if value is None or value == '':
        return None
    if isinstance(value, str):
        try:
            return date.fromisoformat(value[:10])
        except ValueError:
            return None
    return value  # already a date/datetime


def _tokenize(text):
    return {w for w in re.findall(r'[a-z0-9]+', (text or '').lower()) if len(w) > 2} - STOPWORDS


def experience_years(experience_entries):
    """Sum of years across all experience entries (current roles run to today), capped."""
    total_days = 0
    today = date.today()
    for entry in experience_entries or []:
        start = _parse_date(entry.get('start_date'))
        if not start:
            continue
        end = today if entry.get('current') else (_parse_date(entry.get('end_date')) or today)
        if end < start:
            continue
        total_days += (end - start).days
    years = total_days / 365.25
    return min(years, MAX_EXPERIENCE_YEARS)


def _keyword_relevance(job_title, job_requirements, experience_entries):
    """0-100: how much the candidate's experience titles/descriptions overlap
    with the job's own title/requirements, as a fraction of the job's keywords."""
    job_tokens = _tokenize(job_title) | _tokenize(job_requirements)
    if not job_tokens:
        return 0.0
    exp_tokens = set()
    for entry in experience_entries or []:
        exp_tokens |= _tokenize(entry.get('title')) | _tokenize(entry.get('description'))
    if not exp_tokens:
        return 0.0
    overlap = job_tokens & exp_tokens
    return len(overlap) / len(job_tokens) * 100


def experience_score(job, experience_entries):
    """Blends years of experience (capped) with keyword relevance to this
    specific job, half and half, so a long but unrelated career and a short
    but highly relevant one both get fair credit."""
    years = experience_years(experience_entries)
    years_component = min(years / MAX_EXPERIENCE_YEARS, 1) * 100
    relevance_component = _keyword_relevance(job.title, job.requirements, experience_entries)
    return round(years_component * 0.5 + relevance_component * 0.5, 2), round(years, 1)


def get_cv_data(application):
    """The candidate's skills (as {id, name}) and experience entries, preferring
    the snapshot saved at apply time and falling back to their live profile.
    Callers should prefetch candidate__seeker_profile__skills/experience and
    quiz_attempts on the queryset to keep this query-free per application."""
    snapshot = application.cv_snapshot or None
    if snapshot:
        skills = [s for s in snapshot.get('skills') or [] if s.get('id') is not None]
        return {'skills': skills, 'experience': snapshot.get('experience') or []}
    profile = getattr(application.candidate, 'seeker_profile', None)
    if not profile:
        return {'skills': [], 'experience': []}
    skills = [{'id': s.id, 'name': s.name} for s in profile.skills.all()]
    experience = [
        {
            'title': e.title, 'company': e.company, 'description': e.description,
            'start_date': e.start_date.isoformat() if e.start_date else None,
            'end_date': e.end_date.isoformat() if e.end_date else None,
            'current': e.current,
        }
        for e in profile.experience.all()
    ]
    return {'skills': skills, 'experience': experience}


def best_quiz_percentage(application):
    """The candidate's best submitted attempt for THIS application, or None if
    they haven't attempted it. Expects quiz_attempts to be prefetched."""
    attempts = [a for a in application.quiz_attempts.all() if a.submitted_at is not None]
    if not attempts:
        return None
    return max(float(a.percentage) for a in attempts)


def score_application(job, application, required_skills, weights, must_have_ids, job_has_quiz):
    """required_skills: list of Skill instances for the job (fetch once, reuse
    across applications). weights: raw {'skills','quiz','experience'} inputs,
    not yet normalized. must_have_ids: iterable of skill ids the candidate
    must have, or empty/None for no hard requirement. job_has_quiz: computed
    once by the caller (hasattr(job, 'quiz') triggers a query the first time)."""
    base_weights = normalize_weights(weights.get('skills'), weights.get('quiz'), weights.get('experience'))
    cv = get_cv_data(application)
    candidate_skill_ids = {s['id'] for s in cv['skills']}
    candidate_skill_names = {s['id']: s['name'] for s in cv['skills']}

    drop = set()
    skills_score = None
    matched_skills, missing_skills = [], []
    if required_skills:
        required_ids = {s.id for s in required_skills}
        matched_ids = required_ids & candidate_skill_ids
        missing_ids = required_ids - candidate_skill_ids
        matched_skills = [s.name for s in required_skills if s.id in matched_ids]
        missing_skills = [s.name for s in required_skills if s.id in missing_ids]
        skills_score = round(len(matched_ids) / len(required_ids) * 100, 2)
    else:
        drop.add('skills')

    quiz_pct = best_quiz_percentage(application)
    if not job_has_quiz or quiz_pct is None:
        drop.add('quiz')

    experience_component, years = experience_score(job, cv['experience'])

    weights_final = _redistribute(base_weights, drop) if drop else base_weights
    fit_score = (
        (skills_score or 0) * weights_final['skills'] / 100
        + (quiz_pct or 0) * weights_final['quiz'] / 100
        + experience_component * weights_final['experience'] / 100
    )

    must_have_ids = set(must_have_ids or [])
    knocked_out = bool(must_have_ids) and not must_have_ids.issubset(candidate_skill_ids)

    explanation_parts = []
    if 'skills' not in drop:
        if missing_skills:
            explanation_parts.append(f"Matches {len(matched_skills)}/{len(required_skills)} required skills, missing {', '.join(missing_skills)}")
        else:
            explanation_parts.append(f"Matches {len(matched_skills)}/{len(required_skills)} required skills")
    if 'quiz' not in drop:
        explanation_parts.append(f"quiz {quiz_pct:.0f}%")
    year_word = 'yr' if round(years, 1) == 1 else 'yrs'
    explanation_parts.append(f"{years:.1f} {year_word} relevant experience")
    if knocked_out:
        missing_must_have = [candidate_skill_names.get(i) or (next((s.name for s in required_skills if s.id == i), None)) for i in (must_have_ids - candidate_skill_ids)]
        explanation_parts.append(f"missing must-have skill(s): {', '.join(n for n in missing_must_have if n)}")

    return {
        'application_id': application.id,
        'fit_score': round(fit_score, 1),
        'breakdown': {
            'skills': skills_score,
            'quiz': round(quiz_pct, 2) if quiz_pct is not None else None,
            'experience': experience_component,
        },
        'matched_skills': matched_skills,
        'missing_skills': missing_skills,
        'knocked_out': knocked_out,
        'explanation': '; '.join(explanation_parts) + '.',
    }


def rank_applicants(job, applications, weights=None, must_have_ids=None):
    """Scores every application for this job and returns them sorted by fit
    score, highest first — knocked-out candidates (missing a must-have skill)
    are never dropped, just ranked after everyone who isn't knocked out."""
    weights = weights or DEFAULT_WEIGHTS
    required_skills = list(job.skills.all())
    job_has_quiz = hasattr(job, 'quiz')
    results = [score_application(job, app, required_skills, weights, must_have_ids, job_has_quiz) for app in applications]
    results.sort(key=lambda r: (r['knocked_out'], -r['fit_score']))
    return results
