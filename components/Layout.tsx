
import React from 'react';
import { Home, Pill, PlusSquare, Package, History, Settings as SettingsIcon } from 'lucide-react';
import { ViewState } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeView: ViewState;
  onViewChange: (view: ViewState) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, onViewChange }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dziś', icon: Home },
    { id: 'meds', label: 'Leki', icon: Pill },
    { id: 'add', label: 'Dodaj', icon: PlusSquare, primary: true },
    { id: 'inventory', label: 'Zapas', icon: Package },
    { id: 'history', label: 'Historia', icon: History },
  ];

  return (
    <div className="min-h-screen pb-24 flex flex-col max-w-md mx-auto bg-white shadow-xl relative">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex justify-between items-center">
        <h1 
          className="text-xl font-bold text-slate-800 flex items-center gap-2 cursor-pointer"
          onClick={() => onViewChange('dashboard')}
        >
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Pill className="text-white w-5 h-5" />
          </div>
          Moje Leki
        </h1>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onViewChange('settings')}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              activeView === 'settings' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'
            }`}
          >
            <SettingsIcon size={20} />
          </button>
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
            <img src="https://picsum.photos/seed/user/100/100" alt="Avatar" className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-100 px-2 py-3 flex justify-around items-center z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          if (item.primary) {
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id as ViewState)}
                className="relative -top-6 bg-blue-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 active:scale-95 transition-transform"
              >
                <Icon size={28} />
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id as ViewState)}
              className={`flex flex-col items-center gap-1 transition-colors ${
                isActive ? 'text-blue-600' : 'text-slate-400'
              }`}
            >
              <Icon size={24} />
              <span className="text-[10px] font-medium uppercase tracking-wider">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Layout;
