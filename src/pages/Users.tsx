import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Shield } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import UserFormModal from '../components/UserFormModal';

export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    try {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      }, (error) => {
        console.error(error);
        if (!error.message.includes('Missing or insufficient permissions')) {
          showToast("Error connecting to Firebase Users.", "error");
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
      await deleteDoc(doc(db, 'users', id));
      showToast(`Deleted user ${name}`, 'success');
    } catch (e) {
      showToast('Delete failed. Check permissions.', 'error');
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white">System Users</h1>
          <p className="text-slate-400 text-sm mt-1">Manage role-based access for teachers, students, and parents.</p>
        </div>
        <button onClick={() => setIsFormOpen(true)} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center transition-colors">
          <Plus className="w-4 h-4 mr-2" /> Add User
        </button>
      </div>

      <UserFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />

      <div className="glass-panel rounded-2xl overflow-hidden flex flex-col">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="text-xs text-slate-500 uppercase bg-slate-900/50 border-b border-slate-700/50">
              <tr>
                <th className="px-6 py-4 font-medium">User / Email</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">LOADING_KERNEL...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">No users found. Create one above.</td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                         <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold text-xs uppercase">
                            {<Shield className="w-4 h-4 text-purple-400" />}
                         </div>
                         <div className="flex flex-col">
                           <span className="font-medium text-slate-200">{u.name}</span>
                           <span className="text-xs text-slate-500">{u.email}</span>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-purple-300 bg-purple-500/10 px-2 py-1 rounded-md text-xs">{u.role}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-emerald-400 text-xs">{u.status || 'Active'}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDelete(u.id, u.name)} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors">
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
