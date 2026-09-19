import api, { useMocks } from './api';
import { mockService } from './mockService';

const unwrap = (promise) => promise.then((response) => response.data);
const unwrapList = (promise) => unwrap(promise).then((data) => Array.isArray(data) ? data : (data?.results || []));
const titleCase = (value = '') => value.toLowerCase().split('_').map((item) => item.charAt(0).toUpperCase() + item.slice(1)).join('-');
const money = (value) => Number(value || 0).toLocaleString('en-BD');

const normalizeJob = (job) => ({
  ...job,
  skills: (job.skills || []).map((skill) => typeof skill === 'string' ? skill : skill.name),
  type: job.type || titleCase(job.job_type),
  quiz: job.quiz ?? job.has_quiz,
  salary: job.salary || (job.salary_min ? `৳${money(job.salary_min)}${job.salary_max ? `–${money(job.salary_max)}` : ''}` : 'Salary negotiable'),
  posted: job.posted || (job.created_at ? new Date(job.created_at).toLocaleDateString('en-BD', { month: 'short', day: 'numeric' }) : ''),
  logo: job.logo || job.company?.split(' ').map((item) => item[0]).slice(0, 2).join('') || 'SN',
  color: job.color || '#e8f7f1',
  requirements: Array.isArray(job.requirements) ? job.requirements : String(job.requirements || '').split('\n').filter(Boolean),
});
const normalizeCourse = (course) => ({
  ...course,
  skills: (course.skills || []).map((skill) => typeof skill === 'string' ? skill : skill.name),
  skill: course.skill || course.skills?.[0]?.name || course.skills?.[0] || course.category,
  provider: course.provider_name || course.provider || 'SkillNet provider',
  duration: course.duration || (course.duration_minutes ? `${Math.floor(course.duration_minutes / 60)}h ${course.duration_minutes % 60}m` : 'Self-paced'),
  lessons: course.lessons || course.modules?.length || 0,
  modules: (course.modules || []).map((module) => typeof module === 'string' ? module : module.title),
  image: course.image || String(course.category || 'course').toLowerCase().replaceAll(' ', '-'),
  level: course.level || 'All levels',
  reviews: course.reviews || 0,
  price: Number(course.price || 0),
  rating: Number(course.rating || 0),
});
const normalizeApplication = (application) => ({
  ...application,
  job_detail: application.job,
  job: application.job?.title || application.job,
  status_code: application.status,
  status: titleCase(application.status),
  company: application.company || application.job?.company,
  jobTitle: application.job?.title || application.job,
  date: application.date || new Date(application.created_at).toLocaleDateString('en-BD'),
  updated: application.updated || new Date(application.updated_at).toLocaleDateString('en-BD'),
  score: application.score ?? application.quiz_score,
});

export const authService = {
  login: (data) => useMocks ? mockService.login(data) : unwrap(api.post('/auth/login/', data)),
  register: (data) => useMocks ? mockService.login(data) : unwrap(api.post('/auth/register/', data)),
  logout: (refresh) => useMocks ? Promise.resolve() : unwrap(api.post('/auth/logout/', { refresh })),
};
export const profileService = { get: () => unwrap(api.get('/users/profile/')), update: (data) => unwrap(api.patch('/users/profile/', data)) };
export const skillService = { getAll: () => unwrapList(api.get('/skills/')) };
export const jobService = {
  getJobs: (params) => useMocks ? mockService.getJobs() : unwrapList(api.get('/jobs/', { params })).then((items) => items.map(normalizeJob)),
  getById: (id) => useMocks ? mockService.getJobById(id) : unwrap(api.get(`/jobs/${id}/`)).then(normalizeJob),
  create: (data) => unwrap(api.post('/jobs/', data)),
  update: (id, data) => unwrap(api.patch(`/jobs/${id}/`, data)),
  remove: (id) => api.delete(`/jobs/${id}/`),
  apply: (id, data = {}) => useMocks ? mockService.applyForJob(id) : unwrap(api.post(`/jobs/${id}/apply/`, data)),
};
export const courseService = {
  getCourses: () => useMocks ? mockService.getCourses() : unwrapList(api.get('/courses/')).then((items) => items.map(normalizeCourse)),
  getById: (id) => useMocks ? mockService.getCourseById(id) : unwrap(api.get(`/courses/${id}/`)).then(normalizeCourse),
  enroll: (id) => useMocks ? mockService.enrollCourse(id) : unwrap(api.post(`/courses/${id}/enroll/`)),
  update: (id, data) => unwrap(api.patch(`/courses/${id}/`, data)),
};
export const applicationService = {
  getAll: (params) => useMocks ? mockService.getApplications() : unwrapList(api.get('/applications/', { params })).then((items) => items.map(normalizeApplication)),
  setStatus: (id, status, note = '') => unwrap(api.put(`/applications/${id}/status/`, { status, note })).then(normalizeApplication),
};
export const quizService = { get: (id) => useMocks ? Promise.resolve({ id }) : unwrap(api.get(`/quizzes/${id}/`)), submit: (id, data) => useMocks ? mockService.submitQuiz(data.answers) : unwrap(api.post(`/quizzes/${id}/submit/`, data)) };
export const notificationService = { getAll: () => useMocks ? mockService.getNotifications() : unwrapList(api.get('/notifications/')), markRead: (id) => useMocks ? Promise.resolve({ id }) : unwrap(api.put(`/notifications/${id}/read/`)), markAllRead: () => useMocks ? Promise.resolve() : api.put('/notifications/read_all/') };
export const messageService = { getAll: () => useMocks ? Promise.resolve([]) : unwrapList(api.get('/conversations/')), send: (conversationId, data) => useMocks ? Promise.resolve(data) : unwrap(api.post(`/conversations/${conversationId}/messages/`, data)) };
export const adminService = {
  getAnalytics: () => useMocks ? Promise.resolve({}) : unwrap(api.get('/admin/analytics/')),
  getUsers: (params) => unwrapList(api.get('/admin/users/', { params })),
  updateUser: (id, data) => unwrap(api.patch(`/admin/users/${id}/`, data)),
  getReports: (params) => unwrapList(api.get('/admin/moderation-reports/', { params })),
  resolveReport: (id, status) => unwrap(api.post(`/admin/moderation-reports/${id}/resolve/`, { status })),
};
export const paymentService = { createCheckout: (courseId) => unwrap(api.post('/payments/checkout/', { course_id: courseId })) };
export const applicantService = { getAll: () => useMocks ? mockService.getApplicants() : unwrapList(api.get('/applications/')).then((items) => items.map(normalizeApplication)) };
export const enrollmentService = { getAll: () => unwrapList(api.get('/enrollments/')) };
export const recommendationService = { getAll: () => unwrap(api.get('/recommendations/')).then((items) => items.map(normalizeCourse)) };
