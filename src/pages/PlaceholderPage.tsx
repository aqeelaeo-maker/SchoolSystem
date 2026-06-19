import { Construction } from 'lucide-react';

export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] glass-panel rounded-2xl animate-in fade-in zoom-in-95 duration-500">
      <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
        <Construction className="w-8 h-8 text-blue-400" />
      </div>
      <h2 className="text-2xl font-bold font-heading text-white">{title}</h2>
      <p className="text-slate-400 mt-2 text-center max-w-sm">
        This module is currently under active development. Please check back later.
      </p>
    </div>
  );
}
