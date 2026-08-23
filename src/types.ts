export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Subject {
  id: string;
  name: string;
  color?: string;
  userId: string;
  createdAt: string;
  totalTasks?: number;
  completedTasks?: number;
  pendingTasks?: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string; // ISO string
  priority: Priority;
  completed: boolean;
  subjectId: string;
  subjectName?: string;
  subjectColor?: string;
  createdAt: string;
}

export interface Stats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  dueToday: number;
  highPriorityPending: number;
  completionRate: number;
  subjectCount: number;
}

export type ViewMode = 'dashboard' | 'tasks' | 'subjects' | 'calendar';

export interface TaskFilterOptions {
  search: string;
  subjectId: string;
  completed: 'all' | 'pending' | 'completed';
  priority: 'all' | 'HIGH' | 'MEDIUM' | 'LOW';
  sortBy: 'dueDate' | 'priority' | 'createdAt' | 'title';
  sortOrder: 'asc' | 'desc';
}

export interface AiBreakdownResult {
  steps: string[];
  estimatedMinutes?: number;
  studyTips?: string;
}
