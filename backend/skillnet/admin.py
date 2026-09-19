from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import *
@admin.register(User)
class CustomUserAdmin(UserAdmin):
    ordering=['email'];list_display=['email','first_name','last_name','role','is_active'];fieldsets=((None,{'fields':('email','password')}),('Personal',{'fields':('first_name','last_name','phone','role','is_verified')}),('Permissions',{'fields':('is_active','is_staff','is_superuser','groups','user_permissions')}),('Dates',{'fields':('last_login','date_joined')}));add_fieldsets=((None,{'classes':('wide',),'fields':('email','password1','password2','role')}),);search_fields=['email','first_name','last_name']
for model in [Skill,SeekerProfile,EmployerProfile,Education,Experience,Certificate,Job,Quiz,Question,AnswerOption,Application,ApplicationStatusHistory,QuizAttempt,CandidateAnswer,Course,CourseModule,Enrollment,Conversation,Message,Notification,Payment,ModerationReport]:admin.site.register(model)
