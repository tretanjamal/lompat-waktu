# KREDIT: Lompat Waktu: Penjaga Nusa Lestari
Kreator: Jamaluddin, UPTD SMPN 2 Robatal.

## Pustaka dan font
- **Three.js 0.160.0** (MIT): `js/engine/vendor/three.min.js`, `GLTFLoader.js` (diubah ke skrip klasik oleh `tools/vendor-three.js`), lisensi di `three-LICENSE.txt`. Disalin dari paket npm `three`.
- **Baloo 2** 700, 800 (SIL OFL 1.1, The Baloo 2 Project Authors): `assets/fonts/`, lisensi `OFL-Baloo2.txt`. Dari paket npm `@fontsource/baloo-2` 5.3.0.
- **Andika** 400, 700 (SIL OFL 1.1, SIL International): `assets/fonts/`, lisensi `OFL-Andika.txt`. Dari paket npm `@fontsource/andika` 5.3.0.

## Kecerdasan artifisial
- Kode program, konsep, draf teks, dan dunia 3D dari kode: Claude (Anthropic).
- Musik: Suno, lihat bagian Musik dan suara.
- Gambar: ChatGPT, lihat bagian Gambar.
- Model 3D: Meshy, lihat bagian Model 3D.
- Video pengantar: Google Flow, lihat bagian Video.
- Suara dari AI: belum ada. Narasi memakai suara perangkat. Rencana dan syaratnya ada di `docs/ASET-SUARA.md`.

## Gambar
- Potret tokoh (`por_*`), Kartu Sumber Daya (`kartu_*`), Kartu Satwa (`satwa_*`), `tangan_penunjuk`, `muat_pulau`, `sertifikat_hias`, `adegan_boros`, `adegan_bijak`, dan key art thumbnail: ChatGPT (OpenAI, tercatat di metadata C2PA berkas asli), paket ChatGPT Go, dibuat kreator 3 November 2026. Prompt tiap gambar ada di `docs/ASET-2D.md`. Diolah oleh `tools/proses-gambar.py`: pose dipisah, dipotong, diperkecil, dan dikompres ke WebP.
- Medali lokasi peta (`lok_*`), ikon (`ikon_*`), lencana (`lencana_*`), ikon batang nilai (`meter_*`), pusaran waktu (`lompat_pusaran`), papan judul (`logo_papan`), serta sampah, awan, pulau jauh, dan burung di dunia (`js/data/model3d/spr_*.js`): ChatGPT (OpenAI), paket ChatGPT Go, dibuat kreator 4 November 2026. Prompt ada di `docs/ASET-2D.md`. Diolah oleh `tools/proses-gambar.py`: tiap lembar dipisah menjadi 6 objek, diperkecil, dan dikompres ke WebP.
- `assets/img/pengembang.webp`: foto pengembang, dari Jamaluddin.

## Video
- `assets/video/intro_1.mp4`, `intro_2.mp4`: Google Flow (model Veo), dibuat kreator 4 November 2026. Paket langganan belum dikonfirmasi kreator. Prompt ada di `docs/ASET-VIDEO.md`. Diolah oleh `tools/proses-video.py`: diperkecil ke 720p, dan klip 2 dipotong.

## Model 3D
- 41 model (`js/data/model3d/`): Meshy Image to 3D, model Meshy 6, paket Pro (lisensi pribadi, hak komersial, milik pengguna), dibuat 3-4 November 2026 oleh `tools/meshy.py`. Input: gambar acuan ChatGPT di `assets/masuk/ref3d/`, prompt ada di `docs/ASET-3D.md`. Diolah oleh `tools/proses-3d.js`: segitiga diturunkan, warna tekstur dipanggang ke titik, kerangka tokoh dihitung sendiri. Gerak tokoh dari kode, bukan dari Meshy.
- Tanah, air, rumput, batu, tunggul, sampah, pelampung, dan jembatan dibuat dari kode. Kode yang sama (`js/engine/dunia/cadangan3d.js`, `js/engine/dunia/aktor.js`) menjadi cadangan bila model gagal dimuat.

## Musik dan suara
- Musik latar `bgm_judul`, `bgm_sunyi`, `bgm_hutan`, `bgm_sawah`, `bgm_laut`, `bgm_bukit`, `bgm_rapat`: Suno, dibuat kreator 3 November 2026, paket [ISI: paket Suno yang dipakai]. Prompt ada di `docs/ASET-AUDIO.md`. Dipotong menjadi loop mono oleh `tools/proses-musik.py`. Lisensi Suno berbeda antara paket gratis dan berbayar, jadi periksa sebelum publikasi.
- Ambient dan efek bunyi: sintesis WebAudio dari kode (`js/engine/audio.js`). Sintesis yang sama menjadi cadangan musik.
- Narasi: speechSynthesis di perangkat murid, naskah di `naskah_audio.csv`.
- Rekaman suara tokoh: belum ada. Bila ditambahkan, catat di sini sumbernya, tanggal, dan izin pengisi suara (lihat `docs/ASET-SUARA.md`).
