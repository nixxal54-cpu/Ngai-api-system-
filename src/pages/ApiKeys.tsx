import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { db } from '../firebase/client';
import { collection, query, where, getDocs, setDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Plus, Trash2, Copy, Check, EyeOff, Loader2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';

// Secure hashing on the client before storing in Firestore
async function hashKeyForDb(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function ApiKeys({ user }: { user: User }) {
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [keyName, setKeyName] = useState('');

  useEffect(() => {
    fetchKeys();
  }, [user.uid]);

  async function fetchKeys() {
    setLoading(true);
    try {
      const q = query(collection(db, 'api_keys'), where('userId', '==', user.uid));
      const snap = await getDocs(q);
      const keysData = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      setKeys(keysData.sort((a, b) => b.createdAt - a.createdAt));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function createKey(e: React.FormEvent) {
    e.preventDefault();
    if (!keyName) return;
    setIsCreating(true);
    
    try {
      const rawKey = `ngai_${uuidv4().replace(/-/g, '')}`;
      const hashed = await hashKeyForDb(rawKey);
      const masked = `ngai_...${rawKey.slice(-4)}`;
      
      const newKeyDoc = {
        userId: user.uid,
        name: keyName,
        createdAt: Date.now(),
        active: true,
        maskedKey: masked
      };

      await setDoc(doc(db, 'api_keys', hashed), newKeyDoc);
      setNewKey(rawKey);
      setKeyName('');
      await fetchKeys();
    } catch (error) {
      console.error(error);
      alert("Failed to create key");
    } finally {
      setIsCreating(false);
    }
  }

  async function revokeKey(hashId: string) {
    if (!confirm("Are you sure you want to revoke this key? Any applications using it will instantly fail.")) return;
    try {
      await updateDoc(doc(db, 'api_keys', hashId), { active: false });
      await fetchKeys();
    } catch(e) {
      console.error(e);
    }
  }

  async function deleteKey(hashId: string) {
    if (!confirm("Delete key from history completely?")) return;
    try {
      await deleteDoc(doc(db, 'api_keys', hashId));
      setKeys(keys.filter(k => k.id !== hashId));
    } catch(e) { console.error(e); }
  }

  const copyToClipboard = () => {
    if (newKey) {
      navigator.clipboard.writeText(newKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">API Keys</h1>
        <p className="text-neutral-400 mt-1">Manage keys used to authenticate API requests to NGAI.</p>
      </div>

      {/* New Key Display */}
      {newKey && (
        <div className="bg-emerald-950/30 border border-emerald-900 rounded-xl p-6">
          <h3 className="text-sm font-medium text-emerald-400 mb-2">Save your new API key</h3>
          <p className="text-sm text-neutral-400 mb-4">You won't be able to view this key again. If you lose it, you'll need to generate a new one.</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-black px-4 py-3 rounded-lg text-emerald-400 font-mono text-sm border border-emerald-900/50 break-all">
              {newKey}
            </code>
            <button 
              onClick={copyToClipboard}
              className="p-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg border border-neutral-700 transition-colors"
            >
              {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
            </button>
          </div>
          <button onClick={() => setNewKey(null)} className="mt-4 text-sm font-medium text-emerald-500 hover:text-emerald-400">
            I saved it securely
          </button>
        </div>
      )}

      {/* Create Key Form */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
        <h3 className="text-sm font-medium text-white mb-4">Create new secret key</h3>
        <form onSubmit={createKey} className="flex flex-col sm:flex-row items-end gap-4 w-full">
          <div className="w-full sm:flex-1 sm:max-w-sm">
            <label className="block text-xs font-medium text-neutral-400 mb-1">Name</label>
            <input 
              type="text" 
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              placeholder="My Test App"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 focus:ring-1 focus:ring-neutral-600"
              required 
            />
          </div>
          <button 
            disabled={isCreating || !keyName}
            type="submit"
            className="w-full sm:w-auto bg-white text-neutral-950 px-4 py-2 rounded-md text-sm font-medium hover:bg-neutral-200 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isCreating ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            Create Key
          </button>
        </form>
      </div>

      {/* Keys List */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-x-auto w-full">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-neutral-950/50 text-neutral-400 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Key</th>
              <th className="px-6 py-4 font-medium">Created</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-neutral-500"><Loader2 className="size-5 animate-spin mx-auto" /></td></tr>
            ) : keys.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-neutral-500">No API keys found.</td></tr>
            ) : (
              keys.map((key) => (
                <tr key={key.id} className="hover:bg-neutral-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{key.name}</td>
                  <td className="px-6 py-4 font-mono text-neutral-400 flex items-center gap-2">
                    <EyeOff className="size-3" /> {key.maskedKey}
                  </td>
                  <td className="px-6 py-4 text-neutral-400">{format(new Date(key.createdAt), 'MMM dd, yyyy')}</td>
                  <td className="px-6 py-4">
                    {key.active ? 
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-950/50 text-emerald-400 border border-emerald-900">Active</span> : 
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-950/50 text-red-400 border border-red-900">Revoked</span>
                    }
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {key.active && (
                        <button onClick={() => revokeKey(key.id)} className="text-xs font-medium text-neutral-400 hover:text-white">
                          Revoke
                        </button>
                      )}
                      <button onClick={() => deleteKey(key.id)} className="text-neutral-500 hover:text-red-400 transition-colors">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
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
