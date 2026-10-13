'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { HeartPulse, Moon, Sun, LogOut, ShieldCheck, Building2, UserCircle, Smartphone } from 'lucide-react';
import InstallAppModal from './InstallAppModal';

export default function Header() {
  const { user, logout, theme, toggleTheme, isSuperAdmin } = useAuth();
  const [showInstallModal, setShowInstallModal] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-white flex items-center justify-center shadow-md shadow-brand-500/20">
            <HeartPulse className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg leading-tight text-slate-900 dark:text-white">
                हेमोफिलिया फ्याक्टर
              </span>
              <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                PWA Mobile
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              नेपाल हेमोफिलिया सोसाइटी
            </p>
          </div>
        </div>

        {/* Right: User State, Office Badge & Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          {user && (
            <div className="hidden md:flex items-center gap-3 pr-2 border-r border-slate-200 dark:border-slate-800">
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                  {user.name}
                </p>
                <div className="flex items-center justify-end gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  {isSuperAdmin ? (
                    <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      केन्द्रीय प्रशासक (Super Admin)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-teal-600 dark:text-teal-400 font-medium">
                      <Building2 className="w-3.5 h-3.5" />
                      {user.officeName || 'कार्यालय प्रयोगकर्ता'}
                    </span>
                  )}
                </div>
              </div>
              <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
                <UserCircle className="w-6 h-6" />
              </div>
            </div>
          )}

          {/* Mobile Install App Button */}
          <button
            onClick={() => setShowInstallModal(true)}
            title="मोबाइलमा एप इन्स्टल गर्नुहोस् (Android / iPhone)"
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-brand-600 to-rose-600 hover:from-brand-700 hover:to-rose-700 text-white shadow-sm shadow-brand-500/20 active:scale-95 transition-all"
          >
            <Smartphone className="w-4 h-4 animate-bounce" />
            <span className="hidden sm:inline">मोबाइल एप</span>
            <span className="sm:hidden">एप</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Dark/Light Mode"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Logout */}
          {user && (
            <button
              onClick={() => logout()}
              title="लगआउट गर्नुहोस्"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">लगआउट</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile App Install Modal */}
      <InstallAppModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />
    </header>
  );
}
