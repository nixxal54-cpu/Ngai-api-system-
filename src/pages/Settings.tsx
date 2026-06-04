import { User } from 'firebase/auth';

export function Settings({ user }: { user: User }) {
  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="text-neutral-400 mt-1">Manage your account and platform preferences.</p>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-neutral-800">
          <h2 className="text-lg font-medium text-white mb-1">Account Details</h2>
          <p className="text-sm text-neutral-400">Your personal platform identity.</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Email</label>
            <input 
              disabled
              type="text" 
              value={user.email || ''} 
              className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-sm text-neutral-500 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">User ID</label>
            <input 
              disabled
              type="text" 
              value={user.uid} 
              className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-sm text-neutral-500 font-mono cursor-not-allowed"
            />
          </div>
        </div>
      </div>
      
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-neutral-800">
          <h2 className="text-lg font-medium text-white mb-1">Billing Plan</h2>
          <p className="text-sm text-neutral-400">You are currently on the Free Preview tier.</p>
        </div>
        <div className="p-6">
           <button className="px-4 py-2 bg-neutral-800 text-neutral-300 text-sm font-medium rounded-md hover:bg-neutral-700 transition-colors">
             Upgrade to Pro
           </button>
        </div>
      </div>
    </div>
  );
}
