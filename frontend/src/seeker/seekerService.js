// Services exclusive to the job-seeker role's pages. Cross-role services
// (jobs, courses, skills, auth) live in shared/services/shared.js instead.
import api, { useMocks, unwrap, unwrapList } from '../shared/services/api';
import { mockService } from '../shared/services/mockService';
import { normalizeApplication, normalizeCourse } from '../shared/services/normalize';

export const educationService = {
  create: (data) => unwrap(api.post('/profile/education/', data)),
  update: (id, data) => unwrap(api.patch(`/profile/education/${id}/`, data)),
  remove: (id) => api.delete(`/profile/education/${id}/`),
};
export const experienceService = {
  create: (data) => unwrap(api.post('/profile/experience/', data)),
  update: (id, data) => unwrap(api.patch(`/profile/experience/${id}/`, data)),
  remove: (id) => api.delete(`/profile/experience/${id}/`),
};
export const certificateService = {
  create: (data) => unwrap(api.post('/profile/certificates/', data)),
  update: (id, data) => unwrap(api.patch(`/profile/certificates/${id}/`, data)),
  remove: (id) => api.delete(`/profile/certificates/${id}/`),
};
export const cvService = { generate: (options) => api.post('/users/cv/', options, { responseType: 'blob' }).then((response) => response.data) };
export const applicationService = {
  getAll: (params) => useMocks ? mockService.getApplications() : unwrapList(api.get('/applications/', { params })).then((items) => items.map(normalizeApplication)),
};
export const quizService = { get: (id) => useMocks ? Promise.resolve({ id }) : unwrap(api.get(`/quizzes/${id}/`)), submit: (id, data) => useMocks ? mockService.submitQuiz(data.answers) : unwrap(api.post(`/quizzes/${id}/submit/`, data)) };
export const paymentService = { createCheckout: (courseId) => unwrap(api.post('/payments/checkout/', { course_id: courseId })) };
export const enrollmentService = { getAll: () => unwrapList(api.get('/enrollments/')), completeModule: (id, moduleId) => unwrap(api.post(`/enrollments/${id}/complete_module/`, { module_id: moduleId })) };
export const recommendationService = { getAll: () => unwrap(api.get('/recommendations/')).then((items) => items.map(normalizeCourse)) };
