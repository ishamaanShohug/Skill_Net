from datetime import date
from django.core.management.base import BaseCommand
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
        provider,_=User.objects.get_or_create(email='provider@skillnet.demo',defaults={'first_name':'SkillNet','last_name':'Academy','role':User.Role.COURSE_PROVIDER});provider.set_password('DemoPass123!');provider.save()
        admin,_=User.objects.get_or_create(email='admin@skillnet.demo',defaults={'first_name':'Admin','role':User.Role.ADMIN,'is_staff':True,'is_superuser':True});admin.set_password('DemoPass123!');admin.save()
        skills={};
        for name in ['React','JavaScript','Communication','Excel','Data Analysis']:
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
        application,_=Application.objects.get_or_create(job=job,candidate=seeker,defaults={'status':Application.Status.UNDER_REVIEW})
        if not application.status_history.exists():ApplicationStatusHistory.objects.create(application=application,status=application.status,changed_by=employer)
        conversation,_=Conversation.objects.get_or_create(application=application);conversation.participants.set([seeker,employer])
        if not conversation.messages.exists():Message.objects.create(conversation=conversation,sender=employer,body='Hi Shohug! Thanks for applying — we would love to learn more about your experience.')
        self.stdout.write(self.style.SUCCESS('SkillNet demo data is ready. Password: DemoPass123!'))
