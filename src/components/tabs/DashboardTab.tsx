'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ActiveTab } from '../BottomNav';
import {
  Boxes,
  Users,
  Syringe,
  AlertTriangle,
  Clock,
  Building2,
  TrendingUp,
  PlusCircle,
  ArrowRight,
  ShieldAlert,
  Calendar,
  AlertOctagon,
} from 'lucide-react';

interface DashboardTabProps {
  onNavigate: (tab: ActiveTab) => void;
}

export default function DashboardTab({ onNavigate }: DashboardTabProps) {
  const { user, isSuperAdmin } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard/stats');
      if (res.ok) {
        const json = await res.json();
        if (json.success) setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-medium">ड्यासबोर्ड लोड हुँदैछ...</p>
      </div>
    );
  }

  const summary = data?.summary || {};
  const alerts = data?.alerts || {};
  const emergencyAlerts = data?.emergencyAlerts;

  return (
    <div className="space-y-6 pb-20 lg:pb-10">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-700 via-rose-700 to-rose-900 text-white p-6 shadow-lg shadow-brand-900/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-xs font-semibold mb-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>आज: {new Date().toLocaleDateString('ne-NP')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              नमस्ते, {user?.name}!
            </h1>
            <p className="text-rose-100 text-sm mt-1 max-w-xl">
              {isSuperAdmin
                ? 'केन्द्रीय कार्यालय व्यवस्थापन ड्यासबोर्ड: सम्पूर्ण स्याटेलाइट, स्टक तथा बिरामी वितरणको वास्तविक स्थिति।'
                : `${user?.officeName || 'कार्यालय'} ड्यासबोर्ड: औषधि मौज्दात, बिरामी खोजी तथा वितरण व्यवस्थापन।`}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigate('distribute')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-white text-brand-700 hover:bg-rose-50 transition-all shadow-md active:scale-95"
            >
              <Syringe className="w-4 h-4" />
              <span>औषधि वितरण</span>
            </button>
            <button
              onClick={() => onNavigate('patients')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-brand-800/80 hover:bg-brand-900 text-white border border-white/20 transition-all shadow-md active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>नयाँ बिरामी दर्ता</span>
            </button>
            {isSuperAdmin && (
              <button
                onClick={() => onNavigate('stock')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-white/20 hover:bg-white/30 text-white border border-white/20 transition-all active:scale-95"
              >
                <Boxes className="w-4 h-4" />
                <span>स्टक ट्रान्सफर</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 🚨 Emergency Low Stock Blinking Alert Banner (पिलिक पिलिक एनिमेसन सहित) */}
      {emergencyAlerts?.hasEmergency && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-50 via-rose-50 to-red-100 dark:from-red-950/70 dark:via-rose-950/50 dark:to-slate-900 border-2 border-red-500 shadow-xl shadow-red-500/15 animate-emergency-glow p-5 sm:p-6 transition-all">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-red-200 dark:border-red-800/60">
            <div className="flex items-start sm:items-center gap-3">
              <div className="relative p-3 rounded-2xl bg-red-600 text-white shadow-lg shadow-red-600/40 shrink-0">
                <AlertOctagon className="w-6 h-6 animate-bounce" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-lg sm:text-xl font-black text-red-950 dark:text-red-100 tracking-tight">
                    आपतकालीन मौज्दात चेतावनी (Emergency Stock Alert)
                  </h2>
                  {/* पिलिक पिलिक अक्षर एनिमेसन */}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white font-black text-xs uppercase tracking-widest shadow-md shadow-red-600/30">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    <span className="animate-pilik-pilik font-black text-sm tracking-widest">
                      🚨 स्टक LOW
                    </span>
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-red-800 dark:text-red-300 mt-1 font-medium">
                  {isSuperAdmin
                    ? 'केन्द्रीय वा स्याटलाइट स्टकमा तोकिएको न्यूनतम सीमाभन्दा कम औषधि भएकोले तत्काल आपूर्ति आवश्यक छ।'
                    : `${emergencyAlerts.satelliteF8?.officeName || user?.officeName || 'कार्यालय'}मा Factor VIII मौज्दात ३,००० IU भन्दा न्यून भएकोले तत्काल आपतकालीन माग पठाउनुहोस्।`}
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <button
                onClick={() => onNavigate('stock')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/30 transition-all active:scale-95"
              >
                <Boxes className="w-4 h-4" />
                <span>{isSuperAdmin ? 'स्टक व्यवस्थापन (इन्ट्री/ट्रान्सफर)' : 'स्टक मौज्दात हेर्नुहोस्'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Alert Cards Breakdown */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {/* 1. Super Admin: Central Factor VIII Alert (< 30,000 IU) */}
            {isSuperAdmin && emergencyAlerts.centralF8?.isLow && (
              <div className="p-4 rounded-xl bg-white/95 dark:bg-slate-900/95 border-2 border-red-500 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    केन्द्रीय स्टक (Central Stock)
                  </span>
                  <span className="animate-pilik-pilik text-xs font-black text-red-600 bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded-md border border-red-200 dark:border-red-800">
                    🚨 स्टक LOW
                  </span>
                </div>
                <div className="text-base font-black text-slate-900 dark:text-white">
                  Factor VIII (८)
                </div>
                <div className="mt-2 flex items-baseline justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">हालको मौज्दात:</span>
                  <span className="font-black text-red-600 dark:text-red-400 text-lg">
                    {emergencyAlerts.centralF8.currentIu.toLocaleString()} IU ({emergencyAlerts.centralF8.currentVials} भाइल)
                  </span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 flex justify-between mt-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span>न्यूनतम सीमा: <b>३०,००० IU</b></span>
                  <span className="text-red-600 font-bold">
                    कम: {emergencyAlerts.centralF8.deficitIu.toLocaleString()} IU
                  </span>
                </div>
              </div>
            )}

            {/* 2. Super Admin: Central Factor IX Alert (< 5,000 IU) */}
            {isSuperAdmin && emergencyAlerts.centralF9?.isLow && (
              <div className="p-4 rounded-xl bg-white/95 dark:bg-slate-900/95 border-2 border-red-500 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    केन्द्रीय स्टक (Central Stock)
                  </span>
                  <span className="animate-pilik-pilik text-xs font-black text-red-600 bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded-md border border-red-200 dark:border-red-800">
                    🚨 स्टक LOW
                  </span>
                </div>
                <div className="text-base font-black text-slate-900 dark:text-white">
                  Factor IX (९)
                </div>
                <div className="mt-2 flex items-baseline justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">हालको मौज्दात:</span>
                  <span className="font-black text-red-600 dark:text-red-400 text-lg">
                    {emergencyAlerts.centralF9.currentIu.toLocaleString()} IU ({emergencyAlerts.centralF9.currentVials} भाइल)
                  </span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 flex justify-between mt-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span>न्यूनतम सीमा: <b>५,००० IU</b></span>
                  <span className="text-red-600 font-bold">
                    कम: {emergencyAlerts.centralF9.deficitIu.toLocaleString()} IU
                  </span>
                </div>
              </div>
            )}

            {/* 3. Office User: Own Satellite Factor VIII Alert (< 3,000 IU) */}
            {!isSuperAdmin && emergencyAlerts.satelliteF8?.isLow && (
              <div className="p-4 rounded-xl bg-white/95 dark:bg-slate-900/95 border-2 border-red-500 shadow-sm relative overflow-hidden col-span-full">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    {emergencyAlerts.satelliteF8.officeName}
                  </span>
                  <span className="animate-pilik-pilik text-xs font-black text-red-600 bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded-md border border-red-200 dark:border-red-800">
                    🚨 स्टक LOW
                  </span>
                </div>
                <div className="text-base font-black text-slate-900 dark:text-white">
                  Factor VIII (८) मौज्दात ३,००० IU भन्दा न्यून!
                </div>
                <div className="mt-2 flex items-baseline justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">हाल बाँकी:</span>
                  <span className="font-black text-red-600 dark:text-red-400 text-xl">
                    {emergencyAlerts.satelliteF8.currentIu.toLocaleString()} IU ({emergencyAlerts.satelliteF8.currentVials} भाइल)
                  </span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 flex justify-between mt-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span>न्यूनतम सुरक्षित मौज्दात: <b>३,००० IU</b></span>
                  <span className="text-red-600 font-bold">
                    अपुग: {emergencyAlerts.satelliteF8.deficitIu.toLocaleString()} IU
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 4. Super Admin: List of Satellite Offices with Factor VIII < 3,000 IU */}
          {isSuperAdmin && emergencyAlerts.satelliteF8List?.length > 0 && (
            <div className="mt-4 pt-3.5 border-t border-red-200 dark:border-red-800/60">
              <div className="flex items-center justify-between mb-2.5">
                <div className="text-xs font-black uppercase tracking-wider text-red-900 dark:text-red-200 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-red-600 shrink-0" />
                  <span>
                    Factor VIII न्यून (कम) भएका स्याटलाइट कार्यालयहरू (३,००० IU भन्दा कम):
                  </span>
                </div>
                <span className="text-xs font-bold text-red-700 dark:text-red-300">
                  {emergencyAlerts.satelliteF8List.length} वटा स्याटलाइटमा कम
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {emergencyAlerts.satelliteF8List.map((sat: any) => (
                  <div
                    key={sat.officeId}
                    className="p-2.5 rounded-xl bg-white/95 dark:bg-slate-900/95 border border-red-300 dark:border-red-800 flex items-center justify-between gap-2 shadow-sm hover:border-red-500 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {sat.officeName}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <span>F-VIII:</span>
                        <span className="font-black text-red-600 dark:text-red-400">
                          {sat.currentIu.toLocaleString()} IU
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-1">
                      <span className="animate-pilik-pilik text-[10px] font-black text-red-600 bg-red-100 dark:bg-red-950/80 px-1.5 py-0.5 rounded border border-red-300 dark:border-red-800">
                        स्टक LOW
                      </span>
                      <button
                        onClick={() => onNavigate('stock')}
                        className="text-[10px] text-brand-600 hover:text-brand-700 font-bold underline inline-flex items-center gap-0.5"
                      >
                        पठाउनुहोस् <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Critical Inventory Alerts if any */}
      {(summary.lowStockCount > 0 || summary.expiringSoonCount > 0 || summary.expiredCount > 0) && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500 text-white shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                स्टक सचेतना सूचना (Inventory Alerts)
              </h2>
              <div className="flex flex-wrap gap-3 mt-0.5 text-xs text-amber-800 dark:text-amber-300">
                {summary.lowStockCount > 0 && (
                  <span>⚠️ कम स्टक: <b>{summary.lowStockCount}</b> ब्याच</span>
                )}
                {summary.expiringSoonCount > 0 && (
                  <span>⏳ ९० दिनभित्र म्याद सकिने: <b>{summary.expiringSoonCount}</b> ब्याच</span>
                )}
                {summary.expiredCount > 0 && (
                  <span className="text-rose-700 dark:text-rose-300 font-semibold">
                    🚫 म्याद समाप्त/रोकिएको: <b>{summary.expiredCount}</b> ब्याच
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('stock')}
            className="text-xs font-bold text-amber-900 dark:text-amber-200 hover:underline inline-flex items-center gap-1 shrink-0"
          >
            स्टकमा हेर्नुहोस् <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Stock Vials & IU */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {isSuperAdmin ? 'केन्द्रीय बाँकी स्टक' : 'कार्यालय मौज्दात'}
            </span>
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {isSuperAdmin ? summary.totalCentralVials || 0 : summary.totalOfficeVials || 0}{' '}
              <span className="text-sm font-semibold text-slate-500">भाइल</span>
            </div>
            <p className="text-xs font-bold text-teal-600 dark:text-teal-400 mt-1">
              कुल IU: {((isSuperAdmin ? summary.totalCentralIu : summary.totalOfficeIu) || 0).toLocaleString()} IU
            </p>
          </div>
        </div>

        {/* Card 2: Distributions Count */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              कुल औषधि वितरण
            </span>
            <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400">
              <Syringe className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {summary.totalDistributions || 0}{' '}
              <span className="text-sm font-semibold text-slate-500">पटक</span>
            </div>
            <p className="text-xs font-bold text-brand-600 dark:text-brand-400 mt-1">
              कुल वितरित: {(summary.totalDistributedIu || 0).toLocaleString()} IU ({summary.totalDistributedVials || 0} भाइल)
            </p>
          </div>
        </div>

        {/* Card 3: Registered Patients (or Office Transfer count) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {isSuperAdmin ? 'दर्ता भएका बिरामी' : 'कार्यालय रिपोर्ट'}
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {isSuperAdmin ? summary.totalPatients || 0 : summary.totalDistributions || 0}{' '}
              <span className="text-sm font-semibold text-slate-500">जना</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {isSuperAdmin ? 'सक्रिय दर्ता अभिलेख' : 'बिरामी वितरण अभिलेख'}
            </p>
          </div>
        </div>

        {/* Card 4: Inventory Health */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              स्टक स्थिति
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
              सुरक्षित
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {summary.expiringSoonCount || 0} ब्याच म्याद नजिक
            </p>
          </div>
        </div>
      </div>

      {/* Section: Factor-wise Breakdown & Office Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Factor Breakdown */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center justify-between">
            <span>फ्याक्टर प्रकारअनुसार बाँकी स्टक</span>
            <span className="text-xs font-medium text-slate-500">Vials / IU</span>
          </h2>

          <div className="space-y-3">
            {Object.entries(
              (isSuperAdmin ? summary.factorWiseCentral : summary.factorWiseOffice) || {}
            ).length === 0 ? (
              <p className="text-sm text-slate-400 italic py-4 text-center">हाल मौज्दात शून्य छ।</p>
            ) : (
              Object.entries(
                (isSuperAdmin ? summary.factorWiseCentral : summary.factorWiseOffice) || {}
              ).map(([factor, val]: [string, any]) => (
                <div
                  key={factor}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                      {factor}
                    </span>
                    {/* Blinking indicator for low stock */}
                    {isSuperAdmin && factor === 'Factor VIII' && val.iu < 30000 && (
                      <span className="animate-pilik-pilik text-[10px] font-black text-red-600 bg-red-100 dark:bg-red-950 px-1.5 py-0.5 rounded border border-red-300 dark:border-red-800">
                        🚨 स्टक LOW (&lt;३०,००० IU)
                      </span>
                    )}
                    {isSuperAdmin && factor === 'Factor IX' && val.iu < 5000 && (
                      <span className="animate-pilik-pilik text-[10px] font-black text-red-600 bg-red-100 dark:bg-red-950 px-1.5 py-0.5 rounded border border-red-300 dark:border-red-800">
                        🚨 स्टक LOW (&lt;५,००० IU)
                      </span>
                    )}
                    {!isSuperAdmin && factor === 'Factor VIII' && val.iu < 3000 && (
                      <span className="animate-pilik-pilik text-[10px] font-black text-red-600 bg-red-100 dark:bg-red-950 px-1.5 py-0.5 rounded border border-red-300 dark:border-red-800">
                        🚨 स्टक LOW (&lt;३,००० IU)
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-sm font-black ${
                        (isSuperAdmin &&
                          ((factor === 'Factor VIII' && val.iu < 30000) ||
                            (factor === 'Factor IX' && val.iu < 5000))) ||
                        (!isSuperAdmin && factor === 'Factor VIII' && val.iu < 3000)
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-brand-600 dark:text-brand-400'
                      }`}
                    >
                      {val.vials} भाइल
                    </span>
                    <span className="text-xs text-slate-500 block">
                      {val.iu.toLocaleString()} IU
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Office Breakdown for Super Admin, or Recent Activities for Satellite */}
        {isSuperAdmin ? (
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center justify-between">
              <span>कार्यालय/स्याटेलाइटअनुसार बाँकी स्टक</span>
              <button
                onClick={() => onNavigate('reports')}
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
              >
                विस्तृत हेर्नुहोस्
              </button>
            </h2>

            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
              {(summary.officeWiseStock || []).length === 0 ? (
                <p className="text-sm text-slate-400 italic py-4 text-center">कुनै कार्यालयमा स्टक छैन।</p>
              ) : (
                summary.officeWiseStock.map((o: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                        {o.officeName}
                      </span>
                      {emergencyAlerts?.satelliteF8List?.some((s: any) => s.officeName === o.officeName) && (
                        <span className="animate-pilik-pilik text-[10px] font-black text-red-600 bg-red-100 dark:bg-red-950 px-1.5 py-0.5 rounded border border-red-300 dark:border-red-800">
                          🚨 F-VIII LOW
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-slate-900 dark:text-white">
                        {o.vials} भाइल
                      </span>
                      <span className="text-xs text-teal-600 dark:text-teal-400 font-semibold block">
                        {o.iu.toLocaleString()} IU
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center justify-between">
              <span>पछिल्ला औषधि वितरणहरू</span>
              <button
                onClick={() => onNavigate('distribute')}
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
              >
                सबै हेर्नुहोस्
              </button>
            </h2>

            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
              {(data?.recentActivities?.recentDistributions || []).length === 0 ? (
                <p className="text-sm text-slate-400 italic py-4 text-center">वितरण रेकर्ड छैन।</p>
              ) : (
                data.recentActivities.recentDistributions.map((d: any) => (
                  <div
                    key={d.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-sm">
                        {d.patient?.fullName}
                      </div>
                      <span className="text-slate-400">
                        {d.voucherNumber} • {new Date(d.distributionDate).toLocaleDateString('ne-NP')}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-brand-600 dark:text-brand-400 text-sm">
                        {d.totalVials} भाइल
                      </span>
                      <span className="text-slate-500 block">{d.totalIu.toLocaleString()} IU</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
