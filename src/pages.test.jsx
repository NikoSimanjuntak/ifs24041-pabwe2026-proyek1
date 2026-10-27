import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './auth.jsx';

const data = {
  '/auth/me': { id: 1, name: 'Demo', email: 'demo@intertrack.id' },
  '/stats/summary': {
    total: 3, applied: 2, interviewRate: 50,
    byStatus: { ingin_dilamar: 1, sudah_melamar: 1, tes_seleksi: 0, wawancara: 1, diterima: 0, ditolak: 0 },
  },
  '/stats/monthly': [{ month: '2026-09', total: 2, interview: 1 }],
  '/applications': [
    { id: 1, company: 'Acme', position: 'Intern', status: 'wawancara', applied_date: '2026-09-01', job_url: 'https://a.com' },
  ],
  '/schedules': [
    { id: 1, type: 'wawancara', title: 'Interview Acme', scheduled_at: '2030-01-01T10:00', company: 'Acme', done: 0 },
  ],
};

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>
  );

describe('halaman terproteksi', () => {
  beforeEach(() => {
    localStorage.setItem('token', 't');
    vi.stubGlobal('fetch', vi.fn(async (url) => {
      const path = url.replace(/^.*\/api/, '').split('?')[0];
      return { ok: true, status: 200, json: async () => data[path] ?? [] };
    }));
  });

  it('dashboard menampilkan ringkasan dan jadwal terdekat', async () => {
    renderAt('/dashboard');
    expect(await screen.findByText('Total lamaran')).toBeTruthy();
    expect(await screen.findByText('Jadwal terdekat')).toBeTruthy();
  });

  it('halaman lamaran menampilkan data dan membuka formulir', async () => {
    renderAt('/applications');
    expect(await screen.findByText('Acme')).toBeTruthy();
    fireEvent.click(screen.getByText('+ Tambah lamaran'));
    expect(await screen.findByText('Lamaran baru')).toBeTruthy();
  });

  it('halaman jadwal menampilkan daftar jadwal', async () => {
    renderAt('/schedules');
    expect(await screen.findByText('Interview Acme')).toBeTruthy();
  });

  it('halaman statistik menampilkan rasio wawancara', async () => {
    renderAt('/statistics');
    expect(await screen.findByText('50%')).toBeTruthy();
  });

  it('halaman profil menampilkan nama pengguna', async () => {
    renderAt('/profile');
    expect(await screen.findByDisplayValue('Demo')).toBeTruthy();
  });
});