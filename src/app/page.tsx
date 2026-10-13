'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import BottomNav, { ActiveTab } from '@/components/BottomNav';
import LoginForm from '@/components/LoginForm';

// Tabs
import DashboardTab from '@/components/tabs/DashboardTab';
import PatientsTab from '@/components/tabs/PatientsTab';
import StockTab from '@/components/tabs/StockTab';
import DistributeTab from '@/components/tabs/DistributeTab';
import ReportsTab from '@/components/tabs/ReportsTab';
import AdminTab from '@/components/tabs/AdminTab';

export default function HomePage() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [prefilledPatient, setPrefilledPatient] = useState<any | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-slate-50 dark:bg-slate-950">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-500">प्रणाली सुरु हुँदैछ...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <Header />
        <LoginForm />
      </main>
    );
  }

  // Handle cross-tab navigation: Patient profile click -> switch to Distribute tab
  const handleDistributePatient = (patient: any) => {
    setPrefilledPatient(patient);
    setActiveTab('distribute');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Header />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {activeTab === 'dashboard' && <DashboardTab onNavigate={setActiveTab} />}
          {activeTab === 'patients' && (
            <PatientsTab onDistributePatient={handleDistributePatient} />
          )}
          {activeTab === 'stock' && <StockTab />}
          {activeTab === 'distribute' && (
            <DistributeTab
              initialPatient={prefilledPatient}
              onClearInitialPatient={() => setPrefilledPatient(null)}
            />
          )}
          {activeTab === 'reports' && <ReportsTab />}
          {activeTab === 'admin' && <AdminTab />}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
