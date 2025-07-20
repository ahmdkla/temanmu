# Temanmu

**Hadir untuk membantu harimu lebih teratur — atur tugas, jadwalkan kegiatan, dan kelola produktivitasmu dengan mudah dalam satu aplikasi.**

## 📌 Project Overview

Temanmu adalah aplikasi manajemen tugas (to-do list) yang dirancang untuk meningkatkan produktivitas dan keteraturan dalam menjalani aktivitas harian. Proyek ini bertujuan memberikan solusi praktis bagi pengguna yang ingin mengelola berbagai tugas dan kegiatan dalam satu tempat yang intuitif dan mudah digunakan.

Latar belakang pengembangan aplikasi ini adalah banyaknya pengguna yang merasa kesulitan mengatur prioritas dan waktu secara efisien, terutama dalam lingkungan serba cepat saat ini. Temanmu hadir sebagai solusi dengan pendekatan yang modern, ringan, dan berbasis web, agar bisa diakses kapan pun dan di mana pun.

---

## 🛠️ Technologies Used

- **Next.js (App Router)**  
  Digunakan sebagai kerangka kerja utama karena mendukung SSR (Server-Side Rendering) dan menyediakan struktur pengembangan yang efisien serta modern.

- **Supabase**  
  Berfungsi sebagai backend dan sistem autentikasi real-time. Dipilih karena integrasi yang mudah dengan Next.js dan mendukung kebutuhan autentikasi serta database secara langsung.

- **Netlify**  
  Layanan hosting yang mendukung build otomatis dari GitHub. Cocok untuk proyek berbasis Next.js dan memberikan kemudahan dalam deployment.

- **Tailwind CSS**  
  Digunakan untuk mempercepat proses styling UI secara konsisten dan responsif. Utility-first approach-nya sangat cocok untuk pengembangan cepat.

- **GitHub**  
  Digunakan sebagai version control dan kolaborasi proyek.

- **IBM Granite (via watsonx.ai)**  
  Model AI berbasis instruksi untuk membantu selama proses pengembangan kode, debugging, dan dokumentasi.

- **Dependencies**:
  - `dayjs`: Untuk mengatur dan memformat waktu dan tanggal secara efisien.
  - `@dnd-kit`: Library drag-and-drop modern yang ringan dan fleksibel, digunakan untuk memindahkan task secara visual.

---

## ✨ Features

- ✅ **CRUD Task Management**  
  Pengguna dapat membuat, mengedit, dan menghapus tugas dengan mudah.

- 🔀 **Drag-and-Drop Task**  
  Fitur interaktif untuk mengatur ulang urutan tugas secara visual.

- ⚡ **Quick-Schedule**  
  Jadwalkan tugas secara cepat dengan template waktu preset.

- 🏷️ **Kategori Task**  
  Tugas dapat dikategorikan agar lebih terorganisir.

- 📊 **Task Status Overview**  
  Menampilkan statistik jumlah task, status aktif, dan yang masih pending.

- ⏫ **Priority Level**  
  Tentukan tingkat prioritas dari setiap tugas agar lebih fokus pada hal penting.

---

## 🚀 Setup Instructions

### 1. Clone Repository

```bash
git clone https://github.com/username/temanmu.git
cd temanmu
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run the App Locally

```bash
npm run dev
```

## Akses aplikasi di : http://localhost:3000.
## Atau di website : https://temanmu.netlify.app

---

## 🧠 AI Support Explanation

Dalam pengembangan proyek *Temanmu*, saya memanfaatkan teknologi AI dari **IBM watsonx.ai**, khususnya model **Granite Instruct**, sebagai co-pilot coding sepanjang proses pembuatan aplikasi. Granite Instruct adalah model AI generatif berbasis instruksi (instruction-tuned) yang dirancang untuk memahami konteks pengembangan perangkat lunak dan memberikan bantuan yang relevan, cerdas, dan kontekstual.

### 🔧 Bagaimana AI digunakan dalam proyek ini?

1. **Pembuatan Struktur Kode dan Komponen**
   - AI membantu membangun fondasi awal proyek seperti struktur folder dan arsitektur halaman (routing App Router di Next.js).
   - Komponen UI seperti input task, form login, halaman dashboard, dan status ringkasan dibuat dengan bantuan AI untuk mempercepat proses setup dan styling dengan Tailwind.

2. **Refactor dan Peningkatan Kode**
   - AI memberikan saran untuk meningkatkan efisiensi logika kode, menyederhanakan fungsi, serta mengurangi *code duplication*.
   - Memberi masukan terkait best practices dalam penggunaan React Hooks, pengelolaan state, dan pemisahan concerns (seperti pemisahan logic dan view).

3. **Debugging dan Error Explanation**
   - AI sangat membantu ketika muncul error, seperti kesalahan penggunaan useCallback, peringatan dari ESLint, hingga error pada deployment ke Netlify.
   - Selain menjelaskan penyebab error, Granite Instruct juga menyarankan perbaikannya secara langsung, sering kali disertai dengan reasoning teknis yang bisa saya pelajari.

4. **Pembuatan dan Revisi Dokumentasi**
   - README ini sendiri disusun dengan bantuan AI, termasuk penjelasan teknologi, fitur, hingga instruksi setup.
   - AI juga membantu merancang cara menjelaskan fitur secara sistematis dan mudah dimengerti untuk keperluan penilaian maupun pengguna akhir.

5. **Eksplorasi Ide dan Validasi Implementasi**
   - Selama proses pengembangan, saya sering berdiskusi dengan AI untuk mengeksplorasi alternatif pendekatan terhadap suatu fitur — seperti cara membuat sistem drag-and-drop yang efisien menggunakan `@dnd-kit`, atau bagaimana menyimpan waktu penjadwalan tugas dengan benar di database Supabase.

### 🤖 Mengapa Granite Instruct?

Granite Instruct unggul karena:
- **Mampu memahami konteks secara menyeluruh**, tidak hanya memberi jawaban potongan-potongan.
- **Memberikan solusi yang realistis dan production-ready**, bukan sekadar kode dummy.
- **Kaya referensi teknis**, cocok untuk pembelajaran sambil praktik.
- **Terintegrasi dengan ekosistem IBM**, menjadikannya pilihan enterprise-grade untuk pengembangan AI di aplikasi web modern.

Dengan memanfaatkan Granite Instruct, saya tidak hanya mempercepat proses coding, tetapi juga belajar praktik pengembangan aplikasi modern dengan standar industri.

---
🌐 Live Website
https://temanmu.netlify.app/
