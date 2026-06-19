import React, { useState, useEffect } from 'react';
import { X, FileText, Loader2, Download } from 'lucide-react';
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useToast } from '../contexts/ToastContext';

interface FeeVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FeeVoucherModal({ isOpen, onClose }: FeeVoucherModalProps) {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    studentId: '',
    title: 'Term 1 Tuition Fee',
    amount: '',
    dueDate: '',
  });

  useEffect(() => {
    if (isOpen) {
      getDocs(query(collection(db, 'students'), orderBy('name'))).then(snapshot => {
        setStudents(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const student = students.find(s => s.id === formData.studentId);
      
      // Save voucher
      await addDoc(collection(db, 'fee_vouchers'), {
        ...formData,
        studentName: student?.name || 'Unknown',
        amount: Number(formData.amount),
        status: 'Unpaid',
        createdAt: serverTimestamp()
      });

      // Also record it as pending or we can log it when paid. 
      // For now, it's a generated voucher.

      showToast('Fee voucher generated successfully!', 'success');
      onClose();
      setFormData({ studentId: '', title: 'Term 1 Tuition Fee', amount: '', dueDate: '' });
    } catch (error) {
      console.error("Error generating voucher:", error);
      showToast('Failed to generate voucher.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-md rounded-2xl shadow-2xl flex flex-col border border-slate-700/50">
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center space-x-3">
             <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                <FileText className="w-5 h-5" />
             </div>
             <h2 className="text-xl font-bold font-heading text-white">Generate Voucher</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <form id="voucher-form" onSubmit={handleGenerate} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Select Student</label>
              <select required name="studentId" value={formData.studentId} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-amber-500 transition-all">
                <option value="" disabled>Select a student...</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Fee Title</label>
              <input required name="title" value={formData.title} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-amber-500 transition-all" placeholder="Term 1 Tuition Fee" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Amount ($)</label>
              <input required type="number" name="amount" value={formData.amount} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-amber-500 transition-all" placeholder="5000" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Due Date</label>
              <input required type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-amber-500 transition-all [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert" />
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-slate-700/50 flex items-center justify-end space-x-4">
          <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-700/50 transition-colors text-sm font-medium">Cancel</button>
          <button type="submit" form="voucher-form" disabled={isSubmitting} className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white transition-all text-sm font-medium flex items-center disabled:opacity-50">
            {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</> : <><Download className="w-4 h-4 mr-2"/> Generate</>}
          </button>
        </div>
      </div>
    </div>
  );
}
