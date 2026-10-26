import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';
import { TYPE, fmtDateTime } from '../constants.js';

const empty = { type: 'wawancara', title: '', scheduled_at: '', application_id: '', notes: '' };

export default function Schedules() {
  const [rows, setRows] = useState([]);
  const [apps, setApps] = useState([]);
  const [form, setForm] = useState(empty);
  const [err, setErr] = useState('');

  const load = useCallback(() => {
    api('/schedules').then(setRows).catch((e) => setErr(e.message));
  }, []);
  useEffect(() => { load(); api('/applications').then(setApps).catch(() => {}); }, [load]);

  const save = async (e) => {
    e.preventDefault(); setErr('');
    try { await api('/schedules', { method: 'POST', body: form }); setForm(empty); load(); } catch (x) { setErr(x.message); }
  };
  const toggle = async (r) => {
    try { await api(`/schedules/${r.id}`, { method: 'PUT', body: { ...r, done: !r.done } }); load(); } catch (x) { setErr(x.message); }
  };
  const remove = async (r) => {
    if (!window.confirm(`Hapus jadwal "${r.title}"?`)) return;
    try { await api(`/schedules/${r.id}`, { method: 'DELETE' }); load(); } catch (x) { setErr(x.message); }
  };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <>
      <h1>Jadwal &amp; pengingat</h1>
      {err && <p className="error" role="alert">{err}</p>}
      <form className="card" onSubmit={save} aria-label="Tambah jadwal">
        <div className="cols">
          <div><label htmlFor="type">Jenis</label>
            <select id="type" value={form.type} onChange={set('type')}>
              {Object.entries(TYPE).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select></div>
          <div><label htmlFor="title">Judul</label><input id="title" required value={form.title} onChange={set('title')} /></div>
          <div><label htmlFor="when">Waktu</label><input id="when" type="datetime-local" required value={form.scheduled_at} onChange={set('scheduled_at')} /></div>
          <div><label htmlFor="app">Lamaran terkait</label>
            <select id="app" value={form.application_id} onChange={set('application_id')}>
              <option value="">(Tidak ada)</option>
              {apps.map((a) => <option key={a.id} value={a.id}>{a.company} - {a.position}</option>)}
            </select></div>
        </div>
        <button className="btn" type="submit">Tambah jadwal</button>
      </form>

      <section className="card">
        <h2>Semua jadwal</h2>
        {rows.length === 0 ? <p className="muted">Belum ada jadwal.</p> : (
          <ul className="list">
            {rows.map((r) => (
              <li key={r.id} className={r.done ? 'done' : ''}>
                <div className="row between">
                  <div>
                    <strong>{r.title}</strong> <span className="badge">{TYPE[r.type]}</span><br />
                    <span className="muted">{fmtDateTime(r.scheduled_at)}{r.company ? ` · ${r.company}` : ''}</span>
                  </div>
                  <div className="row">
                    <button className="btn small" onClick={() => toggle(r)}>{r.done ? 'Batal selesai' : 'Tandai selesai'}</button>
                    <button className="btn small danger" onClick={() => remove(r)} aria-label={`Hapus ${r.title}`}>Hapus</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
