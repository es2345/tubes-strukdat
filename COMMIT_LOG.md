# Commit Log – Tubes Strukdat



## [28-11-2025] – Abraham
- Membuat repository dan struktur folder awal (`templates/`, `static/`, `data/`).
- Menyiapkan `app.py` awal (setup Flask, routing dasar, dan halaman landing sederhana).
- Menambahkan konfigurasi awal `.gitignore` untuk menghindari folder lingkungan virtual dan cache.

## [30-11-2025] – Abi
- Menambahkan konfigurasi database SQLite + inisialisasi SQLAlchemy.
- Membuat draft model inti (Song/User) untuk kebutuhan login dan library lagu.
- Menambahkan migrasi/seeding sederhana untuk data uji.

## [30-11-2025] – Daffa
- Menyusun rancangan UI awal (layout base: topbar/sidebar/main content).
- Menambahkan style dasar tema gelap dan komponen card untuk lagu.
- Membuat struktur section halaman (hero + list/grid) biar gampang dikembangkan.

## [01-12-2025] – Abraham
- Implementasi autentikasi berbasis session dan pembatasan akses berdasarkan role (guest/user/admin).
- Menambahkan guard untuk route admin agar non-admin otomatis redirect.
- Merapikan alur navigasi landing → dashboard (sesuai role).

## [03-12-2025] – Abi
- Implementasi CRUD dasar untuk Song (tambah/edit/hapus) di sisi admin.
- Menambahkan validasi form sederhana (field wajib + sanitasi input).
- Menyiapkan helper serialisasi Song untuk dipakai di API dan template.

## [04-12-2025] – Daffa
- Menambahkan komponen UI “Top result” dan section hasil pencarian di `search_results`.
- Merapikan ukuran kartu lagu agar konsisten saat zoom 100% (tidak terlihat tipis).
- Menambahkan styling artist bubble (avatar + nama) untuk hasil artist.

## [06-12-2025] – Abraham
- Menambahkan routing `/search` (query param `q`) dan integrasi render ke `search_results.html`.
- Menambahkan halaman song detail (route + template) untuk tampilan detail lagu.
- Merapikan struktur template (extend layout yang sama) supaya tidak duplikasi header/sidebar.

## [08-12-2025] – Abi
- Menambahkan endpoint queue/playlist (add/remove/clear/get) untuk kebutuhan player.
- Menambahkan logika next/prev berbasis queue/playlist mode (fallback jika queue kosong).
- Merapikan beberapa query SQLAlchemy (case-insensitive, trimming input, handling data kosong).

## [08-12-2025] – Daffa
- Merapikan layout hero artist profile (avatar besar + judul + jumlah lagu).
- Menyesuaikan grid lagu di artist profile agar rapih dan seragam.
- Memperbaiki fallback gambar pada UI (mengurangi kemungkinan avatar/cover kosong).

## [10-12-2025] – Abraham
- Debug error admin terkait `url_for` (BuildError) akibat endpoint belum tersedia.
- Menambahkan route yang diperlukan untuk admin-artist agar halaman admin tidak crash.
- Merapikan struktur file dan mengurangi duplikasi kecil yang bikin bingung (tanpa ubah variabel utama).

## [12-12-2025] – Abi
- Integrasi pembacaan durasi MP3 (mutagen) saat upload/serialisasi lagu (kalau file valid).
- Stabilkan proses upload cover/audio + validasi tipe file.
- Menambahkan pengecekan edge-case playlist (hapus item terakhir, clear saat kosong).

## [13-12-2025] – Daffa
- Debug tombol play di song detail agar ikon bisa sync mengikuti state audio global (play/pause).
- Merapikan event listener play/pause supaya update ikon tidak “ketinggalan”.
- Polishing UI terakhir (spacing, ukuran card, responsif) di search & song detail.

## [14-12-2025] – Abraham
- Inisialisasi proyek dan struktur folder.
- Menambahkan file utama program.
- Final review alur guest → search → detail → queue agar tidak ada crash saat demo.

## [14-12-2025] – Abi
- Inisialisasi proyek dan struktur folder.
- Menambahkan file utama program.
- Final check database (schema + seed) dan validasi input form admin sebelum presentasi.

## [14-12-2025] – Daffa
- Inisialisasi proyek dan struktur folder.
- Menambahkan file utama program.
- Polishing UI terakhir: search results, artist profile, dan song detail agar konsisten.
