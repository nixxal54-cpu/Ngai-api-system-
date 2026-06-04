import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { db } from '../firebase/client';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { Activity, Key as KeyIcon, Zap, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays, startOfDay, isSameDay } from 'date-fns';

export function Dashboard({ user }: { user: User }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRequests: 0,
    requestsToday: 0,
    activeKeys: 0,
    lastActivity: 'Never',
  });
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Fetch keys
        const keysSnapshot = await getDocs(
          query(collection(db, 'api_keys'), where('userId', '==', user.uid))
        );
        const activeKeys = keysSnapshot.docs.filter(d => d.data().active).length;

        // Fetch requests (last 7 days for chart)
        const sevenDaysAgo = startOfDay(subDays(new Date(), 6)).getTime();
        
        const requestsSnapshot = await getDocs(
          query(
            collection(db, 'requests'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc'),
            limit(1000) // bounded limit for preview
          )
        );

        const requests = requestsSnapshot.docs.map(d => d.data());
        
        const todayStart = startOfDay(new Date()).getTime();
        const reqsToday = requests.filter(r => r.createdAt >= todayStart).length;
        
        // Build chart data
        const days = Array.from({ length: 7 }).map((_, i) => subDays(new Date(), 6 - i));
        const cData = days.map(day => {
          const count = requests.filter(r => isSameDay(new Date(r.createdAt), day)).length;
          return {
            name: format(day, 'MMM dd'),
            requests: count
          };
        });

        const lastReq = requests[0];
        
        setStats({
          totalRequests: requests.length,
          requestsToday: reqsToday,
          activeKeys,
          lastActivity: lastReq ? format(new Date(lastReq.createdAt), 'MMM dd, HH:mm') : 'Never'
        });
        setChartData(cData);
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [user.uid]);

  if (loading) {
    return <div className="h-full flex items-center justify-center"><Loader2 className="size-6 animate-spin text-neutral-500" /></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Overview</h1>
        <p className="text-neutral-400 mt-1">Metrics and usage for your workspace.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Requests" value={stats.totalRequests.toLocaleString()} icon={<Activity className="size-4 text-neutral-400" />} />
        <StatCard title="Requests Today" value={stats.requestsToday.toLocaleString()} icon={<Zap className="size-4 text-neutral-400" />} />
        <StatCard title="Active API Keys" value={stats.activeKeys.toString()} icon={<KeyIcon className="size-4 text-neutral-400" />} />
        <StatCard title="Last Activity" value={stats.lastActivity} icon={<Loader2 className="size-4 text-neutral-400" />} />
      </div>

      {/* Charts */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
        <h3 className="text-sm font-medium text-neutral-400 mb-6">Request Volume (Last 7 Days)</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorReqs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffffff" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#262626" />
              <XAxis dataKey="name" stroke="#525252" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#525252" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Area 
                type="monotone" 
                dataKey="requests" 
                stroke="#fff" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorReqs)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-medium text-neutral-400">{title}</span>
        {icon}
      </div>
      <div className="text-3xl font-semibold tracking-tight">{value}</div>
    </div>
  );
}
