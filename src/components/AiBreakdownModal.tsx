import React, { useState } from 'react';
import { AiBreakdownResult } from '../types.ts';
import { Sparkles, Clock, CheckCircle2, Copy, Check, Lightbulb, X } from 'lucide-react';

interface AiBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  result: AiBreakdownResult | null;
  taskTitle: string;
  onApplyStepsToDescription?: (formattedSteps: string) => void;
}

export const AiBreakdownModal: React.FC<AiBreakdownModalProps> = ({
  isOpen,
  onClose,
  isLoading,
  result,
  taskTitle,
  onApplyStepsToDescription,
}) => {
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const toggleStep = (idx: number) => {
    setCheckedSteps((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleCopy = () => {
    if (!result) return;
    const text = [
      `AI Study Plan for ${taskTitle}:`,
      ...result.steps.map((s, i) => `${i + 1}. ${s}`),
      result.estimatedMinutes ? `Estimated time: ${result.estimatedMinutes} mins` : '',
      result.studyTips ? `Study Tip: ${result.studyTips}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    if (!result || !onApplyStepsToDescription) return;
    const formatted = result.steps.map((s, i) => `[ ] Step ${i + 1}: ${s}`).join('\n');
    onApplyStepsToDescription(formatted);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 font-mono-retro">
      <div
        className="w-full max-w-lg bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Retro Title Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-pink-300 dark:bg-pink-400 text-black border-b-2 border-black">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span className="font-bold text-xs uppercase">
              AI_STUDY_ROADMAP.GEN // {taskTitle.slice(0, 20)}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-black hover:text-white border border-black font-bold text-xs cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-4 border-black border-t-yellow-400 animate-spin" />
              <p className="text-xs font-bold uppercase text-black dark:text-white">
                GENERATING COGNITIVE BREAKDOWN & ROADMAP...
              </p>
              <p className="text-[11px] text-zinc-500">
                Chunking assignment into manageable pomodoro intervals
              </p>
            </div>
          ) : result ? (
            <div className="space-y-4">
              {/* Badges / Metrics */}
              <div className="flex flex-wrap items-center gap-2">
                {result.estimatedMinutes && (
                  <span className="px-2.5 py-1 bg-yellow-300 text-black border-2 border-black font-bold text-[11px] shadow-[2px_2px_0px_0px_#000]">
                    ⏱ ~{result.estimatedMinutes} MINS ESTIMATED
                  </span>
                )}
                <span className="px-2.5 py-1 bg-emerald-300 text-black border-2 border-black font-bold text-[11px] shadow-[2px_2px_0px_0px_#000]">
                  ✓ {result.steps.length} ACTIONABLE STEPS
                </span>
              </div>

              {/* Steps checklist */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Recommended Action Steps:
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {result.steps.map((step, idx) => {
                    const isChecked = !!checkedSteps[idx];
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleStep(idx)}
                        className={`flex items-start gap-2.5 p-2.5 border-2 border-black dark:border-white transition cursor-pointer ${
                          isChecked
                            ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500 line-through'
                            : 'bg-[#FAF7EE] dark:bg-zinc-800 text-black dark:text-white hover:bg-yellow-100'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 border-2 border-black flex items-center justify-center shrink-0 mt-0.5 ${
                            isChecked ? 'bg-black text-white' : 'bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div className="text-xs font-bold leading-relaxed">
                          <span className="mr-1.5">{idx + 1}.</span>
                          <span>{step}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Study Tip */}
              {result.studyTips && (
                <div className="p-3 bg-yellow-100 dark:bg-yellow-950/40 border-2 border-black dark:border-yellow-400 flex items-start gap-2 text-xs text-black dark:text-white">
                  <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-yellow-600" />
                  <div>
                    <span className="font-bold block mb-0.5">STUDY STRATEGY TIP:</span>
                    <span>{result.studyTips}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-zinc-500 font-bold">
              NO BREAKDOWN AVAILABLE.
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 mt-4 border-t-2 border-black dark:border-white">
            <button
              onClick={handleCopy}
              disabled={!result || isLoading}
              className="px-3 py-1.5 bg-white dark:bg-zinc-800 text-black dark:text-white border-2 border-black dark:border-white font-bold text-xs hover:bg-zinc-100 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '[ COPIED ]' : '[ COPY PLAN ]'}</span>
            </button>

            <div className="flex items-center gap-2">
              {onApplyStepsToDescription && result && (
                <button
                  onClick={handleApply}
                  className="px-4 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xs border-2 border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer"
                >
                  [ INSERT INTO NOTES ]
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-1.5 bg-white dark:bg-zinc-800 text-black dark:text-white border-2 border-black dark:border-white font-bold text-xs hover:bg-zinc-100 cursor-pointer"
              >
                [ CLOSE ]
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
