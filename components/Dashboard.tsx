
import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Clock, AlertCircle, Pill as PillIcon, Droplets, Syringe } from 'lucide-react';
import { Medication, MedicationLog } from '../types';

interface DashboardProps {
  meds: Medication[];
  logs: MedicationLog[];
  onTakeMed: (logId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ meds, logs, onTakeMed }) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = now.toISOString().split('T')[0];
  const currentTimeStr = now.toTimeString().slice(0, 5);

  const getUnitIcon = (unit: string) => {
    switch (unit) {
      case 'krople': return <Droplets size={18} />;
      case 'ml': return <Syringe size={18} />;
      default: return <PillIcon size={18} />;
    }
  };

  const todaysLogs = logs.filter(log => log.date === todayStr);
  const sortedLogs = [...todaysLogs].sort((a, b) => a.plannedTime.localeCompare(b.plannedTime));
  const pendingLogs = sortedLogs.filter(l => l.status === 'pending');
  const nextDose = pendingLogs.find(l => l.plannedTime >= currentTimeStr) || pendingLogs[0];
  const nextMed = nextDose ? meds.find(m => m.id === nextDose.medicationId) : null;

  const isLate = (plannedTime: string) => plannedTime < currentTimeStr;

  const getTimeOfDay = (time: string) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour >= 5 && hour < 12) return 'Rano';
    if (hour >= 12 && hour < 17) return 'Południe';
    if (hour >= 17 && hour < 21) return 'Wieczór';
    return 'Noc';
  };

  const groups = ['Rano', 'Południe', 'Wieczór', 'Noc'];

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-700">
      {nextMed && nextDose && (
        <div className={`rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden transition-all duration-500 ${isLate(nextDose.plannedTime) && nextDose.status === 'pending' ? 'bg-rose-600 scale-[1.02]' : 'bg-slate-900'}`}>
          <div className="absolute -right-6 -top-6 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-6">
              <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${isLate(nextDose.plannedTime) ? 'bg-white text-rose-600 border-white' : 'bg-blue-500/20 text-blue-300 border-blue-500/30'}`}>
                {isLate(nextDose.plannedTime) ? 'Dawka spóźniona!' : 'Najbliższa dawka'}
              </span>
              <div className="flex items-center gap-2 font-black text-xl">
                <Clock size={20} /> {nextDose.plannedTime}
              </div>
            </div>
            <h2 className="text-4xl font-black mb-2 tracking-tight">{nextMed.name}</h2>
            <p className="text-white/70 font-medium mb-8 flex items-center gap-2">
              {getUnitIcon(nextMed.unit)} {nextMed.dosage} • {nextMed.unit}
            </p>
            <button 
              onClick={() => onTakeMed(nextDose.id)}
              className="w-full py-5 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl hover:bg-blue-50 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <CheckCircle2 size={20} /> Przyjmij teraz
            </button>
          </div>
        </div>
      )}

      <div className="space-y-10">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xl font-black text-slate-800">Plan Dnia</h3>
          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase">
            {todaysLogs.filter(l => l.status === 'taken').length} / {todaysLogs.length} przyjęte
          </span>
        </div>

        {groups.map(groupName => {
          const groupLogs = sortedLogs.filter(l => getTimeOfDay(l.plannedTime) === groupName);
          if (groupLogs.length === 0) return null;

          return (
            <div key={groupName} className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] whitespace-nowrap">{groupName}</span>
                <div className="h-px bg-slate-100 w-full" />
              </div>
              <div className="space-y-3">
                {groupLogs.map(log => {
                  const med = meds.find(m => m.id === log.medicationId);
                  if (!med) return null;
                  const late = isLate(log.plannedTime) && log.status === 'pending';

                  return (
                    <div 
                      key={log.id}
                      className={`flex items-center gap-4 p-5 rounded-[2rem] border transition-all ${
                        log.status === 'taken' 
                          ? 'bg-emerald-50/30 border-emerald-100 opacity-60' 
                          : late 
                            ? 'bg-rose-50 border-rose-200 shadow-md' 
                            : 'bg-white border-slate-100 shadow-sm'
                      }`}
                    >
                      <div className={`w-14 h-14 ${med.color} rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-current/20`}>
                        <div className="text-center">
                          <p className="text-[8px] font-black uppercase leading-none mb-1 opacity-70">Godz.</p>
                          <p className="text-sm font-black leading-none">{log.plannedTime}</p>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-800 truncate">{med.name}</h4>
                          {late && <AlertCircle size={14} className="text-rose-500 animate-pulse" />}
                        </div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter">
                          {med.dosage} • {med.unit}
                        </p>
                      </div>
                      <button 
                        onClick={() => log.status === 'pending' && onTakeMed(log.id)}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                          log.status === 'taken' ? 'bg-emerald-500 text-white' : late ? 'bg-rose-500 text-white' : 'bg-slate-50 text-slate-300'
                        }`}
                      >
                        {log.status === 'taken' ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
