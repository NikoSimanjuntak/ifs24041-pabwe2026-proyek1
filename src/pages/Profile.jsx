import { useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user.name);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const save = async (e) => {
    e.preventDefault();
    setMsg('');
    setErr('');
    try {
      setUser(await api('/auth/me', { method: 'PUT', body: { name } }));
      setMsg('Profil berhasil disimpan');
    } catch (error_) {
      setErr(error_.message);
    }
  };
  return (
    <>
      <h1>Profil</h1>
      <form className="card auth-inline" onSubmit={save}>
        <label htmlFor="email">Email</label>
        <input id="email" value={user.email} disabled />
        <label htmlFor="name">Nama</label>
        <input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
        {err && <p className="error" role="alert">{err}</p>}
        {msg && <output className="ok">{msg}</output>}
        <button className="btn" type="submit">Simpan</button>
      </form>
    </>
  );
}