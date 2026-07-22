import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Smartphone, CheckCircle2, X, Share, Sparkles, Shield, Chrome, Compass, Info, HelpCircle } from 'lucide-react';

interface PwaInstallAndSplashProps {
  churchName?: string;
  logoUrl?: string;
}

export default function PwaInstallAndSplash({ churchName = 'SYSTEM MANAJEMEN CHURCH', logoUrl }: PwaInstallAndSplashProps) {
  // Splash Screen States
  const [showSplash, setShowSplash] = useState(true);
  const [splashProgress, setSplashProgress] = useState(10);

  // PWA Install States
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
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
    browserName: 'Chrome',
  });

  useEffect(() => {
    // Check if already running in PWA standalone mode
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);

    // Detect Device & Browser types
    const ua = navigator.userAgent.toLowerCase();
    const isAndroid = /android/i.test(ua);
    const isIos = /ipad|iphone|ipod/i.test(ua) && !(window as any).MSStream;
    const isMobile = isAndroid || isIos || /mobile|tablet/i.test(ua);

    let browserName = 'Browser';
    if (/samsungbrowser/i.test(ua)) browserName = 'Samsung Internet';
    else if (/miuibrowser/i.test(ua)) browserName = 'Xiaomi Browser';
    else if (/ucbrowser/i.test(ua)) browserName = 'UC Browser';
    else if (/opera|opr/i.test(ua)) browserName = 'Opera';
    else if (/firefox|fxios/i.test(ua)) browserName = 'Firefox';
    else if (/crios|chrome/i.test(ua)) browserName = 'Chrome';
    else if (/safari/i.test(ua)) browserName = 'Safari';

    setDeviceInfo({ isAndroid, isIos, isMobile, browserName });
    setActiveGuideTab(isIos ? 'ios' : 'android');

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
      const lastDismiss = localStorage.getItem('pwa_install_dismissed');
      if (!lastDismiss || Date.now() - Number(lastDismiss) > 24 * 60 * 60 * 1000) {
        setShowInstallBanner(true);
      }
    };

    // Listen for PWA Install Prompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      checkAndShowBanner();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Always ensure banner shows up on all non-standalone mobile devices after splash screen
    if (isMobile && !isStandaloneMode) {
      setTimeout(checkAndShowBanner, 2000);
    }

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
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        setIsInstalling(true);
        deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the PWA install prompt');
          setShowInstallBanner(false);
          setShowInstallModal(false);
          setShowGuideModal(false);
        } else {
          console.log('User dismissed the PWA install prompt');
        }
      } catch (err) {
        console.error('Failed to trigger native install prompt:', err);
        // Fallback to guide
        if (deviceInfo.isIos) setActiveGuideTab('ios');
        else setActiveGuideTab('android');
        setShowGuideModal(true);
      } finally {
        setIsInstalling(false);
        setDeferredPrompt(null);
      }
    } else {
      // Native deferred prompt is not available on this device/browser (e.g. Samsung/Xiaomi/UC/iOS/InApp)
      // Open the appropriate installation guide modal based on OS
      if (deviceInfo.isIos) {
        setActiveGuideTab('ios');
      } else {
        setActiveGuideTab('android');
      }
      setShowInstallModal(false);
      setShowGuideModal(true);
    }
  };

  const handleDismissBanner = () => {
    setShowInstallBanner(false);
    localStorage.setItem('pwa_install_dismissed', String(Date.now()));
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
                      <span className="text-4xl sm:text-5xl">⛪</span>
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

      {/* 2. FLOATING PWA INSTALL PROMPT BANNER (FOR ALL MOBILE / ANDROID / IOS) */}
      <AnimatePresence>
        {showInstallBanner && !isStandalone && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-16 sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-[80] bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-3xl border border-slate-700/80 shadow-2xl space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 flex-shrink-0 shadow-lg">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-xl">
                    📱
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-extrabold text-xs text-white">Instal Aplikasi Ke HP Anda</h4>
                    <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full font-bold uppercase border border-amber-500/30">
                      PWA Native
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium leading-tight mt-0.5">
                    Gunakan tanpa lewat Play Store. Tampilan fullscreen tanpa space bar browser & mendukung offline!
                  </p>
                </div>
              </div>
              <button
                onClick={handleDismissBanner}
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-full transition-colors cursor-pointer"
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

      {/* 3. PWA INSTALLATION DETAIL MODAL */}
      <AnimatePresence>
        {showInstallModal && (
          <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
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
                <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl text-2xl">
                  📲
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-100">Instal Aplikasi CMS Gereja</h3>
                  <p className="text-xs text-slate-400">Aplikasi Web Resmi (PWA Standalone)</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex items-start gap-2.5 p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-100 block font-bold">Tanpa Harus Lewat Play Store</strong>
                    <span className="text-slate-400 text-[11px]">Dapat langsung terpasang ke HP Android / iPhone Anda dalam hitungan detik.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-100 block font-bold">Tampilan Fullscreen Profesional</strong>
                    <span className="text-slate-400 text-[11px]">Bebas dari space bar atau URL browser, berjalan persis seperti aplikasi bawaan HP.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-100 block font-bold">Mendukung Offline & Cepat</strong>
                    <span className="text-slate-400 text-[11px]">Dapat dibuka dengan cepat dan data tetap tersimpan rapi di ponsel.</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={handleInstallClick}
                  disabled={isInstalling}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>{isInstalling ? 'Proses Memasang...' : 'Pasang Sekarang Ke HP'}</span>
                </button>

                <button
                  onClick={() => {
                    setShowInstallModal(false);
                    if (deviceInfo.isIos) setActiveGuideTab('ios');
                    else setActiveGuideTab('android');
                    setShowGuideModal(true);
                  }}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  <span>Panduan Cara Instal Manual</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. UNIFIED PWA INSTALLATION GUIDE MODAL (FOR ALL ANDROID PHONES & IOS) */}
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
                  <p className="text-xs text-slate-400">Instal Tanpa Lewat Play Store / App Store</p>
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
                  <span>Android (Semua HP)</span>
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

              {/* TAB CONTENT: ANDROID (CHROME, SAMSUNG, XIAOMI, OPPO, VIVO, UC) */}
              {activeGuideTab === 'android' && (
                <div className="space-y-4 animate-fade-in text-xs text-slate-300">
                  {/* Google Chrome / Brave / Edge */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                      <Chrome className="w-4 h-4" />
                      <span>Metode 1: Chrome / Edge / Brave (Android)</span>
                    </div>
                    <ol className="list-decimal pl-4 space-y-1.5 text-[11px] text-slate-300 font-medium leading-relaxed">
                      <li>Ketuk ikon <strong className="text-amber-400">tiga titik vertikal (⋮)</strong> di sudut kanan atas browser.</li>
                      <li>Pilih menu <strong className="text-amber-400">"Instal aplikasi"</strong> (atau *"Tambahkan ke Layar Utama"*).</li>
                      <li>Ketuk <strong className="text-amber-400">"Instal"</strong> pada jendela konfirmasi yang muncul di layar.</li>
                      <li>Aplikasi akan terpasang di HP Anda dengan ikon mandiri tanpa bar browser!</li>
                    </ol>
                  </div>

                  {/* Samsung / Xiaomi / Oppo / Vivo / UC */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                      <Smartphone className="w-4 h-4" />
                      <span>Metode 2: Samsung / Xiaomi / Vivo / Oppo / UC</span>
                    </div>
                    <ol className="list-decimal pl-4 space-y-1.5 text-[11px] text-slate-300 font-medium leading-relaxed">
                      <li>Ketuk menu browser <strong className="text-amber-400">(ikon ≡ atau ⋮)</strong> di kanan bawah / atas layar.</li>
                      <li>Pilih menu <strong className="text-amber-400">"Tambah Halaman ke"</strong> atau <strong className="text-amber-400">"Pasang Aplikasi PWA"</strong>.</li>
                      <li>Pilih <strong className="text-amber-400">"Layar Utama" (Home Screen)</strong> lalu ketuk <strong className="text-amber-400">"Tambah / Instal"</strong>.</li>
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
                {deferredPrompt && (
                  <button
                    onClick={() => {
                      setShowGuideModal(false);
                      handleInstallClick();
                    }}
                    className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Instal Otomatis</span>
                  </button>
                )}
                <button
                  onClick={() => setShowGuideModal(false)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-2xl transition-all cursor-pointer text-center"
                >
                  Selesai Membaca
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
