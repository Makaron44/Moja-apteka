
export type MedicationUnit = 'tabletki' | 'kapsułki' | 'ml' | 'krople' | 'saszetki' | 'jednostki' | 'aplikacje' | 'łyżeczki';

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  timesPerDay: string[];
  currentStock: number;
  totalInPackage: number;
  unit: MedicationUnit;
  color: string;
  notes?: string;
  expiryDate?: string;
  reminderSound: string;
  vibrationPattern: string;
}

export interface MedicationLog {
  id: string;
  medicationId: string;
  plannedTime: string;
  takenAt: string | null;
  status: 'pending' | 'taken' | 'skipped';
  date: string;
}

export interface UserSettings {
  notificationsEnabled: boolean;
  reminderMinutesBefore: number;
}

export type ViewState = 'dashboard' | 'meds' | 'add' | 'edit' | 'inventory' | 'history' | 'settings';
