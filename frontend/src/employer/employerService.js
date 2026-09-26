// Services exclusive to the employer role's pages. Cross-role services
// (jobs, courses, skills, auth) live in shared/services/shared.js instead.
import api, { useMocks, unwrap, unwrapList } from '../shared/services/api';
import { mockService } from '../shared/services/mockService';
import { normalizeApplication } from '../shared/services/normalize';

export const applicantService = {
  getAll: () => useMocks ? mockService.getApplicants() : unwrapList(api.get('/applications/')).then((items) => items.map(normalizeApplication)),
  setStatus: (id, status, note = '') => unwrap(api.put(`/applications/${id}/status/`, { status, note })).then(normalizeApplication),
};
export const quizBuilderService = {
  getMine: () => unwrapList(api.get('/quizzes/')),
  create: (data) => unwrap(api.post('/quizzes/', data)),
  update: (id, data) => unwrap(api.put(`/quizzes/${id}/`, data)),
};
export const rankedApplicantService = {
  // Not run through normalizeJob, so job.skills stays {id, name} objects — the must-have picker needs real ids.
  getRequiredSkills: (jobId) => unwrap(api.get(`/jobs/${jobId}/`)).then((job) => job.skills || []),
  getRanked: (jobId, params) => unwrapList(api.get(`/jobs/${jobId}/ranked-applicants/`, { params })).then((items) => items.map(normalizeApplication)),
};
