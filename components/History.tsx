
import React, { useState, useMemo } from 'react';
import { History as HistoryIcon, Filter, Calendar, Search } from 'lucide-react';
import { Medication, MedicationLog } from '../types';

interface HistoryProps {
  meds: Medication[];
  logs: MedicationLog[];
}

const History: React.FC<HistoryProps> = ({ meds, logs }) => {
  const [filterMedId, setFilterMedId] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const takenLogs = useMemo(() => {
    return logs.filter(l => l.status === 'taken');
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return takenLogs.filter(log => {
      const matchMed = filterMedId === 'all' || log.medicationId === filterMedId;
      
      const takenDate = new Date(log.takenAt!).toISOString().split('T')[0];
      const matchStart = !startDate || takenDate >= startDate;
      const matchEnd = !endDate || takenDate <= endDate;
      
      return matchMed && matchStart && matchEnd;
    }).sort((a, b) => b.takenAt!.localeCompare(a.takenAt!));
  }, [takenLogs, filterMedId, startDate, endDate]);

  return (
    <div className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Historia</h2>
        <div className="bg-emerald-50 text-emerald-600 text-xs font-bold px-3 py-1 rounded-full uppercase flex items-center gap-1">
          <HistoryIcon size={12} /> {filteredLogs.length} dawek
        </div>
      </div>

      {/* Statistics Card */}
      <div className="bg-slate-900 rounded-3xl p-5 text-white mb-8 shadow-lg shadow-slate-200">
        <div className="flex items-center gap-3 opacity-60 text-xs font-bold uppercase tracking-wider mb-2">
          <Search size={14} /> Podsumowanie okresu
        </div>
        <div className="flex justify-between items-end">
          <div>
            <h3 className="text-3xl font-bold">{filteredLogs.length}</h3>
            <p className="text-slate-400 text-xs">Przyjętych dawek łącznie</p>
          </div>
          <div className="text-right">
            <p className="text-emerald-400 font-bold text-lg">100%</p>
            <p className="text-slate-400 text-[10px] uppercase font-bold">Skuteczności</p>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white border border-slate-100 rounded-3xl p-4 mb-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-slate-400 mb-1">
          <Filter size={16} />
          <span className="text-xs font-bold uppercase">Filtry</span>
        </div>
        
        <div className="space-y-3">
          <select 
            className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
            value={filterMedId}
            onChange={(e) => setFilterMedId(e.target.value)}
          >
            <option value="all">Wszystkie leki</option>
            {meds.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="date"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="date"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <p className="text-sm">Brak wpisów dla wybranych kryteriów</p>
          </div>
        ) : (
          filteredLogs.map(log => {
            const med = meds.find(m => m.id === log.medicationId);
            return (
              <div key={log.id} className="flex items-center gap-4 p-4 bg-white border border-slate-50 rounded-2xl shadow-sm">
                <div className={`w-10 h-10 ${med?.color || 'bg-slate-200'} rounded-xl flex items-center justify-center text-white shrink-0`}>
                  <HistoryIcon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 truncate">{med?.name || 'Lek usunięty'}</p>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Calendar size={10} />
                    {new Date(log.takenAt!).toLocaleString('pl-PL', {
                      day: 'numeric',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] bg-slate-50 text-slate-500 px-2 py-1 rounded-md font-bold uppercase tracking-tighter">
                    Przyjęto
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default History;
