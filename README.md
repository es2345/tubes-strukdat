# Structify Music / VibeStream (Flask) 🎵

Aplikasi web music library berbasis **Flask + SQLAlchemy** dengan fitur **search**, **song detail**, **artist profile**, **queue/playlist**, serta **role** (guest/user/admin).

**Confidence (berdasarkan isi project): 0.9**

---

## Fitur Utama
- **Search** lintas *songs, artists, playlists* (halaman `search_results`).
- **Song Detail** (play/pause via global player).
- **Artist Profile** (banner + daftar lagu berdasarkan artist).
- **Queue / Playlist**
  - Queue sederhana (enqueue/remove/clear).
  - Multi-playlist CRUD (create/add/remove/clear/delete) via API.
- **Role-based access**
  - Guest dashboard/fitur terbatas
  - User home/player
  - Admin dashboard (CRUD lagu).
- **Durasi MP3** dihitung otomatis (menggunakan `mutagen`, bila tersedia).
  

---

## Tech Stack
- **Backend:** Python, Flask
- **DB:** SQLite (via SQLAlchemy)
- **Frontend:** Jinja templates, JavaScript, CSS
- **Audio metadata:** `mutagen` 


---

## Struktur Folder (umum)
> Nama folder bisa sedikit beda tergantung versi kamu, tapi polanya seperti ini:

- `app.py` — entry utama Flask
- `templates/` — halaman Jinja (base shell, dashboard, admin, search, detail)
- `static/`
  - `js/` — logic player, search interaction, queue/playlist
  - `covers/` — cover image (termasuk `default_cover.png` jika ada)
  - `artist_avatars/` — avatar artist (jika ada)
  - `audio/` — file mp3 (kalau project menyertakan)


---

## Instalasi & Setup (Windows)

### 1) Download semuanya makai .zip
### 2) Extract semua filenya di tempat(path) yang kamu mau
### 3) Buka terminal yang terhubung dengan filenya, dan jgn lupa modifikasi folder venv (tahap 4)
### 4) Buka file pyvenv.cfg, lalu sesuaikan pathnya : 
### home = C:\Users\Abraham\AppData\Local\Programs\Python\Python311, ini ubah jadi home = C:\Users\Abi (namamu)\AppData\Local\Programs\Python\Python311
### 5) Lalu di terminal yg sudah terhubung, isi ini di terminal kalau security windows ngehalangin "Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass"
### 6) Lalu aktifkan venvnya "venv/Scripts/activate"
### 7) Lalu aktifkan appnya "python app.py"
### 8) Dan buka http://127.0.0.1:5000/
### 9) Silahkan uji coba

## Note :
### admin = admin@example.com
### pass = admin123
### utk bikin usernya silahkan sign up karena gak ada fungsi ciptain user otomatis kayak admin ( def create_default_admin() )





