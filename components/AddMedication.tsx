
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Save, X, Sparkles, Loader2, Info, Volume2, Vibrate, BellRing } from 'lucide-react';
import { analyzeMedicationImage, getMedicationInfo } from '../services/geminiService';
import { Medication, MedicationUnit } from '../types';
import { COLORS, UNITS, SOUNDS, VIBRATIONS } from '../constants';

interface MedicationFormProps {
  initialData?: Medication;
  onSave: (med: Omit<Medication, 'id'> | Medication) => void;
  onCancel: () => void;
}

const MedicationForm: React.FC<MedicationFormProps> = ({ initialData, onSave, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [aiInfo, setAiInfo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    dosage: initialData?.dosage || '',
    frequency: initialData?.frequency || '1 raz dziennie',
    timesPerDay: initialData?.timesPerDay || ['08:00'],
    currentStock: initialData?.currentStock || 10,
    totalInPackage: initialData?.totalInPackage || 20,
    unit: (initialData?.unit as MedicationUnit) || 'tabletki' as MedicationUnit,
    color: initialData?.color || COLORS[0],
    notes: initialData?.notes || '',
    reminderSound: initialData?.reminderSound || 'default',
    vibrationPattern: initialData?.vibrationPattern || 'standard',
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const analysis = await analyzeMedicationImage(base64);
        
        setFormData(prev => ({
          ...prev,
          name: analysis.name || prev.name,
          dosage: analysis.dosage || prev.dosage,
          frequency: analysis.frequency || prev.frequency,
          totalInPackage: analysis.packageSize || prev.totalInPackage,
          currentStock: analysis.packageSize || prev.currentStock,
          unit: (analysis.unit?.toLowerCase() as MedicationUnit) || prev.unit,
        }));

        const info = await getMedicationInfo(analysis.name);
        setAiInfo(info || null);
      };
    } catch (err) {
      alert("Nie udało się przeanalizować zdjęcia. Spróbuj wpisać dane ręcznie.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (initialData) {
      onSave({ ...formData, id: initialData.id });
    } else {
      onSave(formData);
    }
  };

  const addTime = () => setFormData(p => ({ ...p, timesPerDay: [...p.timesPerDay, '09:00'] }));
  const removeTime = (idx: number) => setFormData(p => ({ 
    ...p, 
    timesPerDay: p.timesPerDay.filter((_, i) => i !== idx) 
  }));

  const isEditing = !!initialData;

  return (
    <div className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">{isEditing ? 'Edytuj Lek' : 'Nowy Lek'}</h2>
        <button onClick={onCancel} className="p-2 text-slate-400 hover:text-slate-600">
          <X size={24} />
        </button>
      </div>

      <div className="mb-8">
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          capture="environment"
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="w-full h-32 border-2 border-dashed border-blue-200 rounded-3xl flex flex-col items-center justify-center gap-2 bg-blue-50/30 text-blue-600 hover:bg-blue-50 transition-colors group"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={32} />
              <span className="font-medium">Analizowanie opakowania...</span>
            </>
          ) : (
            <>
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <Camera size={24} />
              </div>
              <span className="font-medium">{isEditing ? 'Przeskanuj ponownie AI' : 'Zeskanuj opakowanie AI'}</span>
              <p className="text-[10px] text-blue-400 uppercase font-bold flex items-center gap-1">
                <Sparkles size={10} /> Powered by Gemini
              </p>
            </>
          )}
        </button>
      </div>

      {aiInfo && (
        <div className="mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
          <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs mb-2 uppercase">
            <Info size={14} /> Informacje o leku (AI)
          </div>
          <div className="text-sm text-indigo-900 leading-relaxed whitespace-pre-line">
            {aiInfo}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <section className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2 px-1">Nazwa leku</label>
            <input 
              required
              type="text"
              placeholder="np. Ibuprofen"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2 px-1">Dawka</label>
              <input 
                required
                type="text"
                placeholder="np. 400mg"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.dosage}
                onChange={e => setFormData({ ...formData, dosage: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2 px-1">Jednostka</label>
              <select 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.unit}
                onChange={e => setFormData({ ...formData, unit: e.target.value as MedicationUnit })}
              >
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* Schedule */}
        <section className="bg-white border border-slate-100 p-4 rounded-3xl space-y-4">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase px-1">
            <BellRing size={14} /> Harmonogram
          </label>
          <div className="space-y-3">
            {formData.timesPerDay.map((time, idx) => (
              <div key={idx} className="flex gap-2">
                <input 
                  type="time"
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={time}
                  onChange={e => {
                    const newTimes = [...formData.timesPerDay];
                    newTimes[idx] = e.target.value;
                    setFormData({ ...formData, timesPerDay: newTimes });
                  }}
                />
                {formData.timesPerDay.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeTime(idx)}
                    className="p-3 text-rose-500 bg-rose-50 rounded-xl"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            ))}
            <button 
              type="button" 
              onClick={addTime}
              className="w-full py-2 border border-slate-200 text-slate-500 rounded-xl text-sm font-medium hover:bg-slate-50"
            >
              + Dodaj kolejną godzinę
            </button>
          </div>
        </section>

        {/* Custom Reminders */}
        <section className="bg-slate-50 p-5 rounded-3xl space-y-4 border border-slate-200/50">
          <h3 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-blue-500" /> Powiadomienia niestandardowe
          </h3>
          
          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase mb-2">
              <Volume2 size={14} /> Dźwięk przypomnienia
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SOUNDS.map(sound => (
                <button
                  key={sound.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, reminderSound: sound.id })}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                    formData.reminderSound === sound.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  {sound.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase mb-2">
              <Vibrate size={14} /> Wibracja
            </label>
            <div className="grid grid-cols-2 gap-2">
              {VIBRATIONS.map(vibration => (
                <button
                  key={vibration.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, vibrationPattern: vibration.id })}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                    formData.vibrationPattern === vibration.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  {vibration.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Inventory */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2 px-1">W opakowaniu</label>
            <input 
              type="number"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              value={formData.totalInPackage}
              onChange={e => setFormData({ ...formData, totalInPackage: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2 px-1">Obecny stan</label>
            <input 
              type="number"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              value={formData.currentStock}
              onChange={e => setFormData({ ...formData, currentStock: Number(e.target.value) })}
            />
          </div>
        </div>

        {/* Style */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-2 px-1">Kolor identyfikacyjny</label>
          <div className="flex flex-wrap gap-3">
            {COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setFormData({ ...formData, color: c })}
                className={`w-8 h-8 rounded-full ${c} ${formData.color === c ? 'ring-2 ring-offset-2 ring-slate-800' : ''}`}
              />
            ))}
          </div>
        </div>

        <button 
          type="submit"
          className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-100 active:scale-[0.98] transition-all"
        >
          <Save size={20} /> {isEditing ? 'Zapisz zmiany' : 'Dodaj lek'}
        </button>
      </form>
    </div>
  );
};

export default MedicationForm;
