import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  BriefcaseBusiness,
  CheckCircle2,
  Edit3,
  Eye,
  FileQuestion,
  GripVertical,
  MapPin,
  Plus,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Field,
  Modal,
  PageHeader,
  SearchBox,
  StatCard,
  StatusBadge,
  EmptyState,
  ErrorState,
  Spinner,
} from "../shared/components/common/UI";
import { useToast } from "../shared/context/ToastContext";
import { jobService, profileService, skillService } from "../shared/services/shared";
import { formatRange } from "../shared/services/normalize";
import { applicantService, quizBuilderService, rankedApplicantService } from "./employerService";
import { useAsync } from "../shared/hooks/useAsync";

const initialsOf = (name = "") =>
  name.split(" ").filter(Boolean).map((n) => n[0]).slice(0, 2).join("").toUpperCase() || "SN";

function ApplicantTable({ items, onView, onAct, acting }) {
  return (
    <div className="data-table">
      <div className="table-head">
        <span>Candidate</span>
        <span>Role applied</span>
        <span>Skills</span>
        <span>Score</span>
        <span>Status</span>
        <span />
      </div>
      {items.map((a) => (
        <div className="table-row" key={a.id}>
          <span className="person-cell">
            <Avatar initials={initialsOf(a.candidate?.name)} />
            <i>
              <strong>{a.candidate?.name || "Candidate"}</strong>
              <small>{a.candidate?.email}</small>
            </i>
          </span>
          <span>{a.jobTitle}</span>
          <span className="skills">
            {(a.candidate_profile?.skills || []).slice(0, 2).map((s) => (
              <Badge key={s.id}>{s.name}</Badge>
            ))}
          </span>
          <strong>{a.score != null ? `${a.score}%` : "—"}</strong>
          <StatusBadge status={a.status} />
          <span className="row-actions">
            <button className="text-link" onClick={() => onView?.(a)}>
              View CV
            </button>
            {onAct && nextAction(a.status_code) && (
              <Button variant="secondary" disabled={acting} onClick={() => onAct(a, nextAction(a.status_code).status)}>
                {nextAction(a.status_code).label}
              </Button>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}

export function EmployerDashboard() {
  const nav = useNavigate();
  const { data: applicants } = useAsync(applicantService.getAll);
  return (
    <>
      <section className="welcome-panel">
        <div>
          <span className="eyebrow">HIRING OVERVIEW</span>
          <h1>Good afternoon, Tasnim</h1>
          <p>Three candidates need your review today.</p>
        </div>
        <Link to="/employer/jobs/create" className="btn btn-primary">
          <Plus />
          Create a job
        </Link>
      </section>
      <div className="stats-grid three">
        <StatCard
          label="Active jobs"
          value="8"
          change="2 closing this week"
          icon={BriefcaseBusiness}
        />
        <StatCard
          label="Applications"
          value="146"
          change="↑ 18% this month"
          icon={Users}
          tone="blue"
        />
        <StatCard
          label="Shortlisted"
          value="24"
          change="7 awaiting interview"
          icon={UserCheck}
          tone="purple"
        />
      </div>
      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Recent applicants</h2>
              <p>Newest candidates across active roles</p>
            </div>
            <Link className="text-link" to="/employer/applicants">
              View all
            </Link>
          </div>
          {applicants?.length ? (
            <ApplicantTable items={applicants.slice(0, 3)} onView={() => nav("/employer/applicants")} />
          ) : (
            <EmptyState title="No applicants yet" description="Applicants will appear here once candidates apply." />
          )}
        </section>
        <section className="panel">
          <div className="panel-head">
            <h2>Hiring pipeline</h2>
          </div>
          <div className="funnel">
            {[
              ["Applications", 146, "100%"],
              ["Passed assessment", 82, "68%"],
              ["Shortlisted", 24, "42%"],
              ["Hired", 6, "20%"],
            ].map((x) => (
              <div key={x[0]}>
                <span>{x[0]}</span>
                <b>{x[1]}</b>
                <i style={{ width: x[2] }} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

export function ManageJobs() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All");
  const [remove, setRemove] = useState(null);
  const [removedIds, setRemovedIds] = useState([]);
  const { show } = useToast();
  const { data, loading, error } = useAsync(jobService.getJobs);
  const jobs = (data || []).filter((job) => !removedIds.includes(job.id));
  const visibleJobs = jobs.filter((job) => job.title.toLowerCase().includes(q.toLowerCase()) && (status === "All" || job.status === status));
  const deleteJob = async () => {
    try {
      await jobService.remove(remove.id);
      setRemovedIds((ids) => [...ids, remove.id]);
      show("Job deleted.");
    } catch {
      show("We could not delete this job.");
    } finally {
      setRemove(null);
    }
  };
  return (
    <>
      <PageHeader
        title="Manage jobs"
        description="Create, publish, and improve your open roles."
        actions={
          <Link className="btn btn-primary" to="/employer/jobs/create">
            <Plus />
            Create job
          </Link>
        }
      />
      <div className="panel table-panel">
        <div className="table-toolbar">
          <SearchBox
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search jobs"
          />
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="All">All statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
        <div className="jobs-table">
          <div className="table-head">
            <span>Role</span>
            <span>Status</span>
            <span>Applications</span>
            <span>Assessment</span>
            <span>Posted</span>
            <span />
          </div>
          {loading ? <Spinner /> : error ? <ErrorState /> : visibleJobs.length ? visibleJobs.map((j) => (
              <div className="table-row" key={j.id}>
                <span>
                  <strong>{j.title}</strong>
                  <small>{j.location}</small>
                </span>
                <Badge tone={j.status === "PUBLISHED" ? "success" : "default"}>{j.status}</Badge>
                <strong>{j.applications_count || 0}</strong>
                <span>{j.quiz ? "Attached" : "None"}</span>
                <small>{j.posted}</small>
                <span className="row-actions">
                  <Link to={`/jobs/${j.id}`}>
                    <Eye />
                  </Link>
                  <Link to={`/employer/jobs/${j.id}/edit`}>
                    <Edit3 />
                  </Link>
                  <button onClick={() => setRemove(j)}>
                    <Trash2 />
                  </button>
                </span>
              </div>
            )) : <EmptyState title="No jobs found" description="Create a new job or change your filters." />}
        </div>
      </div>
      <Modal
        open={!!remove}
        onClose={() => setRemove(null)}
        title="Delete this job?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRemove(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={deleteJob}
            >
              Delete job
            </Button>
          </>
        }
      >
        <p>
          Remove <strong>{remove?.title}</strong> from public search?
        </p>
      </Modal>
    </>
  );
}

export function JobForm() {
  const { show } = useToast();
  const nav = useNavigate();
  const { id } = useParams();
  const { data: skills, loading: skillsLoading } = useAsync(skillService.getAll);
  const { data: existing, loading: jobLoading, error: jobError } = useAsync(() => id ? jobService.getById(id) : Promise.resolve(null), [id]);
  const submit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const skillIds = form.getAll("skill_ids").map(Number);
    const payload = {
      title: form.get("title"), category: form.get("category"), job_type: form.get("job_type"), location: form.get("location"),
      salary_min: form.get("salary_min") || null, experience: form.get("experience"), description: form.get("description"),
      requirements: form.get("requirements"), skill_ids: skillIds, status: e.nativeEvent.submitter?.value || "PUBLISHED",
    };
    if (!skillIds.length) {
      show("Select at least one required skill.");
      return;
    }
    try {
      if (id) await jobService.update(id, payload);
      else await jobService.create(payload);
      show(payload.status === "DRAFT" ? "Draft saved." : "Job published successfully.");
      nav("/employer/jobs");
    } catch (requestError) {
      const detail = requestError.response?.data;
      show(typeof detail === "string" ? detail : "We could not save this job. Check the form and try again.");
    }
  };
  if (jobLoading || skillsLoading) return <Spinner />;
  if (jobError) return <ErrorState message="We could not load this job." />;
  return (
    <>
      <PageHeader
        title={id ? "Edit job" : "Create a job"}
        description="Give candidates a clear, honest view of the opportunity."
      />
      <form className="form-layout" onSubmit={submit}>
        <section className="panel form-section">
          <div className="section-number">01</div>
          <div>
            <h2>Role details</h2>
            <div className="form-grid">
              <Field label="Job title">
                <input name="title" required placeholder="Frontend Developer" defaultValue={existing?.title} />
              </Field>
              <Field label="Category">
                <select name="category" required defaultValue={existing?.category || "Technology"}>
                  <option>Technology</option>
                  <option>Design</option>
                  <option>Business</option>
                  <option>Customer Service</option>
                </select>
              </Field>
              <Field label="Job type">
                <select name="job_type" defaultValue={existing?.job_type || "FULL_TIME"}>
                  <option value="FULL_TIME">Full-time</option>
                  <option value="PART_TIME">Part-time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="INTERNSHIP">Internship</option>
                  <option value="FREELANCE">Freelance</option>
                </select>
              </Field>
              <Field label="Location">
                <input name="location" required placeholder="Dhaka or Remote" defaultValue={existing?.location} />
              </Field>
              <Field label="Minimum salary">
                <input name="salary_min" type="number" min="0" defaultValue={existing?.salary_min || ""} />
              </Field>
              <Field label="Experience">
                <select name="experience" defaultValue={existing?.experience || "Entry level"}>
                  <option>Entry level</option>
                  <option>1–2 years</option>
                </select>
              </Field>
            </div>
          </div>
        </section>
        <section className="panel form-section">
          <div className="section-number">02</div>
          <div>
            <h2>About the work</h2>
            <Field label="Description">
              <textarea name="description" required rows="6" defaultValue={existing?.description} />
            </Field>
            <Field label="Requirements">
              <textarea name="requirements" required rows="4" defaultValue={existing?.requirements} />
            </Field>
          </div>
        </section>
        <section className="panel form-section">
          <div className="section-number">03</div>
          <div>
            <h2>Skills & assessment</h2>
            <Field label="Required skills">
                <select name="skill_ids" required multiple defaultValue={existing?.skills?.map((name) => String(skills?.find((skill) => skill.name === name)?.id)).filter(Boolean) || []}>
                  {(skills || []).map((skill) => <option key={skill.id} value={skill.id}>{skill.name}</option>)}
                </select>
            </Field>
            {id ? (
              <Link className="attach-quiz" to={`/employer/quizzes?job=${id}`}>
                <FileQuestion />
                <span>
                  <strong>{existing?.quiz_id ? "Edit the attached assessment" : "Attach a skills assessment"}</strong>
                  <small>{existing?.quiz_id ? "This job already has a quiz — review or update it in the Quiz builder." : "Build a quiz for this job in the Quiz builder."}</small>
                </span>
              </Link>
            ) : (
              <div className="attach-quiz">
                <FileQuestion />
                <span>
                  <strong>Attach a skills assessment</strong>
                  <small>Save this job first, then attach an assessment from the Quiz builder.</small>
                </span>
              </div>
            )}
          </div>
        </section>
        <div className="form-actions">
          <Button
            type="submit"
            variant="secondary"
            value="DRAFT"
          >
            Save draft
          </Button>
          <Button type="submit" value="PUBLISHED">Publish job</Button>
        </div>
      </form>
    </>
  );
}

// Any application that hasn't been shortlisted yet (however far along the quiz/review
// process it is) can be shortlisted directly — the backend doesn't enforce a strict
// step-by-step ladder, so the UI shouldn't force an extra "move to review" click first.
const PRE_SHORTLIST = ["APPLIED", "ASSESSMENT_PENDING", "UNDER_REVIEW"];
const NEXT_STATUS = {
  SHORTLISTED: { status: "INTERVIEW", label: "Move to interview" },
  INTERVIEW: { status: "OFFER", label: "Extend offer" },
  OFFER: { status: "HIRED", label: "Mark hired" },
};
const nextAction = (statusCode) => (PRE_SHORTLIST.includes(statusCode) ? { status: "SHORTLISTED", label: "Shortlist" } : NEXT_STATUS[statusCode]);
const REJECTABLE = ["APPLIED", "ASSESSMENT_PENDING", "UNDER_REVIEW", "SHORTLISTED", "INTERVIEW", "OFFER"];
const STATUS_FILTER_OPTIONS = ["APPLIED", "ASSESSMENT_PENDING", "UNDER_REVIEW", "SHORTLISTED", "INTERVIEW", "OFFER", "HIRED", "REJECTED", "WITHDRAWN"];

function FitBadge({ score, knockedOut }) {
  const tone = score == null ? "default" : knockedOut ? "default" : score >= 75 ? "success" : score >= 50 ? "purple" : "danger";
  return (
    <div className={`fit-score-badge tone-${tone}`}>
      <strong>{score != null ? score.toFixed(1) : "—"}</strong>
      <small>fit score</small>
    </div>
  );
}
function ScoreBar({ label, value }) {
  return (
    <div className="score-bar-row">
      <small>{label}</small>
      <div className="progress">
        <i style={{ width: `${value ?? 0}%` }} />
      </div>
      <small>{value != null ? `${Math.round(value)}%` : "N/A"}</small>
    </div>
  );
}
function CandidateCV({ application }) {
  const profile = application.candidate_profile;
  return (
    <div className="candidate-modal">
      <Avatar initials={initialsOf(application.candidate?.name)} size="lg" />
      <h2>{application.candidate?.name || "Candidate"}</h2>
      <p>{profile?.headline || `Applied for ${application.jobTitle}`}</p>
      {profile?.location && (
        <span>
          <MapPin size={14} />
          {profile.location}
        </span>
      )}
      {application.fit_score != null && (
        <div className="score-highlight">
          <FitBadge score={application.fit_score} knockedOut={application.knocked_out} />
          <div className="score-bars">
            <ScoreBar label="Skills" value={application.breakdown?.skills} />
            <ScoreBar label="Quiz" value={application.breakdown?.quiz} />
            <ScoreBar label="Experience" value={application.breakdown?.experience} />
          </div>
        </div>
      )}
      {application.explanation && <p className="muted">{application.explanation}</p>}
      {application.knocked_out && <Badge tone="danger">Missing a must-have skill</Badge>}
      {application.score != null && <strong>{application.score}% assessment score</strong>}
      {profile?.summary && <p className="muted">{profile.summary}</p>}
      {profile?.skills?.length > 0 && (
        <div className="skills">
          {profile.skills.map((s) => (
            <Badge key={s.id}>{s.name}</Badge>
          ))}
        </div>
      )}
      {profile?.experience?.length > 0 && (
        <div className="entry-list">
          <h3>Experience</h3>
          {profile.experience.map((x) => (
            <div key={x.id}>
              <div>
                <strong>
                  {x.title} — {x.company}
                </strong>
                <small>{formatRange(x.start_date, x.end_date, x.current)}</small>
              </div>
            </div>
          ))}
        </div>
      )}
      {profile?.education?.length > 0 && (
        <div className="entry-list">
          <h3>Education</h3>
          {profile.education.map((e) => (
            <div key={e.id}>
              <div>
                <strong>
                  {e.degree}
                  {e.field ? ` in ${e.field}` : ""} — {e.institution}
                </strong>
                <small>{formatRange(e.start_date, e.end_date)}</small>
              </div>
            </div>
          ))}
        </div>
      )}
      {profile?.certificates?.length > 0 && (
        <div className="entry-list">
          <h3>Certificates</h3>
          {profile.certificates.map((c) => (
            <div key={c.id}>
              <div>
                <strong>
                  {c.name} — {c.issuer}
                </strong>
              </div>
            </div>
          ))}
        </div>
      )}
      {application.cover_letter && (
        <div className="entry-list">
          <h3>Cover letter</h3>
          <p>{application.cover_letter}</p>
        </div>
      )}
      {!profile && <EmptyState title="No profile details yet" description="This candidate hasn't completed their profile." />}
    </div>
  );
}

const DEFAULT_WEIGHTS = { skills: 50, quiz: 30, experience: 20 };

function CompareModal({ applications, onClose }) {
  return (
    <Modal open={!!applications} onClose={onClose} title="Compare candidates">
      {applications && (
        <div className="compare-grid">
          {applications.map((a) => (
            <div className="compare-column" key={a.id}>
              <Avatar initials={initialsOf(a.candidate?.name)} size="lg" />
              <strong>{a.candidate?.name || "Candidate"}</strong>
              <FitBadge score={a.fit_score} knockedOut={a.knocked_out} />
              <ScoreBar label="Skills" value={a.breakdown?.skills} />
              <ScoreBar label="Quiz" value={a.breakdown?.quiz} />
              <ScoreBar label="Experience" value={a.breakdown?.experience} />
              <div className="skills">
                {(a.matched_skills || []).map((s) => (
                  <Badge tone="success" key={s}>
                    {s}
                  </Badge>
                ))}
                {(a.missing_skills || []).map((s) => (
                  <Badge tone="danger" key={s}>
                    {s}
                  </Badge>
                ))}
              </div>
              <StatusBadge status={a.status} />
              <small className="muted">{a.explanation}</small>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

export function Applicants() {
  const { show } = useToast();
  const { data: jobs, loading: jobsLoading } = useAsync(jobService.getJobs);
  const [jobId, setJobId] = useState("");
  const [requiredSkills, setRequiredSkills] = useState([]);
  const [ranked, setRanked] = useState(null);
  const [rankLoading, setRankLoading] = useState(false);
  const [rankError, setRankError] = useState(null);
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);
  const [mustHave, setMustHave] = useState([]);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedIds, setSelectedIds] = useState([]);
  const [viewing, setViewing] = useState(null);
  const [comparing, setComparing] = useState(null);
  const [acting, setActing] = useState(false);

  const loadApplicants = async (id, currentWeights, currentMustHave) => {
    if (!id) return;
    setRankLoading(true);
    setRankError(null);
    try {
      if (id === "All") {
        const data = await applicantService.getAll();
        setRanked(data);
        setRequiredSkills([]);
      } else {
        const [rankedData, skills] = await Promise.all([
          rankedApplicantService.getRanked(id, {
            w_skills: currentWeights.skills,
            w_quiz: currentWeights.quiz,
            w_experience: currentWeights.experience,
            must_have_skills: currentMustHave.join(","),
          }),
          rankedApplicantService.getRequiredSkills(id),
        ]);
        setRanked(rankedData);
        setRequiredSkills(skills);
      }
    } catch {
      setRankError(true);
    } finally {
      setRankLoading(false);
    }
  };

  const selectJob = (id) => {
    setJobId(id);
    setMustHave([]);
    setSelectedIds([]);
    loadApplicants(id, weights, []);
  };
  // "All roles" is the default landing view — e.g. from the dashboard's "View all" link —
  // so an employer with applicants spread across several jobs actually sees all of them.
  useEffect(() => {
    if (jobs?.length && !jobId) selectJob("All");
  }, [jobs]);

  const applyWeights = () => loadApplicants(jobId, weights, mustHave);
  const toggleMustHave = (skillId) => setMustHave((prev) => (prev.includes(skillId) ? prev.filter((x) => x !== skillId) : [...prev, skillId]));
  const toggleSelect = (id) => setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const filtered = (ranked || []).filter(
    (a) => (a.candidate?.name || "").toLowerCase().includes(q.toLowerCase()) && (statusFilter === "All" || a.status_code === statusFilter)
  );

  const applyUpdate = (updated) => {
    setRanked((list) => list.map((a) => (a.id === updated.id ? { ...a, ...updated } : a)));
    setViewing((s) => (s && s.id === updated.id ? { ...s, ...updated } : s));
  };
  const act = async (application, status) => {
    setActing(true);
    try {
      const updated = await applicantService.setStatus(application.id, status);
      applyUpdate(updated);
      show(`${application.candidate?.name || "Candidate"} moved to ${updated.status}.`);
    } catch {
      show("We could not update this application.");
    } finally {
      setActing(false);
    }
  };
  const bulkAct = async (status) => {
    setActing(true);
    try {
      const updates = await Promise.all(selectedIds.map((id) => applicantService.setStatus(id, status)));
      updates.forEach(applyUpdate);
      show(`${updates.length} candidate${updates.length === 1 ? "" : "s"} moved to ${updates[0]?.status}.`);
      setSelectedIds([]);
    } catch {
      show("We could not update some of the selected applications.");
    } finally {
      setActing(false);
    }
  };

  if (jobsLoading) return <Spinner />;
  if (!jobs?.length) {
    return (
      <>
        <PageHeader title="Applicants" description="Smart shortlisting: ranked by fit, explained, and ready to act on." />
        <EmptyState title="Create a job first" description="Applicants will be ranked here once you have a published job." />
      </>
    );
  }
  return (
    <>
      <PageHeader title="Applicants" description="Smart shortlisting: ranked by fit, explained, and ready to act on." />
      <div className="panel">
        <div className="form-grid">
          <Field label="Job" hint={jobId === "All" ? "Showing every applicant across all your jobs. Pick a job to rank by fit." : undefined}>
            <select value={jobId} onChange={(e) => selectJob(e.target.value)}>
              <option value="All">All roles</option>
              {jobs.map((j) => (
                <option value={String(j.id)} key={j.id}>
                  {j.title}
                </option>
              ))}
            </select>
          </Field>
          {jobId !== "All" && (
            <>
              <Field label="Skills weight (%)" hint="Weights don't need to add to 100 — they're normalized automatically.">
                <input type="number" min="0" value={weights.skills} onChange={(e) => setWeights((w) => ({ ...w, skills: e.target.value }))} />
              </Field>
              <Field label="Quiz weight (%)">
                <input type="number" min="0" value={weights.quiz} onChange={(e) => setWeights((w) => ({ ...w, quiz: e.target.value }))} />
              </Field>
              <Field label="Experience weight (%)">
                <input type="number" min="0" value={weights.experience} onChange={(e) => setWeights((w) => ({ ...w, experience: e.target.value }))} />
              </Field>
            </>
          )}
        </div>
        {jobId !== "All" && requiredSkills.length > 0 && (
          <div className="skill-editor">
            <small className="muted">Must-have skills — candidates missing any are ranked last, never auto-rejected:</small>
            {requiredSkills.map((s) => (
              <label key={s.id}>
                <input type="checkbox" checked={mustHave.includes(s.id)} onChange={() => toggleMustHave(s.id)} /> {s.name}
              </label>
            ))}
          </div>
        )}
        {jobId !== "All" && (
          <Button onClick={applyWeights} disabled={rankLoading}>
            {rankLoading ? "Ranking…" : "Update ranking"}
          </Button>
        )}
      </div>
      <div className="panel table-panel">
        <div className="table-toolbar">
          <SearchBox value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search candidates" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All statuses</option>
            {STATUS_FILTER_OPTIONS.map((s) => (
              <option value={s} key={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
        {jobId !== "All" && selectedIds.length > 0 && (
          <div className="row between bulk-bar">
            <span>{selectedIds.length} selected</span>
            <div className="row-actions">
              {selectedIds.length >= 2 && (
                <Button variant="secondary" onClick={() => setComparing(filtered.filter((a) => selectedIds.includes(a.id)))}>
                  Compare
                </Button>
              )}
              <Button variant="danger" disabled={acting} onClick={() => bulkAct("REJECTED")}>
                Reject selected
              </Button>
              <Button disabled={acting} onClick={() => bulkAct("SHORTLISTED")}>
                Shortlist selected
              </Button>
            </div>
          </div>
        )}
        {rankLoading ? (
          <Spinner />
        ) : rankError ? (
          <ErrorState />
        ) : !filtered.length ? (
          <EmptyState title="No applicants found" description="Try a different search or filter." />
        ) : jobId === "All" ? (
          <ApplicantTable items={filtered} onView={setViewing} onAct={act} acting={acting} />
        ) : (
          <div className="ranked-list">
            {filtered.map((a) => (
              <div className={`ranked-row entry-list${a.knocked_out ? " knocked-out" : ""}`} key={a.id}>
                <div>
                  <input type="checkbox" checked={selectedIds.includes(a.id)} onChange={() => toggleSelect(a.id)} />
                  <Avatar initials={initialsOf(a.candidate?.name)} />
                  <FitBadge score={a.fit_score} knockedOut={a.knocked_out} />
                  <div>
                    <strong>{a.candidate?.name || "Candidate"}</strong>
                    <small>{a.explanation}</small>
                    <div className="skills">
                      {(a.matched_skills || []).slice(0, 4).map((s) => (
                        <Badge tone="success" key={s}>
                          {s}
                        </Badge>
                      ))}
                      {(a.missing_skills || []).slice(0, 3).map((s) => (
                        <Badge tone="danger" key={s}>
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <StatusBadge status={a.status} />
                  <div className="row-actions">
                    <button className="text-link" onClick={() => setViewing(a)}>
                      View CV
                    </button>
                    {nextAction(a.status_code) && (
                      <Button variant="secondary" disabled={acting} onClick={() => act(a, nextAction(a.status_code).status)}>
                        {nextAction(a.status_code).label}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title="Candidate CV"
        footer={
          viewing && (
            <>
              <Link className="btn btn-secondary" to={`/employer/messages${viewing.conversation_id ? `?conversation=${viewing.conversation_id}` : ""}`}>
                Send message
              </Link>
              {REJECTABLE.includes(viewing.status_code) && (
                <Button variant="danger" disabled={acting} onClick={() => act(viewing, "REJECTED")}>
                  Reject
                </Button>
              )}
              {nextAction(viewing.status_code) && (
                <Button disabled={acting} onClick={() => act(viewing, nextAction(viewing.status_code).status)}>
                  {nextAction(viewing.status_code).label}
                </Button>
              )}
            </>
          )
        }
      >
        {viewing && <CandidateCV application={viewing} />}
      </Modal>
      <CompareModal applications={comparing} onClose={() => setComparing(null)} />
    </>
  );
}

const emptyOption = (correct = false) => ({ tempId: `o${Date.now()}${Math.random()}`, text: "", is_correct: correct });
const emptyQuestion = () => ({
  tempId: `q${Date.now()}${Math.random()}`,
  text: "",
  skillId: "",
  marks: 1,
  options: [emptyOption(true), emptyOption(false)],
});
const emptyQuizState = () => ({ id: null, title: "", passPercentage: 70, durationMinutes: 10, questions: [emptyQuestion()] });

export function QuizBuilder() {
  const { show } = useToast();
  const { data: jobs, loading: jobsLoading } = useAsync(jobService.getJobs);
  const { data: quizzes, loading: quizzesLoading } = useAsync(quizBuilderService.getMine);
  const { data: skills } = useAsync(skillService.getAll);
  const [jobId, setJobId] = useState("");
  const [quiz, setQuiz] = useState(emptyQuizState());
  const [saving, setSaving] = useState(false);

  const loadJob = (id, quizList) => {
    setJobId(id);
    const existing = (quizList || quizzes || []).find((q) => String(q.job) === id);
    if (!existing) {
      setQuiz(emptyQuizState());
      return;
    }
    setQuiz({
      id: existing.id,
      title: existing.title,
      passPercentage: existing.pass_percentage,
      durationMinutes: existing.duration_minutes,
      questions: existing.questions.map((q) => ({
        tempId: `q${q.id}`,
        text: q.text,
        skillId: String(q.skill.id),
        marks: q.marks,
        options: q.options.map((o) => ({ tempId: `o${o.id}`, text: o.text, is_correct: o.is_correct })),
      })),
    });
  };

  useEffect(() => {
    if (!jobs?.length || quizzesLoading) return;
    const requested = new URLSearchParams(window.location.search).get("job");
    const initial = requested && jobs.some((j) => String(j.id) === requested) ? requested : String(jobs[0].id);
    loadJob(initial, quizzes);
  }, [jobs, quizzesLoading]);

  const updateQuestion = (tempId, patch) => setQuiz((s) => ({ ...s, questions: s.questions.map((q) => (q.tempId === tempId ? { ...q, ...patch } : q)) }));
  const updateOption = (qId, oId, patch) => setQuiz((s) => ({ ...s, questions: s.questions.map((q) => (q.tempId !== qId ? q : { ...q, options: q.options.map((o) => (o.tempId === oId ? { ...o, ...patch } : o)) })) }));
  const setCorrectOption = (qId, oId) => setQuiz((s) => ({ ...s, questions: s.questions.map((q) => (q.tempId !== qId ? q : { ...q, options: q.options.map((o) => ({ ...o, is_correct: o.tempId === oId })) })) }));
  const addOption = (qId) => setQuiz((s) => ({ ...s, questions: s.questions.map((q) => (q.tempId !== qId ? q : { ...q, options: [...q.options, emptyOption(false)] })) }));
  const removeOption = (qId, oId) => setQuiz((s) => ({ ...s, questions: s.questions.map((q) => (q.tempId !== qId ? q : { ...q, options: q.options.filter((o) => o.tempId !== oId) })) }));
  const addQuestion = () => setQuiz((s) => ({ ...s, questions: [...s.questions, emptyQuestion()] }));
  const removeQuestion = (tempId) => setQuiz((s) => ({ ...s, questions: s.questions.filter((q) => q.tempId !== tempId) }));

  const save = async () => {
    if (!jobId) return show("Select a job to attach this assessment to.");
    if (!quiz.title.trim()) return show("Give this assessment a title.");
    const invalid = quiz.questions.some(
      (q) => !q.text.trim() || !q.skillId || q.options.length < 2 || q.options.some((o) => !o.text.trim()) || !q.options.some((o) => o.is_correct)
    );
    if (invalid) return show("Every question needs text, a skill, at least two options, and one option marked correct.");
    setSaving(true);
    try {
      const payload = {
        job: Number(jobId),
        title: quiz.title,
        pass_percentage: Number(quiz.passPercentage) || 70,
        duration_minutes: Number(quiz.durationMinutes) || 10,
        questions: quiz.questions.map((q) => ({
          text: q.text,
          skill: Number(q.skillId),
          marks: Number(q.marks) || 1,
          options: q.options.map((o) => ({ text: o.text, is_correct: !!o.is_correct })),
        })),
      };
      const saved = quiz.id ? await quizBuilderService.update(quiz.id, payload) : await quizBuilderService.create(payload);
      setQuiz((s) => ({ ...s, id: saved.id }));
      show("Quiz saved and attached to the job.");
    } catch (requestError) {
      const detail = requestError.response?.data;
      show(typeof detail === "string" ? detail : Array.isArray(detail) ? detail.join(" ") : detail ? Object.values(detail).flat().join(" ") : "We could not save this quiz.");
    } finally {
      setSaving(false);
    }
  };

  if (jobsLoading || quizzesLoading) return <Spinner />;
  if (!jobs?.length) {
    return (
      <>
        <PageHeader title="Quiz builder" description="Create a short, job-relevant assessment." />
        <EmptyState icon={FileQuestion} title="Create a job first" description="You need at least one job posting before you can attach an assessment to it." />
      </>
    );
  }
  return (
    <>
      <PageHeader
        title="Quiz builder"
        description="Create a short, job-relevant assessment."
        actions={
          <Button onClick={save} disabled={saving}>
            <CheckCircle2 />
            {saving ? "Saving…" : "Save quiz"}
          </Button>
        }
      />
      <div className="quiz-builder-layout">
        <section className="panel">
          <div className="form-grid">
            <Field label="Quiz title">
              <input value={quiz.title} onChange={(e) => setQuiz((s) => ({ ...s, title: e.target.value }))} placeholder="e.g. Frontend Fundamentals" />
            </Field>
            <Field label="Attach to job">
              <select value={jobId} onChange={(e) => loadJob(e.target.value)}>
                {jobs.map((j) => (
                  <option value={String(j.id)} key={j.id}>
                    {j.title}
                    {j.quiz_id ? " (has assessment)" : ""}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Pass mark (%)">
              <input type="number" min="0" max="100" value={quiz.passPercentage} onChange={(e) => setQuiz((s) => ({ ...s, passPercentage: e.target.value }))} />
            </Field>
            <Field label="Duration (minutes)">
              <input type="number" min="1" value={quiz.durationMinutes} onChange={(e) => setQuiz((s) => ({ ...s, durationMinutes: e.target.value }))} />
            </Field>
          </div>
          <div className="builder-summary">
            <span>
              <strong>{quiz.questions.length}</strong> questions
            </span>
            <span>
              <strong>{quiz.passPercentage}%</strong> pass mark
            </span>
          </div>
        </section>
        {quiz.questions.map((q, i) => (
          <section className="panel question-editor" key={q.tempId}>
            <GripVertical />
            <div>{i + 1}</div>
            <div>
              <Field label="Question">
                <input value={q.text} onChange={(e) => updateQuestion(q.tempId, { text: e.target.value })} placeholder="What is this question testing?" />
              </Field>
              <div className="form-grid">
                <Field label="Skill">
                  <select value={q.skillId} onChange={(e) => updateQuestion(q.tempId, { skillId: e.target.value })}>
                    <option value="">Select a skill</option>
                    {(skills || []).map((s) => (
                      <option value={String(s.id)} key={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Marks">
                  <input type="number" min="1" value={q.marks} onChange={(e) => updateQuestion(q.tempId, { marks: e.target.value })} />
                </Field>
              </div>
              {q.options.map((o) => (
                <label key={o.tempId} className="quiz-option">
                  <input type="radio" name={q.tempId} checked={o.is_correct} onChange={() => setCorrectOption(q.tempId, o.tempId)} />
                  <input value={o.text} onChange={(e) => updateOption(q.tempId, o.tempId, { text: e.target.value })} placeholder="Answer option" />
                  {q.options.length > 2 && (
                    <button type="button" className="icon-btn" onClick={() => removeOption(q.tempId, o.tempId)}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </label>
              ))}
              <Button variant="ghost" onClick={() => addOption(q.tempId)}>
                <Plus size={14} />
                Add option
              </Button>
            </div>
            <button className="icon-btn" onClick={() => removeQuestion(q.tempId)} disabled={quiz.questions.length <= 1}>
              <Trash2 />
            </button>
          </section>
        ))}
        <Button variant="secondary" className="add-question" onClick={addQuestion}>
          <Plus />
          Add question
        </Button>
      </div>
    </>
  );
}

export function EmployerProfile() {
  const { show } = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ company_name: "", website: "", industry: "", location: "", description: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    profileService.get().then((data) => {
      setProfile(data);
      setForm({
        company_name: data.company_name || "",
        website: data.website || "",
        industry: data.industry || "",
        location: data.location || "",
        description: data.description || "",
      });
      setLoading(false);
    });
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const updated = await profileService.update(form);
      setProfile((p) => ({ ...p, ...updated }));
      show("Company profile saved.");
    } catch {
      show("We could not save your company profile.");
    } finally {
      setSaving(false);
    }
  };
  const uploadLogo = async (file) => {
    const formData = new FormData();
    formData.append("logo", file);
    try {
      const updated = await profileService.update(formData);
      setProfile((p) => ({ ...p, logo: updated.logo }));
      show("Company logo updated.");
    } catch {
      show("We could not update your logo. Try a smaller image.");
    }
  };

  if (loading) return <Spinner />;
  const initials = (form.company_name || "SkillNet").split(" ").filter(Boolean).map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <>
      <PageHeader
        title="Company profile"
        description="Help candidates understand your team."
        actions={
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        }
      />
      <section className="panel profile-editor">
        <div className="company-profile-head">
          <div className="avatar-upload">
            {profile?.logo ? (
              <img src={profile.logo} alt="" className="company-logo large" style={{ objectFit: "cover", background: "var(--light)" }} />
            ) : (
              <span className="company-logo large" style={{ background: "var(--light)" }}>
                {initials}
              </span>
            )}
            <label className="edit-avatar">
              <Edit3 />
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadLogo(file);
                }}
              />
            </label>
          </div>
          <div>
            <h2>{form.company_name || "Your company"}</h2>
            <p>
              {form.industry || "Add your industry"}
              {!profile?.is_approved && " · Pending admin approval"}
            </p>
          </div>
        </div>
        <div className="form-grid">
          <Field label="Company name">
            <input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} />
          </Field>
          <Field label="Website">
            <input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://" />
          </Field>
          <Field label="Industry">
            <input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
          </Field>
          <Field label="Headquarters">
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </Field>
        </div>
        <Field label="About">
          <textarea rows="6" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </Field>
      </section>
    </>
  );
}
