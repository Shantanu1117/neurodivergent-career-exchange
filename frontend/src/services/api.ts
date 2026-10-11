function resolveApiBaseUrl(): string {
  const raw = (
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    '/api/v1'
  )
    .trim()
    .replace(/\/+$/, '');

  if (!raw || raw === '/api/v1') {
    return '/api/v1';
  }
  if (raw.endsWith('/api/v1')) {
    return raw;
  }
  if (raw.endsWith('/api')) {
    return `${raw}/v1`;
  }
  return `${raw}/api/v1`;
}

export const API_BASE = resolveApiBaseUrl();

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const response = await fetch(`${API_BASE}${normalizedEndpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg =
      data?.message ||
      (response.status === 404
        ? `API endpoint not found (${normalizedEndpoint}). Verify backend URL configuration.`
        : `Request failed with status ${response.status}`);
    if (response.status === 401 && !normalizedEndpoint.includes('/auth/login')) {
      // Session expired
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Health & Diagnostics
  checkHealth: () => request<any>('/health'),

  // Auth
  register: (body: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request<any>('/auth/me'),
  logout: () => request<any>('/auth/logout', { method: 'POST' }),

  // Candidates
  getCandidateProfile: () => request<any>('/candidates/profile'),
  updateCandidateProfile: (body: any) => request<any>('/candidates/profile', { method: 'PUT', body: JSON.stringify(body) }),
  parseCv: (rawText: string) => request<any>('/candidates/parse-cv', { method: 'POST', body: JSON.stringify({ rawText }) }),
  getSkillGapAnalysis: (jobId: string) => request<any>(`/candidates/skill-gap/${jobId}`),
  exportCandidateData: () => request<any>('/candidates/export-data'),
  deleteCandidateAccount: () => request<any>('/candidates/account', { method: 'DELETE' }),
  searchCandidates: (params: string = '') => request<any>(`/candidates/search?${params}`),
  getCandidateById: (id: string) => request<any>(`/candidates/${id}`),
  getPlacedCandidates: () => request<any>('/candidates/placed'),

  // Assessments
  getAssessmentQuestions: () => request<any>('/assessments/questions'),
  submitAssessment: (answers: any[]) => request<any>('/assessments/submit', { method: 'POST', body: JSON.stringify({ answers }) }),
  getMyAssessmentResults: () => request<any>('/assessments/my-results'),

  // Jobs
  getJobs: (query: string = '') => request<any>(`/jobs?${query}`),
  getJobById: (id: string) => request<any>(`/jobs/${id}`),
  analyzeJobInclusivity: (body: any) => request<any>('/jobs/analyze-inclusivity', { method: 'POST', body: JSON.stringify(body) }),
  createJob: (body: any) => request<any>('/jobs', { method: 'POST', body: JSON.stringify(body) }),
  updateJob: (id: string, body: any) => request<any>(`/jobs/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  toggleJobStatus: (id: string, status: string) => request<any>(`/jobs/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  deleteJob: (id: string) => request<any>(`/jobs/${id}`, { method: 'DELETE' }),
  getEmployerJobs: () => request<any>('/jobs/employer/my-jobs'),
  toggleSaveJob: (id: string) => request<any>(`/jobs/${id}/save`, { method: 'POST' }),
  getSavedJobs: () => request<any>('/jobs/candidate/saved'),

  // Applications
  applyToJob: (body: any) => request<any>('/applications', { method: 'POST', body: JSON.stringify(body) }),
  getMyApplications: () => request<any>('/applications/my-applications'),
  getJobApplications: (query: string = '') => request<any>(`/applications/job-applications?${query}`),
  updateApplicationStatus: (id: string, status: string, note?: string) => request<any>(`/applications/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, note }) }),
  addEmployerNote: (id: string, note: string) => request<any>(`/applications/${id}/notes`, { method: 'POST', body: JSON.stringify({ note }) }),
  requestApplicationFeedback: (id: string) => request<any>(`/applications/${id}/request-feedback`, { method: 'POST' }),
  submitStructuredFeedback: (id: string, body: any) => request<any>(`/applications/${id}/feedback`, { method: 'POST', body: JSON.stringify(body) }),
  updateAccommodationChecklist: (id: string, checklist: any[]) => request<any>(`/applications/${id}/checklist`, { method: 'PATCH', body: JSON.stringify({ checklist }) }),
  withdrawApplication: (id: string) => request<any>(`/applications/${id}/withdraw`, { method: 'POST' }),

  // Interviews
  scheduleInterview: (body: any) => request<any>('/interviews', { method: 'POST', body: JSON.stringify(body) }),
  requestPracticeInterview: (body: any = {}) =>
    request<any>('/interviews/request-practice', { method: 'POST', body: JSON.stringify(body) }),
  getMyInterviews: () => request<any>('/interviews/my-interviews'),
  updateInterviewStatus: (id: string, status: string, notes?: string, evaluationRubric?: any) =>
    request<any>(`/interviews/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, notes, evaluationRubric }) }),

  // Messages
  getConversations: () => request<any>('/messages/conversations'),
  getMessageContacts: () => request<any>('/messages/contacts'),
  getMessages: (conversationId: string) => request<any>(`/messages/conversations/${conversationId}`),
  sendMessage: (body: any) => request<any>('/messages/send', { method: 'POST', body: JSON.stringify(body) }),

  // Notifications
  getNotifications: () => request<any>('/notifications'),
  markNotificationAsRead: (id: string) => request<any>(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsAsRead: () => request<any>('/notifications/read-all', { method: 'PATCH' }),

  // Emails & Outbox Vault
  getMyEmails: () => request<any>('/emails/my-emails'),
  sendTestEmail: (toEmail?: string) =>
    request<any>('/emails/send-test', { method: 'POST', body: JSON.stringify({ toEmail }) }),
  sendInterviewPacketEmail: (body: { interviewId?: string; toEmail?: string; jobTitle?: string; companyName?: string }) =>
    request<any>('/emails/send-interview-packet', { method: 'POST', body: JSON.stringify(body) }),
  sendPassportEmail: (toEmail?: string) =>
    request<any>('/emails/send-passport', { method: 'POST', body: JSON.stringify({ toEmail }) }),
  sendCustomEmail: (body: { toEmail: string; toName?: string; subject: string; messageBody: string }) =>
    request<any>('/emails/send-custom', { method: 'POST', body: JSON.stringify(body) }),

  // Resources
  getResources: (category: string = '') => request<any>(`/resources?category=${category}`),
  getResourceBySlug: (slug: string) => request<any>(`/resources/${slug}`),
  createResource: (body: any) => request<any>('/resources', { method: 'POST', body: JSON.stringify(body) }),
  deleteResource: (id: string) => request<any>(`/resources/${id}`, { method: 'DELETE' }),

  // Employer
  getEmployerProfile: () => request<any>('/employers/profile'),
  updateEmployerProfile: (body: any) => request<any>('/employers/profile', { method: 'PUT', body: JSON.stringify(body) }),
  getEmployerDashboardStats: () => request<any>('/employers/dashboard/stats'),

  // Admin & Accessibility Feedback
  submitAccessibilityReport: (body: any) => request<any>('/feedback/accessibility', { method: 'POST', body: JSON.stringify(body) }),
  getAdminStats: () => request<any>('/admin/stats'),
  getAdminUsers: (query: string = '') => request<any>(`/admin/users?${query}`),
  toggleUserStatus: (id: string) => request<any>(`/admin/users/${id}/status`, { method: 'PATCH' }),
  getAdminJobs: () => request<any>('/admin/jobs'),
  toggleAdminJobStatus: (id: string, status: string) => request<any>(`/admin/jobs/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  deleteAdminJob: (id: string) => request<any>(`/admin/jobs/${id}`, { method: 'DELETE' }),
  getAdminApplications: () => request<any>('/admin/applications'),
  getAdminAccessibilityReports: () => request<any>('/admin/accessibility-reports'),
  updateAdminAccessibilityReport: (id: string, body: any) =>
    request<any>(`/admin/accessibility-reports/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  toggleEmployerVerification: (id: string) => request<any>(`/admin/employers/${id}/verify`, { method: 'PATCH' }),
};

