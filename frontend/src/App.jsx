import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import { Spinner } from './components/ui';
import Login from './pages/Login';
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Agent = lazy(() => import('./pages/Agent'));
const Leads = lazy(() => import('./pages/Leads'));
const Appointments = lazy(() => import('./pages/Appointments'));
const Knowledge = lazy(() => import('./pages/Knowledge'));
const Conversations = lazy(() => import('./pages/Conversations'));
const CallIntelligence = lazy(() => import('./pages/CallIntelligence'));
const Settings = lazy(() => import('./pages/Settings'));
const Traces = lazy(() => import('./pages/Traces'));

export default function App() {
  const { user, checking } = useAuth();
  if (checking) return <Spinner label="Restoring session…" />;
  if (!user) return <Routes><Route path="*" element={<Login />} /></Routes>;
  return (
    <Routes>
      <Route element={<Suspense fallback={<Spinner />}><Layout /></Suspense>}>
        <Route index element={<Dashboard />} />
        <Route path="agent" element={<Agent />} />
        <Route path="leads" element={<Leads />} />
        <Route path="leads/:id" element={<Leads />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="knowledge" element={<Knowledge />} />
        <Route path="conversations" element={<Conversations />} />
        <Route path="conversations/:id" element={<Conversations />} />
        <Route path="intelligence" element={<CallIntelligence />} />
        <Route path="analytics" element={<Navigate to="/intelligence" replace />} />
        <Route path="settings" element={<Settings />} />
        <Route path="traces" element={<Traces />} />
        <Route path="traces/:id" element={<Traces />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
