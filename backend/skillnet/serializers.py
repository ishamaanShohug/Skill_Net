from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from rest_framework import serializers
from .models import *

class UserSerializer(serializers.ModelSerializer):
    name=serializers.CharField(source='get_full_name',read_only=True)
    class Meta:model=User;fields=['id','email','first_name','last_name','name','role','phone','is_verified','is_active','date_joined'];read_only_fields=['is_verified','date_joined']
class AdminUserSerializer(UserSerializer):
    class Meta(UserSerializer.Meta):
        read_only_fields=['date_joined']
class RegisterSerializer(serializers.ModelSerializer):
    name=serializers.CharField(write_only=True);password=serializers.CharField(write_only=True,validators=[validate_password]);company=serializers.CharField(write_only=True,required=False,allow_blank=True)
    class Meta:model=User;fields=['id','name','email','password','role','phone','company']
    @transaction.atomic
    def create(self,data):
        name=data.pop('name').strip().split(' ',1);company=data.pop('company','');password=data.pop('password');user=User(**data,first_name=name[0],last_name=name[1] if len(name)>1 else '');user.set_password(password);user.save()
        if user.role==User.Role.JOB_SEEKER:SeekerProfile.objects.create(user=user)
        elif user.role==User.Role.EMPLOYER:EmployerProfile.objects.create(user=user,company_name=company or user.get_full_name())
        return user
class SkillSerializer(serializers.ModelSerializer):
    class Meta:model=Skill;fields='__all__'
class EducationSerializer(serializers.ModelSerializer):
    class Meta:model=Education;exclude=['profile']
class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:model=Experience;exclude=['profile']
class CertificateSerializer(serializers.ModelSerializer):
    class Meta:model=Certificate;exclude=['profile']
class SeekerProfileSerializer(serializers.ModelSerializer):
    user=UserSerializer(read_only=True);education=EducationSerializer(many=True,read_only=True);experience=ExperienceSerializer(many=True,read_only=True);certificates=CertificateSerializer(many=True,read_only=True);skills=SkillSerializer(many=True,read_only=True);skill_ids=serializers.PrimaryKeyRelatedField(source='skills',many=True,queryset=Skill.objects.all(),write_only=True,required=False)
    class Meta:model=SeekerProfile;fields='__all__'
class EmployerProfileSerializer(serializers.ModelSerializer):
    user=UserSerializer(read_only=True)
    class Meta:model=EmployerProfile;fields='__all__';read_only_fields=['is_approved']
class JobSerializer(serializers.ModelSerializer):
    skills=SkillSerializer(many=True,read_only=True);skill_ids=serializers.PrimaryKeyRelatedField(source='skills',many=True,queryset=Skill.objects.all(),write_only=True);company=serializers.CharField(source='employer.company_name',read_only=True);employer=EmployerProfileSerializer(read_only=True);has_quiz=serializers.SerializerMethodField();quiz_id=serializers.SerializerMethodField();applications_count=serializers.IntegerField(source='applications.count',read_only=True)
    class Meta:model=Job;fields='__all__';read_only_fields=['employer']
    def get_has_quiz(self,obj):return hasattr(obj,'quiz')
    def get_quiz_id(self,obj):return obj.quiz.id if hasattr(obj,'quiz') else None
class OptionSerializer(serializers.ModelSerializer):
    class Meta:model=AnswerOption;fields=['id','text','order']
class EmployerOptionSerializer(serializers.ModelSerializer):
    class Meta:model=AnswerOption;fields='__all__';read_only_fields=['question']
class QuestionSerializer(serializers.ModelSerializer):
    options=OptionSerializer(many=True,read_only=True);skill=SkillSerializer(read_only=True)
    class Meta:model=Question;fields=['id','text','skill','marks','order','options']
class QuizSerializer(serializers.ModelSerializer):
    questions=QuestionSerializer(many=True,read_only=True);job_title=serializers.CharField(source='job.title',read_only=True)
    class Meta:model=Quiz;fields='__all__';read_only_fields=['job']
class EmployerQuestionSerializer(serializers.ModelSerializer):
    options=EmployerOptionSerializer(many=True,read_only=True);skill=SkillSerializer(read_only=True)
    class Meta:model=Question;fields=['id','text','skill','marks','order','options']
class EmployerQuizSerializer(serializers.ModelSerializer):
    questions=EmployerQuestionSerializer(many=True,read_only=True);job_title=serializers.CharField(source='job.title',read_only=True)
    class Meta:model=Quiz;fields='__all__'
class AnswerOptionWriteSerializer(serializers.ModelSerializer):
    class Meta:model=AnswerOption;fields=['text','is_correct']
class QuestionWriteSerializer(serializers.ModelSerializer):
    options=AnswerOptionWriteSerializer(many=True)
    class Meta:model=Question;fields=['text','skill','marks','options']
class QuizWriteSerializer(serializers.ModelSerializer):
    questions=QuestionWriteSerializer(many=True)
    class Meta:model=Quiz;fields=['id','job','title','description','duration_minutes','pass_percentage','max_attempts','is_active','questions']
    def validate_job(self,value):
        request=self.context.get('request')
        if request and value.employer.user!=request.user:raise serializers.ValidationError("You can only attach an assessment to your own job.")
        return value
    def validate_questions(self,value):
        if not value:raise serializers.ValidationError('Add at least one question.')
        for q in value:
            options=q.get('options') or []
            if len(options)<2:raise serializers.ValidationError('Each question needs at least two answer options.')
            if not any(o.get('is_correct') for o in options):raise serializers.ValidationError('Each question needs one option marked correct.')
        return value
    def create(self,validated_data):
        questions=validated_data.pop('questions');quiz=Quiz.objects.create(**validated_data);self._save_questions(quiz,questions);return quiz
    def update(self,instance,validated_data):
        questions=validated_data.pop('questions',None)
        for field,value in validated_data.items():setattr(instance,field,value)
        instance.save()
        if questions is not None:instance.questions.all().delete();self._save_questions(instance,questions)
        return instance
    def _save_questions(self,quiz,questions):
        for order,q in enumerate(questions):
            options=q.pop('options');question=Question.objects.create(quiz=quiz,order=order,**q)
            for opt_order,opt in enumerate(options):AnswerOption.objects.create(question=question,order=opt_order,**opt)
class StatusHistorySerializer(serializers.ModelSerializer):
    changed_by=UserSerializer(read_only=True)
    class Meta:model=ApplicationStatusHistory;fields='__all__'
class ApplicationSerializer(serializers.ModelSerializer):
    job=JobSerializer(read_only=True);job_id=serializers.PrimaryKeyRelatedField(source='job',queryset=Job.objects.filter(status=Job.Status.PUBLISHED),write_only=True,required=False);candidate=UserSerializer(read_only=True);status_history=StatusHistorySerializer(many=True,read_only=True);quiz_score=serializers.SerializerMethodField();candidate_profile=serializers.SerializerMethodField();conversation_id=serializers.SerializerMethodField()
    class Meta:model=Application;fields='__all__';read_only_fields=['candidate','status']
    def get_quiz_score(self,obj):
        attempt=obj.quiz_attempts.filter(submitted_at__isnull=False).order_by('-created_at').first();return float(attempt.percentage) if attempt else None
    def get_candidate_profile(self,obj):
        try:profile=obj.candidate.seeker_profile
        except SeekerProfile.DoesNotExist:return None
        return SeekerProfileSerializer(profile).data
    def get_conversation_id(self,obj):
        conversation=obj.conversations.first();return conversation.id if conversation else None
class ModuleSerializer(serializers.ModelSerializer):
    class Meta:model=CourseModule;fields='__all__';read_only_fields=['course']
class CourseSerializer(serializers.ModelSerializer):
    skills=SkillSerializer(many=True,read_only=True);skill_ids=serializers.PrimaryKeyRelatedField(source='skills',many=True,queryset=Skill.objects.all(),write_only=True,required=False);modules=ModuleSerializer(many=True,read_only=True);provider_name=serializers.CharField(source='provider.get_full_name',read_only=True)
    class Meta:model=Course;fields='__all__';read_only_fields=['provider','rating']
class EnrollmentSerializer(serializers.ModelSerializer):
    course=CourseSerializer(read_only=True);course_id=serializers.PrimaryKeyRelatedField(source='course',queryset=Course.objects.filter(status=Course.Status.PUBLISHED),write_only=True)
    class Meta:model=Enrollment;fields='__all__';read_only_fields=['user']
class MessageSerializer(serializers.ModelSerializer):
    sender=UserSerializer(read_only=True)
    class Meta:model=Message;fields='__all__';read_only_fields=['sender']
class ConversationSerializer(serializers.ModelSerializer):
    participants=UserSerializer(many=True,read_only=True);messages=MessageSerializer(many=True,read_only=True)
    class Meta:model=Conversation;fields='__all__'
class NotificationSerializer(serializers.ModelSerializer):
    class Meta:model=Notification;fields='__all__';read_only_fields=['user']
class PaymentSerializer(serializers.ModelSerializer):
    class Meta:model=Payment;fields='__all__';read_only_fields=['user','status','transaction_id','amount']
class QuizSubmissionSerializer(serializers.Serializer):
    application_id=serializers.IntegerField();answers=serializers.DictField(child=serializers.IntegerField())
class ModerationReportSerializer(serializers.ModelSerializer):
    reporter=UserSerializer(read_only=True);resolved_by=UserSerializer(read_only=True)
    class Meta:model=ModerationReport;fields='__all__';read_only_fields=['reporter','resolved_by']
