import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Smartphone, CheckCircle2, X, Sparkles, Chrome, Compass, Info, HelpCircle, ExternalLink, RefreshCw, Share2, Globe } from 'lucide-react';

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
  const [showManualGuide, setShowManualGuide] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [activeGuideTab, setActiveGuideTab] = useState<'android' | 'samsung' | 'xiaomi' | 'ios'>('android');
  const [isInstalling, setIsInstalling] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  // Device & Browser Detection State
  const [deviceInfo, setDeviceInfo] = useState({
    isAndroid: false,
    isIos: false,
    isMobile: false,
    isInAppBrowser: false,
    isInIframe: false,
    isXiaomi: false,
    isSamsung: false,
    isOppoVivo: false,
    browserName: 'Chrome',
  });

  useEffect(() => {
    // Check if running in PWA standalone mode
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');
    setIsStandalone(isStandaloneMode);

    // Detect Device, Browser, In-App Browser & iFrame state
    const ua = navigator.userAgent.toLowerCase();
    const isAndroid = /android/i.test(ua);
    const isIos = /ipad|iphone|ipod/i.test(ua) && !(window as any).MSStream;
    const isMobile = isAndroid || isIos || /mobile|tablet/i.test(ua);
    const isInAppBrowser = /fban|fbav|instagram|line|whatsapp|micromessenger|snapchat|tiktok|twitter/i.test(ua);
    const isInIframe = window.self !== window.top;

    const isXiaomi = /xiaomi|poco|redmi|miui|hyperos/i.test(ua);
    const isSamsung = /samsung|samsungbrowser/i.test(ua);
    const isOppoVivo = /oppo|vivo|realme/i.test(ua);

    let browserName = 'Chrome';
    if (/samsungbrowser/i.test(ua)) browserName = 'Samsung Internet';
    else if (/miuibrowser/i.test(ua)) browserName = 'Xiaomi Browser';
    else if (/ucbrowser/i.test(ua)) browserName = 'UC Browser';
    else if (/opera|opr/i.test(ua)) browserName = 'Opera';
    else if (/firefox|fxios/i.test(ua)) browserName = 'Firefox';
    else if (/crios|chrome/i.test(ua)) browserName = 'Chrome';
    else if (/safari/i.test(ua)) browserName = 'Safari';

    setDeviceInfo({ isAndroid, isIos, isMobile, isInAppBrowser, isInIframe, isXiaomi, isSamsung, isOppoVivo, browserName });
    
    if (isIos) setActiveGuideTab('ios');
    else if (isXiaomi) setActiveGuideTab('xiaomi');
    else if (isSamsung) setActiveGuideTab('samsung');
    else setActiveGuideTab('android');

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

    const handleAppInstalled = () => {
      console.log('[PWA] Application installed successfully!');
      setIsStandalone(true);
      setShowInstallBanner(false);
      setShowInstallModal(false);
      setShowGuideModal(false);
      setDeferredPrompt(null);
      (window as any).deferredPrompt = null;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

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
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('pointerdown', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
    };
  }, []);

  const handleInstallClick = async () => {
    // If running inside an iFrame (e.g. preview mode), launch in a new tab so browser PWA triggers work
    if (window.self !== window.top) {
      window.open(window.location.href, '_blank');
      return;
    }

    // Check if deferredPrompt is available directly or on window
    const promptEvent = deferredPrompt || (window as any).deferredPrompt;

    if (promptEvent && typeof promptEvent.prompt === 'function') {
      try {
        setIsInstalling(true);
        await promptEvent.prompt();
        const choiceResult = await promptEvent.userChoice;
        if (choiceResult && choiceResult.outcome === 'accepted') {
          console.log('[PWA] Native install prompt accepted');
          setIsStandalone(true);
          setShowInstallBanner(false);
          setShowInstallModal(false);
          setShowGuideModal(false);
          setShowManualGuide(false);
        } else {
          setShowInstallModal(true);
          setShowManualGuide(true);
        }
      } catch (err) {
        console.warn('[PWA] Native prompt trigger failed or consumed:', err);
        setShowInstallModal(true);
        setShowManualGuide(true);
      } finally {
        setIsInstalling(false);
        setDeferredPrompt(null);
        (window as any).deferredPrompt = null;
      }
    } else {
      // NEVER reload or redirect page! Always show direct install modal & top menu guide
      setShowInstallModal(true);
      setShowManualGuide(true);
    }
  };

  const handleOpenInChrome = () => {
    const currentUrl = window.location.href;
    if (deviceInfo.isAndroid && deviceInfo.isInAppBrowser) {
      // Intent URL ONLY if explicitly user-clicked from inside WhatsApp/Instagram webview to switch to Chrome
      const cleanUrl = currentUrl.replace(/^https?:\/\//, '');
      window.location.href = `intent://${cleanUrl}#Intent;scheme=https;package=com.android.chrome;end`;
    } else {
      // If already in standard browser, show the install modal & guide without reloading!
      setShowInstallModal(true);
      setShowManualGuide(true);
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

      {/* TOP MANUAL INSTALLATION DIRECTION ARROW BANNER */}
      <AnimatePresence>
        {showManualGuide && !isStandalone && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            className="fixed top-2 left-2 right-2 z-[999] bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 p-3 rounded-2xl shadow-2xl border-2 border-amber-300/80 flex items-center justify-between gap-3 font-bold text-xs"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-slate-950 text-amber-400 font-black text-sm flex items-center justify-center shrink-0 border border-amber-300/30">
                1
              </div>
              <div className="leading-tight truncate">
                <p className="font-extrabold text-slate-950 text-[12px] uppercase tracking-tight">
                  Pemasangan di {deviceInfo.browserName}:
                </p>
                <p className="text-[11px] text-slate-900 font-semibold truncate">
                  Ketuk menu <strong className="font-black text-slate-950">Tiga Titik (⋮) / Menu (≡)</strong> di HP → pilih <strong className="font-black text-slate-950">"Instal aplikasi"</strong>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Sparkles className="w-5 h-5 text-slate-950 animate-bounce" />
              <button
                onClick={() => setShowManualGuide(false)}
                className="p-1.5 bg-slate-950/20 hover:bg-slate-950/30 text-slate-950 rounded-full cursor-pointer transition-colors"
                title="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
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

              {/* If opened inside iframe / preview mode, show clear prompt to open in a new tab */}
              {deviceInfo.isInIframe && (
                <div className="p-3.5 bg-amber-500/20 border-2 border-amber-400 rounded-2xl space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-[11px] uppercase tracking-wide">
                    <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span>Aplikasi Dibuka di Dalam Frame Preview</span>
                  </div>
                  <p className="text-[11px] text-slate-200 leading-snug">
                    Browser HP (Chrome/Samsung) menyembunyikan tombol "Instal" jika dibuka dari dalam preview. Buka di Tab Baru agar tombol "Instal" otomatis muncul!
                  </p>
                  <button
                    onClick={() => window.open(window.location.href, '_blank')}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-md"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>🔗 BUKA DI TAB BARU BROWSER HP</span>
                  </button>
                </div>
              )}

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

              {/* Universal 3-Step Direct Installation Guide Box tailored for Samsung / Xiaomi / POCO / Vivo / Oppo / Chrome */}
              {(showManualGuide || !(deferredPrompt || (window as any).deferredPrompt)) && deviceInfo.isAndroid && !deviceInfo.isInAppBrowser && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-amber-500/15 border-2 border-amber-400/60 rounded-2xl p-3.5 space-y-2 text-xs relative"
                >
                  <div className="flex items-center justify-between font-black text-amber-300 text-[12px] uppercase tracking-wide">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                      Langkah Pasang di HP {deviceInfo.isSamsung ? 'Samsung' : deviceInfo.isXiaomi ? 'Xiaomi / POCO' : deviceInfo.browserName}:
                    </span>
                    <span className="text-[10px] text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-full font-mono">
                      BEBAS PLAYSTORE
                    </span>
                  </div>

                  {deviceInfo.isSamsung ? (
                    <ol className="list-decimal pl-4 space-y-1.5 text-[11px] text-slate-200 font-medium leading-snug">
                      <li>
                        Ketuk menu <strong className="text-amber-300 font-bold">Garis Tiga (≡)</strong> di kanan bawah layar Samsung Anda.
                      </li>
                      <li>
                        Ketuk ikon <strong className="text-amber-300 font-bold">+ Tambah Halaman Ke</strong> (Add page to).
                      </li>
                      <li>
                        Pilih <strong className="text-amber-300 font-bold">"Layar Utama"</strong> (Home screen) atau <strong className="text-amber-300 font-bold">"Aplikasi Web"</strong>.
                      </li>
                      <li>
                        Ketuk <strong className="text-amber-300 font-bold">"Instal / Tambah"</strong>.
                      </li>
                    </ol>
                  ) : deviceInfo.isXiaomi ? (
                    <div className="space-y-2">
                      <ol className="list-decimal pl-4 space-y-1.5 text-[11px] text-slate-200 font-medium leading-snug">
                        <li>
                          Ketuk menu <strong className="text-amber-300 font-bold">Tiga Titik (⋮)</strong> di sudut kanan atas.
                        </li>
                        <li>
                          Pilih <strong className="text-amber-300 font-bold">"Instal aplikasi"</strong> atau <strong className="text-amber-300 font-bold">"Tambahkan ke Layar Utama"</strong>.
                        </li>
                        <li>
                          Ketuk <strong className="text-amber-300 font-bold">"Instal"</strong>.
                        </li>
                      </ol>
                      <div className="p-2 bg-slate-950/80 rounded-xl text-[10px] text-amber-200 font-normal border border-amber-500/20">
                        💡 <strong>HP Xiaomi/POCO/Redmi:</strong> Jika popup di atas terhalang, buka <em>Pengaturan HP -&gt; Aplikasi -&gt; Chrome -&gt; Perizinan Lainnya -&gt; Izinkan 'Pintasan Layar Utama'</em>.
                      </div>
                    </div>
                  ) : (
                    <ol className="list-decimal pl-4 space-y-1.5 text-[11px] text-slate-200 font-medium leading-snug">
                      <li>
                        Ketuk menu <strong className="text-amber-300 font-bold">Tiga Titik (⋮)</strong> di kanan atas browser HP Anda.
                      </li>
                      <li>
                        Pilih menu <strong className="text-amber-300 font-bold">"Instal aplikasi"</strong> atau <strong className="text-amber-300 font-bold">"Tambahkan ke Layar Utama"</strong>.
                      </li>
                      <li>
                        Ketuk <strong className="text-amber-300 font-bold">"Instal"</strong> — Ikon aplikasi akan langsung muncul di Home Screen HP!
                      </li>
                    </ol>
                  )}
                </motion.div>
              )}

              <div className="pt-2 flex flex-col gap-2">
                {/* Main 1-Click Install Action Button */}
                <button
                  onClick={() => {
                    const promptEvent = deferredPrompt || (window as any).deferredPrompt;
                    if (promptEvent && typeof promptEvent.prompt === 'function') {
                      handleInstallClick();
                    } else if (deviceInfo.isInAppBrowser && deviceInfo.isAndroid) {
                      handleOpenInChrome();
                    } else {
                      // Keep modal open and highlight direct 3-step menu guide!
                      setShowManualGuide(true);
                    }
                  }}
                  disabled={isInstalling}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {isInstalling
                      ? 'Proses Memasang...'
                      : (deferredPrompt || (window as any).deferredPrompt)
                      ? '⚡ PASANG LANGSUNG KE HP SAYA'
                      : '📲 LIHAT LANGKAH PASANG BROWSER HP'}
                  </span>
                </button>

                {/* Share / Copy Link Button */}
                <button
                  onClick={async () => {
                    try {
                      if (navigator.share) {
                        await navigator.share({
                          title: 'CMS Gereja App',
                          text: 'Instal Aplikasi CMS Gereja langsung di HP Anda:',
                          url: window.location.href,
                        });
                      } else {
                        await navigator.clipboard.writeText(window.location.href);
                        alert('Link aplikasi berhasil disalin! Buka di browser HP Anda.');
                      }
                    } catch (err) {
                      console.log('Share canceled:', err);
                    }
                  }}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 border border-amber-500/30"
                >
                  <Share2 className="w-4 h-4 text-amber-400" />
                  <span>📋 Salin & Bagikan Link Aplikasi</span>
                </button>

                <button
                  onClick={() => {
                    setShowInstallModal(false);
                    if (deviceInfo.isIos) setActiveGuideTab('ios');
                    else setActiveGuideTab('android');
                    setShowGuideModal(true);
                  }}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 font-medium text-xs rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  <span>Petunjuk Gambar Semua Device (POCO/Samsung/Oppo/Vivo)</span>
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-[11px]">
                <button
                  onClick={() => setActiveGuideTab('android')}
                  className={`py-2 px-2 font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    activeGuideTab === 'android'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Chrome className="w-3.5 h-3.5" />
                  <span>Chrome / All</span>
                </button>
                <button
                  onClick={() => setActiveGuideTab('xiaomi')}
                  className={`py-2 px-2 font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    activeGuideTab === 'xiaomi'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>POCO / Xiaomi</span>
                </button>
                <button
                  onClick={() => setActiveGuideTab('samsung')}
                  className={`py-2 px-2 font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    activeGuideTab === 'samsung'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Samsung</span>
                </button>
                <button
                  onClick={() => setActiveGuideTab('ios')}
                  className={`py-2 px-2 font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    activeGuideTab === 'ios'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>iPhone / iOS</span>
                </button>
              </div>

              {/* TAB CONTENT: ANDROID (CHROME / INFINIX / VIVO / OPPO / REALME) */}
              {activeGuideTab === 'android' && (
                <div className="space-y-3 animate-fade-in text-xs text-slate-300">
                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                      <Chrome className="w-4 h-4" />
                      <span>Google Chrome / Infinix / Vivo / Oppo</span>
                    </div>
                    <ol className="list-decimal pl-4 space-y-1.5 text-[11px] text-slate-300 font-medium leading-relaxed">
                      <li>Ketuk ikon <strong className="text-amber-400">Tiga Titik (⋮)</strong> di sudut kanan atas Chrome.</li>
                      <li>Pilih menu <strong className="text-amber-400 font-bold">"Instal aplikasi"</strong> (atau *"Tambahkan ke Layar Utama"*).</li>
                      <li>Ketuk <strong className="text-amber-400 font-bold">"Instal"</strong> pada jendela konfirmasi.</li>
                      <li>Ikon aplikasi langsung muncul di Home Screen HP Anda!</li>
                    </ol>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: XIAOMI / POCO / MIUI */}
              {activeGuideTab === 'xiaomi' && (
                <div className="space-y-3 animate-fade-in text-xs text-slate-300">
                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                      <Smartphone className="w-4 h-4" />
                      <span>Xiaomi / POCO / Mi Browser / HyperOS</span>
                    </div>
                    <ol className="list-decimal pl-4 space-y-1.5 text-[11px] text-slate-300 font-medium leading-relaxed">
                      <li>Buka link di <strong className="text-amber-400">Chrome</strong> atau Mi Browser pada HP POCO/Xiaomi Anda.</li>
                      <li>Ketuk ikon <strong className="text-amber-400">Tiga Titik (⋮)</strong> di kanan atas.</li>
                      <li>Pilih menu <strong className="text-amber-400 font-bold">"Tambahkan ke Layar Utama"</strong> atau <strong className="text-amber-400 font-bold">"Instal aplikasi"</strong>.</li>
                      <li>Ketuk <strong className="text-amber-400 font-bold">"Tambah/Instal"</strong> — Aplikasi terpasang tanpa iklan & fullscreen!</li>
                    </ol>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: SAMSUNG INTERNET */}
              {activeGuideTab === 'samsung' && (
                <div className="space-y-3 animate-fade-in text-xs text-slate-300">
                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                      <Globe className="w-4 h-4" />
                      <span>Samsung Internet Browser</span>
                    </div>
                    <ol className="list-decimal pl-4 space-y-1.5 text-[11px] text-slate-300 font-medium leading-relaxed">
                      <li>Ketuk menu <strong className="text-amber-400">Garis Tiga (≡)</strong> di kanan bawah layar Samsung Anda.</li>
                      <li>Ketuk ikon <strong className="text-amber-400 font-bold">+ Tambah Halaman Ke</strong> (Add page to).</li>
                      <li>Pilih opsi <strong className="text-amber-400 font-bold">"Layar Depan"</strong> (Home screen) atau <strong className="text-amber-400 font-bold">"Aplikasi Web"</strong>.</li>
                      <li>Ketuk <strong className="text-amber-400 font-bold">"Instal"</strong> — Selesai!</li>
                    </ol>
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
