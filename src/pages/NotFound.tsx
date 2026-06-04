import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export function NotFound() {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-neutral-950 text-white font-sans selection:bg-neutral-800">
      <h1 className="text-9xl font-bold tracking-tighter text-neutral-800">404</h1>
      <h2 className="text-2xl font-medium tracking-tight mt-4">Page not found</h2>
      <p className="text-neutral-400 mt-2 max-w-md text-center">
        The route you are looking for does not exist in the NGAI abstraction layer.
      </p>
      <Link to="/" className="mt-8 flex items-center gap-2 px-4 py-2 bg-white text-neutral-950 rounded-md font-medium text-sm hover:bg-neutral-200 transition-colors">
        <Home className="size-4" /> Go Home
      </Link>
    </div>
  );
}
