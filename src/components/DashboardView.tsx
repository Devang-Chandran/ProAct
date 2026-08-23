import React, { useState } from 'react';
import { Subject, Task, Stats, Priority } from '../types.ts';
import { formatDueDate, getPriorityBadge } from '../lib/utils.ts';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  BookOpen,
  Plus,
  Calendar,
  Sparkles,
  Check,
  ChevronRight,
  TrendingUp,
  ArrowUpRight,
  Edit2,
  Trash2,
  CalendarDays,
  Target,
  Folder,
  Layers,
  ArrowRight,
  FileCode,
  ListTodo,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DashboardViewProps {
  stats: Stats | null;
  upcomingTasks: Task[];
  subjects: Subject[];
  onToggleTask: (taskId: string, currentCompleted: boolean) => Promise<void>;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => Promise<void>;
  onQuickAddTask: (data: { title: string; dueDate: string; subjectId: string; priority: Priority }) => Promise<void>;
  onOpenNewTask: () => void;
  onOpenNewSubject: () => void;
  onViewSubjectTasks: (subjectId: string) => void;
  onViewAllTasks: () => void;
  onTriggerAiBreakdown: (task: Task) => void;
  userName: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  upcomingTasks,
  subjects,
  onToggleTask,
  onEditTask,
  onDeleteTask,
  onQuickAddTask,
  onOpenNewTask,
  onOpenNewSubject,
  onViewSubjectTasks,
  onViewAllTasks,
  onTriggerAiBreakdown,
  userName,
}) => {
  const [quickTitle, setQuickTitle] = useState('');
  const [quickSubjectId, setQuickSubjectId] = useState(subjects[0]?.id || '');
  const [quickDueDate, setQuickDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [quickPriority, setQuickPriority] = useState<Priority>('MEDIUM');
  const [isQuickSubmitting, setIsQuickSubmitting] = useState(false);

  React.useEffect(() => {
    if (!quickSubjectId && subjects.length > 0) {
      setQuickSubjectId(subjects[0].id);
    }
  }, [subjects, quickSubjectId]);

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim() || !quickSubjectId) return;

    try {
      setIsQuickSubmitting(true);
      const combinedDate = new Date(`${quickDueDate}T23:59:00`);
      await onQuickAddTask({
        title: quickTitle.trim(),
        subjectId: quickSubjectId,
        dueDate: combinedDate.toISOString(),
        priority: quickPriority,
      });
      setQuickTitle('');
    } finally {
      setIsQuickSubmitting(false);
    }
  };

  const handleTaskCheck = async (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!task.completed) {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.7 },
      });
    }
    await onToggleTask(task.id, task.completed);
  };

  const overdueCount = stats?.overdue || 0;
  const completionPercent = stats?.completionRate || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Neo-Brutalist Hero Banner (Image 1 "Hello. I'm Mac." & Image 3 "SOFTWARE DEVELOPER" style) */}
      <div className="p-6 sm:p-8 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] relative overflow-hidden bg-grid-paper">
        {/* Window Top Controls Strip */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b-2 border-black dark:border-white font-mono-retro text-xs">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full border-2 border-black dark:border-white bg-rose-400 inline-block" />
              <span className="w-3 h-3 rounded-full border-2 border-black dark:border-white bg-yellow-400 inline-block" />
              <span className="w-3 h-3 rounded-full border-2 border-black dark:border-white bg-emerald-400 inline-block" />
            </div>
            <span className="font-bold ml-1 text-black dark:text-white">academic_overview.sys</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-yellow-300 dark:bg-yellow-400 text-black border-2 border-black font-bold uppercase text-[10px]">
              Active Term
            </span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-block px-3 py-1 bg-pink-400 text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] font-mono-retro font-black text-xs uppercase tracking-wider">
              Student Terminal // {userName}
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-black dark:text-white tracking-tight uppercase font-mono-retro">
              Hello, {userName.split(' ')[0]}.
            </h1>
            <p className="text-sm font-mono-retro text-zinc-700 dark:text-zinc-300 max-w-xl leading-relaxed">
              {stats?.pending === 0
                ? "You're 100% caught up on all syllabus deadlines. Review your notes or schedule upcoming projects."
                : `You have ${stats?.pending || 0} active assignments across ${stats?.subjectCount || 0} enrolled courses.`}
            </p>
          </div>

          {/* Quick Action Buttons: Neo-Brutalist chunky pills (Image 1 style) */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenNewTask}
              className="px-5 py-3 bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500 text-black font-mono-retro font-bold text-xs border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>[ + ADD ASSIGNMENT ↗ ]</span>
            </button>
            <button
              onClick={onOpenNewSubject}
              className="px-4 py-3 bg-emerald-300 hover:bg-emerald-200 active:bg-emerald-400 text-black font-mono-retro font-bold text-xs border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 stroke-[2.5]" />
              <span>[ + NEW COURSE ↗ ]</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overdue Warning Alert Window (Image 5 [ SYSTEM ALERT ] style) */}
      {overdueCount > 0 && (
        <div className="p-4 bg-rose-200 dark:bg-rose-950/60 border-2 border-black dark:border-rose-400 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#f43f5e] font-mono-retro flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-rose-500 text-white border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#000]">
              <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <p className="text-xs font-black text-black dark:text-white uppercase">
                !! SYSTEM ALERT: {overdueCount} {overdueCount === 1 ? 'ASSIGNMENT IS OVERDUE' : 'ASSIGNMENTS ARE OVERDUE'}
              </p>
              <p className="text-[11px] text-zinc-800 dark:text-zinc-300 mt-0.5">
                Review overdue deliverables immediately and submit them for grading.
              </p>
            </div>
          </div>
          <button
            onClick={onViewAllTasks}
            className="px-3.5 py-1.5 bg-black text-white dark:bg-white dark:text-black border-2 border-black dark:border-white font-bold text-xs shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] cursor-pointer hover:bg-zinc-800 self-start sm:self-auto"
          >
            [ VIEW OVERDUE ]
          </button>
        </div>
      )}

      {/* Quick Links Bar (Image 1 Style: Quick links [Blog ↗] [Projects ↗] [About ↗] [Contact ↗]) */}
      <div>
        <h3 className="font-mono-retro font-bold text-xs uppercase tracking-wider text-black dark:text-white mb-2">
          Quick actions & Navigation
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono-retro text-xs">
          <button
            onClick={onOpenNewTask}
            className="p-3 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] flex items-center justify-between font-bold hover:bg-yellow-100 dark:hover:bg-zinc-800 transition cursor-pointer"
          >
            <span>+ New Task</span>
            <span>↗</span>
          </button>
          <button
            onClick={onOpenNewSubject}
            className="p-3 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] flex items-center justify-between font-bold hover:bg-emerald-100 dark:hover:bg-zinc-800 transition cursor-pointer"
          >
            <span>+ New Course</span>
            <span>↗</span>
          </button>
          <button
            onClick={onViewAllTasks}
            className="p-3 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] flex items-center justify-between font-bold hover:bg-pink-100 dark:hover:bg-zinc-800 transition cursor-pointer"
          >
            <span>All Tasks</span>
            <span>↗</span>
          </button>
          <button
            onClick={() => window.location.hash = '#quickadd'}
            className="p-3 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] flex items-center justify-between font-bold hover:bg-sky-100 dark:hover:bg-zinc-800 transition cursor-pointer"
          >
            <span>Fast Schedule</span>
            <span>↓</span>
          </button>
        </div>
      </div>

      {/* Neo-Brutalist Metric Cards Grid (Image 2 & Image 3 Color Blocks) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Completion Rate (Mustard / Yellow) */}
        <div className="p-4 bg-yellow-300 dark:bg-yellow-400 text-black border-2 border-black shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] font-mono-retro">
          <div className="flex items-center justify-between pb-2 border-b border-black">
            <span className="text-[11px] font-bold uppercase">COMPLETION</span>
            <TrendingUp className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black">{completionPercent}%</span>
            <span className="text-[11px] font-bold">
              ({stats?.completed || 0}/{stats?.total || 0})
            </span>
          </div>
          <div className="w-full h-2.5 bg-white border-2 border-black mt-3 overflow-hidden">
            <div
              className="h-full bg-black transition-all duration-300"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Due in 7 Days (Cyber Mint) */}
        <div className="p-4 bg-emerald-300 dark:bg-emerald-400 text-black border-2 border-black shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] font-mono-retro">
          <div className="flex items-center justify-between pb-2 border-b border-black">
            <span className="text-[11px] font-bold uppercase">NEXT 7 DAYS</span>
            <Clock className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black">{upcomingTasks.length}</span>
            <span className="text-[11px] font-bold">UPCOMING</span>
          </div>
          <p className="text-[11px] font-bold mt-3">
            {upcomingTasks.length === 0 ? 'CALENDAR CLEAR' : 'DEADLINES ON TRACK'}
          </p>
        </div>

        {/* Metric 3: Due Today (Neo Pink) */}
        <div className="p-4 bg-pink-300 dark:bg-pink-400 text-black border-2 border-black shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] font-mono-retro">
          <div className="flex items-center justify-between pb-2 border-b border-black">
            <span className="text-[11px] font-bold uppercase">DUE TODAY</span>
            <Target className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black">{stats?.dueToday || 0}</span>
            <span className="text-[11px] font-bold">TASKS</span>
          </div>
          <p className="text-[11px] font-bold mt-3">
            {stats?.dueToday === 0 ? 'NO DEADLINES TODAY' : 'PRIORITY SUBMISSION'}
          </p>
        </div>

        {/* Metric 4: Enrolled Courses (Sky Cyan) */}
        <div className="p-4 bg-sky-300 dark:bg-sky-400 text-black border-2 border-black shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] font-mono-retro">
          <div className="flex items-center justify-between pb-2 border-b border-black">
            <span className="text-[11px] font-bold uppercase">ENROLLED COURSES</span>
            <BookOpen className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black">{stats?.subjectCount || 0}</span>
            <span className="text-[11px] font-bold">SUBJECTS</span>
          </div>
          <p className="text-[11px] font-bold mt-3">
            {stats?.pending || 0} PENDING IN TOTAL
          </p>
        </div>
      </div>

      {/* Quick Add Bar: Modeled directly after Image 4 (# Paste link to save ... [+]) */}
      {subjects.length > 0 && (
        <form
          id="quickadd"
          onSubmit={handleQuickAdd}
          className="p-4 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] flex flex-col md:flex-row items-center gap-3 font-mono-retro"
        >
          <div className="flex-1 w-full flex items-center gap-2">
            <div className="px-2.5 py-2 bg-yellow-300 dark:bg-yellow-400 text-black font-black text-sm border-2 border-black shrink-0">
              #
            </div>
            <input
              type="text"
              placeholder="Quick schedule assignment title..."
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-[#FAF7EE] dark:bg-zinc-800 text-black dark:text-white border-2 border-black dark:border-white focus:outline-none font-mono-retro font-medium"
            />
          </div>

          <div className="w-full md:w-auto flex flex-wrap sm:flex-nowrap items-center gap-2">
            <select
              value={quickSubjectId}
              onChange={(e) => setQuickSubjectId(e.target.value)}
              className="px-3 py-2 text-xs font-bold border-2 border-black dark:border-white bg-[#FAF7EE] dark:bg-zinc-800 text-black dark:text-white focus:outline-none cursor-pointer"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={quickDueDate}
              onChange={(e) => setQuickDueDate(e.target.value)}
              className="px-2.5 py-2 text-xs font-bold border-2 border-black dark:border-white bg-[#FAF7EE] dark:bg-zinc-800 text-black dark:text-white focus:outline-none"
            />

            <select
              value={quickPriority}
              onChange={(e) => setQuickPriority(e.target.value as Priority)}
              className="px-2.5 py-2 text-xs font-bold border-2 border-black dark:border-white bg-[#FAF7EE] dark:bg-zinc-800 text-black dark:text-white focus:outline-none cursor-pointer"
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MED</option>
              <option value="HIGH">HIGH</option>
            </select>

            <button
              type="submit"
              disabled={isQuickSubmitting || !quickTitle.trim()}
              className="w-10 h-10 bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500 text-black font-black text-lg border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition disabled:opacity-50 cursor-pointer shrink-0"
              title="Add Assignment"
            >
              +
            </button>
          </div>
        </form>
      )}

      {/* Main Content Layout: Upcoming Deadlines (2 cols) + Course Folder Tabs (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Upcoming Deadlines Window */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-black dark:bg-white inline-block" />
              <h2 className="text-base font-black text-black dark:text-white uppercase font-mono-retro">
                Upcoming Deadlines (Next 7 Days)
              </h2>
            </div>
            <button
              onClick={onViewAllTasks}
              className="text-xs font-bold font-mono-retro text-black dark:text-white hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>[ VIEW ALL ↗ ]</span>
            </button>
          </div>

          {upcomingTasks.length === 0 ? (
            <div className="p-8 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] text-center space-y-3 font-mono-retro">
              <div className="w-12 h-12 bg-emerald-300 border-2 border-black flex items-center justify-center mx-auto shadow-[2px_2px_0px_0px_#000]">
                <Check className="w-6 h-6 stroke-[3] text-black" />
              </div>
              <p className="text-sm font-bold text-black dark:text-white uppercase">
                Zero Pending Deadlines in the Next 7 Days
              </p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto">
                No immediate syllabus deliverables due this week. Stay ahead by scheduling new projects.
              </p>
              <button
                onClick={onOpenNewTask}
                className="px-4 py-2 bg-yellow-400 text-black border-2 border-black font-bold text-xs shadow-[2px_2px_0px_0px_#000] cursor-pointer hover:bg-yellow-300"
              >
                + ADD ASSIGNMENT
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingTasks.map((task) => {
                const priorityBadge = getPriorityBadge(task.priority);
                const dueInfo = formatDueDate(task.dueDate, task.completed);

                return (
                  <div
                    key={task.id}
                    className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1.5px_1.5px_0px_0px_#000] transition-all overflow-hidden"
                  >
                    {/* Window File Header Strip */}
                    <div className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 border-b-2 border-black dark:border-white flex items-center justify-between font-mono-retro text-[10px]">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-700 dark:text-zinc-300">
                          {task.subjectName || 'GENERAL'} // task_{task.id.slice(0, 4)}.log
                        </span>
                      </div>
                      <span className={dueInfo.colorClass}>
                        {dueInfo.label}
                      </span>
                    </div>

                    <div className="p-3.5 flex items-center justify-between gap-3">
                      {/* Checkbox + Task Title */}
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <button
                          onClick={(e) => handleTaskCheck(task, e)}
                          className={`w-6 h-6 border-2 border-black dark:border-white flex items-center justify-center shrink-0 transition cursor-pointer ${
                            task.completed
                              ? 'bg-black text-white dark:bg-white dark:text-black'
                              : 'bg-white dark:bg-zinc-800 hover:bg-yellow-300'
                          }`}
                        >
                          {task.completed && <Check className="w-4 h-4 stroke-[3]" />}
                        </button>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span
                              className="px-2 py-0.2 text-[10px] font-mono-retro font-bold border-2 border-black text-black"
                              style={{ backgroundColor: task.subjectColor || '#FACC15' }}
                            >
                              {task.subjectName}
                            </span>

                            <span
                              className={`px-2 py-0.2 text-[10px] font-mono-retro ${priorityBadge.bg} ${priorityBadge.border}`}
                            >
                              [{priorityBadge.shortLabel}]
                            </span>
                          </div>

                          <p
                            className={`text-sm font-bold truncate font-mono-retro ${
                              task.completed
                                ? 'line-through text-zinc-400 dark:text-zinc-500'
                                : 'text-black dark:text-white'
                            }`}
                          >
                            {task.title}
                          </p>

                          {task.description && (
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-1 font-mono-retro">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0 font-mono-retro">
                        <button
                          onClick={() => onTriggerAiBreakdown(task)}
                          title="AI Study Breakdown"
                          className="p-1.5 bg-yellow-300 hover:bg-yellow-200 border-2 border-black text-black shadow-[2px_2px_0px_0px_#000] cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEditTask(task)}
                          title="Edit Task"
                          className="p-1.5 bg-white dark:bg-zinc-800 hover:bg-zinc-100 border-2 border-black dark:border-white text-black dark:text-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteTask(task.id)}
                          title="Delete Task"
                          className="p-1.5 bg-rose-400 hover:bg-rose-300 border-2 border-black text-black shadow-[2px_2px_0px_0px_#000] cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Course Progress Folders (Modeled after Image 4 Folder Tabs) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-black dark:bg-white inline-block" />
              <h2 className="text-base font-black text-black dark:text-white uppercase font-mono-retro">
                Course Folders
              </h2>
            </div>
            <button
              onClick={onOpenNewSubject}
              className="text-xs font-bold font-mono-retro text-black dark:text-white hover:underline cursor-pointer"
            >
              [ + NEW ↗ ]
            </button>
          </div>

          {subjects.length === 0 ? (
            <div className="p-6 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white text-center font-mono-retro">
              <p className="text-xs text-zinc-500">NO COURSES CREATED YET.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {subjects.map((sub) => {
                const total = sub.totalTasks || 0;
                const completed = sub.completedTasks || 0;
                const pending = sub.pendingTasks || 0;
                const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

                return (
                  <div
                    key={sub.id}
                    onClick={() => onViewSubjectTasks(sub.id)}
                    className="relative pt-3 transition-all cursor-pointer group"
                  >
                    {/* Protruding Folder Tab (Image 4 Signature Style) */}
                    <div
                      className="absolute top-0 left-4 px-3 py-1 border-t-2 border-l-2 border-r-2 border-black dark:border-white text-black font-mono-retro font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5"
                      style={{ backgroundColor: sub.color || '#FACC15' }}
                    >
                      <Folder className="w-3 h-3 fill-black" />
                      <span>{sub.name.slice(0, 15)}</span>
                    </div>

                    {/* Folder Card Body */}
                    <div className="p-4 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition font-mono-retro">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-black text-sm text-black dark:text-white uppercase truncate">
                          {sub.name}
                        </h4>
                        <span className="text-xs font-bold px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 border border-black dark:border-white">
                          {total} {total === 1 ? 'task' : 'tasks'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-2">
                        <span>{pending} PENDING</span>
                        <span>{percent}% COMPLETE</span>
                      </div>

                      {/* Neo-brutalist Progress Bar */}
                      <div className="w-full h-3 bg-zinc-100 dark:bg-zinc-800 border-2 border-black dark:border-white overflow-hidden">
                        <div
                          className="h-full transition-all duration-300"
                          style={{
                            width: `${percent}%`,
                            backgroundColor: sub.color || '#FACC15',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
