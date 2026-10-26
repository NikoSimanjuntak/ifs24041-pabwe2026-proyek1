import { describe, it, expect } from 'vitest';
import { STATUS, TYPE, fmtDate, fmtMonth, fmtDateTime } from './constants.js';

describe('constants', () => {
  it('memiliki enam status lamaran', () => {
    expect(Object.keys(STATUS)).toEqual(['ingin_dilamar', 'sudah_melamar', 'tes_seleksi', 'wawancara', 'diterima', 'ditolak']);
  });
  it('memiliki empat jenis jadwal', () => {
    expect(Object.keys(TYPE)).toHaveLength(4);
  });
  it('fmtDate mengembalikan "-" untuk nilai kosong', () => {
    expect(fmtDate(null)).toBe('-');
  });
  it('fmtDate dan fmtMonth memuat tahun', () => {
    expect(fmtDate('2026-09-10')).toContain('2026');
    expect(fmtMonth('2026-09')).toContain('26');
  });
  it('fmtDateTime menghasilkan teks', () => {
    expect(typeof fmtDateTime('2026-09-10T10:00')).toBe('string');
  });
});