/* Model sederhana Lompat Waktu: satu langkah = 1 tahun, semua indikator 0-100, deterministik.
   Penjelasan tiap rumus untuk guru ada di docs/MODEL.md. Draf Fase 0, disetel lagi di Fase 2.
   Jalan di peramban (window.MODEL) dan di Node (test/logic). */
(function (root) {
  'use strict';

  var P = {
    awal: { hutan: 70, ikan: 70, air: 75, tanah: 70, tambang: 100, sampah: 15, warga: 55 },
    hutan: { laju: 0.10, ambangBawah: 10, ambangAtas: 25 },   // pulih logistik, di bawah ambang pulih melambat lalu berhenti
    ikan: { laju: 0.50, ambangBawah: 8, ambangAtas: 20, faktorJalaRapat: 0.6 }, // jala rapat ikut menangkap anak ikan
    air: { resapanDasar: 2, resapanHutan: 4, bocor: 1.5, cemarSampah: 0.02 },
    tanah: { erosiTanpaTeras: 2.0, erosiDenganTeras: 0.3, pulihAlami: 0.1, pulihKompos: 0.6 },
    butuh: { kayu: 2.5, ikan: 9, logam: 4 },                  // kebutuhan warga per tahun
    bobot: { kayu: 0.25, pangan: 0.35, logam: 0.2, air: 0.2 },
    wargaLaju: 0.2,
    wargaCukup: 80,    // nilai warga bila semua kebutuhan pas terpenuhi
    wargaLebih: 1.3,   // hasil berlebih masih terasa enak sampai batas ini, itulah godaan memakai berlebihan
    sampah: { urai: 0.02 }
  };

  /* Kontrol bawaan: warga memakai alam secukupnya tanpa aturan khusus. Tiap bab mengubah sebagian saja. */
  var KONTROL_DASAR = {
    tebang: 2.5, tanam: 0,          // satuan hutan per tahun
    tangkap: 0.18, jalaRapat: false, // bagian stok ikan yang ditangkap per tahun
    pakaiAir: 3.5, pipaBocor: false, terasering: true, kompos: false,
    tambang: 4, daurUlang: 0,       // satuan cadangan per tahun, bagian logam dari daur ulang (0-0,8)
    energiBersih: 0,                // kincir angin: memenuhi kebutuhan tanpa menggali
    sampahBaru: 1.5                 // sampah per tahun yang tidak terkelola
  };
  /* pipaBocor dan terasering boleh true/false atau pecahan 0-1 (mis. 2 dari 3 lereng berteras). */

  function jepit(x, a, b) { return x < a ? a : (x > b ? b : x); }
  function jepit100(x) { return jepit(x, 0, 100); }
  function cukup(dapat, butuh) { return butuh <= 0 ? 1 : jepit(dapat / butuh, 0, 1); }
  function cukupLebih(dapat, butuh) { return butuh <= 0 ? 1 : jepit(dapat / butuh, 0, P.wargaLebih); }
  function salin(o) { var r = {}, k; for (k in o) r[k] = o[k]; return r; }
  function gabung(a, b) { var r = salin(a), k; for (k in b) r[k] = b[k]; return r; }

  /* Faktor pulih: 0 di bawah ambang bawah, naik halus sampai 1 di ambang atas. */
  function faktorAmbang(x, bawah, atas) { return jepit((x - bawah) / (atas - bawah), 0, 1); }

  function langkah(s, k) {
    var n = salin(s), h = P.hutan, f = P.ikan;

    // Sampah menumpuk, sedikit terurai, dan melemahkan laut serta air.
    n.sampah = jepit100(s.sampah + k.sampahBaru - P.sampah.urai * s.sampah);

    // Hutan: pulih logistik + bibit - tebangan. Tebangan nyata dibatasi yang tersedia.
    var pulihH = h.laju * s.hutan * (1 - s.hutan / 100) * faktorAmbang(s.hutan, h.ambangBawah, h.ambangAtas);
    var kayu = Math.min(k.tebang, s.hutan);
    n.hutan = jepit100(s.hutan + pulihH + k.tanam - kayu);

    // Ikan: pulih logistik dikurangi tangkapan. Jala rapat dan sampah menurunkan laju pulih.
    var lajuI = f.laju * (k.jalaRapat ? f.faktorJalaRapat : 1) * (1 - s.sampah / 200);
    var pulihI = lajuI * s.ikan * (1 - s.ikan / 100) * faktorAmbang(s.ikan, f.ambangBawah, f.ambangAtas);
    var hasilIkan = k.tangkap * s.ikan;
    n.ikan = jepit100(s.ikan + pulihI - hasilIkan);

    // Air bersih: hutan membantu tanah menyerap hujan; boros, bocor, dan sampah menguranginya.
    var resapan = P.air.resapanDasar + P.air.resapanHutan * (s.hutan / 100);
    n.air = jepit100(s.air + resapan - k.pakaiAir - (+k.pipaBocor) * P.air.bocor - P.air.cemarSampah * s.sampah);

    // Tanah subur: terkikis lebih cepat di lereng tanpa teras dan tanpa pohon.
    var erosi = (P.tanah.erosiTanpaTeras + (P.tanah.erosiDenganTeras - P.tanah.erosiTanpaTeras) * (+k.terasering)) * (1.5 - s.hutan / 100);
    n.tanah = jepit100(s.tanah - erosi + (k.kompos ? P.tanah.pulihKompos : P.tanah.pulihAlami));

    // Tambang hanya berkurang. Daur ulang memberi logam tanpa menggali lebih banyak.
    var gali = Math.min(k.tambang, s.tambang);
    var logam = gali / (1 - jepit(k.daurUlang, 0, 0.8)) + k.energiBersih;
    n.tambang = jepit100(s.tambang - gali);

    // Warga: sejahtera bila kebutuhan terpenuhi, bergerak pelan menuju sasaran.
    var B = P.bobot, b = P.butuh;
    var padi = cukup(s.air, 50) * cukup(s.tanah, 50);
    var pangan = 0.5 * cukupLebih(hasilIkan, b.ikan) + 0.5 * padi;
    var sasaran = P.wargaCukup * (B.kayu * cukupLebih(kayu, b.kayu) + B.pangan * pangan + B.logam * cukupLebih(logam, b.logam) + B.air * cukup(s.air, 50));
    sasaran *= 1 - s.sampah / 300;
    n.warga = jepit100(s.warga + P.wargaLaju * (sasaran - s.warga));

    return n;
  }

  function jalankan(kontrol, tahun, awal) {
    var k = gabung(KONTROL_DASAR, kontrol || {}), s = salin(awal || P.awal), riwayat = [salin(s)], t;
    for (t = 0; t < (tahun === undefined ? 20 : tahun); t++) { s = langkah(s, k); riwayat.push(s); }
    return riwayat;
  }

  /* Enam strategi uji dari kriteria selesai: hasilnya harus wajar dan tidak ada yang unggul di semua indikator. */
  var STRATEGI = {
    boros: { tebang: 6, tanam: 0, tangkap: 0.4, jalaRapat: true, pakaiAir: 6, pipaBocor: true, terasering: false, tambang: 8, sampahBaru: 4 },
    bijak: { tebang: 2.5, tanam: 1.5, tangkap: 0.18, pakaiAir: 3.5, terasering: true, kompos: true, tambang: 2, daurUlang: 0.5, sampahBaru: 0.5 },
    abai: { tebang: 4, tanam: 0, tangkap: 0.28, pakaiAir: 5, pipaBocor: true, terasering: false, tambang: 4, sampahBaru: 3 },
    berhenti: { tebang: 0, tanam: 0, tangkap: 0, pakaiAir: 1.5, terasering: true, tambang: 0, sampahBaru: 0.3 },
    habiskanTambang: { tebang: 2.5, tanam: 1.5, tangkap: 0.18, pakaiAir: 3.5, terasering: true, kompos: true, tambang: 8, daurUlang: 0, sampahBaru: 0.5 },
    ikanBerlebih: { tebang: 2.5, tanam: 1.5, tangkap: 0.45, jalaRapat: true, pakaiAir: 3.5, terasering: true, kompos: true, tambang: 2, daurUlang: 0.5, sampahBaru: 0.5 }
  };

  /* Sasaran misi akhir. Angka mengikuti misi pada brief Lab Pulau Lestari (257). */
  var SASARAN = { hutan: 60, ikan: 20, warga: 50, tambang: 1 };

  root.MODEL = { P: P, KONTROL_DASAR: KONTROL_DASAR, STRATEGI: STRATEGI, SASARAN: SASARAN, langkah: langkah, jalankan: jalankan };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.MODEL;
})(typeof window !== 'undefined' ? window : globalThis);
