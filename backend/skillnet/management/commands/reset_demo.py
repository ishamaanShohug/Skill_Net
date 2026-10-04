from django.core.management import call_command
from django.core.management.base import BaseCommand
from django.db import transaction
from django.db.models import Q
from skillnet.models import *
from skillnet.permissions import DEMO_EMAILS

# The five sample applicants seed_demo creates, keyed by email, with the profile
# fields they should always come back to.
APPLICANT_BASELINE = {
    'nadia.rahman@skillnet.demo': {'headline': 'Frontend Engineer', 'skill_names': ['React', 'JavaScript']},
    'arif.chowdhury@skillnet.demo': {'headline': 'Backend Engineer', 'skill_names': ['Python', 'JavaScript']},
    'mitu.akter@skillnet.demo': {'headline': 'Product Designer', 'skill_names': ['Design']},
    'kamal.hossain@skillnet.demo': {'headline': 'Data Analyst', 'skill_names': ['Data Analysis', 'Excel']},
    'sara.islam@skillnet.demo': {'headline': 'Junior Backend Developer', 'skill_names': ['JavaScript']},
}


class Command(BaseCommand):
    help = (
        "Wipes whatever public 'Demo access' visitors have added or changed on the "
        "seeded demo accounts (extra jobs/courses, messages, applications, edited "
        "profile fields, uploaded photos, moderation reports) and reseeds the "
        "pristine baseline via seed_demo. Safe to run repeatedly; does not touch "
        "accounts a real visitor registered for themselves."
    )

    @transaction.atomic
    def handle(self, *args, **options):
        users = {email: User.objects.filter(email=email).first() for email in DEMO_EMAILS}
        demo_ids = [u.id for u in users.values() if u]
        if not demo_ids:
            # Nothing seeded yet on this database — just seed it.
            call_command('seed_demo')
            self.stdout.write(self.style.SUCCESS('Demo data seeded (nothing to reset yet).'))
            return

        job_ids, course_ids = [], []

        seeker = users['seeker@skillnet.demo']
        if seeker:
            seeker.is_active = True
            seeker.save(update_fields=['is_active'])
            if hasattr(seeker, 'seeker_profile'):
                profile = seeker.seeker_profile
                Education.objects.filter(profile=profile).delete()
                Experience.objects.filter(profile=profile).delete()
                Certificate.objects.filter(profile=profile).delete()
                profile.headline = ''
                profile.summary = ''
                profile.address = ''
                profile.location = ''
                profile.portfolio_url = ''
                profile.photo = None
                profile.save()
                profile.skills.clear()
            Application.objects.filter(candidate=seeker).delete()
            Enrollment.objects.filter(user=seeker).delete()
            Payment.objects.filter(user=seeker).delete()

        for email, name, industry, location, approved in [
            ('employer@skillnet.demo', ('Tasnim', 'Ahmed'), 'Technology', 'Dhaka', True),
            ('newcompany@skillnet.demo', ('Rafi', 'Karim'), 'Logistics', 'Chattogram', False),
        ]:
            employer_user = users[email]
            if not employer_user:
                continue
            employer_user.first_name, employer_user.last_name = name
            employer_user.phone = ''
            employer_user.is_active = True
            employer_user.save(update_fields=['first_name', 'last_name', 'phone', 'is_active'])
            if hasattr(employer_user, 'employer_profile'):
                company = employer_user.employer_profile
                company.company_name = 'Orbit Systems' if email == 'employer@skillnet.demo' else 'Brightline Logistics'
                company.industry = industry
                company.location = location
                company.description = ''
                company.website = ''
                company.logo = None
                company.is_approved = approved
                company.save()
            employer_job_ids = list(Job.objects.filter(employer__user=employer_user).values_list('id', flat=True))
            job_ids += employer_job_ids
            # Quiz attempts protect their selected AnswerOption from deletion, so clear
            # applications (which cascade attempts/answers) before deleting the jobs.
            Application.objects.filter(job_id__in=employer_job_ids).delete()
            Job.objects.filter(id__in=employer_job_ids).delete()

        provider = users['provider@skillnet.demo']
        if provider:
            provider.is_active = True
            provider.save(update_fields=['is_active'])
            course_ids += list(Course.objects.filter(provider=provider).values_list('id', flat=True))
            Course.objects.filter(provider=provider).delete()

        admin = users['admin@skillnet.demo']
        if admin:
            admin.is_active = True
            admin.save(update_fields=['is_active'])

        for email, baseline in APPLICANT_BASELINE.items():
            candidate = users.get(email)
            if not candidate:
                continue
            candidate.is_active = True
            candidate.save(update_fields=['is_active'])
            if hasattr(candidate, 'seeker_profile'):
                profile = candidate.seeker_profile
                Education.objects.filter(profile=profile).delete()
                Experience.objects.filter(profile=profile).delete()
                Certificate.objects.filter(profile=profile).delete()
                profile.headline = baseline['headline']
                profile.summary = ''
                profile.address = ''
                profile.location = 'Dhaka'
                profile.portfolio_url = ''
                profile.photo = None
                profile.save()
                profile.skills.set(Skill.objects.filter(name__in=baseline['skill_names']))
            Application.objects.filter(candidate=candidate).delete()
            Enrollment.objects.filter(user=candidate).delete()
            Payment.objects.filter(user=candidate).delete()

        Notification.objects.filter(user_id__in=demo_ids).delete()
        Conversation.objects.filter(participants__id__in=demo_ids).distinct().delete()
        ModerationReport.objects.filter(
            Q(reporter_id__in=demo_ids)
            | Q(resolved_by_id__in=demo_ids)
            | Q(target_type='JOB', target_id__in=job_ids)
            | Q(target_type='COURSE', target_id__in=course_ids)
        ).delete()

        call_command('seed_demo')
        self.stdout.write(self.style.SUCCESS('Demo data reset to its pristine baseline.'))
