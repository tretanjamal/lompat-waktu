/* Suara tiap tokoh lewat speechSynthesis. Ubah angkanya di sini bila kurang pas setelah didengarkan.
   jenis: p pria, w wanita, suara perangkat yang sejenis didahulukan.
   pitch: tinggi nada bila suaranya sejenis. pitchLain: bila perangkat hanya punya suara lawan jenis (banyak perangkat hanya punya satu suara).
   rate: kecepatan. Batas pitch 0-2. panggilan: bunyi khas saat tokoh ini mulai berbicara.
   Hasil ukur suara Andika di Windows: nada hanya bergerak dari 106 Hz sampai 179 Hz, dan kecepatan 0,85-1,16 terdengar sama, jadi audio.js membulatkannya ke langkah 0,79 atau 1,26.
   Kejelasan didahulukan: nada dan kecepatan yang ekstrem membuat kalimat sulit ditangkap anak. */
window.SUARA = {
  namaPria: /andika|ardi|\bmale\b|pria|laki/i,
  tundaPanggilan: 0.42,   // detik: suara menunggu panggilan selesai
  jedaPanggilan: 8,       // detik: Rako memanggil lagi setelah diam selama ini atau setelah tokoh lain berbicara
  /* kalimat tanpa pembicara: soal, kartu, penjelasan */
  narasi: { jenis: 'w', pitch: 1, pitchLain: 1, rate: 1 },
  tokoh: {
    rako: { jenis: 'w', pitch: 1.3, pitchLain: 1.5, rate: 1, panggilan: true },     // burung kecil yang riang: paling tinggi, kecepatan biasa supaya jelas
    ratna: { jenis: 'w', pitch: 0.95, pitchLain: 1.05, rate: 0.92 },                    // kepala desa: tenang dan berwibawa
    sri: { jenis: 'w', pitch: 1.08, pitchLain: 1.2, rate: 1 },                     // petani: hangat
    mira: { jenis: 'w', pitch: 1.2, pitchLain: 1.35, rate: 1.1 },                  // insinyur muda: bersemangat
    gani: { jenis: 'p', pitch: 0.6, pitchLain: 0.5, rate: 0.88 },                  // tukang perahu: berat dan pelan
    bahar: { jenis: 'p', pitch: 0.85, pitchLain: 0.65, rate: 1 },                 // nelayan: lantang dan ramah
    laras: { jenis: 'w', pitch: 1.4, pitchLain: 1.8, rate: 1.06 },
    dewi: { jenis: 'w', pitch: 1.32, pitchLain: 1.72, rate: 1.02 },
    bayu: { jenis: 'p', pitch: 1.34, pitchLain: 1.05, rate: 1.08 }
  }
};
