import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(root, 'dist');
const PORT = Number(process.env.PORT || process.env.APP_PORT || 3000);

// Jika hasil build belum ada, build dulu
if (!fs.existsSync(path.join(dist, 'index.html'))) {
  console.log('Folder dist belum ada, menjalankan build...');
  const r = spawnSync('bun x vite build || npx vite build', { cwd: root, stdio: 'inherit', shell: true });
  if (r.status !== 0) {
    console.error('Build gagal');
    process.exit(1);
  }
}

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.txt': 'text/plain',
};

http
  .createServer((req, res) => {
    let urlPath = '/';
    try { urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); } catch { /* pakai '/' */ }
    let file = path.join(dist, path.normalize(urlPath));
    if (!file.startsWith(dist)) { res.writeHead(403); res.end(); return; }
    // Semua path yang bukan file diarahkan ke index.html (SPA fallback)
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(dist, 'index.html');
    const headers = { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' };
    if (file.includes(`${path.sep}assets${path.sep}`)) headers['Cache-Control'] = 'public, max-age=31536000, immutable';
    res.writeHead(200, headers);
    fs.createReadStream(file).pipe(res);
  })
  .listen(PORT, '0.0.0.0', () => console.log(`InternTrack frontend berjalan di port ${PORT}`));