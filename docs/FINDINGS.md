# FINDINGS — Investigasi Explainability Model Visual (Grad-CAM)

Dokumen ini mencatat kronologi jujur investigasi kualitas atensi model visual
AquaRoute AI (MobileNetV3-Small, klasifikasi 3 tier). Tujuannya: transparansi
metodologi — apa yang dicoba, apa yang berhasil, apa yang tidak, dan mengapa.

**Status model saat ini: v1 aktif (akurasi 99.21%).** Keterbatasan explainability
di bawah ini diketahui, terdokumentasi, dan masuk roadmap pasca-MVP — bukan
sesuatu yang disembunyikan.

---

## 1. Temuan awal — atensi ke background pada foto nampan hijau

Saat memverifikasi Grad-CAM (di-hook ke conv layer terakhir feature extractor,
`model.visual[0][-1]`, resolusi peta 7x7) terhadap beberapa foto uji, ditemukan
bahwa pada sebagian foto **ikan di atas nampan hijau — terutama yang berorientasi
vertikal — area terpanas kadang jatuh di background / tepi nampan, bukan di badan
ikan.**

Contoh paling jelas (`ikan1_small.jpg`, ikan vertikal di nampan hijau, prediksi
Tier3_Prima conf 1.0000): sel-sel di kolom tengah tempat badan ikan berada justru
dingin (~0.00–0.06), sedangkan panas menumpuk di tepi kiri nampan dan sudut
kiri-bawah (~57% energi peta ada di cincin tepi 7x7). Ini gejala klasik
**spurious correlation** — model berpotensi memakai isyarat background, bukan ciri
ikannya.

## 2. Eksperimen v2 — augmentasi diperkuat (DITOLAK)

**Hipotesis:** memperkuat augmentasi warna/oklusi akan memaksa model berhenti
bersandar pada isyarat warna background dan pindah ke ciri ikan.

**Perubahan (training v2):** ColorJitter lebih agresif, RandomGrayscale dinaikkan,
tambah RandomErasing.

**Hasil (uji Grad-CAM cross-background, 5 foto yang sama):**

| Foto | Background | Orientasi | Hasil v2 |
|---|---|---|---|
| ikan1_small | nampan hijau | vertikal | ❌ tetap fokus ke tepi nampan / sudut, badan ikan dingin (cincin tepi ~57%) |
| ikan5 | nampan hijau | horizontal | ✅ membaik — panas pindah ke badan ikan (cincin tepi ~32%) |
| ikan2 | polos | horizontal | ✅ tetap baik (pita di badan, cincin tepi ~10%) |
| ikan3 | polos | horizontal | ⚠️ regresi — panas bergeser ke pita background atas, badan dingin |
| ikan4 | polos | horizontal | ✅ baik (fokus di kepala/mata ikan) |

**Keputusan: v2 tidak dipakai.** Augmentasi memperbaiki satu kasus (ikan
horizontal di nampan hijau) tetapi menyebabkan regresi di kasus lain (background
polos). **Net effect tidak meyakinkan** dan tidak layak menggantikan v1 yang
akurasinya sudah tinggi. Model di-rollback ke v1; bobot v2 disimpan sebagai
`ai-engine/best_visual_v2_experiment.pt` (tidak di-commit — sesuai .gitignore).

## 3. Hipotesis orientasi — ikan vertikal kurang terwakili (TIDAK TERBUKTI)

**Hipotesis:** karena kasus yang gagal (ikan1) adalah ikan vertikal, mungkin
training set didominasi ikan horizontal sehingga model kurang belajar pola ikan
vertikal.

**Metode uji:**
1. Percobaan deteksi otomatis via aspect ratio bounding-box (masking background
   dari 4 sudut foto). **Gagal sebagai metode** — seluruh foto DaFiF disimpan di
   kanvas persegi 3468x3468px, sehingga deteksi berbasis sudut selalu menghasilkan
   rasio ~1.00, bukan temuan orientasi asli.
2. Inspeksi visual manual atas 9 sampel foto training.

**Hasil:** distribusi orientasi **cukup seimbang (~5:4 horizontal:vertikal)**,
bukan timpang seperti dugaan. **Hipotesis orientasi tidak terbukti.**

## 4. Kesimpulan sementara

Akar masalah **kemungkinan besar bukan** bias sistematis pada background tertentu
atau ketimpangan orientasi. Kandidat penyebab yang lebih masuk akal:

- **Resolusi Grad-CAM yang kasar (7x7).** Pada peta sekecil ini, satu sel ≈ 32x32px
  di citra 224x224; badan ikan yang ramping/vertikal bisa jatuh di batas antar-sel
  sehingga atensi "bocor" ke sel tetangga yang memuat background.
- **Badan ikan yang reflektif dengan tekstur minim di area tengah.** Permukaan
  perak mengkilap dengan sedikit gradien lokal memberi sinyal gradien yang lemah di
  tengah badan, sehingga Grad-CAM (yang berbasis gradien) menyoroti tepi/kontras
  tinggi (termasuk batas ikan–nampan) alih-alih badan bagian dalam.

Artinya, gejala "panas di tepi nampan" bisa jadi **artefak alat visualisasi +
sifat citra**, bukan bukti kuat bahwa keputusan klasifikasi benar-benar digerakkan
oleh background. Akurasi validasi v1 yang tinggi (99.21%) konsisten dengan tafsir
ini.

## 5. Roadmap (pasca-MVP)

Investigasi lanjutan, **di luar scope MVP** dan tidak menghalangi rilis:

- Grad-CAM resolusi lebih tinggi dengan mem-hook layer conv lebih awal (peta 14x14
  / 28x28) untuk memastikan apakah "panas di tepi" hanya artefak resolusi 7x7.
- Coba **Grad-CAM++** atau Score-CAM untuk lokalisasi objek ramping yang lebih baik.
- **Segmentasi ikan sebelum inference** (mask background) untuk menguji langsung
  apakah keputusan berubah tanpa isyarat background — uji kausal spurious
  correlation yang sesungguhnya.

---

*Catatan metodologi: seluruh angka Grad-CAM di atas dihasilkan dari peta aktivasi
7x7 yang dinormalisasi (0–1) pada conv layer terakhir; "cincin tepi" = proporsi
energi peta di bingkai terluar 1 sel sebagai proksi kasar atensi background.*
