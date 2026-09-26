from datetime import date
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from .models import *
from .scoring import score_application, normalize_weights, experience_years, rank_applicants
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
    def test_malformed_quiz_submission_does_not_burn_an_attempt(self):
        quiz=Quiz.objects.create(job=self.job,title='QA basics',pass_percentage=50,max_attempts=1)
        question=Question.objects.create(quiz=quiz,text='Choose the correct answer',skill=self.skill,marks=2)
        correct=AnswerOption.objects.create(question=question,text='Correct',is_correct=True)
        AnswerOption.objects.create(question=question,text='Incorrect',is_correct=False)
        application=Application.objects.create(job=self.job,candidate=self.seeker,status=Application.Status.ASSESSMENT_PENDING)
        self.client.force_authenticate(self.seeker)
        bad=self.client.post(f'/api/quizzes/{quiz.id}/submit/',{'application_id':application.id,'answers':{str(question.id):999999}},format='json')
        self.assertEqual(bad.status_code,400)
        self.assertEqual(QuizAttempt.objects.filter(application=application).count(),0)
        good=self.client.post(f'/api/quizzes/{quiz.id}/submit/',{'application_id':application.id,'answers':{str(question.id):correct.id}},format='json')
        self.assertEqual(good.status_code,200);self.assertTrue(good.data['passed'])
    def test_seeker_can_manage_education_entries(self):
        self.client.force_authenticate(self.seeker)
        create=self.client.post('/api/profile/education/',{'institution':'Test University','degree':'BSc','field':'CS','start_date':'2018-01-01'},format='json')
        self.assertEqual(create.status_code,201)
        listing=self.client.get('/api/profile/education/')
        self.assertEqual(listing.data['count'],1)
        update=self.client.patch(f"/api/profile/education/{create.data['id']}/",{'degree':'MSc'},format='json')
        self.assertEqual(update.data['degree'],'MSc')
        delete=self.client.delete(f"/api/profile/education/{create.data['id']}/")
        self.assertEqual(delete.status_code,204)
    def test_seeker_cannot_see_other_seekers_education(self):
        other=User.objects.create_user(email='other-seeker@test.com',password='StrongPass123!',role=User.Role.JOB_SEEKER);other_profile=SeekerProfile.objects.create(user=other)
        Education.objects.create(profile=other_profile,institution='Other Uni',degree='BSc',start_date='2018-01-01')
        self.client.force_authenticate(self.seeker)
        response=self.client.get('/api/profile/education/')
        self.assertEqual(response.data['count'],0)
    def test_profile_update_applies_user_and_seeker_fields(self):
        self.client.force_authenticate(self.seeker)
        response=self.client.patch('/api/users/profile/',{'first_name':'Updated','phone':'+8801000000','headline':'New headline','portfolio_url':'https://example.com'},format='json')
        self.assertEqual(response.status_code,200)
        self.assertEqual(response.data['headline'],'New headline')
        self.seeker.refresh_from_db()
        self.assertEqual(self.seeker.first_name,'Updated');self.assertEqual(self.seeker.phone,'+8801000000')
    def test_cv_generation_returns_pdf(self):
        self.client.force_authenticate(self.seeker)
        response=self.client.post('/api/users/cv/',{'sections':['summary','skills'],'template':'modern','accent':'#0f766e'},format='json')
        self.assertEqual(response.status_code,200)
        self.assertEqual(response['Content-Type'],'application/pdf')
        self.assertTrue(response.content.startswith(b'%PDF'))
    def test_applying_creates_conversation_and_progress_can_be_tracked(self):
        self.client.force_authenticate(self.seeker)
        apply_response=self.client.post(f'/api/jobs/{self.job.id}/apply/',{},format='json')
        self.assertEqual(apply_response.status_code,201)
        conversation=Conversation.objects.get(application_id=apply_response.data['id'])
        self.assertIn(self.seeker,conversation.participants.all());self.assertIn(self.employer,conversation.participants.all())
        provider=User.objects.create_user(email='provider@test.com',password='StrongPass123!',role=User.Role.COURSE_PROVIDER)
        course=Course.objects.create(provider=provider,title='Test Course',description='desc',category='Business',status=Course.Status.PUBLISHED)
        module=CourseModule.objects.create(course=course,title='Module 1',order=1)
        enrollment=Enrollment.objects.create(user=self.seeker,course=course)
        complete=self.client.post(f'/api/enrollments/{enrollment.id}/complete_module/',{'module_id':module.id},format='json')
        self.assertEqual(complete.status_code,200)
        self.assertEqual(complete.data['progress'],100)
        self.assertTrue(complete.data['is_completed'])
    def test_employer_can_review_candidate_cv_and_shortlist(self):
        SeekerProfile.objects.filter(user=self.seeker).update(headline='QA Specialist')
        Education.objects.create(profile=self.seeker.seeker_profile,institution='Test Uni',degree='BSc',start_date='2018-01-01')
        self.client.force_authenticate(self.seeker)
        application_id=self.client.post(f'/api/jobs/{self.job.id}/apply/',{},format='json').data['id']
        self.client.force_authenticate(self.employer)
        listing=self.client.get('/api/applications/')
        self.assertEqual(listing.status_code,200);self.assertEqual(listing.data['count'],1)
        candidate_profile=listing.data['results'][0]['candidate_profile']
        self.assertEqual(candidate_profile['headline'],'QA Specialist')
        self.assertEqual(len(candidate_profile['education']),1)
        self.assertIsNotNone(listing.data['results'][0]['conversation_id'])
        shortlist=self.client.put(f'/api/applications/{application_id}/status/',{'status':'SHORTLISTED'},format='json')
        self.assertEqual(shortlist.status_code,200)
        self.assertEqual(shortlist.data['status'],'SHORTLISTED')
        self.assertEqual(Application.objects.get(pk=application_id).status_history.count(),2)
    def test_employer_cannot_shortlist_another_employers_applicant(self):
        other=User.objects.create_user(email='other-employer@test.com',password='StrongPass123!',role=User.Role.EMPLOYER);EmployerProfile.objects.create(user=other,company_name='Rival Co')
        self.client.force_authenticate(self.seeker)
        application_id=self.client.post(f'/api/jobs/{self.job.id}/apply/',{},format='json').data['id']
        self.client.force_authenticate(other)
        response=self.client.put(f'/api/applications/{application_id}/status/',{'status':'SHORTLISTED'},format='json')
        self.assertEqual(response.status_code,404)
    def test_marking_a_conversation_read_clears_unread_messages(self):
        self.client.force_authenticate(self.seeker)
        apply_response=self.client.post(f'/api/jobs/{self.job.id}/apply/',{},format='json')
        conversation_id=Conversation.objects.get(application_id=apply_response.data['id']).id
        self.client.force_authenticate(self.employer)
        self.client.post(f'/api/conversations/{conversation_id}/messages/',{'body':'Hello there'},format='json')
        self.client.force_authenticate(self.seeker)
        self.assertEqual(Message.objects.filter(conversation_id=conversation_id,read_at__isnull=True).exclude(sender=self.seeker).count(),1)
        response=self.client.post(f'/api/conversations/{conversation_id}/mark_read/')
        self.assertEqual(response.status_code,204)
        self.assertEqual(Message.objects.filter(conversation_id=conversation_id,read_at__isnull=True).exclude(sender=self.seeker).count(),0)
    def _quiz_payload(self,job_id):
        return {'job':job_id,'title':'QA basics','pass_percentage':70,'duration_minutes':10,'questions':[
            {'text':'What is a unit test?','skill':self.skill.id,'marks':1,'options':[{'text':'Correct','is_correct':True},{'text':'Wrong','is_correct':False}]},
        ]}
    def test_employer_can_create_quiz_and_it_attaches_to_the_job(self):
        self.assertFalse(hasattr(self.job,'quiz'))
        self.client.force_authenticate(self.employer)
        response=self.client.post('/api/quizzes/',self._quiz_payload(self.job.id),format='json')
        self.assertEqual(response.status_code,201,response.data)
        self.assertEqual(Question.objects.filter(quiz_id=response.data['id']).count(),1)
        job_response=self.client.get(f'/api/jobs/{self.job.id}/')
        self.assertTrue(job_response.data['has_quiz']);self.assertEqual(job_response.data['quiz_id'],response.data['id'])
    def test_employer_cannot_attach_quiz_to_another_employers_job(self):
        other=User.objects.create_user(email='other-employer2@test.com',password='StrongPass123!',role=User.Role.EMPLOYER);other_profile=EmployerProfile.objects.create(user=other,company_name='Rival Co')
        other_job=Job.objects.create(employer=other_profile,title='Other role',description='d',requirements='r',category='Technology',job_type=Job.Type.FULL_TIME,location='Dhaka',status=Job.Status.PUBLISHED)
        self.client.force_authenticate(self.employer)
        response=self.client.post('/api/quizzes/',self._quiz_payload(other_job.id),format='json')
        self.assertEqual(response.status_code,400)
    def test_cannot_attach_a_second_quiz_to_the_same_job(self):
        self.client.force_authenticate(self.employer)
        first=self.client.post('/api/quizzes/',self._quiz_payload(self.job.id),format='json')
        self.assertEqual(first.status_code,201)
        second=self.client.post('/api/quizzes/',self._quiz_payload(self.job.id),format='json')
        self.assertEqual(second.status_code,400)
    def test_quiz_without_a_correct_answer_is_rejected(self):
        self.client.force_authenticate(self.employer)
        payload=self._quiz_payload(self.job.id)
        payload['questions'][0]['options']=[{'text':'A','is_correct':False},{'text':'B','is_correct':False}]
        response=self.client.post('/api/quizzes/',payload,format='json')
        self.assertEqual(response.status_code,400)
    def test_employer_can_edit_their_quiz_questions(self):
        self.client.force_authenticate(self.employer)
        created=self.client.post('/api/quizzes/',self._quiz_payload(self.job.id),format='json').data
        payload=self._quiz_payload(self.job.id)
        payload['questions']=[
            {'text':'Updated question','skill':self.skill.id,'marks':2,'options':[{'text':'Right','is_correct':True},{'text':'Wrong','is_correct':False},{'text':'Also wrong','is_correct':False}]},
        ]
        updated=self.client.put(f"/api/quizzes/{created['id']}/",payload,format='json')
        self.assertEqual(updated.status_code,200,updated.data)
        self.assertEqual(Question.objects.filter(quiz_id=created['id']).count(),1)
        question=Question.objects.get(quiz_id=created['id'])
        self.assertEqual(question.text,'Updated question');self.assertEqual(question.options.count(),3)
    def test_applying_saves_a_cv_snapshot(self):
        self.seeker.seeker_profile.headline='QA Specialist';self.seeker.seeker_profile.save()
        self.seeker.seeker_profile.skills.add(self.skill)
        Education.objects.create(profile=self.seeker.seeker_profile,institution='Test Uni',degree='BSc',start_date='2018-01-01')
        self.client.force_authenticate(self.seeker)
        response=self.client.post(f'/api/jobs/{self.job.id}/apply/',{'cv_options':{'template':'modern','sections':['summary','skills']}},format='json')
        self.assertEqual(response.status_code,201)
        application=Application.objects.get(pk=response.data['id'])
        self.assertEqual(application.cv_snapshot['headline'],'QA Specialist')
        self.assertEqual([s['name'] for s in application.cv_snapshot['skills']],['Testing'])
        self.assertEqual(len(application.cv_snapshot['education']),1)
        self.assertEqual(application.cv_options,{'template':'modern','sections':['summary','skills']})
    def test_apply_still_works_without_cv_options(self):
        self.client.force_authenticate(self.seeker)
        response=self.client.post(f'/api/jobs/{self.job.id}/apply/',{},format='json')
        self.assertEqual(response.status_code,201)
        application=Application.objects.get(pk=response.data['id'])
        self.assertIsNone(application.cv_options)
        self.assertIsNotNone(application.cv_snapshot)  # seeker has a profile, even if mostly empty
    def test_ranked_applicants_endpoint_sorts_by_fit_score(self):
        strong=User.objects.create_user(email='strong@test.com',password='StrongPass123!',role=User.Role.JOB_SEEKER)
        strong_profile=SeekerProfile.objects.create(user=strong);strong_profile.skills.add(self.skill)
        weak=User.objects.create_user(email='weak@test.com',password='StrongPass123!',role=User.Role.JOB_SEEKER)
        SeekerProfile.objects.create(user=weak)
        self.client.force_authenticate(strong);strong_app=self.client.post(f'/api/jobs/{self.job.id}/apply/',{},format='json').data
        self.client.force_authenticate(weak);weak_app=self.client.post(f'/api/jobs/{self.job.id}/apply/',{},format='json').data
        self.client.force_authenticate(self.employer)
        response=self.client.get(f'/api/jobs/{self.job.id}/ranked-applicants/')
        self.assertEqual(response.status_code,200)
        by_id={r['id']:r for r in response.data}
        self.assertGreater(by_id[strong_app['id']]['fit_score'],by_id[weak_app['id']]['fit_score'])
        self.assertEqual(response.data[0]['id'],strong_app['id'])
    def test_ranked_applicants_employer_ownership_enforced(self):
        other=User.objects.create_user(email='rival@test.com',password='StrongPass123!',role=User.Role.EMPLOYER);EmployerProfile.objects.create(user=other,company_name='Rival Co')
        self.client.force_authenticate(other)
        response=self.client.get(f'/api/jobs/{self.job.id}/ranked-applicants/')
        self.assertEqual(response.status_code,404)

class ScoringTests(APITestCase):
    def setUp(self):
        self.seeker=User.objects.create_user(email='cand@test.com',password='StrongPass123!',role=User.Role.JOB_SEEKER)
        self.profile=SeekerProfile.objects.create(user=self.seeker)
        employer_user=User.objects.create_user(email='scoring-emp@test.com',password='StrongPass123!',role=User.Role.EMPLOYER)
        company=EmployerProfile.objects.create(user=employer_user,company_name='Score Co')
        self.react=Skill.objects.create(name='React',slug='react-score')
        self.js=Skill.objects.create(name='JavaScript',slug='js-score')
        self.docker=Skill.objects.create(name='Docker',slug='docker-score')
        self.job=Job.objects.create(employer=company,title='Frontend Developer',description='d',requirements='React and JavaScript experience needed',category='Technology',job_type=Job.Type.FULL_TIME,location='Dhaka',status=Job.Status.PUBLISHED)
        self.job.skills.set([self.react,self.js,self.docker])
        self.application=Application.objects.create(job=self.job,candidate=self.seeker,status=Application.Status.UNDER_REVIEW)

    def test_normalize_weights_scales_custom_weights_to_100(self):
        self.assertEqual(normalize_weights(25,25,50),{'skills':25.0,'quiz':25.0,'experience':50.0})
        weights=normalize_weights(5,3,2)
        self.assertAlmostEqual(sum(weights.values()),100)
        self.assertAlmostEqual(weights['skills'],50.0)

    def test_normalize_weights_falls_back_to_defaults_when_all_zero(self):
        self.assertEqual(normalize_weights(0,0,0),{'skills':50.0,'quiz':30.0,'experience':20.0})

    def test_skills_score_reflects_matched_and_missing(self):
        self.profile.skills.set([self.react])
        result=score_application(self.job,self.application,[self.react,self.js,self.docker],{'skills':50,'quiz':30,'experience':20},None,job_has_quiz=False)
        self.assertAlmostEqual(result['breakdown']['skills'],33.33,places=1)
        self.assertEqual(result['matched_skills'],['React'])
        self.assertCountEqual(result['missing_skills'],['JavaScript','Docker'])

    def test_missing_quiz_is_dropped_not_scored_as_zero(self):
        self.profile.skills.set([self.react,self.js,self.docker])
        result=score_application(self.job,self.application,[self.react,self.js,self.docker],{'skills':50,'quiz':30,'experience':20},None,job_has_quiz=True)
        self.assertIsNone(result['breakdown']['quiz'])
        # No experience entries -> experience component is 0, so fit score is entirely the (redistributed) skills weight applied to a 100% skills match.
        expected_skills_weight=50/(50+20)*100
        self.assertAlmostEqual(result['fit_score'],round(100*expected_skills_weight/100,1),places=1)

    def test_missing_required_skills_on_job_drops_skills_component(self):
        result=score_application(self.job,self.application,[],{'skills':50,'quiz':30,'experience':20},None,job_has_quiz=False)
        self.assertIsNone(result['breakdown']['skills'])
        self.assertEqual(result['matched_skills'],[]);self.assertEqual(result['missing_skills'],[])
        # Both skills and quiz dropped -> 100% of the weight goes to experience.
        self.assertEqual(result['fit_score'],result['breakdown']['experience'])

    def test_must_have_missing_skill_knocks_out_but_still_scores(self):
        self.profile.skills.set([self.react,self.js])
        result=score_application(self.job,self.application,[self.react,self.js,self.docker],{'skills':50,'quiz':30,'experience':20},[self.docker.id],job_has_quiz=False)
        self.assertTrue(result['knocked_out'])
        self.assertIsNotNone(result['fit_score'])
        self.assertIn('must-have',result['explanation'])

    def test_experience_years_caps_and_counts_current_role_to_today(self):
        years=experience_years([{'start_date':'2010-01-01','end_date':None,'current':True}])
        self.assertEqual(years,10)  # capped at MAX_EXPERIENCE_YEARS
        self.assertAlmostEqual(experience_years([{'start_date':'2023-01-01','end_date':'2024-01-01','current':False}]),1,places=0)

    def test_explanation_is_plain_english_and_mentions_each_component(self):
        self.profile.skills.set([self.react,self.js])
        Experience.objects.create(profile=self.profile,company='Acme',title='Frontend Developer',description='Built React interfaces',start_date=date(2021,1,1),current=True)
        result=score_application(self.job,self.application,[self.react,self.js,self.docker],{'skills':50,'quiz':30,'experience':20},None,job_has_quiz=False)
        self.assertIn('Matches 2/3 required skills',result['explanation'])
        self.assertIn('missing Docker',result['explanation'])
        self.assertIn('yrs relevant experience',result['explanation'])

    def test_prefers_snapshot_over_live_profile_when_present(self):
        self.profile.skills.set([self.react])  # live profile only has React
        self.application.cv_snapshot={'skills':[{'id':self.js.id,'name':'JavaScript'},{'id':self.docker.id,'name':'Docker'}],'experience':[]}
        self.application.save()
        result=score_application(self.job,self.application,[self.react,self.js,self.docker],{'skills':50,'quiz':30,'experience':20},None,job_has_quiz=False)
        self.assertCountEqual(result['matched_skills'],['JavaScript','Docker'])
        self.assertEqual(result['missing_skills'],['React'])

    def test_rank_applicants_sorts_knocked_out_candidates_last(self):
        other=User.objects.create_user(email='cand2@test.com',password='StrongPass123!',role=User.Role.JOB_SEEKER)
        other_profile=SeekerProfile.objects.create(user=other);other_profile.skills.set([self.react,self.js,self.docker])
        other_app=Application.objects.create(job=self.job,candidate=other,status=Application.Status.UNDER_REVIEW)
        self.profile.skills.set([self.react,self.js,self.docker])  # equally strong, but will be knocked out
        results=rank_applicants(self.job,[self.application,other_app],weights={'skills':50,'quiz':30,'experience':20},must_have_ids=[])
        # Sanity: with no must-have restriction neither is knocked out.
        self.assertFalse(any(r['knocked_out'] for r in results))
        results_knockout=rank_applicants(self.job,[self.application,other_app],weights={'skills':50,'quiz':30,'experience':20},must_have_ids=[self.docker.id])
        # Simulate the seeker losing the Docker skill so they get knocked out despite an otherwise-tied score.
        self.profile.skills.remove(self.docker)
        results_knockout=rank_applicants(self.job,[self.application,other_app],weights={'skills':50,'quiz':30,'experience':20},must_have_ids=[self.docker.id])
        self.assertTrue(results_knockout[-1]['knocked_out'])
        self.assertEqual(results_knockout[-1]['application_id'],self.application.id)
