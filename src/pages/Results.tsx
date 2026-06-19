import { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, Edit2 } from 'lucide-react';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useToast } from '../contexts/ToastContext';
import ResultFormModal from '../components/ResultFormModal';

export default function Results() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    try {
      const q = query(collection(db, 'results'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setResults(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      }, () => {
        setLoading(false);
      });
      return () => unsubscribe();
    } catch (err) {
      setLoading(false);
    }
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'results', id));
      showToast('Result deleted', 'success');
    } catch (e) {
      showToast('Delete failed. Check permissions.', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white">Term Results</h1>
          <p className="text-slate-400 text-sm mt-1">Manage term-wise student examination results.</p>
        </div>
        <button onClick={() => setIsFormOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center transition-colors">
          <Plus className="w-4 h-4 mr-2" /> Add Result
        </button>
      </div>

      <ResultFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />

      <div className="glass-panel rounded-2xl overflow-hidden flex flex-col">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="text-xs text-slate-500 uppercase bg-slate-900/50 border-b border-slate-700/50">
              <tr>
                <th className="px-6 py-4 font-medium">Student Name</th>
                <th className="px-6 py-4 font-medium">Term / Exam</th>
                <th className="px-6 py-4 font-medium">Subject</th>
                <th className="px-6 py-4 font-medium">Marks Obtained</th>
                <th className="px-6 py-4 font-medium">Grade</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">FETCHING...</td></tr>
              ) : results.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">No results submitted yet.</td></tr>
              ) : (
                results.map((r) => {
                  const percentage = (Number(r.marksObtained) / Number(r.totalMarks)) * 100;
                  const grade = percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B' : percentage >= 60 ? 'C' : 'F';
                  
                  return (
                    <tr key={r.id} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-200">{r.studentName}</td>
                      <td className="px-6 py-4">{r.term}</td>
                      <td className="px-6 py-4">{r.subjectName}</td>
                      <td className="px-6 py-4">
                         <span className="text-slate-200">{r.marksObtained}</span> <span className="text-slate-500">/ {r.totalMarks}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                          grade === 'F' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
                        }`}>{grade}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleDelete(r.id)} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
