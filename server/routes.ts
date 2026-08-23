import express, { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from './db.ts';
import { generateToken, requireAuth, AuthenticatedRequest } from './auth.ts';
import { GoogleGenAI } from '@google/genai';

export const apiRouter = Router();

// ==========================================
// 1. AUTHENTICATION ENDPOINTS
// ==========================================

// POST /api/signup
apiRouter.post('/signup', async (req: express.Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ error: 'Name is required.' });
      return;
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      res.status(400).json({ error: 'A valid email address is required.' });
      return;
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = db.findUserByEmail(normalizedEmail);
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = db.createUser({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    // Create a starter default subject for easy onboarding
    db.createSubject({
      name: 'General Studies',
      color: '#3B82F6',
      userId: user.id,
    });

    const token = generateToken({ userId: user.id, email: user.email });

    // Set HTTP-only cookie
    res.cookie('study_auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (err: any) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// POST /api/login
apiRouter.post('/login', async (req: express.Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = db.findUserByEmail(normalizedEmail);
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = generateToken({ userId: user.id, email: user.email });

    res.cookie('study_auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// POST /api/logout
apiRouter.post('/logout', (_req: express.Request, res: Response): void => {
  res.clearCookie('study_auth_token');
  res.json({ success: true, message: 'Logged out successfully.' });
});

// GET /api/me
apiRouter.get('/me', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const user = db.findUserById(req.userId!);
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
  });
});

// ==========================================
// 2. SUBJECTS ENDPOINTS
// ==========================================

// GET /api/subjects
apiRouter.get('/subjects', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const subjectsWithStats = db.getSubjectStats(req.userId!);
  res.json(subjectsWithStats);
});

// POST /api/subjects
apiRouter.post('/subjects', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const { name, color } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    res.status(400).json({ error: 'Subject name is required.' });
    return;
  }

  const subject = db.createSubject({
    name: name.trim(),
    color: color || '#3B82F6',
    userId: req.userId!,
  });

  res.status(201).json(subject);
});

// PUT /api/subjects/:id
apiRouter.put('/subjects/:id', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const { name, color } = req.body;

  const updates: { name?: string; color?: string } = {};
  if (name && typeof name === 'string') updates.name = name.trim();
  if (color && typeof color === 'string') updates.color = color.trim();

  const updated = db.updateSubject(id, req.userId!, updates);
  if (!updated) {
    res.status(404).json({ error: 'Subject not found or unauthorized.' });
    return;
  }

  res.json(updated);
});

// DELETE /api/subjects/:id
apiRouter.delete('/subjects/:id', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const success = db.deleteSubject(id, req.userId!);
  if (!success) {
    res.status(404).json({ error: 'Subject not found or unauthorized.' });
    return;
  }

  res.json({ success: true, message: 'Subject and all associated tasks removed.' });
});

// ==========================================
// 3. TASKS (ASSIGNMENTS) ENDPOINTS
// ==========================================

// GET /api/tasks
apiRouter.get('/tasks', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  let tasks = db.findTasksByUser(req.userId!);

  const { subjectId, completed, search, priority, sortBy, sortOrder } = req.query;

  // Filter by subject
  if (subjectId && typeof subjectId === 'string' && subjectId !== 'all') {
    tasks = tasks.filter((t) => t.subjectId === subjectId);
  }

  // Filter by completed
  if (completed !== undefined && completed !== 'all') {
    const isCompleted = completed === 'true' || completed === '1';
    tasks = tasks.filter((t) => t.completed === isCompleted);
  }

  // Filter by priority
  if (priority && typeof priority === 'string' && priority !== 'all') {
    tasks = tasks.filter((t) => t.priority.toUpperCase() === priority.toUpperCase());
  }

  // Search by title or description
  if (search && typeof search === 'string' && search.trim().length > 0) {
    const query = search.trim().toLowerCase();
    tasks = tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(query) ||
        (t.description && t.description.toLowerCase().includes(query)) ||
        t.subjectName.toLowerCase().includes(query)
    );
  }

  // Sorting
  const order = sortOrder === 'desc' ? -1 : 1;
  if (sortBy === 'priority') {
    const priorityWeight: Record<string, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    tasks.sort((a, b) => (priorityWeight[b.priority] - priorityWeight[a.priority]) * order);
  } else if (sortBy === 'createdAt') {
    tasks.sort((a, b) => (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * order);
  } else if (sortBy === 'title') {
    tasks.sort((a, b) => a.title.localeCompare(b.title) * order);
  } else {
    // Default: by dueDate ascending
    tasks.sort((a, b) => (new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()) * order);
  }

  res.json(tasks);
});

// GET /api/tasks/upcoming
apiRouter.get('/tasks/upcoming', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const days = parseInt((req.query.days as string) || '7', 10);
  const now = new Date();
  
  // Set start of today
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  
  // End date calculation
  const endDate = new Date(startOfToday);
  endDate.setDate(endDate.getDate() + days);
  endDate.setHours(23, 59, 59, 999);

  const allTasks = db.findTasksByUser(req.userId!);
  
  // Upcoming tasks that are not yet completed and due between now/overdue up to endDate
  const upcoming = allTasks
    .filter((t) => {
      const due = new Date(t.dueDate);
      return !t.completed && due <= endDate;
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  res.json(upcoming);
});

// GET /api/stats
apiRouter.get('/stats', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const tasks = db.findTasksByUser(req.userId!);
  const subjects = db.findSubjectsByUserId(req.userId!);

  const now = new Date();
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;

  const overdue = tasks.filter((t) => {
    return !t.completed && new Date(t.dueDate) < now;
  }).length;

  const dueToday = tasks.filter((t) => {
    if (t.completed) return false;
    const due = new Date(t.dueDate);
    return (
      due.getDate() === now.getDate() &&
      due.getMonth() === now.getMonth() &&
      due.getFullYear() === now.getFullYear()
    );
  }).length;

  const highPriorityPending = tasks.filter((t) => !t.completed && t.priority === 'HIGH').length;

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  res.json({
    total,
    completed,
    pending,
    overdue,
    dueToday,
    highPriorityPending,
    completionRate,
    subjectCount: subjects.length,
  });
});

// POST /api/tasks
apiRouter.post('/tasks', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const { title, description, dueDate, priority, subjectId } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    res.status(400).json({ error: 'Task title is required.' });
    return;
  }

  if (!subjectId) {
    res.status(400).json({ error: 'Subject ID is required.' });
    return;
  }

  // Ensure subject belongs to this user
  const userSubjects = db.findSubjectsByUserId(req.userId!);
  const subject = userSubjects.find((s) => s.id === subjectId);
  if (!subject) {
    res.status(400).json({ error: 'Invalid subject or subject does not belong to you.' });
    return;
  }

  if (!dueDate) {
    res.status(400).json({ error: 'Due date is required.' });
    return;
  }

  const validPriorities = ['LOW', 'MEDIUM', 'HIGH'];
  const validatedPriority = validPriorities.includes(priority) ? priority : 'MEDIUM';

  const task = db.createTask({
    title: title.trim(),
    description: description ? description.trim() : undefined,
    dueDate: new Date(dueDate).toISOString(),
    priority: validatedPriority,
    completed: false,
    subjectId,
  });

  res.status(201).json({
    ...task,
    subjectName: subject.name,
    subjectColor: subject.color || '#3B82F6',
  });
});

// PUT /api/tasks/:id
apiRouter.put('/tasks/:id', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const updates: any = {};

  if (req.body.title !== undefined) updates.title = req.body.title.trim();
  if (req.body.description !== undefined) updates.description = req.body.description?.trim();
  if (req.body.dueDate !== undefined) updates.dueDate = new Date(req.body.dueDate).toISOString();
  if (req.body.priority !== undefined) updates.priority = req.body.priority;
  if (req.body.completed !== undefined) updates.completed = Boolean(req.body.completed);
  if (req.body.subjectId !== undefined) updates.subjectId = req.body.subjectId;

  const updated = db.updateTask(id, req.userId!, updates);
  if (!updated) {
    res.status(404).json({ error: 'Task not found or unauthorized.' });
    return;
  }

  const subject = db.findSubjectById(updated.subjectId);
  res.json({
    ...updated,
    subjectName: subject?.name || 'Unknown Subject',
    subjectColor: subject?.color || '#3B82F6',
  });
});

// DELETE /api/tasks/:id
apiRouter.delete('/tasks/:id', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const success = db.deleteTask(id, req.userId!);
  if (!success) {
    res.status(404).json({ error: 'Task not found or unauthorized.' });
    return;
  }

  res.json({ success: true, message: 'Task deleted successfully.' });
});

// ==========================================
// 4. AI STUDY ASSISTANT (GEMINI INTEGRATION)
// ==========================================
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

apiRouter.post('/ai/breakdown-task', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { title, description, subjectName } = req.body;
    if (!title) {
      res.status(400).json({ error: 'Task title is required.' });
      return;
    }

    const ai = getAI();
    if (!ai) {
      // Graceful fallback if no key provided
      res.json({
        steps: [
          `Review syllabus and grading rubric for ${title}`,
          `Gather required textbooks, notes, and reference materials`,
          `Outline key sections and draft initial work`,
          `Refine, verify calculations / citations, and finalize submission`,
        ],
        estimatedMinutes: 90,
        studyTips: 'Use 25-minute focused Pomodoro intervals with 5-minute active recall breaks.',
      });
      return;
    }

    const prompt = `You are an expert academic study coach.
The student has an assignment:
- Subject: "${subjectName || 'Academic Course'}"
- Assignment Title: "${title}"
- Description: "${description || 'None provided'}"

Provide a concise, practical 4-5 step study action plan to complete this assignment efficiently, an estimated total study time in minutes, and one actionable evidence-based study tip.
Respond ONLY with a valid JSON object matching this schema:
{
  "steps": ["step 1...", "step 2...", "step 3...", "step 4..."],
  "estimatedMinutes": 120,
  "studyTips": "brief study strategy tip"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('AI Breakdown error:', err);
    res.status(500).json({
      error: 'Failed to generate study breakdown',
      fallbackSteps: [
        'Break assignment into manageable chunks',
        'Draft first revision',
        'Final proofread and review',
      ],
    });
  }
});
