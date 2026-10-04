from datetime import date
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.utils.text import slugify
from skillnet.models import *
class Command(BaseCommand):
    help='Create idempotent SkillNet demo data'
    def handle(self,*args,**opts):
        seeker,_=User.objects.get_or_create(email='seeker@skillnet.demo',defaults={'first_name':'Shohug','last_name':'','role':User.Role.JOB_SEEKER});seeker.first_name='Shohug';seeker.last_name='';seeker.phone='+880 1712 345678';seeker.set_password('DemoPass123!');seeker.save()
        seeker_profile,_=SeekerProfile.objects.get_or_create(user=seeker,defaults={'headline':'Product Designer','location':'Dhaka','summary':'Curious product designer focused on turning complex services into clear, inclusive digital experiences.'})
        Education.objects.get_or_create(profile=seeker_profile,institution='North South University',degree='BSc in Computer Science',defaults={'field':'Computer Science','start_date':date(2018,1,1),'end_date':date(2022,12,31)})
        Experience.objects.get_or_create(profile=seeker_profile,company='PixelCraft Studio',title='Junior Product Designer',defaults={'description':'Designed and shipped customer-facing flows in partnership with product and engineering.','start_date':date(2023,1,1),'current':True})
        employer,_=User.objects.get_or_create(email='employer@skillnet.demo',defaults={'first_name':'Tasnim','last_name':'Ahmed','role':User.Role.EMPLOYER});employer.set_password('DemoPass123!');employer.save();company,_=EmployerProfile.objects.get_or_create(user=employer,defaults={'company_name':'Orbit Systems','industry':'Technology','location':'Dhaka','is_approved':True})
        unverified_employer,_=User.objects.get_or_create(email='newcompany@skillnet.demo',defaults={'first_name':'Rafi','last_name':'Karim','role':User.Role.EMPLOYER});unverified_employer.set_password('DemoPass123!');unverified_employer.save();EmployerProfile.objects.get_or_create(user=unverified_employer,defaults={'company_name':'Brightline Logistics','industry':'Logistics','location':'Chattogram','is_approved':False})
        provider,_=User.objects.get_or_create(email='provider@skillnet.demo',defaults={'first_name':'SkillNet','last_name':'Academy','role':User.Role.COURSE_PROVIDER});provider.set_password('DemoPass123!');provider.save()
        admin,_=User.objects.get_or_create(email='admin@skillnet.demo',defaults={'first_name':'Admin','role':User.Role.ADMIN,'is_staff':True,'is_superuser':True});admin.set_password('DemoPass123!');admin.save()
        skills={};
        for name in ['React','JavaScript','Python','Communication','Excel','Data Analysis','Customer Service','Design','Sales','Safety']:
            skills[name],_=Skill.objects.get_or_create(slug=slugify(name),defaults={'name':name,'category':'Professional'})
        seeker_profile.skills.set([skills['Communication'],skills['Excel']])
        Certificate.objects.get_or_create(profile=seeker_profile,name='Google UX Design Certificate',issuer='Google',defaults={'issued_date':date(2023,6,1)})
        job,_=Job.objects.get_or_create(employer=company,title='Frontend Developer',defaults={'description':'Build accessible, responsive interfaces.','requirements':'React fundamentals\nREST API experience','category':'Technology','job_type':Job.Type.FULL_TIME,'location':'Dhaka · Hybrid','salary_min':70000,'salary_max':100000,'experience':'2–4 years','status':Job.Status.PUBLISHED});job.skills.set([skills['React'],skills['JavaScript']])
        quiz,_=Quiz.objects.get_or_create(job=job,defaults={'title':'Frontend Fundamentals','duration_minutes':10,'pass_percentage':70})
        if not quiz.questions.exists():
            for index,(text,skill) in enumerate([('What is React state used for?','React'),('Which value is immutable by convention?','JavaScript')]):
                q=Question.objects.create(quiz=quiz,text=text,skill=skills[skill],marks=1,order=index);AnswerOption.objects.create(question=q,text='The correct demonstration answer',is_correct=True,order=0);AnswerOption.objects.create(question=q,text='An incorrect alternative',is_correct=False,order=1)
        course,_=Course.objects.get_or_create(provider=provider,title='Excel for the Modern Workplace',defaults={'description':'Learn practical spreadsheet and reporting skills.','category':'Business','duration_minutes':380,'price':1200,'rating':4.8,'status':Course.Status.PUBLISHED});course.skills.set([skills['Excel'],skills['Data Analysis']])
        module1,_=CourseModule.objects.get_or_create(course=course,title='Formulas that save time',defaults={'order':1})
        module2,_=CourseModule.objects.get_or_create(course=course,title='Pivot tables that make sense',defaults={'order':2})
        enrollment,_=Enrollment.objects.get_or_create(user=seeker,course=course)
        enrollment.completed_modules.add(module1);total=course.modules.count();done=enrollment.completed_modules.count();enrollment.progress=round(done/total*100) if total else 0;enrollment.is_completed=total>0 and done>=total;enrollment.save(update_fields=['progress','is_completed','updated_at'])
        course_catalog=[
            {'title':'Communication That Gets Results','category':'Career','skill_names':['Communication'],'price':0,'rating':4.9,'duration_minutes':250,'description':'Build confidence for meetings, interviews, and day-to-day workplace communication.','modules':['Communicate with clarity','Listen with intent','Present your ideas with confidence']},
            {'title':'React Foundations','category':'Technology','skill_names':['React','JavaScript'],'price':1800,'rating':4.7,'duration_minutes':720,'description':'Build modern interfaces through hands-on React projects and strong fundamentals.','modules':['Components and JSX','State and events','Ship a portfolio project']},
            {'title':'Customer Service Excellence','category':'Customer Service','skill_names':['Communication','Customer Service'],'price':900,'rating':4.6,'duration_minutes':300,'description':'Turn every support conversation into a confident, calm, and helpful experience.','modules':['Understanding customer needs','Handling difficult conversations','Turning complaints into loyalty']},
            {'title':'UI/UX Design Fundamentals','category':'Design','skill_names':['Design'],'price':1500,'rating':4.8,'duration_minutes':480,'description':'Learn practical design thinking, wireframing, and usability testing for real products.','modules':['Design thinking basics','Wireframing and prototyping','Usability testing']},
            {'title':'Sales Negotiation Mastery','category':'Sales','skill_names':['Sales','Communication'],'price':1200,'rating':4.5,'duration_minutes':260,'description':'Practical negotiation tactics for closing deals with confidence and integrity.','modules':['Understanding buyer psychology','Negotiation tactics that work','Closing with confidence']},
            {'title':'Workplace Safety Essentials','category':'Skilled Trades','skill_names':['Safety'],'price':650,'rating':4.8,'duration_minutes':210,'description':'Practical safety habits for technicians working in industrial environments.','modules':['Hazard awareness','Protective equipment','Incident response']},
            {'title':'Data Analysis Foundations','category':'Data Analysis','skill_names':['Data Analysis','Excel'],'price':1400,'rating':4.7,'duration_minutes':400,'description':'Turn raw spreadsheets into clear, decision-ready insights.','modules':['Clean and validate data','Visualize trends','Build a working dashboard']},
        ]
        for entry in course_catalog:
            status=Course.Status.PENDING if entry['title']=='Sales Negotiation Mastery' else Course.Status.PUBLISHED
            new_course,_=Course.objects.get_or_create(provider=provider,title=entry['title'],defaults={'description':entry['description'],'category':entry['category'],'duration_minutes':entry['duration_minutes'],'price':entry['price'],'rating':entry['rating'],'status':status})
            new_course.skills.set([skills[name] for name in entry['skill_names']])
            for index,module_title in enumerate(entry['modules'],start=1):
                CourseModule.objects.get_or_create(course=new_course,title=module_title,defaults={'order':index})
        free_course=Course.objects.get(provider=provider,title='Communication That Gets Results')
        Enrollment.objects.get_or_create(user=seeker,course=free_course)
        application,_=Application.objects.get_or_create(job=job,candidate=seeker,defaults={'status':Application.Status.UNDER_REVIEW})
        if not application.status_history.exists():ApplicationStatusHistory.objects.create(application=application,status=application.status,changed_by=employer)
        conversation,_=Conversation.objects.get_or_create(application=application);conversation.participants.set([seeker,employer])
        if not conversation.messages.exists():Message.objects.create(conversation=conversation,sender=employer,body='Hi Shohug! Thanks for applying — we would love to learn more about your experience.')
        # More jobs for Orbit Systems, two with an attached quiz and one without, so the
        # employer/admin dashboards have a realistic spread of listings to review.
        backend_job,_=Job.objects.get_or_create(employer=company,title='Backend Developer',defaults={'description':'Design and maintain the APIs powering our product.','requirements':'Python fundamentals\nREST API design','category':'Technology','job_type':Job.Type.FULL_TIME,'location':'Dhaka · Hybrid','salary_min':80000,'salary_max':120000,'experience':'2–5 years','status':Job.Status.PUBLISHED});backend_job.skills.set([skills['Python'],skills['JavaScript']])
        backend_quiz,_=Quiz.objects.get_or_create(job=backend_job,defaults={'title':'Backend Fundamentals','duration_minutes':10,'pass_percentage':70})
        if not backend_quiz.questions.exists():
            for index,(text,skill) in enumerate([('Which keyword defines a function in Python?','Python'),('What does a REST API typically return?','JavaScript')]):
                q=Question.objects.create(quiz=backend_quiz,text=text,skill=skills[skill],marks=1,order=index);AnswerOption.objects.create(question=q,text='The correct demonstration answer',is_correct=True,order=0);AnswerOption.objects.create(question=q,text='An incorrect alternative',is_correct=False,order=1)
        design_job,_=Job.objects.get_or_create(employer=company,title='Product Designer',defaults={'description':'Shape end-to-end product experiences with our design and engineering teams.','requirements':'Portfolio of shipped product work\nStrong communication skills','category':'Design','job_type':Job.Type.FULL_TIME,'location':'Dhaka · Hybrid','salary_min':65000,'salary_max':95000,'experience':'2–4 years','status':Job.Status.PUBLISHED});design_job.skills.set([skills['Design'],skills['Communication']])
        design_quiz,_=Quiz.objects.get_or_create(job=design_job,defaults={'title':'Product Design Basics','duration_minutes':10,'pass_percentage':70})
        if not design_quiz.questions.exists():
            for index,(text,skill) in enumerate([('What is the goal of a usability test?','Design'),('What makes written feedback actionable?','Communication')]):
                q=Question.objects.create(quiz=design_quiz,text=text,skill=skills[skill],marks=1,order=index);AnswerOption.objects.create(question=q,text='The correct demonstration answer',is_correct=True,order=0);AnswerOption.objects.create(question=q,text='An incorrect alternative',is_correct=False,order=1)
        analyst_job,_=Job.objects.get_or_create(employer=company,title='Data Analyst',defaults={'description':'Turn operational data into decisions the whole company can act on.','requirements':'Comfortable with spreadsheets and dashboards\nClear written reporting','category':'Data Analysis','job_type':Job.Type.FULL_TIME,'location':'Dhaka','salary_min':60000,'salary_max':85000,'experience':'1–3 years','status':Job.Status.PUBLISHED});analyst_job.skills.set([skills['Data Analysis'],skills['Excel']])
        # A small roster of applicants spread across the hiring funnel, so Smart CV
        # Shortlisting, the applicant list, and admin reports all have real variety to show.
        applicants=[
            {'email':'nadia.rahman@skillnet.demo','first':'Nadia','last':'Rahman','headline':'Frontend Engineer','skill_names':['React','JavaScript'],'company':'PixelWorks','title':'Frontend Engineer','job':job,'quiz':quiz,'quiz_score':(2,2),'status':Application.Status.SHORTLISTED},
            {'email':'arif.chowdhury@skillnet.demo','first':'Arif','last':'Chowdhury','headline':'Backend Engineer','skill_names':['Python','JavaScript'],'company':'DataForge','title':'Backend Engineer','job':backend_job,'quiz':backend_quiz,'quiz_score':(2,2),'status':Application.Status.INTERVIEW},
            {'email':'mitu.akter@skillnet.demo','first':'Mitu','last':'Akter','headline':'Product Designer','skill_names':['Design'],'company':'StudioNine','title':'Product Designer','job':design_job,'quiz':design_quiz,'quiz_score':(0,2),'status':Application.Status.REJECTED},
            {'email':'kamal.hossain@skillnet.demo','first':'Kamal','last':'Hossain','headline':'Data Analyst','skill_names':['Data Analysis','Excel'],'company':'Northbridge Analytics','title':'Data Analyst','job':analyst_job,'quiz':None,'quiz_score':None,'status':Application.Status.HIRED},
            {'email':'sara.islam@skillnet.demo','first':'Sara','last':'Islam','headline':'Junior Backend Developer','skill_names':['JavaScript'],'company':'Freelance','title':'Junior Developer','job':backend_job,'quiz':backend_quiz,'quiz_score':None,'status':Application.Status.ASSESSMENT_PENDING},
        ]
        for entry in applicants:
            candidate,_=User.objects.get_or_create(email=entry['email'],defaults={'first_name':entry['first'],'last_name':entry['last'],'role':User.Role.JOB_SEEKER});candidate.set_password('DemoPass123!');candidate.save()
            candidate_profile,_=SeekerProfile.objects.get_or_create(user=candidate,defaults={'headline':entry['headline'],'location':'Dhaka'})
            candidate_profile.skills.set([skills[name] for name in entry['skill_names']])
            Experience.objects.get_or_create(profile=candidate_profile,company=entry['company'],title=entry['title'],defaults={'start_date':date(2022,1,1),'current':True})
            application_entry,_=Application.objects.get_or_create(job=entry['job'],candidate=candidate,defaults={'status':entry['status']})
            if not application_entry.status_history.exists():ApplicationStatusHistory.objects.create(application=application_entry,status=application_entry.status,changed_by=employer)
            if entry['quiz'] and entry['quiz_score'] and not application_entry.quiz_attempts.exists():
                score,total=entry['quiz_score'];percentage=round(score/total*100,2)
                QuizAttempt.objects.create(application=application_entry,quiz=entry['quiz'],score=score,total=total,percentage=percentage,passed=percentage>=entry['quiz'].pass_percentage,submitted_at=timezone.now())
        ModerationReport.objects.get_or_create(target_type='JOB',target_id=job.id,reporter=seeker,defaults={'reason':'Listing asks for an upfront training fee before the interview, which feels like a scam.','status':'OPEN'})
        pending_report,_=ModerationReport.objects.get_or_create(target_type='COURSE',target_id=Course.objects.get(provider=provider,title='Excel for the Modern Workplace').id,reporter=seeker,defaults={'reason':'Course preview video is broken on the landing page.','status':'RESOLVED'})
        if pending_report.status=='RESOLVED' and not pending_report.resolved_by_id:pending_report.resolved_by=admin;pending_report.save(update_fields=['resolved_by'])
        self.stdout.write(self.style.SUCCESS('SkillNet demo data is ready. Password: DemoPass123!'))
