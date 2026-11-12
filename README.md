# Task Management API

REST API untuk manajemen tim, proyek, tugas, dan penugasan anggota. Dibangun dengan **NestJS**, **TypeORM**, dan **PostgreSQL**.

---

## 🚀 Cara Menjalankan

### 1. Prasyarat
- Node.js >= 18
- Docker & Docker Compose
- pnpm

### 2. Clone & Install
```bash
git clone <repo-url>
cd uts_framework
pnpm install
```

### 3. Konfigurasi Environment
Buat file `.env` di root project:
```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5433
DB_USERNAME=postgres
DB_PASSWORD=postgres123
DB_DATABASE=uts_db
```

### 4. Jalankan Database (Docker)
```bash
docker compose up -d
```

### 5. Jalankan Aplikasi
```bash
# Mode development (auto-reload)
pnpm run start:dev

# Mode production
pnpm run start:prod
```

Aplikasi berjalan di: `http://localhost:3000`

> Tabel database dibuat otomatis oleh TypeORM (`synchronize: true`) saat pertama kali app dijalankan.

---

## 🗄️ Struktur Tabel & Relasi

### Diagram Relasi
```
teams (1) ──────< projects (N)
  │
  └──────< members (N)
                │
                └──────< task_assignments (N) >────── tasks (N)
                                                          │
                                                     projects (1)
```

### Tabel `teams`
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | integer (PK) | Auto increment |
| `nama` | varchar(100) | Nama tim, **UNIQUE** |
| `description` | text | Deskripsi (opsional) |
| `createdAt` | timestamp | Dibuat otomatis |
| `updatedAt` | timestamp | Diperbarui otomatis |

### Tabel `members`
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | integer (PK) | Auto increment |
| `nama` | varchar(100) | Nama anggota |
| `email` | varchar(150) | Email, **UNIQUE** |
| `role` | varchar(50) | Peran anggota |
| `teamId` | integer (FK) | Referensi ke `teams.id` |
| `createdAt` | timestamp | Dibuat otomatis |
| `updatedAt` | timestamp | Diperbarui otomatis |

### Tabel `projects`
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | integer (PK) | Auto increment |
| `nama` | varchar(150) | Nama proyek |
| `description` | text | Deskripsi (opsional) |
| `status` | varchar(20) | `active` / `on_hold` / `completed` |
| `startDate` | date | Tanggal mulai (opsional) |
| `endDate` | date | Tanggal selesai (opsional) |
| `teamId` | integer (FK) | Referensi ke `teams.id` |
| `createdAt` | timestamp | Dibuat otomatis |
| `updatedAt` | timestamp | Diperbarui otomatis |

### Tabel `tasks`
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | integer (PK) | Auto increment |
| `title` | varchar(200) | Judul tugas |
| `description` | text | Deskripsi (opsional) |
| `status` | varchar(20) | `todo` / `in_progress` / `done` / `cancelled` |
| `priority` | varchar(20) | `low` / `medium` / `high` |
| `dueDate` | date | Tenggat waktu (opsional) |
| `projectId` | integer (FK) | Referensi ke `projects.id` |
| `createdAt` | timestamp | Dibuat otomatis |
| `updatedAt` | timestamp | Diperbarui otomatis |

### Tabel `task_assignments`
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | integer (PK) | Auto increment |
| `taskId` | integer (FK) | Referensi ke `tasks.id` |
| `memberId` | integer (FK) | Referensi ke `members.id` |
| `assignedAt` | timestamp | Waktu penugasan |
| `createdAt` | timestamp | Dibuat otomatis |
| `updatedAt` | timestamp | Diperbarui otomatis |

> **UNIQUE:** Kombinasi `(taskId, memberId)` tidak boleh duplikat

---

## 📡 API Endpoints

Base URL: `http://localhost:3000`

---

### 👥 Teams

#### `GET /teams` — Daftar semua tim
```
GET http://localhost:3000/teams
```
**Response:**
```json
[
  {
    "id": 1,
    "nama": "Tim Alpha",
    "description": "Tim backend",
    "createdAt": "2026-11-12T08:00:00.000Z",
    "updatedAt": "2026-11-12T08:00:00.000Z",
    "projects": []
  }
]
```

#### `GET /teams/:id` — Detail tim
```
GET http://localhost:3000/teams/1
```

#### `POST /teams` — Buat tim baru
```
POST http://localhost:3000/teams
Content-Type: application/json
```
**Body:**
```json
{
  "nama": "Tim Alpha",
  "description": "Deskripsi tim (opsional)"
}
```
| Field | Wajib | Keterangan |
|---|---|---|
| `nama` | ✅ | Maks 100 karakter, unik |
| `description` | ❌ | Bebas |

#### `PATCH /teams/:id` — Update tim
```
PATCH http://localhost:3000/teams/1
Content-Type: application/json
```
**Body (semua opsional):**
```json
{
  "nama": "Tim Alpha Baru",
  "description": "Deskripsi baru"
}
```

#### `DELETE /teams/:id` — Hapus tim
```
DELETE http://localhost:3000/teams/1
```
> ⚠️ Gagal jika tim masih memiliki proyek

---

### 🧑‍💼 Members

#### `GET /members` — Daftar semua anggota
```
GET http://localhost:3000/members
GET http://localhost:3000/members?teamId=1
```
**Query params:**
| Param | Keterangan |
|---|---|
| `teamId` | Filter berdasarkan tim |

#### `GET /members/:id` — Detail anggota
```
GET http://localhost:3000/members/1
```

#### `POST /members` — Tambah anggota
```
POST http://localhost:3000/members
Content-Type: application/json
```
**Body:**
```json
{
  "teamId": 1,
  "nama": "Budi Santoso",
  "email": "budi@example.com",
  "role": "Backend Developer"
}
```
| Field | Wajib | Keterangan |
|---|---|---|
| `teamId` | ✅ | ID tim yang ada |
| `nama` | ✅ | Maks 100 karakter |
| `email` | ✅ | Format email valid, unik |
| `role` | ✅ | Maks 50 karakter |

#### `PATCH /members/:id` — Update anggota
```
PATCH http://localhost:3000/members/1
Content-Type: application/json
```
**Body (semua opsional):**
```json
{
  "nama": "Budi Santoso Jr",
  "email": "budi.jr@example.com",
  "role": "Senior Backend",
  "teamId": 2
}
```
> ⚠️ Tidak bisa pindah tim jika masih punya penugasan aktif

#### `DELETE /members/:id` — Hapus anggota
```
DELETE http://localhost:3000/members/1
```
> ⚠️ Gagal jika anggota masih memiliki penugasan

---

### 📁 Projects

#### `GET /projects` — Daftar semua proyek
```
GET http://localhost:3000/projects
GET http://localhost:3000/projects?teamId=1
GET http://localhost:3000/projects?status=active
GET http://localhost:3000/projects?teamId=1&status=on_hold
```
**Query params:**
| Param | Nilai | Keterangan |
|---|---|---|
| `teamId` | number | Filter berdasarkan tim |
| `status` | `active` / `on_hold` / `completed` | Filter berdasarkan status |

#### `GET /projects/:id` — Detail proyek
```
GET http://localhost:3000/projects/1
```

#### `POST /projects` — Buat proyek baru
```
POST http://localhost:3000/projects
Content-Type: application/json
```
**Body:**
```json
{
  "teamId": 1,
  "nama": "Project UAS Framework",
  "status": "active",
  "description": "Deskripsi proyek (opsional)",
  "startDate": "2026-11-12",
  "endDate": "2026-12-31"
}
```
| Field | Wajib | Keterangan |
|---|---|---|
| `teamId` | ✅ | ID tim yang ada |
| `nama` | ✅ | Maks 100 karakter |
| `status` | ✅ | `active` / `on_hold` / `completed` |
| `description` | ❌ | Bebas |
| `startDate` | ❌ | Format `YYYY-MM-DD` |
| `endDate` | ❌ | Format `YYYY-MM-DD`, tidak boleh sebelum `startDate` |

#### `PATCH /projects/:id` — Update proyek
```
PATCH http://localhost:3000/projects/1
Content-Type: application/json
```
**Body (semua opsional):**
```json
{
  "nama": "Nama Baru",
  "status": "on_hold",
  "description": "Update deskripsi",
  "startDate": "2026-11-15",
  "endDate": "2027-01-31"
}
```

#### `DELETE /projects/:id` — Hapus proyek
```
DELETE http://localhost:3000/projects/1
```

---

### ✅ Tasks

#### `GET /tasks` — Daftar semua tugas
```
GET http://localhost:3000/tasks
GET http://localhost:3000/tasks?projectId=1
GET http://localhost:3000/tasks?status=todo
GET http://localhost:3000/tasks?priority=high
```
**Query params:**
| Param | Nilai | Keterangan |
|---|---|---|
| `projectId` | number | Filter berdasarkan proyek |
| `status` | `todo` / `in_progress` / `done` / `cancelled` | Filter status |
| `priority` | `low` / `medium` / `high` | Filter prioritas |

#### `GET /tasks/:id` — Detail tugas
```
GET http://localhost:3000/tasks/1
```

#### `POST /tasks` — Buat tugas baru
```
POST http://localhost:3000/tasks
Content-Type: application/json
```
**Body:**
```json
{
  "projectId": 1,
  "title": "Desain halaman login",
  "description": "Buat wireframe dan mockup UI login",
  "priority": "high",
  "dueDate": "2026-12-01"
}
```
| Field | Wajib | Keterangan |
|---|---|---|
| `projectId` | ✅ | ID proyek yang ada & berstatus `active`/`on_hold` |
| `title` | ✅ | Maks 200 karakter |
| `description` | ❌ | Bebas |
| `priority` | ❌ | `low` / `medium` / `high` (default: `medium`) |
| `dueDate` | ❌ | Format `YYYY-MM-DD`, tidak boleh masa lalu |

> Status tugas otomatis `todo` saat dibuat

#### `PATCH /tasks/:id` — Update tugas
```
PATCH http://localhost:3000/tasks/1
Content-Type: application/json
```
**Body (semua opsional):**
```json
{
  "title": "Judul baru",
  "status": "in_progress",
  "priority": "medium",
  "dueDate": "2026-12-15"
}
```

**Aturan perpindahan status:**
| Dari | Boleh ke |
|---|---|
| `todo` | `in_progress`, `cancelled` |
| `in_progress` | `todo`, `done`, `cancelled` |
| `done` | *(final, tidak bisa diubah)* |
| `cancelled` | *(final, tidak bisa diubah)* |

> ⚠️ Status `in_progress` hanya bisa diset jika tugas sudah memiliki minimal 1 penugasan

#### `DELETE /tasks/:id` — Hapus tugas
```
DELETE http://localhost:3000/tasks/1
```
> Semua `task_assignments` terkait ikut terhapus otomatis (CASCADE)

---

### 📌 Task Assignments

#### `GET /task-assignments` — Daftar penugasan
```
GET http://localhost:3000/task-assignments
GET http://localhost:3000/task-assignments?taskId=1
GET http://localhost:3000/task-assignments?memberId=2
```
**Query params:**
| Param | Keterangan |
|---|---|
| `taskId` | Filter berdasarkan tugas |
| `memberId` | Filter berdasarkan anggota |

#### `GET /task-assignments/:id` — Detail penugasan
```
GET http://localhost:3000/task-assignments/1
```

#### `POST /task-assignments` — Assign anggota ke tugas
```
POST http://localhost:3000/task-assignments
Content-Type: application/json
```
**Body:**
```json
{
  "taskId": 1,
  "memberId": 2
}
```
| Field | Wajib | Keterangan |
|---|---|---|
| `taskId` | ✅ | ID tugas yang ada |
| `memberId` | ✅ | ID anggota yang ada |

> ⚠️ Kombinasi `taskId` + `memberId` tidak boleh duplikat

#### `DELETE /task-assignments/:id` — Hapus penugasan
```
DELETE http://localhost:3000/task-assignments/1
```

---

## ⚠️ Aturan Bisnis

| # | Aturan |
|---|---|
| 1 | Satu anggota hanya bisa di-assign ke satu tugas **satu kali** (UNIQUE taskId + memberId) |
| 2 | Tugas tidak bisa dibuat di proyek yang berstatus `completed` |
| 3 | Status tugas hanya bisa berpindah sesuai alur yang ditentukan |
| 4 | Status `in_progress` butuh minimal **1 anggota** ter-assign |
| 5 | Anggota tidak bisa pindah tim jika masih punya penugasan aktif |
| 6 | Anggota tidak bisa dihapus jika masih punya penugasan |
| 7 | Tim tidak bisa dihapus jika masih punya proyek |

---

## 🛠️ Teknologi

| Teknologi | Versi |
|---|---|
| NestJS | ^12.x |
| TypeORM | ^1.x |
| PostgreSQL | 17 |
| Node.js | >= 18 |
| TypeScript | ^6.x |

---

## 📂 Struktur Folder

```
src/
├── teams/              # Modul Tim
├── members/            # Modul Anggota
├── projects/           # Modul Proyek
├── tasks/              # Modul Tugas
├── task_assignments/   # Modul Penugasan
├── app.module.ts
└── main.ts
```
