import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  password: string; // bcrypt hash
  createdAt: string;
}

export interface SubjectRecord {
  id: string;
  name: string;
  color?: string;
  userId: string;
  createdAt: string;
}

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface TaskRecord {
  id: string;
  title: string;
  description?: string;
  dueDate: string; // ISO string
  priority: Priority;
  completed: boolean;
  subjectId: string;
  createdAt: string;
}

interface DatabaseSchema {
  users: UserRecord[];
  subjects: SubjectRecord[];
  tasks: TaskRecord[];
}

const DATA_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'study_planner_db.json');

function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  fs.mkdirSync(dirname, { recursive: true });
}

class Database {
  private data: DatabaseSchema = {
    users: [],
    subjects: [],
    tasks: [],
  };

  constructor() {
    this.load();
  }

  private load() {
    try {
      ensureDirectoryExistence(DB_FILE);
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.save();
      }
    } catch (err) {
      console.error('Failed to load database, initializing fresh state:', err);
      this.data = { users: [], subjects: [], tasks: [] };
      this.save();
    }
  }

  private save() {
    try {
      ensureDirectoryExistence(DB_FILE);
      const tempPath = `${DB_FILE}.${crypto.randomBytes(4).toString('hex')}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('Failed to save database atomically:', err);
    }
  }

  // --- Users ---
  findUserByEmail(email: string): UserRecord | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id: string): UserRecord | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  createUser(user: Omit<UserRecord, 'id' | 'createdAt'>): UserRecord {
    const record: UserRecord = {
      id: crypto.randomUUID(),
      ...user,
      createdAt: new Date().toISOString(),
    };
    this.data.users.push(record);
    this.save();
    return record;
  }

  // --- Subjects ---
  findSubjectsByUserId(userId: string): SubjectRecord[] {
    return this.data.subjects.filter((s) => s.userId === userId);
  }

  findSubjectById(id: string): SubjectRecord | undefined {
    return this.data.subjects.find((s) => s.id === id);
  }

  createSubject(subject: Omit<SubjectRecord, 'id' | 'createdAt'>): SubjectRecord {
    const record: SubjectRecord = {
      id: crypto.randomUUID(),
      ...subject,
      createdAt: new Date().toISOString(),
    };
    this.data.subjects.push(record);
    this.save();
    return record;
  }

  updateSubject(id: string, userId: string, updates: Partial<Pick<SubjectRecord, 'name' | 'color'>>): SubjectRecord | null {
    const index = this.data.subjects.findIndex((s) => s.id === id && s.userId === userId);
    if (index === -1) return null;

    this.data.subjects[index] = {
      ...this.data.subjects[index],
      ...updates,
    };
    this.save();
    return this.data.subjects[index];
  }

  deleteSubject(id: string, userId: string): boolean {
    const index = this.data.subjects.findIndex((s) => s.id === id && s.userId === userId);
    if (index === -1) return false;

    // Relational Cascade Delete: Remove all tasks under this subject
    this.data.tasks = this.data.tasks.filter((t) => t.subjectId !== id);
    this.data.subjects.splice(index, 1);
    this.save();
    return true;
  }

  // --- Tasks ---
  findTasksByUser(userId: string): (TaskRecord & { subjectName: string; subjectColor?: string })[] {
    const userSubjectIds = new Set(this.data.subjects.filter((s) => s.userId === userId).map((s) => s.id));
    const subjectMap = new Map(this.data.subjects.map((s) => [s.id, s]));

    return this.data.tasks
      .filter((t) => userSubjectIds.has(t.subjectId))
      .map((t) => {
        const sub = subjectMap.get(t.subjectId);
        return {
          ...t,
          subjectName: sub ? sub.name : 'Unknown Subject',
          subjectColor: sub?.color || '#3B82F6',
        };
      });
  }

  findTaskById(id: string, userId: string): TaskRecord | null {
    const userSubjectIds = new Set(this.data.subjects.filter((s) => s.userId === userId).map((s) => s.id));
    const task = this.data.tasks.find((t) => t.id === id);
    if (!task || !userSubjectIds.has(task.subjectId)) return null;
    return task;
  }

  createTask(task: Omit<TaskRecord, 'id' | 'createdAt'>): TaskRecord {
    const record: TaskRecord = {
      id: crypto.randomUUID(),
      ...task,
      createdAt: new Date().toISOString(),
    };
    this.data.tasks.push(record);
    this.save();
    return record;
  }

  updateTask(id: string, userId: string, updates: Partial<Omit<TaskRecord, 'id' | 'createdAt'>>): TaskRecord | null {
    const userSubjectIds = new Set(this.data.subjects.filter((s) => s.userId === userId).map((s) => s.id));
    const index = this.data.tasks.findIndex((t) => t.id === id && userSubjectIds.has(t.subjectId));
    if (index === -1) return null;

    // If changing subjectId, ensure the new subject also belongs to the user
    if (updates.subjectId && !userSubjectIds.has(updates.subjectId)) {
      return null;
    }

    this.data.tasks[index] = {
      ...this.data.tasks[index],
      ...updates,
    };
    this.save();
    return this.data.tasks[index];
  }

  deleteTask(id: string, userId: string): boolean {
    const userSubjectIds = new Set(this.data.subjects.filter((s) => s.userId === userId).map((s) => s.id));
    const index = this.data.tasks.findIndex((t) => t.id === id && userSubjectIds.has(t.subjectId));
    if (index === -1) return false;

    this.data.tasks.splice(index, 1);
    this.save();
    return true;
  }

  // Count helper
  getSubjectStats(userId: string) {
    const userSubjects = this.findSubjectsByUserId(userId);
    const userTasks = this.findTasksByUser(userId);

    return userSubjects.map((sub) => {
      const subTasks = userTasks.filter((t) => t.subjectId === sub.id);
      const completedCount = subTasks.filter((t) => t.completed).length;
      return {
        ...sub,
        totalTasks: subTasks.length,
        completedTasks: completedCount,
        pendingTasks: subTasks.length - completedCount,
      };
    });
  }
}

export const db = new Database();
