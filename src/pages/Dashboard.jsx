import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { TYPE, fmtDateTime } from '../constants.js';

export default function Dashboard() {
  const [s, setS] = useState(null);
  const [up, setUp] = useState([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    Promise.all([api('/stats/summary'), api('/schedules?upcoming=1')])
      .then(([a, b]) => { setS(a); setUp(b.slice(0, 5)); })
      .catch((e) => setErr(e.message));
  }, []);

  if (err) return <><h1>Dashboard</h1><p className="error" role="alert">{err}</p></>;
  if (!s) return <><h1>Dashboard</h1><p role="status">Memuat…</p></>;
  const cards = [
    ['Total lamaran', s.total], ['Terkirim', s.byStatus.sudah_melamar], ['Wawancara', s.byStatus.wawancara],
    ['Diterima', s.byStatus.diterima], ['Ditolak', s.byStatus.ditolak],
  ];
  return (
    <>
      <h1>Dashboard</h1>
      <section aria-label="Ringkasan lamaran" className="grid">
        {cards.map(([l, n]) => (
          <div key={l} className="card stat"><span className="num">{n}</span><span>{l}</span></div>
        ))}
      </section>
      <section className="card">
        <h2>Jadwal terdekat</h2>
        {up.length === 0 ? <p className="muted">Belum ada jadwal. <Link to="/schedules">Tambah jadwal</Link></p> : (
          <ul className="list">
            {up.map((x) => (
              <li key={x.id}><strong>{x.title}</strong> <span className="badge">{TYPE[x.type]}</span><br />
                <span className="muted">{fmtDateTime(x.scheduled_at)}{x.company ? ` · ${x.company}` : ''}</span></li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
