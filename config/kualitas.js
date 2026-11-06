/* Tingkat kualitas tampilan 3D. Dipilih otomatis lalu turun sendiri bila fps rendah (js/engine/dunia/dunia.js). */
window.KUALITAS = {
  urutan: ['hemat', 'sedang', 'tinggi'],
  tingkat: {
    hemat: { rasio: 1, lebarMaks: 1024, hiasan: false },
    sedang: { rasio: 1.25, lebarMaks: 1600, hiasan: true },
    tinggi: { rasio: 1.75, lebarMaks: 2400, hiasan: true }
  },
  fpsTurun: 26,      // rata-rata di bawah ini selama jendelaDetik: turun satu tingkat
  jendelaDetik: 3
};
