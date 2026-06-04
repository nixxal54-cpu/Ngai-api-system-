import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { db } from '../firebase/client';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

export function Usage({ user }: { user: User }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const q = query(
          collection(db, 'requests'), 
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(50)
        );
        const snap = await getDocs(q);
        setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, [user.uid]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Usage Logs</h1>
        <p className="text-neutral-400 mt-1">Recent API requests across your keys.</p>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-neutral-950/50 text-neutral-400 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-medium">Time</th>
              <th className="px-6 py-4 font-medium">Model</th>
              <th className="px-6 py-4 font-medium">Latency (ms)</th>
              <th className="px-6 py-4 font-medium">Tokens</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-neutral-500"><Loader2 className="size-5 animate-spin mx-auto" /></td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-neutral-500">No recent activity.</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-neutral-800/50 transition-colors">
                  <td className="px-6 py-4 text-neutral-300">{format(new Date(log.createdAt), 'MMM dd, HH:mm:ss')}</td>
                  <td className="px-6 py-4 text-neutral-400 font-mono text-xs"><span className="px-2 py-1 bg-neutral-950 rounded-md border border-neutral-800">{log.model}</span></td>
                  <td className="px-6 py-4 text-neutral-400">{log.durationMs}ms</td>
                  <td className="px-6 py-4 text-neutral-400">
                    {log.promptTokens + log.completionTokens} <span className="text-neutral-500 text-xs">({log.promptTokens} P / {log.completionTokens} C)</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
