from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from .models import *
class ApiTests(APITestCase):
    def setUp(self):
        self.seeker=User.objects.create_user(email='seek@test.com',password='StrongPass123!',role=User.Role.JOB_SEEKER);SeekerProfile.objects.create(user=self.seeker)
        self.employer=User.objects.create_user(email='hire@test.com',password='StrongPass123!',role=User.Role.EMPLOYER);profile=EmployerProfile.objects.create(user=self.employer,company_name='Test Co')
        self.skill=Skill.objects.create(name='Testing',slug='testing');self.job=Job.objects.create(employer=profile,title='QA Engineer',description='Test things',requirements='Attention to detail',category='Technology',job_type=Job.Type.FULL_TIME,location='Dhaka',status=Job.Status.PUBLISHED);self.job.skills.add(self.skill)
    def test_public_can_list_jobs(self):
        response=self.client.get('/api/jobs/');self.assertEqual(response.status_code,200);self.assertEqual(response.data['count'],1)
    def test_registration_returns_tokens(self):
        response=self.client.post('/api/auth/register/',{'name':'New Person','email':'new@test.com','password':'StrongPass123!','role':'JOB_SEEKER'},format='json');self.assertEqual(response.status_code,201);self.assertIn('access',response.data)
    def test_seeker_can_apply_once(self):
        self.client.force_authenticate(self.seeker);url=f'/api/jobs/{self.job.id}/apply/';self.assertEqual(self.client.post(url,{},format='json').status_code,201);self.assertEqual(self.client.post(url,{},format='json').status_code,409)
    def test_seeker_cannot_create_job(self):
        self.client.force_authenticate(self.seeker);response=self.client.post('/api/jobs/',{},format='json');self.assertEqual(response.status_code,403)
    def test_employer_sees_only_own_jobs_and_can_create_job(self):
        other=User.objects.create_user(email='other@test.com',password='StrongPass123!',role=User.Role.EMPLOYER);other_profile=EmployerProfile.objects.create(user=other,company_name='Other Co')
        Job.objects.create(employer=other_profile,title='Other job',description='Other description',requirements='Other requirement',category='Technology',job_type=Job.Type.FULL_TIME,location='Dhaka',status=Job.Status.PUBLISHED)
        self.client.force_authenticate(self.employer)
        response=self.client.get('/api/jobs/')
        self.assertEqual(response.status_code,200);self.assertEqual(response.data['count'],1)
        response=self.client.post('/api/jobs/',{'title':'New role','description':'Build products','requirements':'Know testing','category':'Technology','job_type':'FULL_TIME','location':'Dhaka','status':'PUBLISHED','skill_ids':[self.skill.id]},format='json')
        self.assertEqual(response.status_code,201)
        self.assertEqual(response.data['employer']['company_name'],'Test Co')
    def test_admin_can_moderate_jobs_and_users(self):
        admin=User.objects.create_user(email='admin@test.com',password='StrongPass123!',role=User.Role.ADMIN,is_staff=True)
        self.client.force_authenticate(admin)
        response=self.client.patch(f'/api/jobs/{self.job.id}/',{'status':'CLOSED'},format='json')
        self.assertEqual(response.status_code,200)
        self.assertEqual(response.data['status'],'CLOSED')
        response=self.client.patch(f'/api/admin/users/{self.seeker.id}/',{'is_active':False},format='json')
        self.assertEqual(response.status_code,200)
        self.assertFalse(response.data['is_active'])
    def test_seeker_can_submit_quiz_for_own_application(self):
        quiz=Quiz.objects.create(job=self.job,title='QA basics',pass_percentage=50)
        question=Question.objects.create(quiz=quiz,text='Choose the correct answer',skill=self.skill,marks=2)
        correct=AnswerOption.objects.create(question=question,text='Correct',is_correct=True)
        AnswerOption.objects.create(question=question,text='Incorrect',is_correct=False)
        application=Application.objects.create(job=self.job,candidate=self.seeker,status=Application.Status.ASSESSMENT_PENDING)
        self.client.force_authenticate(self.seeker)
        response=self.client.post(f'/api/quizzes/{quiz.id}/submit/',{'application_id':application.id,'answers':{str(question.id):correct.id}},format='json')
        self.assertEqual(response.status_code,200)
        self.assertEqual(response.data['score'],2)
        self.assertTrue(response.data['passed'])
