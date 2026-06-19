import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Users, BookOpen, Clock, Activity, TrendingUp } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';

const cn = (...inputs: (string | undefined | null | false)[]) => twMerge(clsx(inputs));

export default function Dashboard() {
  const [stats, setStats] = useState<any>({
    totalStudents: 0,
    totalTeachers: 0,
    attendanceRate: 94.5, // Mocked until attendance module is built
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    let totals = { students: 0, teachers: 0, revenue: 0 };
    let hasLoaded = { students: false, teachers: false, finance: false };

    const checkLoaded = () => {
      if (hasLoaded.students && hasLoaded.teachers && hasLoaded.finance) setLoading(false);
    };

    const unsubStudents = onSnapshot(collection(db, 'students'), (snapshot) => {
      totals.students = snapshot.size;
      hasLoaded.students = true;
      setStats(prev => ({ ...prev, totalStudents: totals.students }));
      checkLoaded();
    });

    const unsubTeachers = onSnapshot(collection(db, 'teachers'), (snapshot) => {
      totals.teachers = snapshot.size;
      hasLoaded.teachers = true;
      setStats(prev => ({ ...prev, totalTeachers: totals.teachers }));
      checkLoaded();
    });

    const unsubFinance = onSnapshot(collection(db, 'finance_records'), (snapshot) => {
      let currentRevenue = 0;
      let monthlyData: Record<string, { revenue: number, expenses: number }> = {};
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.type === 'Income') currentRevenue += Number(data.amount || 0);
        
        // Group by month for chart
        const date = data.date ? new Date(data.date) : (data.createdAt?.toDate ? data.createdAt.toDate() : new Date());
        const monthName = date.toLocaleString('default', { month: 'short' });
        
        if (!monthlyData[monthName]) monthlyData[monthName] = { revenue: 0, expenses: 0 };
        
        if (data.type === 'Income') monthlyData[monthName].revenue += Number(data.amount || 0);
        else monthlyData[monthName].expenses += Number(data.amount || 0);
      });

      // Convert to array for Recharts
      const monthsOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const chartData = Object.keys(monthlyData)
        .sort((a, b) => monthsOrder.indexOf(a) - monthsOrder.indexOf(b))
        .map(month => ({ name: month, ...monthlyData[month] }));

      // If empty, provide some default shape
      if (chartData.length === 0) {
        setRevenueData([{ name: 'No Data', revenue: 0, expenses: 0 }]);
      } else {
        setRevenueData(chartData);
      }

      totals.revenue = currentRevenue;
      hasLoaded.finance = true;
      setStats(prev => ({ ...prev, revenue: totals.revenue }));
      checkLoaded();
    });
    
    // Mix of latest users and finance for activities
    const unsubActivities = onSnapshot(query(collection(db, 'finance_records'), orderBy('createdAt', 'desc'), limit(4)), (snapshot) => {
       const mapped = snapshot.docs.map(d => {
         const data = d.data();
         return {
           id: d.id,
           text: `Transaction: ${data.title} (${data.type})`,
           time: data.date ? new Date(data.date).toLocaleDateString() : 'Recent',
           type: 'admin'
         }
       });
       setActivities(mapped);
    });

    return () => {
      unsubStudents();
      unsubTeachers();
      unsubFinance();
      unsubActivities();
    };
  }, []);

  if (loading) return <div className="h-full flex items-center justify-center text-slate-500 font-mono">FETCHING_REALTIME_DATA...</div>;

  const statCards = [
    { title: 'Total Students', value: stats.totalStudents.toLocaleString(), icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { title: 'Total Teachers', value: stats.totalTeachers.toLocaleString(), icon: BookOpen, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { title: 'Attendance Rate', value: `${stats.attendanceRate}%`, icon: Clock, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { title: 'Total Revenue', value: `$${(stats.revenue/1000).toFixed(1)}k`, icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  ];

  // Dummy attendance data since attendance isn't fully built
  const attendanceData = [
    { day: 'Mon', rate: 95 },
    { day: 'Tue', rate: 94 },
    { day: 'Wed', rate: 96 },
    { day: 'Thu', rate: 92 },
    { day: 'Fri', rate: 90 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white">Executive Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Overview of school performance and metrics.</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="glass-panel p-6 rounded-2xl flex items-start justify-between group hover:border-slate-600 transition-colors">
            <div>
              <p className="text-sm font-medium text-slate-400 mb-1">{stat.title}</p>
              <h3 className="text-2xl font-bold font-heading text-white">{stat.value}</h3>
            </div>
            <div className={cn("p-3 rounded-xl", stat.bg)}>
              <stat.icon className={cn("w-5 h-5", stat.color)} />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Area Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-white">Financial Overview</h3>
            <select className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg px-2 py-1 outline-none">
              <option>This Year</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '13px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExpenses)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Attendance Bar Chart */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col">
          <h3 className="font-semibold text-white mb-6">Weekly Attendance</h3>
          <div className="flex-1 min-h-[250px]">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} domain={[80, 100]} />
                 <Tooltip 
                  cursor={{fill: '#334155', opacity: 0.2}}
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                />
                <Bar dataKey="rate" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activities List */}
      <div className="glass-panel p-6 rounded-2xl">
         <h3 className="font-semibold text-white mb-4">Recent Activities</h3>
         <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4 border-b border-slate-700/50 pb-4 last:border-0 last:pb-0">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-slate-600">
                  <Activity className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200">{activity.text}</p>
                  <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
         </div>
      </div>

    </div>
  );
}
