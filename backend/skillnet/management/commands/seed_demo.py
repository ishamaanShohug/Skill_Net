from datetime import date
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from skillnet.models import *

class Command(BaseCommand):
    help='Create idempotent SkillNet demo data with comprehensive records for Admin testing'
    def handle(self,*args,**opts):
        # 1. Job Seekers
        seeker,_=User.objects.get_or_create(email='seeker@skillnet.demo',defaults={'first_name':'Shohug','last_name':'Miah','role':User.Role.JOB_SEEKER,'is_verified':True})
        seeker.first_name='Shohug';seeker.last_name='Miah';seeker.phone='+880 1712 345678';seeker.set_password('DemoPass123!');seeker.save()
        seeker_profile,_=SeekerProfile.objects.get_or_create(user=seeker,defaults={'headline':'Product Designer','location':'Dhaka','summary':'Curious product designer focused on turning complex services into clear, inclusive digital experiences.'})
        Education.objects.get_or_create(profile=seeker_profile,institution='North South University',degree='BSc in Computer Science',defaults={'field':'Computer Science','start_date':date(2018,1,1),'end_date':date(2022,12,31)})
        Experience.objects.get_or_create(profile=seeker_profile,company='PixelCraft Studio',title='Junior Product Designer',defaults={'description':'Designed and shipped customer-facing flows in partnership with product and engineering.','start_date':date(2023,1,1),'current':True})

        seeker2,_=User.objects.get_or_create(email='fatima@skillnet.demo',defaults={'first_name':'Fatima','last_name':'Khatun','role':User.Role.JOB_SEEKER,'is_verified':True})
        seeker2.first_name='Fatima';seeker2.last_name='Khatun';seeker2.phone='+880 1819 876543';seeker2.set_password('DemoPass123!');seeker2.save()
        seeker2_prof,_=SeekerProfile.objects.get_or_create(user=seeker2,defaults={'headline':'Senior UI/UX Specialist','location':'Chittagong','summary':'Specialist in design systems and accessible fintech interfaces.'})

        seeker3,_=User.objects.get_or_create(email='tanvir@skillnet.demo',defaults={'first_name':'Tanvir','last_name':'Hasan','role':User.Role.JOB_SEEKER,'is_verified':False})
        seeker3.first_name='Tanvir';seeker3.last_name='Hasan';seeker3.phone='+880 1911 223344';seeker3.set_password('DemoPass123!');seeker3.save()
        seeker3_prof,_=SeekerProfile.objects.get_or_create(user=seeker3,defaults={'headline':'Full Stack Software Engineer','location':'Sylhet','summary':'Python, React, and cloud infrastructure developer.'})

        # 2. Employers
        employer,_=User.objects.get_or_create(email='employer@skillnet.demo',defaults={'first_name':'Tasnim','last_name':'Ahmed','role':User.Role.EMPLOYER,'is_verified':True})
        employer.set_password('DemoPass123!');employer.save()
        company,_=EmployerProfile.objects.get_or_create(user=employer,defaults={'company_name':'Orbit Systems','industry':'Technology','location':'Dhaka','is_approved':True})

        employer2,_=User.objects.get_or_create(email='rahman@horizon.demo',defaults={'first_name':'Maksudur','last_name':'Rahman','role':User.Role.EMPLOYER,'is_verified':False})
        employer2.set_password('DemoPass123!');employer2.save()
        company2,_=EmployerProfile.objects.get_or_create(user=employer2,defaults={'company_name':'Horizon Logistics & Tech','industry':'Supply Chain','location':'Dhaka','is_approved':False})

        employer3,_=User.objects.get_or_create(email='anika@craft.demo',defaults={'first_name':'Anika','last_name':'Chowdhury','role':User.Role.EMPLOYER,'is_verified':True})
        employer3.set_password('DemoPass123!');employer3.save()
        company3,_=EmployerProfile.objects.get_or_create(user=employer3,defaults={'company_name':'Craft Visuals Studio','industry':'Design & Media','location':'Chittagong','is_approved':True})

        # 3. Course Providers
        provider,_=User.objects.get_or_create(email='provider@skillnet.demo',defaults={'first_name':'SkillNet','last_name':'Academy','role':User.Role.COURSE_PROVIDER,'is_verified':True})
        provider.set_password('DemoPass123!');provider.save()

        # 4. Administrators
        admin,_=User.objects.get_or_create(email='admin@skillnet.demo',defaults={'first_name':'Admin','last_name':'User','role':User.Role.ADMIN,'is_staff':True,'is_superuser':True,'is_verified':True})
        admin.set_password('DemoPass123!');admin.save()

        # 5. Skills
        skills={}
        for name in ['React','JavaScript','Python','Django','Communication','Excel','Data Analysis','UI/UX Design','Figma','Electrical Installation']:
            skills[name],_=Skill.objects.get_or_create(slug=slugify(name),defaults={'name':name,'category':'Professional'})
        seeker_profile.skills.set([skills['Communication'],skills['Excel'],skills['React']])
        seeker2_prof.skills.set([skills['UI/UX Design'],skills['Figma'],skills['Communication']])
        seeker3_prof.skills.set([skills['Python'],skills['Django'],skills['JavaScript'],skills['React']])
        Certificate.objects.get_or_create(profile=seeker_profile,name='Google UX Design Certificate',issuer='Google',defaults={'issued_date':date(2023,6,1)})

        # 6. Jobs
        job1,_=Job.objects.get_or_create(employer=company,title='Frontend Developer',defaults={'description':'Build accessible, responsive interfaces with modern React and TypeScript.','requirements':'React fundamentals\nREST API experience\nCSS Mastery','category':'Technology','job_type':Job.Type.FULL_TIME,'location':'Dhaka · Hybrid','salary_min':70000,'salary_max':100000,'experience':'2–4 years','status':Job.Status.PUBLISHED})
        job1.skills.set([skills['React'],skills['JavaScript']])

        job2,_=Job.objects.get_or_create(employer=company,title='Senior Python / Django Architect',defaults={'description':'Lead backend architectural decisions for large scale distributed systems.','requirements':'Expert Python/Django\nPostgreSQL optimization\nMicroservices','category':'Technology','job_type':Job.Type.FULL_TIME,'location':'Dhaka · Remote','salary_min':140000,'salary_max':180000,'experience':'5+ years','status':Job.Status.PUBLISHED})
        job2.skills.set([skills['Python'],skills['Django']])

        job3,_=Job.objects.get_or_create(employer=company3,title='Lead Product UI Designer',defaults={'description':'Create design tokens and complete design systems for web and mobile.','requirements':'Figma components\nDesign systems\nUser testing','category':'Design','job_type':Job.Type.FULL_TIME,'location':'Chittagong · On-site','salary_min':90000,'salary_max':120000,'experience':'3+ years','status':Job.Status.PUBLISHED})
        job3.skills.set([skills['UI/UX Design'],skills['Figma']])

        job4,_=Job.objects.get_or_create(employer=company2,title='Logistics Solar & Electrical Specialist',defaults={'description':'Install and maintain industrial solar battery arrays and warehouse systems.','requirements':'Electrical trade certification\nSafety protocol compliance','category':'Skilled Trades','job_type':Job.Type.CONTRACT,'location':'Gazipur · On-site','salary_min':50000,'salary_max':70000,'experience':'2+ years','status':Job.Status.PUBLISHED})
        job4.skills.set([skills['Electrical Installation']])

        job5,_=Job.objects.get_or_create(employer=company2,title='Data Entry Assistant (Closed)',defaults={'description':'Past role for bulk document digitization.','requirements':'Typing accuracy\nExcel skills','category':'Business','job_type':Job.Type.PART_TIME,'location':'Dhaka','salary_min':25000,'salary_max':35000,'experience':'1 year','status':Job.Status.CLOSED})

        job6,_=Job.objects.get_or_create(employer=company2,title='Urgent Online Work: ৳5,000 Daily Guaranteed',defaults={'description':'Work from anywhere for 2 hours and earn high commissions. Initial deposit of ৳2,000 required for account activation.','requirements':'No qualifications required. Smartphone needed.','category':'Business','job_type':Job.Type.FREELANCE,'location':'Remote','salary_min':150000,'salary_max':200000,'experience':'None','status':Job.Status.PUBLISHED})

        # 7. Quizzes
        quiz,_=Quiz.objects.get_or_create(job=job1,defaults={'title':'Frontend Fundamentals','duration_minutes':10,'pass_percentage':70})
        if not quiz.questions.exists():
            for index,(text,skill) in enumerate([('What is React state used for?','React'),('Which value is immutable by convention?','JavaScript')]):
                q=Question.objects.create(quiz=quiz,text=text,skill=skills[skill],marks=1,order=index)
                AnswerOption.objects.create(question=q,text='The correct demonstration answer',is_correct=True,order=0)
                AnswerOption.objects.create(question=q,text='An incorrect alternative',is_correct=False,order=1)

        # 8. Courses
        c1,_=Course.objects.get_or_create(provider=provider,title='Excel for the Modern Workplace',defaults={'description':'Learn practical spreadsheet modeling, formula construction, and reporting skills.','category':'Business','duration_minutes':380,'price':1200,'rating':4.8,'status':Course.Status.PUBLISHED})
        c1.skills.set([skills['Excel'],skills['Data Analysis']])
        m1,_=CourseModule.objects.get_or_create(course=c1,title='Formulas that save time',defaults={'order':1})
        m2,_=CourseModule.objects.get_or_create(course=c1,title='Pivot tables that make sense',defaults={'order':2})

        c2,_=Course.objects.get_or_create(provider=provider,title='Full-Stack Python & Django Mastery',defaults={'description':'Production-grade APIs, ORM query tuning, background tasks, and deployment.','category':'Technology','duration_minutes':620,'price':2500,'rating':4.9,'status':Course.Status.PUBLISHED})
        c2.skills.set([skills['Python'],skills['Django']])
        CourseModule.objects.get_or_create(course=c2,title='Django REST Framework from scratch',defaults={'order':1})

        c3,_=Course.objects.get_or_create(provider=provider,title='Modern Figma & Design Systems 2026',defaults={'description':'Master variables, auto-layout 5, and token handoff for engineering teams.','category':'Technology','duration_minutes':410,'price':0,'rating':0.0,'status':Course.Status.PENDING})
        c3.skills.set([skills['UI/UX Design'],skills['Figma']])
        CourseModule.objects.get_or_create(course=c3,title='Design Tokens & Components',defaults={'order':1})

        c4,_=Course.objects.get_or_create(provider=provider,title='Guaranteed Fast Riches Crypto Trading Bot',defaults={'description':'Automated trading robot promising 500% monthly returns without risk.','category':'Business','duration_minutes':120,'price':15000,'rating':1.2,'status':Course.Status.PUBLISHED})

        # 9. Enrollments
        enr,_=Enrollment.objects.get_or_create(user=seeker,course=c1)
        enr.completed_modules.add(m1)
        enr.progress=50;enr.save()

        # 10. Applications & Quiz Attempts
        app1,_=Application.objects.get_or_create(job=job1,candidate=seeker,defaults={'status':Application.Status.UNDER_REVIEW})
        if not app1.status_history.exists():ApplicationStatusHistory.objects.create(application=app1,status=app1.status,changed_by=employer)

        app2,_=Application.objects.get_or_create(job=job2,candidate=seeker3,defaults={'status':Application.Status.INTERVIEW})
        if not app2.status_history.exists():ApplicationStatusHistory.objects.create(application=app2,status=app2.status,changed_by=employer)

        app3,_=Application.objects.get_or_create(job=job3,candidate=seeker2,defaults={'status':Application.Status.SHORTLISTED})
        if not app3.status_history.exists():ApplicationStatusHistory.objects.create(application=app3,status=app3.status,changed_by=employer3)

        app4,_=Application.objects.get_or_create(job=job5,candidate=seeker,defaults={'status':Application.Status.HIRED})
        if not app4.status_history.exists():ApplicationStatusHistory.objects.create(application=app4,status=app4.status,changed_by=employer2)

        # Quiz Attempt
        qa,_=QuizAttempt.objects.get_or_create(application=app1,quiz=quiz,defaults={'score':2,'total':2,'percentage':100.0,'passed':True,'submitted_at':date.today()})

        # 11. Conversations
        conv,_=Conversation.objects.get_or_create(application=app1)
        conv.participants.set([seeker,employer])
        if not conv.messages.exists():
            Message.objects.create(conversation=conv,sender=employer,body='Hi Shohug! Thanks for applying — we reviewed your score and look forward to the interview.')

        # 12. Moderation Reports
        # Job report
        ModerationReport.objects.get_or_create(target_type='JOB',target_id=job6.id,defaults={'reporter':seeker,'reason':'Suspicious listing: Asks candidates for an upfront payment of ৳2,000 before job allocation. Potential scam.','status':'OPEN'})

        # Course report
        ModerationReport.objects.get_or_create(target_type='COURSE',target_id=c4.id,defaults={'reporter':seeker2,'reason':'Misleading course offering unrealistic financial guarantees and unsafe software links.','status':'OPEN'})

        # Resolved report
        ModerationReport.objects.get_or_create(target_type='JOB',target_id=job5.id,defaults={'reporter':seeker3,'reason':'Listing was closed but remained visible as active.','status':'RESOLVED','resolved_by':admin})

        # 13. System Notifications
        Notification.objects.get_or_create(user=admin,title='New Moderation Report Submitted',defaults={'body':'A user reported job listing #6 (Urgent Online Work) for suspicious fee requests.','kind':'MODERATION','link':'/admin/moderation'})
        Notification.objects.get_or_create(user=admin,title='Employer Verification Pending',defaults={'body':'Horizon Logistics & Tech submitted business profile for review.','kind':'VERIFICATION','link':'/admin/users'})

        self.stdout.write(self.style.SUCCESS('SkillNet comprehensive demo data is ready. Admin: admin@skillnet.demo / DemoPass123!'))
