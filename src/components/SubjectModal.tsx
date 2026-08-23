import React, { useState, useEffect } from 'react';
import { Subject } from '../types.ts';
import { PRESET_COLORS } from '../lib/utils.ts';
import { X, BookOpen, Check, AlertCircle, Folder } from 'lucide-react';

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; color?: string }) => Promise<void>;
  initialSubject?: Subject | null;
}

export const SubjectModal: React.FC<SubjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialSubject,
}) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0].hex);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialSubject) {
        setName(initialSubject.name);
        setColor(initialSubject.color || PRESET_COLORS[0].hex);
      } else {
        setName('');
        setColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)].hex);
      }
      setError(null);
    }
  }, [isOpen, initialSubject]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a course/subject name.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSave({
        name: name.trim(),
        color,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save course.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 font-mono-retro">
      <div
        className="w-full max-w-md bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Retro Window Title Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-emerald-300 dark:bg-emerald-400 text-black border-b-2 border-black">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full border border-black bg-rose-400 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full border border-black bg-yellow-400 inline-block" />
            </div>
            <span className="font-bold text-xs uppercase">
              {initialSubject ? 'EDIT_COURSE_FOLDER.EXE' : 'CREATE_COURSE_FOLDER.EXE'}
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

          {/* Name */}
          <div>
            <label className="block text-xs font-bold uppercase mb-1">
              COURSE / SUBJECT NAME <span className="text-rose-500">*</span>
            </label>
            <input
              id="input-subject-name"
              type="text"
              required
              placeholder="e.g. CS 201: Data Structures, CHEM 102..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-bold bg-[#FAF7EE] dark:bg-zinc-800 text-black dark:text-white border-2 border-black dark:border-white focus:outline-none placeholder:text-zinc-500"
            />
          </div>

          {/* Color Swatch Matrix */}
          <div>
            <label className="block text-xs font-bold uppercase mb-2">
              FOLDER COLOR TAG
            </label>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_COLORS.map((preset) => {
                const isSelected = color.toLowerCase() === preset.hex.toLowerCase();
                return (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => setColor(preset.hex)}
                    className={`flex flex-col items-center gap-1 p-2 border-2 border-black dark:border-white transition cursor-pointer ${
                      isSelected
                        ? 'bg-black text-white dark:bg-white dark:text-black shadow-[2px_2px_0px_0px_#000]'
                        : 'bg-[#FAF7EE] dark:bg-zinc-800 text-black dark:text-white hover:bg-yellow-100'
                    }`}
                  >
                    <div
                      className="w-6 h-6 border-2 border-black flex items-center justify-center text-black"
                      style={{ backgroundColor: preset.hex }}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <span className="text-[9px] font-bold uppercase truncate max-w-full">
                      {preset.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-black dark:border-white">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white dark:bg-zinc-800 text-black dark:text-white border-2 border-black dark:border-white font-bold text-xs hover:bg-zinc-100 cursor-pointer"
            >
              [ CANCEL ]
            </button>
            <button
              id="btn-submit-subject"
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-emerald-300 hover:bg-emerald-200 active:bg-emerald-400 text-black font-bold text-xs border-2 border-black shadow-[3px_3px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'SAVING...' : initialSubject ? '[ UPDATE COURSE ]' : '[ CREATE COURSE ]'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
