# GeprekPos: Sistem Kasir Warung Ayam Geprek

GeprekPos adalah aplikasi *Point of Sales* (POS) modern berbasis web yang dibangun menggunakan **React**, **TypeScript**, **Vite**, dan **Tailwind CSS**. Aplikasi ini dirancang khusus untuk memenuhi kebutuhan operasional warung makan, spesifiknya warung ayam geprek dan penyetan.

## Fitur Aplikasi

Aplikasi ini mencakup beberapa fitur inti (Core Features) untuk operasional kasir:

1.  **Pemesanan & Keranjang (Dashboard/Kasir):**
    *   Sistem Point of Sales pintar terintegrasi dengan filter kategori menu.
    *   Perhitungan harga total otomatis dan manajemen jumlah pesanan dalam keranjang belanja.
    *   Dilengkapi peringatan stok "Habis" jika persediaan kosong.
2.  **Pembayaran (Checkout):**
    *   Sistem pembayaran membedakan antara Uang Tunai (Cash) dan QRIS.
    *   Jika membayar Tunai, akan muncul kalkulator kembalian otomatis di layar.
    *   Konfirmasi pembayaran akan langsung mencatat *(record)* transaksi dan memotong stok.
3.  **Manajemen Stok (Inventory):**
    *   Melihat daftar seluruh menu beserta sisa stok bahan baku.
    *   Pemilik (Admin) dapat menambah (`Create`), mengedit harga/stok (`Update`), dan menghapus (`Delete`) menu yang ada.
4.  **Laporan Transaksi:**
    *   Melihat rekap / daftar pencatatan seluruh transaksi (Transaction History) yang berhasil.
    *   Memberikan ringkasan Pemasukan Total secara *real-time*.

## Dependensi yang Diperlukan

Proyek ini sangat ringan namun bertenaga, karena mengandalkan tumpukan pustaka (library) modern:

*   **Node.js**: Environment runtime.
*   **Vite**: *Build tool* dan local server yang sangat cepat (pengganti Create React App).
*   **React (v18+)**: Framework library utama untuk membuat UI.
*   **TypeScript**: Subset JavaScript yang memberikan keamanan tipe data (*type safety*).
*   **Tailwind CSS**: Framework styling berbasis *utility class*.
*   **Shadcn UI (Radix UI)**: Komponen Antarmuka pengguna (*User Interface*) yang sangat cantik dan aksesibel.
*   **React Router DOM**: Pustaka untuk mengatur perpindahan halaman (*routing*) aplikasi tanpa reload.
*   **Sonner**: Pustaka untuk memunculkan notifikasi/toast cantik di layar.
*   **Vitest & React Testing Library**: *Framework* dan perkakas pengujian (*Testing/Unit Test*) untuk memastikan fungsi logic dan komponen UI berjalan sempurna.

## Cara Menjalankan Aplikasi

Kamu bisa menjalankan / men-develop aplikasi ini baik menggunakan **npm** maupun **bun** (direkomendasikan karena lebih cepat).

### Prasyarat
Pastikan kamu sudah menginstal di komputermu:
- [Node.js](https://nodejs.org/) (Versi 18 ke atas)
- [Bun](https://bun.sh/) (Opsional, tapi sangat disarankan)

### Langkah Instalasi
1. Lakukan kloning direktori dari repositori ini ke komputer lokal-mu:
   ```sh
   git clone <URL_REPOSITORI>
   cd warung-ayam-geprek
   ```

2. Instal seluruh dependensi (libraries):
   **Jika menggunakan Bun (Rekomendasi):**
   ```sh
   bun install
   ```
   **Jika menggunakan NPM:**
   ```sh
   npm install
   ```
   *(Catatan: Jika mengalami kendala timeout atau sangat lama dengan NPM, bersihkan cache menggunakan `npm cache clean --force` atau beralih gunakan `bun install`)*.

### Menjalankan Server Development Lokal
Untuk melihat aplikasinya di web browser saat proses development, jalankan perintah:
```sh
npm run dev
# atau
bun run dev
```
Setelah jalan, buka **`http://localhost:5173`** atau **`http://localhost:8080`** (tergantung port lokal) di web browsermu (Google Chrome, Edge, Safari).

### Menjalankan Uji Coba (Unit Testing)
Aplikasi ini dilengkapi pengujian kualitas (*Unit testing*) otomatis pada folder `tests/`. Kamu bisa membuktikan keakuratannya dengan menjalankan:
```sh
npm run test
# atau
bun test
```
Seluruh komponen vital dari *Business Logic*, Pemesanan, Komponen Tombol, hingga Kartu akan dicek dan diverifikasi oleh sistem vitest.

---
*Dibuat untuk tugas mata kuliah Manajemen Sistem Perangkat Lunak - Lovable Project*
