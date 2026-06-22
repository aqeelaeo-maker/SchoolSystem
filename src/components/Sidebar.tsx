import { useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';
import { NavLink } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Wallet, 
  Bus, 
  Home, 
  Settings,
  LogOut,
  Shield,
  FileSpreadsheet
} from 'lucide-react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs: (string | undefined | null | false)[]) => twMerge(clsx(inputs));

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/students', label: 'Students', icon: GraduationCap },
  { path: '/teachers', label: 'Teachers', icon: Users },
  { path: '/academics', label: 'Academics', icon: BookOpen },
  { path: '/results', label: 'Term Results', icon: FileSpreadsheet },
  { path: '/finance', label: 'Finance', icon: Wallet },
  { path: '/transport', label: 'Transport', icon: Bus },
  { path: '/hostel', label: 'Hostel', icon: Home },
];

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { showToast } = useToast();
  const [schoolSettings, setSchoolSettings] = useState({
    name: 'SmartSchool ERP',
    logoUrl: ''
  });

  useEffect(() => {
    try {
      const unsub = onSnapshot(doc(db, 'settings', 'general'), (docSnap) => {
        if (docSnap.exists()) {
          setSchoolSettings(prev => ({ ...prev, ...docSnap.data() }));
        }
      });
      return () => unsub();
    } catch (e) {
      console.error(e);
    }
  }, []);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-30 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Content */}
      <aside className={cn(
        "fixed md:static inset-y-0 left-0 w-64 flex-shrink-0 flex flex-col z-40 glass-panel border-r border-y-0 border-l-0 border-slate-700/50 transition-transform duration-300 ease-in-out md:translate-x-0 h-[100dvh]",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-700/50 overflow-hidden shrink-0">
          <NavLink to="/dashboard" onClick={onClose} className="flex flex-1 items-center hover:bg-slate-800/50 transition-colors p-1 -ml-1 rounded-lg">
            {schoolSettings.logoUrl ? (
              <img src={schoolSettings.logoUrl} alt="Logo" className="w-8 h-8 rounded-lg object-contain mr-3 bg-white" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center mr-3 shadow-lg shadow-blue-500/20 shrink-0">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
            )}
            <span className="font-heading font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 truncate">
              {schoolSettings.name || 'SmartSchool ERP'}
            </span>
          </NavLink>
          <button 
            className="md:hidden p-2 text-slate-400 hover:text-white"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1 custom-scrollbar">
        <div className="text-xs font-mono text-slate-500 mb-4 px-2 tracking-wider">MAIN MENU</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => cn(
                "flex items-center px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium",
                isActive 
                  ? "bg-blue-500/10 text-blue-400" 
                  : "text-slate-400 hover:bg-slate-700/30 hover:text-slate-200"
              )}
            >
              <Icon className={cn(
                "w-5 h-5 mr-3 transition-colors",
                "group-hover:text-blue-400"
              )} />
              {item.label}
            </NavLink>
          );
        })}
      </div>

      {/* User / Settings Footer */}
      <div className="p-4 border-t border-slate-700/50 space-y-2 shrink-0 pb-safe">
        <NavLink 
          to="/settings"
          onClick={onClose}
          className={({ isActive }) => cn(
             "flex items-center w-full px-4 py-2.5 rounded-xl transition-colors text-sm font-medium",
             isActive ? "bg-slate-700/50 text-white" : "text-slate-400 hover:bg-slate-700/30 hover:text-slate-200"
          )}
        >
          <Settings className="w-5 h-5 mr-3" />
          Settings
        </NavLink>
        <button 
          onClick={() => showToast('Logging out...', 'info')}
          className="flex items-center w-full px-4 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-sm font-medium"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </aside>
    </>
  );
}
