import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { ViewMode, Stats } from '../types.ts';
import {
  LayoutDashboard,
  CheckSquare,
  BookOpen,
  Calendar as CalendarIcon,
  Plus,
  LogOut,
  Moon,
  Sun,
  Sparkles,
  Terminal,
  Code2,
} from 'lucide-react';

interface NavbarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onOpenNewTask: () => void;
  onOpenNewSubject: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  stats: Stats | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  onOpenNewTask,
  onOpenNewSubject,
  isDark,
  onToggleTheme,
  stats,
}) => {
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const navItems = [
    { id: 'dashboard' as ViewMode, label: 'Dashboard', icon: LayoutDashboard, tag: 'v1.0' },
    { id: 'tasks' as ViewMode, label: 'Assignments', icon: CheckSquare, badge: stats?.pending },
    { id: 'subjects' as ViewMode, label: 'Courses', icon: BookOpen, badge: stats?.subjectCount },
    { id: 'calendar' as ViewMode, label: 'Calendar', icon: CalendarIcon },
  ];

  return (
    <header className="sticky top-0 z-30 w-full border-b-2 border-black dark:border-white bg-[#FAF7EE] dark:bg-[#121214] transition-colors">
      {/* Retro Window Header Bar Strip (Image 1 / Image 2 style) */}
      <div className="hidden sm:flex items-center justify-between px-4 py-1 border-b border-black/15 dark:border-white/20 bg-emerald-200/50 dark:bg-emerald-950/40 text-[11px] font-mono-retro">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full border border-black dark:border-white bg-rose-400 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full border border-black dark:border-white bg-yellow-400 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full border border-black dark:border-white bg-emerald-400 inline-block" />
          </div>
          <span className="font-bold text-zinc-900 dark:text-zinc-200 ml-1">
            STUDY_OS // v2.6.4-release
          </span>
        </div>
        <div className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300">
          <span>HOST: LOCALHOST:3000</span>
          <span>•</span>
          <span className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            SESSION ACTIVE
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo & Brand: Neo-Brutalist Badge (Image 2 & Image 3 </> style) */}
          <div className="flex items-center gap-4">
            <div
              id="brand-logo"
              onClick={() => onViewChange('dashboard')}
              className="flex items-center gap-2.5 cursor-pointer group select-none"
            >
              <div className="px-2.5 py-1.5 rounded-none bg-yellow-400 dark:bg-yellow-400 text-black border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] flex items-center gap-1.5 font-mono-retro font-black text-sm">
                <span>&lt;/&gt;</span>
                <span className="tracking-tight">STUDY.DEV</span>
              </div>
              <div className="hidden lg:flex flex-col">
                <span className="font-extrabold text-sm text-zinc-900 dark:text-white uppercase tracking-wider font-mono-retro">
                  Academic Hub
                </span>
                <span className="text-[10px] text-zinc-500 font-mono-retro">
                  Coursework & Deadlines
                </span>
              </div>
            </div>

            {/* Desktop Navigation Tabs: Neo-Brutalist buttons with hard borders & active pressed state */}
            <nav className="hidden md:flex items-center gap-2 ml-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-tab-${item.id}`}
                    onClick={() => onViewChange(item.id)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold font-mono-retro transition-all cursor-pointer ${
                      isActive
                        ? 'bg-black text-white dark:bg-white dark:text-black border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] translate-x-0.5 translate-y-0.5'
                        : 'bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border-2 border-black dark:border-white shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] hover:bg-yellow-200 dark:hover:bg-zinc-800 hover:-translate-y-0.5'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                    {typeof item.badge === 'number' && item.badge > 0 && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 border border-current font-black ${
                          isActive
                            ? 'bg-yellow-400 text-black'
                            : 'bg-rose-400 text-black'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            {/* Quick Action Button: Neo-brutalist yellow button */}
            <button
              id="btn-quick-new-task"
              onClick={onOpenNewTask}
              className="flex items-center gap-1.5 px-4 py-2 bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500 text-black font-mono-retro font-bold text-xs border-2 border-black dark:border-white shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">+ ASSIGNMENT ↗</span>
              <span className="sm:hidden">+ ADD</span>
            </button>

            {/* Dark Mode Toggle: Neo-brutalist box button */}
            <button
              id="btn-theme-toggle"
              onClick={onToggleTheme}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 bg-white dark:bg-zinc-900 text-black dark:text-white border-2 border-black dark:border-white shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
            >
              {isDark ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-black" />}
            </button>

            {/* User Profile Menu */}
            <div className="relative">
              <button
                id="btn-user-profile"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
              >
                <div className="w-6 h-6 bg-pink-400 border border-black dark:border-white text-black font-mono-retro font-black text-xs flex items-center justify-center">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-bold font-mono-retro text-black dark:text-white truncate max-w-[100px]">
                    {user?.name}
                  </span>
                </div>
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowProfileMenu(false)}
                  />
                  <div
                    id="user-profile-dropdown"
                    className="absolute right-0 mt-2 w-64 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[5px_5px_0px_0px_#000] dark:shadow-[5px_5px_0px_0px_#fff] z-50 p-3 text-xs font-mono-retro animate-in fade-in zoom-in-95 duration-100"
                  >
                    <div className="p-2 border-2 border-black/10 dark:border-white/10 bg-[#FAF7EE] dark:bg-zinc-800 mb-2">
                      <p className="font-bold text-black dark:text-white uppercase">{user?.name}</p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">{user?.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onOpenNewSubject();
                      }}
                      className="w-full flex items-center gap-2 p-2 font-bold text-black dark:text-white hover:bg-yellow-200 dark:hover:bg-zinc-800 border border-transparent hover:border-black dark:hover:border-white transition cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>MANAGE COURSES</span>
                    </button>

                    <div className="my-1 border-t border-black/20 dark:border-white/20" />

                    <button
                      id="btn-logout"
                      onClick={() => {
                        setShowProfileMenu(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 p-2 font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-600 transition cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>LOG OUT [ESC]</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t-2 border-black dark:border-white">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 font-mono-retro text-[11px] font-bold ${
                  isActive
                    ? 'text-black dark:text-white underline decoration-2'
                    : 'text-zinc-500 dark:text-zinc-400'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
