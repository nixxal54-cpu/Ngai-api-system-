import { loginWithGoogle } from '../firebase/client';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export function AuthPage() {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-neutral-100 font-sans relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="mx-auto size-12 bg-white rounded-xl flex items-center justify-center text-neutral-950 font-bold text-3xl leading-none tracking-tighter">N</div>
          <h2 className="mt-6 text-center text-3xl font-semibold tracking-tight text-white">
            Sign in to NGAI
          </h2>
          <p className="mt-2 text-center text-sm text-neutral-400">
            Welcome back to the provider abstraction layer.
          </p>
        </motion.div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-neutral-900 py-8 px-4 shadow sm:rounded-xl sm:px-10 border border-neutral-800"
        >
          <button
            onClick={handleLogin}
            className="w-full flex justify-center py-2.5 px-4 rounded-md shadow-sm text-sm font-medium text-neutral-950 bg-white hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500 focus:ring-offset-neutral-900 transition-colors"
          >
            Continue with Google
          </button>
        </motion.div>
      </div>
    </div>
  );
}
