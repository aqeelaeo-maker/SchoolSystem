import { useState, useEffect } from 'react';
import { Plus, Trash2, User } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import TeacherFormModal from '../components/TeacherFormModal';

export default function Teachers() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    try {
      const q = query(collection(db, 'teachers'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setTeachers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      }, (error) => {
        console.error(error);
        if (!error.message.includes('Missing or insufficient permissions')) {
          showToast("Error connecting to Firebase Teachers.", "error");
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, [showToast]);

  const handleDelete = async (id: string, name: string) => {
    try {
      await deleteDoc(doc(db, 'teachers', id));
      showToast(`Deleted teacher ${name}`, 'success');
    } catch (e) {
      showToast('Delete failed. Check permissions.', 'error');
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white">Teacher Management</h1>
          <p className="text-slate-400 text-sm mt-1">Manage staff profiles and assignments.</p>
        </div>
        <button onClick={() => setIsFormOpen(true)} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center transition-colors">
          <Plus className="w-4 h-4 mr-2" /> Add Teacher
        </button>
      </div>

      <TeacherFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />

      <div className="glass-panel rounded-2xl overflow-hidden flex flex-col">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="text-xs text-slate-500 uppercase bg-slate-900/50 border-b border-slate-700/50">
              <tr>
                <th className="px-6 py-4 font-medium">Name / Email</th>
                <th className="px-6 py-4 font-medium">Subject</th>
                <th className="px-6 py-4 font-medium">Qualification</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">LOADING_KERNEL...</td></tr>
              ) : teachers.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">No teachers found. Create one.</td></tr>
              ) : (
                teachers.map((t) => (
                  <tr key={t.id} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                         <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
                            <User className="w-4 h-4 text-orange-400"/>
                         </div>
                         <div className="flex flex-col">
                           <span className="font-medium text-slate-200">{t.name}</span>
                           <span className="text-xs text-slate-500">{t.email}</span>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{t.subject}</td>
                    <td className="px-6 py-4 text-slate-400">{t.qualification}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDelete(t.id, t.name)} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
