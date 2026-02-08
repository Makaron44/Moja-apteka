import React, { useState } from 'react';
import { Bell, BellOff, Info, Smartphone, ShieldCheck, ExternalLink, Moon, Sun } from 'lucide-react';
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

  // Safe check for navigator
  const isIos = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent || '') && !(window as any).MSStream;
  const isPwa = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;

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

  return (
    <div className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Ustawienia</h2>

      {/* Dark Mode Toggle */}
      <div className="mb-8">
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

      {/* Device Info Card */}
      <div className="bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-600 rounded-3xl p-5 mb-8 shadow-sm">
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
              <p className="font-bold mb-1">Uwaga dla iPhone:</p>
              Powiadomienia na iOS wymagają dodania aplikacji do ekranu głównego. Użyj przycisku <strong>Udostępnij</strong> i wybierz <strong>"Dodaj do ekranu głównego"</strong>.
            </div>
          </div>
        )}
      </div>

      {/* Notifications Toggle */}
      <div className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-3 px-1">Powiadomienia push</label>
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
              Twoje dane są bezpieczne. Wszystkie przypomnienia są przetwarzane lokalnie na tym telefonie.
            </div>
          </div>
        </div>

        <a
          href="https://ai.google.dev/gemini-api/docs/billing"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase py-4"
        >
          <ExternalLink size={14} /> Dokumentacja Płatności API
        </a>
      </div>
    </div>
  );
};

export default Settings;
