import { useToast } from '../contexts/ToastContext';
import { Search, Bell, User, Menu } from 'lucide-react';

export default function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { showToast } = useToast();

  return (
    <header className="h-16 glass-panel border-b border-x-0 border-t-0 border-slate-700/50 flex items-center justify-between px-4 md:px-6 z-20 shrink-0 sticky top-0">
      
      <div className="flex items-center flex-1 max-w-md">
        <button 
          className="md:hidden p-2 mr-2 text-slate-400 hover:text-white"
          onClick={onMenuClick}
        >
          <Menu className="w-6 h-6" />
        </button>
        {/* Search Bar */}
        <form 
          className="relative group flex-1 hidden sm:block"
          onSubmit={(e) => {
            e.preventDefault();
            const val = (e.currentTarget.elements.namedItem('search') as HTMLInputElement).value;
            if (val.trim()) {
              showToast(`Searching for "${val}"...`, 'info');
            }
          }}
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
          <input 
            name="search"
            type="text" 
            placeholder="Search students, staff... (Press '/')"
            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-full pl-10 pr-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-sans"
          />
        </form>
        {/* Mobile Search Icon */}
        <button 
            className="sm:hidden p-2 text-slate-400 hover:text-white ml-2"
            onClick={() => showToast('Search focused', 'info')}
        >
          <Search className="w-5 h-5" />
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2 md:space-x-4">
        <button 
          onClick={() => showToast('No new notifications', 'info')}
          className="relative p-2 rounded-full hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
        </button>
        
        <div className="h-6 w-px bg-slate-700/50 mx-1 md:mx-2 hidden sm:block"></div>
        
        <div 
          onClick={() => showToast('Accessing user profile...', 'info')}
          className="flex items-center space-x-3 cursor-pointer group p-1 sm:pr-3 rounded-full hover:bg-slate-700/30 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden border border-slate-600 group-hover:border-blue-500/50 transition-colors shrink-0">
            <User className="w-4 h-4 text-slate-300" />
          </div>
          <div className="flex-col hidden sm:flex">
            <span className="text-sm font-medium text-slate-200 leading-tight">Super Admin</span>
            <span className="text-xs text-slate-500 leading-tight">System Owner</span>
          </div>
        </div>
      </div>

    </header>
  );
}
