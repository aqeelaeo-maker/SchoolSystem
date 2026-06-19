import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Users, BookOpen, Clock, Activity, TrendingUp } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs: (string | undefined | null | false)[]) => twMerge(clsx(inputs));

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    // Determine mock data directly so it works on static hosts like Vercel
    const mockStats = {
      totalStudents: 12450,
      totalTeachers: 450,
      attendanceRate: 94.5,
      revenue: 1250000,
    };

    const mockRevenueData = [
      { name: 'Jan', revenue: 400000, expenses: 240000 },
      { name: 'Feb', revenue: 300000, expenses: 139800 },
      { name: 'Mar', revenue: 500000, expenses: 400000 },
      { name: 'Apr', revenue: 478000, expenses: 390800 },
      { name: 'May', revenue: 589000, expenses: 480000 },
      { name: 'Jun', revenue: 439000, expenses: 380000 },
      { name: 'Jul', revenue: 649000, expenses: 430000 },
    ];

    const mockAttendanceData = [
      { day: 'Mon', rate: 95 },
      { day: 'Tue', rate: 94 },
      { day: 'Wed', rate: 96 },
      { day: 'Thu', rate: 92 },
      { day: 'Fri', rate: 90 },
    ];

    const mockActivities = [
      { id: 1, text: "Term 1 Syllabus Updated", time: "2 hours ago", type: "academic" },
      { id: 2, text: "New Admission in Grade 10-A", time: "5 hours ago", type: "admission" },
      { id: 3, text: "Library Book Restock Completed", time: "1 day ago", type: "inventory" },
      { id: 4, text: "Staff Meeting Scheduled for Friday", time: "2 days ago", type: "admin" },
    ];

    // Simulate small network delay for loading state
    setTimeout(() => {
      setStats(mockStats);
      setRevenueData(mockRevenueData);
      setAttendanceData(mockAttendanceData);
      setActivities(mockActivities);
    }, 500);
  }, []);

  if (!stats) return <div className="h-full flex items-center justify-center text-slate-500 font-mono">LOADING_KERNEL...</div>;

  const statCards = [
    { title: 'Total Students', value: stats.totalStudents.toLocaleString(), icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { title: 'Total Teachers', value: stats.totalTeachers.toLocaleString(), icon: BookOpen, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { title: 'Attendance Rate', value: `${stats.attendanceRate}%`, icon: Clock, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { title: 'Revenue (MTD)', value: `$${(stats.revenue/1000).toFixed(1)}k`, icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-400/10' },
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
