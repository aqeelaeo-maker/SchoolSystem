import React, { useState } from 'react';
import { X, UserPlus, Loader2 } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useToast } from '../contexts/ToastContext';

interface FinanceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FinanceFormModal({ isOpen, onClose }: FinanceFormModalProps) {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'Income',
    category: 'Fee',
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await addDoc(collection(db, 'finance_records'), {
        ...formData,
        amount: Number(formData.amount),
        date: new Date().toISOString(),
        createdAt: serverTimestamp()
      });

      showToast('Record added successfully!', 'success');
      onClose();
      setFormData({ title: '', amount: '', type: 'Income', category: 'Fee' });
    } catch (error) {
      console.error("Error adding finance record:", error);
      showToast('Failed to add record.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-md rounded-2xl shadow-2xl flex flex-col border border-slate-700/50">
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <h2 className="text-xl font-bold font-heading text-white">Add Transaction</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <form id="finance-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Title / Description</label>
              <input required name="title" value={formData.title} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-amber-500 transition-all" placeholder="e.g., Term 1 Fee Collection" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Amount ($)</label>
              <input required type="number" name="amount" value={formData.amount} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-amber-500 transition-all" placeholder="5000" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">Type</label>
                <select name="type" value={formData.type} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-amber-500 transition-all">
                  <option value="Income">Income</option>
                  <option value="Expense">Expense</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">Category</label>
                <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-amber-500 transition-all">
                  <option value="Fee">Fee</option>
                  <option value="Salary">Salary</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Library">Library</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-slate-700/50 flex items-center justify-end space-x-4">
          <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-700/50 transition-colors text-sm font-medium">Cancel</button>
          <button type="submit" form="finance-form" disabled={isSubmitting} className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white transition-all text-sm font-medium flex items-center disabled:opacity-50">
            {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : `Add Record`}
          </button>
        </div>
      </div>
    </div>
  );
}
