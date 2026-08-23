import React from 'react';
import { Subject, Task } from '../types.ts';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Folder,
  Layers,
  FolderPlus,
} from 'lucide-react';

interface SubjectsViewProps {
  subjects: Subject[];
  tasks: Task[];
  onOpenNewSubject: () => void;
  onEditSubject: (subject: Subject) => void;
  onDeleteSubject: (subjectId: string) => Promise<void>;
  onSelectSubject: (subjectId: string) => void;
  onOpenNewTaskForSubject: (subjectId: string) => void;
}

export const SubjectsView: React.FC<SubjectsViewProps> = ({
  subjects,
  tasks,
  onOpenNewSubject,
  onEditSubject,
  onDeleteSubject,
  onSelectSubject,
  onOpenNewTaskForSubject,
}) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-200 font-mono-retro">
      {/* Header Banner */}
      <div className="p-6 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 bg-emerald-400 border border-black inline-block" />
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                COURSE DIRECTORY // FOLDER COLLECTION
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-black dark:text-white uppercase">
              Courses & Subjects ({subjects.length})
            </h1>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 max-w-xl">
              Organize your academic syllabus, track milestones, and view categorized deliverables.
            </p>
          </div>

          <button
            onClick={onOpenNewSubject}
            className="px-5 py-2.5 bg-emerald-300 hover:bg-emerald-200 active:bg-emerald-400 text-black font-bold text-xs border-2 border-black shadow-[3px_3px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>[ + NEW COURSE FOLDER ↗ ]</span>
          </button>
        </div>
      </div>

      {/* Course Folders Grid (Modeled after Image 4 Folder Collection) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-2">
        {subjects.map((sub) => {
          const subjectTasks = tasks.filter((t) => t.subjectId === sub.id);
          const completedCount = subjectTasks.filter((t) => t.completed).length;
          const pendingCount = subjectTasks.filter((t) => !t.completed).length;
          const totalCount = subjectTasks.length;
          const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

          return (
            <div key={sub.id} className="relative pt-4 group">
              {/* Protruding Folder Tab (Image 4 Signature Neo-Brutalist Element) */}
              <div
                className="absolute top-0 left-6 px-4 py-1.5 border-t-2 border-l-2 border-r-2 border-black dark:border-white text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 z-10"
                style={{ backgroundColor: sub.color || '#FACC15' }}
              >
                <Folder className="w-3.5 h-3.5 fill-black" />
                <span className="truncate max-w-[130px]">{sub.name}</span>
              </div>

              {/* Folder Main Container */}
              <div className="p-5 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[5px_5px_0px_0px_#000] dark:shadow-[5px_5px_0px_0px_#fff] flex flex-col justify-between min-h-[220px] transition group-hover:translate-x-0.5 group-hover:translate-y-0.5">
                <div>
                  {/* Top Bar inside Folder: Color swatch & edit controls */}
                  <div className="flex items-center justify-between pb-3 border-b-2 border-black dark:border-white">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 border-2 border-black"
                        style={{ backgroundColor: sub.color || '#FACC15' }}
                      />
                      <span className="text-[10px] font-black uppercase text-zinc-500 dark:text-zinc-400">
                        {totalCount} {totalCount === 1 ? 'DELIVERABLE' : 'DELIVERABLES'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditSubject(sub)}
                        className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-black dark:text-white border border-transparent hover:border-black cursor-pointer"
                        title="Edit Course"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteSubject(sub.id)}
                        className="p-1 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-rose-600 border border-transparent hover:border-rose-600 cursor-pointer"
                        title="Delete Course"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Course Title */}
                  <h3
                    onClick={() => onSelectSubject(sub.id)}
                    className="text-lg font-black text-black dark:text-white uppercase mt-3 mb-2 cursor-pointer hover:underline"
                  >
                    {sub.name}
                  </h3>

                  {/* Stats Badges */}
                  <div className="grid grid-cols-2 gap-2 my-3">
                    <div className="p-2 bg-[#FAF7EE] dark:bg-zinc-800 border border-black dark:border-white text-center">
                      <span className="block text-[10px] text-zinc-500 font-bold">PENDING</span>
                      <span className="text-base font-black text-black dark:text-white">{pendingCount}</span>
                    </div>
                    <div className="p-2 bg-[#FAF7EE] dark:bg-zinc-800 border border-black dark:border-white text-center">
                      <span className="block text-[10px] text-zinc-500 font-bold">DONE</span>
                      <span className="text-base font-black text-black dark:text-white">{completedCount}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Section: Progress Bar & Direct Action Buttons */}
                <div className="space-y-3 pt-2">
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                      <span>PROGRESS</span>
                      <span>{percent}%</span>
                    </div>
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

                  <div className="flex items-center gap-2 pt-2 border-t border-black/15 dark:border-white/15">
                    <button
                      onClick={() => onSelectSubject(sub.id)}
                      className="flex-1 py-2 bg-black text-white dark:bg-white dark:text-black font-bold text-xs border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:bg-zinc-800 cursor-pointer flex items-center justify-center gap-1"
                    >
                      <span>VIEW TASKS</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onOpenNewTaskForSubject(sub.id)}
                      className="px-3 py-2 bg-yellow-300 hover:bg-yellow-200 text-black font-bold text-xs border-2 border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer"
                      title="Add task to this course"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Create New Course Card */}
        <div
          onClick={onOpenNewSubject}
          className="relative pt-4 cursor-pointer group"
        >
          <div className="p-8 bg-[#FAF7EE] dark:bg-zinc-900 border-2 border-dashed border-black dark:border-white shadow-[5px_5px_0px_0px_#000] dark:shadow-[5px_5px_0px_0px_#fff] flex flex-col items-center justify-center text-center min-h-[260px] group-hover:bg-yellow-100 dark:group-hover:bg-zinc-800 transition">
            <div className="w-12 h-12 bg-yellow-400 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000] mb-3 group-hover:scale-105 transition">
              <Plus className="w-6 h-6 stroke-[3] text-black" />
            </div>
            <h4 className="font-black text-sm text-black dark:text-white uppercase">
              [ + CREATE NEW COURSE ]
            </h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 max-w-[200px]">
              Add a course folder for syllabus tracking and deadlines.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
