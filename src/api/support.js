// Support/Leave endpoints
import { get, post } from './utils';

export const SupportApi = {
  // Leave
  getLeaveRequests: () => get('/support/leave/requests.php'),
  approveLeave: (id, status, admin_comment) => post('/support/leave/approve.php', { id, status, admin_comment }),
  requestLeave: (data) => post('/support/leave/request.php', data),
  getMyLeaveRequests: () => get('/support/leave/my-requests.php'),
  cancelMyLeaveRequest: (id) => post('/support/leave/my-requests.php', { id }),
  // Tickets
  getTickets: () => get('/support/tickets/get-all.php'),
  createTicket: (data) => post('/support/tickets/create.php', data),
  updateTicketStatus: (ticket_id, status) => post('/support/tickets/update-status.php', { ticket_id, status }),
  // FAQs
  getFaqs: () => get('/support/faqs/get-all.php'),
  createFaq: (faq) => post('/support/faqs/create.php', faq),
  deleteFaq: (id) => post(`/support/faqs/delete.php?id=${id}`),
};
