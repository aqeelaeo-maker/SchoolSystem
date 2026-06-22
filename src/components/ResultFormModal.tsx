import React, { useState, useEffect } from 'react';
import { X, BookOpen, Loader2 } from 'lucide-react';
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useToast } from '../contexts/ToastContext';

interface ResultFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ResultFormModal({ isOpen, onClose }: ResultFormModalProps) {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    studentId: '',
    subjectId: '',
    term: 'Term 1',
    marksObtained: '',
    totalMarks: '100'
  });

  useEffect(() => {
    if (isOpen) {
      getDocs(query(collection(db, 'students'), orderBy('name'))).then(snapshot => {
        setStudents(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      });
      getDocs(query(collection(db, 'subjects'), orderBy('name'))).then(snapshot => {
        setSubjects(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const student = students.find(s => s.id === formData.studentId);
      const subject = subjects.find(s => s.id === formData.subjectId);

      await addDoc(collection(db, 'results'), {
        ...formData,
        studentName: student?.name || 'Unknown',
        subjectName: subject?.name || 'Unknown',
        marksObtained: Number(formData.marksObtained),
        totalMarks: Number(formData.totalMarks),
        createdAt: serverTimestamp()
      });

      showToast('Result added successfully!', 'success');
      onClose();
      setFormData({ ...formData, marksObtained: '' });
    } catch (error) {
      console.error("Error adding result:", error);
      showToast('Failed to save result.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-md rounded-2xl shadow-2xl flex flex-col border border-slate-700/50">
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center space-x-3">
             <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <BookOpen className="w-5 h-5" />
             </div>
             <h2 className="text-xl font-bold font-heading text-white">Add Result</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <form id="result-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Student</label>
              <select required name="studentId" value={formData.studentId} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500 transition-all">
                <option value="" disabled>Select Student</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Term</label>
              <select name="term" value={formData.term} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500 transition-all">
                <option value="Term 1">Term 1</option>
                <option value="Term 2">Term 2</option>
                <option value="Final Term">Final Term</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Subject</label>
              <select required name="subjectId" value={formData.subjectId} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500 transition-all">
                <option value="" disabled>Select Subject</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">Marks Obtained</label>
                <input required type="number" name="marksObtained" value={formData.marksObtained} onChange={handleChange} max={formData.totalMarks} className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500 transition-all" placeholder="85" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">Total Marks</label>
                <input required type="number" name="totalMarks" value={formData.totalMarks} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 text-slate-500 rounded-xl px-4 py-2.5 bg-slate-800/50 outline-none" readOnly />
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-slate-700/50 flex items-center justify-end space-x-4">
          <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-700/50 transition-colors text-sm font-medium">Cancel</button>
          <button type="submit" form="result-form" disabled={isSubmitting} className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all text-sm font-medium flex items-center disabled:opacity-50">
            {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : 'Save Result'}
          </button>
        </div>
      </div>
    </div>
  );
}
