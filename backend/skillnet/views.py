from django.db import transaction
from django.db.models import Count,Q
from django.utils import timezone
from rest_framework import generics,status,viewsets
from rest_framework.decorators import action,api_view,permission_classes
from rest_framework.permissions import AllowAny,IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import *
from .permissions import *
from .serializers import *

class LoginView(TokenObtainPairView):
    def post(self,request,*args,**kwargs):
        response=super().post(request,*args,**kwargs)
        if response.status_code==200:
            user=User.objects.get(email=request.data.get('email'));response.data['user']=UserSerializer(user).data
        return response
class RegisterView(generics.CreateAPIView):
    queryset=User.objects.all();serializer_class=RegisterSerializer;permission_classes=[AllowAny]
    def create(self,request,*args,**kwargs):
        response=super().create(request,*args,**kwargs);user=User.objects.get(pk=response.data['id']);refresh=RefreshToken.for_user(user);return Response({'access':str(refresh.access_token),'refresh':str(refresh),'user':UserSerializer(user).data},status=201)
@api_view(['POST'])
def logout_view(request):
    try:RefreshToken(request.data['refresh']).blacklist()
    except Exception:return Response({'detail':'Invalid refresh token.'},status=400)
    return Response(status=204)

class ProfileView(generics.RetrieveUpdateAPIView):
    permission_classes=[IsAuthenticated]
    def get_object(self):
        if self.request.user.role==User.Role.EMPLOYER:return self.request.user.employer_profile
        return self.request.user.seeker_profile
    def get_serializer_class(self):return EmployerProfileSerializer if self.request.user.role==User.Role.EMPLOYER else SeekerProfileSerializer

class SkillViewSet(viewsets.ReadOnlyModelViewSet):
    queryset=Skill.objects.all();serializer_class=SkillSerializer;permission_classes=[AllowAny];search_fields=['name','category']
class JobViewSet(viewsets.ModelViewSet):
    serializer_class=JobSerializer;filterset_fields=['category','job_type','location','status'];search_fields=['title','description','employer__company_name','skills__name'];ordering_fields=['created_at','salary_min']
    def get_permissions(self):
        if self.action in ['list','retrieve']:return [AllowAny()]
        if self.action=='apply':return [IsJobSeeker()]
        return [IsEmployerOrAdmin()]
    def get_queryset(self):
        qs=Job.objects.select_related('employer','employer__user').prefetch_related('skills')
        if self.request.user.is_authenticated and self.request.user.role==User.Role.ADMIN:return qs
        if self.request.user.is_authenticated and self.request.user.role==User.Role.EMPLOYER:return qs.filter(employer__user=self.request.user)
        return qs.filter(status=Job.Status.PUBLISHED)
    def perform_create(self,serializer):serializer.save(employer=self.request.user.employer_profile)
    def perform_update(self,serializer):
        if serializer.instance.employer.user!=self.request.user and self.request.user.role!=User.Role.ADMIN:self.permission_denied(self.request)
        serializer.save()
    def perform_destroy(self,instance):
        if instance.employer.user!=self.request.user and self.request.user.role!=User.Role.ADMIN:self.permission_denied(self.request)
        instance.delete()
    @action(detail=True,methods=['post'],permission_classes=[IsJobSeeker])
    def apply(self,request,pk=None):
        job=self.get_object();application,created=Application.objects.get_or_create(job=job,candidate=request.user,defaults={'cover_letter':request.data.get('cover_letter',''),'status':Application.Status.ASSESSMENT_PENDING if hasattr(job,'quiz') else Application.Status.APPLIED})
        if not created:return Response({'detail':'You already applied for this job.'},status=409)
        ApplicationStatusHistory.objects.create(application=application,status=application.status,changed_by=request.user);Notification.objects.create(user=job.employer.user,title='New application',body=f'{request.user.get_full_name()} applied for {job.title}',kind='APPLICATION')
        return Response(ApplicationSerializer(application).data,status=201)

class ApplicationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class=ApplicationSerializer;filterset_fields=['status','job'];ordering_fields=['created_at','updated_at']
    def get_queryset(self):
        u=self.request.user;qs=Application.objects.select_related('job','candidate','job__employer').prefetch_related('status_history').order_by('-created_at')
        if u.role==User.Role.JOB_SEEKER:return qs.filter(candidate=u)
        if u.role==User.Role.EMPLOYER:return qs.filter(job__employer__user=u)
        return qs
    @action(detail=True,methods=['put'],permission_classes=[IsEmployer])
    def status(self,request,pk=None):
        app=self.get_object();new=request.data.get('status')
        if new not in Application.Status.values:return Response({'status':'Invalid application status.'},status=400)
        app.status=new;app.save(update_fields=['status','updated_at']);ApplicationStatusHistory.objects.create(application=app,status=new,note=request.data.get('note',''),changed_by=request.user);Notification.objects.create(user=app.candidate,title='Application updated',body=f'{app.job.title} is now {app.get_status_display()}.',kind='APPLICATION',link=f'/job-seeker/applications/{app.id}')
        return Response(self.get_serializer(app).data)

class QuizViewSet(viewsets.ReadOnlyModelViewSet):
    queryset=Quiz.objects.filter(is_active=True).prefetch_related('questions__options','questions__skill');serializer_class=QuizSerializer
    @action(detail=True,methods=['post'],permission_classes=[IsJobSeeker])
    @transaction.atomic
    def submit(self,request,pk=None):
        quiz=self.get_object();s=QuizSubmissionSerializer(data=request.data);s.is_valid(raise_exception=True);app=Application.objects.get(pk=s.validated_data['application_id'],candidate=request.user,job=quiz.job)
        if app.quiz_attempts.count()>=quiz.max_attempts:return Response({'detail':'Maximum attempts reached.'},status=409)
        attempt=QuizAttempt.objects.create(application=app,quiz=quiz);score=total=0;gaps=[]
        for question in quiz.questions.prefetch_related('options','skill'):
            total+=question.marks;selected_id=s.validated_data['answers'].get(str(question.id)) or s.validated_data['answers'].get(question.id)
            try:selected=question.options.get(pk=selected_id)
            except AnswerOption.DoesNotExist:return Response({'answers':f'Invalid answer for question {question.id}.'},status=400)
            awarded=question.marks if selected.is_correct else 0;score+=awarded
            if not selected.is_correct:gaps.append(question.skill.name)
            CandidateAnswer.objects.create(attempt=attempt,question=question,selected_option=selected,is_correct=selected.is_correct,marks_awarded=awarded)
        percentage=round(score/total*100,2) if total else 0;passed=percentage>=quiz.pass_percentage;attempt.score=score;attempt.total=total;attempt.percentage=percentage;attempt.passed=passed;attempt.submitted_at=timezone.now();attempt.save();app.status=Application.Status.UNDER_REVIEW if passed else Application.Status.REJECTED;app.save();ApplicationStatusHistory.objects.create(application=app,status=app.status,changed_by=request.user)
        return Response({'score':score,'total':total,'percentage':percentage,'passed':passed,'status':'PASSED' if passed else 'FAILED','skill_gaps':sorted(set(gaps)),'recommended_courses':CourseSerializer(Course.objects.filter(status=Course.Status.PUBLISHED,skills__name__in=gaps).distinct(),many=True).data})

class CourseViewSet(viewsets.ModelViewSet):
    serializer_class=CourseSerializer;filterset_fields=['category','status','skills'];search_fields=['title','description','skills__name'];ordering_fields=['created_at','rating','price']
    def get_permissions(self):return [AllowAny()] if self.action in ['list','retrieve'] else [IsAuthenticated()]
    def get_queryset(self):
        qs=Course.objects.prefetch_related('skills','modules').select_related('provider').order_by('-created_at')
        return qs if self.request.user.is_authenticated and self.request.user.role in [User.Role.COURSE_PROVIDER,User.Role.ADMIN] else qs.filter(status=Course.Status.PUBLISHED)
    def perform_create(self,serializer):
        if self.request.user.role not in [User.Role.COURSE_PROVIDER,User.Role.ADMIN]:self.permission_denied(self.request)
        serializer.save(provider=self.request.user)
    def perform_update(self,serializer):
        if serializer.instance.provider!=self.request.user and self.request.user.role!=User.Role.ADMIN:self.permission_denied(self.request)
        serializer.save()
    def perform_destroy(self,instance):
        if instance.provider!=self.request.user and self.request.user.role!=User.Role.ADMIN:self.permission_denied(self.request)
        instance.delete()
    @action(detail=True,methods=['post'],permission_classes=[IsJobSeeker])
    def enroll(self,request,pk=None):
        course=self.get_object()
        if course.price>0:return Response({'requires_payment':True,'course_id':course.id,'amount':course.price},status=202)
        enrollment,created=Enrollment.objects.get_or_create(user=request.user,course=course);return Response(EnrollmentSerializer(enrollment).data,status=201 if created else 200)
class EnrollmentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class=EnrollmentSerializer
    def get_queryset(self):return Enrollment.objects.filter(user=self.request.user).select_related('course').prefetch_related('course__skills','course__modules')

class ConversationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class=ConversationSerializer
    def get_queryset(self):return self.request.user.conversations.prefetch_related('participants','messages__sender')
    @action(detail=True,methods=['post'])
    def messages(self,request,pk=None):
        conversation=self.get_object();serializer=MessageSerializer(data={'conversation':conversation.id,'body':request.data.get('body','')});serializer.is_valid(raise_exception=True);serializer.save(sender=request.user);return Response(serializer.data,status=201)
class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class=NotificationSerializer
    def get_queryset(self):return self.request.user.notifications.all().order_by('-created_at')
    @action(detail=True,methods=['put'])
    def read(self,request,pk=None):obj=self.get_object();obj.is_read=True;obj.save(update_fields=['is_read']);return Response(self.get_serializer(obj).data)
    @action(detail=False,methods=['put'])
    def read_all(self,request):self.get_queryset().update(is_read=True);return Response(status=204)
class AdminUserViewSet(viewsets.ModelViewSet):
    queryset=User.objects.all().order_by('-date_joined');serializer_class=AdminUserSerializer;permission_classes=[IsAdmin];filterset_fields=['role','is_active','is_verified'];search_fields=['email','first_name','last_name'];ordering_fields=['date_joined','email']
    def destroy(self,request,*args,**kwargs):
        return Response({'detail':'User records cannot be deleted through the platform API.'},status=405)
class ModerationReportViewSet(viewsets.ModelViewSet):
    serializer_class=ModerationReportSerializer;permission_classes=[IsAdmin];filterset_fields=['status','target_type'];ordering_fields=['created_at','updated_at']
    def get_queryset(self):return ModerationReport.objects.select_related('reporter','resolved_by').order_by('-created_at')
    def perform_create(self,serializer):serializer.save(reporter=self.request.user)
    @action(detail=True,methods=['post'])
    def resolve(self,request,pk=None):
        report=self.get_object();report.status=request.data.get('status','RESOLVED');report.resolved_by=request.user;report.save(update_fields=['status','resolved_by','updated_at']);return Response(self.get_serializer(report).data)

@api_view(['GET'])
@permission_classes([IsJobSeeker])
def recommendations(request):
    failed=CandidateAnswer.objects.filter(attempt__application__candidate=request.user,is_correct=False).values_list('question__skill_id',flat=True)
    return Response(CourseSerializer(Course.objects.filter(status=Course.Status.PUBLISHED,skills__in=failed).distinct(),many=True).data)
@api_view(['POST'])
@permission_classes([IsJobSeeker])
def checkout(request):
    course=Course.objects.get(pk=request.data.get('course_id'),status=Course.Status.PUBLISHED);payment=Payment.objects.create(user=request.user,course=course,amount=course.price,provider='PENDING_GATEWAY');return Response({'payment_id':payment.id,'amount':payment.amount,'status':payment.status,'gateway_url':None},status=201)
@api_view(['GET'])
@permission_classes([IsAdmin])
def analytics(request):
    return Response({'users':{'total':User.objects.count(),'seekers':User.objects.filter(role=User.Role.JOB_SEEKER).count(),'employers':User.objects.filter(role=User.Role.EMPLOYER).count()},'jobs':{'total':Job.objects.count(),'active':Job.objects.filter(status=Job.Status.PUBLISHED).count()},'applications':{'total':Application.objects.count(),'hired':Application.objects.filter(status=Application.Status.HIRED).count()},'courses':{'total':Course.objects.count(),'enrollments':Enrollment.objects.count()},'popular_jobs':list(Job.objects.annotate(count=Count('applications')).order_by('-count').values('id','title','count')[:5]),'popular_courses':list(Course.objects.annotate(count=Count('enrollments')).order_by('-count').values('id','title','count')[:5])})
