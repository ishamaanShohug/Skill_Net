// Services exclusive to the administrator role's pages.
import api, { useMocks, unwrap, unwrapList } from '../shared/services/api';
import { normalizeJob, normalizeCourse } from '../shared/services/normalize';

export const adminService = {
  getAnalytics: () => useMocks ? Promise.resolve({}) : unwrap(api.get('/admin/analytics/')),
  
  // User management
  getUsers: (params) => unwrapList(api.get('/admin/users/', { params })),
  getUser: (id) => unwrap(api.get(`/admin/users/${id}/`)),
  updateUser: (id, data) => unwrap(api.patch(`/admin/users/${id}/`, data)),
  toggleUserActive: (id) => unwrap(api.post(`/admin/users/${id}/toggle_active/`)),
  toggleUserVerify: (id) => unwrap(api.post(`/admin/users/${id}/toggle_verify/`)),
  approveEmployer: (id, is_approved = true) => unwrap(api.post(`/admin/users/${id}/approve_employer/`, { is_approved })),
  
  // Job moderation & management
  getJobs: (params) => unwrapList(api.get('/jobs/', { params })).then((items) => items.map(normalizeJob)),
  getJob: (id) => unwrap(api.get(`/jobs/${id}/`)).then(normalizeJob),
  updateJob: (id, data) => unwrap(api.patch(`/jobs/${id}/`, data)),
  deleteJob: (id) => api.delete(`/jobs/${id}/`),
  
  // Course management
  getCourses: (params) => unwrapList(api.get('/courses/', { params })).then((items) => items.map(normalizeCourse)),
  getCourse: (id) => unwrap(api.get(`/courses/${id}/`)).then(normalizeCourse),
  updateCourse: (id, data) => unwrap(api.patch(`/courses/${id}/`, data)),
  deleteCourse: (id) => api.delete(`/courses/${id}/`),
  
  // Moderation queue
  getReports: (params) => unwrapList(api.get('/admin/moderation-reports/', { params })),
  createReport: (data) => unwrap(api.post('/admin/moderation-reports/', data)),
  resolveReport: (id, data) => {
    const payload = typeof data === 'string' ? { status: data } : data;
    return unwrap(api.post(`/admin/moderation-reports/${id}/resolve/`, payload));
  },
  
  // Reports & Analytics Export
  exportReportUrl: (type = 'overview') => `${api.defaults.baseURL || 'http://localhost:8000/api'}/admin/reports/export/?type=${type}`,
  downloadReport: (type = 'overview') => {
    const token = sessionStorage.getItem('sn_token');
    const url = `${api.defaults.baseURL || 'http://localhost:8000/api'}/admin/reports/export/?type=${type}`;
    // Fetch with Authorization header and trigger blob download
    return fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to export report');
        return res.blob();
      })
      .then((blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `skillnet-${type}-report.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);
      });
  },
};
