export const STATUS = {
  ingin_dilamar: 'Ingin dilamar',
  sudah_melamar: 'Sudah melamar',
  tes_seleksi: 'Tes seleksi',
  wawancara: 'Wawancara',
  diterima: 'Diterima',
  ditolak: 'Ditolak',
};
export const TYPE = { wawancara: 'Wawancara', tes: 'Tes', tenggat: 'Tenggat pendaftaran', tindak_lanjut: 'Tindak lanjut' };

export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-');
export const fmtDateTime = (d) =>
  new Date(d).toLocaleString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
export const fmtMonth = (m) => new Date(`${m}-01`).toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
