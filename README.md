# InternTrack - Frontend

ReactJS (Vite + React Router). Membutuhkan backend InternTrack yang berjalan.

## Menjalankan (development)
```bash
git clone <URL-REPO-FRONTEND> && cd <folder>
npm install
npm run dev      # http://localhost:5173 (request /api diteruskan ke http://localhost:3000)
```
Akun demo (setelah `npm run seed` di backend): `demo@intertrack.id` / `demo12345`

## Build & deploy
```bash
VITE_API_URL=https://URL-BACKEND-ANDA npm run build   # hasil di dist/
docker build --build-arg VITE_API_URL=https://URL-BACKEND-ANDA -t intertrack-web .
```
Untuk hosting statis (Netlify/Vercel/Render), set `VITE_API_URL` dan aktifkan fallback SPA ke `index.html`.

## Halaman
Publik: `/auth/login`, `/auth/register` · Terproteksi: `/dashboard`, `/applications`, `/schedules`, `/statistics`, `/profile`
