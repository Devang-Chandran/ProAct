import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Sparkles,
  Lock,
  Mail,
  User as UserIcon,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  BookOpen,
  Calendar,
  Layers,
  Code2,
  Folder,
} from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { login, signup, loginDemo } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === 'signup') {
        if (!name.trim()) {
          setError('Please enter your full name.');
          setIsSubmitting(false);
          return;
        }
        await signup(name.trim(), email.trim(), password);
      } else {
        await login(email.trim(), password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await loginDemo();
    } catch (err: any) {
      setError(err.message || 'Failed to login with demo student account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7EE] dark:bg-[#121214] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-black dark:text-white transition-colors bg-grid-paper font-mono-retro">
      <div className="max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Left Column: Brand & Features Overview (Image 1 & 3 style) */}
        <div className="md:col-span-6 space-y-6 text-left">
          <div className="flex items-center gap-3">
            <div className="px-3 py-2 bg-yellow-400 text-black border-2 border-black dark:border-white shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] flex items-center gap-2 font-black text-base">
              <span>&lt;/&gt;</span>
              <span>STUDY.DEV</span>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Neo-Brutalist Academic Workspace
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-black text-black dark:text-white tracking-tight uppercase leading-tight">
              Syllabus deadlines & study roadmaps.
            </h1>
            <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-bold">
              Organize assignments into color-coded course folders, track upcoming milestones, and generate AI-assisted study breakdowns.
            </p>
          </div>

          {/* Feature Badges */}
          <div className="space-y-2.5 pt-2">
            <div className="p-3 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] flex items-center gap-3">
              <div className="w-7 h-7 bg-yellow-300 text-black border border-black flex items-center justify-center font-bold text-xs shrink-0">
                <Folder className="w-4 h-4 fill-black" />
              </div>
              <span className="text-xs font-bold">
                Color-Coded Course Folders & Progress Tracking
              </span>
            </div>
            <div className="p-3 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] flex items-center gap-3">
              <div className="w-7 h-7 bg-emerald-300 text-black border border-black flex items-center justify-center font-bold text-xs shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold">
                Upcoming 7-Day Deadlines & Monthly Schedule Grid
              </span>
            </div>
            <div className="p-3 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] flex items-center gap-3">
              <div className="w-7 h-7 bg-pink-300 text-black border border-black flex items-center justify-center font-bold text-xs shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold">
                AI Cognitive Chunking & Evidence-Based Study Tips
              </span>
            </div>
          </div>

          {/* 1-Click Demo Account Card */}
          <div className="p-4 bg-yellow-300 text-black border-2 border-black shadow-[4px_4px_0px_0px_#000] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>INSTANT 1-CLICK DEMO</span>
              </span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-black text-white">
                PRE-SEEDED
              </span>
            </div>
            <p className="text-xs font-bold">
              Test all full-stack features immediately with pre-loaded university courses and active assignments:
            </p>
            <button
              id="btn-demo-login"
              type="button"
              onClick={handleDemoLogin}
              disabled={isSubmitting}
              className="w-full py-2.5 px-3 bg-black text-white font-bold text-xs border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none hover:bg-zinc-800 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span>[ EXPLORE AS ALEX RIVERA (DEMO) ↗ ]</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Column: Auth Window Form */}
        <div className="md:col-span-6">
          <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] overflow-hidden">
            {/* Window Top Controls */}
            <div className="flex items-center justify-between px-4 py-2 bg-emerald-300 dark:bg-emerald-400 text-black border-b-2 border-black">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full border border-black bg-rose-400 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full border border-black bg-yellow-400 inline-block" />
                </div>
                <span className="font-bold text-xs uppercase">
                  USER_AUTHENTICATION.SYS
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase">SSL_ENCRYPTED</span>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {/* Tab Switcher */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  id="tab-login"
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                  }}
                  className={`py-2 text-xs font-black uppercase border-2 border-black dark:border-white transition cursor-pointer ${
                    mode === 'login'
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]'
                      : 'bg-[#FAF7EE] dark:bg-zinc-800 text-black dark:text-white hover:bg-yellow-200'
                  }`}
                >
                  [ SIGN IN ]
                </button>
                <button
                  id="tab-signup"
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setError(null);
                  }}
                  className={`py-2 text-xs font-black uppercase border-2 border-black dark:border-white transition cursor-pointer ${
                    mode === 'signup'
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]'
                      : 'bg-[#FAF7EE] dark:bg-zinc-800 text-black dark:text-white hover:bg-yellow-200'
                  }`}
                >
                  [ CREATE ACCOUNT ]
                </button>
              </div>

              {/* Error Notification */}
              {error && (
                <div className="p-3 bg-rose-100 dark:bg-rose-950/40 border-2 border-rose-600 text-rose-800 dark:text-rose-200 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">
                      STUDENT NAME <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="input-signup-name"
                      type="text"
                      required
                      placeholder="e.g. Jordan Lee"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs font-bold bg-[#FAF7EE] dark:bg-zinc-800 text-black dark:text-white border-2 border-black dark:border-white focus:outline-none placeholder:text-zinc-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase mb-1">
                    EMAIL ADDRESS <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="input-auth-email"
                    type="email"
                    required
                    placeholder="student@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs font-bold bg-[#FAF7EE] dark:bg-zinc-800 text-black dark:text-white border-2 border-black dark:border-white focus:outline-none placeholder:text-zinc-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase mb-1">
                    PASSWORD <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="input-auth-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-3.5 pr-10 py-2 text-xs font-bold bg-[#FAF7EE] dark:bg-zinc-800 text-black dark:text-white border-2 border-black dark:border-white focus:outline-none placeholder:text-zinc-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-black cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  id="btn-auth-submit"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500 text-black font-black text-xs border-2 border-black shadow-[3px_3px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition disabled:opacity-50 cursor-pointer mt-2"
                >
                  {isSubmitting
                    ? 'PROCESSING...'
                    : mode === 'signup'
                    ? '[ CREATE STUDENT ACCOUNT ↗ ]'
                    : '[ SIGN IN TO STUDY PLANNER ↗ ]'}
                </button>
              </form>

              <div className="text-center text-xs font-bold pt-2 border-t border-black/20 dark:border-white/20">
                {mode === 'login' ? (
                  <span>
                    Need an account?{' '}
                    <button
                      onClick={() => {
                        setMode('signup');
                        setError(null);
                      }}
                      className="text-black dark:text-white underline font-black cursor-pointer"
                    >
                      Sign up now
                    </button>
                  </span>
                ) : (
                  <span>
                    Already registered?{' '}
                    <button
                      onClick={() => {
                        setMode('login');
                        setError(null);
                      }}
                      className="text-black dark:text-white underline font-black cursor-pointer"
                    >
                      Sign in here
                    </button>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
