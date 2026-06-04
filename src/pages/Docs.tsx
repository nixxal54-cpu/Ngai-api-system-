import { Code2, Globe } from 'lucide-react';

export function Docs() {
  const baseUrl = typeof window !== 'undefined' ? `${window.location.origin}/v1` : 'https://api.yourdomain.com/v1';

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">API Reference</h1>
        <p className="text-neutral-400 mt-1">Integrate NGAI directly into your apps using standard OpenAI compatible clients.</p>
      </div>

      <div className="space-y-6">
        <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h2 className="text-lg font-medium text-white mb-2 flex items-center gap-2"><Globe className="size-5 text-neutral-400" /> Base URL</h2>
          <p className="text-sm text-neutral-400 mb-4">Configure your OpenAI client to point to this base URL instead of the default OpenAI one.</p>
          <pre className="bg-neutral-950 p-4 rounded-lg border border-neutral-800 text-sm font-mono text-emerald-400 overflow-x-auto">
            {baseUrl}
          </pre>
        </section>

        <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h2 className="text-lg font-medium text-white mb-2 flex items-center gap-2"><Code2 className="size-5 text-neutral-400" /> Authentication</h2>
          <p className="text-sm text-neutral-400 mb-4">Authenticate your API requests by providing your secret key in the Authorization header.</p>
          <pre className="bg-neutral-950 p-4 rounded-lg border border-neutral-800 text-sm font-mono text-emerald-400 overflow-x-auto">
            Authorization: Bearer ngai_xxxxxxxxxxxxxxxxxxx
          </pre>
        </section>

        <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h2 className="text-lg font-medium text-white mb-2">Create chat completion</h2>
          <div className="flex items-center gap-3 mb-4">
            <span className="px-2 py-1 bg-emerald-950 text-emerald-400 text-xs font-bold rounded">POST</span>
            <code className="text-sm text-neutral-300 font-mono">/v1/chat/completions</code>
          </div>
          <p className="text-sm text-neutral-400 mb-4">Creates a model response for the given chat conversation.</p>
          
          <h4 className="text-sm font-medium text-white mb-2">Request Body</h4>
          <pre className="bg-neutral-950 p-4 rounded-lg border border-neutral-800 text-sm font-mono text-neutral-300 overflow-x-auto">
{`{
  "model": "qwen3.6-max-preview",
  "messages": [
    {
      "role": "user",
      "content": "Hello!"
    }
  ]
}`}
          </pre>
        </section>
      </div>
    </div>
  );
}
