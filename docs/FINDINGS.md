# FINDINGS — Investigasi Explainability Model Visual (Grad-CAM)

Dokumen ini mencatat kronologi jujur investigasi kualitas atensi model visual
FreshCo (MobileNetV3-Small, klasifikasi 3 tier). Tujuannya: transparansi
metodologi — apa yang dicoba, apa yang berhasil, apa yang tidak, dan mengapa.

**Status model saat ini: model retrain aktif (akurasi 85.00% pada split bebas
kebocoran data).** Keterbatasan explainability di bawah ini diketahui, terdokumentasi,
dan sebagian sudah ditindaklanjuti di sisi visualisasi — bukan sesuatu yang disembunyikan.

**Update terakhir:** ditemukan data leakage pada split awal (akurasi 99.21% yang
*inflated*); model dilatih ulang dengan split stratified berbasis grup, akurasi turun
ke 85.00% yang defensible. Bagian 1–6 di bawah adalah kronologi investigasi Grad-CAM
pada model awal; temuan terbaru (data leakage, transferability Grad-CAM, studi kasus
confidence) ada di bagian bawah dokumen. Grad-CAM++ layer 14x14 ternyata tidak transfer
ke model retrain dan dikembalikan ke basic Grad-CAM pada layer terakhir.

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

Investigasi lanjutan (sebagian **sudah dikerjakan**, lihat bagian 6):

- ✅ Grad-CAM resolusi lebih tinggi (peta 14x14) — **diadopsi**.
- ✅ **Grad-CAM++** untuk lokalisasi objek ramping — **diadopsi**.
- ⬜ Score-CAM — belum dicoba (pasca-MVP).
- ⬜ **Segmentasi ikan sebelum inference** (mask background) untuk menguji langsung
  apakah keputusan berubah tanpa isyarat background — uji kausal spurious
  correlation yang sesungguhnya. Ini uji terhadap MODEL, di luar scope MVP.

---

## 6. Perbaikan kualitas Grad-CAM (inference-time, model TIDAK diubah)

Menindaklanjuti kesimpulan bagian 4 (akar masalah = kualitas visualisasi, bukan
model), metode Grad-CAM di `ai-engine/model.py` diperbaiki **tanpa menyentuh bobot
model v1** — murni cara menghasilkan heatmap.

Dua perubahan, diuji bertahap terhadap 5 foto yang sama (baseline = Grad-CAM standar
v1 pada layer 7x7, diukur ulang pada model v1 — bukan angka v2 di bagian 2):

- **Tahap 1 — target layer 14x14.** Hook dipindah dari blok konv terakhir
  (`features[12]`, 7x7) ke blok 14x14 terdalam (`features[8]`). Membaik untuk
  ikan1/2/3 tapi belum cukup untuk ikan1 (badan ikan masih dingin).
- **Tahap 2 — Guided Grad-CAM.** Ditolak: tidak memperbaiki ikan1, hasilnya berupa
  bintik piksel jarang yang sulit ditafsir untuk pertanyaan "badan vs background",
  dan menambah beban inferensi (override ReLU) yang tak sepadan untuk MVP sinkron.
- **Tahap 3 — Grad-CAM++ pada layer 14x14 → DIADOPSI.**

Metrik "cincin tepi" (proporsi energi peta di bingkai terluar 32px pada citra 224px;
setara cincin luar 7x7 sehingga sebanding lintas resolusi):

| Foto | v1 baseline 7x7 | Grad-CAM++ 14x14 | Keterangan |
|---|---|---|---|
| ikan1 (nampan hijau, vertikal) | 57.6% | **38.6%** | ✅ badan ikan kini tersorot, bukan tepi nampan |
| ikan2 (polos) | 59.6% | **38.3%** | ✅ panas di badan/sirip |
| ikan3 (polos, tadinya bermasalah) | 61.2% | **26.9%** | ✅ panas mengikuti kontur ikan |
| ikan4 (polos) | 27.5% | **20.9%** | ✅ panas di kepala/badan |
| ikan5 (nampan hijau, horizontal) | 41.2% | 49.7% | ⚠️ satu-satunya yang tidak membaik (badan ikan mepet tepi frame) |

**Kesimpulan:** Grad-CAM++ pada 14x14 memperbaiki 4/5 kasus, termasuk dua kasus
bermasalah yang didokumentasikan (ikan1 & ikan3), baik secara metrik maupun visual.
Ini memperkuat hipotesis bagian 4: masalahnya di alat visualisasi, bukan bias model.
ikan5 tidak membaik — kemungkinan properti model v1 yang sebenarnya pada foto itu,
bukan sekadar artefak resolusi; jadi tetap dicatat jujur sebagai keterbatasan.

Perubahan hanya di kelas `GradCAM` (`ai-engine/model.py`); output prediksi (tier,
confidence) identik dengan sebelumnya.

---

*Catatan metodologi: angka Grad-CAM baseline bagian 1–4 dihasilkan dari peta 7x7
yang dinormalisasi (0–1); "cincin tepi" bagian 6 diukur pada citra 224px (bingkai
32px) agar sebanding lintas resolusi peta.*

---

## Temuan: Data Leakage pada Split Awal

- Split train/valid/test awal dilakukan acak per-foto, bukan per grup pemotretan
- Audit menemukan 100% grup (63/63, dikelompokkan by hari+sesi+spesies) tersebar ke lebih
  dari satu split — konfirmasi kebocoran data
- Perbaikan: split ulang stratified di level grup, verifikasi 0% kebocoran
- Model dilatih ulang dengan arsitektur dan hyperparameter identik, hasil akurasi test set
  turun dari 99.21% menjadi 85.00% — penurunan ini MENGKONFIRMASI leakage, bukan model
  memburuk
- Properti keselamatan utama tetap terjaga: 0 kesalahan klasifikasi Tier1_Kritis <-> Tier3_Prima
  baik sebelum maupun sesudah perbaikan split
- Titik lemah yang teridentifikasi: recall Tier3_Prima 65% (kelas dengan data paling sedikit,
  15 dari 63 grup) — kesalahan mengarah ke arah aman (ikan segar dikira kurang segar, bukan
  sebaliknya)

## Temuan: Grad-CAM++ Tidak Transfer ke Model Retrained

- Teknik Grad-CAM++ pada layer 14x14 yang di-tuning untuk model awal menghasilkan heatmap
  yang jauh lebih noise saat diterapkan ke model hasil retrain (gradien dari classifier yang
  dilatih ulang berbeda karakteristiknya)
- Solusi: kembali ke basic Grad-CAM pada layer terakhir, hasil lebih konsisten
- Keputusan Tier tidak terpengaruh oleh kualitas heatmap — heatmap murni alat bantu visualisasi,
  bukan bagian dari proses keputusan klasifikasi

## Studi Kasus: Peringatan Confidence Rendah Bekerja pada Foto Luar-Domain

- Uji dengan foto ikan di background batu/beton basah (kondisi di luar domain dataset training
  yang seluruhnya berupa nampan putih/bak plastik hijau, indoor)
- Model menghasilkan confidence 57% (di bawah ambang 80%), sistem menampilkan peringatan
  "Foto kurang jelas" — sesuai desain, bukan memberi jawaban salah dengan percaya diri
- Ini bukti nyata bahwa mitigasi confidence-threshold berfungsi pada kasus yang genuinely sulit,
  bukan sekadar teori
