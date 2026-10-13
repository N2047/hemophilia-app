'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Syringe,
  Search,
  User,
  AlertCircle,
  CheckCircle2,
  Printer,
  X,
  Plus,
  Trash2,
  Building2,
  Calendar,
  HeartPulse,
} from 'lucide-react';

interface DistributeTabProps {
  initialPatient?: any | null;
  onClearInitialPatient?: () => void;
}

export default function DistributeTab({
  initialPatient,
  onClearInitialPatient,
}: DistributeTabProps) {
  const { user, isSuperAdmin } = useAuth();
  const [patientSearch, setPatientSearch] = useState('');
  const [searchedPatients, setSearchedPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(initialPatient || null);

  // Office Stock Batches
  const [officeBatches, setOfficeBatches] = useState<any[]>([]);
  const [offices, setOffices] = useState<any[]>([]);
  const [selectedOfficeId, setSelectedOfficeId] = useState<string>(
    user?.officeId || 'OFFICE_BIRATNAGAR'
  );

  // Distribution Form
  const [distributionDate, setDistributionDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [prescribingClinician, setPrescribingClinician] = useState('');
  const [selectedPurposes, setSelectedPurposes] = useState<string[]>([
    'जोर्नीमा रक्तस्राव (सामान्य)',
  ]);
  const [purposeDetails, setPurposeDetails] = useState('');
  const [remarks, setRemarks] = useState('');
  const [items, setItems] = useState<Array<{ officeStockBatchId: string; vialCount: number }>>([
    { officeStockBatchId: '', vialCount: 1 },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [printedVoucher, setPrintedVoucher] = useState<any | null>(null);

  // Dynamic Purpose choices (defaults + loaded from database)
  const [bleedPurposes, setBleedPurposes] = useState<string[]>([
    'जोर्नीमा रक्तस्राव (सामान्य)',
    'घुँडाको जोर्नीमा रक्तस्राव',
    'कुहिनाको जोर्नीमा रक्तस्राव',
    'गोलीगाँठोको जोर्नीमा रक्तस्राव',
    'काँध वा नाडीको जोर्नीमा रक्तस्राव',
    'मांसपेशीमा रक्तस्राव',
    'छाला वा नरम तन्तुमा रक्तस्राव',
    'नाकबाट रक्तस्राव',
    'मुख वा गिजाबाट रक्तस्राव',
    'दाँत उपचार (Dental Procedure)',
    'चोटपटक वा दुर्घटना (Trauma/Accident)',
    'पिसाबमा रगत',
    'दिसामा रगत वा पेट–आन्द्राभित्र रक्तस्राव',
    'टाउको वा मस्तिष्कभित्र रक्तस्राव',
    'घाँटीमा रक्तस्राव',
    'अन्य स्थानमा रक्तस्राव',
  ]);

  const [nonBleedPurposes, setNonBleedPurposes] = useState<string[]>([
    'आवश्यकता अनुसार (अनडिमान्ड / On-demand)',
    'नियमित रोकथाम (Prophylaxis)',
    'शल्यक्रियाअघि (Pre-surgery)',
    'शल्यक्रियापछि (Post-surgery)',
  ]);

  // Load usable stock for the selected office
  const fetchOfficeStock = async (targetOfficeId: string) => {
    try {
      const res = await fetch(`/api/stock/office?officeId=${targetOfficeId}&availableOnly=true`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setOfficeBatches(json.data);
          if (json.data.length > 0) {
            setItems([{ officeStockBatchId: json.data[0].id, vialCount: 1 }]);
          } else {
            setItems([{ officeStockBatchId: '', vialCount: 1 }]);
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (initialPatient) {
      setSelectedPatient(initialPatient);
    }
  }, [initialPatient]);

  useEffect(() => {
    fetch('/api/master-data')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          if (d.data.offices) setOffices(d.data.offices);
          if (d.data.purposes && d.data.purposes.length > 0) {
            const bleed = d.data.purposes
              .filter((p: any) => p.category === 'BLEED_SITE' && p.isActive)
              .map((p: any) => p.nameNepali);
            const nonBleed = d.data.purposes
              .filter((p: any) => p.category === 'NON_BLEED' && p.isActive)
              .map((p: any) => p.nameNepali);
            if (bleed.length > 0) setBleedPurposes(bleed);
            if (nonBleed.length > 0) setNonBleedPurposes(nonBleed);
          }
        }
      });
  }, []);

  useEffect(() => {
    const target = isSuperAdmin ? selectedOfficeId : user?.officeId || 'OFFICE_BIRATNAGAR';
    if (target) {
      fetchOfficeStock(target);
    }
  }, [selectedOfficeId, user?.officeId, isSuperAdmin]);

  // Search Patients
  const handleSearchPatient = async (q: string) => {
    setPatientSearch(q);
    if (q.trim().length < 2) {
      setSearchedPatients([]);
      return;
    }
    try {
      const res = await fetch(`/api/patients?q=${encodeURIComponent(q.trim())}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) setSearchedPatients(json.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTogglePurpose = (pur: string) => {
    setSelectedPurposes((prev) => {
      if (prev.includes(pur)) {
        const next = prev.filter((p) => p !== pur);
        return next.length === 0 ? [pur] : next;
      } else {
        return [...prev, pur];
      }
    });
  };

  // Submit Distribution
  const handleSubmitDistribution = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!selectedPatient) {
      setError('कृपया औषधि प्राप्त गर्ने बिरामी चयन गर्नुहोस्।');
      return;
    }

    if (officeBatches.length === 0) {
      setError('यस कार्यालयको स्टकमा कुनै पनि औषधि उपलब्ध छैन।');
      return;
    }

    for (const item of items) {
      if (!item.officeStockBatchId) {
        setError('कृपया वितरण गर्ने औषधि ब्याच छान्नुहोस्।');
        return;
      }
      const b = officeBatches.find((batch) => batch.id === item.officeStockBatchId);
      if (b && item.vialCount > b.currentVials) {
        setError(
          `अपर्याप्त स्टक! ब्याच ${b.batchNumber} मा ${b.currentVials} भाइल मात्र बाँकी छ, तर ${item.vialCount} वितरण गर्न खोजियो।`
        );
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        distributionDate,
        patientId: selectedPatient.id,
        officeId: isSuperAdmin ? selectedOfficeId : user?.officeId,
        prescribingClinician: prescribingClinician.trim() || null,
        purposes: selectedPurposes,
        purposeDetails: purposeDetails.trim() || null,
        remarks: remarks.trim() || null,
        items,
      };

      const res = await fetch('/api/stock/office/distribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.message || 'औषधि वितरण असफल भयो।');
        return;
      }

      setSuccess(json.message);
      setPrintedVoucher(json.data);

      // Refresh local stock
      const target = isSuperAdmin ? selectedOfficeId : user?.officeId || 'OFFICE_BIRATNAGAR';
      fetchOfficeStock(target);

      // Reset form
      setRemarks('');
      setPurposeDetails('');
      if (onClearInitialPatient) onClearInitialPatient();
    } catch (e: any) {
      setError('सर्भर समस्या आयो।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-10 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Syringe className="w-6 h-6 text-brand-600" />
          <span>बिरामीलाई औषधि वितरण फाराम (Patient Factor Distribution)</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          कार्यालय स्टकबाट बिरामीलाई क्लटिङ फ्याक्टर वितरण तथा भौचर सिर्जना
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmitDistribution} className="space-y-5 text-xs">
        {/* Step 1: Patient Selection */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
            <span>१. बिरामी खोज्नुहोस् तथा छान्नुहोस् *</span>
            {selectedPatient && (
              <button
                type="button"
                onClick={() => {
                  setSelectedPatient(null);
                  if (onClearInitialPatient) onClearInitialPatient();
                }}
                className="text-xs font-semibold text-rose-600 hover:underline"
              >
                अर्को बिरामी छान्नुहोस्
              </button>
            )}
          </h2>

          {!selectedPatient ? (
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={patientSearch}
                  onChange={(e) => handleSearchPatient(e.target.value)}
                  placeholder="बिरामीको नाम वा Patient ID टाइप गर्नुहोस् (उदा: नवीन वा HEP-2026-0001)..."
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              {searchedPatients.length > 0 && (
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 max-h-48 overflow-y-auto">
                  {searchedPatients.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setSelectedPatient(p);
                        setSearchedPatients([]);
                        setPatientSearch('');
                      }}
                      className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {p.fullName}
                        </span>
                        <span className="text-slate-400 ml-2">({p.patientCode})</span>
                        <div className="text-[11px] text-slate-500">
                          {p.localLevel}-{p.wardNo}, {p.district} • फोन: {p.phone}
                        </div>
                      </div>
                      <span className="font-bold text-brand-600">{p.factorType}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-sm">
                  {selectedPatient.fullName.slice(0, 2)}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-sm">
                    {selectedPatient.fullName}
                  </h3>
                  <div className="text-slate-500 text-[11px]">
                    ID: <b>{selectedPatient.patientCode}</b> • {selectedPatient.bloodGroup} •{' '}
                    {selectedPatient.factorType} ({selectedPatient.severity})
                  </div>
                  <div className="text-slate-400 text-[10px]">
                    ठेगाना: {selectedPatient.localLevel}-{selectedPatient.wardNo},{' '}
                    {selectedPatient.district}
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                सम्बद्ध प्रोफाइल
              </span>
            </div>
          )}
        </div>

        {/* Step 2: Distribution Context & Office */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h2 className="font-bold text-sm text-slate-900 dark:text-white">
            २. वितरण कार्यालय तथा मिति
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                वितरण मिति *
              </label>
              <input
                type="date"
                value={distributionDate}
                onChange={(e) => setDistributionDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                वितरण गर्ने कार्यालय (Dispensing Office) *
              </label>
              {isSuperAdmin ? (
                <select
                  value={selectedOfficeId}
                  onChange={(e) => setSelectedOfficeId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                >
                  {offices.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.nameNepali} ({o.district})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={user?.officeName || 'कार्यालय'}
                  disabled
                  className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 font-bold"
                />
              )}
            </div>
          </div>
        </div>

        {/* Step 3: Available Stock Selection (Multi-Item) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm text-slate-900 dark:text-white">
              ३. कार्यालय स्टकबाट औषधि चयन (Stock Batch Items) *
            </h2>
            {officeBatches.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  setItems((prev) => [
                    ...prev,
                    { officeStockBatchId: officeBatches[0].id, vialCount: 1 },
                  ])
                }
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> थप ब्याच थप्नुहोस्
              </button>
            )}
          </div>

          {officeBatches.length === 0 ? (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              ⚠️ यस कार्यालयको स्टकमा हाल कुनै पनि प्रयोगयोग्य औषधि उपलब्ध छैन!
            </div>
          ) : (
            <div className="space-y-2.5">
              {items.map((item, idx) => {
                const batch = officeBatches.find((b) => b.id === item.officeStockBatchId);

                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[11px] text-slate-500 uppercase">
                        Item #{idx + 1}
                      </span>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
                          className="text-rose-600 hover:text-rose-800 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                          उपलब्ध औषधि ब्याच छान्नुहोस्
                        </label>
                        <select
                          value={item.officeStockBatchId}
                          onChange={(e) => {
                            const val = e.target.value;
                            setItems((prev) => {
                              const next = [...prev];
                              next[idx].officeStockBatchId = val;
                              return next;
                            });
                          }}
                          className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                        >
                          {officeBatches.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.product.name} ({b.capacityIu} IU) • ब्याच: {b.batchNumber} (मौज्दात:{' '}
                              {b.currentVials} भाइल)
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                          भाइल संख्या
                        </label>
                        <input
                          type="number"
                          min="1"
                          max={batch?.currentVials || 9999}
                          value={item.vialCount}
                          onChange={(e) => {
                            const count = parseInt(e.target.value) || 1;
                            setItems((prev) => {
                              const next = [...prev];
                              next[idx].vialCount = count;
                              return next;
                            });
                          }}
                          className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                          required
                        />
                      </div>
                    </div>

                    {batch && (
                      <div className="text-[11px] text-slate-500 flex justify-between pt-1 border-t border-slate-200/50">
                        <span>
                          ब्याच मौज्दात: <b>{batch.currentVials}</b> भाइल | म्याद:{' '}
                          {new Date(batch.expiryDate).toLocaleDateString('ne-NP')}
                        </span>
                        <span className="font-bold text-brand-600">
                          कुल IU: {(batch.capacityIu * item.vialCount).toLocaleString()} IU
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Step 4: Purpose of Distribution */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h2 className="font-bold text-sm text-slate-900 dark:text-white">
            ४. औषधि वितरणको प्रयोजन (Distribution Purpose) *
          </h2>

          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1.5">
              A. रक्तस्राव भएको स्थान (Bleed Sites):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {bleedPurposes.map((p) => {
                const isSelected = selectedPurposes.includes(p);
                return (
                  <button
                    type="button"
                    key={p}
                    onClick={() => handleTogglePurpose(p)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1.5">
              B. रोकथाम तथा अन्य चिकित्सकीय प्रयोजन (Non-Bleed / Prophylaxis):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {nonBleedPurposes.map((p) => {
                const isSelected = selectedPurposes.includes(p);
                return (
                  <button
                    type="button"
                    key={p}
                    onClick={() => handleTogglePurpose(p)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                प्रयोजनको थप विवरण (Purpose Details)
              </label>
              <input
                type="text"
                value={purposeDetails}
                onChange={(e) => setPurposeDetails(e.target.value)}
                placeholder="उदा: दायाँ घुँडा सुन्निएको, २ दिनदेखि दुखाइ"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                सिफारिस गर्ने चिकित्सक (Prescribing Clinician)
              </label>
              <input
                type="text"
                value={prescribingClinician}
                onChange={(e) => setPrescribingClinician(e.target.value)}
                placeholder="उदा: डा. सन्तोष अधिकारी"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              कैफियत (Remarks)
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="उदा: बिरामीलाई औषधि प्रयोगबारे परामर्श दिइयो"
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={loading || !selectedPatient || officeBatches.length === 0}
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-brand-600 to-rose-600 hover:from-brand-700 hover:to-rose-700 shadow-md shadow-brand-500/25 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            <Syringe className="w-5 h-5" />
            <span>{loading ? 'वितरण गरिँदैछ...' : 'औषधि वितरण सुरक्षित गर्नुहोस् (Confirm)'}</span>
          </button>
        </div>
      </form>

      {/* Printable Receipt / Voucher Modal */}
      {printedVoucher && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 no-print">
              <span className="font-bold text-emerald-600 flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>वितरण सुरक्षित भयो!</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>प्रिन्ट गर्नुहोस्</span>
                </button>
                <button
                  onClick={() => setPrintedVoucher(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Voucher Paper */}
            <div className="mt-4 p-5 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 dark:bg-slate-800 dark:text-slate-100 text-xs space-y-4">
              <div className="text-center border-b pb-3 border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-center gap-2">
                  <HeartPulse className="w-5 h-5 text-brand-600" />
                  <h3 className="font-black text-base">नेपाल हेमोफिलिया सोसाइटी</h3>
                </div>
                <p className="font-bold text-slate-600 dark:text-slate-300 text-xs">
                  फ्याक्टर औषधि वितरण रसिद / भौचर (Factor Dispensation Voucher)
                </p>
                <div className="text-[11px] text-slate-400 mt-1 font-mono">
                  भौचर नं: <b>{printedVoucher.voucherNumber}</b>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block">बिरामीको नाम:</span>
                  <span className="font-bold text-sm">{selectedPatient?.fullName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Patient ID:</span>
                  <span className="font-bold font-mono text-sm">
                    {selectedPatient?.patientCode}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">वितरण मिति:</span>
                  <span className="font-semibold">
                    {new Date(printedVoucher.distributionDate).toLocaleDateString('ne-NP')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">वितरण कार्यालय:</span>
                  <span className="font-semibold">
                    {printedVoucher.office?.nameNepali || 'कार्यालय'}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-700 font-bold">
                    <tr>
                      <th className="p-2">उत्पादन / ब्याच</th>
                      <th className="p-2 text-right">भाइल संख्या</th>
                      <th className="p-2 text-right">कुल IU</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {printedVoucher.items?.map((it: any) => (
                      <tr key={it.id}>
                        <td className="p-2">
                          <b>{it.productName}</b> ({it.capacityIu} IU)
                          <div className="text-[10px] text-slate-400">ब्याच: {it.batchNumber}</div>
                        </td>
                        <td className="p-2 text-right font-bold">{it.vialCount}</td>
                        <td className="p-2 text-right font-bold text-brand-600">
                          {it.totalIu.toLocaleString()} IU
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 dark:bg-slate-700/50 font-black">
                    <tr>
                      <td className="p-2">कुल जम्मा (Total):</td>
                      <td className="p-2 text-right">{printedVoucher.totalVials} भाइल</td>
                      <td className="p-2 text-right text-brand-600">
                        {printedVoucher.totalIu.toLocaleString()} IU
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Signatures */}
              <div className="pt-6 grid grid-cols-2 gap-4 text-center text-[11px] text-slate-500">
                <div className="border-t border-slate-300 dark:border-slate-600 pt-2">
                  <span>औषधि प्राप्त गर्ने (बिरामी/अभिभावक)</span>
                </div>
                <div className="border-t border-slate-300 dark:border-slate-600 pt-2">
                  <span>वितरण गर्ने कर्मचारीको दस्तखत</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
