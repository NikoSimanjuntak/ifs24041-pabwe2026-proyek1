import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

export default function Register() {
  const { user, register } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [err, setErr] = useState('');
  if (user) return <Navigate to="/dashboard" replace />;

  const submit = async (e) => {
    e.preventDefault();
    try { await register(f.name, f.email, f.password); nav('/dashboard'); } catch (x) { setErr(x.message); }
  };
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <main className="auth card">
      <h1>Daftar akun</h1>
      <form onSubmit={submit}>
        <label htmlFor="name">Nama lengkap</label>
        <input id="name" autoComplete="name" required value={f.name} onChange={set('name')} />
        <label htmlFor="email">Email</label>
        <input id="email" type="email" autoComplete="email" required value={f.email} onChange={set('email')} />
        <label htmlFor="password">Password (min. 8 karakter)</label>
        <input id="password" type="password" autoComplete="new-password" minLength={8} required value={f.password} onChange={set('password')} />
        {err && <p className="error" role="alert">{err}</p>}
        <button className="btn" type="submit">Daftar</button>
      </form>
      <p>Sudah punya akun? <Link to="/auth/login">Masuk</Link></p>
    </main>
  );
}
