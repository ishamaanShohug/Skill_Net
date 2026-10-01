// Services used by more than one role. Anything exclusive to a single role's
// pages lives in that role's own <role>Service.js instead (e.g. seeker/seekerService.js).
import api, { useMocks, unwrap, unwrapList } from './api';
import { mockService } from './mockService';
import { normalizeJob, normalizeCourse } from './normalize';

export const authService = {
  login: (data) => useMocks ? mockService.login(data) : unwrap(api.post('/auth/login/', data)),
  register: (data) => useMocks ? mockService.login(data) : unwrap(api.post('/auth/register/', data)),
  logout: (refresh) => useMocks ? Promise.resolve() : unwrap(api.post('/auth/logout/', { refresh })),
};
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
// Notifications are reused across every role's dashboard (including the shared
// layout's badge), so this stays here rather than in a single role's service file.
export const notificationService = { getAll: () => useMocks ? mockService.getNotifications() : unwrapList(api.get('/notifications/')), markRead: (id) => useMocks ? Promise.resolve({ id }) : unwrap(api.put(`/notifications/${id}/read/`)), markAllRead: () => useMocks ? Promise.resolve() : api.put('/notifications/read_all/') };
// One endpoint serves both the seeker's own profile and the employer's company
// profile (the backend branches on role), so this is shared rather than seeker-only.
export const profileService = { get: () => unwrap(api.get('/users/profile/')), update: (data) => unwrap(api.patch('/users/profile/', data)) };
