import { useState, useEffect } from 'react';
import { Plus, Trash2, BookOpen } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import AcademicFormModal from '../components/AcademicFormModal';

export default function Academics() {
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const { showToast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState<'Class' | 'Subject'>('Class');

  useEffect(() => {
    try {
      const unsubClasses = onSnapshot(query(collection(db, 'classes'), orderBy('createdAt', 'desc')), (snapshot) => {
        setClasses(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoadingClasses(false);
      }, (e) => { setLoadingClasses(false); });
      
      const unsubSubjects = onSnapshot(query(collection(db, 'subjects'), orderBy('createdAt', 'desc')), (snapshot) => {
        setSubjects(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoadingSubjects(false);
      }, (e) => { setLoadingSubjects(false); });

      return () => { unsubClasses(); unsubSubjects(); };
    } catch (err) {
      setLoadingClasses(false);
      setLoadingSubjects(false);
    }
  }, []);

  const handleDelete = async (id: string, name: string, collectionName: string) => {
    try {
      await deleteDoc(doc(db, collectionName, id));
      showToast(`Deleted ${name}`, 'success');
    } catch (e) { showToast('Delete failed.', 'error'); }
  };

  const openForm = (type: 'Class' | 'Subject') => {
    setFormType(type);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold font-heading text-white">Academics</h1>
        <p className="text-slate-400 text-sm mt-1">Manage classes and subjects.</p>
      </div>

      <AcademicFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} type={formType} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Classes Card */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Classes / Grades</h3>
            <button onClick={() => openForm('Class')} className="text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg hover:bg-emerald-500/30 transition-colors">
               + Add Class
            </button>
          </div>
          <div className="flex-1 space-y-3">
             {loadingClasses ? (
               <p className="text-slate-500 text-sm text-center py-4">LOADING...</p>
             ) : classes.length === 0 ? (
               <p className="text-slate-500 text-sm text-center py-4">No classes added.</p>
             ) : classes.map(c => (
               <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                 <div className="flex flex-col">
                   <span className="text-slate-200 font-medium text-sm">{c.name}</span>
                   {c.description && <span className="text-slate-500 text-xs">{c.description}</span>}
                 </div>
                 <button onClick={() => handleDelete(c.id, c.name, 'classes')} className="text-slate-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
               </div>
             ))}
          </div>
        </div>

        {/* Subjects Card */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Subjects</h3>
            <button onClick={() => openForm('Subject')} className="text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg hover:bg-emerald-500/30 transition-colors">
               + Add Subject
            </button>
          </div>
          <div className="flex-1 space-y-3">
             {loadingSubjects ? (
               <p className="text-slate-500 text-sm text-center py-4">LOADING...</p>
             ) : subjects.length === 0 ? (
               <p className="text-slate-500 text-sm text-center py-4">No subjects added.</p>
             ) : subjects.map(s => (
               <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                 <div className="flex items-center space-x-3">
                   <BookOpen className="w-4 h-4 text-emerald-400" />
                   <div className="flex flex-col">
                     <span className="text-slate-200 font-medium text-sm">{s.name}</span>
                     {s.description && <span className="text-slate-500 text-xs">{s.description}</span>}
                   </div>
                 </div>
                 <button onClick={() => handleDelete(s.id, s.name, 'subjects')} className="text-slate-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
