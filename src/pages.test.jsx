import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './auth.jsx';

const user = { id: 1, name: 'Demo', email: 'demo@intertrack.id' };
const summary = {
  total: 3, applied: 2, interviewRate: 50,
  byStatus: { ingin_dilamar: 1, sudah_melamar: 1, tes_seleksi: 0, wawancara: 1, diterima: 0, ditolak: 0 },
};
const monthly = [{ month: '2026-09', total: 2, interview: 1 }];
const apps = [
  { id: 1, company: 'Acme', position: 'Intern', status: 'wawancara', applied_date: '2026-09-01', job_url: 'https://a.com', notes: '' },
];
const schedules = [
  { id: 1, type: 'wawancara', title: 'Interview Acme', scheduled_at: '2030-01-01T10:00', company: 'Acme', done: 0 },
];

const ok = (body, status = 200) => ({ ok: status < 400, status, json: async () => body });

function mockApi(over = {}) {
  const calls = [];
  const routes = {
    'GET /auth/me': () => ok(user),
    'PUT /auth/me': (b) => ok({ ...user, name: b.name }),
    'POST /auth/login': () => ok({ token: 't', user }),
    'POST /auth/register': () => ok({ token: 't', user }, 201),
    'GET /stats/summary': () => ok(summary),
    'GET /stats/monthly': () => ok(monthly),
    'GET /applications': () => ok(apps),
    'POST /applications': () => ok({ ...apps[0], id: 2 }, 201),
    'PUT /applications/1': () => ok(apps[0]),
    'DELETE /applications/1': () => ok(null, 204),
    'GET /schedules': () => ok(schedules),
    'POST /schedules': () => ok(schedules[0], 201),
    'PUT /schedules/1': () => ok(schedules[0]),
    'DELETE /schedules/1': () => ok(null, 204),
    ...over,
  };
  vi.stubGlobal('fetch', vi.fn(async (url, opt = {}) => {
    const method = opt.method || 'GET';
    const path = url.replace(/^.*\/api/, '');
    const body = opt.body ? JSON.parse(opt.body) : null;
    calls.push({ method, path, body });
    const handler = routes[`${method} ${path.split('?')[0]}`];
    return handler ? handler(body) : ok({ message: 'Tidak ditemukan' }, 404);
  }));
  return calls;
}

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>
  );

const typeInto = (container, selector, value) =>
  fireEvent.change(container.querySelector(selector), { target: { value } });
const h1 = (name) => screen.findByRole('heading', { level: 1, name });
const loggedIn = () => localStorage.setItem('token', 't');

beforeEach(() => {
  localStorage.clear();
  vi.unstubAllGlobals();
});

describe('autentikasi', () => {
  it('login berhasil membuka dashboard', async () => {
    mockApi();
    const { container } = renderAt('/auth/login');
    typeInto(container, '#username', 'demo@intertrack.id');
    typeInto(container, '#password', 'demo12345');
    fireEvent.click(container.querySelector('#btn-submit'));
    expect(await h1('Dashboard')).toBeTruthy();
    expect(localStorage.getItem('token')).toBe('t');
  });

  it('login gagal menampilkan pesan error', async () => {
    mockApi({ 'POST /auth/login': () => ok({ message: 'Email atau password salah' }, 401) });
    const { container } = renderAt('/auth/login');
    typeInto(container, '#username', 'demo@intertrack.id');
    typeInto(container, '#password', 'salahsalah');
    fireEvent.click(container.querySelector('#btn-submit'));
    expect((await screen.findByRole('alert')).textContent).toContain('Email atau password salah');
  });

  it('register berhasil membuka dashboard', async () => {
    mockApi();
    const { container } = renderAt('/auth/register');
    typeInto(container, '#name', 'Demo');
    typeInto(container, '#email', 'demo@intertrack.id');
    typeInto(container, '#password', 'demo12345');
    fireEvent.click(container.querySelector('#btn-submit'));
    expect(await h1('Dashboard')).toBeTruthy();
  });

  it('register gagal menampilkan pesan error', async () => {
    mockApi({ 'POST /auth/register': () => ok({ message: 'Email sudah terdaftar' }, 409) });
    const { container } = renderAt('/auth/register');
    typeInto(container, '#name', 'Demo');
    typeInto(container, '#email', 'demo@intertrack.id');
    typeInto(container, '#password', 'demo12345');
    fireEvent.click(container.querySelector('#btn-submit'));
    expect((await screen.findByRole('alert')).textContent).toContain('Email sudah terdaftar');
  });

  it('halaman login/register mengarahkan pengguna yang sudah masuk ke dashboard', async () => {
    loggedIn();
    mockApi();
    renderAt('/auth/login');
    expect(await h1('Dashboard')).toBeTruthy();
  });

  it('logout kembali ke halaman login', async () => {
    loggedIn();
    mockApi();
    renderAt('/dashboard');
    await h1('Dashboard');
    fireEvent.click(screen.getByRole('button', { name: 'Keluar' }));
    expect(await h1('Masuk ke InternTrack')).toBeTruthy();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('token kedaluwarsa (401) mengarahkan ke login', async () => {
    loggedIn();
    mockApi({ 'GET /auth/me': () => ok({ message: 'Tidak terautentikasi' }, 401) });
    renderAt('/dashboard');
    expect(await h1('Masuk ke InternTrack')).toBeTruthy();
  });

  it('path tidak dikenal diarahkan ke dashboard', async () => {
    loggedIn();
    mockApi();
    renderAt('/tidak-ada');
    expect(await h1('Dashboard')).toBeTruthy();
  });
});

describe('dashboard', () => {
  beforeEach(() => loggedIn());

  it('menampilkan ringkasan dan jadwal terdekat', async () => {
    mockApi();
    renderAt('/dashboard');
    expect(await screen.findByText('Total lamaran')).toBeTruthy();
    expect(await screen.findByText('Interview Acme')).toBeTruthy();
  });

  it('menampilkan pesan saat belum ada jadwal', async () => {
    mockApi({ 'GET /schedules': () => ok([]) });
    renderAt('/dashboard');
    expect(await screen.findByText(/Belum ada jadwal/)).toBeTruthy();
  });

  it('menampilkan error saat API gagal', async () => {
    mockApi({ 'GET /stats/summary': () => ok({ message: 'Gagal memuat' }, 500) });
    renderAt('/dashboard');
    expect((await screen.findByRole('alert')).textContent).toContain('Gagal memuat');
  });
});

describe('lamaran', () => {
  beforeEach(() => loggedIn());

  it('menampilkan daftar lamaran', async () => {
    mockApi();
    renderAt('/applications');
    expect(await screen.findByText('Acme')).toBeTruthy();
    expect(screen.getByText('Wawancara', { selector: 'span.badge' })).toBeTruthy();
  });

  it('menampilkan baris kosong saat tidak ada data', async () => {
    mockApi({ 'GET /applications': () => ok([]) });
    renderAt('/applications');
    expect(await screen.findByText('Tidak ada data.')).toBeTruthy();
  });

  it('menambah lamaran baru', async () => {
    const calls = mockApi();
    const { container } = renderAt('/applications');
    await screen.findByText('Acme');
    fireEvent.click(screen.getByText('+ Tambah lamaran'));
    expect(await screen.findByText('Lamaran baru')).toBeTruthy();
    typeInto(container, '#company', 'Beta');
    typeInto(container, '#position', 'Dev');
    typeInto(container, '#status', 'sudah_melamar');
    typeInto(container, '#applied_date', '2026-10-01');
    typeInto(container, '#job_url', 'https://beta.com');
    typeInto(container, '#notes', 'catatan');
    fireEvent.click(screen.getByRole('button', { name: 'Simpan' }));
    await waitFor(() => expect(calls.some((c) => c.method === 'POST' && c.path === '/applications')).toBe(true));
    const post = calls.find((c) => c.method === 'POST' && c.path === '/applications');
    expect(post.body.company).toBe('Beta');
    await waitFor(() => expect(screen.queryByText('Lamaran baru')).toBeNull());
  });

  it('mengubah lamaran', async () => {
    const calls = mockApi();
    const { container } = renderAt('/applications');
    fireEvent.click(await screen.findByLabelText('Edit Acme'));
    expect(await screen.findByText('Edit lamaran')).toBeTruthy();
    expect(container.querySelector('#company').value).toBe('Acme');
    typeInto(container, '#company', 'Acme Corp');
    fireEvent.click(screen.getByRole('button', { name: 'Simpan' }));
    await waitFor(() => expect(calls.some((c) => c.method === 'PUT' && c.path === '/applications/1')).toBe(true));
    expect(calls.find((c) => c.method === 'PUT').body.company).toBe('Acme Corp');
  });

  it('membatalkan formulir', async () => {
    mockApi();
    renderAt('/applications');
    await screen.findByText('Acme');
    fireEvent.click(screen.getByText('+ Tambah lamaran'));
    await screen.findByText('Lamaran baru');
    fireEvent.click(screen.getByRole('button', { name: 'Batal' }));
    await waitFor(() => expect(screen.queryByText('Lamaran baru')).toBeNull());
  });

  it('menampilkan error saat simpan gagal', async () => {
    mockApi({ 'POST /applications': () => ok({ message: 'Data tidak valid' }, 400) });
    const { container } = renderAt('/applications');
    await screen.findByText('Acme');
    fireEvent.click(screen.getByText('+ Tambah lamaran'));
    await screen.findByText('Lamaran baru');
    typeInto(container, '#company', 'Beta');
    typeInto(container, '#position', 'Dev');
    fireEvent.click(screen.getByRole('button', { name: 'Simpan' }));
    expect((await screen.findByRole('alert')).textContent).toContain('Data tidak valid');
  });

  it('menghapus lamaran setelah konfirmasi', async () => {
    const calls = mockApi();
    vi.stubGlobal('confirm', vi.fn(() => true));
    renderAt('/applications');
    fireEvent.click(await screen.findByLabelText('Hapus Acme'));
    await waitFor(() => expect(calls.some((c) => c.method === 'DELETE' && c.path === '/applications/1')).toBe(true));
  });

  it('tidak menghapus jika konfirmasi dibatalkan', async () => {
    const calls = mockApi();
    vi.stubGlobal('confirm', vi.fn(() => false));
    renderAt('/applications');
    fireEvent.click(await screen.findByLabelText('Hapus Acme'));
    expect(calls.some((c) => c.method === 'DELETE')).toBe(false);
  });

  it('mengirim filter pencarian ke API', async () => {
    const calls = mockApi();
    const { container } = renderAt('/applications');
    await screen.findByText('Acme');
    typeInto(container, '#q', 'acme');
    typeInto(container, '#fs', 'wawancara');
    typeInto(container, '#from', '2026-09-01');
    typeInto(container, '#to', '2026-09-30');
    await waitFor(() => {
      const last = calls.filter((c) => c.method === 'GET' && c.path.startsWith('/applications')).at(-1);
      expect(last.path).toContain('q=acme');
      expect(last.path).toContain('status=wawancara');
      expect(last.path).toContain('from=2026-09-01');
      expect(last.path).toContain('to=2026-09-30');
    });
  });
});

describe('jadwal', () => {
  beforeEach(() => loggedIn());

  it('menampilkan daftar jadwal', async () => {
    mockApi();
    renderAt('/schedules');
    expect(await screen.findByText('Interview Acme')).toBeTruthy();
  });

  it('menampilkan pesan saat kosong', async () => {
    mockApi({ 'GET /schedules': () => ok([]) });
    renderAt('/schedules');
    expect(await screen.findByText('Belum ada jadwal.')).toBeTruthy();
  });

  it('menambah jadwal', async () => {
    const calls = mockApi();
    const { container } = renderAt('/schedules');
    await screen.findByText('Interview Acme');
    typeInto(container, '#type', 'tes');
    typeInto(container, '#title', 'Tes coding');
    typeInto(container, '#when', '2030-02-01T09:00');
    typeInto(container, '#app', '1');
    fireEvent.click(screen.getByRole('button', { name: 'Tambah jadwal' }));
    await waitFor(() => expect(calls.some((c) => c.method === 'POST' && c.path === '/schedules')).toBe(true));
    expect(calls.find((c) => c.method === 'POST').body.title).toBe('Tes coding');
  });

  it('menampilkan error saat tambah jadwal gagal', async () => {
    mockApi({ 'POST /schedules': () => ok({ message: 'Gagal simpan' }, 400) });
    const { container } = renderAt('/schedules');
    await screen.findByText('Interview Acme');
    typeInto(container, '#title', 'Tes');
    typeInto(container, '#when', '2030-02-01T09:00');
    fireEvent.click(screen.getByRole('button', { name: 'Tambah jadwal' }));
    expect((await screen.findByRole('alert')).textContent).toContain('Gagal simpan');
  });

  it('menandai jadwal selesai', async () => {
    const calls = mockApi();
    renderAt('/schedules');
    fireEvent.click(await screen.findByRole('button', { name: 'Tandai selesai' }));
    await waitFor(() => expect(calls.some((c) => c.method === 'PUT' && c.path === '/schedules/1')).toBe(true));
    expect(calls.find((c) => c.method === 'PUT').body.done).toBe(true);
  });

  it('menghapus jadwal setelah konfirmasi', async () => {
    const calls = mockApi();
    vi.stubGlobal('confirm', vi.fn(() => true));
    renderAt('/schedules');
    fireEvent.click(await screen.findByLabelText('Hapus Interview Acme'));
    await waitFor(() => expect(calls.some((c) => c.method === 'DELETE' && c.path === '/schedules/1')).toBe(true));
  });

  it('tidak menghapus jadwal jika dibatalkan', async () => {
    const calls = mockApi();
    vi.stubGlobal('confirm', vi.fn(() => false));
    renderAt('/schedules');
    fireEvent.click(await screen.findByLabelText('Hapus Interview Acme'));
    expect(calls.some((c) => c.method === 'DELETE')).toBe(false);
  });
});

describe('statistik', () => {
  beforeEach(() => loggedIn());

  it('menampilkan rasio dan grafik', async () => {
    mockApi();
    renderAt('/statistics');
    expect(await screen.findByText('50%')).toBeTruthy();
    expect(screen.getByText(/Grafik batang/)).toBeTruthy();
    expect(screen.getByText('Distribusi status')).toBeTruthy();
  });

  it('menampilkan pesan saat data bulanan kosong', async () => {
    mockApi({ 'GET /stats/monthly': () => ok([]) });
    renderAt('/statistics');
    expect(await screen.findByText('Belum ada data.')).toBeTruthy();
  });

  it('menampilkan error saat API gagal', async () => {
    mockApi({ 'GET /stats/monthly': () => ok({ message: 'Statistik gagal' }, 500) });
    renderAt('/statistics');
    expect((await screen.findByRole('alert')).textContent).toContain('Statistik gagal');
  });
});

describe('profil', () => {
  beforeEach(() => loggedIn());

  it('menyimpan perubahan nama', async () => {
    const calls = mockApi();
    const { container } = renderAt('/profile');
    await h1('Profil');
    typeInto(container, '#name', 'Nama Baru');
    fireEvent.click(screen.getByRole('button', { name: 'Simpan' }));
    expect(await screen.findByText('Profil berhasil disimpan')).toBeTruthy();
    expect(calls.find((c) => c.method === 'PUT').body.name).toBe('Nama Baru');
  });

  it('menampilkan error saat simpan gagal', async () => {
    mockApi({ 'PUT /auth/me': () => ok({ message: 'Nama tidak valid' }, 400) });
    renderAt('/profile');
    await h1('Profil');
    fireEvent.click(screen.getByRole('button', { name: 'Simpan' }));
    expect((await screen.findByRole('alert')).textContent).toContain('Nama tidak valid');
  });
});