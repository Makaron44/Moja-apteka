import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import MedicationForm from './components/AddMedication';
import History from './components/History';
import Settings from './components/Settings';
import { ViewState, Medication, MedicationLog, UserSettings } from './types';
import { INITIAL_MEDS } from './constants';
import { exportAllMedicationsToCalendar } from './services/calendarService';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('dashboard');
  const [editingMedicationId, setEditingMedicationId] = useState<string | null>(null);

  const [meds, setMeds] = useState<Medication[]>(() => {
    const saved = localStorage.getItem('meds');
    return saved ? JSON.parse(saved) : INITIAL_MEDS;
  });

  const [logs, setLogs] = useState<MedicationLog[]>(() => {
    const saved = localStorage.getItem('logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('settings');
    return saved ? JSON.parse(saved) : { notificationsEnabled: false, reminderMinutesBefore: 0, darkMode: false };
  });

  useEffect(() => localStorage.setItem('meds', JSON.stringify(meds)), [meds]);
  useEffect(() => localStorage.setItem('logs', JSON.stringify(logs)), [logs]);
  useEffect(() => localStorage.setItem('settings', JSON.stringify(settings)), [settings]);

  // Dark mode effect
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setLogs(prev => {
      const existingLogsMap = new Set(prev.map(l => `${l.medicationId}-${l.plannedTime}-${l.date}`));
      const newLogs: MedicationLog[] = [];

      meds.forEach(med => {
        med.timesPerDay.forEach(time => {
          const key = `${med.id}-${time}-${today}`;
          if (!existingLogsMap.has(key)) {
            newLogs.push({
              id: crypto.randomUUID(),
              medicationId: med.id,
              plannedTime: time,
              takenAt: null,
              status: 'pending',
              date: today
            });
          }
        });
      });
      return newLogs.length > 0 ? [...prev, ...newLogs] : prev;
    });
  }, [meds]);

  const handleTakeMed = useCallback((logId: string) => {
    setLogs(prev => prev.map(log => {
      if (log.id === logId) {
        const med = meds.find(m => m.id === log.medicationId);
        if (med) {
          setMeds(mList => mList.map(m => m.id === med.id ? { ...m, currentStock: Math.max(0, m.currentStock - 1) } : m));
        }
        return { ...log, status: 'taken', takenAt: new Date().toISOString() };
      }
      return log;
    }));
  }, [meds]);

  const handleUpdateStock = (id: string, newStock: number) => {
    setMeds(prev => prev.map(m => m.id === id ? { ...m, currentStock: newStock } : m));
  };

  const handleAddMed = (newMed: Omit<Medication, 'id'>) => {
    const medWithId = { ...newMed, id: crypto.randomUUID() };
    setMeds(prev => [...prev, medWithId]);
    setView('dashboard');
  };

  const handleUpdateMed = (updatedMed: Medication) => {
    setMeds(prev => prev.map(m => m.id === updatedMed.id ? updatedMed : m));
    setEditingMedicationId(null);
    setView('meds');
  };

  const renderView = () => {
    switch (view) {
      case 'dashboard': return <Dashboard meds={meds} logs={logs} onTakeMed={handleTakeMed} />;
      case 'inventory': return <Inventory meds={meds} onUpdateStock={handleUpdateStock} />;
      case 'add': return <MedicationForm onSave={handleAddMed} onCancel={() => setView('dashboard')} />;
      case 'meds': return (
        <div className="p-6 space-y-4">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 font-black uppercase tracking-tight">Twoja Apteczka</h2>
          {meds.length === 0 && <p className="text-slate-400 dark:text-slate-500 text-center py-10">Brak dodanych leków.</p>}
          {meds.map(m => (
            <div key={m.id} onClick={() => { setEditingMedicationId(m.id); setView('edit'); }} className="bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-600 p-5 rounded-[2rem] flex items-center gap-4 shadow-sm cursor-pointer group hover:border-blue-200 dark:hover:border-blue-700 transition-all">
              <div className={`w-14 h-14 ${m.color} rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-current/10`}>
                <div className="font-bold text-[10px] text-center leading-tight uppercase">{m.dosage}</div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-800 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{m.name}</h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">{m.timesPerDay.join(' • ')}</p>
              </div>
            </div>
          ))}
        </div>
      );
      case 'edit':
        const medToEdit = meds.find(m => m.id === editingMedicationId);
        return medToEdit ? <MedicationForm initialData={medToEdit} onSave={(updated) => handleUpdateMed(updated as Medication)} onCancel={() => setView('meds')} /> : null;
      case 'history': return <History meds={meds} logs={logs} />;
      case 'settings': return <Settings settings={settings} onUpdateSettings={setSettings} meds={meds} onExportAllToCalendar={() => exportAllMedicationsToCalendar(meds)} />;
      default: return <Dashboard meds={meds} logs={logs} onTakeMed={handleTakeMed} />;
    }
  };

  return (
    <Layout activeView={view} onViewChange={setView}>
      {renderView()}
    </Layout>
  );
};

export default App;
