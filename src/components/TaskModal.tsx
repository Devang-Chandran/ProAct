import React, { useState, useEffect } from 'react';
import { Subject, Task, Priority } from '../types.ts';
import { format } from 'date-fns';
import {
  X,
  Calendar,
  Clock,
  Flag,
  BookOpen,
  Sparkles,
  PlusCircle,
  AlertCircle,
  FileText,
} from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    description?: string;
    dueDate: string;
    priority: Priority;
    subjectId: string;
  }) => Promise<void>;
  subjects: Subject[];
  initialTask?: Task | null;
  defaultSubjectId?: string;
  onOpenNewSubject: () => void;
  onTriggerAiBreakdown?: (taskDraft: { title: string; description?: string; subjectName?: string }) => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  subjects,
  initialTask,
  defaultSubjectId,
  onOpenNewSubject,
  onTriggerAiBreakdown,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [dueDateDate, setDueDateDate] = useState('');
  const [dueDateTime, setDueDateTime] = useState('23:59');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialTask) {
        setTitle(initialTask.title);
        setDescription(initialTask.description || '');
        setSubjectId(initialTask.subjectId);
        setPriority(initialTask.priority);

        try {
          const parsed = new Date(initialTask.dueDate);
          setDueDateDate(format(parsed, 'yyyy-MM-dd'));
          setDueDateTime(format(parsed, 'HH:mm'));
        } catch {
          const today = new Date();
          setDueDateDate(format(today, 'yyyy-MM-dd'));
          setDueDateTime('23:59');
        }
      } else {
        setTitle('');
        setDescription('');
        setSubjectId(defaultSubjectId || (subjects.length > 0 ? subjects[0].id : ''));
        setPriority('MEDIUM');

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setDueDateDate(format(tomorrow, 'yyyy-MM-dd'));
        setDueDateTime('23:59');
      }
      setError(null);
    }
  }, [isOpen, initialTask, defaultSubjectId, subjects]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide an assignment title.');
      return;
    }
    if (!subjectId) {
      setError('Please select or create a subject/course.');
      return;
    }
    if (!dueDateDate) {
      setError('Please select a due date.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const [hours, minutes] = dueDateTime.split(':').map(Number);
      const combinedDate = new Date(`${dueDateDate}T00:00:00`);
      combinedDate.setHours(hours || 23, minutes || 59, 0, 0);

      await onSave({
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: combinedDate.toISOString(),
        priority,
        subjectId,
      });

      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedSubject = subjects.find((s) => s.id === subjectId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 font-mono-retro">
      <div
        className="w-full max-w-lg bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Retro Window Title Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-yellow-300 dark:bg-yellow-400 text-black border-b-2 border-black">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full border border-black bg-rose-400 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full border border-black bg-emerald-400 inline-block" />
            </div>
            <span className="font-bold text-xs uppercase">
              {initialTask ? 'EDIT_ASSIGNMENT.EXE' : 'CREATE_ASSIGNMENT.EXE'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-black hover:text-white border border-black font-bold text-xs cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-100 dark:bg-rose-950/40 border-2 border-rose-600 text-rose-800 dark:text-rose-200 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase mb-1">
              ASSIGNMENT TITLE <span className="text-rose-500">*</span>
            </label>
            <input
              id="input-task-title"
              type="text"
              required
              placeholder="e.g. Midterm Problem Set, Final Paper Draft..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-bold bg-[#FAF7EE] dark:bg-zinc-800 text-black dark:text-white border-2 border-black dark:border-white focus:outline-none placeholder:text-zinc-500"
            />
          </div>

          {/* Subject Selector */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold uppercase">
                COURSE / SUBJECT <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenNewSubject();
                }}
                className="text-xs font-bold underline cursor-pointer hover:text-blue-600"
              >
                + NEW COURSE
              </button>
            </div>

            {subjects.length === 0 ? (
              <div className="p-3 bg-yellow-100 dark:bg-yellow-950/40 border-2 border-black text-xs text-black dark:text-white flex items-center justify-between">
                <span>No courses created yet.</span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenNewSubject();
                  }}
                  className="font-bold underline cursor-pointer"
                >
                  Create One
                </button>
              </div>
            ) : (
              <select
                id="select-task-subject"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-bold bg-[#FAF7EE] dark:bg-zinc-800 text-black dark:text-white border-2 border-black dark:border-white focus:outline-none cursor-pointer"
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Due Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase mb-1">
                DUE DATE <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-task-duedate"
                type="date"
                required
                value={dueDateDate}
                onChange={(e) => setDueDateDate(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-bold bg-[#FAF7EE] dark:bg-zinc-800 text-black dark:text-white border-2 border-black dark:border-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1">
                DUE TIME
              </label>
              <input
                id="input-task-duetime"
                type="time"
                value={dueDateTime}
                onChange={(e) => setDueDateTime(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-bold bg-[#FAF7EE] dark:bg-zinc-800 text-black dark:text-white border-2 border-black dark:border-white focus:outline-none"
              />
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-bold uppercase mb-1">
              PRIORITY LEVEL
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['LOW', 'MEDIUM', 'HIGH'] as Priority[]).map((p) => {
                const isSelected = priority === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-2 px-3 text-xs font-bold border-2 border-black dark:border-white uppercase transition cursor-pointer ${
                      isSelected
                        ? 'bg-yellow-400 text-black shadow-[2px_2px_0px_0px_#000]'
                        : 'bg-[#FAF7EE] dark:bg-zinc-800 text-black dark:text-white hover:bg-yellow-100'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description & AI Trigger */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold uppercase">
                NOTES & INSTRUCTIONS (OPTIONAL)
              </label>
              {onTriggerAiBreakdown && title.trim().length > 2 && (
                <button
                  type="button"
                  onClick={() => {
                    onTriggerAiBreakdown({
                      title,
                      description,
                      subjectName: selectedSubject?.name,
                    });
                  }}
                  className="px-2 py-0.5 bg-yellow-300 text-black font-bold text-[10px] border border-black hover:bg-yellow-200 cursor-pointer flex items-center gap-1 shadow-[1px_1px_0px_0px_#000]"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>AI BREAKDOWN</span>
                </button>
              )}
            </div>
            <textarea
              id="textarea-task-description"
              rows={3}
              placeholder="e.g. Include APA citations, review lecture 4 rubric..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-medium bg-[#FAF7EE] dark:bg-zinc-800 text-black dark:text-white border-2 border-black dark:border-white focus:outline-none resize-none placeholder:text-zinc-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-black dark:border-white">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white dark:bg-zinc-800 text-black dark:text-white border-2 border-black dark:border-white font-bold text-xs hover:bg-zinc-100 cursor-pointer"
            >
              [ CANCEL ]
            </button>
            <button
              id="btn-submit-task"
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500 text-black font-bold text-xs border-2 border-black shadow-[3px_3px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'SAVING...' : initialTask ? '[ UPDATE ASSIGNMENT ]' : '[ SAVE ASSIGNMENT ]'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
