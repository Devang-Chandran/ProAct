import React, { useState, useMemo } from 'react';
import { Subject, Task, Priority } from '../types.ts';
import { formatDueDate, getPriorityBadge } from '../lib/utils.ts';
import {
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  Check,
  Edit2,
  Trash2,
  Sparkles,
  Calendar,
  Layers,
  BookOpen,
  CheckCircle2,
  Clock,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TasksViewProps {
  tasks: Task[];
  subjects: Subject[];
  onToggleTask: (taskId: string, currentCompleted: boolean) => Promise<void>;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => Promise<void>;
  onOpenNewTask: () => void;
  onTriggerAiBreakdown: (task: Task) => void;
  initialSubjectFilter?: string;
}

type GroupByMode = 'none' | 'subject' | 'priority' | 'status';

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  subjects,
  onToggleTask,
  onEditTask,
  onDeleteTask,
  onOpenNewTask,
  onTriggerAiBreakdown,
  initialSubjectFilter,
}) => {
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(initialSubjectFilter || 'all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | Priority>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'createdAt' | 'title'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [groupBy, setGroupBy] = useState<GroupByMode>('none');
  const [expandedTaskIds, setExpandedTaskIds] = useState<Record<string, boolean>>({});

  React.useEffect(() => {
    if (initialSubjectFilter) {
      setSelectedSubject(initialSubjectFilter);
    }
  }, [initialSubjectFilter]);

  const toggleExpand = (id: string) => {
    setExpandedTaskIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleTaskCheck = async (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!task.completed) {
      confetti({
        particleCount: 40,
        spread: 55,
        origin: { y: 0.65 },
      });
    }
    await onToggleTask(task.id, task.completed);
  };

  // Filter & Sort Logic
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    if (selectedSubject !== 'all') {
      result = result.filter((t) => t.subjectId === selectedSubject);
    }

    if (statusFilter === 'pending') {
      result = result.filter((t) => !t.completed);
    } else if (statusFilter === 'completed') {
      result = result.filter((t) => t.completed);
    }

    if (priorityFilter !== 'all') {
      result = result.filter((t) => t.priority === priorityFilter);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          (t.subjectName && t.subjectName.toLowerCase().includes(q))
      );
    }

    const orderMult = sortOrder === 'desc' ? -1 : 1;
    if (sortBy === 'priority') {
      const weights: Record<string, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      result.sort((a, b) => (weights[b.priority] - weights[a.priority]) * orderMult);
    } else if (sortBy === 'createdAt') {
      result.sort((a, b) => (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * orderMult);
    } else if (sortBy === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title) * orderMult);
    } else {
      result.sort((a, b) => (new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()) * orderMult);
    }

    return result;
  }, [tasks, selectedSubject, statusFilter, priorityFilter, search, sortBy, sortOrder]);

  const groupedTasks = useMemo<Record<string, Task[]>>(() => {
    if (groupBy === 'none') {
      return { 'All Assignments': filteredTasks };
    }

    const groups: Record<string, Task[]> = {};

    filteredTasks.forEach((task) => {
      let groupKey = '';
      if (groupBy === 'subject') {
        groupKey = task.subjectName || 'General';
      } else if (groupBy === 'priority') {
        groupKey = `${task.priority} Priority`;
      } else if (groupBy === 'status') {
        groupKey = task.completed ? 'Completed' : 'Pending';
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(task);
    });

    return groups;
  }, [filteredTasks, groupBy]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-mono-retro">
      {/* Header Window Bar */}
      <div className="p-4 sm:p-6 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 bg-yellow-400 border border-black inline-block" />
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                DATABASE INDEX // ASSIGNMENTS
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-black dark:text-white uppercase">
              All Assignments ({tasks.length})
            </h1>
          </div>

          <button
            onClick={onOpenNewTask}
            className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500 text-black font-bold text-xs border-2 border-black shadow-[3px_3px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>[ + NEW ASSIGNMENT ↗ ]</span>
          </button>
        </div>

        {/* Search & Filter Toolbar (Image 4 & Image 5 style) */}
        <div className="mt-6 pt-4 border-t-2 border-black dark:border-white space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-black dark:text-white absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by title, description, or course..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 bg-[#FAF7EE] dark:bg-zinc-800 text-black dark:text-white border-2 border-black dark:border-white text-xs font-bold focus:outline-none placeholder:text-zinc-500"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-black"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Chips (Image 5 Tag Chips: ( Filter X )) */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-zinc-600 dark:text-zinc-400 mr-1">STATUS:</span>
            {(['all', 'pending', 'completed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 text-xs font-bold border-2 border-black dark:border-white uppercase transition cursor-pointer ${
                  statusFilter === status
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]'
                    : 'bg-white dark:bg-zinc-900 text-black dark:text-white hover:bg-yellow-200 dark:hover:bg-zinc-800'
                }`}
              >
                ( {status} )
              </button>
            ))}

            <div className="h-4 w-px bg-black dark:bg-white mx-1 hidden sm:block" />

            <span className="font-bold text-zinc-600 dark:text-zinc-400 mr-1">PRIORITY:</span>
            {(['all', 'HIGH', 'MEDIUM', 'LOW'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p as any)}
                className={`px-3 py-1 text-xs font-bold border-2 border-black dark:border-white uppercase transition cursor-pointer ${
                  priorityFilter === p
                    ? 'bg-yellow-400 text-black shadow-[2px_2px_0px_0px_#000]'
                    : 'bg-white dark:bg-zinc-900 text-black dark:text-white hover:bg-yellow-100 dark:hover:bg-zinc-800'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Secondary Controls: Course Selector, Sorting, Grouping */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold">COURSE:</span>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-3 py-1.5 bg-white dark:bg-zinc-800 text-black dark:text-white border-2 border-black dark:border-white font-bold text-xs focus:outline-none cursor-pointer"
              >
                <option value="all">ALL COURSES</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="font-bold">SORT:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-2.5 py-1.5 bg-white dark:bg-zinc-800 text-black dark:text-white border-2 border-black dark:border-white font-bold text-xs focus:outline-none cursor-pointer"
                >
                  <option value="dueDate">DUE DATE</option>
                  <option value="priority">PRIORITY</option>
                  <option value="title">TITLE</option>
                  <option value="createdAt">DATE ADDED</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-1.5 bg-white dark:bg-zinc-800 border-2 border-black dark:border-white font-bold cursor-pointer hover:bg-yellow-200"
                  title="Toggle Asc/Desc"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="font-bold">GROUP:</span>
                <select
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value as GroupByMode)}
                  className="px-2.5 py-1.5 bg-white dark:bg-zinc-800 text-black dark:text-white border-2 border-black dark:border-white font-bold text-xs focus:outline-none cursor-pointer"
                >
                  <option value="none">NONE</option>
                  <option value="subject">BY COURSE</option>
                  <option value="priority">BY PRIORITY</option>
                  <option value="status">BY STATUS</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Task List Groups */}
      {filteredTasks.length === 0 ? (
        <div className="p-12 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] text-center space-y-3">
          <p className="text-base font-black text-black dark:text-white uppercase">
            No assignments match your query.
          </p>
          <p className="text-xs text-zinc-500">
            Try resetting your filters or search keywords.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedSubject('all');
              setStatusFilter('all');
              setPriorityFilter('all');
            }}
            className="px-4 py-2 bg-yellow-400 text-black border-2 border-black font-bold text-xs shadow-[2px_2px_0px_0px_#000] cursor-pointer"
          >
            [ RESET FILTERS ]
          </button>
        </div>
      ) : (
        (Object.entries(groupedTasks) as [string, Task[]][]).map(([groupTitle, groupItems]) => (
          <div key={groupTitle} className="space-y-3">
            {groupBy !== 'none' && (
              <div className="flex items-center gap-2 pt-2">
                <span className="px-2.5 py-1 bg-black text-white dark:bg-white dark:text-black font-black text-xs uppercase border-2 border-black">
                  {groupTitle} ({groupItems.length})
                </span>
                <div className="flex-1 h-0.5 bg-black dark:bg-white" />
              </div>
            )}

            <div className="space-y-3">
              {groupItems.map((task) => {
                const priorityBadge = getPriorityBadge(task.priority);
                const dueInfo = formatDueDate(task.dueDate, task.completed);
                const isExpanded = !!expandedTaskIds[task.id];

                return (
                  <div
                    key={task.id}
                    className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1.5px_1.5px_0px_0px_#000] transition-all overflow-hidden"
                  >
                    {/* Window File Title Strip */}
                    <div className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 border-b-2 border-black dark:border-white flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <span
                          className="px-2 py-0.2 font-bold border border-black text-black text-[10px]"
                          style={{ backgroundColor: task.subjectColor || '#FACC15' }}
                        >
                          {task.subjectName}
                        </span>
                        <span className="font-bold text-zinc-600 dark:text-zinc-400">
                          task_{task.id.slice(0, 5)}.doc
                        </span>
                      </div>
                      <span className={dueInfo.colorClass}>
                        {dueInfo.label}
                      </span>
                    </div>

                    <div className="p-4 flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <button
                            onClick={(e) => handleTaskCheck(task, e)}
                            className={`w-6 h-6 border-2 border-black dark:border-white flex items-center justify-center shrink-0 mt-0.5 transition cursor-pointer ${
                              task.completed
                                ? 'bg-black text-white dark:bg-white dark:text-black'
                                : 'bg-white dark:bg-zinc-800 hover:bg-yellow-300'
                            }`}
                          >
                            {task.completed && <Check className="w-4 h-4 stroke-[3]" />}
                          </button>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={`px-2 py-0.2 text-[10px] ${priorityBadge.bg} ${priorityBadge.border}`}
                              >
                                [{priorityBadge.shortLabel}]
                              </span>
                            </div>

                            <p
                              className={`text-sm font-black leading-snug ${
                                task.completed
                                  ? 'line-through text-zinc-400 dark:text-zinc-500'
                                  : 'text-black dark:text-white'
                              }`}
                            >
                              {task.title}
                            </p>

                            {task.description && (
                              <div className="mt-2 text-xs text-zinc-700 dark:text-zinc-300">
                                {isExpanded ? (
                                  <div className="p-3 bg-[#FAF7EE] dark:bg-zinc-800 border-2 border-black/20 dark:border-white/20 whitespace-pre-wrap">
                                    {task.description}
                                  </div>
                                ) : (
                                  <p className="line-clamp-1">{task.description}</p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Controls */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {task.description && (
                            <button
                              onClick={() => toggleExpand(task.id)}
                              className="p-1.5 bg-white dark:bg-zinc-800 border-2 border-black dark:border-white text-black dark:text-white hover:bg-zinc-100 cursor-pointer text-xs"
                              title={isExpanded ? 'Collapse' : 'Expand'}
                            >
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          )}
                          <button
                            onClick={() => onTriggerAiBreakdown(task)}
                            title="AI Study Breakdown"
                            className="p-1.5 bg-yellow-300 hover:bg-yellow-200 border-2 border-black text-black shadow-[2px_2px_0px_0px_#000] cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onEditTask(task)}
                            title="Edit Assignment"
                            className="p-1.5 bg-white dark:bg-zinc-800 hover:bg-zinc-100 border-2 border-black dark:border-white text-black dark:text-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteTask(task.id)}
                            title="Delete Assignment"
                            className="p-1.5 bg-rose-400 hover:bg-rose-300 border-2 border-black text-black shadow-[2px_2px_0px_0px_#000] cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
};
