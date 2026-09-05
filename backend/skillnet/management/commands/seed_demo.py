from datetime import date
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from skillnet.models import *
class Command(BaseCommand):
    help='Create idempotent SkillNet demo data'
    def handle(self,*args,**opts):
        seeker,_=User.objects.get_or_create(email='seeker@skillnet.demo',defaults={'first_name':'Shohug','last_name':'','role':User.Role.JOB_SEEKER});seeker.first_name='Shohug';seeker.last_name='';seeker.set_password('DemoPass123!');seeker.save();SeekerProfile.objects.get_or_create(user=seeker,defaults={'headline':'Product Designer','location':'Dhaka'})
        employer,_=User.objects.get_or_create(email='employer@skillnet.demo',defaults={'first_name':'Tasnim','last_name':'Ahmed','role':User.Role.EMPLOYER});employer.set_password('DemoPass123!');employer.save();company,_=EmployerProfile.objects.get_or_create(user=employer,defaults={'company_name':'Orbit Systems','industry':'Technology','location':'Dhaka','is_approved':True})
        provider,_=User.objects.get_or_create(email='provider@skillnet.demo',defaults={'first_name':'SkillNet','last_name':'Academy','role':User.Role.COURSE_PROVIDER});provider.set_password('DemoPass123!');provider.save()
        admin,_=User.objects.get_or_create(email='admin@skillnet.demo',defaults={'first_name':'Admin','role':User.Role.ADMIN,'is_staff':True,'is_superuser':True});admin.set_password('DemoPass123!');admin.save()
        skills={};
        for name in ['React','JavaScript','Communication','Excel','Data Analysis']:
            skills[name],_=Skill.objects.get_or_create(slug=slugify(name),defaults={'name':name,'category':'Professional'})
        job,_=Job.objects.get_or_create(employer=company,title='Frontend Developer',defaults={'description':'Build accessible, responsive interfaces.','requirements':'React fundamentals\nREST API experience','category':'Technology','job_type':Job.Type.FULL_TIME,'location':'Dhaka · Hybrid','salary_min':70000,'salary_max':100000,'experience':'2–4 years','status':Job.Status.PUBLISHED});job.skills.set([skills['React'],skills['JavaScript']])
        quiz,_=Quiz.objects.get_or_create(job=job,defaults={'title':'Frontend Fundamentals','duration_minutes':10,'pass_percentage':70})
        if not quiz.questions.exists():
            for index,(text,skill) in enumerate([('What is React state used for?','React'),('Which value is immutable by convention?','JavaScript')]):
                q=Question.objects.create(quiz=quiz,text=text,skill=skills[skill],marks=1,order=index);AnswerOption.objects.create(question=q,text='The correct demonstration answer',is_correct=True,order=0);AnswerOption.objects.create(question=q,text='An incorrect alternative',is_correct=False,order=1)
        course,_=Course.objects.get_or_create(provider=provider,title='Excel for the Modern Workplace',defaults={'description':'Learn practical spreadsheet and reporting skills.','category':'Business','duration_minutes':380,'price':1200,'rating':4.8,'status':Course.Status.PUBLISHED});course.skills.set([skills['Excel'],skills['Data Analysis']]);CourseModule.objects.get_or_create(course=course,title='Formulas that save time',defaults={'order':1})
        self.stdout.write(self.style.SUCCESS('SkillNet demo data is ready. Password: DemoPass123!'))
