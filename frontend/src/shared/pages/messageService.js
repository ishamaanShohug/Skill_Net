// Used by the shared Messages page (every role's dashboard reuses it) and by
// the dashboard layout itself, to show a live unread-message badge in the nav.
import api, { useMocks, unwrap, unwrapList } from '../services/api';

export const messageService = {
  getAll: () => useMocks ? Promise.resolve([]) : unwrapList(api.get('/conversations/')),
  send: (conversationId, data) => useMocks ? Promise.resolve(data) : unwrap(api.post(`/conversations/${conversationId}/messages/`, data)),
  markRead: (conversationId) => useMocks ? Promise.resolve() : api.post(`/conversations/${conversationId}/mark_read/`),
};
// A message is unread when it wasn't sent by the current user and hasn't been marked read yet.
export const isUnread = (message, userId) => !message.read_at && message.sender?.id !== userId;
export const countUnread = (conversations, userId) => (conversations || []).reduce((total, c) => total + c.messages.filter((m) => isUnread(m, userId)).length, 0);
