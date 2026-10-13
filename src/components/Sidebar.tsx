'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { ActiveTab } from './BottomNav';
import {
  LayoutDashboard,
  Users,
  Boxes,
  Syringe,
  FileSpreadsheet,
  Settings,
  ShieldCheck,
  Building2,
} from 'lucide-react';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { isSuperAdmin, user } = useAuth();

  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'ड्यासबोर्ड (Dashboard)', icon: LayoutDashboard },
    { id: 'patients' as ActiveTab, label: 'बिरामी दर्ता र अभिलेख', icon: Users },
    { id: 'stock' as ActiveTab, label: isSuperAdmin ? 'केन्द्रीय स्टक व्यवस्थापन' : 'कार्यालय स्टक मौज्दात', icon: Boxes },
    { id: 'distribute' as ActiveTab, label: 'बिरामीलाई औषधि वितरण', icon: Syringe },
    { id: 'reports' as ActiveTab, label: 'रिपोर्ट तथा Excel Export', icon: FileSpreadsheet },
    ...(isSuperAdmin
      ? [{ id: 'admin' as ActiveTab, label: 'प्रशासनिक सेटिङ तथा Audit', icon: Settings }]
      : []),
  ];

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Current Context Card */}
      <div className="p-4 m-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {isSuperAdmin ? (
            <>
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span>केन्द्रीय प्रणाली (Central)</span>
            </>
          ) : (
            <>
              <Building2 className="w-4 h-4 text-teal-500" />
              <span>स्थानीय कार्यालय (Local)</span>
            </>
          )}
        </div>
        <p className="mt-1 font-bold text-slate-900 dark:text-slate-100 text-sm truncate">
          {user?.officeName || 'केन्द्रीय व्यवस्थापक'}
        </p>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-3 space-y-1.5 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/70 dark:text-brand-300 shadow-sm border border-brand-200/60 dark:border-brand-800/60'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Icon
                className={`w-5 h-5 ${
                  isActive ? 'text-brand-600 dark:text-brand-400 stroke-[2.5]' : 'stroke-2'
                }`}
              />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
        <p className="font-semibold text-slate-700 dark:text-slate-300">Hemophilia Society v1.0</p>
        <p className="mt-0.5">नेपाल हेमोफिलिया सोसाइटी</p>
      </div>
    </aside>
  );
}
