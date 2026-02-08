import React, { useState, useMemo } from 'react';
import { History as HistoryIcon, Filter, Calendar, X, ChevronDown, Check } from 'lucide-react';
import { Medication, MedicationLog } from '../types';

interface HistoryProps {
  meds: Medication[];
  logs: MedicationLog[];
}

type QuickFilter = 'all' | 'today' | 'week' | 'month' | 'custom';

const History: React.FC<HistoryProps> = ({ meds, logs }) => {
  const [filterMedId, setFilterMedId] = useState<string>('all');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');
  const [showMedDropdown, setShowMedDropdown] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  const getDateRange = (): { start: string; end: string } => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    switch (quickFilter) {
      case 'today':
        return { start: today, end: today };
      case 'week':
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return { start: weekAgo.toISOString().split('T')[0], end: today };
      case 'month':
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return { start: monthAgo.toISOString().split('T')[0], end: today };
      case 'custom':
        return { start: customStartDate, end: customEndDate };
      default:
        return { start: '', end: '' };
    }
  };

  const { allLogs, takenLogs } = useMemo(() => {
    const { start, end } = getDateRange();

    const filtered = logs.filter(log => {
      const matchMed = filterMedId === 'all' || log.medicationId === filterMedId;
      const matchStart = !start || log.date >= start;
      const matchEnd = !end || log.date <= end;
      return matchMed && matchStart && matchEnd;
    });

    // Sort taken logs by takenAt time (descending)
    const taken = filtered
      .filter(l => l.status === 'taken')
      .sort((a, b) => (b.takenAt || '').localeCompare(a.takenAt || ''));

    return { allLogs: filtered, takenLogs: taken };
  }, [logs, filterMedId, quickFilter, customStartDate, customEndDate]);

  const efficiency = allLogs.length > 0 ? Math.round((takenLogs.length / allLogs.length) * 100) : 0;

  const selectedMed = meds.find(m => m.id === filterMedId);

  const quickFilters: { id: QuickFilter; label: string }[] = [
    { id: 'all', label: 'Wszystko' },
    { id: 'today', label: 'Dziś' },
    { id: 'week', label: '7 dni' },
    { id: 'month', label: '30 dni' },
    { id: 'custom', label: 'Zakres' },
  ];

  const clearFilters = () => {
    setFilterMedId('all');
    setQuickFilter('all');
    setCustomStartDate('');
    setCustomEndDate('');
  };

  const hasActiveFilters = filterMedId !== 'all' || quickFilter !== 'all';

  return (
    <div className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Historia</h2>
        <div className="bg-emerald-50 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 text-xs font-bold px-3 py-1 rounded-full uppercase flex items-center gap-1">
          <HistoryIcon size={12} /> {takenLogs.length} dawek
        </div>
      </div>

      {/* Quick Period Filters */}
      <div className="mb-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {quickFilters.map(filter => (
            <button
              key={filter.id}
              onClick={() => setQuickFilter(filter.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${quickFilter === filter.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/50'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Range */}
      {quickFilter === 'custom' && (
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-2xl border border-blue-100 dark:border-blue-800 animate-in fade-in slide-in-from-top-2">
          <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase mb-3">Wybierz zakres dat</p>
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold mb-1 block">Od</label>
              <input
                type="date"
                className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold mb-1 block">Do</label>
              <input
                type="date"
                className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Medication Filter Dropdown */}
      <div className="mb-6 relative">
        <button
          onClick={() => setShowMedDropdown(!showMedDropdown)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl text-sm text-slate-800 dark:text-white"
        >
          <div className="flex items-center gap-3">
            {selectedMed ? (
              <>
                <div className={`w-6 h-6 ${selectedMed.color} rounded-lg`} />
                <span className="font-medium">{selectedMed.name}</span>
              </>
            ) : (
              <>
                <Filter size={16} className="text-slate-400" />
                <span className="font-medium">Wszystkie leki</span>
              </>
            )}
          </div>
          <ChevronDown size={18} className={`text-slate-400 transition-transform ${showMedDropdown ? 'rotate-180' : ''}`} />
        </button>

        {showMedDropdown && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl shadow-xl z-10 overflow-hidden animate-in fade-in slide-in-from-top-2">
            <button
              onClick={() => { setFilterMedId('all'); setShowMedDropdown(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors ${filterMedId === 'all' ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}
            >
              <span className="font-medium text-slate-800 dark:text-white">Wszystkie leki</span>
              {filterMedId === 'all' && <Check size={16} className="text-blue-600" />}
            </button>
            {meds.map(m => (
              <button
                key={m.id}
                onClick={() => { setFilterMedId(m.id); setShowMedDropdown(false); }}
                className={`w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors ${filterMedId === m.id ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 ${m.color} rounded-lg`} />
                  <span className="font-medium text-slate-800 dark:text-white">{m.name}</span>
                </div>
                {filterMedId === m.id && <Check size={16} className="text-blue-600" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="mb-4 flex items-center gap-2 px-4 py-2 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase"
        >
          <X size={14} /> Wyczyść filtry
        </button>
      )}

      {/* Statistics Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-5 text-white mb-6 shadow-xl">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Przyjętych dawek</p>
            <h3 className="text-4xl font-black">{takenLogs.length} <span className="text-lg text-slate-500 font-medium">/ {allLogs.length}</span></h3>
          </div>
          <div className="text-right">
            <p className={`${efficiency >= 80 ? 'text-emerald-400' : efficiency >= 50 ? 'text-yellow-400' : 'text-rose-400'} font-black text-2xl`}>{efficiency}%</p>
            <p className="text-slate-400 text-[10px] uppercase font-bold">Skuteczności</p>
          </div>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-3">
        {takenLogs.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <HistoryIcon size={24} className="text-slate-400" />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Brak wpisów dla wybranych kryteriów</p>
          </div>
        ) : (
          takenLogs.map(log => {
            const med = meds.find(m => m.id === log.medicationId);
            return (
              <div key={log.id} className="flex items-center gap-4 p-4 bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-600 rounded-2xl shadow-sm">
                <div className={`w-12 h-12 ${med?.color || 'bg-slate-200 dark:bg-slate-600'} rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-current/20`}>
                  <Check size={20} strokeWidth={3} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 dark:text-white truncate">{med?.name || 'Lek usunięty'}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5">
                    <Calendar size={12} />
                    {new Date(log.takenAt!).toLocaleString('pl-PL', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 px-3 py-1.5 rounded-full text-[10px] font-black uppercase">
                  ✓ Przyjęto
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
