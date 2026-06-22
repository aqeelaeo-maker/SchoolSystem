import { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowUpRight, ArrowDownRight, FileText } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import FinanceFormModal from '../components/FinanceFormModal';
import FeeVoucherModal from '../components/FeeVoucherModal';

export default function Finance() {
  const [records, setRecords] = useState<any[]>([]);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isVoucherOpen, setIsVoucherOpen] = useState(false);

  useEffect(() => {
    try {
      const q = query(collection(db, 'finance_records'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setRecords(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      }, (error) => {
        setLoading(false);
      });

      const qVouchers = query(collection(db, 'fee_vouchers'), orderBy('createdAt', 'desc'));
      const unsubVouchers = onSnapshot(qVouchers, (snapshot) => {
        setVouchers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });

      return () => { unsubscribe(); unsubVouchers(); }
    } catch (err) {
      setLoading(false);
    }
  }, []);

  const handleDelete = async (id: string, col: string) => {
    try {
      await deleteDoc(doc(db, col, id));
      showToast(`Record deleted`, 'success');
    } catch (e) {
      showToast('Delete failed. Check permissions.', 'error');
    }
  }

  const totals = records.reduce((acc, curr) => {
    if (curr.type === 'Income') acc.in += curr.amount || 0;
    else acc.out += curr.amount || 0;
    return acc;
  }, { in: 0, out: 0 });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white">Finance & Accounting</h1>
          <p className="text-slate-400 text-sm mt-1">Manage institutional income, expenses, and fee vouchers.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={() => setIsVoucherOpen(true)} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-4 py-2 rounded-xl text-sm font-medium flex items-center transition-colors">
            <FileText className="w-4 h-4 mr-2 text-amber-400" /> Gen. Voucher
          </button>
          <button onClick={() => setIsFormOpen(true)} className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center transition-colors">
            <Plus className="w-4 h-4 mr-2" /> Add Transaction
          </button>
        </div>
      </div>

      <FinanceFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
      <FeeVoucherModal isOpen={isVoucherOpen} onClose={() => setIsVoucherOpen(false)} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
           <div>
             <p className="text-slate-400 text-sm">Total Income</p>
             <h2 className="text-3xl font-bold text-white mt-1">${totals.in.toLocaleString()}</h2>
           </div>
           <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
             <ArrowUpRight className="w-6 h-6 text-emerald-400" />
           </div>
        </div>
        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
           <div>
             <p className="text-slate-400 text-sm">Total Expenses</p>
             <h2 className="text-3xl font-bold text-white mt-1">${totals.out.toLocaleString()}</h2>
           </div>
           <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
             <ArrowDownRight className="w-6 h-6 text-red-400" />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transactions Table */}
        <div className="glass-panel rounded-2xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-700/50 bg-slate-800/20">
             <h3 className="font-semibold text-white">Recent Transactions</h3>
          </div>
          <div className="overflow-x-auto custom-scrollbar h-80">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="text-xs text-slate-500 uppercase bg-slate-900/50 border-b border-slate-700/50">
                <tr>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Title</th>
                  <th className="px-6 py-4 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500">LOADING...</td></tr>
                ) : records.length === 0 ? (
                  <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500">No transactions recorded.</td></tr>
                ) : (
                  records.map((r) => (
                    <tr key={r.id} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                      <td className="px-6 py-4 truncate w-1/4">{r.date ? new Date(r.date).toLocaleDateString() : (r.createdAt?.toDate() ? new Date(r.createdAt.toDate()).toLocaleDateString() : 'Just now')}</td>
                      <td className="px-6 py-4 text-slate-200 truncate max-w-[150px]">{r.title}</td>
                      <td className={`px-6 py-4 text-right font-medium truncate ${r.type === 'Income' ? 'text-emerald-400' : 'text-red-400'}`}>
                        <div className="flex items-center justify-end space-x-3">
                          <span>{r.type === 'Income' ? '+' : '-'}${Number(r.amount).toLocaleString()}</span>
                          <button onClick={() => handleDelete(r.id, 'finance_records')} className="p-1 text-slate-500 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vouchers Table */}
        <div className="glass-panel rounded-2xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-700/50 bg-slate-800/20">
             <h3 className="font-semibold text-white">Recent Fee Vouchers</h3>
          </div>
          <div className="overflow-x-auto custom-scrollbar h-80">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="text-xs text-slate-500 uppercase bg-slate-900/50 border-b border-slate-700/50">
                <tr>
                  <th className="px-6 py-4 font-medium">Student</th>
                  <th className="px-6 py-4 font-medium">Due Date</th>
                  <th className="px-6 py-4 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {vouchers.length === 0 ? (
                  <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500">No vouchers generated.</td></tr>
                ) : (
                  vouchers.map((v) => (
                    <tr key={v.id} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                      <td className="px-6 py-4 text-slate-200 truncate">{v.studentName}</td>
                      <td className="px-6 py-4 truncate w-1/4">{v.dueDate ? new Date(v.dueDate).toLocaleDateString() : ''}</td>
                      <td className="px-6 py-4 text-right font-medium text-amber-400">
                         <div className="flex items-center justify-end space-x-3">
                           <span>${Number(v.amount).toLocaleString()}</span>
                           <button onClick={() => handleDelete(v.id, 'fee_vouchers')} className="p-1 text-slate-500 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
                         </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
