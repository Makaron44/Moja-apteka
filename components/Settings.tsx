import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Info, Smartphone, ShieldCheck, Moon, Sun, RefreshCw, Download, CheckCircle, Key, Eye, EyeOff } from 'lucide-react';
import { UserSettings } from '../types';

interface SettingsProps {
  settings: UserSettings;
  onUpdateSettings: (settings: UserSettings) => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onUpdateSettings }) => {
  // Safe check for Notification API
  const getNotificationPermission = (): NotificationPermission => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  };

  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(getNotificationPermission());
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'checking' | 'upToDate' | 'available'>('idle');
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(settings.geminiApiKey || '');

  // Safe check for navigator
  const isIos = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent || '') && !(window as any).MSStream;
  const isPwa = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;

  // Listen for service worker updates
  useEffect(() => {
    const handleSwUpdate = (event: CustomEvent) => {
      setUpdateAvailable(true);
      setUpdateStatus('available');
      setSwRegistration(event.detail);
    };

    window.addEventListener('swUpdate', handleSwUpdate as EventListener);
    return () => window.removeEventListener('swUpdate', handleSwUpdate as EventListener);
  }, []);

  const requestPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert("Twoja przeglądarka nie obsługuje powiadomień.");
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      if (permission === 'granted') {
        onUpdateSettings({ ...settings, notificationsEnabled: true });
      }
    } catch (error) {
      alert("Nie udało się uzyskać uprawnień do powiadomień.");
    }
  };

  const toggleDarkMode = () => {
    onUpdateSettings({ ...settings, darkMode: !settings.darkMode });
  };

  const checkForUpdates = async () => {
    setUpdateStatus('checking');

    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.update();

          // Wait for update check to complete
          await new Promise(resolve => setTimeout(resolve, 2000));

          // If no update was found after waiting
          if (!updateAvailable) {
            setUpdateStatus('upToDate');
            // Reset to idle after showing success
            setTimeout(() => setUpdateStatus('idle'), 3000);
          }
        } else {
          // No service worker, show up to date
          setUpdateStatus('upToDate');
          setTimeout(() => setUpdateStatus('idle'), 3000);
        }
      } else {
        // Service workers not supported
        setUpdateStatus('upToDate');
        setTimeout(() => setUpdateStatus('idle'), 3000);
      }
    } catch (error) {
      console.error('Update check failed:', error);
      setUpdateStatus('upToDate');
      setTimeout(() => setUpdateStatus('idle'), 3000);
    }
  };

  const applyUpdate = () => {
    if (swRegistration && swRegistration.waiting) {
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    } else {
      // Force reload to get latest version
      window.location.reload();
    }
  };

  const appVersion = '1.0.1';

  const getUpdateButtonContent = () => {
    switch (updateStatus) {
      case 'checking':
        return {
          icon: <RefreshCw size={20} className="text-blue-600 dark:text-blue-400 animate-spin" />,
          title: 'Sprawdzam aktualizacje...',
          subtitle: 'Proszę czekać'
        };
      case 'upToDate':
        return {
          icon: <CheckCircle size={20} className="text-emerald-600 dark:text-emerald-400" />,
          title: 'Aplikacja jest aktualna!',
          subtitle: `Wersja ${appVersion}`
        };
      case 'available':
        return {
          icon: <Download size={20} className="text-emerald-600 dark:text-emerald-400" />,
          title: 'Dostępna aktualizacja!',
          subtitle: 'Kliknij aby zainstalować'
        };
      default:
        return {
          icon: <RefreshCw size={20} className="text-blue-600 dark:text-blue-400" />,
          title: 'Sprawdź aktualizacje',
          subtitle: `Wersja ${appVersion}`
        };
    }
  };

  const buttonContent = getUpdateButtonContent();

  return (
    <div className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Ustawienia</h2>

      {/* Update Available Banner */}
      {updateAvailable && (
        <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Download className="text-emerald-600 dark:text-emerald-400" size={20} />
              <div>
                <p className="font-bold text-emerald-800 dark:text-emerald-200">Dostępna aktualizacja!</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">Kliknij aby zainstalować</p>
              </div>
            </div>
            <button
              onClick={applyUpdate}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm active:scale-95 transition-transform"
            >
              Aktualizuj
            </button>
          </div>
        </div>
      )}

      {/* Dark Mode Toggle */}
      <div className="mb-6">
        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-3 px-1">Wygląd</label>
        <div className="bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-600 rounded-3xl p-2 shadow-sm">
          <button
            onClick={toggleDarkMode}
            className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${settings.darkMode
              ? 'bg-slate-800 text-white'
              : 'bg-slate-50 dark:bg-slate-600 text-slate-700 dark:text-slate-200'
              }`}
          >
            <div className="flex items-center gap-3">
              {settings.darkMode ? <Moon size={20} /> : <Sun size={20} />}
              <span className="font-bold">
                {settings.darkMode ? 'Tryb ciemny' : 'Tryb jasny'}
              </span>
            </div>
            <div className={`w-10 h-6 rounded-full relative transition-colors ${settings.darkMode ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-500'
              }`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.darkMode ? 'left-5' : 'left-1'
                }`} />
            </div>
          </button>
        </div>
      </div>

      {/* Check for Updates Button */}
      <div className="mb-6">
        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-3 px-1">Aktualizacje</label>
        <button
          onClick={updateStatus === 'available' ? applyUpdate : checkForUpdates}
          disabled={updateStatus === 'checking'}
          className={`w-full flex items-center justify-between p-4 border rounded-2xl shadow-sm transition-all active:scale-[0.98] ${updateStatus === 'upToDate'
            ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800'
            : updateStatus === 'available'
              ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800'
              : 'bg-white dark:bg-slate-700 border-slate-100 dark:border-slate-600'
            }`}
        >
          <div className="flex items-center gap-3">
            {buttonContent.icon}
            <div className="text-left">
              <span className={`font-bold block ${updateStatus === 'upToDate' || updateStatus === 'available'
                ? 'text-emerald-800 dark:text-emerald-200'
                : 'text-slate-800 dark:text-white'
                }`}>
                {buttonContent.title}
              </span>
              <span className={`text-[10px] uppercase ${updateStatus === 'upToDate' || updateStatus === 'available'
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-400 dark:text-slate-500'
                }`}>
                {buttonContent.subtitle}
              </span>
            </div>
          </div>
          {updateStatus === 'available' && (
            <span className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold">
              Instaluj
            </span>
          )}
        </button>
      </div>

      {/* Gemini API Key Section */}
      <div className="mb-6">
        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-3 px-1">
          Gemini API (rozpoznawanie leków)
        </label>
        <div className="bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-600 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <Key size={18} className="text-purple-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Klucz API</span>
            {settings.geminiApiKey && (
              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                Skonfigurowany
              </span>
            )}
          </div>
          <div className="relative mb-3">
            <input
              type={showApiKey ? 'text' : 'password'}
              placeholder="Wklej swój klucz API Gemini..."
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              className="w-full px-4 py-3 pr-12 bg-slate-50 dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-xl text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <button
            onClick={() => {
              onUpdateSettings({ ...settings, geminiApiKey: apiKeyInput });
              alert('Klucz API został zapisany! ✓');
            }}
            disabled={!apiKeyInput || apiKeyInput === settings.geminiApiKey}
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white rounded-xl font-bold text-sm transition-colors"
          >
            Zapisz klucz
          </button>
          <p className="mt-3 text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed">
            Twój klucz jest przechowywany tylko na tym urządzeniu. Uzyskaj go na{' '}
            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-purple-500 underline">
              aistudio.google.com
            </a>
          </p>
        </div>
      </div>

      {/* Device Info Card */}
      <div className="bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-600 rounded-3xl p-5 mb-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-slate-100 dark:bg-slate-600 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300">
            <Smartphone size={20} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Twoje urządzenie</p>
            <h3 className="font-bold text-slate-800 dark:text-white">{isIos ? 'Apple iPhone / iOS' : 'Android / Inne'}</h3>
          </div>
        </div>

        {isIos && !isPwa && (
          <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800 rounded-2xl p-4 flex gap-3">
            <Info className="text-amber-500 shrink-0" size={18} />
            <div className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
              <p className="font-bold mb-1">Dodaj ikonę na pulpit:</p>
              Kliknij <strong>Udostępnij</strong> (□↑) → <strong>"Dodaj do ekranu głównego"</strong>
            </div>
          </div>
        )}
      </div>

      {/* Notifications Toggle */}
      <div className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-3 px-1">Powiadomienia</label>
          <div className="bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-600 rounded-3xl p-2 shadow-sm">
            <button
              onClick={requestPermission}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${settings.notificationsEnabled && permissionStatus === 'granted'
                ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                : 'bg-slate-50 dark:bg-slate-600 text-slate-500 dark:text-slate-300'
                }`}
            >
              <div className="flex items-center gap-3">
                {settings.notificationsEnabled && permissionStatus === 'granted' ? <Bell size={20} /> : <BellOff size={20} />}
                <span className="font-bold">
                  {permissionStatus === 'granted' ? 'Aktywne' : permissionStatus === 'denied' ? 'Zablokowane' : 'Kliknij, aby włączyć'}
                </span>
              </div>
              <div className={`w-10 h-6 rounded-full relative transition-colors ${settings.notificationsEnabled && permissionStatus === 'granted' ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-500'
                }`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.notificationsEnabled && permissionStatus === 'granted' ? 'left-5' : 'left-1'
                  }`} />
              </div>
            </button>
          </div>
        </div>

        {settings.notificationsEnabled && (
          <div className="animate-in fade-in slide-in-from-top-2">
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-3 px-1">Przypomnienie przed czasem</label>
            <div className="grid grid-cols-3 gap-3">
              {[0, 5, 10, 15, 30].map((mins) => (
                <button
                  key={mins}
                  onClick={() => onUpdateSettings({ ...settings, reminderMinutesBefore: mins })}
                  className={`py-3 rounded-2xl text-sm font-bold transition-all border ${settings.reminderMinutesBefore === mins
                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100 dark:shadow-blue-900/50'
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-100 dark:border-slate-600'
                    }`}
                >
                  {mins === 0 ? 'O czasie' : `${mins} min`}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="pt-6 border-t border-slate-100 dark:border-slate-600">
          <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl">
            <ShieldCheck className="text-slate-400 dark:text-slate-500 shrink-0" size={18} />
            <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Twoje dane są bezpieczne i przechowywane lokalnie na urządzeniu.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
