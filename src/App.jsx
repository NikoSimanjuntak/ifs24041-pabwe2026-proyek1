import { Navigate, NavLink, Outlet, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Applications from './pages/Applications.jsx';
import Schedules from './pages/Schedules.jsx';
import Statistics from './pages/Statistics.jsx';
import Profile from './pages/Profile.jsx';

function Layout() {
  const { user, loading, logout } = useAuth();
  if (loading) {
    return (
      <main className="container">
        <h1>InternTrack</h1>
        <output>Memuat…</output>
      </main>
    );
  }
  if (!user) return <Navigate to="/auth/login" replace />;
  const nav = [['/dashboard', 'Dashboard'], ['/applications', 'Lamaran'], ['/schedules', 'Jadwal'], ['/statistics', 'Statistik'], ['/profile', 'Profil']];
  return (
    <>
      <header className="topbar">
        <strong className="brand">InternTrack</strong>
        <nav aria-label="Navigasi utama">
          {nav.map(([to, label]) => <NavLink key={to} to={to}>{label}</NavLink>)}
        </nav>
        <button className="btn ghost" onClick={logout}>Keluar</button>
      </header>
      <main className="container"><Outlet /></main>
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/register" element={<Register />} />
      <Route path="/login" element={<Navigate to="/auth/login" replace />} />
      <Route path="/register" element={<Navigate to="/auth/register" replace />} />
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/schedules" element={<Schedules />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}