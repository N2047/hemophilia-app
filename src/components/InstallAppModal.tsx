'use client';

import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Apple, 
  Download, 
  CheckCircle2, 
  X, 
  Share2, 
  PlusSquare, 
  ShieldAlert, 
  Sparkles,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InstallAppModal({ isOpen, onClose }: InstallAppModalProps) {
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'store'>('android');
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as unknown as { standalone?: boolean }).standalone;
    if (isStandalone) {
      setIsInstalled(true);
    }

    // Detect user OS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isAndroidDevice = /android/.test(userAgent);
    
    setIsIOS(isIosDevice);
    setIsAndroid(isAndroidDevice);
    if (isIosDevice) {
      setActiveTab('ios');
    } else {
      setActiveTab('android');
    }

    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.error('Install prompt failed:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-brand-600 via-brand-700 to-rose-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center shadow-inner">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight">
                मोबाइलमा एप इन्स्टल गर्नुहोस्
              </h2>
              <p className="text-xs text-white/80">
                एन्ड्रोइड (Android) र आइफोन (iPhone) दुवैमा तुरुन्तै चल्छ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-1.5 gap-1.5">
          <button
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'android'
                ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-600" />
            <span>एन्ड्रोइड (Android)</span>
            {isAndroid && <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">तपाईंको फोन</span>}
          </button>

          <button
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'ios'
                ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Apple className="w-4 h-4 text-slate-800 dark:text-slate-200" />
            <span>आइफोन (iPhone / iOS)</span>
            {isIOS && <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-bold">तपाईंको फोन</span>}
          </button>

          <button
            onClick={() => setActiveTab('store')}
            className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'store'
                ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-amber-500" />
            <span className="hidden sm:inline">स्टोर जानकारी</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {isInstalled && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-200 font-medium">
                यो एप यस डिभाइसमा पहिले नै पूर्ण रूपमा इन्स्टल भइसकेको छ।
              </p>
            </div>
          )}

          {/* ANDROID TAB */}
          {activeTab === 'android' && (
            <div className="space-y-4">
              {deferredPrompt && !isInstalled && (
                <div className="p-4 bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 rounded-xl text-center space-y-2">
                  <p className="text-sm font-bold text-brand-800 dark:text-brand-300">
                    🎉 तपाईंको एन्ड्रोइड फोनमा १-क्लिक इन्स्टल उपलब्ध छ!
                  </p>
                  <button
                    onClick={handleInstallClick}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-500/20 active:scale-95 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    अहिले सिधै इन्स्टल गर्नुहोस् (Install Now)
                  </button>
                </div>
              )}

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  एन्ड्रोइड (Chrome / Samsung Internet) मा राख्ने सजिलो ३ चरण:
                </h3>

                <div className="space-y-2.5">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-bold text-xs flex items-center justify-center shrink-0">
                      १
                    </span>
                    <div className="text-xs sm:text-sm">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        Chrome ब्राउजर खोल्नुहोस् र माथिल्लो दायाँ भागमा रहेको तीन थोप्ला (⋮) मा थिच्नुहोस्।
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-bold text-xs flex items-center justify-center shrink-0">
                      २
                    </span>
                    <div className="text-xs sm:text-sm">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        <span className="text-brand-600 dark:text-brand-400 font-bold">&quot;Install app&quot;</span> वा{' '}
                        <span className="text-brand-600 dark:text-brand-400 font-bold">&quot;Add to Home screen&quot; (गृहपृष्ठमा थप्नुहोस्)</span> विकल्पमा ट्याप गर्नुहोस्।
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-bold text-xs flex items-center justify-center shrink-0">
                      ३
                    </span>
                    <div className="text-xs sm:text-sm">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        <span className="text-emerald-600 font-bold">&quot;Install&quot;</span> थिच्नुहोस्।
                      </p>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        अब यो प्ले स्टोरबाट डाउनलोड गरेजस्तै तपाईंको मोबाइल स्क्रिनमा रातो रक्त-बुँद चिन्हसहित छुट्टै एपको रूपमा बस्नेछ!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* IPHONE TAB */}
          {activeTab === 'ios' && (
            <div className="space-y-4">
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Apple className="w-4 h-4 text-slate-800 dark:text-slate-200" />
                  आइफोन (iPhone / Safari) मा इन्स्टल गर्ने ३ सजिलो चरण:
                </h3>

                <div className="space-y-2.5">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-bold text-xs flex items-center justify-center shrink-0">
                      १
                    </span>
                    <div className="text-xs sm:text-sm">
                      <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 flex-wrap">
                        यो पेजलाई <span className="font-bold text-brand-600 dark:text-brand-400">Safari (सफारी)</span> मा खोल्नुहोस् र तल्लो बारको{' '}
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-bold text-xs text-blue-600">
                          <Share2 className="w-3.5 h-3.5" /> Share
                        </span>{' '}
                        (बाण भएको चिन्ह) थिच्नुहोस्।
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-bold text-xs flex items-center justify-center shrink-0">
                      २
                    </span>
                    <div className="text-xs sm:text-sm">
                      <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 flex-wrap">
                        मेनुलाई अलिकति तल सारेर{' '}
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-bold text-xs text-slate-900 dark:text-white">
                          <PlusSquare className="w-3.5 h-3.5" /> Add to Home Screen
                        </span>{' '}
                        (गृहपृष्ठमा थप्नुहोस्) मा ट्याप गर्नुहोस्।
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-bold text-xs flex items-center justify-center shrink-0">
                      ३
                    </span>
                    <div className="text-xs sm:text-sm">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        माथिल्लो दायाँ भागमा रहेको <span className="text-blue-600 font-bold">&quot;Add&quot;</span> बटन थिच्नुहोस्।
                      </p>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        तुरुन्तै तपाईंको iPhone को होमस्क्रिनमा एप बस्नेछ र ब्राउजर बार बिना फुल-स्क्रिनमा चल्नेछ!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STORE EXPLANATION TAB */}
          {activeTab === 'store' && (
            <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-2.5">
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-900 dark:text-amber-200">
                    प्ले स्टोर र एपल स्टोरको यथार्थ तथा प्राविधिक जानकारी:
                  </h4>
                  <p className="mt-1 text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                    Google Play Store मा एप राख्न Google ले आधिकारिक <span className="font-bold">Google Play Console Account ($25 एकमुष्ट)</span> र Apple App Store मा <span className="font-bold">Apple Developer Account ($99 प्रति वर्ष)</span> तथा नागरिकता/पासपोर्ट र संस्थाको प्रमाणिकरण अनिवार्य मागेको हुन्छ। यो कानुनी नियमका कारण कुनै पनि AI ले आफ्नै हातले भुक्तानी गरेर तपाईंको खाता खोलीदिन मिल्दैन।
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-brand-600" />
                  तर हाम्रो यो प्रविधिको ३ वटा मुख्य फाइदाहरू:
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>कुनै शुल्क नलाग्ने:</strong> प्ले स्टोर नराखीकनै जोकोही बिरामी वा डाक्टरले मोबाइलमा निःशुल्क १ सेकेन्डमा इन्स्टल गर्न सक्छन्।</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>पुनः सम्पादनमा कुनै समस्या नहुने:</strong> तपाईंले कोडमा जे परिवर्तन गर्नुहुन्छ, सबै मोबाइलमा तुरुन्तै स्वतः अपडेट हुन्छ – कुनै नयाँ APK अपलोड गरिरहनै पर्दैन!</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>स्टोरमा राख्ने फाइल १००% तयार:</strong> यदि भविष्यमा प्ले स्टोरमै राख्ने मन भएमा पनि हामीले <code>npm run mobile:android</code> मार्फत Play Store Bundle (.aab) र APK निर्माण हुने गरी मिलाइदिएका छौँ।</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Footer Highlights */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              हेमोफिलिया फ्याक्टर तथा बिरामी व्यवस्थापन
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold transition-colors"
            >
              बन्द गर्नुहोस्
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
