import React, { useState } from 'react';
import { X, UserPlus, Loader2 } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useToast } from '../contexts/ToastContext';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserFormModal({ isOpen, onClose }: UserFormModalProps) {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Teacher',
    status: 'Active',
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
      await addDoc(collection(db, 'users'), {
        ...formData,
        createdAt: serverTimestamp()
      });

      showToast('User created successfully!', 'success');
      onClose();
      setFormData({ name: '', email: '', role: 'Teacher', status: 'Active' });
    } catch (error) {
      console.error("Error adding user:", error);
      showToast('Failed to create user.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-md rounded-2xl shadow-2xl flex flex-col border border-slate-700/50">
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-heading text-white">Add New User</h2>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <form id="user-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Full Name</label>
              <input required name="name" value={formData.name} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-purple-500 transition-all" placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
              <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-purple-500 transition-all" placeholder="john@school.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Role</label>
              <select name="role" value={formData.role} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-purple-500 transition-all">
                <option value="Super Admin">Super Admin</option>
                <option value="School Admin">School Admin</option>
                <option value="Teacher">Teacher</option>
                <option value="Student">Student</option>
                <option value="Parent">Parent</option>
                <option value="Accountant">Accountant</option>
              </select>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-slate-700/50 flex items-center justify-end space-x-4">
          <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-700/50 transition-colors text-sm font-medium">Cancel</button>
          <button type="submit" form="user-form" disabled={isSubmitting} className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-all text-sm font-medium flex items-center disabled:opacity-50">
            {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : 'Create User'}
          </button>
        </div>
      </div>
    </div>
  );
}
