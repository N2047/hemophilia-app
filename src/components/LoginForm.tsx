'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { HeartPulse, Lock, User, LogIn, AlertCircle, Sparkles } from 'lucide-react';

export default function LoginForm() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username.trim() || !password) {
      setError('कृपया प्रयोगकर्ता नाम र पासवर्ड भर्नुहोस्।');
      return;
    }

    setLoading(true);
    const res = await login(username.trim(), password);
    setLoading(false);

    if (!res.success) {
      setError(res.message);
    }
  };

  const handleQuickDemo = (demoUser: string, demoPass: string) => {
    setUsername(demoUser);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-rose-500 text-white shadow-lg shadow-brand-500/30 mb-3">
            <HeartPulse className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            हेमोफिलिया फ्याक्टर व्यवस्थापन
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            नेपाल हेमोफिलिया सोसाइटी (केन्द्रीय तथा स्याटेलाइट लगइन)
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-rose-700 dark:text-rose-300 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              प्रयोगकर्ता नाम (Username)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="उदा: admin वा urlabari_user"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              पासवर्ड (Password)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all text-sm"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-brand-600 to-rose-600 hover:from-brand-700 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-all shadow-md shadow-brand-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>प्रवेश गर्नुहोस् (Login)</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Switcher */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>परीक्षणका लागि Quick Demo खाताहरू:</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickDemo('admin', 'Admin@Secure2026!')}
              className="p-2 rounded-lg text-left bg-slate-50 dark:bg-slate-800/80 hover:bg-brand-50 dark:hover:bg-brand-950/40 border border-slate-200 dark:border-slate-700 hover:border-brand-300 transition-colors"
            >
              <div className="font-semibold text-slate-800 dark:text-slate-200">👑 Super Admin</div>
              <div className="text-[10px] text-slate-400">केन्द्रीय व्यवस्थापक</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('urlabari_user', 'Urlabari@2026!')}
              className="p-2 rounded-lg text-left bg-slate-50 dark:bg-slate-800/80 hover:bg-brand-50 dark:hover:bg-brand-950/40 border border-slate-200 dark:border-slate-700 hover:border-brand-300 transition-colors"
            >
              <div className="font-semibold text-slate-800 dark:text-slate-200">🏥 उर्लाबारी स्याटेलाइट</div>
              <div className="text-[10px] text-slate-400">स्याटेलाइट प्रयोगकर्ता</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('biratnagar_user', 'Biratnagar@2026!')}
              className="p-2 rounded-lg text-left bg-slate-50 dark:bg-slate-800/80 hover:bg-brand-50 dark:hover:bg-brand-950/40 border border-slate-200 dark:border-slate-700 hover:border-brand-300 transition-colors"
            >
              <div className="font-semibold text-slate-800 dark:text-slate-200">🏢 विराटनगर अफिस</div>
              <div className="text-[10px] text-slate-400">क्षेत्रीय कार्यालय</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('dhankuta_user', 'Dhankuta@2026!')}
              className="p-2 rounded-lg text-left bg-slate-50 dark:bg-slate-800/80 hover:bg-brand-50 dark:hover:bg-brand-950/40 border border-slate-200 dark:border-slate-700 hover:border-brand-300 transition-colors"
            >
              <div className="font-semibold text-slate-800 dark:text-slate-200">⛰️ धनकुटा स्याटेलाइट</div>
              <div className="text-[10px] text-slate-400">स्याटेलाइट प्रयोगकर्ता</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
