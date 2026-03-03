# Skenario Penggunaan Aplikasi Kasir (User Manual)

Dokumen fungsional ini diterbitkan untuk merincikan pedoman operasional aplikasi kasir GeprekPos, yang diselaraskan spesifik untuk digunakan oleh pihak pelaksana kasir (*End-User/Cashier*) maupun administrasi manajemen operasional. 

## Skenario 1. Pemilihan dan Pemesanan Menu Kasir

Prosedur berikut menjadi eskalasi dasar dari alur pencatatan pesanan di anjungan pelayanan.

1.  **Akses Dasbor Utama**
    Aplikasi dimuat dalam lingkungan peramban (*browser/POS terminal*). Laman akan mengarahkan pengguna pada posisi awal yaitu laman antarmuka "Pemesanan".
2.  **Identifikasi Spesifikasi Pesanan**
    Operator kasir memilah rincian berdasarkan interaksi langsung instruksi pelanggan:
    *   Fasilitas penelusuran kata kunci tersedia dalam kolom "Pencarian" (*Search Bar*) untuk alokasi menu yang spesifik.
    *   Tabulator penyaring seperti "Paket Ayam" ataupun "Minuman" difasilitasi guna menyederhanakan kategorisasi visual antarmuka.
3.  **Proses Inkripsi Pesanan Kustom (*Customizable Menu*)**
    Ketika operator kasir menyematkan item Ayam Penyet (sebagai menu utama), sistem akan menginstruksikan modul dialog interaktif:
    *   Tentukan nilai numerik Tingkat Kepedasan.
    *   Tentukan parameter porsi spesifikasi (Misal: preferensi pemilihan bagian potongan Paha atau Dada).
    *   Selesai disesuaikan, item diregistrasikan ke dalam instrumen Daftar Pesanan (Keranjang) yang berada pada panel sisi terminal.
4.  **Penyesuaian Keranjang**
    *   Ikon tambah (+) digunakan untuk peningkatan kuantitas (skalabilitas order gabungan).
    *   Ikon reduksi (-) atau hapus (tong sampah) dimanfaatkan bilamana terdapat modifikasi permohonan pesanan dari pihak klien kasir.

## Skenario 2. Proses Modul Checkout dan Pembayaran

Apabila formulasi pesanan yang berada pada modul keranjang telah final, operator pelaksana diwajibkan melakukan konfirmasi penutupan (*Checkout Phase*).

1.  **Migrasi Menu ke Halaman Pembayaran**
    Bila panel daftar pesanan (*Review Section*) dianggap sesuai, klik instrumen fungsi lanjutan menuju ranah "Pembayaran". Dasbor pembayaran meringkas ulang metrik Tagihan Total nominal akumulatif.
2.  **Pemilihan Klaster Metode Saldo (A: Tunai)**
    *   Tekan opsi berlabel ikon dompet fisik ("Tunai").
    *   Gunakan perangkat *input* untuk menaruh entri total lembar tagihan yang diserahkan pelanggan. Modul perhitungan mutlak (*absolute*) akan merender informasi "Kembalian".
    *   Selama nilai uang yang yang diregistrasikan lebih rendah dari kuantitas limit *Total Bayar*, operasi pelepasan sistem ditahan dan tombol resolusi dinonaktifkan.
3.  **Pemilihan Klaster Metode Saldo (B: Scan Digital/QRIS)**
    *   Tekan opsi kode referensi grafik berlabel ("QRIS").
    *   Layar visual memproyeksikan barcode matriks simulasi yang diperuntukkan bagi sistem pelunasan digital instan.
4.  **Konfirmasi Sirkulasi**
    Operator menglik tombol "Selesaikan Transaksi". Saat verifikasi sistem dinilai layak (*sukses*), aplikasi akan mencatat jejak rekapitulasi nilai ini, mengurangi nilai stok barang di basis data referensi internal, kemudian kembali memurnikan instrumen keranjang untuk pesanan konsumen yang baru. 

## Skenario 3. Manajemen Administrasi Stok Inventaris

Skema otorisasi pengendalian ketersediaan persediaan barang dagang, dikendalikan spesifik dalam halaman khusus "Stok".

1.  **Akses Laman Pengendalian**
    Memilih opsi navigasi label boks berlabel "Stok" (atau ikon Gudang) dalam sidebar lateral kiri aplikasi.
2.  **Modifikasi Volume Aktual Data**
    Operator mengecek secara presisi rasio statistik (Stok Saat Ini) dibanding jumlah persediaan *real*. 
    *   Untuk mencatat restock bahan mentah masuk, klik tombol fungsi penambahan (*Add/Tambah*) kemudian register bilangan persediaan absolut teranyar masuk.
    *   Untuk penyesuaian penyusutan barang abnormal di luar skema transaksi harian (cth: makanan basi/rusak), klik tombol penyusutan (*Reduce/Kurangi*). 
3.  **Verifikasi Atribut Otomasi Tagging**
    Operator hanya memantau dan mengklarfikasi *badges* yang diotomasi oleh sistem (*Normal/Hampir Habis/Habis*) berubah beriringan sesuai limit rasio penyumbangnya masing-masing.

---
*Catatan Panduan Operasional (*Operational Release Guide*): Diperuntukkan bagi verifikasi instruksi fungsional tingkat akademik.*
