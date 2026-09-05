from django.contrib.auth.models import AbstractUser,BaseUserManager
from django.conf import settings
from django.core.validators import MinValueValidator,MaxValueValidator
from django.db import models

class TimeStamped(models.Model):
    created_at=models.DateTimeField(auto_now_add=True);updated_at=models.DateTimeField(auto_now=True)
    class Meta: abstract=True

class UserManager(BaseUserManager):
    use_in_migrations=True
    def create_user(self,email,password=None,**extra):
        if not email:raise ValueError('Email is required.')
        user=self.model(email=self.normalize_email(email),**extra);user.set_password(password);user.save(using=self._db);return user
    def create_superuser(self,email,password=None,**extra):
        extra.setdefault('is_staff',True);extra.setdefault('is_superuser',True);extra.setdefault('role','ADMIN')
        if not extra.get('is_staff') or not extra.get('is_superuser'):raise ValueError('Superuser must have staff and superuser flags.')
        return self.create_user(email,password,**extra)

class User(AbstractUser):
    class Role(models.TextChoices): JOB_SEEKER='JOB_SEEKER','Job seeker';EMPLOYER='EMPLOYER','Employer';COURSE_PROVIDER='COURSE_PROVIDER','Course provider';ADMIN='ADMIN','Administrator'
    username=None;email=models.EmailField(unique=True);role=models.CharField(max_length=20,choices=Role.choices,default=Role.JOB_SEEKER);phone=models.CharField(max_length=30,blank=True);is_verified=models.BooleanField(default=False)
    objects=UserManager();USERNAME_FIELD='email';REQUIRED_FIELDS=[]

class Skill(TimeStamped):
    name=models.CharField(max_length=100,unique=True);slug=models.SlugField(unique=True);category=models.CharField(max_length=100,blank=True)
    def __str__(self): return self.name

class SeekerProfile(TimeStamped):
    user=models.OneToOneField(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name='seeker_profile');headline=models.CharField(max_length=160,blank=True);summary=models.TextField(blank=True);address=models.CharField(max_length=255,blank=True);location=models.CharField(max_length=120,blank=True);latitude=models.DecimalField(max_digits=9,decimal_places=6,null=True,blank=True);longitude=models.DecimalField(max_digits=9,decimal_places=6,null=True,blank=True);photo=models.ImageField(upload_to='profiles/',blank=True);skills=models.ManyToManyField(Skill,blank=True)

class EmployerProfile(TimeStamped):
    user=models.OneToOneField(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name='employer_profile');company_name=models.CharField(max_length=180);industry=models.CharField(max_length=120,blank=True);website=models.URLField(blank=True);description=models.TextField(blank=True);location=models.CharField(max_length=120,blank=True);logo=models.ImageField(upload_to='companies/',blank=True);is_approved=models.BooleanField(default=False)

class Education(TimeStamped):
    profile=models.ForeignKey(SeekerProfile,on_delete=models.CASCADE,related_name='education');institution=models.CharField(max_length=180);degree=models.CharField(max_length=180);field=models.CharField(max_length=160,blank=True);start_date=models.DateField();end_date=models.DateField(null=True,blank=True)
class Experience(TimeStamped):
    profile=models.ForeignKey(SeekerProfile,on_delete=models.CASCADE,related_name='experience');company=models.CharField(max_length=180);title=models.CharField(max_length=180);description=models.TextField(blank=True);start_date=models.DateField();end_date=models.DateField(null=True,blank=True);current=models.BooleanField(default=False)
class Certificate(TimeStamped):
    profile=models.ForeignKey(SeekerProfile,on_delete=models.CASCADE,related_name='certificates');name=models.CharField(max_length=180);issuer=models.CharField(max_length=180);issued_date=models.DateField();credential_url=models.URLField(blank=True);document=models.FileField(upload_to='certificates/',blank=True)

class Job(TimeStamped):
    class Status(models.TextChoices): DRAFT='DRAFT','Draft';PUBLISHED='PUBLISHED','Published';CLOSED='CLOSED','Closed';REMOVED='REMOVED','Removed'
    class Type(models.TextChoices): FULL_TIME='FULL_TIME','Full-time';PART_TIME='PART_TIME','Part-time';CONTRACT='CONTRACT','Contract';INTERNSHIP='INTERNSHIP','Internship';FREELANCE='FREELANCE','Freelance'
    employer=models.ForeignKey(EmployerProfile,on_delete=models.CASCADE,related_name='jobs');title=models.CharField(max_length=180);description=models.TextField();requirements=models.TextField();category=models.CharField(max_length=120);job_type=models.CharField(max_length=20,choices=Type.choices);location=models.CharField(max_length=120);latitude=models.DecimalField(max_digits=9,decimal_places=6,null=True,blank=True);longitude=models.DecimalField(max_digits=9,decimal_places=6,null=True,blank=True);salary_min=models.DecimalField(max_digits=12,decimal_places=2,null=True,blank=True);salary_max=models.DecimalField(max_digits=12,decimal_places=2,null=True,blank=True);experience=models.CharField(max_length=100,blank=True);skills=models.ManyToManyField(Skill,related_name='jobs');status=models.CharField(max_length=15,choices=Status.choices,default=Status.DRAFT);deadline=models.DateField(null=True,blank=True)
    class Meta:ordering=['-created_at']

class Quiz(TimeStamped):
    job=models.OneToOneField(Job,on_delete=models.CASCADE,related_name='quiz');title=models.CharField(max_length=180);description=models.TextField(blank=True);duration_minutes=models.PositiveIntegerField(default=10);pass_percentage=models.PositiveIntegerField(default=70,validators=[MaxValueValidator(100)]);max_attempts=models.PositiveIntegerField(default=1);is_active=models.BooleanField(default=True)
class Question(TimeStamped):
    quiz=models.ForeignKey(Quiz,on_delete=models.CASCADE,related_name='questions');text=models.TextField();skill=models.ForeignKey(Skill,on_delete=models.PROTECT,related_name='questions');marks=models.PositiveIntegerField(default=1);order=models.PositiveIntegerField(default=0)
    class Meta: ordering=['order','id']
class AnswerOption(models.Model):
    question=models.ForeignKey(Question,on_delete=models.CASCADE,related_name='options');text=models.CharField(max_length=500);is_correct=models.BooleanField(default=False);order=models.PositiveIntegerField(default=0)

class Application(TimeStamped):
    class Status(models.TextChoices): APPLIED='APPLIED','Applied';ASSESSMENT_PENDING='ASSESSMENT_PENDING','Assessment pending';UNDER_REVIEW='UNDER_REVIEW','Under review';SHORTLISTED='SHORTLISTED','Shortlisted';INTERVIEW='INTERVIEW','Interview';OFFER='OFFER','Offer';HIRED='HIRED','Hired';REJECTED='REJECTED','Rejected';WITHDRAWN='WITHDRAWN','Withdrawn'
    job=models.ForeignKey(Job,on_delete=models.CASCADE,related_name='applications');candidate=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name='applications');cover_letter=models.TextField(blank=True);status=models.CharField(max_length=25,choices=Status.choices,default=Status.APPLIED)
    class Meta: constraints=[models.UniqueConstraint(fields=['job','candidate'],name='unique_job_application')]
class ApplicationStatusHistory(models.Model):
    application=models.ForeignKey(Application,on_delete=models.CASCADE,related_name='status_history');status=models.CharField(max_length=25,choices=Application.Status.choices);note=models.TextField(blank=True);changed_by=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.SET_NULL,null=True);created_at=models.DateTimeField(auto_now_add=True)

class QuizAttempt(TimeStamped):
    application=models.ForeignKey(Application,on_delete=models.CASCADE,related_name='quiz_attempts');quiz=models.ForeignKey(Quiz,on_delete=models.CASCADE,related_name='attempts');score=models.PositiveIntegerField(default=0);total=models.PositiveIntegerField(default=0);percentage=models.DecimalField(max_digits=5,decimal_places=2,default=0);passed=models.BooleanField(default=False);submitted_at=models.DateTimeField(null=True,blank=True)
class CandidateAnswer(models.Model):
    attempt=models.ForeignKey(QuizAttempt,on_delete=models.CASCADE,related_name='answers');question=models.ForeignKey(Question,on_delete=models.CASCADE);selected_option=models.ForeignKey(AnswerOption,on_delete=models.PROTECT);is_correct=models.BooleanField(default=False);marks_awarded=models.PositiveIntegerField(default=0)

class Course(TimeStamped):
    class Status(models.TextChoices): DRAFT='DRAFT','Draft';PENDING='PENDING','Pending';PUBLISHED='PUBLISHED','Published';REMOVED='REMOVED','Removed'
    provider=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name='courses');title=models.CharField(max_length=180);description=models.TextField();category=models.CharField(max_length=120);skills=models.ManyToManyField(Skill,related_name='courses');duration_minutes=models.PositiveIntegerField(default=0);price=models.DecimalField(max_digits=10,decimal_places=2,default=0);rating=models.DecimalField(max_digits=2,decimal_places=1,default=0);status=models.CharField(max_length=15,choices=Status.choices,default=Status.DRAFT)
class CourseModule(TimeStamped):
    course=models.ForeignKey(Course,on_delete=models.CASCADE,related_name='modules');title=models.CharField(max_length=180);content=models.TextField(blank=True);video_url=models.URLField(blank=True);order=models.PositiveIntegerField(default=0)
    class Meta: ordering=['order','id']
class Enrollment(TimeStamped):
    user=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name='enrollments');course=models.ForeignKey(Course,on_delete=models.CASCADE,related_name='enrollments');progress=models.PositiveIntegerField(default=0,validators=[MaxValueValidator(100)]);completed_modules=models.ManyToManyField(CourseModule,blank=True);is_completed=models.BooleanField(default=False)
    class Meta: constraints=[models.UniqueConstraint(fields=['user','course'],name='unique_enrollment')]

class Conversation(TimeStamped):
    participants=models.ManyToManyField(settings.AUTH_USER_MODEL,related_name='conversations');application=models.ForeignKey(Application,on_delete=models.SET_NULL,null=True,blank=True,related_name='conversations')
class Message(TimeStamped):
    conversation=models.ForeignKey(Conversation,on_delete=models.CASCADE,related_name='messages');sender=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name='sent_messages');body=models.TextField();read_at=models.DateTimeField(null=True,blank=True)
class Notification(TimeStamped):
    user=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name='notifications');title=models.CharField(max_length=180);body=models.TextField();kind=models.CharField(max_length=40,default='SYSTEM');is_read=models.BooleanField(default=False);link=models.CharField(max_length=255,blank=True)
class Payment(TimeStamped):
    class Status(models.TextChoices): PENDING='PENDING','Pending';SUCCESS='SUCCESS','Success';FAILED='FAILED','Failed';REFUNDED='REFUNDED','Refunded'
    user=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name='payments');course=models.ForeignKey(Course,on_delete=models.PROTECT);amount=models.DecimalField(max_digits=10,decimal_places=2);status=models.CharField(max_length=15,choices=Status.choices,default=Status.PENDING);provider=models.CharField(max_length=50,blank=True);transaction_id=models.CharField(max_length=180,blank=True,unique=True,null=True)
class ModerationReport(TimeStamped):
    reporter=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.SET_NULL,null=True);target_type=models.CharField(max_length=30);target_id=models.PositiveBigIntegerField();reason=models.TextField();status=models.CharField(max_length=20,default='OPEN');resolved_by=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.SET_NULL,null=True,blank=True,related_name='resolved_reports')
