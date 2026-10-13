'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Settings,
  Building2,
  Users,
  ShieldCheck,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  UserCheck,
  UserX,
  Boxes,
  Syringe,
  Layers,
  Edit2,
  Trash2,
  Save,
  Sliders,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Package,
  Plus,
  RefreshCw,
} from 'lucide-react';

export default function AdminTab() {
  const { user, isSuperAdmin } = useAuth();
  const [activeAdminSubTab, setActiveAdminSubTab] = useState<
    'offices' | 'users' | 'purposes' | 'catalog' | 'settings' | 'audit'
  >('offices');

  // Offices State
  const [offices, setOffices] = useState<any[]>([]);
  const [showAddOfficeModal, setShowAddOfficeModal] = useState(false);
  const [officeForm, setOfficeForm] = useState({
    id: '',
    nameNepali: '',
    nameEnglish: '',
    district: 'मोरङ',
  });

  // Users State
  const [usersList, setUsersList] = useState<any[]>([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [userForm, setUserForm] = useState({
    username: '',
    name: '',
    password: '',
    role: 'OFFICE_USER',
    officeId: '',
  });

  // Purposes State (Distribution Purpose Master)
  const [purposes, setPurposes] = useState<any[]>([]);
  const [purposeFilter, setPurposeFilter] = useState<'ALL' | 'BLEED_SITE' | 'NON_BLEED'>('ALL');
  const [showPurposeModal, setShowPurposeModal] = useState(false);
  const [editingPurpose, setEditingPurpose] = useState<any | null>(null);
  const [purposeForm, setPurposeForm] = useState({
    category: 'BLEED_SITE',
    nameNepali: '',
    nameEnglish: '',
    sortOrder: 1,
  });

  // Catalog State (Companies, Products, Capacities)
  const [catalog, setCatalog] = useState<{ companies: any[]; products: any[]; capacities: any[] }>({
    companies: [],
    products: [],
    capacities: [],
  });
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [showProductModal, setShowProductModal] = useState(false);
  const [productForm, setProductForm] = useState({ companyId: '', name: '', factorType: 'Factor VIII' });
  const [showCapacityModal, setShowCapacityModal] = useState(false);
  const [capacityForm, setCapacityForm] = useState({ capacityIu: 1000, label: '1000 IU' });

  // System & Form Settings State
  const [factorTypesList, setFactorTypesList] = useState<string[]>([]);
  const [newFactorType, setNewFactorType] = useState('');
  const [bloodGroupsList, setBloodGroupsList] = useState<string[]>([]);
  const [newBloodGroup, setNewBloodGroup] = useState('');
  const [systemSettings, setSystemSettings] = useState({
    lowStockThreshold: '10',
    expiryAlertDays: '90',
    organizationName: 'नेपाल हेमोफिलिया सोसाइटी',
    reportSubtitle: 'केन्द्रीय कार्यालय तथा स्याटेलाइट केन्द्रहरू',
    signOffRole: 'केन्द्रीय अधिकृत / आधिकारिक प्रतिनिधि',
  });

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Loaders
  const fetchOffices = async () => {
    try {
      const res = await fetch('/api/admin/offices');
      if (res.ok) {
        const json = await res.json();
        if (json.success) setOffices(json.data);
      }
    } catch (e) {}
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const json = await res.json();
        if (json.success) setUsersList(json.data);
      }
    } catch (e) {}
  };

  const fetchPurposes = async () => {
    try {
      const res = await fetch('/api/admin/purposes');
      if (res.ok) {
        const json = await res.json();
        if (json.success) setPurposes(json.data);
      }
    } catch (e) {}
  };

  const fetchCatalog = async () => {
    try {
      const res = await fetch('/api/admin/catalog');
      if (res.ok) {
        const json = await res.json();
        if (json.success) setCatalog(json.data);
      }
    } catch (e) {}
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setFactorTypesList(json.data.factorTypes || []);
          setBloodGroupsList(json.data.bloodGroups || []);
          setSystemSettings({
            lowStockThreshold: json.data.lowStockThreshold || '10',
            expiryAlertDays: json.data.expiryAlertDays || '90',
            organizationName: json.data.organizationName || 'नेपाल हेमोफिलिया सोसाइटी',
            reportSubtitle: json.data.reportSubtitle || 'केन्द्रीय कार्यालय तथा स्याटेलाइट केन्द्रहरू',
            signOffRole: json.data.signOffRole || 'केन्द्रीय अधिकृत / आधिकारिक प्रतिनिधि',
          });
        }
      }
    } catch (e) {}
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/audit-logs');
      if (res.ok) {
        const json = await res.json();
        if (json.success) setAuditLogs(json.data);
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (isSuperAdmin) {
      fetchOffices();
      fetchUsers();
      fetchPurposes();
      fetchCatalog();
      fetchSettings();
      fetchAuditLogs();
    }
  }, [isSuperAdmin]);

  // Handle Add Office
  const handleAddOffice = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setActionSuccess(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/offices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(officeForm),
      });

      const json = await res.json();
      if (!res.ok) {
        setActionError(json.message || 'कार्यालय थप्न सकिएन।');
        return;
      }

      setActionSuccess(json.message);
      fetchOffices();
      setShowAddOfficeModal(false);
      setOfficeForm({ id: '', nameNepali: '', nameEnglish: '', district: 'मोरङ' });
    } catch (e) {
      setActionError('सर्भर समस्या।');
    } finally {
      setLoading(false);
    }
  };

  // Handle Add User
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setActionSuccess(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm),
      });

      const json = await res.json();
      if (!res.ok) {
        setActionError(json.message || 'प्रयोगकर्ता सिर्जना गर्न सकिएन।');
        return;
      }

      setActionSuccess(json.message);
      fetchUsers();
      setShowAddUserModal(false);
      setUserForm({ username: '', name: '', password: '', role: 'OFFICE_USER', officeId: '' });
    } catch (e) {
      setActionError('सर्भर समस्या।');
    } finally {
      setLoading(false);
    }
  };

  // Handle Toggle Active User
  const handleToggleUserActive = async (targetUser: any) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: targetUser.id, isActive: !targetUser.isActive }),
      });
      if (res.ok) fetchUsers();
    } catch (e) {}
  };

  // -------------------------------------------------------------
  // PURPOSES (Distribution Purpose Master) Handlers
  // -------------------------------------------------------------
  const handleSavePurpose = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setActionSuccess(null);
    setLoading(true);

    try {
      const method = editingPurpose ? 'PUT' : 'POST';
      const payload = editingPurpose ? { id: editingPurpose.id, ...purposeForm } : purposeForm;

      const res = await fetch('/api/admin/purposes', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        setActionError(json.message || 'प्रयोजन बचत गर्न सकिएन।');
        return;
      }

      setActionSuccess(json.message);
      fetchPurposes();
      setShowPurposeModal(false);
      setEditingPurpose(null);
      setPurposeForm({ category: 'BLEED_SITE', nameNepali: '', nameEnglish: '', sortOrder: 1 });
    } catch (e) {
      setActionError('सर्भर समस्या।');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePurposeActive = async (p: any) => {
    try {
      const res = await fetch('/api/admin/purposes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: p.id, isActive: !p.isActive }),
      });
      if (res.ok) fetchPurposes();
    } catch (e) {}
  };

  const handleDeletePurpose = async (id: string, name: string) => {
    if (!confirm(`के तपाईं निश्चित रूपमा "${name}" प्रयोजन हटाउन चाहनुहुन्छ?`)) return;
    try {
      const res = await fetch(`/api/admin/purposes?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok) {
        setActionSuccess(json.message);
        fetchPurposes();
      } else {
        setActionError(json.message);
      }
    } catch (e) {
      setActionError('हटाउन सकिएन।');
    }
  };

  // -------------------------------------------------------------
  // CATALOG (Companies, Products, Capacities) Handlers
  // -------------------------------------------------------------
  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CREATE_COMPANY', name: companyName }),
      });
      const json = await res.json();
      if (res.ok) {
        setActionSuccess(json.message);
        setCompanyName('');
        setShowCompanyModal(false);
        fetchCatalog();
      } else {
        setActionError(json.message);
      }
    } catch (e) {
      setActionError('कम्पनी थप्न सकिएन।');
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CREATE_PRODUCT', ...productForm }),
      });
      const json = await res.json();
      if (res.ok) {
        setActionSuccess(json.message);
        setShowProductModal(false);
        setProductForm({ companyId: '', name: '', factorType: 'Factor VIII' });
        fetchCatalog();
      } else {
        setActionError(json.message);
      }
    } catch (e) {
      setActionError('उत्पादन थप्न सकिएन।');
    }
  };

  const handleCreateCapacity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CREATE_CAPACITY', ...capacityForm }),
      });
      const json = await res.json();
      if (res.ok) {
        setActionSuccess(json.message);
        setShowCapacityModal(false);
        fetchCatalog();
      } else {
        setActionError(json.message);
      }
    } catch (e) {
      setActionError('क्षमता थप्न सकिएन।');
    }
  };

  // -------------------------------------------------------------
  // SETTINGS Handlers (Factor Types, Blood Groups, Thresholds, Branding)
  // -------------------------------------------------------------
  const handleSaveFactorTypes = async (newList: string[]) => {
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'FACTOR_TYPES', value: newList }),
      });
      if (res.ok) {
        setFactorTypesList(newList);
        setActionSuccess('फ्याक्टर प्रकारहरूको सूची सुरक्षित गरियो।');
      }
    } catch (e) {}
  };

  const handleAddFactorType = () => {
    if (!newFactorType.trim()) return;
    if (factorTypesList.includes(newFactorType.trim())) return;
    const updated = [...factorTypesList, newFactorType.trim()];
    handleSaveFactorTypes(updated);
    setNewFactorType('');
  };

  const handleRemoveFactorType = (item: string) => {
    const updated = factorTypesList.filter((f) => f !== item);
    handleSaveFactorTypes(updated);
  };

  const handleSaveSystemSettingKey = async (key: string, val: string, successMsg: string) => {
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: val }),
      });
      if (res.ok) {
        setActionSuccess(successMsg);
        fetchSettings();
      }
    } catch (e) {}
  };

  if (!isSuperAdmin) {
    return (
      <div className="p-8 text-center text-slate-500 text-sm">
        यो खण्ड हेर्ने अधिकार केवल Super Admin लाई मात्र छ।
      </div>
    );
  }

  const filteredPurposes = purposes.filter((p) => {
    if (purposeFilter === 'ALL') return true;
    return p.category === purposeFilter;
  });

  return (
    <div className="space-y-6 pb-20 lg:pb-10">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-brand-600" />
          <span>प्रशासनिक नियन्त्रण, फारम कन्फिगरेसन तथा Audit Trail</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          कोड परिवर्तन नगरी बिरामी दर्ता, केन्द्रीय स्टक, औषधि वितरण, रिपोर्ट तथा प्रणाली सेटिङ व्यवस्थापन गर्नुहोस्
        </p>
      </div>

      {actionSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}
      {actionError && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Subtabs Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveAdminSubTab('offices')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeAdminSubTab === 'offices'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>कार्यालय तथा स्याटेलाइट ({offices.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminSubTab('users')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeAdminSubTab === 'users'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>प्रयोगकर्ता खाताहरू ({usersList.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminSubTab('purposes')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeAdminSubTab === 'purposes'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <Syringe className="w-4 h-4" />
          <span>औषधि वितरण प्रयोजन सेटिङ ({purposes.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminSubTab('catalog')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeAdminSubTab === 'catalog'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>कम्पनी, उत्पादन तथा क्षमता</span>
        </button>

        <button
          onClick={() => setActiveAdminSubTab('settings')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeAdminSubTab === 'settings'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>फारम तथा प्रणाली सेटिङ</span>
        </button>

        <button
          onClick={() => setActiveAdminSubTab('audit')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeAdminSubTab === 'audit'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>सुरक्षा Audit Trail ({auditLogs.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUBTAB 1: OFFICES */}
      {/* ========================================================================= */}
      {activeAdminSubTab === 'offices' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase">
              प्रणालीमा उपलब्ध कार्यालय तथा स्याटेलाइटहरू:
            </span>
            <button
              onClick={() => setShowAddOfficeModal(true)}
              className="px-3.5 py-2 rounded-xl font-bold text-xs bg-brand-600 text-white flex items-center gap-1.5 shadow"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ नयाँ कार्यालय थप्नुहोस्</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {offices.map((o) => (
              <div
                key={o.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold text-slate-600">
                    {o.id}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      o.isActive
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {o.isActive ? 'सक्रिय' : 'निष्क्रिय'}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base mt-2">
                  {o.nameNepali}
                </h3>
                <p className="text-xs text-slate-400">{o.nameEnglish}</p>
                <p className="text-xs text-slate-500 mt-2 font-medium">
                  जिल्ला: <b>{o.district}</b>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 2: USERS */}
      {/* ========================================================================= */}
      {activeAdminSubTab === 'users' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase">
              कर्मचारी तथा प्रयोगकर्ता खाताहरू:
            </span>
            <button
              onClick={() => setShowAddUserModal(true)}
              className="px-3.5 py-2 rounded-xl font-bold text-xs bg-brand-600 text-white flex items-center gap-1.5 shadow"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ नयाँ प्रयोगकर्ता थप्नुहोस्</span>
            </button>
          </div>

          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 font-bold text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="p-3">प्रयोगकर्ता नाम (Username)</th>
                  <th className="p-3">पूरा नाम</th>
                  <th className="p-3">भूमिका (Role)</th>
                  <th className="p-3">तोकिएको कार्यालय</th>
                  <th className="p-3">स्थिति</th>
                  <th className="p-3 text-right">कार्य</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                      {u.username}
                    </td>
                    <td className="p-3 text-slate-700 dark:text-slate-300 font-medium">{u.name}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          u.role === 'SUPER_ADMIN'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        }`}
                      >
                        {u.role === 'SUPER_ADMIN' ? 'केन्द्रीय प्रशासक' : 'कार्यालय प्रतिनिधि'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{u.office?.nameNepali || 'केन्द्र (सबै)'}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          u.isActive
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {u.isActive ? 'सक्रिय' : 'निष्क्रिय'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {u.role !== 'SUPER_ADMIN' && (
                        <button
                          onClick={() => handleToggleUserActive(u)}
                          className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
                          title={u.isActive ? 'निष्क्रिय गर्नुहोस्' : 'सक्रिय गर्नुहोस्'}
                        >
                          {u.isActive ? <UserX className="w-4 h-4 text-rose-600" /> : <UserCheck className="w-4 h-4 text-emerald-600" />}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 3: PURPOSES (Distribution Purpose Master Management) */}
      {/* ========================================================================= */}
      {activeAdminSubTab === 'purposes' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Syringe className="w-4 h-4 text-brand-600" />
                <span>औषधि वितरण प्रयोजन विकल्प व्यवस्थापन (Distribution Purposes)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                खण्ड A (रक्तस्राव भएका स्थानहरू) र खण्ड B (रोकथाम तथा अन्य प्रयोजनहरू) का विकल्पहरू थप, सम्पादन वा हटाउनुहोस्
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
                <button
                  onClick={() => setPurposeFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg ${purposeFilter === 'ALL' ? 'bg-white dark:bg-slate-900 shadow-sm text-brand-600 font-bold' : 'text-slate-500'}`}
                >
                  सबै ({purposes.length})
                </button>
                <button
                  onClick={() => setPurposeFilter('BLEED_SITE')}
                  className={`px-2.5 py-1 rounded-lg ${purposeFilter === 'BLEED_SITE' ? 'bg-white dark:bg-slate-900 shadow-sm text-brand-600 font-bold' : 'text-slate-500'}`}
                >
                  खण्ड A: रक्तस्राव ({purposes.filter((p) => p.category === 'BLEED_SITE').length})
                </button>
                <button
                  onClick={() => setPurposeFilter('NON_BLEED')}
                  className={`px-2.5 py-1 rounded-lg ${purposeFilter === 'NON_BLEED' ? 'bg-white dark:bg-slate-900 shadow-sm text-brand-600 font-bold' : 'text-slate-500'}`}
                >
                  खण्ड B: रोकथाम ({purposes.filter((p) => p.category === 'NON_BLEED').length})
                </button>
              </div>

              <button
                onClick={() => {
                  setEditingPurpose(null);
                  setPurposeForm({ category: 'BLEED_SITE', nameNepali: '', nameEnglish: '', sortOrder: purposes.length + 1 });
                  setShowPurposeModal(true);
                }}
                className="px-3.5 py-2 rounded-xl font-bold text-xs bg-brand-600 text-white flex items-center gap-1.5 shadow active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>+ नयाँ प्रयोजन थप्नुहोस्</span>
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 font-bold text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="p-3 w-14 text-center">क्र.सं.</th>
                  <th className="p-3 min-w-[200px]">प्रयोजन नाम (नेपाली)</th>
                  <th className="p-3 min-w-[180px]">English Name</th>
                  <th className="p-3 min-w-[140px]">खण्ड वर्गीकरण</th>
                  <th className="p-3 w-24">क्रम (Sort)</th>
                  <th className="p-3 w-28">स्थिति</th>
                  <th className="p-3 text-right min-w-[120px]">कार्य</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredPurposes.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="p-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{p.nameNepali}</td>
                    <td className="p-3 text-slate-500">{p.nameEnglish || '-'}</td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          p.category === 'BLEED_SITE'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                        }`}
                      >
                        {p.category === 'BLEED_SITE' ? 'खण्ड A (रक्तस्राव)' : 'खण्ड B (रोकथाम/अनडिमान्ड)'}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-600">{p.sortOrder}</td>
                    <td className="p-3">
                      <button
                        onClick={() => handleTogglePurposeActive(p)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          p.isActive
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {p.isActive ? 'सक्रिय' : 'निष्क्रिय'}
                      </button>
                    </td>
                    <td className="p-3 text-right space-x-1">
                      <button
                        onClick={() => {
                          setEditingPurpose(p);
                          setPurposeForm({
                            category: p.category,
                            nameNepali: p.nameNepali,
                            nameEnglish: p.nameEnglish || '',
                            sortOrder: p.sortOrder || 1,
                          });
                          setShowPurposeModal(true);
                        }}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600"
                        title="सम्पादन गर्नुहोस्"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeletePurpose(p.id, p.nameNepali)}
                        className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950 text-rose-600"
                        title="हटाउनुहोस्"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 4: CATALOG (Companies, Products, Capacities) */}
      {/* ========================================================================= */}
      {activeAdminSubTab === 'catalog' && (
        <div className="space-y-6">
          {/* Companies Grid */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  १. फ्याक्टर उत्पादक कम्पनीहरू (Pharma Companies)
                </h3>
                <p className="text-xs text-slate-400">स्टक इन्ट्री गर्दा छनोट हुने कम्पनी सूची</p>
              </div>
              <button
                onClick={() => setShowCompanyModal(true)}
                className="px-3 py-1.5 rounded-xl font-bold text-xs bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center gap-1 shadow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ कम्पनी थप्नुहोस्</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {catalog.companies.map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                >
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{c.name}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${c.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {c.isActive ? 'सक्रिय' : 'निष्क्रिय'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Products Table */}
          <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  २. औषधि ब्रान्ड तथा उत्पादनहरू (Products & Brands)
                </h3>
                <p className="text-xs text-slate-400">कम्पनी अनुसार ब्रान्ड र फ्याक्टर प्रकार म्यापिङ</p>
              </div>
              <button
                onClick={() => {
                  if (catalog.companies.length > 0) {
                    setProductForm({ companyId: catalog.companies[0].id, name: '', factorType: 'Factor VIII' });
                  }
                  setShowProductModal(true);
                }}
                className="px-3 py-1.5 rounded-xl font-bold text-xs bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center gap-1 shadow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ नयाँ उत्पादन ब्रान्ड थप्नुहोस्</span>
              </button>
            </div>

            <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 font-bold text-slate-600 dark:text-slate-300">
                  <tr>
                    <th className="p-2.5">उत्पादक कम्पनी</th>
                    <th className="p-2.5">उत्पादन ब्रान्ड नाम</th>
                    <th className="p-2.5">फ्याक्टर प्रकार</th>
                    <th className="p-2.5 text-right">स्थिति</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {catalog.products.map((p) => (
                    <tr key={p.id}>
                      <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200">{p.company?.name}</td>
                      <td className="p-2.5 font-bold text-brand-600">{p.name}</td>
                      <td className="p-2.5 text-slate-500">{p.factorType}</td>
                      <td className="p-2.5 text-right">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                          {p.isActive ? 'सक्रिय' : 'निष्क्रिय'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Capacities */}
          <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  ३. भाइल क्षमता विकल्पहरू (Vial Capacities IU)
                </h3>
                <p className="text-xs text-slate-400">फ्याक्टर भाइलमा उपलब्ध शक्ति (उदा: 250, 500, 1000, 2000 IU)</p>
              </div>
              <button
                onClick={() => setShowCapacityModal(true)}
                className="px-3 py-1.5 rounded-xl font-bold text-xs bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center gap-1 shadow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ नयाँ क्षमता थप्नुहोस्</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {catalog.capacities.map((cap) => (
                <div
                  key={cap.id}
                  className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold text-xs flex items-center gap-2"
                >
                  <span className="text-brand-600">{cap.capacityIu} IU</span>
                  <span className="text-[10px] text-slate-400">({cap.label})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 5: FORMS & SYSTEM CONFIGURATION */}
      {/* ========================================================================= */}
      {activeAdminSubTab === 'settings' && (
        <div className="space-y-6">
          {/* Factor Types Management */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-600" />
                <span>१. बिरामी दर्ता फारम: फ्याक्टर प्रकारहरू (Factor Types Master)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                बिरामी दर्ता तथा स्टक फारममा देखिने फ्याक्टरका प्रकारहरू कोड बिना नै थप्नुहोस् वा हटाउनुहोस्
              </p>
            </div>

            {/* List of current factor types */}
            <div className="flex flex-wrap gap-2">
              {factorTypesList.map((ft) => (
                <div
                  key={ft}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200"
                >
                  <span>{ft}</span>
                  {factorTypesList.length > 1 && (
                    <button
                      onClick={() => handleRemoveFactorType(ft)}
                      className="text-slate-400 hover:text-rose-600 p-0.5"
                      title="हटाउनुहोस्"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add New Factor Type Input */}
            <div className="flex gap-2 max-w-md pt-2 border-t border-slate-100 dark:border-slate-800">
              <input
                type="text"
                value={newFactorType}
                onChange={(e) => setNewFactorType(e.target.value)}
                placeholder="उदा: Von Willebrand Factor, Cryoprecipitate..."
                className="flex-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
              <button
                type="button"
                onClick={handleAddFactorType}
                className="px-4 py-2 rounded-xl font-bold text-xs bg-brand-600 text-white shadow active:scale-95 transition-all shrink-0"
              >
                + थप्नुहोस्
              </button>
            </div>
          </div>

          {/* Stock & Expiry Thresholds */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Boxes className="w-4 h-4 text-amber-500" />
                <span>२. स्टक सतर्कता तथा म्याद चेतावनी मापदण्ड (Stock & Expiry Alerts)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                ड्यासबोर्ड तथा स्टकमा चेतावनी देखिने न्यूनतम मौज्दात र दिनहरू
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  न्यून मौज्दात थ्रेसहोल्ड (भाइल संख्या)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    value={systemSettings.lowStockThreshold}
                    onChange={(e) =>
                      setSystemSettings({ ...systemSettings, lowStockThreshold: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  />
                  <button
                    onClick={() =>
                      handleSaveSystemSettingKey(
                        'LOW_STOCK_THRESHOLD',
                        systemSettings.lowStockThreshold,
                        'न्यून मौज्दात थ्रेसहोल्ड सुरक्षित गरियो।'
                      )
                    }
                    className="px-3.5 rounded-xl font-bold text-xs bg-slate-900 dark:bg-white text-white dark:text-slate-900 shrink-0"
                  >
                    सेभ
                  </button>
                </div>
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  यसभन्दा कम भाइल भएमा रातो अलर्ट देखिनेछ।
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  म्याद समाप्त पूर्व चेतावनी (दिन)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    value={systemSettings.expiryAlertDays}
                    onChange={(e) =>
                      setSystemSettings({ ...systemSettings, expiryAlertDays: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  />
                  <button
                    onClick={() =>
                      handleSaveSystemSettingKey(
                        'EXPIRY_ALERT_DAYS',
                        systemSettings.expiryAlertDays,
                        'म्याद चेतावनी दिन सुरक्षित गरियो।'
                      )
                    }
                    className="px-3.5 rounded-xl font-bold text-xs bg-slate-900 dark:bg-white text-white dark:text-slate-900 shrink-0"
                  >
                    सेभ
                  </button>
                </div>
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  म्याद सकिन यति दिन बाँकी रहँदा चेतावनी देखिनेछ।
                </span>
              </div>
            </div>
          </div>

          {/* Reports & Official Branding */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>३. रिपोर्ट, प्रिन्ट तथा लेटरहेड ब्रान्डिङ (Reports & Branding)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                प्रिन्ट गर्दा र Excel रिपोर्ट निकाल्दा देखिने आधिकारिक संस्थाको नाम र पद
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  संस्थाको नाम (Organization Name)
                </label>
                <input
                  type="text"
                  value={systemSettings.organizationName}
                  onChange={(e) =>
                    setSystemSettings({ ...systemSettings, organizationName: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  उपशीर्षक (Report Subtitle)
                </label>
                <input
                  type="text"
                  value={systemSettings.reportSubtitle}
                  onChange={(e) =>
                    setSystemSettings({ ...systemSettings, reportSubtitle: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  प्रमाणीकरण पद (Sign-off Role)
                </label>
                <input
                  type="text"
                  value={systemSettings.signOffRole}
                  onChange={(e) =>
                    setSystemSettings({ ...systemSettings, signOffRole: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={async () => {
                  await handleSaveSystemSettingKey(
                    'ORGANIZATION_NAME',
                    systemSettings.organizationName,
                    ''
                  );
                  await handleSaveSystemSettingKey(
                    'REPORT_SUBTITLE',
                    systemSettings.reportSubtitle,
                    ''
                  );
                  await handleSaveSystemSettingKey(
                    'SIGN_OFF_ROLE',
                    systemSettings.signOffRole,
                    'रिपोर्ट तथा संस्था ब्रान्डिङ सेटिङ सफलतापूर्वक सुरक्षित गरियो।'
                  );
                }}
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>ब्रान्डिङ सेटिङ सुरक्षित गर्नुहोस्</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 6: AUDIT TRAIL */}
      {/* ========================================================================= */}
      {activeAdminSubTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase">
              सुरक्षा तथा गतिविधि अडिट अभिलेख (Audit Logs):
            </span>
            <button
              onClick={fetchAuditLogs}
              className="px-3 py-1.5 rounded-xl font-bold text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>ताजा गर्नुहोस्</span>
            </button>
          </div>

          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 font-bold text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="p-3">समय / मिति</th>
                  <th className="p-3">प्रयोगकर्ता</th>
                  <th className="p-3">कार्य (Action)</th>
                  <th className="p-3">संस्था / इकाई</th>
                  <th className="p-3">विवरण / कारण</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {auditLogs.slice(0, 50).map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/50">
                    <td className="p-3 text-slate-500 font-mono">
                      {new Date(l.timestamp).toLocaleString('ne-NP')}
                    </td>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{l.userName}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-100 dark:bg-slate-800 text-brand-600">
                        {l.action}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">{l.entityType}</td>
                    <td className="p-3 text-slate-500 max-w-xs truncate">{l.reason || l.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD OFFICE */}
      {/* ========================================================================= */}
      {showAddOfficeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 text-xs">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-black text-sm text-slate-900 dark:text-white">नयाँ कार्यालय थप्नुहोस्</h3>
              <button onClick={() => setShowAddOfficeModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddOffice} className="space-y-3">
              <div>
                <label className="font-bold block mb-1">कार्यालय कोड (ID) *</label>
                <input
                  type="text"
                  placeholder="उदा: OFFICE_ILAM"
                  value={officeForm.id}
                  onChange={(e) => setOfficeForm({ ...officeForm, id: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="font-bold block mb-1">नाम (नेपालीमा) *</label>
                <input
                  type="text"
                  placeholder="उदा: इलाम स्याटेलाइट"
                  value={officeForm.nameNepali}
                  onChange={(e) => setOfficeForm({ ...officeForm, nameNepali: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Name (English)</label>
                <input
                  type="text"
                  placeholder="Ilam Satellite"
                  value={officeForm.nameEnglish}
                  onChange={(e) => setOfficeForm({ ...officeForm, nameEnglish: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">जिल्ला *</label>
                <input
                  type="text"
                  placeholder="उदा: इलाम"
                  value={officeForm.district}
                  onChange={(e) => setOfficeForm({ ...officeForm, district: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddOfficeModal(false)}
                  className="px-4 py-2 font-bold text-slate-500"
                >
                  रद्द
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 font-bold bg-brand-600 text-white rounded-xl shadow"
                >
                  सुरक्षित गर्नुहोस्
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD USER */}
      {/* ========================================================================= */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 text-xs">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-black text-sm text-slate-900 dark:text-white">नयाँ प्रयोगकर्ता खाता थप्नुहोस्</h3>
              <button onClick={() => setShowAddUserModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="space-y-3">
              <div>
                <label className="font-bold block mb-1">प्रयोगकर्ता नाम (Username) *</label>
                <input
                  type="text"
                  placeholder="उदा: ilam_user"
                  value={userForm.username}
                  onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="font-bold block mb-1">कर्मचारीको पूरा नाम *</label>
                <input
                  type="text"
                  placeholder="उदा: रमेश अधिकारी"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="font-bold block mb-1">गोप्य पासवर्ड (Password) *</label>
                <input
                  type="password"
                  placeholder="न्यूनतम ८ अक्षर"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="font-bold block mb-1">भूमिका (Role) *</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                >
                  <option value="OFFICE_USER">कार्यालय प्रतिनिधि (Office User)</option>
                  <option value="SUPER_ADMIN">केन्द्रीय प्रशासक (Super Admin)</option>
                </select>
              </div>
              {userForm.role === 'OFFICE_USER' && (
                <div>
                  <label className="font-bold block mb-1">कार्यालय तोक्नुहोस् *</label>
                  <select
                    value={userForm.officeId}
                    onChange={(e) => setUserForm({ ...userForm, officeId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                    required
                  >
                    <option value="">कार्यालय छान्नुहोस्...</option>
                    {offices.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.nameNepali}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 font-bold text-slate-500"
                >
                  रद्द
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 font-bold bg-brand-600 text-white rounded-xl shadow"
                >
                  खाता सिर्जना गर्नुहोस्
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ADD / EDIT DISTRIBUTION PURPOSE */}
      {/* ========================================================================= */}
      {showPurposeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 text-xs">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-black text-sm text-slate-900 dark:text-white">
                {editingPurpose ? 'वितरण प्रयोजन सम्पादन' : 'नयाँ वितरण प्रयोजन थप्नुहोस्'}
              </h3>
              <button
                onClick={() => {
                  setShowPurposeModal(false);
                  setEditingPurpose(null);
                }}
                className="text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSavePurpose} className="space-y-3">
              <div>
                <label className="font-bold block mb-1">खण्ड वर्गीकरण (Section Category) *</label>
                <select
                  value={purposeForm.category}
                  onChange={(e) => setPurposeForm({ ...purposeForm, category: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                >
                  <option value="BLEED_SITE">खण्ड A: रक्तस्राव भएको स्थान (Bleed Site)</option>
                  <option value="NON_BLEED">खण्ड B: रोकथाम तथा अन्य प्रयोजन (Non-Bleed / Prophylaxis)</option>
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">प्रयोजन नाम (नेपालीमा) *</label>
                <input
                  type="text"
                  placeholder="उदा: दायाँ खुट्टाको मांसपेशी रक्तस्राव"
                  value={purposeForm.nameNepali}
                  onChange={(e) => setPurposeForm({ ...purposeForm, nameNepali: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="font-bold block mb-1">English Name / Label (वैकल्पिक)</label>
                <input
                  type="text"
                  placeholder="उदा: Right Leg Muscle Bleed"
                  value={purposeForm.nameEnglish}
                  onChange={(e) => setPurposeForm({ ...purposeForm, nameEnglish: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">क्रम संख्या (Sort Order)</label>
                <input
                  type="number"
                  value={purposeForm.sortOrder}
                  onChange={(e) => setPurposeForm({ ...purposeForm, sortOrder: parseInt(e.target.value) || 1 })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPurposeModal(false);
                    setEditingPurpose(null);
                  }}
                  className="px-4 py-2 font-bold text-slate-500"
                >
                  रद्द
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 font-bold bg-brand-600 text-white rounded-xl shadow"
                >
                  {editingPurpose ? 'अद्यावधिक गर्नुहोस्' : 'प्रयोजन सुरक्षित गर्नुहोस्'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: ADD COMPANY */}
      {/* ========================================================================= */}
      {showCompanyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 text-xs">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-black text-sm text-slate-900 dark:text-white">नयाँ कम्पनी थप्नुहोस्</h3>
              <button onClick={() => setShowCompanyModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateCompany} className="space-y-3">
              <div>
                <label className="font-bold block mb-1">कम्पनीको नाम (Company Name) *</label>
                <input
                  type="text"
                  placeholder="उदा: CSL Behring, Baxalta..."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCompanyModal(false)} className="px-4 py-2 text-slate-500 font-bold">
                  रद्द
                </button>
                <button type="submit" className="px-5 py-2 font-bold bg-brand-600 text-white rounded-xl shadow">
                  कम्पनी थप्नुहोस्
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: ADD PRODUCT */}
      {/* ========================================================================= */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 text-xs">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-black text-sm text-slate-900 dark:text-white">नयाँ उत्पादन ब्रान्ड थप्नुहोस्</h3>
              <button onClick={() => setShowProductModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateProduct} className="space-y-3">
              <div>
                <label className="font-bold block mb-1">उत्पादक कम्पनी *</label>
                <select
                  value={productForm.companyId}
                  onChange={(e) => setProductForm({ ...productForm, companyId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  required
                >
                  <option value="">कम्पनी छान्नुहोस्...</option>
                  {catalog.companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-bold block mb-1">उत्पादन / ब्रान्डको नाम *</label>
                <input
                  type="text"
                  placeholder="उदा: Advate, Haemate P..."
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="font-bold block mb-1">फ्याक्टर प्रकार *</label>
                <select
                  value={productForm.factorType}
                  onChange={(e) => setProductForm({ ...productForm, factorType: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                >
                  {factorTypesList.map((ft) => (
                    <option key={ft} value={ft}>
                      {ft}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowProductModal(false)} className="px-4 py-2 text-slate-500 font-bold">
                  रद्द
                </button>
                <button type="submit" className="px-5 py-2 font-bold bg-brand-600 text-white rounded-xl shadow">
                  उत्पादन थप्नुहोस्
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: ADD CAPACITY */}
      {/* ========================================================================= */}
      {showCapacityModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 text-xs">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-black text-sm text-slate-900 dark:text-white">नयाँ भाइल क्षमता (IU) थप्नुहोस्</h3>
              <button onClick={() => setShowCapacityModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateCapacity} className="space-y-3">
              <div>
                <label className="font-bold block mb-1">भाइल क्षमता (IU) *</label>
                <input
                  type="number"
                  min="50"
                  step="50"
                  placeholder="उदा: 250, 500, 1000, 2000"
                  value={capacityForm.capacityIu}
                  onChange={(e) =>
                    setCapacityForm({
                      capacityIu: parseInt(e.target.value) || 0,
                      label: `${e.target.value} IU`,
                    })
                  }
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold font-mono"
                  required
                />
              </div>
              <div>
                <label className="font-bold block mb-1">लेबल (Label)</label>
                <input
                  type="text"
                  value={capacityForm.label}
                  onChange={(e) => setCapacityForm({ ...capacityForm, label: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCapacityModal(false)} className="px-4 py-2 text-slate-500 font-bold">
                  रद्द
                </button>
                <button type="submit" className="px-5 py-2 font-bold bg-brand-600 text-white rounded-xl shadow">
                  क्षमता थप्नुहोस्
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
