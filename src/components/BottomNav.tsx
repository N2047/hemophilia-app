'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, Users, Boxes, Syringe, FileSpreadsheet, Settings } from 'lucide-react';

export type ActiveTab = 'dashboard' | 'patients' | 'stock' | 'distribute' | 'reports' | 'admin';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export default function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  const { isSuperAdmin } = useAuth();

  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'ड्यासबोर्ड', icon: LayoutDashboard },
    { id: 'patients' as ActiveTab, label: 'बिरामीहरू', icon: Users },
    { id: 'stock' as ActiveTab, label: 'स्टक', icon: Boxes },
    { id: 'distribute' as ActiveTab, label: 'औषधि वितरण', icon: Syringe },
    { id: 'reports' as ActiveTab, label: 'रिपोर्टहरू', icon: FileSpreadsheet },
    ...(isSuperAdmin ? [{ id: 'admin' as ActiveTab, label: 'प्रशासन', icon: Settings }] : []),
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-t border-slate-200 dark:border-slate-800 lg:hidden safe-area-pb">
      <div className="flex items-center justify-around h-16 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 transition-all ${
                isActive
                  ? 'text-brand-600 dark:text-brand-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-normal'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-all ${
                  isActive ? 'bg-brand-50 dark:bg-brand-950/60 scale-105' : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              </div>
              <span className="text-[11px] leading-tight mt-0.5 truncate max-w-[64px]">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
