import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Terminal, Shield, Zap, Code2, ArrowRight } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="bg-neutral-950 min-h-screen text-neutral-100 selection:bg-neutral-800 font-sans selection:text-white">
      {/* Navbar */}
      <nav className="border-b border-neutral-900 bg-neutral-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="size-8 bg-white rounded-lg flex items-center justify-center text-neutral-950 font-bold text-xl leading-none tracking-tighter">N</div>
              <span className="font-semibold text-xl tracking-tight text-white">NGAI</span>
            </div>
            <div className="flex items-center gap-3 sm:gap-6 text-sm font-medium">
              <a href="#features" className="hidden sm:block text-neutral-400 hover:text-white transition-colors">Features</a>
              <a href="#docs" className="hidden sm:block text-neutral-400 hover:text-white transition-colors">Docs</a>
              <Link to="/auth" className="text-neutral-400 hover:text-white transition-colors text-xs sm:text-sm">Log in</Link>
              <Link to="/auth" className="bg-white text-neutral-950 px-3 py-1.5 sm:px-4 sm:py-2 rounded-md hover:bg-neutral-200 transition-colors text-xs sm:text-sm">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main>
        <div className="relative isolate px-6 pt-14 lg:px-8">
          <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
            <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-neutral-800 to-neutral-600 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
          </div>
          
          <div className="mx-auto max-w-4xl py-32 sm:py-48 lg:py-56 text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-semibold tracking-tight text-white sm:text-7xl"
            >
              The unified <span className="text-neutral-500">abstraction layer</span> for AI models.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-8 text-pretty text-lg font-medium text-neutral-400 sm:text-xl/8 max-w-2xl mx-auto"
            >
              One API key. Infinite possibilities. NGAI provides a secure, drop-in replacement for OpenAI endpoints, routing your requests to Puter Qwen3.6 Max and other leading models instantly.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-10 flex items-center justify-center gap-x-6"
            >
              <Link to="/auth" className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-neutral-950 shadow-sm hover:bg-neutral-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-all flex items-center gap-2">
                Start Building <ArrowRight className="size-4" />
              </Link>
              <a href="#docs" className="text-sm/6 font-semibold text-white group flex items-center gap-2">
                Read the docs <span aria-hidden="true" className="group-hover:translate-x-1 transition-transform">→</span>
              </a>
            </motion.div>
          </div>
        </div>

        {/* Features */}
        <div id="features" className="py-24 sm:py-32 bg-neutral-900 border-y border-neutral-800">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-base/7 font-semibold text-neutral-400">Deploy faster</h2>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Everything you need to scale AI</p>
            </div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                {[
                  { name: 'Drop-in Replacement', description: 'Just change the base URL and API key. Works perfectly with the standard OpenAI SDKs in Python and Node.js.', icon: Code2 },
                  { name: 'Enterprise Security', description: 'API keys are hashed securely before storage. Rate limiting and Zero-Trust architecture built-in.', icon: Shield },
                  { name: 'Lightning Fast', description: 'Run on the edge. NGAI routes your completions directly to Puter Qwen3.6 Max with minimal latency.', icon: Zap },
                ].map((feature) => (
                  <div key={feature.name} className="flex flex-col">
                    <dt className="flex items-center gap-x-3 text-base/7 font-semibold text-white">
                      <div className="size-10 rounded-lg bg-neutral-800 flex items-center justify-center border border-neutral-700">
                        <feature.icon className="h-5 w-5 text-white" aria-hidden="true" />
                      </div>
                      {feature.name}
                    </dt>
                    <dd className="mt-4 flex flex-auto flex-col text-base/7 text-neutral-400">
                      <p className="flex-auto">{feature.description}</p>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-neutral-950 py-12 border-t border-neutral-900 mt-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center text-sm font-medium text-neutral-500">
          <p>© {new Date().getFullYear()} NGAI Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
