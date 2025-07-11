// Tournament endpoints
import { get, post } from './utils';

export const TournamentsApi = {
  getAll: async () => {
    // Returns { tournaments: [...] }
    return get('/tournaments/get-all.php');
  },
  getByStatus: async (status) => {
    // Returns { tournaments: [...] }
    return get(`/tournaments/get-by-status.php?status=${status}`);
  },
  create: (data) => post('/tournaments/create.php', data),
  update: (id, data) => post('/tournaments/update.php', { id, ...data }),
  delete: (id) => post('/tournaments/delete.php', { id }),
  // Get all registrations for the current user
  getRegistrations: async () => {
    // Returns { registrations: [...] }
    return get('/tournaments/get-registrations.php');
  },
  // Register current user for a tournament
  register: (tournament_id) => post('/tournaments/register.php', { tournament_id }),
  // Cancel registration for a tournament
  cancelRegistration: (tournament_id) => post('/tournaments/cancel-registration.php', { tournament_id }),
  // Initiate payment (with FormData)
  initiatePayment: (formData) => post('/tournaments/payment-initiate.php', formData, { isFormData: true }),
  // Payment verification (admin)
  verifyPayment: (payment_id, status) => post('/tournaments/payment-verify.php', { payment_id, status }),
};
