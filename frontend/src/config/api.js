// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  // University endpoints
  UNIVERSITY_SIGNUP: `${API_BASE_URL}/api/university/signup`,
  VERIFY_EMAIL: `${API_BASE_URL}/api/university/verify-email`,
  RESEND_OTP: `${API_BASE_URL}/api/university/resend-otp`,
  CONNECT_WALLET: `${API_BASE_URL}/api/university/connect-wallet`,
  SIGNUP_STATUS: `${API_BASE_URL}/api/university/signup-status`,
  ISSUE_CERTIFICATE: `${API_BASE_URL}/api/university/issue-certificate`,
  FINALIZE_CERTIFICATE: `${API_BASE_URL}/api/university/finalize-certificate`,
  
  // Admin endpoints
  ADMIN_LOGIN: `${API_BASE_URL}/api/admin/login`,
  PENDING_UNIVERSITIES: `${API_BASE_URL}/api/admin/pending-universities`,
  APPROVE_UNIVERSITY: (id) => `${API_BASE_URL}/api/admin/universities/${id}/approve`,
  REJECT_UNIVERSITY: (id) => `${API_BASE_URL}/api/admin/universities/${id}/reject`,
  
  // Certificate endpoints
  GET_CERTIFICATE: (txHash) => `${API_BASE_URL}/api/certificate/${txHash}`,
};

export default API_BASE_URL;
