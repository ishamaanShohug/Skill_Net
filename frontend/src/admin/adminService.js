// Services exclusive to the administrator role's pages.
import api, { useMocks, unwrap, unwrapList } from '../shared/services/api';

export const adminService = {
  getAnalytics: () => useMocks ? Promise.resolve({}) : unwrap(api.get('/admin/analytics/')),
  getUsers: (params) => unwrapList(api.get('/admin/users/', { params })),
  updateUser: (id, data) => unwrap(api.patch(`/admin/users/${id}/`, data)),
  getReports: (params) => unwrapList(api.get('/admin/moderation-reports/', { params })),
  resolveReport: (id, status) => unwrap(api.post(`/admin/moderation-reports/${id}/resolve/`, { status })),
};
