import React, { useState } from 'react';
import { Subject, Task } from '../types.ts';
import { formatDueDate, getPriorityBadge } from '../lib/utils.ts';
import {
  format,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
} from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Check,
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  Edit2,
  Trash2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CalendarViewProps {
  tasks: Task[];
  subjects: Subject[];
  onToggleTask: (taskId: string, currentCompleted: boolean) => Promise<void>;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => Promise<void>;
  onOpenNewTask: () => void;
  onTriggerAiBreakdown: (task: Task) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  subjects,
  onToggleTask,
  onEditTask,
  onDeleteTask,
  onOpenNewTask,
  onTriggerAiBreakdown,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const getTasksForDate = (date: Date) => {
    return tasks.filter((t) => {
      try {
        const taskDate = parseISO(t.dueDate);
        return isSameDay(taskDate, date);
      } catch {
        return false;
      }
    });
  };

  const selectedDateTasks = getTasksForDate(selectedDate);

  const handleTaskCheck = async (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!task.completed) {
      confetti({ particleCount: 35, spread: 50, origin: { y: 0.7 } });
    }
    await onToggleTask(task.id, task.completed);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-mono-retro">
      {/* Calendar Window Header */}
      <div className="p-4 sm:p-6 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 bg-yellow-400 border border-black inline-block" />
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                SCHEDULE SCHEDULER // CALENDAR.EXE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-black dark:text-white uppercase">
              {format(currentMonth, 'MMMM yyyy')}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={goToToday}
              className="px-3 py-1.5 bg-[#FAF7EE] dark:bg-zinc-800 text-black dark:text-white border-2 border-black dark:border-white font-bold text-xs hover:bg-yellow-200 cursor-pointer"
            >
              [ TODAY ]
            </button>
            <div className="flex items-center">
              <button
                onClick={prevMonth}
                className="p-1.5 bg-white dark:bg-zinc-800 border-2 border-black dark:border-white text-black dark:text-white hover:bg-yellow-200 cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 bg-white dark:bg-zinc-800 border-2 border-l-0 border-black dark:border-white text-black dark:text-white hover:bg-yellow-200 cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={onOpenNewTask}
              className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500 text-black font-bold text-xs border-2 border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer flex items-center gap-1.5 ml-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ TASK</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: 7-Day Month Grid (Left) + Selected Day Notepad (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] p-4 sm:p-6">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center text-xs font-black uppercase text-black dark:text-white">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-1.5 bg-zinc-100 dark:bg-zinc-800 border border-black dark:border-white">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Cells */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {calendarDays.map((day) => {
              const dayTasks = getTasksForDate(day);
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentMonthDay = isSameMonth(day, currentMonth);
              const isCurrentDay = isToday(day);

              return (
                <div
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`min-h-[80px] sm:min-h-[100px] p-1.5 sm:p-2 border-2 transition-all flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'border-black dark:border-white bg-yellow-100 dark:bg-yellow-950/40 ring-2 ring-yellow-400'
                      : isCurrentMonthDay
                      ? 'border-black/30 dark:border-white/30 bg-white dark:bg-zinc-900 hover:border-black dark:hover:border-white hover:bg-zinc-50'
                      : 'border-black/10 dark:border-white/10 bg-zinc-100/50 dark:bg-zinc-900/30 text-zinc-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-black px-1.5 py-0.2 ${
                        isCurrentDay
                          ? 'bg-black text-white dark:bg-white dark:text-black'
                          : ''
                      }`}
                    >
                      {format(day, 'd')}
                    </span>
                    {dayTasks.length > 0 && (
                      <span className="text-[10px] font-bold px-1 bg-yellow-400 text-black border border-black">
                        {dayTasks.length}
                      </span>
                    )}
                  </div>

                  {/* Task Mini Badges */}
                  <div className="space-y-1 mt-1 overflow-hidden">
                    {dayTasks.slice(0, 2).map((t) => (
                      <div
                        key={t.id}
                        className={`text-[9px] font-bold px-1 py-0.5 truncate border border-black ${
                          t.completed ? 'line-through bg-zinc-200 text-zinc-600' : 'text-black'
                        }`}
                        style={{
                          backgroundColor: t.completed ? undefined : t.subjectColor || '#FACC15',
                        }}
                      >
                        {t.title}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <div className="text-[9px] font-bold text-zinc-500">
                        +{dayTasks.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Agenda Notepad (Right Col) */}
        <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b-2 border-black dark:border-white mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase text-zinc-500">
                  AGENDA NOTEPAD
                </span>
                <h3 className="text-base font-black text-black dark:text-white uppercase">
                  {format(selectedDate, 'EEEE, MMM d')}
                </h3>
              </div>
              <span className="px-2 py-0.5 bg-yellow-300 text-black font-bold text-xs border border-black">
                {selectedDateTasks.length} TASKS
              </span>
            </div>

            {selectedDateTasks.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-500 space-y-2">
                <p className="font-bold uppercase text-black dark:text-white">
                  No deliverables scheduled
                </p>
                <p>Enjoy free time or add a deadline for this date.</p>
                <button
                  onClick={onOpenNewTask}
                  className="mt-3 px-3 py-1.5 bg-yellow-400 text-black font-bold text-xs border-2 border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer hover:bg-yellow-300"
                >
                  + ADD ASSIGNMENT
                </button>
              </div>
            ) : (
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {selectedDateTasks.map((task) => {
                  const priorityBadge = getPriorityBadge(task.priority);
                  return (
                    <div
                      key={task.id}
                      className="p-3 bg-[#FAF7EE] dark:bg-zinc-800 border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]"
                    >
                      <div className="flex items-start gap-2">
                        <button
                          onClick={(e) => handleTaskCheck(task, e)}
                          className={`w-5 h-5 border-2 border-black dark:border-white flex items-center justify-center shrink-0 mt-0.5 cursor-pointer ${
                            task.completed
                              ? 'bg-black text-white dark:bg-white dark:text-black'
                              : 'bg-white dark:bg-zinc-800'
                          }`}
                        >
                          {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span
                              className="px-1.5 py-0.2 text-[9px] font-bold border border-black text-black"
                              style={{ backgroundColor: task.subjectColor || '#FACC15' }}
                            >
                              {task.subjectName}
                            </span>
                            <span className={`px-1.5 py-0.2 text-[9px] ${priorityBadge.bg}`}>
                              [{priorityBadge.shortLabel}]
                            </span>
                          </div>

                          <p
                            className={`text-xs font-bold ${
                              task.completed ? 'line-through text-zinc-500' : 'text-black dark:text-white'
                            }`}
                          >
                            {task.title}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-black/10 dark:border-white/10 text-xs">
                        <button
                          onClick={() => onTriggerAiBreakdown(task)}
                          className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>AI Breakdown</span>
                        </button>
                        <button
                          onClick={() => onEditTask(task)}
                          className="hover:underline cursor-pointer font-bold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDeleteTask(task.id)}
                          className="text-rose-600 font-bold hover:underline cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
