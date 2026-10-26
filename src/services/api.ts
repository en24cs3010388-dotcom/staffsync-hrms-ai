const API_BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('staffsync_token');
}

export function setToken(token: string): void {
  localStorage.setItem('staffsync_token', token);
}

export function clearToken(): void {
  localStorage.removeItem('staffsync_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({ message: 'Network response was not JSON' }));

  if (!response.ok) {
    const errorMsg = data?.message || data?.errors?.join(', ') || `HTTP Error ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    request<{ message: string; token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  getMe: () => request<{ user: any }>('/auth/me'),
  logout: () => request<{ message: string }>('/auth/logout', { method: 'POST' }),
};

// Employees API
export const employeesApi = {
  getAll: (params: { search?: string; department?: string; status?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.department) query.append('department', params.department);
    if (params.status) query.append('status', params.status);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<{ count: number; employees: any[] }>(`/employees${qs}`);
  },
  getById: (id: string) => request<{ employee: any }>(`/employees/${id}`),
  create: (employeeData: any) =>
    request<{ message: string; employee: any }>('/employees', {
      method: 'POST',
      body: JSON.stringify(employeeData),
    }),
  update: (id: string, employeeData: any) =>
    request<{ message: string; employee: any }>(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(employeeData),
    }),
  toggleStatus: (id: string) =>
    request<{ message: string; employee: any }>(`/employees/${id}/status`, {
      method: 'PATCH',
    }),
};

// Attendance API
export const attendanceApi = {
  checkIn: () => request<{ message: string; attendance: any }>('/attendance/check-in', { method: 'POST' }),
  checkOut: () => request<{ message: string; attendance: any }>('/attendance/check-out', { method: 'POST' }),
  getTodayStatus: () => request<{ date: string; hasCheckedIn: boolean; hasCheckedOut: boolean; attendance: any }>('/attendance/today'),
  getMyHistory: () => request<{ count: number; records: any[] }>('/attendance/my-history'),
  getAll: (params: { date?: string; search?: string; status?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.date) query.append('date', params.date);
    if (params.search) query.append('search', params.search);
    if (params.status) query.append('status', params.status);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<{ count: number; records: any[] }>(`/attendance/all${qs}`);
  },
};

// Leaves API
export const leavesApi = {
  apply: (data: { leaveType: string; startDate: string; endDate: string; reason: string }) =>
    request<{ message: string; leaveRequest: any }>('/leaves', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getMyLeaves: () => request<{ count: number; requests: any[] }>('/leaves/my-requests'),
  getAll: (params: { status?: string; leaveType?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.leaveType) query.append('leaveType', params.leaveType);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<{ count: number; requests: any[] }>(`/leaves${qs}`);
  },
  updateStatus: (id: string, status: 'Approved' | 'Rejected', reviewNotes?: string) =>
    request<{ message: string; leaveRequest: any }>(`/leaves/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reviewNotes }),
    }),
};

// Announcements API
export const announcementsApi = {
  getAll: (params: { category?: string; status?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.category) query.append('category', params.category);
    if (params.status) query.append('status', params.status);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<{ count: number; announcements: any[] }>(`/announcements${qs}`);
  },
  create: (data: { title: string; content: string; category?: string; priority?: string }) =>
    request<{ message: string; announcement: any }>('/announcements', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    request<{ message: string; announcement: any }>(`/announcements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  toggleArchive: (id: string) =>
    request<{ message: string; announcement: any }>(`/announcements/${id}/archive`, {
      method: 'PATCH',
    }),
};

// Training API
export const trainingApi = {
  getAll: (params: { status?: string; department?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.department) query.append('department', params.department);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<{ count: number; trainings: any[] }>(`/trainings${qs}`);
  },
  getMyEnrollments: () => request<{ count: number; enrollments: any[] }>('/trainings/my-enrollments'),
  create: (data: any) =>
    request<{ message: string; training: any }>('/trainings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    request<{ message: string; training: any }>(`/trainings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  enroll: (id: string) =>
    request<{ message: string; enrollment: any }>(`/trainings/${id}/enroll`, {
      method: 'POST',
    }),
  getParticipants: (id: string) =>
    request<{ training: any; count: number; participants: any[] }>(`/trainings/${id}/participants`),
};

// Dashboard API
export const dashboardApi = {
  getStats: () => request<any>('/dashboard/stats'),
};
