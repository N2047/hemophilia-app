'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Boxes,
  PlusCircle,
  Send,
  Building2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  X,
  Plus,
  Trash2,
  History,
  Layers,
  Syringe,
} from 'lucide-react';

export default function StockTab() {
  const { user, isSuperAdmin } = useAuth();
  const [stockBatches, setStockBatches] = useState<any[]>([]);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'batches' | 'transfers'>('batches');

  // Master Data
  const [offices, setOffices] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [capacities, setCapacities] = useState<any[]>([]);
  const [factorTypes, setFactorTypes] = useState<string[]>([
    'Factor VIII',
    'Factor IX',
    'Factor VII',
    'FEIBA',
    'Factor XIII',
    'Factor II',
    'Factor X',
    'Factor XI',
    'Von Willebrand Factor (VWF)',
    'Hemlibra (Emicizumab)',
    'Other',
  ]);

  // Modals
  const [showStockInModal, setShowStockInModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  // Quick Add Company Modal / State
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [companyLoading, setCompanyLoading] = useState(false);
  const [companyError, setCompanyError] = useState<string | null>(null);

  // Quick Add Product Modal / State
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [productModalForm, setProductModalForm] = useState({
    name: '',
    factorType: 'Factor VIII',
    customFactorType: '',
  });
  const [productLoading, setProductLoading] = useState(false);
  const [productError, setProductError] = useState<string | null>(null);

  // Stock In Form
  const [stockInForm, setStockInForm] = useState({
    receiptDate: new Date().toISOString().slice(0, 10),
    companyId: '',
    productId: '',
    capacityIu: 500,
    vialCount: 10,
    batchNumber: '',
    expiryDate: '',
    remarks: '',
  });

  // Stock Transfer Form (Multi-item)
  const [transferForm, setTransferForm] = useState({
    transferDate: new Date().toISOString().slice(0, 10),
    destinationOfficeId: '',
    remarks: '',
    items: [{ centralStockBatchId: '', vialCount: 1 }],
  });

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Deletion States
  const [batchToDelete, setBatchToDelete] = useState<any | null>(null);
  const [transferToDelete, setTransferToDelete] = useState<any | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Delete Batch Handler
  const handleDeleteBatch = async () => {
    if (!batchToDelete) return;
    try {
      setDeleteLoading(true);
      setDeleteError(null);
      const url = isSuperAdmin
        ? `/api/stock/central?id=${encodeURIComponent(batchToDelete.id || '')}&batchNumber=${encodeURIComponent(batchToDelete.batchNumber || '')}`
        : `/api/stock/office?id=${encodeURIComponent(batchToDelete.id || '')}&batchNumber=${encodeURIComponent(batchToDelete.batchNumber || '')}`;
      const res = await fetch(url, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setToastMessage(json.message || 'स्टक ब्याच सफलतापूर्वक हटाइयो।');
        // Immediately remove from UI state
        setStockBatches((prev) =>
          prev.filter((b) => b.id !== batchToDelete.id && b.batchNumber !== batchToDelete.batchNumber)
        );
        setBatchToDelete(null);
        fetchStock();
      } else {
        setDeleteError(json.message || 'स्टक ब्याच मेटाउन सकिएन।');
      }
    } catch (err: any) {
      setDeleteError('नेटवर्क समस्याका कारण मेटाउन सकिएन।');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Delete Transfer Handler
  const handleDeleteTransfer = async () => {
    if (!transferToDelete) return;
    try {
      setDeleteLoading(true);
      setDeleteError(null);
      const res = await fetch(`/api/stock/transfers?id=${transferToDelete.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setToastMessage(json.message || 'स्टक ट्रान्सफर सफलतापूर्वक हटाइयो।');
        setTransferToDelete(null);
        fetchStock();
      } else {
        setDeleteError(json.message || 'ट्रान्सफर मेटाउन सकिएन।');
      }
    } catch (err: any) {
      setDeleteError('नेटवर्क समस्याका कारण मेटाउन सकिएन।');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Fetch Stock Data
  const fetchStock = async () => {
    try {
      setLoading(true);
      const url = isSuperAdmin ? '/api/stock/central' : '/api/stock/office';
      const [resStock, resTransfers] = await Promise.all([
        fetch(url),
        fetch('/api/stock/transfers'),
      ]);

      if (resStock.ok) {
        const json = await resStock.json();
        if (json.success) setStockBatches(json.data);
      }
      if (resTransfers.ok) {
        const json = await resTransfers.json();
        if (json.success) setTransfers(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Master Data
  const fetchMasterData = async () => {
    try {
      const r = await fetch('/api/master-data');
      const d = await r.json();
      if (d.success) {
        setOffices(d.data.offices || []);
        setCompanies(d.data.companies || []);
        setProducts(d.data.products || []);
        setCapacities(d.data.capacities || []);
        if (d.data.factorTypes && d.data.factorTypes.length > 0) {
          setFactorTypes(d.data.factorTypes);
        }
        return d.data;
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  };

  useEffect(() => {
    fetchStock();
    fetchMasterData().then((data) => {
      if (data) {
        if (data.companies?.length > 0 && !stockInForm.companyId) {
          setStockInForm((prev) => ({
            ...prev,
            companyId: data.companies[0].id,
          }));
        }
        if (data.offices?.length > 0 && !transferForm.destinationOfficeId) {
          setTransferForm((prev) => ({
            ...prev,
            destinationOfficeId: data.offices[0].id,
          }));
        }
      }
    });
  }, [isSuperAdmin]);

  // Filter products by selected company
  const filteredProducts = products.filter((p) => p.companyId === stockInForm.companyId);
  const selectedCompany = companies.find((c) => c.id === stockInForm.companyId);

  useEffect(() => {
    if (filteredProducts.length > 0) {
      const exists = filteredProducts.some((p) => p.id === stockInForm.productId);
      if (!exists) {
        setStockInForm((prev) => ({ ...prev, productId: filteredProducts[0].id }));
      }
    } else {
      setStockInForm((prev) => ({ ...prev, productId: '' }));
    }
  }, [stockInForm.companyId, products]);

  // Quick Add Company Handler
  const handleQuickAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) {
      setCompanyError('कृपया कम्पनीको नाम प्रविष्ट गर्नुहोस्।');
      return;
    }
    setCompanyLoading(true);
    setCompanyError(null);
    try {
      const res = await fetch('/api/admin/catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CREATE_COMPANY', name: newCompanyName.trim() }),
      });
      const json = await res.json();
      if (!res.ok) {
        setCompanyError(json.message || 'कम्पनी थप्न सकिएन।');
        return;
      }
      const createdCompany = json.data;
      await fetchMasterData();
      setStockInForm((prev) => ({ ...prev, companyId: createdCompany.id }));
      setToastMessage(`नयाँ कम्पनी "${createdCompany.name}" थपियो। अब यसको लागि नयाँ औषधि थप्नुहोस्।`);
      setNewCompanyName('');
      setShowAddCompanyModal(false);
      // Auto open add product modal for this company
      setProductModalForm({ name: '', factorType: 'Factor VIII', customFactorType: '' });
      setShowAddProductModal(true);
    } catch (err: any) {
      setCompanyError('नेटवर्क समस्याका कारण कम्पनी थप्न सकिएन।');
    } finally {
      setCompanyLoading(false);
    }
  };

  // Quick Add Product Handler
  const handleQuickAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productModalForm.name.trim()) {
      setProductError('कृपया उत्पादन वा औषधिको नाम लेख्नुहोस्।');
      return;
    }
    const finalFactorType =
      productModalForm.factorType === 'OTHER_CUSTOM'
        ? productModalForm.customFactorType.trim()
        : productModalForm.factorType;

    if (!finalFactorType) {
      setProductError('कृपया फ्याक्टर प्रकार छान्नुहोस् वा लेख्नुहोस्।');
      return;
    }

    if (!stockInForm.companyId) {
      setProductError('कृपया पहिले कम्पनी छान्नुहोस्।');
      return;
    }

    setProductLoading(true);
    setProductError(null);
    try {
      const res = await fetch('/api/admin/catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE_PRODUCT',
          companyId: stockInForm.companyId,
          name: productModalForm.name.trim(),
          factorType: finalFactorType,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setProductError(json.message || 'उत्पादन थप्न सकिएन।');
        return;
      }
      const createdProduct = json.data;
      await fetchMasterData();
      setStockInForm((prev) => ({ ...prev, productId: createdProduct.id }));
      setToastMessage(`नयाँ औषधि "${createdProduct.name} (${finalFactorType})" सफलतापुर्वक थपियो।`);
      setProductModalForm({ name: '', factorType: 'Factor VIII', customFactorType: '' });
      setShowAddProductModal(false);
    } catch (err: any) {
      setProductError('नेटवर्क समस्याका कारण औषधि थप्न सकिएन।');
    } finally {
      setProductLoading(false);
    }
  };

  // Submit Stock In
  const handleStockInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!stockInForm.productId || !stockInForm.batchNumber.trim() || !stockInForm.expiryDate) {
      setFormError('कृपया सबै अनिवार्य विवरण भर्नुहोस्।');
      return;
    }

    setFormLoading(true);
    try {
      const res = await fetch('/api/stock/central/entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stockInForm),
      });

      const json = await res.json();
      if (!res.ok) {
        setFormError(json.message || 'स्टक प्रविष्टि असफल भयो।');
        return;
      }

      setFormSuccess(json.message);
      fetchStock();
      setTimeout(() => {
        setShowStockInModal(false);
        setFormSuccess(null);
        setStockInForm((prev) => ({ ...prev, batchNumber: '', remarks: '' }));
      }, 1500);
    } catch (e: any) {
      setFormError('सर्भर समस्या आयो।');
    } finally {
      setFormLoading(false);
    }
  };

  // Usable central batches for transfer
  const usableCentralBatches = stockBatches.filter(
    (b) => b.currentVials > 0 && !b.isExpired && !b.isQuarantined
  );

  // Submit Stock Transfer (Multi-Item)
  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    // Validation
    for (const item of transferForm.items) {
      if (!item.centralStockBatchId) {
        setFormError('कृपया पठाउनुपर्ने औषधि ब्याच छान्नुहोस्।');
        return;
      }
      const batch = usableCentralBatches.find((b) => b.id === item.centralStockBatchId);
      if (batch && item.vialCount > batch.currentVials) {
        setFormError(
          `अपर्याप्त स्टक! ब्याच ${batch.batchNumber} मा ${batch.currentVials} भाइल मात्र बाँकी छ।`
        );
        return;
      }
    }

    setFormLoading(true);
    try {
      const res = await fetch('/api/stock/central/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transferForm),
      });

      const json = await res.json();
      if (!res.ok) {
        setFormError(json.message || 'ट्रान्सफर असफल भयो।');
        return;
      }

      setFormSuccess(json.message);
      fetchStock();
      setTimeout(() => {
        setShowTransferModal(false);
        setFormSuccess(null);
        setTransferForm((prev) => ({
          ...prev,
          remarks: '',
          items: [{ centralStockBatchId: '', vialCount: 1 }],
        }));
      }, 1500);
    } catch (e: any) {
      setFormError('सर्भर समस्या आयो।');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-10">
      {/* Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Boxes className="w-6 h-6 text-brand-600" />
            <span>{isSuperAdmin ? 'केन्द्रीय स्टक व्यवस्थापन (Central Stock)' : 'कार्यालय स्टक मौज्दात'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {isSuperAdmin
              ? 'केन्द्रीय गोदाममा औषधि प्राप्ति, ब्याच मौज्दात तथा स्याटेलाइटमा स्टक ट्रान्सफर'
              : `${user?.officeName}को हालको मौज्दात र स्टक प्राप्ति इतिहास`}
          </p>
        </div>

        {isSuperAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowStockInModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-teal-600 hover:bg-teal-700 text-white shadow-md active:scale-95 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ केन्द्रीय स्टक प्राप्ति</span>
            </button>
            <button
              onClick={() => {
                if (usableCentralBatches.length > 0) {
                  setTransferForm((prev) => ({
                    ...prev,
                    items: [{ centralStockBatchId: usableCentralBatches[0].id, vialCount: 1 }],
                  }));
                }
                setShowTransferModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-brand-600 to-rose-600 text-white shadow-md active:scale-95 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>स्याटेलाइटमा पठाउने (Stock Out)</span>
            </button>
          </div>
        )}
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('batches')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeSubTab === 'batches'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>स्टक ब्याच मौज्दात ({stockBatches.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('transfers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeSubTab === 'transfers'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>{isSuperAdmin ? 'पठाइएका ट्रान्सफरहरू' : 'प्राप्त स्टक ट्रान्सफरहरू'} ({transfers.length})</span>
        </button>
      </div>

      {/* SubTab 1: Stock Batches List */}
      {activeSubTab === 'batches' && (
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500">स्टक विवरण लोड हुँदैछ...</p>
            </div>
          ) : stockBatches.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800">
              <Boxes className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              <p className="font-bold text-slate-700 dark:text-slate-300">स्टकमा हाल कुनै औषधि छैन।</p>
              {isSuperAdmin && (
                <button
                  onClick={() => setShowStockInModal(true)}
                  className="mt-3 px-4 py-2 rounded-xl font-bold text-xs bg-teal-600 text-white shadow"
                >
                  पहिलो स्टक प्रविष्टि गर्नुहोस्
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">कम्पनी तथा उत्पादन</th>
                    <th className="p-3.5">फ्याक्टर</th>
                    <th className="p-3.5">क्षमता</th>
                    <th className="p-3.5">ब्याच नम्बर</th>
                    <th className="p-3.5">म्याद मिति (FEFO)</th>
                    <th className="p-3.5 text-right">बाँकी भाइल</th>
                    <th className="p-3.5 text-right">कुल IU</th>
                    <th className="p-3.5 text-center">स्थिति</th>
                    <th className="p-3.5 text-center w-16">कार्य</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {stockBatches.map((b) => (
                    <tr
                      key={b.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                        <div>{b.company.name}</div>
                        <div className="text-[11px] text-slate-500 font-normal">{b.product.name}</div>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-700 dark:text-slate-300">
                        {b.product.factorType}
                      </td>
                      <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">
                        {b.capacityIu} IU
                      </td>
                      <td className="p-3.5 font-mono font-bold text-slate-700 dark:text-slate-300">
                        {b.batchNumber}
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {new Date(b.expiryDate).toLocaleDateString('ne-NP')}
                        </div>
                        {b.isExpired && (
                          <span className="text-[10px] text-rose-600 font-bold block">
                            म्याद समाप्त!
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right font-black text-sm text-slate-900 dark:text-white">
                        {b.currentVials}{' '}
                        <span className="text-[10px] text-slate-400 font-normal">vials</span>
                      </td>
                      <td className="p-3.5 text-right font-black text-sm text-brand-600 dark:text-brand-400">
                        {b.currentIu.toLocaleString()} IU
                      </td>
                      <td className="p-3.5 text-center">
                        {b.isQuarantined || b.isExpired ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300">
                            रोकिएको (Quarantined)
                          </span>
                        ) : b.currentVials <= 5 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300">
                            न्यून स्टक
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            प्रयोगयोग्य
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => {
                            setDeleteError(null);
                            setBatchToDelete(b);
                          }}
                          title="अनावश्यक स्टक ब्याच मेटाउनुहोस् (Delete Batch)"
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SubTab 2: Transfers History */}
      {activeSubTab === 'transfers' && (
        <div className="space-y-4">
          {transfers.length === 0 ? (
            <p className="text-sm text-slate-400 italic py-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              हाल कुनै स्टक ट्रान्सफर रेकर्ड छैन।
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {transfers.map((t) => (
                <div
                  key={t.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-xs space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-slate-500">
                        {t.transferNumber}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                        <Building2 className="w-4 h-4 text-teal-600" />
                        <span>{t.destinationOffice?.nameNepali || 'स्याटेलाइट'}</span>
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-brand-600 dark:text-brand-400 text-base">
                        {t.totalVials} भाइल
                      </span>
                      <span className="text-slate-400 block font-semibold">
                        {t.totalIu.toLocaleString()} IU
                      </span>
                    </div>
                  </div>

                  {/* Items in this transfer */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1 text-slate-600 dark:text-slate-400">
                    <span className="font-bold text-[11px] text-slate-500 uppercase">
                      औषधि विवरण:
                    </span>
                    {t.items?.map((item: any) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between py-0.5 px-2 rounded bg-slate-50 dark:bg-slate-800/50"
                      >
                        <span>
                          {item.productName} ({item.capacityIu} IU) • ब्याच: <b>{item.batchNumber}</b>
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {item.vialCount} भाइल
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-1 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>
                      मिति: {new Date(t.transferDate).toLocaleDateString('ne-NP')} • पठाउने: {t.sentBy?.name || 'Super Admin'}
                    </span>
                    {isSuperAdmin && (
                      <button
                        onClick={() => {
                          setDeleteError(null);
                          setTransferToDelete(t);
                        }}
                        title="यो ट्रान्सफर रेकर्ड मेटाउनुहोस् (Delete Transfer)"
                        className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>हटाउनुहोस्</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal: Central Stock In */}
      {showStockInModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  केन्द्रीय स्टक प्राप्ति (Stock In)
                </h2>
                <p className="text-xs text-slate-500">
                  कम्पनी/दाताबाट प्राप्त फ्याक्टर औषधि केन्द्रीय गोदाममा प्रविष्टि
                </p>
              </div>
              <button
                onClick={() => setShowStockInModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

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

            <form onSubmit={handleStockInSubmit} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  प्राप्त भएको मिति *
                </label>
                <input
                  type="date"
                  value={stockInForm.receiptDate}
                  onChange={(e) => setStockInForm({ ...stockInForm, receiptDate: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      कम्पनी (Company) *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setCompanyError(null);
                        setNewCompanyName('');
                        setShowAddCompanyModal(true);
                      }}
                      className="text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 hover:underline flex items-center gap-0.5"
                      title="नयाँ कम्पनी सूचीकृत गर्नुहोस्"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ नयाँ कम्पनी</span>
                    </button>
                  </div>
                  <select
                    value={stockInForm.companyId}
                    onChange={(e) => setStockInForm({ ...stockInForm, companyId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      उत्पादन (Product) *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setProductError(null);
                        setProductModalForm({ name: '', factorType: 'Factor VIII', customFactorType: '' });
                        setShowAddProductModal(true);
                      }}
                      className="text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 hover:underline flex items-center gap-0.5"
                      title="नयाँ औषधि / ब्रान्ड थप्नुहोस्"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ नयाँ औषधि</span>
                    </button>
                  </div>
                  {filteredProducts.length > 0 ? (
                    <select
                      value={stockInForm.productId}
                      onChange={(e) => setStockInForm({ ...stockInForm, productId: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    >
                      {filteredProducts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.factorType})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center justify-between gap-1">
                      <span className="text-[10px] text-amber-800 dark:text-amber-300 font-medium truncate">
                        औषधि छैन
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setProductError(null);
                          setProductModalForm({ name: '', factorType: 'Factor VIII', customFactorType: '' });
                          setShowAddProductModal(true);
                        }}
                        className="text-[10px] font-bold bg-amber-600 text-white px-2 py-0.5 rounded-lg hover:bg-amber-700 shrink-0"
                      >
                        + थप्नुहोस्
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    भाइल क्षमता (Capacity IU) *
                  </label>
                  <select
                    value={stockInForm.capacityIu}
                    onChange={(e) =>
                      setStockInForm({ ...stockInForm, capacityIu: parseInt(e.target.value) || 500 })
                    }
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    {capacities.map((cap) => (
                      <option key={cap.id} value={cap.capacityIu}>
                        {cap.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    भाइल संख्या (Vials) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={stockInForm.vialCount}
                    onChange={(e) =>
                      setStockInForm({ ...stockInForm, vialCount: parseInt(e.target.value) || 1 })
                    }
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    required
                  />
                </div>
              </div>

              {/* Auto Total IU Preview */}
              <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 flex items-center justify-between">
                <span className="font-bold text-teal-900 dark:text-teal-200">
                  कुल IU (स्वतः गणना):
                </span>
                <span className="font-black text-sm text-teal-700 dark:text-teal-300">
                  {(stockInForm.capacityIu * stockInForm.vialCount).toLocaleString()} IU
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    ब्याच नम्बर (Batch No.) *
                  </label>
                  <input
                    type="text"
                    value={stockInForm.batchNumber}
                    onChange={(e) => setStockInForm({ ...stockInForm, batchNumber: e.target.value })}
                    placeholder="उदा: BTH-9021X"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono uppercase"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    म्याद सकिने मिति (Expiry Date) *
                  </label>
                  <input
                    type="date"
                    value={stockInForm.expiryDate}
                    onChange={(e) => setStockInForm({ ...stockInForm, expiryDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  कैफियत (Remarks)
                </label>
                <input
                  type="text"
                  value={stockInForm.remarks}
                  onChange={(e) => setStockInForm({ ...stockInForm, remarks: e.target.value })}
                  placeholder="उदा: WFH अनुदानबाट प्राप्त"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowStockInModal(false)}
                  className="px-4 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2.5 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-500/20 disabled:opacity-50"
                >
                  {formLoading ? 'सुरक्षित हुँदैछ...' : 'स्टक सुरक्षित गर्नुहोस्'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Quick Add Company */}
      {showAddCompanyModal && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">नयाँ कम्पनी थप्नुहोस्</h3>
                  <p className="text-[11px] text-slate-400">फ्याक्टर उत्पादक वा दाता कम्पनी</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddCompanyModal(false);
                  setCompanyError(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {companyError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{companyError}</span>
              </div>
            )}

            <form onSubmit={handleQuickAddCompany} className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  कम्पनीको नाम (Company Name) *
                </label>
                <input
                  type="text"
                  placeholder="उदा: Bayer, Sanofi, BPL, Kedrion..."
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 font-semibold"
                  required
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCompanyModal(false);
                    setCompanyError(null);
                  }}
                  className="px-3.5 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-xl"
                >
                  रद्द
                </button>
                <button
                  type="submit"
                  disabled={companyLoading}
                  className="px-4 py-2 font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow disabled:opacity-50 flex items-center gap-1.5"
                >
                  {companyLoading ? (
                    <span>थपिँदैछ...</span>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>कम्पनी थप्नुहोस्</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Quick Add Product / Factor */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400">
                  <Syringe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">नयाँ औषधि / उत्पादन थप्नुहोस्</h3>
                  <p className="text-[11px] text-teal-700 dark:text-teal-300 font-bold">
                    कम्पनी: {selectedCompany?.name || 'छानिएको कम्पनी'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddProductModal(false);
                  setProductError(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {productError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{productError}</span>
              </div>
            )}

            <form onSubmit={handleQuickAddProduct} className="space-y-3.5">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  औषधि / ब्रान्डको नाम (Product Name) *
                </label>
                <input
                  type="text"
                  placeholder="उदा: Feiba, NovoSeven RT, Novo 7, CIBA Factor VII, Advate, Helixate..."
                  value={productModalForm.name}
                  onChange={(e) => setProductModalForm({ ...productModalForm, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 font-semibold"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  फ्याक्टर प्रकार (Factor Type) *
                </label>
                <select
                  value={productModalForm.factorType}
                  onChange={(e) => setProductModalForm({ ...productModalForm, factorType: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                >
                  <option value="Factor VIII">Factor VIII (फ्याक्टर VIII - Hemophilia A)</option>
                  <option value="Factor IX">Factor IX (फ्याक्टर IX - Hemophilia B)</option>
                  <option value="Factor VII">Factor VII (फ्याक्टर VII - Factor VII Deficiency / NovoSeven)</option>
                  <option value="FEIBA">FEIBA (फेइबा - Factor VIII Inhibitor Bypassing Activity)</option>
                  <option value="Factor XIII">Factor XIII (फ्याक्टर XIII)</option>
                  <option value="Factor II">Factor II (फ्याक्टर II)</option>
                  <option value="Factor X">Factor X (फ्याक्टर X)</option>
                  <option value="Factor XI">Factor XI (फ्याक्टर XI)</option>
                  <option value="Von Willebrand Factor (VWF)">Von Willebrand Factor (VWF)</option>
                  <option value="Hemlibra (Emicizumab)">Hemlibra (Emicizumab)</option>
                  {factorTypes
                    .filter(
                      (ft) =>
                        ![
                          'Factor VIII',
                          'Factor IX',
                          'Factor VII',
                          'FEIBA',
                          'Factor XIII',
                          'Factor II',
                          'Factor X',
                          'Factor XI',
                          'Von Willebrand Factor (VWF)',
                          'Hemlibra (Emicizumab)',
                          'Other',
                        ].includes(ft)
                    )
                    .map((ft) => (
                      <option key={ft} value={ft}>
                        {ft}
                      </option>
                    ))}
                  <option value="OTHER_CUSTOM">+ अन्य नयाँ फ्याक्टर प्रकार टाइप गर्नुहोस्...</option>
                </select>

                {productModalForm.factorType === 'OTHER_CUSTOM' && (
                  <div className="mt-2 p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-dashed border-teal-400">
                    <label className="font-bold text-[11px] text-teal-700 dark:text-teal-300 block mb-1">
                      नयाँ फ्याक्टर प्रकारको नाम लेख्नुहोस् *
                    </label>
                    <input
                      type="text"
                      placeholder="उदा: Cryoprecipitate, Factor V, etc."
                      value={productModalForm.customFactorType}
                      onChange={(e) =>
                        setProductModalForm({ ...productModalForm, customFactorType: e.target.value })
                      }
                      className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      required
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddProductModal(false);
                    setProductError(null);
                  }}
                  className="px-3.5 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-xl"
                >
                  रद्द
                </button>
                <button
                  type="submit"
                  disabled={productLoading}
                  className="px-4 py-2 font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow disabled:opacity-50 flex items-center gap-1.5"
                >
                  {productLoading ? (
                    <span>थपिँदैछ...</span>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>औषधि सुरक्षित गर्नुहोस्</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Central Stock Transfer (Multi-Item) */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  स्याटेलाइटमा औषधि पठाउने फाराम
                </h2>
                <p className="text-xs text-slate-500">
                  केन्द्रीय स्टकबाट स्याटेलाइट/विराटनगर अफिसमा Multi-Item स्टक ट्रान्सफर
                </p>
              </div>
              <button
                onClick={() => setShowTransferModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

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

            <form onSubmit={handleTransferSubmit} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    पठाएको मिति *
                  </label>
                  <input
                    type="date"
                    value={transferForm.transferDate}
                    onChange={(e) =>
                      setTransferForm({ ...transferForm, transferDate: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    गन्तव्य कार्यालय/स्याटेलाइट *
                  </label>
                  <select
                    value={transferForm.destinationOfficeId}
                    onChange={(e) =>
                      setTransferForm({ ...transferForm, destinationOfficeId: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    {offices.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.nameNepali} ({o.district})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Multi-Item Selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-slate-800 dark:text-slate-200 block">
                    पठाइने औषधि Item हरू (Dynamic Stock Items) *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (usableCentralBatches.length > 0) {
                        setTransferForm((prev) => ({
                          ...prev,
                          items: [
                            ...prev.items,
                            { centralStockBatchId: usableCentralBatches[0].id, vialCount: 1 },
                          ],
                        }));
                      }
                    }}
                    className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> थप Item थप्नुहोस्
                  </button>
                </div>

                {usableCentralBatches.length === 0 ? (
                  <p className="p-4 rounded-xl bg-rose-50 text-rose-700 text-xs">
                    केन्द्रीय स्टकमा हाल कुनै प्रयोगयोग्य औषधि उपलब्ध छैन।
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {transferForm.items.map((item, idx) => {
                      const selectedBatch = usableCentralBatches.find(
                        (b) => b.id === item.centralStockBatchId
                      );

                      return (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[11px] text-slate-500 uppercase">
                              Item #{idx + 1}
                            </span>
                            {transferForm.items.length > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setTransferForm((prev) => ({
                                    ...prev,
                                    items: prev.items.filter((_, i) => i !== idx),
                                  }))
                                }
                                className="text-rose-600 hover:text-rose-800 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div className="sm:col-span-2">
                              <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                                उपलब्ध केन्द्रीय ब्याच छान्नुहोस्
                              </label>
                              <select
                                value={item.centralStockBatchId}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setTransferForm((prev) => {
                                    const next = [...prev.items];
                                    next[idx].centralStockBatchId = val;
                                    return { ...prev, items: next };
                                  });
                                }}
                                className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                              >
                                {usableCentralBatches.map((b) => (
                                  <option key={b.id} value={b.id}>
                                    {b.product.name} ({b.capacityIu} IU) • ब्याच: {b.batchNumber} (बाँकी:{' '}
                                    {b.currentVials} भाइल)
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                                पठाउने भाइल संख्या
                              </label>
                              <input
                                type="number"
                                min="1"
                                max={selectedBatch?.currentVials || 9999}
                                value={item.vialCount}
                                onChange={(e) => {
                                  const count = parseInt(e.target.value) || 1;
                                  setTransferForm((prev) => {
                                    const next = [...prev.items];
                                    next[idx].vialCount = count;
                                    return { ...prev, items: next };
                                  });
                                }}
                                className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                                required
                              />
                            </div>
                          </div>

                          {selectedBatch && (
                            <div className="text-[11px] text-slate-500 flex justify-between pt-1 border-t border-slate-200/50">
                              <span>
                                ब्याच मौज्दात: <b>{selectedBatch.currentVials}</b> भाइल | म्याद:{' '}
                                {new Date(selectedBatch.expiryDate).toLocaleDateString('ne-NP')}
                              </span>
                              <span className="font-bold text-teal-600">
                                कुल IU: {(selectedBatch.capacityIu * item.vialCount).toLocaleString()}{' '}
                                IU
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  कैफियत (Remarks)
                </label>
                <input
                  type="text"
                  value={transferForm.remarks}
                  onChange={(e) => setTransferForm({ ...transferForm, remarks: e.target.value })}
                  placeholder="उदा: नियमित मागबमोजिम पठाइएको"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  disabled={formLoading || usableCentralBatches.length === 0}
                  className="px-5 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-brand-600 to-rose-600 hover:from-brand-700 hover:to-rose-700 shadow-md shadow-brand-500/20 disabled:opacity-50"
                >
                  {formLoading ? 'ट्रान्सफर हुँदैछ...' : 'पुष्टि गरी औषधि पठाउनुहोस्'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE STOCK BATCH MODAL */}
      {batchToDelete && (
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
                  स्टक ब्याच तथ्यांक मेटाउनुहोस्
                </h3>
                <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold font-mono">
                  ब्याच नं: {batchToDelete.batchNumber}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">कम्पनी / औषधि:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {batchToDelete.company?.name} ({batchToDelete.product?.name})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">क्षमता / फ्याक्टर:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {batchToDelete.product?.factorType} ({batchToDelete.capacityIu} IU)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">हालको मौज्दात:</span>
                <span className="font-bold text-brand-600">
                  {batchToDelete.currentVials} भाइल ({batchToDelete.currentIu?.toLocaleString()} IU)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">म्याद मिति:</span>
                <span className="text-slate-700 dark:text-slate-300">
                  {new Date(batchToDelete.expiryDate).toLocaleDateString('ne-NP')}
                </span>
              </div>
            </div>

            {deleteError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-medium">
                {deleteError}
              </div>
            )}

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              ⚠️ के तपाईं निश्चित हुनुहुन्छ? यो ब्याचको स्टक रेकर्ड स्थायी रूपमा हटाइनेछ।
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setBatchToDelete(null);
                  setDeleteError(null);
                }}
                disabled={deleteLoading}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                रद्द गर्नुहोस्
              </button>
              <button
                type="button"
                onClick={handleDeleteBatch}
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

      {/* CONFIRM DELETE TRANSFER MODAL */}
      {transferToDelete && (
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
                  स्टक ट्रान्सफर रेकर्ड मेटाउनुहोस्
                </h3>
                <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold font-mono">
                  ट्रान्सफर नं: {transferToDelete.transferNumber}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">गन्तव्य कार्यालय:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {transferToDelete.destinationOffice?.nameNepali || 'स्याटेलाइट'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">कुल औषधि परिमाण:</span>
                <span className="font-bold text-brand-600">
                  {transferToDelete.totalVials} भाइल ({transferToDelete.totalIu?.toLocaleString()} IU)
                </span>
              </div>
            </div>

            {deleteError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-medium">
                {deleteError}
              </div>
            )}

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              के तपाईं निश्चित हुनुहुन्छ? यो ट्रान्सफर मेटाउँदा पठाइएका औषधि भाइलहरू केन्द्रीय स्टकमा स्वतः फिर्ता जोडिनेछन्।
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setTransferToDelete(null);
                  setDeleteError(null);
                }}
                disabled={deleteLoading}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                रद्द गर्नुहोस्
              </button>
              <button
                type="button"
                onClick={handleDeleteTransfer}
                disabled={deleteLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/20 active:scale-95 disabled:opacity-50 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{deleteLoading ? 'मेटाउँदैछ...' : 'हो, ट्रान्सफर डिलिट गर्नुहोस्'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACTION SUCCESS TOAST */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-xl border bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-200 flex items-center gap-3 animate-in fade-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
