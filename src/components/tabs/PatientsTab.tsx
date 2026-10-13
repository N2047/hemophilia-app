'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  NEPAL_ADMINISTRATIVE_DATA,
  getDistrictsByProvince,
  getLocalLevelsByDistrict,
  getWardsForLocalLevel,
} from '@/data/nepalAdministrativeData';
import { calculateFactorSeverity } from '@/lib/severityCalculator';
import {
  Search,
  UserPlus,
  User,
  Phone,
  MapPin,
  Activity,
  Calendar,
  AlertCircle,
  X,
  Syringe,
  History,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Download,
  FileSpreadsheet,
  FileText,
  Eye,
  Building2,
  ShieldAlert,
  Sparkles,
  Trash2,
} from 'lucide-react';

interface PatientsTabProps {
  onDistributePatient?: (patient: any) => void;
}

export default function PatientsTab({ onDistributePatient }: PatientsTabProps) {
  const { user, isSuperAdmin } = useAuth();
  const [patients, setPatients] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [patientDetails, setPatientDetails] = useState<any | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [offices, setOffices] = useState<any[]>([]);
  const [downloadingExcel, setDownloadingExcel] = useState(false);
  const [availableFactorTypes, setAvailableFactorTypes] = useState<string[]>([
    'Factor VIII',
    'Factor IX',
    'Factor VII',
    'Factor II',
    'Factor XI',
    'Factor X',
    'Other',
  ]);
  const [availableBloodGroups, setAvailableBloodGroups] = useState<string[]>([
    'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-',
  ]);

  // Registration Form State
  const [form, setForm] = useState({
    fullName: '',
    dateOfBirth: '',
    isDobEstimated: false,
    age: 20,
    gender: 'पुरुष',
    phone: '',
    bloodGroup: 'O+',
    province: 'province-1',
    district: 'morang',
    localLevel: 'biratnagar-metro',
    wardNo: 1,
    toleAddress: '',
    tempAddress: '',
    factorType: 'Factor VIII',
    otherFactorDetails: '',
    factorLevelPercent: '',
    severity: 'SEVERE',
    severityOverridden: false,
    overrideReason: '',
    registeredOfficeId: user?.officeId || 'OFFICE_BIRATNAGAR',
  });

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<any | null>(null);

  // Deletion Confirmation States
  const [patientToDelete, setPatientToDelete] = useState<any | null>(null);
  const [distributionToDelete, setDistributionToDelete] = useState<{ id: string; voucherNumber: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [actionToast, setActionToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch Patients
  const fetchPatients = async (query = '') => {
    try {
      setLoading(true);
      const url = query ? `/api/patients?q=${encodeURIComponent(query)}` : '/api/patients';
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.success) setPatients(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Master Offices
  useEffect(() => {
    fetchPatients();
    fetch('/api/master-data')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          if (d.data.offices) {
            setOffices(d.data.offices);
            if (!user?.officeId && d.data.offices.length > 0) {
              setForm((prev) => ({ ...prev, registeredOfficeId: d.data.offices[0].id }));
            }
          }
          if (d.data.factorTypes && d.data.factorTypes.length > 0) {
            setAvailableFactorTypes(d.data.factorTypes);
          }
          if (d.data.bloodGroups && d.data.bloodGroups.length > 0) {
            setAvailableBloodGroups(d.data.bloodGroups);
          }
        }
      });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPatients(searchQuery);
  };

  // View Patient Details & Consumption History
  const openPatientProfile = async (p: any) => {
    setSelectedPatient(p);
    setDetailsLoading(true);
    try {
      const res = await fetch(`/api/patients/${p.id}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) setPatientDetails(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Download Single Patient Excel Dossier
  const handleDownloadPatientExcel = async (patientId: string, fullName: string) => {
    setDownloadingExcel(true);
    try {
      const res = await fetch(`/api/reports/export?type=patient-single&patientId=${encodeURIComponent(patientId)}`);
      if (res.ok) {
        const blob = await res.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        const safeName = fullName.replace(/[^a-zA-Z0-9_\u0900-\u097F]/g, '_');
        a.download = `patient_${safeName}_dispensation_report.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        a.remove();
      } else {
        alert('Excel फाइल तयार गर्दा समस्या आयो।');
      }
    } catch (e) {
      alert('डाउनलोड गर्दा समस्या आयो।');
    } finally {
      setDownloadingExcel(false);
    }
  };

  // Print Patient Dossier
  const handlePrintPatientDossier = () => {
    window.print();
  };

  // Delete Patient Record
  const handleDeletePatient = async () => {
    if (!patientToDelete) return;
    try {
      setDeleteLoading(true);
      setDeleteError(null);
      const res = await fetch(`/api/patients/${patientToDelete.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        setActionToast({
          type: 'success',
          message: json.message || 'बिरामीको तथ्यांक सफलतापूर्वक हटाइयो।',
        });
        setPatientToDelete(null);
        if (selectedPatient?.id === patientToDelete.id) {
          setSelectedPatient(null);
          setPatientDetails(null);
        }
        fetchPatients(searchQuery);
      } else {
        setDeleteError(json.message || 'तथ्यांक मेटाउन सकिएन।');
      }
    } catch (err: any) {
      setDeleteError('नेटवर्क समस्याका कारण मेटाउन सकिएन।');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Delete Individual Distribution Record
  const handleDeleteDistribution = async () => {
    if (!distributionToDelete) return;
    try {
      setDeleteLoading(true);
      setDeleteError(null);
      const res = await fetch(`/api/stock/distributions/${distributionToDelete.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        setActionToast({
          type: 'success',
          message: json.message || 'वितरण भौचर सफलतापूर्वक हटाइयो।',
        });
        setDistributionToDelete(null);
        if (selectedPatient) {
          openPatientProfile(selectedPatient);
        }
        fetchPatients(searchQuery);
      } else {
        setDeleteError(json.message || 'भौचर मेटाउन सकिएन।');
      }
    } catch (err: any) {
      setDeleteError('नेटवर्क समस्याका कारण मेटाउन सकिएन।');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Calculate live severity whenever factorType or factorLevelPercent changes
  useEffect(() => {
    if (!form.severityOverridden) {
      const levelNum = form.factorLevelPercent === '' ? null : parseFloat(form.factorLevelPercent);
      const calc = calculateFactorSeverity(form.factorType, levelNum);
      setForm((prev) => ({ ...prev, severity: calc.severity }));
    }
  }, [form.factorType, form.factorLevelPercent, form.severityOverridden]);

  // Handle DOB change -> auto-calculate age
  const handleDobChange = (dobStr: string) => {
    setForm((prev) => {
      let calcAge = prev.age;
      if (dobStr) {
        const dob = new Date(dobStr);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
          age--;
        }
        calcAge = age >= 0 ? age : 0;
      }
      return {
        ...prev,
        dateOfBirth: dobStr,
        age: calcAge,
        isDobEstimated: false,
      };
    });
  };

  // Cascading Address Handlers
  const handleProvinceChange = (pId: string) => {
    const districts = getDistrictsByProvince(pId);
    const firstDistrict = districts[0]?.id || '';
    const locals = getLocalLevelsByDistrict(pId, firstDistrict);
    const firstLocal = locals[0]?.id || '';
    setForm((prev) => ({
      ...prev,
      province: pId,
      district: firstDistrict,
      localLevel: firstLocal,
      wardNo: 1,
    }));
  };

  const handleDistrictChange = (dId: string) => {
    const locals = getLocalLevelsByDistrict(form.province, dId);
    const firstLocal = locals[0]?.id || '';
    setForm((prev) => ({
      ...prev,
      district: dId,
      localLevel: firstLocal,
      wardNo: 1,
    }));
  };

  const handleLocalChange = (locId: string) => {
    setForm((prev) => ({
      ...prev,
      localLevel: locId,
      wardNo: 1,
    }));
  };

  const currentDistricts = getDistrictsByProvince(form.province);
  const currentLocalLevels = getLocalLevelsByDistrict(form.province, form.district);
  const currentWards = getWardsForLocalLevel(form.province, form.district, form.localLevel);

  // Submit Patient Form
  const handleSubmitPatient = async (confirmDuplicate = false) => {
    setFormError(null);
    setFormSuccess(null);
    setDuplicateWarning(null);

    if (!form.fullName.trim()) {
      setFormError('कृपया बिरामीको पूरा नाम प्रविष्ट गर्नुहोस्।');
      return;
    }
    if (!form.phone.trim() || !/^(98|97|96|0\d)\d{7,8}$/.test(form.phone.trim())) {
      setFormError('कृपया मान्य १० अंकको नेपाली मोबाइल नम्बर प्रविष्ट गर्नुहोस् (उदा: 9812345678)।');
      return;
    }

    setFormSubmitting(true);
    try {
      const provObj = NEPAL_ADMINISTRATIVE_DATA.find((p) => p.id === form.province);
      const distObj = currentDistricts.find((d) => d.id === form.district);
      const locObj = currentLocalLevels.find((l) => l.id === form.localLevel);

      const payload = {
        ...form,
        province: provObj ? provObj.nameNepali : form.province,
        district: distObj ? distObj.nameNepali : form.district,
        localLevel: locObj ? locObj.nameNepali : form.localLevel,
        factorLevelPercent: form.factorLevelPercent === '' ? null : parseFloat(form.factorLevelPercent),
        confirmDuplicate,
      };

      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        if (json.duplicateWarning) {
          setDuplicateWarning(json);
        } else {
          setFormError(json.message || 'बिरामी दर्ता असफल भयो।');
        }
        return;
      }

      setFormSuccess(json.message);
      fetchPatients();
      setTimeout(() => {
        setShowRegisterModal(false);
        setFormSuccess(null);
      }, 1500);
    } catch (e: any) {
      setFormError('नेटवर्क वा सर्भर त्रुटि।');
    } finally {
      setFormSubmitting(false);
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'SEVERE':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            गम्भीर (Severe)
          </span>
        );
      case 'MODERATE':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            मध्यम (Moderate)
          </span>
        );
      case 'MILD':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            सामान्य (Mild)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
            समीक्षा आवश्यक
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-10">
      {/* Header & New Patient Button (Hidden when printing) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>बिरामी दर्ता तथा अभिलेख (Patients Registry)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            नेपाल हेमोफिलिया सोसाइटीमा दर्ता भएका बिरामीहरूको आधिकारिक अभिलेख, ठेगाना, फ्याक्टर स्तर तथा औषधि खपत इतिहास
          </p>
        </div>

        <button
          onClick={() => setShowRegisterModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-brand-600 to-rose-600 hover:from-brand-700 hover:to-rose-700 text-white shadow-md shadow-brand-500/20 active:scale-95 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ नयाँ बिरामी दर्ता</span>
        </button>
      </div>

      {/* Search Input (Hidden when printing) */}
      <form onSubmit={handleSearch} className="relative print:hidden">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="बिरामीको नाम, Patient ID (उदा: HEP-2026-0001) वा मोबाइल नम्बरबाट खोज्नुहोस्..."
          className="w-full pl-11 pr-24 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
        />
        <button
          type="submit"
          className="absolute right-2 top-2 bottom-2 px-4 rounded-xl font-bold text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
        >
          खोज्नुहोस्
        </button>
      </form>

      {/* PATIENTS TABLE VIEW (As requested: क्र.सं., बिरामीको नाम, ठेगाना, मोबाइल नम्बर, फ्याक्टर कुन हो, विस्तृत विवरण हेर्नुहोस्) */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden print:hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-900 dark:text-white">
              बिरामीहरूको एकीकृत तालिका (Patients Table)
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
              कुल {patients.length} जना
            </span>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            औषधि खपत तथा इतिहास हेर्न प्रतेक पंक्तिको दायाँ &apos;विस्तृत विवरण हेर्नुहोस्&apos; मा क्लिक गर्नुहोस्
          </span>
        </div>

        {loading ? (
          <div className="text-center py-14">
            <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500">बिरामीहरूको विवरण लोड हुँदैछ...</p>
          </div>
        ) : patients.length === 0 ? (
          <div className="p-12 text-center">
            <User className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <p className="font-bold text-slate-700 dark:text-slate-300">कुनै बिरामी फेला परेन।</p>
            <p className="text-xs text-slate-400 mt-1">
              कृपया खोजी शब्द परिवर्तन गर्नुहोस् वा माथिको &apos;+ नयाँ बिरामी दर्ता&apos; बाट थप्नुहोस्।
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/90 dark:bg-slate-800/80 font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5 text-center w-14">क्र.सं.</th>
                  <th className="p-3.5 min-w-[220px]">बिरामीको नाम (Patient Name)</th>
                  <th className="p-3.5 min-w-[240px]">ठेगाना (Address)</th>
                  <th className="p-3.5 min-w-[140px]">मोबाइल नम्बर</th>
                  <th className="p-3.5 min-w-[180px]">फ्याक्टर कुन हो (Factor Type)</th>
                  <th className="p-3.5 text-right min-w-[170px]">कार्य (Action)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {patients.map((p, idx) => (
                  <tr
                    key={p.id}
                    className="hover:bg-brand-50/40 dark:hover:bg-brand-950/20 transition-colors group"
                  >
                    {/* क्र.सं. */}
                    <td className="p-3.5 text-center font-bold text-slate-400">{idx + 1}</td>

                    {/* बिरामीको नाम + Patient ID + Blood Group */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 flex items-center justify-center font-black text-xs shrink-0 border border-brand-200/50 dark:border-brand-800/50">
                          {p.fullName ? p.fullName.slice(0, 2) : 'PT'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                              {p.fullName}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60">
                              {p.bloodGroup}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                            <span className="font-mono font-semibold">{p.patientCode}</span>
                            <span>•</span>
                            <span>{p.age} वर्ष</span>
                            <span>•</span>
                            <span>{p.gender || 'पुरुष'}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* ठेगाना */}
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">
                            {p.localLevel}-{p.wardNo}, {p.district}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {p.toleAddress ? `${p.toleAddress}, ` : ''}
                            {p.province}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* मोबाइल नम्बर */}
                    <td className="p-3.5 text-slate-700 dark:text-slate-300 font-mono font-medium">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{p.phone}</span>
                      </div>
                    </td>

                    {/* फ्याक्टर कुन हो + Severity */}
                    <td className="p-3.5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {p.factorType}
                          </span>
                          {p.factorLevelPercent != null && (
                            <span className="text-[11px] text-slate-500">
                              ({p.factorLevelPercent}%)
                            </span>
                          )}
                        </div>
                        <div>{getSeverityBadge(p.severity)}</div>
                      </div>
                    </td>

                    {/* विस्तृत विवरण हेर्नुहोस् र डिलिट (Action Buttons) */}
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openPatientProfile(p)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs bg-slate-100 hover:bg-brand-600 text-slate-700 hover:text-white dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-brand-600 transition-all shadow-sm active:scale-95 group/btn"
                          title="बिरामीको विस्तृत प्रोफाइल तथा औषधि खपत इतिहास हेर्नुहोस्"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500 group-hover/btn:text-white transition-colors" />
                          <span>विस्तृत विवरण</span>
                        </button>

                        <button
                          onClick={() => {
                            setDeleteError(null);
                            setPatientToDelete(p);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-semibold text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/60 border border-rose-200/60 dark:border-rose-900/40 transition-all shadow-sm active:scale-95"
                          title="अनावश्यक बिरामीको तथ्यांक मेटाउनुहोस् (Delete Patient)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">डिलिट</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PATIENT DETAILED DOSSIER & MEDICATION CONSUMPTION MODAL (PRINTABLE) */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:fixed print:inset-0">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 space-y-6 print:border-none print:shadow-none print:max-h-none print:max-w-none print:p-6 print:rounded-none">
            
            {/* Modal Header with Print & Download Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-100 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 flex items-center justify-center font-black text-lg shrink-0">
                  {selectedPatient.fullName ? selectedPatient.fullName.slice(0, 2) : 'PT'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                      {selectedPatient.fullName}
                    </h2>
                    <span className="px-2 py-0.5 rounded font-black text-xs bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                      {selectedPatient.bloodGroup}
                    </span>
                  </div>
                  <p className="text-xs font-mono font-bold text-slate-500 mt-0.5">
                    Patient ID: {selectedPatient.patientCode} • दर्ता मिति:{' '}
                    {selectedPatient.createdAt
                      ? new Date(selectedPatient.createdAt).toISOString().slice(0, 10)
                      : '-'}
                  </p>
                </div>
              </div>

              {/* Top Action Buttons (Print, Download Excel, Close) */}
              <div className="flex items-center gap-2 print:hidden self-end sm:self-auto">
                <button
                  onClick={handlePrintPatientDossier}
                  className="px-3.5 py-2 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                  title="यस बिरामीको प्रोफाइल तथा औषधि खपत विवरण प्रिन्ट गर्नुहोस्"
                >
                  <Printer className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  <span>प्रिन्ट</span>
                </button>

                <button
                  onClick={() =>
                    handleDownloadPatientExcel(selectedPatient.id, selectedPatient.fullName)
                  }
                  disabled={downloadingExcel}
                  className="px-3.5 py-2 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-1.5"
                  title="व्यक्तिगत २-सिट Excel प्रतिवेदन डाउनलोड (.xlsx)"
                >
                  <Download className="w-4 h-4" />
                  <span>{downloadingExcel ? 'तयार हुँदैछ...' : 'Excel डाउनलोड'}</span>
                </button>

                <button
                  onClick={() => {
                    setDeleteError(null);
                    setPatientToDelete(selectedPatient);
                  }}
                  className="px-3.5 py-2 rounded-xl font-bold text-xs bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white dark:bg-rose-950/60 dark:text-rose-300 dark:hover:bg-rose-600 border border-rose-200/60 dark:border-rose-900/40 transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                  title="यो बिरामीको सम्पूर्ण व्यक्तिगत तथ्यांक मेटाउनुहोस्"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">अभिलेख मेटाउनुहोस्</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedPatient(null);
                    setPatientDetails(null);
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Official Header for Print Mode Only */}
            <div className="hidden print:block text-center border-b-2 border-slate-800 pb-3">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                नेपाल हेमोफिलिया सोसाइटी (Nepal Hemophilia Society)
              </h1>
              <p className="text-xs text-slate-700 font-semibold mt-0.5">
                केन्द्रीय कार्यालय तथा स्याटेलाइट केन्द्रहरू • बिरामी व्यक्तिगत स्वास्थ्य प्रोफाइल तथा औषधि खपत प्रतिवेदन
              </p>
              <p className="text-[11px] text-slate-500 mt-1 font-mono">
                प्रिन्ट मिति: {new Date().toLocaleDateString('ne-NP')} {new Date().toLocaleTimeString()}
              </p>
            </div>

            {/* 1. SECTION: बिरामीको प्रारम्भिक अभिलेखीकरण (Patient Baseline Profile) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-brand-600" />
                  <span>१. बिरामीको प्रारम्भिक अभिलेखीकरण विवरण (Patient Baseline Profile)</span>
                </h3>
                {onDistributePatient && (
                  <button
                    onClick={() => {
                      onDistributePatient(selectedPatient);
                      setSelectedPatient(null);
                    }}
                    className="print:hidden px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95"
                  >
                    <Syringe className="w-3.5 h-3.5" />
                    <span>औषधि वितरण गर्नुहोस्</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block font-medium">उमेर / लिङ्ग</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {selectedPatient.age} वर्ष / {selectedPatient.gender || 'पुरुष'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block font-medium">रक्त समूह (Blood Group)</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400 text-sm">
                    {selectedPatient.bloodGroup}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block font-medium">सम्पर्क मोबाइल</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-sm font-mono">
                    {selectedPatient.phone}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block font-medium">रोगको गम्भीरता</span>
                  <div className="mt-1">{getSeverityBadge(selectedPatient.severity)}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 sm:col-span-2">
                  <span className="text-slate-400 block font-medium">स्थायी ठेगाना</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {selectedPatient.localLevel}-{selectedPatient.wardNo}, {selectedPatient.district},{' '}
                    {selectedPatient.province}
                  </span>
                  {selectedPatient.toleAddress && (
                    <span className="text-slate-500 block text-[11px] mt-0.5">
                      टोल/गाउँ: {selectedPatient.toleAddress}
                    </span>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 sm:col-span-2">
                  <span className="text-slate-400 block font-medium">फ्याक्टर प्रकार तथा स्तर</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {selectedPatient.factorType}{' '}
                    {selectedPatient.factorLevelPercent != null
                      ? `(स्तर: ${selectedPatient.factorLevelPercent}%)`
                      : '(स्तर: अज्ञात)'}
                  </span>
                  {selectedPatient.otherFactorDetails && (
                    <span className="text-slate-500 block text-[11px] mt-0.5">
                      थप विवरण: {selectedPatient.otherFactorDetails}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 2. SECTION: हालसम्मको कुल औषधि खपत सारांश (Lifetime Consumption Summary) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider block">
                हालसम्मको कुल फ्याक्टर औषधि खपत सारांश (Total Lifetime Factor Consumed)
              </span>
              <div className="grid grid-cols-3 gap-4 mt-2 text-center sm:text-left">
                <div>
                  <span className="text-[11px] text-slate-300 block">कुल प्राप्त पटक</span>
                  <span className="text-lg sm:text-2xl font-black text-amber-400">
                    {patientDetails?.summary?.totalDistributionsCount || 0}{' '}
                    <span className="text-xs font-normal text-white">पटक</span>
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-300 block">कुल खपत भाइल</span>
                  <span className="text-lg sm:text-2xl font-black text-emerald-400">
                    {patientDetails?.summary?.totalLifetimeVials || 0}{' '}
                    <span className="text-xs font-normal text-white">भाइल</span>
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-300 block">कुल खपत शक्ति (IU)</span>
                  <span className="text-lg sm:text-2xl font-black text-cyan-400">
                    {(patientDetails?.summary?.totalLifetimeIu || 0).toLocaleString()}{' '}
                    <span className="text-xs font-normal text-white">IU</span>
                  </span>
                </div>
              </div>
            </div>

            {/* 3. SECTION: औषधि खपत गरेको विस्तृत विवरण तालिका (Detailed Dispensation Log Table) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-emerald-600" />
                  <span>२. औषधि के कति खपत गरेको रहेछ त्यसको विस्तृत विवरण (Medication Usage Logs)</span>
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  {patientDetails?.distributionHistory?.length || 0} वटा अभिलेख
                </span>
              </div>

              {detailsLoading ? (
                <div className="py-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                  <div className="w-6 h-6 border-2 border-brand-300 border-t-brand-600 rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs text-slate-400">औषधि खपत इतिहास लोड हुँदैछ...</p>
                </div>
              ) : !patientDetails?.distributionHistory ||
                patientDetails.distributionHistory.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <Syringe className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-1.5" />
                  <p className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                    यस बिरामीले अहिलेसम्म कुनै औषधि लिएको रेकर्ड छैन।
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    नयाँ वितरण रेकर्ड गर्न &apos;औषधि वितरण गर्नुहोस्&apos; बटन प्रयोग गर्नुहोस्।
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">
                      <tr>
                        <th className="p-2.5 text-center w-12">क्र.सं.</th>
                        <th className="p-2.5 min-w-[100px]">खपत मिति</th>
                        <th className="p-2.5 min-w-[120px]">रसिद/भौचर नं.</th>
                        <th className="p-2.5 min-w-[130px]">वितरण कार्यालय</th>
                        <th className="p-2.5 min-w-[150px]">औषधि ब्रान्ड / ब्याच</th>
                        <th className="p-2.5 text-right min-w-[90px]">खपत भाइल</th>
                        <th className="p-2.5 text-right min-w-[100px]">खपत IU</th>
                        <th className="p-2.5 min-w-[160px]">प्रयोगको प्रयोजन</th>
                        <th className="p-2.5 min-w-[120px]">चिकित्सक</th>
                        <th className="p-2.5 min-w-[120px]">कर्मचारी</th>
                        <th className="p-2.5 text-center w-14 print:hidden">कार्य</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {patientDetails.distributionHistory.map((d: any, idx: number) => {
                        const items = d.items && d.items.length > 0 ? d.items : [];
                        const itemDescription =
                          items.length > 0
                            ? items
                                .map((it: any) => `${it.productName} (B: ${it.batchNumber})`)
                                .join(', ')
                            : 'Factor';

                        return (
                          <tr
                            key={d.id}
                            className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                          >
                            <td className="p-2.5 text-center font-bold text-slate-400">{idx + 1}</td>
                            <td className="p-2.5 font-semibold text-slate-900 dark:text-white">
                              {d.distributionDate
                                ? new Date(d.distributionDate).toISOString().slice(0, 10)
                                : '-'}
                            </td>
                            <td className="p-2.5 font-mono text-slate-500">{d.voucherNumber}</td>
                            <td className="p-2.5 text-slate-700 dark:text-slate-300 font-medium">
                              {d.officeName}
                            </td>
                            <td className="p-2.5 text-slate-700 dark:text-slate-300">
                              <span className="font-semibold block">{itemDescription}</span>
                            </td>
                            <td className="p-2.5 text-right font-black text-emerald-600 dark:text-emerald-400">
                              {d.totalVials} भाइल
                            </td>
                            <td className="p-2.5 text-right font-bold text-slate-800 dark:text-slate-200">
                              {d.totalIu?.toLocaleString()} IU
                            </td>
                            <td className="p-2.5 text-slate-700 dark:text-slate-300">
                              <span className="font-semibold block">
                                {d.purposes && Array.isArray(d.purposes)
                                  ? d.purposes.join(', ')
                                  : d.purposes}
                              </span>
                              {d.purposeDetails && (
                                <span className="text-[11px] text-slate-400 block">
                                  {d.purposeDetails}
                                </span>
                              )}
                            </td>
                            <td className="p-2.5 text-slate-500">
                              {d.prescribingClinician || '-'}
                            </td>
                            <td className="p-2.5 text-slate-500">{d.dispensedByName}</td>
                            <td className="p-2.5 text-center print:hidden">
                              <button
                                onClick={() => {
                                  setDeleteError(null);
                                  setDistributionToDelete({ id: d.id, voucherNumber: d.voucherNumber });
                                }}
                                title="यो औषधि वितरण अभिलेख मेटाउनुहोस् (Delete Distribution)"
                                className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Print Sign-off Box (Visible only on print paper) */}
            <div className="hidden print:grid grid-cols-2 gap-8 pt-8 text-xs border-t border-slate-300 mt-8">
              <div>
                <p className="font-bold text-slate-800">तयार गर्ने / वितरण गर्ने कर्मचारी:</p>
                <div className="h-10"></div>
                <p className="border-t border-slate-400 inline-block pt-1 text-slate-600">
                  हस्ताक्षर तथा मिति
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-800">संस्थाको आधिकारिक प्रमाणीकरण / छाप:</p>
                <div className="h-10"></div>
                <p className="border-t border-slate-400 inline-block pt-1 text-slate-600">
                  नेपाल हेमोफिलिया सोसाइटी
                </p>
              </div>
            </div>

            {/* 4. MODAL BOTTOM ACTIONS (As explicitly requested: "प्रतेक व्यक्तिको अन्त्यमा भित्र रिपोर्टको अन्यमा डाउनलोड गर्ने र प्रिन्ट गर्ने अप्सन पनि राखी राखिदिनु") */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
              <p className="text-[11px] text-slate-500">
                🔒 नेपाल हेमोफिलिया सोसाइटी - सुरक्षित स्वास्थ्य अभिलेख व्यवस्थापन प्रणाली
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintPatientDossier}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                >
                  <Printer className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  <span>सम्पूर्ण रिपोर्ट प्रिन्ट गर्नुहोस्</span>
                </button>

                <button
                  onClick={() =>
                    handleDownloadPatientExcel(selectedPatient.id, selectedPatient.fullName)
                  }
                  disabled={downloadingExcel}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>{downloadingExcel ? 'Excel तयार हुँदैछ...' : 'Excel (.xlsx) डाउनलोड'}</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedPatient(null);
                    setPatientDetails(null);
                  }}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  बन्द गर्नुहोस्
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Patient Registration Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto print:hidden">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  नयाँ बिरामी दर्ता फाराम
                </h2>
                <p className="text-xs text-slate-500">
                  आधिकारिक प्रशासनिक संरचना तथा हेमोफिलिया स्वास्थ्य विवरण
                </p>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error / Success Alerts */}
            {formError && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}
            {formSuccess && (
              <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            {/* Duplicate Warning Dialog */}
            {duplicateWarning && (
              <div className="mt-3 p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-800">
                  <AlertTriangle className="w-4 h-4" />
                  <span>सम्भावित दोहोरो दर्ता चेतावनी (Duplicate Warning)</span>
                </div>
                <p>{duplicateWarning.message}</p>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleSubmitPatient(true)}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold text-xs"
                  >
                    नयाँ बिरामी नै हो, दर्ता जारी राख्नुहोस्
                  </button>
                  <button
                    type="button"
                    onClick={() => setDuplicateWarning(null)}
                    className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-800 font-medium text-xs"
                  >
                    रद्द गर्नुहोस्
                  </button>
                </div>
              </div>
            )}

            {/* Form Fields */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmitPatient(false);
              }}
              className="space-y-4 mt-4 text-xs"
            >
              {/* Section 1: Personal Details */}
              <div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-2 border-b border-slate-100 dark:border-slate-800 pb-1">
                  १. व्यक्तिगत विवरण
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      पूरा नाम (Full Name) *
                    </label>
                    <input
                      type="text"
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      placeholder="उदा: नवीन ढुङ्गेल"
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      मोबाइल फोन नम्बर (Phone) *
                    </label>
                    <input
                      type="text"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="१० अंक (उदा: 9841234567)"
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      जन्ममिति (Date of Birth)
                    </label>
                    <input
                      type="date"
                      value={form.dateOfBirth}
                      onChange={(e) => handleDobChange(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      उमेर (Age in Years) *
                    </label>
                    <input
                      type="number"
                      value={form.age}
                      onChange={(e) => setForm({ ...form, age: parseInt(e.target.value) || 0 })}
                      min="0"
                      max="120"
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                      required
                    />
                    <label className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500">
                      <input
                        type="checkbox"
                        checked={form.isDobEstimated}
                        onChange={(e) => setForm({ ...form, isDobEstimated: e.target.checked })}
                      />
                      <span>जन्ममिति यकिन छैन (उमेर अनुमानित)</span>
                    </label>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      रक्त समूह (Blood Group) *
                    </label>
                    <select
                      value={form.bloodGroup}
                      onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    >
                      {availableBloodGroups.map((bg) => (
                        <option key={bg} value={bg}>
                          {bg}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      लिङ्ग (Gender)
                    </label>
                    <select
                      value={form.gender}
                      onChange={(e) => setForm({ ...form, gender: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    >
                      <option value="पुरुष">पुरुष (Male)</option>
                      <option value="महिला">महिला (Female)</option>
                      <option value="अन्य">अन्य (Other)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Nepal Cascading Address */}
              <div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-2 border-b border-slate-100 dark:border-slate-800 pb-1">
                  २. आधिकारिक ठेगाना चयन (Cascading Address)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      १. प्रदेश (Province) *
                    </label>
                    <select
                      value={form.province}
                      onChange={(e) => handleProvinceChange(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    >
                      {NEPAL_ADMINISTRATIVE_DATA.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nameNepali}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      २. जिल्ला (District) *
                    </label>
                    <select
                      value={form.district}
                      onChange={(e) => handleDistrictChange(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    >
                      {currentDistricts.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.nameNepali}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      ३. स्थानीय तह (Municipality/Rural) *
                    </label>
                    <select
                      value={form.localLevel}
                      onChange={(e) => handleLocalChange(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    >
                      {currentLocalLevels.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.nameNepali} ({l.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      ४. वडा नम्बर (Ward No.) *
                    </label>
                    <select
                      value={form.wardNo}
                      onChange={(e) => setForm({ ...form, wardNo: parseInt(e.target.value) || 1 })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    >
                      {currentWards.map((w) => (
                        <option key={w} value={w}>
                          वडा नं. {w}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      टोल वा गाउँको नाम (Tole / Street)
                    </label>
                    <input
                      type="text"
                      value={form.toleAddress}
                      onChange={(e) => setForm({ ...form, toleAddress: e.target.value })}
                      placeholder="उदा: कञ्चनबारी चोक"
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Health & Severity Details */}
              <div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-2 border-b border-slate-100 dark:border-slate-800 pb-1">
                  ३. स्वास्थ्य विवरण तथा फ्याक्टर गम्भीरता
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      फ्याक्टर प्रकार (Factor Type) *
                    </label>
                    <select
                      value={form.factorType}
                      onChange={(e) => setForm({ ...form, factorType: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    >
                      {availableFactorTypes.map((ft) => (
                        <option key={ft} value={ft}>
                          {ft}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      फ्याक्टर स्तर प्रतिशत (Factor Level %)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.factorLevelPercent}
                      onChange={(e) => setForm({ ...form, factorLevelPercent: e.target.value })}
                      placeholder="उदा: 0.5% वा 2.5%"
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    />
                  </div>

                  <div className="sm:col-span-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        गम्भीरता वर्गीकरण (Severity Classification):
                      </span>
                      {getSeverityBadge(form.severity)}
                    </div>

                    <div className="mt-2 text-[11px] text-slate-500">
                      {form.factorType === 'Factor VIII' || form.factorType === 'Factor IX'
                        ? 'मापदण्ड: <1% = Severe, 1%-5% = Moderate, 5%-40% = Mild, >=40% = समीक्षा आवश्यक'
                        : 'अन्य फ्याक्टरको हकमा चिकित्सकीय समीक्षा आवश्यक तोकिएको छ।'}
                    </div>

                    <label className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200/50">
                      <input
                        type="checkbox"
                        checked={form.severityOverridden}
                        onChange={(e) => setForm({ ...form, severityOverridden: e.target.checked })}
                      />
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        चिकित्सकीय कारणले वर्गीकरण म्यानुअल रूपमा फेर्ने (Clinician Override)
                      </span>
                    </label>

                    {form.severityOverridden && (
                      <div className="mt-2 space-y-2">
                        <select
                          value={form.severity}
                          onChange={(e) => setForm({ ...form, severity: e.target.value })}
                          className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                        >
                          <option value="SEVERE">गम्भीर (Severe)</option>
                          <option value="MODERATE">मध्यम (Moderate)</option>
                          <option value="MILD">सामान्य (Mild)</option>
                          <option value="REVIEW_REQUIRED">चिकित्सकीय समीक्षा आवश्यक</option>
                        </select>
                        <input
                          type="text"
                          value={form.overrideReason}
                          onChange={(e) => setForm({ ...form, overrideReason: e.target.value })}
                          placeholder="Override गर्नुको चिकित्सकीय कारण लेख्नुहोस्..."
                          className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                          required
                        />
                      </div>
                    )}
                  </div>

                  {isSuperAdmin && (
                    <div className="sm:col-span-2">
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        दर्ता गर्ने कार्यालय (Registered Office) *
                      </label>
                      <select
                        value={form.registeredOfficeId}
                        onChange={(e) => setForm({ ...form, registeredOfficeId: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                      >
                        {offices.map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.nameNepali} ({o.district})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-brand-600 to-rose-600 hover:from-brand-700 hover:to-rose-700 shadow-md shadow-brand-500/20 disabled:opacity-50"
                >
                  {formSubmitting ? 'दर्ता हुँदैछ...' : 'सुरक्षित गर्नुहोस् (Register Patient)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE PATIENT MODAL */}
      {patientToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-rose-200 dark:border-rose-900 max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  अनावश्यक बिरामी तथ्यांक मेटाउनुहोस्
                </h3>
                <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
                  स्थायी रूपमा तथ्यांक हटाउने कार्य
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">बिरामीको नाम:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {patientToDelete.fullName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Patient ID:</span>
                <span className="font-mono font-bold text-brand-600">
                  {patientToDelete.patientCode}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ठेगाना:</span>
                <span className="text-slate-700 dark:text-slate-300">
                  {patientToDelete.localLevel}, {patientToDelete.district}
                </span>
              </div>
            </div>

            {deleteError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-medium">
                {deleteError}
              </div>
            )}

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              ⚠️ <strong>चेतावनी:</strong> के तपाईं निश्चित हुनुहुन्छ? यो कार्य गरेपछि यस बिरामीको दर्ता विवरण तथा औषधि खपत तथ्यांक स्थायी रूपमा मेटिनेछ र यो कार्य उल्टाउन सकिने छैन।
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setPatientToDelete(null);
                  setDeleteError(null);
                }}
                disabled={deleteLoading}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                रद्द गर्नुहोस्
              </button>
              <button
                type="button"
                onClick={handleDeletePatient}
                disabled={deleteLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/20 active:scale-95 disabled:opacity-50 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{deleteLoading ? 'मेटाउँदैछ...' : 'हो, डिलिट गर्नुहोस्'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE DISTRIBUTION MODAL */}
      {distributionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-rose-200 dark:border-rose-900 max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  अनावश्यक औषधि वितरण रेकर्ड मेटाउनुहोस्
                </h3>
                <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold font-mono">
                  भौचर नं: {distributionToDelete.voucherNumber}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              के तपाईं निश्चित हुनुहुन्छ? यो वितरण भौचर मेटाउँदा वितरण गरिएका फ्याक्टर भाइलहरू सम्बन्धित स्याटेलाइट स्टकमा स्वतः फिर्ता जोडिनेछन्।
            </p>

            {deleteError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-medium">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setDistributionToDelete(null);
                  setDeleteError(null);
                }}
                disabled={deleteLoading}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                रद्द गर्नुहोस्
              </button>
              <button
                type="button"
                onClick={handleDeleteDistribution}
                disabled={deleteLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/20 active:scale-95 disabled:opacity-50 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{deleteLoading ? 'मेटाउँदैछ...' : 'हो, भौचर डिलिट गर्नुहोस्'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACTION SUCCESS TOAST */}
      {actionToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-xl border bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-200 flex items-center gap-3 animate-in fade-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-bold">{actionToast.message}</span>
          <button
            onClick={() => setActionToast(null)}
            className="ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
