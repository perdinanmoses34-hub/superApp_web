import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Smartphone, CheckCircle2, X, Sparkles, Chrome, Compass, Info, HelpCircle, ExternalLink, RefreshCw } from 'lucide-react';

interface PwaInstallAndSplashProps {
  churchName?: string;
  logoUrl?: string;
}

export default function PwaInstallAndSplash({ churchName = 'SYSTEM MANAJEMEN CHURCH', logoUrl }: PwaInstallAndSplashProps) {
  // Splash Screen States
  const [showSplash, setShowSplash] = useState(true);
  const [splashProgress, setSplashProgress] = useState(10);

  // PWA Install States
  const [deferredPrompt, setDeferredPrompt] = useState<any>((window as any).deferredPrompt || null);
  const [showInstallBanner, setShowInstallBanner] = useState(true);
  const [isBannerMinimized, setIsBannerMinimized] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [activeGuideTab, setActiveGuideTab] = useState<'android' | 'ios'>('android');
  const [isInstalling, setIsInstalling] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  // Device & Browser Detection State
  const [deviceInfo, setDeviceInfo] = useState({
    isAndroid: false,
    isIos: false,
    isMobile: false,
    isInAppBrowser: false,
    browserName: 'Chrome',
  });

  useEffect(() => {
    // Check if already running in PWA standalone mode
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');
    setIsStandalone(isStandaloneMode);

    // Detect Device, Browser & In-App Browser types
    const ua = navigator.userAgent.toLowerCase();
    const isAndroid = /android/i.test(ua);
    const isIos = /ipad|iphone|ipod/i.test(ua) && !(window as any).MSStream;
    const isMobile = isAndroid || isIos || /mobile|tablet/i.test(ua);
    const isInAppBrowser = /fban|fbav|instagram|line|whatsapp|wv|micromessenger/i.test(ua);

    let browserName = 'Browser';
    if (/samsungbrowser/i.test(ua)) browserName = 'Samsung Internet';
    else if (/miuibrowser/i.test(ua)) browserName = 'Xiaomi Browser';
    else if (/ucbrowser/i.test(ua)) browserName = 'UC Browser';
    else if (/opera|opr/i.test(ua)) browserName = 'Opera';
    else if (/firefox|fxios/i.test(ua)) browserName = 'Firefox';
    else if (/crios|chrome/i.test(ua)) browserName = 'Chrome';
    else if (/safari/i.test(ua)) browserName = 'Safari';

    setDeviceInfo({ isAndroid, isIos, isMobile, isInAppBrowser, browserName });
    setActiveGuideTab(isIos ? 'ios' : 'android');

    // Always show banner for non-standalone mode
    if (!isStandaloneMode) {
      setShowInstallBanner(true);
    }

    // Animated Splash Progress Effect
    const interval = setInterval(() => {
      setSplashProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setShowSplash(false), 400); // smooth hide
          return 100;
        }
        return prev + Math.floor(Math.random() * 20) + 10;
      });
    }, 150);

    // Function to decide whether to show floating install banner
    const checkAndShowBanner = () => {
      if (isStandaloneMode) return;
      setShowInstallBanner(true);
    };

    // Global prompt capture handler for POCO / Xiaomi / Samsung / Infinix / All Androids
    (window as any).onPwaPromptCaptured = (e: any) => {
      console.log('[PWA Component] Prompt captured via global handler:', e);
      setDeferredPrompt(e);
      if (!isStandaloneMode) {
        setShowInstallBanner(true);
      }
    };

    // Listen for PWA Install Prompt event aggressively
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      (window as any).deferredPrompt = e;
      setDeferredPrompt(e);
      checkAndShowBanner();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Also check if prompt was captured globally
    if ((window as any).deferredPrompt) {
      setDeferredPrompt((window as any).deferredPrompt);
      checkAndShowBanner();
    }

    // Capture first touch / user interaction to capture delayed beforeinstallprompt on POCO/Xiaomi/MIUI
    const handleUserInteraction = () => {
      if ((window as any).deferredPrompt) {
        setDeferredPrompt((window as any).deferredPrompt);
      }
    };
    window.addEventListener('pointerdown', handleUserInteraction, { once: true });
    window.addEventListener('touchstart', handleUserInteraction, { once: true });

    // Register global window helper for manual triggers
    (window as any).triggerPwaInstall = () => {
      handleInstallClick();
    };
    (window as any).openPwaGuide = () => {
      setShowGuideModal(true);
    };

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('pointerdown', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
    };
  }, []);

  const handleInstallClick = async () => {
    // Check if deferredPrompt is available directly or on window
    const promptEvent = deferredPrompt || (window as any).deferredPrompt;

    if (promptEvent) {
      try {
        setIsInstalling(true);
        promptEvent.prompt();
        const choiceResult = await promptEvent.userChoice;
        if (choiceResult && choiceResult.outcome === 'accepted') {
          console.log('User accepted the PWA install prompt');
          setShowInstallBanner(false);
          setShowInstallModal(false);
          setShowGuideModal(false);
          (window as any).deferredPrompt = null;
          setDeferredPrompt(null);
        }
      } catch (err) {
        console.error('Failed to trigger native install prompt:', err);
        // Direct install modal
        setShowInstallModal(true);
      } finally {
        setIsInstalling(false);
      }
    } else {
      // If deferredPrompt is not yet available (e.g. POCO / Xiaomi / WebView)
      if (deviceInfo.isInAppBrowser && deviceInfo.isAndroid) {
        handleOpenInChrome();
      } else {
        setShowInstallModal(true);
      }
    }
  };

  const handleOpenInChrome = () => {
    const currentUrl = window.location.href;
    if (deviceInfo.isAndroid) {
      // Intent URL to open directly in Google Chrome on Android (POCO/Xiaomi/Samsung/Infinix)
      const cleanUrl = currentUrl.replace(/^https?:\/\//, '');
      window.location.href = `intent://${cleanUrl}#Intent;scheme=https;package=com.android.chrome;end`;
    } else {
      window.open(currentUrl, '_blank');
    }
  };

  const handleDismissBanner = () => {
    // Minimize to compact badge instead of destroying
    setIsBannerMinimized(true);
  };

  return (
    <>
      {/* 1. ANIMATED PROFESSIONAL LOADING SPLASH SCREEN */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="fixed inset-0 z-[99999] bg-[#0F172A] text-white flex flex-col items-center justify-between p-6 select-none overflow-hidden"
          >
            {/* Background Glow Effect */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-10 right-10 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

            <div />

            {/* Center Animated Logo & Branding */}
            <div className="flex flex-col items-center text-center space-y-6 relative z-10 max-w-sm px-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-300 p-1 shadow-2xl shadow-amber-500/30 flex items-center justify-center">
                  <div className="w-full h-full bg-[#0F172A] rounded-[22px] flex items-center justify-center p-3 overflow-hidden">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <img src="./icon.svg" alt="Logo Church" className="w-full h-full object-contain p-1" />
                    )}
                  </div>
                </div>
                {/* Ping aura */}
                <div className="absolute -inset-2 rounded-3xl bg-amber-400/20 animate-ping pointer-events-none -z-10" />
              </motion.div>

              <div className="space-y-1.5">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-amber-200 via-white to-amber-100 bg-clip-text text-transparent uppercase">
                  SYSTEM MANAGEMENT CHURCH (CMS)
                </h1>
                <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">
                  {churchName && churchName !== 'SYSTEM MANAGEMENT CHURCH (CMS)' ? churchName : 'Aplikasi Pelayanan & Manajemen Jemaat'}
                </p>
              </div>

              {/* Progress Bar with animated status */}
              <div className="w-full space-y-2 pt-4">
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60 shadow-inner">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"
                    style={{ width: `${splashProgress}%` }}
                    transition={{ ease: 'easeOut' }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400 animate-spin" />
                    Memuat Sistem & Data...
                  </span>
                  <span className="font-bold text-amber-400">{splashProgress}%</span>
                </div>
              </div>
            </div>

            {/* Footer Tagline */}
            <div className="text-center space-y-1 relative z-10">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                Sistem Gereja Digital PWA • Fullscreen Standalone
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. PERSISTENT TOP INSTALLATION HEADER BAR & FLOATING BANNER FOR ALL ANDROID DEVICES */}
      {!isStandalone && (
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 px-3 py-2 border-b border-amber-400/40 shadow-md flex items-center justify-between gap-2 z-[70] relative text-xs font-bold">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-slate-950 p-0.5 shrink-0 overflow-hidden border border-amber-300/40 flex items-center justify-center">
              <img src="./icon.svg" alt="Gereja Logo" className="w-full h-full object-contain" />
            </div>
            <div className="truncate">
              <span className="font-black text-slate-950 uppercase tracking-tight block sm:inline">
                Aplikasi CMS Gereja Android
              </span>
              <span className="hidden sm:inline text-[11px] text-slate-900 font-semibold ml-2">
                • Pasang langsung ke HP tanpa Play Store
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              disabled={isInstalling}
              className="px-3 py-1.5 bg-slate-950 hover:bg-slate-900 text-amber-400 hover:text-amber-300 font-black text-[11px] rounded-xl shadow transition-all flex items-center gap-1 cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isInstalling ? 'Memasang...' : '⚡ INSTAL HP'}</span>
            </button>
            <button
              onClick={() => setShowGuideModal(true)}
              className="p-1.5 bg-slate-900/10 hover:bg-slate-900/20 text-slate-950 rounded-lg text-xs transition-colors cursor-pointer"
              title="Bantuan Instalasi"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2A. MINIMIZED FLOATING BADGE (SO INSTALL METHOD IS NEVER LOST) */}
      {showInstallBanner && !isStandalone && isBannerMinimized && (
        <motion.button
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsBannerMinimized(false)}
          className="fixed bottom-20 right-4 z-[85] bg-slate-900/95 backdrop-blur-md text-amber-400 p-2.5 px-4 rounded-full border border-amber-500/40 shadow-2xl flex items-center gap-2 text-xs font-black cursor-pointer group active:scale-95"
        >
          <div className="w-6 h-6 rounded-lg bg-amber-500 p-0.5 shrink-0 overflow-hidden flex items-center justify-center">
            <img src="./icon.svg" alt="Church App" className="w-full h-full object-contain" />
          </div>
          <span className="text-white">📲 Instal Aplikasi HP</span>
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
        </motion.button>
      )}

      {/* 2B. FLOATING PWA INSTALL PROMPT BANNER (EXPANDED) */}
      <AnimatePresence>
        {showInstallBanner && !isStandalone && !isBannerMinimized && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-16 sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-[80] bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-3xl border border-slate-700/80 shadow-2xl space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 flex-shrink-0 shadow-lg">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center p-2 overflow-hidden">
                    <img src="./icon.svg" alt="Church App Icon" className="w-full h-full object-contain" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-extrabold text-xs text-white">Instal Aplikasi Ke HP Anda</h4>
                    <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full font-bold uppercase border border-amber-500/30">
                      PWA Android Native
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium leading-tight mt-0.5">
                    Sama seperti aplikasi Android bawaan! Tanpa Play Store, tampilan fullscreen & bebas space bar.
                  </p>
                </div>
              </div>
              <button
                onClick={handleDismissBanner}
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-full transition-colors cursor-pointer"
                title="Kecilkan"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleInstallClick}
                disabled={isInstalling}
                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>{isInstalling ? 'Memasang...' : '⚡ Instal Sekarang'}</span>
              </button>
              <button
                onClick={() => setShowInstallModal(true)}
                className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-2xl border border-slate-700 transition-all cursor-pointer flex items-center gap-1"
              >
                <Info className="w-3.5 h-3.5 text-slate-400" />
                <span>Info</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. DIRECT 1-CLICK PWA INSTALLATION CONFIRMATION MODAL (FOR ALL ANDROID / POCO / XIAOMI / INFINIX) */}
      <AnimatePresence>
        {showInstallModal && (
          <div className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 text-white rounded-3xl max-w-md w-full p-6 border border-slate-800 shadow-2xl space-y-5 relative overflow-hidden"
            >
              <button
                onClick={() => setShowInstallModal(false)}
                className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 p-2 text-amber-400 shrink-0 border border-amber-500/30 flex items-center justify-center">
                  <img src="./icon.svg" alt="Church Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-100">Instal Aplikasi Ke Layar Utama HP</h3>
                  <p className="text-xs text-amber-400 font-semibold">
                    {deviceInfo.isAndroid ? 'Android (POCO / Xiaomi / Infinix / All)' : 'Aplikasi Web Resmi'}
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex items-start gap-2.5 p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-100 block font-bold">Langsung Terpasang Seperti Aplikasi Android</strong>
                    <span className="text-slate-400 text-[11px]">Ikon aplikasi langsung muncul di layar utama (home screen) HP Anda.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-100 block font-bold">Layar Penuh (Fullscreen) & Bebas Space Bar</strong>
                    <span className="text-slate-400 text-[11px]">Tidak ada bar browser, berjalan bersih & cepat seperti aplikasi bawaan.</span>
                  </div>
                </div>
              </div>

              {/* If opened inside WhatsApp or In-App Browser on Android, offer 1-tap open in Chrome */}
              {deviceInfo.isInAppBrowser && deviceInfo.isAndroid && (
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-[11px]">
                    <Chrome className="w-4 h-4" />
                    <span>Dideteksi Dibuka dari WhatsApp / Aplikasi Lain</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    Untuk hasil instalasi 1-klik otomatis terbaik, buka link ini di Google Chrome.
                  </p>
                  <button
                    onClick={handleOpenInChrome}
                    className="w-full py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:bg-amber-400 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Buka & Instal Lewat Google Chrome</span>
                  </button>
                </div>
              )}

              <div className="pt-2 flex flex-col gap-2">
                {/* Main 1-Click Install Action Button */}
                <button
                  onClick={() => {
                    const promptEvent = deferredPrompt || (window as any).deferredPrompt;
                    if (promptEvent) {
                      promptEvent.prompt();
                      promptEvent.userChoice.then((result: any) => {
                        if (result.outcome === 'accepted') {
                          setShowInstallModal(false);
                          setShowInstallBanner(false);
                        }
                      });
                    } else {
                      // Trigger direct browser installation fallback
                      if (deviceInfo.isIos) {
                        setShowInstallModal(false);
                        setActiveGuideTab('ios');
                        setShowGuideModal(true);
                      } else {
                        // For Android (POCO/Xiaomi/Samsung/Infinix), attempt Chrome intent or guide
                        handleOpenInChrome();
                      }
                    }
                  }}
                  disabled={isInstalling}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>{isInstalling ? 'Proses Memasang...' : '⚡ PASANG LANGSUNG KE HP SAYA'}</span>
                </button>

                <button
                  onClick={() => {
                    setShowInstallModal(false);
                    if (deviceInfo.isIos) setActiveGuideTab('ios');
                    else setActiveGuideTab('android');
                    setShowGuideModal(true);
                  }}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  <span>Lihat Panduan Bantuan jika Tidak Terpasang Otomatis</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. OPTIONAL PWA INSTALLATION GUIDE MODAL (ONLY OPENED WHEN USER EXPLICITLY CLICKS "Panduan Bantuan") */}
      <AnimatePresence>
        {showGuideModal && (
          <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 text-white rounded-3xl max-w-md w-full p-6 border border-slate-800 shadow-2xl space-y-5 relative my-auto"
            >
              <button
                onClick={() => setShowGuideModal(false)}
                className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl text-2xl">
                  📱
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-100 uppercase tracking-wide">
                    PANDUAN INSTALASI HP
                  </h3>
                  <p className="text-xs text-slate-400">Instalasi Mudah Tanpa Play Store</p>
                </div>
              </div>

              {/* PLATFORM SELECTOR TABS */}
              <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
                <button
                  onClick={() => setActiveGuideTab('android')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeGuideTab === 'android'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Chrome className="w-4 h-4" />
                  <span>Android (POCO / Xiaomi / All)</span>
                </button>
                <button
                  onClick={() => setActiveGuideTab('ios')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeGuideTab === 'ios'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Compass className="w-4 h-4" />
                  <span>iPhone / iPad (iOS)</span>
                </button>
              </div>

              {/* TAB CONTENT: ANDROID (POCO, XIAOMI, CHROME, SAMSUNG, OPPO, VIVO, UC) */}
              {activeGuideTab === 'android' && (
                <div className="space-y-4 animate-fade-in text-xs text-slate-300">
                  {/* Direct Auto Install Button */}
                  <div className="bg-gradient-to-r from-amber-500/20 to-amber-500/10 border border-amber-500/30 p-3 rounded-2xl text-center space-y-2">
                    <p className="text-[11px] font-bold text-amber-300">
                      Rekomendasi: Pasang Langsung Otomatis
                    </p>
                    <button
                      onClick={() => {
                        setShowGuideModal(false);
                        const promptEvent = deferredPrompt || (window as any).deferredPrompt;
                        if (promptEvent) {
                          promptEvent.prompt();
                        } else {
                          handleOpenInChrome();
                        }
                      }}
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Download className="w-4 h-4" />
                      <span>⚡ Pasang Sekarang Ke HP</span>
                    </button>
                  </div>

                  {/* Google Chrome / Brave / Edge / POCO Chrome */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                      <Chrome className="w-4 h-4" />
                      <span>Chrome / Browser Bawaan (Android / POCO)</span>
                    </div>
                    <ol className="list-decimal pl-4 space-y-1.5 text-[11px] text-slate-300 font-medium leading-relaxed">
                      <li>Ketuk ikon <strong className="text-amber-400">tiga titik vertikal (⋮)</strong> di sudut kanan atas browser.</li>
                      <li>Pilih menu <strong className="text-amber-400">"Instal aplikasi"</strong> (atau *"Tambahkan ke Layar Utama"*).</li>
                      <li>Ketuk <strong className="text-amber-400">"Instal"</strong> pada jendela konfirmasi yang muncul di layar.</li>
                      <li>Aplikasi akan terpasang di HP Anda dengan ikon mandiri tanpa bar browser!</li>
                    </ol>
                  </div>

                  {/* WhatsApp / In-App Browser Warning */}
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 flex gap-2.5">
                    <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-amber-200 leading-relaxed font-medium">
                      <strong className="text-amber-400 block uppercase tracking-wide text-[9px] mb-0.5">DIBUKA DARI WHATSAPP / INSTAGRAM?</strong>
                      Jika Anda membuka website dari dalam pesan WhatsApp atau IG, ketuk <strong>tiga titik (⋮)</strong> di kanan atas layar lalu pilih <strong>"Buka di Browser"</strong> / <strong>"Buka di Chrome"</strong> agar aplikasi terpasang sempurna.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: IOS (SAFARI) */}
              {activeGuideTab === 'ios' && (
                <div className="space-y-4 animate-fade-in text-xs text-slate-300">
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                      <Compass className="w-4 h-4" />
                      <span>Browser Safari (iPhone / iPad)</span>
                    </div>

                    <div className="space-y-2 text-[11px]">
                      <div className="flex items-center gap-2.5 p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                        <span className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">1</span>
                        <p>Pastikan Anda membuka website ini menggunakan browser bawaan <strong className="text-amber-400">Safari</strong>.</p>
                      </div>

                      <div className="flex items-center gap-2.5 p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                        <span className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">2</span>
                        <p>Ketuk tombol <strong className="text-amber-400">Share 📤</strong> (kotak dengan panah ke atas) di bagian bawah layar.</p>
                      </div>

                      <div className="flex items-center gap-2.5 p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                        <span className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">3</span>
                        <p>Gulir ke bawah lalu ketuk opsi <strong className="text-amber-400">'Tambahkan ke Layar Utama' (Add to Home Screen)</strong>.</p>
                      </div>

                      <div className="flex items-center gap-2.5 p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                        <span className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">4</span>
                        <p>Ketuk <strong className="text-amber-400">'Tambah' (Add)</strong> di kanan atas untuk menyelesaikan.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => setShowGuideModal(false)}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-2xl transition-all cursor-pointer text-center"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
