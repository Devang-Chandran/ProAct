import { User, Subject, Task, Stats, Priority, TaskFilterOptions, AiBreakdownResult } from '../types.ts';

const TOKEN_KEY = 'study_planner_jwt';

export const authStorage = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },
  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  },
};

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = authStorage.getToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (options.body && typeof options.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    // If token invalid, purge and redirect to login state
    authStorage.clearToken();
  }

  if (!res.ok) {
    let errorMessage = `Request failed (${res.status})`;
    try {
      const errJson = await res.json();
      if (errJson.error) errorMessage = errJson.error;
    } catch {}
    throw new Error(errorMessage);
  }

  return res.json();
}

export const api = {
  // Auth
  async signup(name: string, email: string, password: string): Promise<{ user: User; token: string }> {
    const data = await fetchWithAuth('/api/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    if (data.token) authStorage.setToken(data.token);
    return data;
  },

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const data = await fetchWithAuth('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) authStorage.setToken(data.token);
    return data;
  },

  async logout(): Promise<void> {
    try {
      await fetchWithAuth('/api/logout', { method: 'POST' });
    } finally {
      authStorage.clearToken();
    }
  },

  async getMe(): Promise<{ user: User }> {
    return fetchWithAuth('/api/me');
  },

  // Subjects
  async getSubjects(): Promise<Subject[]> {
    return fetchWithAuth('/api/subjects');
  },

  async createSubject(name: string, color?: string): Promise<Subject> {
    return fetchWithAuth('/api/subjects', {
      method: 'POST',
      body: JSON.stringify({ name, color }),
    });
  },

  async updateSubject(id: string, name?: string, color?: string): Promise<Subject> {
    return fetchWithAuth(`/api/subjects/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, color }),
    });
  },

  async deleteSubject(id: string): Promise<{ success: boolean }> {
    return fetchWithAuth(`/api/subjects/${id}`, {
      method: 'DELETE',
    });
  },

  // Tasks
  async getTasks(filters?: Partial<TaskFilterOptions>): Promise<Task[]> {
    const params = new URLSearchParams();
    if (filters?.subjectId && filters.subjectId !== 'all') params.set('subjectId', filters.subjectId);
    if (filters?.completed && filters.completed !== 'all') {
      params.set('completed', filters.completed === 'completed' ? 'true' : 'false');
    }
    if (filters?.priority && filters.priority !== 'all') params.set('priority', filters.priority);
    if (filters?.search) params.set('search', filters.search);
    if (filters?.sortBy) params.set('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.set('sortOrder', filters.sortOrder);

    const query = params.toString();
    return fetchWithAuth(`/api/tasks${query ? `?${query}` : ''}`);
  },

  async getUpcomingTasks(days: number = 7): Promise<Task[]> {
    return fetchWithAuth(`/api/tasks/upcoming?days=${days}`);
  },

  async getStats(): Promise<Stats> {
    return fetchWithAuth('/api/stats');
  },

  async createTask(data: {
    title: string;
    description?: string;
    dueDate: string;
    priority: Priority;
    subjectId: string;
  }): Promise<Task> {
    return fetchWithAuth('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateTask(id: string, data: Partial<{
    title: string;
    description: string;
    dueDate: string;
    priority: Priority;
    completed: boolean;
    subjectId: string;
  }>): Promise<Task> {
    return fetchWithAuth(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteTask(id: string): Promise<{ success: boolean }> {
    return fetchWithAuth(`/api/tasks/${id}`, {
      method: 'DELETE',
    });
  },

  // AI Assistant
  async getAiBreakdown(data: { title: string; description?: string; subjectName?: string }): Promise<AiBreakdownResult> {
    return fetchWithAuth('/api/ai/breakdown-task', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
