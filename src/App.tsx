import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { ViewMode, Subject, Task, Stats, Priority, AiBreakdownResult } from './types.ts';
import { api } from './lib/api.ts';
import { Navbar } from './components/Navbar.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { TasksView } from './components/TasksView.tsx';
import { SubjectsView } from './components/SubjectsView.tsx';
import { CalendarView } from './components/CalendarView.tsx';
import { TaskModal } from './components/TaskModal.tsx';
import { SubjectModal } from './components/SubjectModal.tsx';
import { AiBreakdownModal } from './components/AiBreakdownModal.tsx';
import { AuthScreen } from './components/AuthScreen.tsx';

function MainApp() {
  const { user, isLoading: isAuthLoading } = useAuth();

  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('study_planner_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Data state
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(false);

  // Subject filter for tasks view
  const [activeSubjectFilter, setActiveSubjectFilter] = useState<string>('all');

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskModalDefaultSubjectId, setTaskModalDefaultSubjectId] = useState<string | undefined>();

  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiModalLoading, setAiModalLoading] = useState(false);
  const [aiModalResult, setAiModalResult] = useState<AiBreakdownResult | null>(null);
  const [aiModalTaskTitle, setAiModalTaskTitle] = useState('');
  const [aiModalTargetTask, setAiModalTargetTask] = useState<Task | null>(null);

  // Apply dark mode class
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('study_planner_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('study_planner_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  // Fetch all core data
  const refreshData = useCallback(async () => {
    if (!user) return;
    try {
      setIsDataLoading(true);
      const [fetchedSubjects, fetchedTasks, fetchedUpcoming, fetchedStats] = await Promise.all([
        api.getSubjects(),
        api.getTasks(),
        api.getUpcomingTasks(7),
        api.getStats(),
      ]);

      setSubjects(fetchedSubjects);
      setTasks(fetchedTasks);
      setUpcomingTasks(fetchedUpcoming);
      setStats(fetchedStats);
    } catch (err) {
      console.error('Failed to load study data:', err);
    } finally {
      setIsDataLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user, refreshData]);

  // Handlers for Tasks
  const handleToggleTask = async (taskId: string, currentCompleted: boolean) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !currentCompleted } : t))
    );
    setUpcomingTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !currentCompleted } : t))
    );

    try {
      await api.updateTask(taskId, { completed: !currentCompleted });
      // Re-fetch stats and list
      const [fetchedStats, fetchedUpcoming] = await Promise.all([
        api.getStats(),
        api.getUpcomingTasks(7),
      ]);
      setStats(fetchedStats);
      setUpcomingTasks(fetchedUpcoming);
    } catch (err) {
      console.error('Error toggling task:', err);
      // Rollback
      refreshData();
    }
  };

  const handleSaveTask = async (taskData: {
    title: string;
    description?: string;
    dueDate: string;
    priority: Priority;
    subjectId: string;
  }) => {
    if (editingTask) {
      await api.updateTask(editingTask.id, taskData);
    } else {
      await api.createTask(taskData);
    }
    await refreshData();
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.deleteTask(taskId);
      await refreshData();
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const handleQuickAddTask = async (data: {
    title: string;
    dueDate: string;
    subjectId: string;
    priority: Priority;
  }) => {
    await api.createTask({
      title: data.title,
      dueDate: data.dueDate,
      subjectId: data.subjectId,
      priority: data.priority,
    });
    await refreshData();
  };

  // Handlers for Subjects
  const handleSaveSubject = async (data: { name: string; color?: string }) => {
    if (editingSubject) {
      await api.updateSubject(editingSubject.id, data.name, data.color);
    } else {
      await api.createSubject(data.name, data.color);
    }
    await refreshData();
  };

  const handleDeleteSubject = async (subjectId: string) => {
    await api.deleteSubject(subjectId);
    await refreshData();
  };

  // AI Breakdown trigger
  const handleTriggerAiBreakdown = async (taskOrDraft: {
    id?: string;
    title: string;
    description?: string;
    subjectName?: string;
  }) => {
    setIsAiModalOpen(true);
    setAiModalLoading(true);
    setAiModalTaskTitle(taskOrDraft.title);
    setAiModalResult(null);

    const fullTask = taskOrDraft.id ? tasks.find((t) => t.id === taskOrDraft.id) : null;
    setAiModalTargetTask(fullTask || null);

    try {
      const result = await api.getAiBreakdown({
        title: taskOrDraft.title,
        description: taskOrDraft.description,
        subjectName: taskOrDraft.subjectName,
      });
      setAiModalResult(result);
    } catch (err) {
      console.error('AI breakdown generation error:', err);
    } finally {
      setAiModalLoading(false);
    }
  };

  const handleApplyAiStepsToTask = async (formattedSteps: string) => {
    if (aiModalTargetTask) {
      const existingDesc = aiModalTargetTask.description ? `${aiModalTargetTask.description}\n\n` : '';
      const newDesc = `${existingDesc}--- AI Study Breakdown ---\n${formattedSteps}`;
      await api.updateTask(aiModalTargetTask.id, { description: newDesc });
      await refreshData();
    }
  };

  // Navigation shortcuts
  const handleViewSubjectTasks = (subjectId: string) => {
    setActiveSubjectFilter(subjectId);
    setCurrentView('tasks');
  };

  const handleAddTaskToSubject = (subjectId: string) => {
    setEditingTask(null);
    setTaskModalDefaultSubjectId(subjectId);
    setIsTaskModalOpen(true);
  };

  const handleOpenNewTaskForDate = (dateStr: string) => {
    setEditingTask(null);
    setTaskModalDefaultSubjectId(subjects[0]?.id);
    setIsTaskModalOpen(true);
  };

  // If loading auth state
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
          Loading Study Planner...
        </p>
      </div>
    );
  }

  // If unauthenticated
  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-[#FAF7EE] dark:bg-[#121214] text-black dark:text-white transition-colors flex flex-col selection:bg-yellow-300 selection:text-black font-mono-retro">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onViewChange={(view) => {
          if (view === 'tasks') setActiveSubjectFilter('all');
          setCurrentView(view);
        }}
        onOpenNewTask={() => {
          setEditingTask(null);
          setTaskModalDefaultSubjectId(undefined);
          setIsTaskModalOpen(true);
        }}
        onOpenNewSubject={() => {
          setEditingSubject(null);
          setIsSubjectModalOpen(true);
        }}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        stats={stats}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentView === 'dashboard' && (
          <DashboardView
            stats={stats}
            upcomingTasks={upcomingTasks}
            subjects={subjects}
            onToggleTask={handleToggleTask}
            onEditTask={(task) => {
              setEditingTask(task);
              setIsTaskModalOpen(true);
            }}
            onDeleteTask={handleDeleteTask}
            onQuickAddTask={handleQuickAddTask}
            onOpenNewTask={() => {
              setEditingTask(null);
              setTaskModalDefaultSubjectId(undefined);
              setIsTaskModalOpen(true);
            }}
            onOpenNewSubject={() => {
              setEditingSubject(null);
              setIsSubjectModalOpen(true);
            }}
            onViewSubjectTasks={handleViewSubjectTasks}
            onViewAllTasks={() => {
              setActiveSubjectFilter('all');
              setCurrentView('tasks');
            }}
            onTriggerAiBreakdown={handleTriggerAiBreakdown}
            userName={user.name}
          />
        )}

        {currentView === 'tasks' && (
          <TasksView
            tasks={tasks}
            subjects={subjects}
            onToggleTask={handleToggleTask}
            onEditTask={(task) => {
              setEditingTask(task);
              setIsTaskModalOpen(true);
            }}
            onDeleteTask={handleDeleteTask}
            onOpenNewTask={() => {
              setEditingTask(null);
              setTaskModalDefaultSubjectId(activeSubjectFilter !== 'all' ? activeSubjectFilter : undefined);
              setIsTaskModalOpen(true);
            }}
            onTriggerAiBreakdown={handleTriggerAiBreakdown}
            initialSubjectFilter={activeSubjectFilter}
          />
        )}

        {currentView === 'subjects' && (
          <SubjectsView
            subjects={subjects}
            tasks={tasks}
            onOpenNewSubject={() => {
              setEditingSubject(null);
              setIsSubjectModalOpen(true);
            }}
            onEditSubject={(sub) => {
              setEditingSubject(sub);
              setIsSubjectModalOpen(true);
            }}
            onDeleteSubject={handleDeleteSubject}
            onSelectSubject={handleViewSubjectTasks}
            onOpenNewTaskForSubject={handleAddTaskToSubject}
          />
        )}

        {currentView === 'calendar' && (
          <CalendarView
            tasks={tasks}
            subjects={subjects}
            onToggleTask={handleToggleTask}
            onEditTask={(task) => {
              setEditingTask(task);
              setIsTaskModalOpen(true);
            }}
            onDeleteTask={handleDeleteTask}
            onOpenNewTask={() => {
              setEditingTask(null);
              setTaskModalDefaultSubjectId(undefined);
              setIsTaskModalOpen(true);
            }}
            onTriggerAiBreakdown={handleTriggerAiBreakdown}
          />
        )}
      </main>

      {/* Task Create / Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        subjects={subjects}
        initialTask={editingTask}
        defaultSubjectId={taskModalDefaultSubjectId}
        onOpenNewSubject={() => {
          setEditingSubject(null);
          setIsSubjectModalOpen(true);
        }}
        onTriggerAiBreakdown={(draft) => handleTriggerAiBreakdown(draft)}
      />

      {/* Subject Create / Edit Modal */}
      <SubjectModal
        isOpen={isSubjectModalOpen}
        onClose={() => {
          setIsSubjectModalOpen(false);
          setEditingSubject(null);
        }}
        onSave={handleSaveSubject}
        initialSubject={editingSubject}
      />

      {/* AI Breakdown Modal */}
      <AiBreakdownModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        isLoading={aiModalLoading}
        result={aiModalResult}
        taskTitle={aiModalTaskTitle}
        onApplyStepsToDescription={handleApplyAiStepsToTask}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
