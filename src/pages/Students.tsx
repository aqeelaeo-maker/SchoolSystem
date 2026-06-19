import { useState, useEffect } from 'react';
import { Search, Plus, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { collection, onSnapshot, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Students() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    // If db is not initialized properly, this will fail.
    try {
      const q = query(collection(db, 'students'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const studentData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setStudents(studentData);
        setLoading(false);
      }, (error) => {
        console.error("Firebase fetch error:", error);
        showToast("Error connecting to Firebase. Check console.", "error");
        setLoading(false);
      });
      return () => unsubscribe();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, [showToast]);

  const handleAddMockStudent = async () => {
    try {
      showToast('Adding new student to Firebase...', 'info');
      const mockNames = ['Sarah Connor', 'John Doe', 'Jane Smith', 'Alice Wonderland', 'Bob Builder'];
      await addDoc(collection(db, 'students'), {
        name: mockNames[Math.floor(Math.random() * mockNames.length)],
        grade: '10th',
        section: 'A',
        status: 'Active',
        attendance: '100%',
        createdAt: serverTimestamp()
      });
      showToast('Student added successfully!', 'success');
    } catch (error) {
      console.error(error);
      showToast('Failed to add student. Check Firebase rules.', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white">Student Management</h1>
          <p className="text-slate-400 text-sm mt-1">Manage admissions, view profiles, and track status.</p>
        </div>
        <button 
          onClick={handleAddMockStudent}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center transition-colors shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Student
        </button>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden flex flex-col">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-700/50 flex items-center justify-between bg-slate-800/20">
          <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
             <input 
               type="text" 
               placeholder="Search students..." 
               className="bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-1.5 text-sm w-64 focus:outline-none focus:border-blue-500/50 text-slate-200"
             />
          </div>
          <div className="flex items-center space-x-3">
             <select className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-1.5 outline-none">
                <option>All Classes</option>
                <option>Grade 10</option>
                <option>Grade 11</option>
             </select>
              <button 
                onClick={() => showToast('Exporting student list to CSV...', 'success')}
                className="text-sm text-slate-400 hover:text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg"
              >
                Export
              </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="text-xs text-slate-500 uppercase bg-slate-900/50 border-b border-slate-700/50">
              <tr>
                <th className="px-6 py-4 font-medium">ID / Ref</th>
                <th className="px-6 py-4 font-medium">Student Name</th>
                <th className="px-6 py-4 font-medium">Class</th>
                <th className="px-6 py-4 font-medium">Attendance</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500 font-mono text-xs">
                    FETCHING_RECORDS...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No students found.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{student.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                         <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold text-xs uppercase">
                            {student.name.substring(0, 2)}
                         </div>
                         <span className="font-medium text-slate-200">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-300">{student.grade}</span>
                      <span className="text-slate-500 ml-1">({student.section})</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500" 
                            style={{ width: student.attendance }}
                          ></div>
                        </div>
                        <span className="text-xs text-slate-400">{student.attendance}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        student.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                        'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => showToast(`Editing profile for ${student.name}`, 'info')}
                          className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-blue-400/10 rounded-md transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            import('firebase/firestore').then(({ deleteDoc, doc }) => {
                              deleteDoc(doc(db, 'students', student.id))
                                .then(() => showToast(`Deleted student ${student.name}`, 'success'))
                                .catch(() => showToast('Delete failed. Check permissions.', 'error'));
                            });
                          }}
                          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Dummy */}
        <div className="p-4 border-t border-slate-700/50 flex items-center justify-between text-sm text-slate-500 bg-slate-800/20">
           <span>Showing 1 to 5 of {students.length} entries</span>
           <div className="flex space-x-1">
              <button 
                onClick={() => showToast('Already on first page.', 'info')}
                className="px-3 py-1 border border-slate-700 rounded-md hover:bg-slate-700 transition-colors"
              >
                Prev
              </button>
              <button className="px-3 py-1 bg-blue-600 text-white rounded-md">1</button>
              <button 
                onClick={() => showToast('No more pages.', 'info')}
                className="px-3 py-1 border border-slate-700 rounded-md hover:bg-slate-700 transition-colors"
              >
                Next
              </button>
           </div>
        </div>

      </div>
    </div>
  );
}
