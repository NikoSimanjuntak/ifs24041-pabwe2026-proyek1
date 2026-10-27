import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { STATUS, fmtMonth } from '../constants.js';

export default function Statistics() {
  const [m, setM] = useState(null);
  const [s, setS] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    Promise.all([api('/stats/monthly'), api('/stats/summary')]).then(([a, b]) => { setM(a); setS(b); }).catch((e) => setErr(e.message));
  }, []);
  if (err) return <><h1>Statistik perkembangan</h1><p className="error" role="alert">{err}</p></>;
  if (!m) return <><h1>Statistik perkembangan</h1><output>Memuat…</output></>;
  const max = Math.max(1, ...m.map((x) => x.total));
  const description = m
    .map((x) => `${fmtMonth(x.month)}: ${x.total} lamaran, ${x.interview} wawancara`)
    .join('; ');

  return (
    <>
      <h1>Statistik perkembangan</h1>
      <section className="card">
        <h2>Rasio lamaran ke wawancara</h2>
        <p className="big">{s.interviewRate}%</p>
        <p className="muted">Dari {s.applied} lamaran yang sudah dikirim, {s.byStatus.wawancara + s.byStatus.diterima} berlanjut ke wawancara atau diterima.</p>
      </section>

      <section className="card">
        <h2>Lamaran per bulan</h2>
        {m.length === 0 ? <p className="muted">Belum ada data.</p> : (
          <>
            <figure className="chart-figure">
              <figcaption className="sr-only">Grafik batang jumlah lamaran per bulan. {description}</figcaption>
              <div className="chart" aria-hidden="true">
                {m.map((x) => (
                  <div key={x.month} className="col">
                    <div className="bars">
                      <div className="bar total" style={{ height: `${(x.total / max) * 100}%` }}><span>{x.total}</span></div>
                      <div className="bar iv" style={{ height: `${(x.interview / max) * 100}%` }}><span>{x.interview}</span></div>
                    </div>
                    <small>{fmtMonth(x.month)}</small>
                  </div>
                ))}
              </div>
            </figure>
            <p className="legend"><span className="dot total" /> Lamaran terkirim <span className="dot iv" /> Lanjut wawancara</p>
          </>
        )}
      </section>

      <section className="card">
        <h2>Distribusi status</h2>
        <ul className="list">
          {Object.entries(STATUS).map(([k, v]) => <li key={k} className="row between"><span>{v}</span><strong>{s.byStatus[k]}</strong></li>)}
        </ul>
      </section>
    </>
  );
}