import React from 'react';
import { Package, Plus, Minus, AlertCircle, CalendarPlus } from 'lucide-react';
import { Medication } from '../types';
import { exportMedicationToCalendar } from '../services/calendarService';

interface InventoryProps {
  meds: Medication[];
  onUpdateStock: (id: string, newStock: number) => void;
}

const Inventory: React.FC<InventoryProps> = ({ meds, onUpdateStock }) => {
  const handleExportToCalendar = (med: Medication) => {
    exportMedicationToCalendar(med);
    alert(`✅ Przypomnienia dla "${med.name}" zostały wygenerowane!\n\nPo pobraniu otwórz plik i dodaj wydarzenia do Kalendarza.`);
  };

  return (
    <div className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Twoje Zapasy</h2>
        <span className="bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 text-xs font-bold px-3 py-1 rounded-full uppercase">
          {meds.length} pozycji
        </span>
      </div>

      <div className="space-y-4">
        {meds.map((med) => {
          const stockPercent = (med.currentStock / med.totalInPackage) * 100;
          const isLow = med.currentStock <= 5;

          return (
            <div key={med.id} className="bg-white dark:bg-slate-700 rounded-3xl p-5 border border-slate-100 dark:border-slate-600 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${med.color} rounded-xl flex items-center justify-center text-white`}>
                    <Package size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white">{med.name}</h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{med.dosage}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${isLow ? 'text-rose-500' : 'text-slate-800 dark:text-white'}`}>
                    {med.currentStock}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-tighter">
                    {med.unit} pozostało
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mb-1 font-bold uppercase">
                  <span>Stan opakowania</span>
                  <span>{Math.round(stockPercent)}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-600 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${isLow ? 'bg-rose-500' : 'bg-blue-500'}`}
                    style={{ width: `${Math.min(100, stockPercent)}%` }}
                  />
                </div>
              </div>

              {/* Calendar export button */}
              <button
                onClick={() => handleExportToCalendar(med)}
                className="w-full mb-3 py-2.5 flex items-center justify-center gap-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/50 active:scale-[0.98] transition-all text-sm font-bold"
              >
                <CalendarPlus size={16} />
                Dodaj do Kalendarza iOS
              </button>

              <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-50 dark:border-slate-600">
                <button
                  onClick={() => onUpdateStock(med.id, Math.max(0, med.currentStock - 1))}
                  className="flex-1 py-2 flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-500 active:scale-95 transition-all text-sm font-medium"
                >
                  <Minus size={16} /> Zużyj
                </button>
                <button
                  onClick={() => onUpdateStock(med.id, med.currentStock + 1)}
                  className="flex-1 py-2 flex items-center justify-center gap-2 bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/70 active:scale-95 transition-all text-sm font-medium"
                >
                  <Plus size={16} /> Dodaj
                </button>
              </div>

              {isLow && (
                <div className="mt-3 flex items-center gap-2 text-rose-500 text-[10px] font-bold uppercase animate-pulse">
                  <AlertCircle size={12} /> Czas dokupić lek!
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Inventory;
