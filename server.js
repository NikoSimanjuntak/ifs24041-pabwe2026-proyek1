import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const root = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(root, 'dist');
const indexFile = path.join(dist, 'index.html');

// Baca .env secara manual agar PORT dari server deploy pasti terbaca
try {
  for (const line of fs.readFileSync(path.join(root, '.env'), 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
} catch { /* .env tidak ada, abaikan */ }

const PORT = Number(process.env.PORT || process.env.APP_PORT || 3000);

let buildError = '';
if (!fs.existsSync(indexFile)) {
  console.log('Folder dist belum ada, menjalankan build di latar belakang...');
  const viteBin = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');
  const child = spawn(process.execPath, [viteBin, 'build'], { cwd: root, stdio: 'inherit' });
  child.on('error', (e) => { buildError = `Build gagal: ${e.message}`; console.error(buildError); });
  child.on('exit', (code) => {
    if (code === 0) console.log('Build selesai.');
    else { buildError = `Build gagal (kode ${code})`; console.error(buildError); }
  });
}

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.txt': 'text/plain',
};

http
  .createServer((req, res) => {
    if (!fs.existsSync(indexFile)) {
      res.writeHead(buildError ? 500 : 503, { 'Content-Type': 'text/plain; charset=utf-8', 'Retry-After': '10' });
      res.end(buildError || 'Aplikasi sedang disiapkan, coba lagi beberapa saat.');
      return;
    }
    let urlPath = '/';
    try { urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); } catch { /* pakai '/' */ }
    let file = path.join(dist, path.normalize(urlPath));
    if (!file.startsWith(dist)) { res.writeHead(403); res.end(); return; }
    // Semua path yang bukan file diarahkan ke index.html (fallback SPA)
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = indexFile;
    const headers = { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' };
    if (file.includes(`${path.sep}assets${path.sep}`)) headers['Cache-Control'] = 'public, max-age=31536000, immutable';
    res.writeHead(200, headers);
    fs.createReadStream(file).pipe(res);
  })
  .listen(PORT, '0.0.0.0', () => console.log(`InternTrack frontend berjalan di port ${PORT}`));