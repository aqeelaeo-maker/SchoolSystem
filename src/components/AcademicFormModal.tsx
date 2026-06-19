import React, { useState } from 'react';
import { X, UserPlus, Loader2 } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useToast } from '../contexts/ToastContext';

interface AcademicFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'Class' | 'Subject';
}

export default function AcademicFormModal({ isOpen, onClose, type }: AcademicFormModalProps) {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const collectionName = type === 'Class' ? 'classes' : 'subjects';
      await addDoc(collection(db, collectionName), {
        ...formData,
        status: 'Active',
        createdAt: serverTimestamp()
      });

      showToast(`${type} added successfully!`, 'success');
      onClose();
      setFormData({ name: '', description: '' });
    } catch (error) {
      console.error(`Error adding ${type}:`, error);
      showToast(`Failed to add ${type}.`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-md rounded-2xl shadow-2xl flex flex-col border border-slate-700/50">
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <h2 className="text-xl font-bold font-heading text-white">Add {type}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <form id="academic-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">{type} Name</label>
              <input required name="name" value={formData.name} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500 transition-all" placeholder={type === 'Class' ? 'e.g., Grade 10' : 'e.g., Physics'} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Description (Optional)</label>
              <input name="description" value={formData.description} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500 transition-all" placeholder="Enter details..." />
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-slate-700/50 flex items-center justify-end space-x-4">
          <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-700/50 transition-colors text-sm font-medium">Cancel</button>
          <button type="submit" form="academic-form" disabled={isSubmitting} className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all text-sm font-medium flex items-center disabled:opacity-50">
            {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : `Add ${type}`}
          </button>
        </div>
      </div>
    </div>
  );
}
