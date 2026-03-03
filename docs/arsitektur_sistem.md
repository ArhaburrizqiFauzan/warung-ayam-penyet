# Arsitektur Sistem GeprekPos

Dokumen ini menguraikan arsitektur sistem komputasi perangkat lunak GeprekPos, mencakup struktur direktori, mekanisme manajemen *state*, serta pola desain yang diimplementasikan dalam siklus pengembangan.

## 1. Struktur Direktori

Sistem ini dikembangkan menggunakan kerangka kerja React dengan pola struktur modular. Organisasi berkas diklasifikasikan berdasarkan fungsi spesifik (*separation of concerns*) untuk memfasilitasi skalabilitas dan kemudahan pemeliharaan (*maintainability*).

*   **`src/`**: Direktori utama kode sumber.
    *   **`components/`**: Memuat komponen-komponen antarmuka pengguna (UI) yang bersifat independen dan dapat digunakan kembali (*reusable*), seperti tombol (`Button`), kartu (`Card`), dan bilah navigasi (`AppSidebar`). Mayoritas komponen diadaptasi dari pustaka Shadcn UI.
    *   **`contexts/`**: Pusat pengelolaan data global (*global state management*). Berisi berkas logika utama seperti `AppContext.tsx` yang menangani aturan bisnis (*business logic*) dan aliran data inventaris serta transaksi.
    *   **`pages/`**: Memuat komponen level halaman (*page-level components*) yang merepresentasikan rute (URL) spesifik, di antaranya:
        *   `Pemesanan.tsx`: Antarmuka *Point of Sales* atau dasbor utama kasir.
        *   `Pembayaran.tsx`: Modul penyelesaian transaksi (*checkout*).
        *   `Stok.tsx`: Modul manajemen dan pemantauan inventaris.
        *   `Laporan.tsx`: Modul rekapitulasi histori transaksi.
*   **`tests/`**: Direktori yang didedikasikan untuk menyimpan skrip pengujian perangkat lunak (*unit testing*) menggunakan lingkungan Vitest dan React Testing Library.

## 2. Manajemen State (*State Management*)

Sistem tidak mengandalkan pustaka eksternal (seperti Redux atau Zustand) untuk manajemen *state*, melainkan mengimplementasikan **React Context API** (`src/contexts/AppContext.tsx`). Pemilihan ini didasarkan pada kompleksitas aplikasi yang masih dalam skala menengah, di mana Context API dinilai paling efisien untuk menghindari fenomena *prop drilling*.

### Skenario Aliran Data (Arus Pesanan):
1.  **Inisialisasi**: Variabel `menuItems` (daftar menu dan stok dasar) serta `currentOrder` (keranjang belanja yang masih kosong) diinisialisasi dalam `AppProvider`.
2.  **Agregasi Data**: Pada modul `Pemesanan.tsx`, fungsi `addToOrder` dipanggil ketika pengguna memasukkan item ke keranjang. Fungsi ini tidak hanya menambahkan objek ke dalam senarai (`array`) `currentOrder`, melainkan turut menggenerasi atribut `uniqueId`—sebuah kunci (*key*) unik yang dibentuk dari kombinasi ID Makanan, tingkat kepedasan, dan preferensi potongan ayam.
3.  **Sinkronisasi Global**: Begitu keranjang terisi, nilai total transaksi dan daftar pesanan secara instan dapat diakses dan divalidasi oleh layar navigasi dan pada laman modul `Pembayaran.tsx`, tanpa harus merender ulang instans UI secara non-paralel.

## 3. Pola Desain (*Design Pattern*)

Arsitektur aplikasi ini merepresentasikan implementasi dari pola desain utama berbasis komponen (*Component-Based Architecture*). Setiap faset visual dienkapsulasi menjadi komponen diskrit yang memiliki daur hidup (lifecycle) tersendiri. Pendekatan lain yang turut diaplikasikan meliputi:

*   **Pola Fungsi Pembungkus Konteks (*Context Provider Pattern*)**: Mengisolasi logika status global pada node hierarki tertinggi aplikasi (`<AppProvider>`) untuk memastikan ketersediaan fungsi komputasi *top-down* yang sinkron dengan seluruh komponen turunan (*children components*).
*   **Pola Modul Tunggal Terisolasi (*Single Responsibility Principle*)**: Tercermin secara fisik pada integrasi komponen pembantu modular. Sebagai metrik evaluasi: modul `Button.tsx` eksklusif difungsikan untuk menangani format visual interaksi klik tanpa diselingi komputasi keranjang belanja. Komputasi angka ditempatkan di *Context*, dan UI diserahkan pada komponen representasi level (*Presentational Components*).
