
import React from 'react';

export const COLORS = [
  'bg-blue-600', 'bg-emerald-600', 'bg-rose-600', 'bg-amber-600', 
  'bg-indigo-600', 'bg-violet-600', 'bg-cyan-600', 'bg-pink-600'
];

export const UNITS = ['tabletki', 'kapsułki', 'ml', 'krople', 'saszetki', 'jednostki', 'aplikacje', 'łyżeczki'] as const;

export const SOUNDS = [
  { id: 'default', label: 'Domyślny' },
  { id: 'chime', label: 'Dzwonek' },
  { id: 'soft', label: 'Delikatny' },
  { id: 'alert', label: 'Alarm' }
];

export const VIBRATIONS = [
  { id: 'none', label: 'Brak', pattern: [] },
  { id: 'standard', label: 'Standard', pattern: [200, 100, 200] },
  { id: 'long', label: 'Długi', pattern: [500, 200, 500] },
  { id: 'double', label: 'Podwójny', pattern: [100, 50, 100, 500, 100, 50, 100] }
];

export const INITIAL_MEDS = [
  {
    id: '1',
    name: 'Paracetamol',
    dosage: '500mg',
    frequency: '2 razy dziennie',
    timesPerDay: ['08:00', '20:00'],
    currentStock: 12,
    totalInPackage: 20,
    unit: 'tabletki',
    color: 'bg-blue-600',
    notes: 'Brać po jedzeniu',
    reminderSound: 'default',
    vibrationPattern: 'standard'
  }
];
