'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  Building2,
  Users,
  Boxes,
  Syringe,
  Filter,
  CheckCircle2,
  Sparkles,
  Layers,
  HeartPulse,
  PackageCheck,
  MapPin,
  Clock,
} from 'lucide-react';

export default function ReportsTab() {
  const { user, isSuperAdmin } = useAuth();
  const [selectedReportType, setSelectedReportType] = useState<string>('master');
  const [offices, setOffices] = useState<any[]>([]);
  const [selectedOfficeId, setSelectedOfficeId] = useState<string>('');
  const [downloading, setDownloading] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    fetch('/api/master-data')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data.offices) {
          setOffices(d.data.offices);
        }
      });
  }, []);

  // Fetch Preview records
  const fetchPreview = async () => {
    setPreviewLoading(true);
    try {
      let endpoint = '';
      const officeParam = selectedOfficeId ? `&officeId=${selectedOfficeId}` : '';

      switch (selectedReportType) {
        case 'master':
        case 'distributions':
          endpoint = `/api/stock/distributions?${selectedOfficeId ? `officeId=${selectedOfficeId}` : ''}`;
          break;
        case 'patients':
          endpoint = `/api/patients?${selectedOfficeId ? `officeId=${selectedOfficeId}` : ''}`;
          break;
        case 'central-stock':
          endpoint = `/api/stock/central`;
          break;
        case 'transfers':
          endpoint = `/api/stock/transfers?${officeParam}`;
          break;
        case 'office-stock':
          endpoint = `/api/stock/office?${selectedOfficeId ? `officeId=${selectedOfficeId}` : ''}`;
          break;
        default:
          endpoint = `/api/stock/distributions`;
      }

      const res = await fetch(endpoint);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setPreviewData(json.data || []);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPreviewLoading(false);
    }
  };

  useEffect(() => {
    fetchPreview();
  }, [selectedReportType, selectedOfficeId]);

  // Handle Download Excel
  const handleDownloadExcel = async (typeToDownload?: string) => {
    setDownloading(true);
    try {
      const targetType = typeToDownload || selectedReportType;
      const officeParam = selectedOfficeId ? `&officeId=${selectedOfficeId}` : '';
      const url = `/api/reports/export?type=${targetType}${officeParam}`;
      const res = await fetch(url);
      if (res.ok) {
        const blob = await res.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        const dateStr = new Date().toISOString().slice(0, 10);
        a.download =
          targetType === 'master'
            ? `hemophilia_master_report_4_sheets_${dateStr}.xlsx`
            : `${targetType}-report-${dateStr}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        a.remove();
      } else {
        alert('Excel डाउनलोड गर्दा समस्या आयो।');
      }
    } catch (e) {
      alert('Excel डाउनलोड गर्दा समस्या आयो।');
    } finally {
      setDownloading(false);
    }
  };

  const reportOptions = [
    {
      id: 'master',
      label: '📊 पूर्ण एकीकृत प्रतिवेदन (Master - ४ वटै सिटहरू)',
      description: 'सिट १: बिरामी दर्ता | सिट २: फ्याक्टर स्टक | सिट ३: स्याटेलाइट स्टक | सिट ४: औषधि प्रयोग',
      icon: Layers,
      highlight: true,
    },
    {
      id: 'distributions',
      label: 'औषधि प्रयोग विवरण (Dispensation Log)',
      description: 'बिरामीअनुसार मिति, मात्रा तथा प्रयोजन विवरण',
      icon: Syringe,
    },
    {
      id: 'patients',
      label: 'बिरामी दर्ता सूची (Patient Register)',
      description: 'प्रारम्भिक दर्ता तथा आधारभूत प्रोफाइल',
      icon: Users,
    },
    {
      id: 'office-stock',
      label: 'स्याटेलाइट स्टक (Satellite Inventory)',
      description: 'कुन स्याटेलाइटमा के कति औषधि छ',
      icon: Boxes,
    },
    ...(isSuperAdmin
      ? [
          {
            id: 'central-stock',
            label: 'केन्द्रीय स्टक मौज्दात (Central Stock)',
            description: 'केन्द्रीय भण्डारमा वर्तमान स्टक अवस्था',
            icon: PackageCheck,
          },
          {
            id: 'transfers',
            label: 'स्टक ट्रान्सफर रिपोर्ट (Transfers)',
            description: 'केन्द्रबाट स्याटेलाइट पठाइएको चालान विवरण',
            icon: Building2,
          },
        ]
      : [{ id: 'transfers', label: 'प्राप्त स्टक ट्रान्सफरहरू', description: 'केन्द्रबाट प्राप्त चालानहरू', icon: Building2 }]),
  ];

  return (
    <div className="space-y-6 pb-20 lg:pb-10">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
            <span>रिपोर्ट तथा Excel Export प्रणाली (.xlsx)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            नेपाल हेमोफिलिया सोसाइटी - बहु-सिट (Multi-Sheet) आधिकारिक प्रमाणित प्रतिवेदन
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2.5 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>प्रिन्ट</span>
          </button>
          <button
            onClick={() => handleDownloadExcel()}
            disabled={downloading}
            className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'फाइल बन्दैछ...' : 'छनोट गरिएको Excel डाउनलोड'}</span>
          </button>
        </div>
      </div>

      {/* MASTER 4-SHEET WORKBOOK HIGHLIGHT BANNER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 shadow-xl border border-indigo-900/50">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-44 h-44 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>सिफारिश गरिएको आधिकारिक ढाँचा (Consolidated 4-Sheet Workbook)</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
              पूर्ण एकीकृत Excel प्रतिवेदन (४ वटा छुट्टाछुट्टै सिटहरू सहित)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              एउटै प्रमाणित Excel फाइलभित्र संस्थाका ४ वटै महत्त्वपूर्ण स्तम्भहरू छुट्टाछुट्टै ट्याब (सिटहरू) मा संकलन गरिएको छ:
            </p>

            {/* 4 Sheets Breakdown Pill Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white shrink-0 text-xs">
                  १
                </span>
                <div>
                  <p className="font-bold text-white">हेमोफिलिया बिरामी अभिलेखीकरण</p>
                  <p className="text-[11px] text-slate-300">सुरुको दर्ता, सम्पर्क, ठेगाना र फ्याक्टर स्तर</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="w-6 h-6 rounded-lg bg-teal-600 flex items-center justify-center font-black text-white shrink-0 text-xs">
                  २
                </span>
                <div>
                  <p className="font-bold text-white">फ्याक्टरको स्टकको अवस्था</p>
                  <p className="text-[11px] text-slate-300">वर्तमान केन्द्रीय गोदाम मौज्दात र ब्याच विवरण</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="w-6 h-6 rounded-lg bg-purple-600 flex items-center justify-center font-black text-white shrink-0 text-xs">
                  ३
                </span>
                <div>
                  <p className="font-bold text-white">स्याटेलाइट स्टक विवरण</p>
                  <p className="text-[11px] text-slate-300">कुन स्याटेलाइटमा के कति औषधि छ त्यसको रेकर्ड</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="w-6 h-6 rounded-lg bg-rose-600 flex items-center justify-center font-black text-white shrink-0 text-xs">
                  ४
                </span>
                <div>
                  <p className="font-bold text-white">बिरामी औषधि प्रयोग रिपोर्ट</p>
                  <p className="text-[11px] text-slate-300">प्रत्येक बिरामीको नाममा मिति, मात्रा र प्रयोजन</p>
                </div>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex flex-col gap-2">
            <button
              onClick={() => handleDownloadExcel('master')}
              disabled={downloading}
              className="px-5 py-3.5 rounded-xl font-black text-sm bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/25 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2.5"
            >
              <Download className="w-5 h-5 text-slate-950" />
              <span>{downloading ? 'Excel तयार हुँदैछ...' : '४-सिट Master Excel डाउनलोड (.xlsx)'}</span>
            </button>
            <p className="text-[11px] text-slate-400 text-center">
              Formula injection सुरक्षित • ExcelJS प्रमाणित
            </p>
          </div>
        </div>
      </div>

      {/* Report Selection Filters */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
            १. प्रतिवेदन प्रकार छान्नुहोस् (Report Type):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {reportOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = selectedReportType === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setSelectedReportType(opt.id)}
                  className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold shadow-sm ring-1 ring-emerald-500'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg shrink-0 ${
                      isSelected
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold leading-tight truncate">{opt.label}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal mt-0.5 line-clamp-2">
                      {opt.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Office Filter for Super Admin */}
        {isSuperAdmin && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">
              कार्यालय / स्याटेलाइट अनुसार फिल्टर:
            </label>
            <select
              value={selectedOfficeId}
              onChange={(e) => setSelectedOfficeId(e.target.value)}
              className="p-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg max-w-xs"
            >
              <option value="">सबै कार्यालयहरू (केन्द्र तथा ८ वटै स्याटेलाइट)</option>
              {offices.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.nameNepali} ({o.district})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Live Preview Table */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <span>
              {selectedReportType === 'master'
                ? 'सिफारिस गरिएको Master Excel डाटा पूर्वावलोकन (औषधि प्रयोग लगहरू)'
                : 'रिपोर्ट पूर्वावलोकन (Live Preview)'}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600">
              {previewData.length} रेकर्डहरू
            </span>
          </h2>
          <span className="text-xs text-slate-400">
            डाउनलोड गर्दा आधिकारिक Excel ढाँचामा ४ वटै सिटहरू समावेश हुनेछन्
          </span>
        </div>

        {previewLoading ? (
          <div className="py-8 text-center">
            <div className="w-6 h-6 border-2 border-emerald-300 border-t-emerald-600 rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-400">रेकर्ड लोड हुँदैछ...</p>
          </div>
        ) : previewData.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-6 text-center">कुनै रेकर्ड फेला परेन।</p>
        ) : (
          <div className="overflow-x-auto max-h-96 rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 font-bold sticky top-0 text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="p-2.5">बिरामीको नाम / विवरण</th>
                  <th className="p-2.5">कोड / ब्याच</th>
                  <th className="p-2.5">मिति / फ्याक्टर</th>
                  <th className="p-2.5 text-right">प्रयोग / मौज्दात</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {previewData.slice(0, 50).map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="p-2.5 font-bold text-slate-900 dark:text-white">
                      {row.patient?.fullName || row.fullName || row.productName || row.company?.name || row.voucherNumber}
                    </td>
                    <td className="p-2.5 text-slate-600 dark:text-slate-400">
                      {row.patient?.patientCode || row.patientCode || row.batchNumber || row.destinationOffice?.nameNepali || row.phone}
                    </td>
                    <td className="p-2.5 text-slate-500">
                      {row.distributionDate
                        ? new Date(row.distributionDate).toLocaleDateString('ne-NP')
                        : row.receiptDate
                        ? new Date(row.receiptDate).toLocaleDateString('ne-NP')
                        : row.factorType || '-'}
                    </td>
                    <td className="p-2.5 text-right font-black text-slate-800 dark:text-slate-200">
                      {row.totalVials != null
                        ? `${row.totalVials} भाइल (${row.totalIu?.toLocaleString()} IU)`
                        : row.currentVials != null
                        ? `${row.currentVials} भाइल`
                        : row.bloodGroup || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
