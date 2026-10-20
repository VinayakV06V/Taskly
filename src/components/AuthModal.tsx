import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, ArrowRight, X, AlertCircle, Sparkles } from 'lucide-react';
import { User } from '../types';
import { TasklyLogo } from './TasklyLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onSuccess: (user: User, token: string) => void;
  canDismiss?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  canDismiss = true,
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }
    if (mode === 'register' && !name.trim()) {
      setError('Please provide your full name.');
      return;
    }

    setLoading(true);
    try {
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const body = mode === 'register' ? { name, email, password } : { email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Authentication failed. Please verify credentials.');
        return;
      }

      localStorage.setItem('taskpulse_token', data.token);
      onSuccess(data.user, data.token);
    } catch {
      setError('Connection failed. Please check network and retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/guest-login', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('taskpulse_token', data.token);
        onSuccess(data.user, data.token);
      } else {
        setError(data.error || 'Guest sign in failed.');
      }
    } catch {
      setError('Unable to log in as guest.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl p-6 sm:p-8 overflow-hidden relative border border-slate-100">
        {canDismiss && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors btn-press cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Brand Kicker */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <TasklyLogo size="xl" showText={false} />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 font-['Outfit',sans-serif]">
            {mode === 'signin' ? 'Sign in to Taskly' : 'Create Taskly Account'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {mode === 'signin'
              ? 'Organize your tasks, build streaks, and manage workflows.'
              : 'Join to start tracking tasks and recurring habits.'}
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex p-1 bg-[#F8FAFD] rounded-2xl border border-slate-200/70 mb-5">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all btn-press cursor-pointer font-['Outfit',sans-serif] ${
              mode === 'signin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all btn-press cursor-pointer font-['Outfit',sans-serif] ${
              mode === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full bg-[#F8FAFD] border border-slate-200 focus:border-[#FF5E5E] focus:ring-2 focus:ring-[#FF5E5E]/10 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-800 outline-none transition-all font-medium"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full bg-[#F8FAFD] border border-slate-200 focus:border-[#FF5E5E] focus:ring-2 focus:ring-[#FF5E5E]/10 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-800 outline-none transition-all font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#F8FAFD] border border-slate-200 focus:border-[#FF5E5E] focus:ring-2 focus:ring-[#FF5E5E]/10 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-800 outline-none transition-all font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 text-xs font-bold text-white bg-[#FF5E5E] hover:bg-[#FF4545] disabled:opacity-50 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#FF5E5E]/25 btn-press"
          >
            <span>{loading ? 'Authenticating...' : mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-white text-slate-400 font-medium">or</span>
          </div>
        </div>

        {/* One-click Guest Button */}
        <button
          type="button"
          onClick={handleGuestLogin}
          disabled={loading}
          className="w-full py-2.5 px-3 text-xs font-bold text-slate-700 hover:text-slate-900 bg-[#F8FAFD] hover:bg-slate-100 border border-slate-200/80 rounded-xl transition-colors flex items-center justify-center gap-2 btn-press cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Continue as Guest</span>
        </button>
      </div>
    </div>
  );
};
