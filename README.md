# API Server - Dashboard Eksekutif Putusan Terorisme Indonesia

Repository ini berisi kode sumber untuk backend API yang melayani data analitik bagi **Dashboard Eksekutif Putusan Terorisme Indonesia**. Server ini dibangun menggunakan Node.js dan Express untuk menyediakan data kluster geografis, statistik KPI, dan informasi terkait putusan terorisme.

## Teknologi Utama

- **Node.js**: Runtime JavaScript untuk server-side.
- **Express.js**: Framework web untuk membangun RESTful API.
- **CORS**: Middleware untuk mengaktifkan Cross-Origin Resource Sharing agar frontend (React) dapat mengakses API.
- **Nodemon** (Dev): Alat untuk me-restart server secara otomatis saat ada perubahan kode.

## Prerequisites

Sebelum menjalankan server, pastikan kamu telah menginstal:
- [Node.js](https://nodejs.org/) (Versi LTS disarankan)
- npm atau yarn

## Instalasi

1. Masuk ke direktori server:
   ```bash
   cd server
   ```

2. Instal semua dependensi yang diperlukan:
   ```bash
   npm install
   ```

## Menjalankan Server

### Mode Pengembangan
Jalankan server dengan auto-reload menggunakan nodemon:
```bash
npm run dev
```

### Mode Produksi
Jalankan server secara standar:
```bash
npm start
```
Server secara default akan berjalan di `http://localhost:5000`.

## Struktur API (Endpoints)

Saat ini, server menyediakan endpoint berikut:

- **GET `/api/clusters`**: Mengembalikan data kluster geografis (lat, lng, ideologi, total kasus) untuk ditampilkan pada peta interaktif di frontend.

## Struktur Proyek

```
server/
├── data/               # File JSON atau sumber data statis
├── routes/             # Definisi rute API
├── controllers/        # Logika bisnis dan pemrosesan data
├── node_modules/       # Dependensi proyek
├── index.js            # Entry point aplikasi
└── package.json        # Konfigurasi proyek dan script
```

## Lisensi
Proyek ini dilisensikan di bawah MIT License.