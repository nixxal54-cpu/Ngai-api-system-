import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase/client';

import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { ApiKeys } from './pages/ApiKeys';
import { Playground } from './pages/Playground';
import { Usage } from './pages/Usage';
import { Settings } from './pages/Settings';
import { Docs } from './pages/Docs';
import { NotFound } from './pages/NotFound';
import { AuthPage } from './pages/AuthPage';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-gray-950 text-white font-mono">Initializing NGAI Core...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
        <Route path="/auth" element={user ? <Navigate to="/dashboard" /> : <AuthPage />} />
        
        <Route element={<ProtectedRoute user={user}><Layout user={user} /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard user={user} />} />
          <Route path="/keys" element={<ApiKeys user={user} />} />
          <Route path="/playground" element={<Playground user={user} />} />
          <Route path="/usage" element={<Usage user={user} />} />
          <Route path="/settings" element={<Settings user={user} />} />
          <Route path="/docs" element={<Docs />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
