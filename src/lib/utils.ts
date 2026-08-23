import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, isToday, isTomorrow, isYesterday, isPast, differenceInDays, parseISO } from 'date-fns';
import { Priority } from '../types.ts';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const PRESET_COLORS = [
  { name: 'Canary Yellow', hex: '#FACC15', bgClass: 'bg-yellow-400', textClass: 'text-black', borderClass: 'border-black' },
  { name: 'Cyber Mint', hex: '#86EFAC', bgClass: 'bg-emerald-300', textClass: 'text-black', borderClass: 'border-black' },
  { name: 'Neo Pink', hex: '#F472B6', bgClass: 'bg-pink-400', textClass: 'text-black', borderClass: 'border-black' },
  { name: 'Sky Cyan', hex: '#38BDF8', bgClass: 'bg-sky-300', textClass: 'text-black', borderClass: 'border-black' },
  { name: 'Periwinkle', hex: '#818CF8', bgClass: 'bg-indigo-300', textClass: 'text-black', borderClass: 'border-black' },
  { name: 'Vibrant Orange', hex: '#FB923C', bgClass: 'bg-orange-400', textClass: 'text-black', borderClass: 'border-black' },
  { name: 'Acid Lime', hex: '#A3E635', bgClass: 'bg-lime-400', textClass: 'text-black', borderClass: 'border-black' },
  { name: 'Lavender Violet', hex: '#C084FC', bgClass: 'bg-purple-300', textClass: 'text-black', borderClass: 'border-black' },
];

export function getPriorityBadge(priority: Priority) {
  switch (priority) {
    case 'HIGH':
      return {
        label: 'High Priority',
        shortLabel: 'HIGH',
        bg: 'bg-rose-400 dark:bg-rose-500 text-black font-mono-retro font-bold',
        text: 'text-black',
        border: 'border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]',
        dot: 'bg-black',
      };
    case 'MEDIUM':
      return {
        label: 'Medium Priority',
        shortLabel: 'MED',
        bg: 'bg-yellow-300 dark:bg-yellow-400 text-black font-mono-retro font-bold',
        text: 'text-black',
        border: 'border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]',
        dot: 'bg-black',
      };
    case 'LOW':
      return {
        label: 'Low Priority',
        shortLabel: 'LOW',
        bg: 'bg-lime-300 dark:bg-lime-400 text-black font-mono-retro font-bold',
        text: 'text-black',
        border: 'border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]',
        dot: 'bg-black',
      };
  }
}

export function formatDueDate(dateString: string, completed: boolean = false) {
  try {
    const date = parseISO(dateString);
    const timeFormatted = format(date, 'h:mm a');
    const hasPast = isPast(date) && !isToday(date);
    const daysDiff = differenceInDays(date, new Date());

    if (completed) {
      return {
        label: format(date, 'MMM d, yyyy'),
        badgeType: 'completed' as const,
        badgeText: 'DONE',
        colorClass: 'text-zinc-500 line-through',
      };
    }

    if (hasPast) {
      return {
        label: `OVERDUE (${format(date, 'MMM d')})`,
        badgeType: 'overdue' as const,
        badgeText: 'OVERDUE',
        colorClass: 'text-rose-600 dark:text-rose-400 font-bold font-mono-retro',
      };
    }

    if (isToday(date)) {
      return {
        label: `TODAY · ${timeFormatted}`,
        badgeType: 'today' as const,
        badgeText: 'TODAY',
        colorClass: 'text-amber-600 dark:text-amber-300 font-bold font-mono-retro',
      };
    }

    if (isTomorrow(date)) {
      return {
        label: `TOMORROW · ${timeFormatted}`,
        badgeType: 'tomorrow' as const,
        badgeText: 'TOMORROW',
        colorClass: 'text-blue-600 dark:text-blue-400 font-bold font-mono-retro',
      };
    }

    if (daysDiff <= 7 && daysDiff > 0) {
      return {
        label: `${format(date, 'EEE')} · ${timeFormatted}`,
        badgeType: 'this-week' as const,
        badgeText: `${daysDiff}D LEFT`,
        colorClass: 'text-zinc-800 dark:text-zinc-200 font-medium font-mono-retro',
      };
    }

    return {
      label: format(date, 'MMM d, yyyy · h:mm a'),
      badgeType: 'future' as const,
      badgeText: format(date, 'MMM d'),
      colorClass: 'text-zinc-700 dark:text-zinc-300 font-mono-retro',
    };
  } catch (err) {
    return {
      label: dateString,
      badgeType: 'future' as const,
      badgeText: 'DATE',
      colorClass: 'text-zinc-600',
    };
  }
}
