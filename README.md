# GeprekPos: Sistem Kasir Terintegrasi untuk Warung Makan

GeprekPos adalah aplikasi *Point of Sales* (POS) modern berbasis web yang dikembangkan menggunakan teknologi **React**, **TypeScript**, **Vite**, dan **Tailwind CSS**. Sistem ini dirancang secara khusus untuk memfasilitasi kebutuhan operasional transaksi dan manajemen inventaris pada bisnis kuliner, dengan fokus pada warung makan ayam geprek dan penyetan.

## Fitur Utama Sistem

Aplikasi ini mencakup beberapa modul fungsional utama yang sangat esensial untuk operasional kasir:

1.  **Modul Pemesanan & Keranjang (Dashboard Kasir):**
    *   Sistem antarmuka kasir yang terintegrasi dengan fitur penyaringan (filter) kategori menu.
    *   Kalkulasi harga total secara otomatis dan manajemen kuantitas pesanan di dalam keranjang belanja.
    *   Sistem peringatan ketersediaan stok secara waktu nyata (*real-time*) apabila persediaan telah habis.
2.  **Modul Pembayaran (Checkout):**
    *   Sistem pemrosesan pembayaran yang mengakomodasi instrumen Uang Tunai (Cash) dan QRIS.
    *   Kalkulator kembalian otomatis yang terintegrasi untuk meminimalisasi kesalahan perhitungan (*human error*) pada transaksi tunai.
    *   Validasi penyelesaian transaksi yang secara langsung terintegrasi dengan pembaruan riwayat transaksi dan pengurangan jumlah stok akhir.
3.  **Manajemen Stok (Inventory Control):**
    *   Dasbor pemantauan ketersediaan daftar menu beserta sisa stok bahan baku.
    *   Fungsi penyesuaian (penambahan dan pengurangan) kuantitas stok secara presisi untuk setiap unit menu.
4.  **Laporan Transaksi:**
    *   Pencatatan riwayat transaksi (*Transaction History*) yang komprehensif.
    *   Penyajian ringkasan total pemasukan operasional secara komputasi *real-time*.

## Arsitektur dan Dependensi Sistem

Sistem ini dikembangkan melalui arsitektur yang ringan namun optimal, mengandalkan tumpukan teknologi modern:

*   **Node.js**: *Environment runtime* untuk eksekusi JavaScript di sisi komputer lokal maupun peladen (*server*).
*   **Vite**: Perkakas kompilasi (*Build tool*) dan server lokal dengan performa pemrosesan tinggi.
*   **React (v18+)**: Kerangka kerja (*Framework library*) utama untuk pengembangan antarmuka reaktif.
*   **TypeScript**: Superspesifikasi JavaScript yang menyediakan pengetikan statis (*static typing*) untuk meningkatkan keamanan dan presisi kode.
*   **Tailwind CSS**: *Framework* penataan tata letak (*styling*) berbasis utilitas komprehensif.
*   **Shadcn UI (Radix UI)**: Komponen antarmuka yang mengutamakan aksesibilitas tinggi dan konsistensi desain.
*   **React Router DOM**: Pustaka manajemen navigasi halaman (*routing*) pada arsitektur *Single Page Application* (SPA).
*   **Sonner**: Pustaka implementasi notifikasi sistem tertulis (*toast notifications*).
*   **Vitest & React Testing Library**: Kerangka kerja pengujian perangkat lunak (*Unit Testing*) otomatis untuk memastikan akurasi dan stabilitas *business logic* kode sumber.

## Panduan Instalasi dan Implementasi

Proses implementasi dan inisialisasi aplikasi ini dapat dieksekusi menggunakan manajer paket (*package manager*) **npm** maupun **bun** (direkomendasikan untuk efisiensi waktu kompilasi).

### Prasyarat Sistem
Pastikan lingkungan pengembangan pada perangkat telah terinstal komponen berikut:
- [Node.js](https://nodejs.org/) (Versi 18 atau pembaruan lebih lanjut)
- [Bun](https://bun.sh/) (Opsional, direkomendasikan secara teknis)

### Prosedur Instalasi
1. Lakukan instalasi repositori (*cloning*) ke dalam direktori lokal melalui *command line interface* (CLI):
   ```sh
   git clone <URL_REPOSITORI>
   cd warung-ayam-geprek
   ```

2. Jalankan instalasi seluruh dependensi perpustakaan fungsional sistem:
   **Menggunakan Bun (Direkomendasikan):**
   ```sh
   bun install
   ```
   **Menggunakan NPM:**
   ```sh
   npm install
   ```
   *(Catatan Teknis: Apabila terjadi kendala timeout pada NPM, proses instalasi dapat dibersihkan melalui perintah komputasi `npm cache clean --force`, atau dianjurkan untuk bermigrasi menggunakan `bun install`)*.

### Menjalankan Lingkungan Pengembangan (Local Development Server)
Untuk mengeksekusi aplikasi pada peramban web (*web browser*) selama fase pengembangan (*development/debugging*), jalankan perintah operasional berikut:
```sh
npm run dev
# atau
bun run dev
```
Setelah server lokal mendeteksi peluncuran yang berhasil, aplikasi dapat diakses publik melalui URL **`http://localhost:5173`** atau tautan port peramban standar komputasi lainnya.

### Eksekusi Pengujian Perangkat Lunak (Unit Testing)
Sistem ini telah dilengkapi dengan metode verifikasi fungsional (*Unit Testing*) otomatis yang terdokumentasi pada direktori `tests/`. Proses validasi dapat direplikasi melalui instruksi:
```sh
npm run test
# atau
bun test
```
Seluruh komponen komputasi fundamental—meliputi Algoritma Manajemen Data Kasir (*Context/Business Logic*), Modul Pemesanan, Pembayaran, hingga utilitas antarmuka—akan diverifikasi secara menyeluruh oleh mesin Vitest untuk menghindari terjadinya galat berkelanjutan.

---
*Dokumentasi komprehensif ini dikonstruksi untuk memenuhi standar spesifikasi tugas praktikum / mata kuliah Manajemen Sistem Perangkat Lunak - Lovable Project.*
