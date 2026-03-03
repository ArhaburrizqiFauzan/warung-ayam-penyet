# Dokumentasi Pengujian Manual (Manual Testing)

Dokumen ini merupakan artefak dari proses validasi fungsionalitas sistem (GeprekPos) yang dilakukan melalui simulasi operasional interaksi manusia terhadap antar-muka pengguna (UI). Pengujian difokuskan terhadap modul Pemesanan, Pembayaran, dan Manajemen Stok.

## Skenario Pengujian Sistem

Penilaian kualitas perangkat lunak dilaksanakan dengan acuan metrik respon atas input aksi sistem (*User Acceptance Testing* / UAT). Berikut adalah log aktivitas pengajuan yang direplika pada fase peninjauan tahap operasional:

| ID Tes | Modul & Kondisi Awal | Langkah-Langkah Eksekusi (*Test Steps*) |  Hasil Eksekusi yang Diharapkan (*Expected Output*) | Status | Bukti Validasi (*Screenshot*) |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **TC-01** | **Pemesanan**: Layar dasbor awal terbuka, keranjang kosong. | 1. Tekan tombol kategori "Minuman".<br>2. Klik tombol "Tambah" pada item "Es Teh Manis". | Layar filter bekerja. "Es Teh Manis" berpindah ke keranjang sebelah kanan dengan kuantitas (1) dan subtotal tercatat. | [ ] | *[Tautkan Screenshot Proses Masuk Keranjang]* |
| **TC-02** | **Pemesanan**: Terdapat "Es Teh Manis" (1) di keranjang belanja. | 1. Klik ikon tambah (+) pada laras pesanan di panel keranjang. | Kuantitas pesanan "Es Teh Manis" bertambah menjadi (2). Nominal total harga pesanan (Rp) turut terakumulasi secara otomatis. | [ ] | *[Tautkan Screenshot Kuantitas & Harga Berubah]* |
| **TC-03** | **Pemesanan (Item Kustomisasi)**: Layar "Paket Ayam" aktif. | 1. Klik "Tambah" pada "Ayam Penyet Original".<br>2. Pilih tingkat kepedasan "5" dan Bagian "Dada".<br>3. Konfirmasi Tambah. | Item ditambahkan ke keranjang, lengkap termuat dengan parameter anotasi opsi (Level: 5, Bagian: Dada). | [ ] | *[Tautkan Screenshot Modal Opsi Ayam dan Keranjang]* |
| **TC-04** | **Pemesanan (Stok Habis)**: Layar menunjukkan "Ayam Penyet Matah" Stok: 0. | 1. Perhatikan modul item di daftar.<br>2. Coba klik aksi penambahan menu. | Indikator menunjukkan label "Habis" berwarna merah. Menu terkunci atau instrumen pesanan tak dapat ditambahkan ke keranjang. | [ ] | *[Tautkan Screenshot Item Habis/Disabled]* |
| **TC-05** | **Pembayaran (Uang Tunai)**: Keranjang bernilai Total Rp 23.000. | 1. Navigasi menuju panel Pembayaran.<br>2. Pilih metode instrumen "Tunai".<br>3. Input nominal pembayaran kas senilai "30000".<br>4. Klik "Selesaikan Transaksi". | Modul kalkulasi merender teks "Kembalian Rp 7.000". Kotak dialog "Transaksi Berhasil!" ditampilkan di layar purna batas konfirmasi pembayaran. | [ ] | *[Tautkan Screenshot Kembalian Transaksi Tunai]* |
| **TC-06** | **Pembayaran (Alur Kosong)**: Akses modul Pembayaran namun kondisi keranjang = 0. | 1. Masuk paksa ke menu "Pembayaran" melalui *Sidebar*. | Aplikasi tidak menampilkan form kalkulator kas, melainkan merespon instan dengan memunculkan pesan peringatan "Tidak ada pesanan untuk dibayar". | [ ] | *[Tautkan Screenshot Penolakan Akses Pembayaran]* |
| **TC-07** | **Manajemen Stok**: Akses modul Stok, pilih "Es Jeruk" (cth: stok 80). | 1. Klik tombol "Kurangi".<br>2. Input nilai pengurangan "10".<br>3. Klik "Simpan". | Metrik stok "Es Jeruk" pada tabel secara waktu nyata berkurang dari 80 menjadi 70. Pop-up notifikasi suskses tampil. | [ ] | *[Tautkan Screenshot Dialog Pengurangan Stok]* |

## Penutup Ujian Manual
Rekam simulasi operasional pada tabel di atas diyakini mampu merepresentasikan pemenuhan prasyarat verifikasi bahwa seluruh skema sirkulasi alur fitur primer warung bekerja tanpa galat. Bukti otentik grafis disematkan pada setiap skenario (*test case*) untuk keperluan audit kolaborasi.
