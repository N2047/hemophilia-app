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
                  <div className="font-bold text-sm text-slate-800 dark:text-slate-200">
                    {factor}
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-brand-600 dark:text-brand-400">
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
