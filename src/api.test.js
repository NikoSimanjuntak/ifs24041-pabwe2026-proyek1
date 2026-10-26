import { describe, it, expect, beforeEach, vi } from 'vitest';
import { api } from './api.js';

const resp = (status, body) => ({ ok: status < 400, status, json: async () => body });

describe('api()', () => {
  beforeEach(() => { localStorage.clear(); vi.unstubAllGlobals(); });

  it('mengirim token dan body JSON', async () => {
    localStorage.setItem('token', 'abc');
    const f = vi.fn().mockResolvedValue(resp(200, { a: 1 }));
    vi.stubGlobal('fetch', f);
    const r = await api('/x', { method: 'POST', body: { b: 2 } });
    expect(r).toEqual({ a: 1 });
    const [url, opt] = f.mock.calls[0];
    expect(url.endsWith('/api/x')).toBe(true);
    expect(opt.headers.Authorization).toBe('Bearer abc');
    expect(opt.body).toBe(JSON.stringify({ b: 2 }));
  });

  it('mengembalikan null untuk status 204', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(resp(204, null)));
    expect(await api('/x', { method: 'DELETE' })).toBeNull();
  });

  it('melempar pesan dari server saat error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(resp(400, { message: 'Salah' })));
    await expect(api('/x')).rejects.toThrow('Salah');
  });

  it('menghapus token saat 401', async () => {
    localStorage.setItem('token', 'abc');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(resp(401, { message: 'Tidak terautentikasi' })));
    await expect(api('/x')).rejects.toThrow();
    expect(localStorage.getItem('token')).toBeNull();
  });
});