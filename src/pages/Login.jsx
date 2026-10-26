import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

export default function Login() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  if (user) return <Navigate to="/dashboard" replace />;

  const submit = async (e) => {
    e.preventDefault();
    try { await login(f.email, f.password); nav('/dashboard'); } catch (x) { setErr(x.message); }
  };
  return (
    <main className="auth card">
      <h1>Masuk ke InternTrack</h1>
      <p className="muted">Kelola semua lamaran magangmu di satu tempat.</p>
      <form onSubmit={submit}>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" autoComplete="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <label htmlFor="password">Password</label>
        <input id="password" type="password" autoComplete="current-password" required value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
        {err && <p className="error" role="alert">{err}</p>}
        <button className="btn" type="submit">Masuk</button>
      </form>
      <p>Belum punya akun? <Link to="/auth/register">Daftar</Link></p>
    </main>
  );
}
