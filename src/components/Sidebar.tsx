import { useToast } from '../contexts/ToastContext';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Wallet, 
  Bus, 
  Home, 
  Settings,
  LogOut
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs: (string | undefined | null | false)[]) => twMerge(clsx(inputs));

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/students', label: 'Students', icon: GraduationCap },
  { path: '/teachers', label: 'Teachers', icon: Users },
  { path: '/academics', label: 'Academics', icon: BookOpen },
  { path: '/finance', label: 'Finance', icon: Wallet },
  { path: '/transport', label: 'Transport', icon: Bus },
  { path: '/hostel', label: 'Hostel', icon: Home },
];

export default function Sidebar() {
  const { showToast } = useToast();

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col z-20 glass-panel border-r border-y-0 border-l-0 border-slate-700/50">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-700/50">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center mr-3 shadow-lg shadow-blue-500/20">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <span className="font-heading font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
          SmartSchool ERP
        </span>
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
      <div className="p-4 border-t border-slate-700/50 space-y-2">
        <button 
          onClick={() => showToast('Opening system settings...', 'info')}
          className="flex items-center w-full px-4 py-2.5 rounded-xl text-slate-400 hover:bg-slate-700/30 hover:text-slate-200 transition-colors text-sm font-medium"
        >
          <Settings className="w-5 h-5 mr-3" />
          Settings
        </button>
        <button 
          onClick={() => showToast('Logging out...', 'info')}
          className="flex items-center w-full px-4 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-sm font-medium"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </aside>
  );
}
