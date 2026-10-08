const API_BASE = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '');

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data?.message || `Request failed with status ${response.status}`;
    if (response.status === 401 && !endpoint.includes('/auth/login')) {
      // Session expired
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Auth
  register: (body: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request<any>('/auth/me'),
  logout: () => request<any>('/auth/logout', { method: 'POST' }),

  // Candidates
  getCandidateProfile: () => request<any>('/candidates/profile'),
  updateCandidateProfile: (body: any) => request<any>('/candidates/profile', { method: 'PUT', body: JSON.stringify(body) }),
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
  withdrawApplication: (id: string) => request<any>(`/applications/${id}/withdraw`, { method: 'POST' }),

  // Interviews
  scheduleInterview: (body: any) => request<any>('/interviews', { method: 'POST', body: JSON.stringify(body) }),
  getMyInterviews: () => request<any>('/interviews/my-interviews'),
  updateInterviewStatus: (id: string, status: string, notes?: string) => request<any>(`/interviews/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, notes }) }),

  // Messages
  getConversations: () => request<any>('/messages/conversations'),
  getMessages: (conversationId: string) => request<any>(`/messages/conversations/${conversationId}`),
  sendMessage: (body: any) => request<any>('/messages/send', { method: 'POST', body: JSON.stringify(body) }),

  // Notifications
  getNotifications: () => request<any>('/notifications'),
  markNotificationAsRead: (id: string) => request<any>(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsAsRead: () => request<any>('/notifications/read-all', { method: 'PATCH' }),

  // Resources
  getResources: (category: string = '') => request<any>(`/resources?category=${category}`),
  getResourceBySlug: (slug: string) => request<any>(`/resources/${slug}`),
  createResource: (body: any) => request<any>('/resources', { method: 'POST', body: JSON.stringify(body) }),
  deleteResource: (id: string) => request<any>(`/resources/${id}`, { method: 'DELETE' }),

  // Employer
  getEmployerProfile: () => request<any>('/employers/profile'),
  updateEmployerProfile: (body: any) => request<any>('/employers/profile', { method: 'PUT', body: JSON.stringify(body) }),
  getEmployerDashboardStats: () => request<any>('/employers/dashboard/stats'),

  // Admin
  getAdminStats: () => request<any>('/admin/stats'),
  getAdminUsers: (query: string = '') => request<any>(`/admin/users?${query}`),
  toggleUserStatus: (id: string) => request<any>(`/admin/users/${id}/status`, { method: 'PATCH' }),
  getAdminJobs: () => request<any>('/admin/jobs'),
  toggleAdminJobStatus: (id: string, status: string) => request<any>(`/admin/jobs/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  deleteAdminJob: (id: string) => request<any>(`/admin/jobs/${id}`, { method: 'DELETE' }),
  getAdminApplications: () => request<any>('/admin/applications'),
};

