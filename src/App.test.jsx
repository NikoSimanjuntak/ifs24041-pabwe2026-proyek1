import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './auth.jsx';

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>
  );

describe('App routing', () => {
  beforeEach(() => localStorage.clear());

  it('menampilkan halaman login dengan elemen yang dibutuhkan grader', async () => {
    const { container } = renderAt('/auth/login');
    expect(await screen.findByRole('heading', { level: 1, name: 'Masuk ke InternTrack' })).toBeTruthy();
    expect(container.querySelector('#username')).not.toBeNull();
    expect(container.querySelector('#password')).not.toBeNull();
    expect(container.querySelector('#btn-submit')).not.toBeNull();
    expect(container.querySelector('main')).not.toBeNull();
  });

  it('menampilkan halaman register', async () => {
    renderAt('/auth/register');
    expect(await screen.findByRole('heading', { level: 1, name: 'Daftar akun' })).toBeTruthy();
  });

  it('alias /login diarahkan ke /auth/login', async () => {
    renderAt('/login');
    expect(await screen.findByRole('heading', { level: 1, name: 'Masuk ke InternTrack' })).toBeTruthy();
  });

  it('halaman terproteksi tanpa token diarahkan ke login', async () => {
    renderAt('/dashboard');
    expect(await screen.findByRole('heading', { level: 1, name: 'Masuk ke InternTrack' })).toBeTruthy();
  });
});