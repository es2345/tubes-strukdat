# Commit Log – Tubes Strukdat

## [28-11-2025] – Abraham
- Membuat repository dan struktur folder awal (`templates/`, `static/`, `data/`).
- Menyiapkan `app.py` awal (setup Flask, routing dasar, dan struktur halaman utama).

## [28-11-2025] – Abi
- Menambahkan konfigurasi database (SQLite) dan inisialisasi SQLAlchemy.
- Membuat model awal untuk kebutuhan data lagu dan user (draft skema + tabel inti).

## [28-11-2025] – Daffa
- Menyusun rancangan UI awal (layout base: sidebar/topbar/main content).
- Menyiapkan style dasar untuk tema dark dan komponen card.

## [30-11-2025] – Abraham
- Menambahkan flow navigasi halaman (landing → guest/user) dan routing tampilan utama.
- Menyusun struktur template dasar agar halaman-halaman bisa extend layout yang sama.

## [30-11-2025] – Abi
- Menambahkan utilitas seed data (dummy songs) untuk ngetes search & rendering.
- Menyiapkan helper serializer untuk response API (format data song/artist).

## [30-11-2025] – Daffa
- Menambahkan komponen UI “Top result” dan section hasil pencarian di `search_results`.
- Merapikan spacing dan responsif kartu agar tidak “tipis” saat zoom 100%.

## [01-12-2025] – Abraham
- Implementasi autentikasi sederhana (session) + pembatasan akses berdasarkan role.
- Menambahkan guard untuk route admin agar tidak bisa diakses role non-admin.

## [01-12-2025] – Abi
- Implementasi CRUD dasar untuk Song (tambah/edit/hapus) di sisi admin.
- Menambahkan validasi form sederhana untuk field wajib (judul/artist/audio/cover).

## [01-12-2025] – Daffa
- Menambahkan interaksi UI untuk tombol play di card (hook ke global audio).
- Menyusun tampilan song card supaya konsisten di home/search/artist profile.

## [02-12-2025] – Abraham
- Menambahkan route `/search` (query param `q`) dan integrasi ke template hasil pencarian.
- Merapikan format data “top result” agar bisa dipakai UI tanpa banyak conditional.

## [02-12-2025] – Abi
- Implementasi endpoint playlist/queue (add/remove/clear/get) untuk kebutuhan player.
- Menambahkan struktur data playlist sederhana agar urutan lagu stabil saat next/prev.

## [02-12-2025] – Daffa
- Menambahkan styling artist bubble pada hasil search (avatar + nama).
- Menyiapkan fallback UI ketika avatar artist belum ada (placeholder).

## [03-12-2025] – Abraham
- Menambahkan halaman song detail (route + template) untuk tampilan detail lagu.
- Menyusun integrasi tombol “add to queue/playlist” dari song detail ke API.

## [03-12-2025] – Abi
- Menambahkan logika “next/prev” berbasis queue/playlist mode (fallback ke similar song).
- Menambahkan helper pemilihan lagu berikutnya agar tidak selalu random.

## [03-12-2025] – Daffa
- Merapikan layout hero artist profile (avatar besar + judul + jumlah lagu).
- Menyesuaikan ukuran cover pada grid lagu agar rapi dan seragam.

## [04-12-2025] – Abraham
- Menambahkan halaman admin (library table) + link ke tambah/edit/hapus song.
- Merapikan routing admin agar konsisten dan mudah di-debug.

## [04-12-2025] – Abi
- Integrasi pembacaan durasi MP3 (mutagen) saat upload/serialisasi lagu.
- Menambahkan field/atribut durasi ke payload agar player bisa tampil progress lebih akurat.

## [04-12-2025] – Daffa
- Menambahkan styling overlay/gradient background di berbagai halaman (search/detail/artist).
- Merapikan UI supaya tetap readable di layar kecil.

## [06-12-2025] – Abraham
- Menambahkan fitur admin untuk manajemen artist (list + edit) agar tidak hanya lewat songs.
- Menyambungkan tombol edit artist dari halaman admin ke halaman edit yang sesuai.

## [06-12-2025] – Abi
- Menambahkan validasi unik untuk nama artist di tabel profile (mencegah duplikasi).
- Menyusun mekanisme update massal `Song.artist` ketika nama artist berubah (konsistensi data).

## [06-12-2025] – Daffa
- Menyesuaikan UI admin artist list (search bar, list card/table) agar mudah dipakai.
- Menambahkan perapihan kecil pada tombol/hover agar konsisten dengan tema.

## [08-12-2025] – Abraham
- Debug route yang menyebabkan `BuildError` (template memanggil endpoint yang belum ada).
- Menambahkan route yang diperlukan untuk admin-artist agar template tidak crash.

## [08-12-2025] – Abi
- Merapikan beberapa bagian query/filter SQLAlchemy (case-insensitive, trimming input).
- Menambahkan handling sederhana untuk data kosong agar halaman tidak error saat library kosong.

## [08-12-2025] – Daffa
- Menyempurnakan halaman search agar avatar artist tidak “kosong” jika avatar berupa URL eksternal.
- Merapikan fallback gambar agar tidak 404 (mengarah ke default cover yang tersedia).

## [10-12-2025] – Abraham
- Merapikan struktur file dan mengurangi duplikasi (import/function yang dobel).
- Menambahkan catatan troubleshooting internal untuk bug UI/route umum.

## [10-12-2025] – Abi
- Menambahkan pengecekan edge-case playlist (hapus item terakhir, clear saat kosong).
- Menyetel payload API agar konsisten (id bertipe string/int aman dibandingkan di JS).

## [10-12-2025] – Daffa
- Debug tombol play di song detail agar ikon bisa sync mengikuti state audio global.
- Merapikan event listener play/pause supaya update ikon tidak “ketinggalan”.

## [12-12-2025] – Abraham
- Final review alur guest → search → detail → queue untuk memastikan tidak ada crash.
- Memastikan route admin aman (redirect jika belum login atau bukan admin).

## [12-12-2025] – Abi
- Stabilkan proses upload cover/audio dan validasi format file.
- Memastikan seed/initial library berjalan sesuai konfigurasi project.

## [12-12-2025] – Daffa
- Polishing UI (spacing, ukuran card, responsif) di halaman search dan artist profile.
- Merapikan tampilan icon/tombol agar sesuai style keseluruhan.

## [14-12-2025] – Abraham
- Inisialisasi proyek dan struktur folder.
- Menambahkan file utama program.
- Finalisasi integrasi route admin-artist dan perapihan akses admin.

## [14-12-2025] – Abi
- Inisialisasi proyek dan struktur folder.
- Menambahkan file utama program.
- Final check database (schema + seed) dan validasi input form admin.

## [14-12-2025] – Daffa
- Inisialisasi proyek dan struktur folder.
- Menambahkan file utama program.
- Polishing UI terakhir: search results, artist profile, dan song detail agar konsisten.
