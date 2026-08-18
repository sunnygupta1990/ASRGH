import React, { useState } from 'react';
import { LockKeyhole, LogIn, ShieldCheck, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminLoginPanel: React.FC = () => {
  const {
    authLoading,
    loginAdminUser,
    setIsAdminPortalOpen,
  } = useApp();

  const [identifier, setIdentifier] = useState('admin@asrgh.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    try {
      await loginAdminUser(identifier, password);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Unable to sign in',
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="bg-slate-900 text-white px-6 py-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-black text-lg">ASRGH Admin Login</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Aggarwal Sabha Rohini Group Housing
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsAdminPortalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close admin login"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Employee ID / Email
            </label>
            <input
              type="text"
              required
              autoComplete="username"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-900 outline-none text-sm"
              placeholder="Employee ID or admin@asrgh.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-900 outline-none text-sm"
                placeholder="Enter your password"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-xs font-semibold text-rose-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={authLoading}
            className="w-full px-4 py-3 bg-blue-950 hover:bg-blue-900 disabled:opacity-60 text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            <span>{authLoading ? 'Signing in...' : 'Sign in to Admin Portal'}</span>
          </button>

          <p className="text-[11px] leading-relaxed text-slate-400 text-center">
            Access is restricted to authorized ASRGH administrators and employees.
          </p>
        </form>
      </div>
    </div>
  );
};
