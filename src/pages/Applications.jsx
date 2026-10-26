import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';
import { STATUS, fmtDate } from '../constants.js';

const empty = { company: '', position: '', status: 'ingin_dilamar', applied_date: '', job_url: '', notes: '' };

export default function Applications() {
  const [rows, setRows] = useState([]);
  const [flt, setFlt] = useState({ q: '', status: '', from: '', to: '' });
  const [form, setForm] = useState(null); // null = tertutup
  const [err, setErr] = useState('');

  const load = useCallback(() => {
    const qs = new URLSearchParams(Object.entries(flt).filter(([, v]) => v)).toString();
    api(`/applications${qs ? `?${qs}` : ''}`).then(setRows).catch((e) => setErr(e.message));
  }, [flt]);
  useEffect(() => { load(); }, [load]);

  const save = async (e) => {
    e.preventDefault(); setErr('');
    try {
      const body = { ...form };
      form.id ? await api(`/applications/${form.id}`, { method: 'PUT', body }) : await api('/applications', { method: 'POST', body });
      setForm(null); load();
    } catch (x) { setErr(x.message); }
  };
  const remove = async (r) => {
    if (!window.confirm(`Hapus lamaran ${r.company} - ${r.position}?`)) return;
    try { await api(`/applications/${r.id}`, { method: 'DELETE' }); load(); } catch (x) { setErr(x.message); }
  };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const setF = (k) => (e) => setFlt({ ...flt, [k]: e.target.value });

  return (
    <>
      <div className="row between">
        <h1>Lamaran</h1>
        <button className="btn" onClick={() => { setErr(''); setForm({ ...empty }); }}>+ Tambah lamaran</button>
      </div>
      {err && <p className="error" role="alert">{err}</p>}

      {form && (
        <form className="card" onSubmit={save} aria-label="Formulir lamaran">
          <h2>{form.id ? 'Edit lamaran' : 'Lamaran baru'}</h2>
          <div className="cols">
            <div><label htmlFor="company">Perusahaan</label><input id="company" required value={form.company} onChange={set('company')} /></div>
            <div><label htmlFor="position">Posisi</label><input id="position" required value={form.position} onChange={set('position')} /></div>
            <div><label htmlFor="status">Status</label>
              <select id="status" value={form.status} onChange={set('status')}>
                {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select></div>
            <div><label htmlFor="applied_date">Tanggal melamar</label><input id="applied_date" type="date" value={form.applied_date || ''} onChange={set('applied_date')} /></div>
          </div>
          <label htmlFor="job_url">Tautan lowongan</label>
          <input id="job_url" type="url" placeholder="https://" value={form.job_url || ''} onChange={set('job_url')} />
          <label htmlFor="notes">Catatan</label>
          <textarea id="notes" rows="2" value={form.notes || ''} onChange={set('notes')} />
          <div className="row">
            <button className="btn" type="submit">Simpan</button>
            <button className="btn ghost" type="button" onClick={() => setForm(null)}>Batal</button>
          </div>
        </form>
      )}

      <form className="card cols" role="search" aria-label="Cari dan filter lamaran" onSubmit={(e) => e.preventDefault()}>
        <div><label htmlFor="q">Cari perusahaan / posisi</label><input id="q" type="search" value={flt.q} onChange={setF('q')} /></div>
        <div><label htmlFor="fs">Status</label>
          <select id="fs" value={flt.status} onChange={setF('status')}>
            <option value="">Semua</option>
            {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select></div>
        <div><label htmlFor="from">Dari tanggal</label><input id="from" type="date" value={flt.from} onChange={setF('from')} /></div>
        <div><label htmlFor="to">Sampai tanggal</label><input id="to" type="date" value={flt.to} onChange={setF('to')} /></div>
      </form>

      <div className="card scroll">
        <table>
          <caption className="sr-only">Daftar lamaran magang</caption>
          <thead><tr><th scope="col">Perusahaan</th><th scope="col">Posisi</th><th scope="col">Status</th><th scope="col">Tgl melamar</th><th scope="col">Aksi</th></tr></thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan="5" className="muted">Tidak ada data.</td></tr>}
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.job_url ? <a href={r.job_url} target="_blank" rel="noreferrer">{r.company}</a> : r.company}</td>
                <td>{r.position}</td>
                <td><span className={`badge s-${r.status}`}>{STATUS[r.status]}</span></td>
                <td>{fmtDate(r.applied_date)}</td>
                <td className="row">
                  <button className="btn small" onClick={() => { setErr(''); setForm(r); }} aria-label={`Edit ${r.company}`}>Edit</button>
                  <button className="btn small danger" onClick={() => remove(r)} aria-label={`Hapus ${r.company}`}>Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
