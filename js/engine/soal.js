/* Soal: generator dari model, pemilihan adaptif, dan penilaian percobaan tiap bab. Jawaban diturunkan dari MODEL, jadi soal tidak bisa bertentangan
   dengan simulasi. Teks ada di js/data/soal.js. Jalan di peramban dan Node (test/logic). */
(function (root) {
  var BATAS = 3, TEBANG_PER_POHON = 0.85, TANAM_PER_BIBIT = 0.4;
  var HUTAN_AWAL = 70, AIR_AWAL = 75, TANAH_AWAL = 70, IKAN_AWAL = 70, TAMBANG_AWAL = 100;
  var SASARAN_BAB1 = { hutan: 70, warga: 70 }, SASARAN_BAB2 = { air: 75, tanah: 60 }, SASARAN_BAB3 = { ikan: 40, warga: 65 }, SASARAN_BAB4 = { tambang: 50, warga: 70 }, SASARAN_BAB5 = { hutan: 60, ikan: 20, tambang: 1, warga: 70 };
  function model() { return root.MODEL; }
  function teks() { return root.TEKS_SOAL; }
  function isi(s, o) { return s.replace(/\{(\w+)\}/g, function (m, k) { return o[k] != null ? o[k] : m; }); }
  function bilangan(rnd, n) { return Math.floor(rnd() * n); }

  function acakUrut(rnd, arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  /* pilihan naik, turun, tetap: yang benar diturunkan dari model */
  function pilihanArah(T, benar) {
    return ['naik', 'turun', 'tetap'].map(function (k) { return { t: T.pilihan[k], benar: k === benar, nilai: k, fb: k === benar ? '' : T.fb }; });
  }

  var S = {
    SASARAN_BAB1: SASARAN_BAB1, SASARAN_BAB2: SASARAN_BAB2, SASARAN_BAB3: SASARAN_BAB3, SASARAN_BAB4: SASARAN_BAB4, SASARAN_BAB5: SASARAN_BAB5, HUTAN_AWAL: HUTAN_AWAL,
    arah: function (awal, akhir) { return akhir >= awal + BATAS ? 'naik' : (akhir <= awal - BATAS ? 'turun' : 'tetap'); },

    /* ===== Bab 1: Hutan ===== */
    kontrolHutan: function (n, m) { return { tebang: n * TEBANG_PER_POHON, tanam: m * TANAM_PER_BIBIT }; },
    /* n pohon ditebang, m bibit ditanam, butuh = kebutuhan kayu warga saat ini */
    nilaiBab1: function (n, m, butuh) {
      var r = model().jalankan(S.kontrolHutan(n, m), 20), a = r[20], kelas;
      var lulus = n >= butuh && a.hutan >= SASARAN_BAB1.hutan && a.warga >= SASARAN_BAB1.warga;
      if (lulus) kelas = 'berhasil';
      else if (n === 0) kelas = 'nol';
      else if (n < butuh) kelas = 'kurang';
      else if (a.hutan < 25) kelas = 'habis';
      else kelas = 'menyusut';
      return { riwayat: r, akhir: a, lulus: lulus, kelas: kelas, arahHutan: S.arah(HUTAN_AWAL, a.hutan) };
    },
    /* percobaan pertama, semua pohon ditebang tiap tahun */
    bab1Semua: function () { return model().jalankan({ tebang: 12 }, 20); },

    /* ===== Bab 2: Air dan tanah. p pipa ditambal, t lereng berteras, s tumpukan sampah diangkat (masing-masing 0-3) ===== */
    kontrolAir: function (p, t, s) { return { pakaiAir: 5 - p * 0.5, pipaBocor: (3 - p) / 3, terasering: t / 3, sampahBaru: 1.5 - s / 3 }; },
    nilaiBab2: function (p, t, s) {
      var r = model().jalankan(S.kontrolAir(p, t, s), 20), a = r[20], airOk = a.air >= SASARAN_BAB2.air, tanahOk = a.tanah >= SASARAN_BAB2.tanah, cukup = airOk && tanahOk, bersih = s === 3;   // sungai bersih: semua sampah diangkat
      return { riwayat: r, akhir: a, lulus: cukup && bersih, kelas: cukup ? (bersih ? 'berhasil' : 'sampahAda') : (airOk ? 'tanahKurang' : (tanahOk ? 'airKurang' : 'duaKurang')), arahAir: S.arah(AIR_AWAL, a.air), arahTanah: S.arah(TANAH_AWAL, a.tanah) };
    },

    /* ===== Bab 3: Ikan. rapat = jala rapat, trip = kali melaut per tahun (0-5), c = tumpukan sampah pantai dibawa ke darat (0-3) ===== */
    kontrolIkan: function (rapat, trip, c) { return { tangkap: trip * 0.09, jalaRapat: !!rapat, sampahBaru: 5 - c * (3.5 / 3) }; },
    nilaiBab3: function (rapat, trip, c) {
      var r = model().jalankan(S.kontrolIkan(rapat, trip, c), 20), a = r[20], lulus = a.ikan >= SASARAN_BAB3.ikan && a.warga >= SASARAN_BAB3.warga && c === 3, kelas;   // pantai bersih: semua sampah dibawa ke darat
      if (lulus) kelas = 'berhasil';
      else if (trip === 0) kelas = 'berhenti';
      else if (a.ikan < 5) kelas = 'runtuh';
      else if (a.ikan < SASARAN_BAB3.ikan) kelas = 'berkurang';
      else if (c < 3) kelas = 'tercemar';
      else kelas = 'wargaKurang';
      return { riwayat: r, akhir: a, lulus: lulus, kelas: kelas, arahIkan: S.arah(IKAN_AWAL, a.ikan) };
    },

    /* ===== Bab 4: Tambang. g urat digali per tahun (0-8), daur = Mesin Daur Ulang menyala, k kincir angin (0-2) ===== */
    kontrolTambang: function (g, daur, k) { return { tambang: g, daurUlang: daur ? 0.5 : 0, energiBersih: k }; },
    nilaiBab4: function (g, daur, k) {
      var r = model().jalankan(S.kontrolTambang(g, daur, k), 20), a = r[20], lulus = a.tambang >= SASARAN_BAB4.tambang && a.warga >= SASARAN_BAB4.warga, kelas;
      if (lulus) kelas = 'berhasil';
      else if (a.tambang <= 0) kelas = 'habis';
      else if (a.tambang < SASARAN_BAB4.tambang) kelas = 'menipis';
      else if (g === 0) kelas = 'berhenti';
      else kelas = 'wargaKurang';
      return { riwayat: r, akhir: a, lulus: lulus, kelas: kelas, arahTambang: S.arah(TAMBANG_AWAL, a.tambang), tahunHabis: r.map(function (x) { return x.tambang; }).indexOf(0) };
    },
    /* uji khusus: 100 tahun setelah cadangan habis, tanpa menggali dan menebang lagi */
    bab4Seratus: function (awal) { return model().jalankan({ tambang: 0, tebang: 0 }, 100, awal); },

    /* ===== Bab 5: Rencana untuk seluruh pulau. h, l, t = boros | seimbang | ketat ===== */
    RENCANA: {
      hutan: { boros: { tebang: 6, tanam: 0 }, seimbang: { tebang: 2.5, tanam: 1.5 }, ketat: { tebang: 0, tanam: 0 } },
      laut: { boros: { tangkap: 0.45, jalaRapat: true }, seimbang: { tangkap: 0.18, jalaRapat: false }, ketat: { tangkap: 0, jalaRapat: false } },
      tambang: { boros: { tambang: 8, daurUlang: 0 }, seimbang: { tambang: 2, daurUlang: 0.5 }, ketat: { tambang: 0, daurUlang: 0 } }
    },
    kontrolRencana: function (h, l, t) { var R = S.RENCANA; return Object.assign({ sampahBaru: 1 }, R.hutan[h], R.laut[l], R.tambang[t]); },
    nilaiBab5: function (h, l, t) {
      var r = model().jalankan(S.kontrolRencana(h, l, t), 20), a = r[20], Z = SASARAN_BAB5, kurang = [];   // sasaran warga hanya tercapai bila ketiganya Seimbang
      if (a.hutan < Z.hutan) kurang.push('hutan');
      if (a.ikan < Z.ikan) kurang.push('ikan');
      if (a.tambang < Z.tambang) kurang.push('tambang');
      if (a.warga < Z.warga) kurang.push('warga');
      return { riwayat: r, akhir: a, lulus: !kurang.length, kurang: kurang, kelas: kurang.length ? kurang[0] : 'berhasil', arahWarga: S.arah(55, a.warga) };
    },

    /* ===== Generator soal ===== */
    /* soal skenario: naik, turun, atau tetap menurut model */
    skenarioHutan: function (rnd) {
      var n, m, h, coba = 0, T = teks().skenario;
      do {
        n = 1 + bilangan(rnd, 8); m = bilangan(rnd, 9);
        h = model().jalankan(S.kontrolHutan(n, m), 20)[20].hutan;
        coba++;
      } while (coba < 60 && (Math.abs(h - (HUTAN_AWAL + BATAS)) < 1.5 || Math.abs(h - (HUTAN_AWAL - BATAS)) < 1.5));
      return {
        id: 'gen-skenario-' + n + '-' + m, tag: 'kp-prediksi', tingkat: 2, generator: true, n: n, m: m, h: h,
        t: isi(T.t, { n: n, m: m }), kunci: T.kunci.map(function (k) { return isi(k, { n: n, m: m }); }),
        jelas: isi(T.jelas, { h: Math.round(h) }), pilihan: pilihanArah(T, S.arah(HUTAN_AWAL, h))
      };
    },
    /* pipa yang masih bocor dan air 20 tahun lagi */
    skenarioAir: function (rnd) {
      var T = teks().skenarioAir, b = bilangan(rnd, 4), r = model().jalankan(S.kontrolAir(3 - b, 3, 3), 20)[20].air;
      return {
        id: 'gen-air-' + b, tag: 'kp-prediksi', tingkat: 2, generator: true, b: b, nilai: r,
        t: isi(T.t, { b: b }), kunci: [isi(T.kunci, { b: b })], jelas: isi(T.jelas, { h: Math.round(r) }), pilihan: pilihanArah(T, S.arah(AIR_AWAL, r))
      };
    },
    /* jala dan banyak melaut, lalu ikan 20 tahun lagi */
    skenarioIkan: function (rnd) {
      var T = teks().skenarioIkan, trip, rapat, h, coba = 0;
      do {
        trip = 1 + bilangan(rnd, 5); rapat = rnd() < 0.5;
        h = model().jalankan(S.kontrolIkan(rapat, trip, 3), 20)[20].ikan;
        coba++;
      } while (coba < 60 && (Math.abs(h - (IKAN_AWAL + BATAS)) < 1.5 || Math.abs(h - (IKAN_AWAL - BATAS)) < 1.5));
      var jala = T.jala[rapat ? 'rapat' : 'longgar'];
      return {
        id: 'gen-ikan-' + trip + '-' + (rapat ? 'r' : 'l'), tag: 'kp-prediksi', tingkat: 2, generator: true, trip: trip, rapat: rapat, nilai: h,
        t: isi(T.t, { n: trip, jala: jala }), kunci: [isi(T.kunci, { n: trip }), jala], jelas: isi(T.jelas, { h: Math.round(h) }), pilihan: pilihanArah(T, S.arah(IKAN_AWAL, h))
      };
    },
    /* membaca data: kapan cadangan habis bila digali sama banyak tiap tahun */
    tambangHabis: function (rnd) {
      var T = teks().tambangHabis, g = [4, 5, 8, 10, 20][bilangan(rnd, 5)], r = model().jalankan({ tambang: g }, 30), th = r.map(function (x) { return x.tambang; }).indexOf(0);
      var salah = [th + 5, th - 3 > 0 ? th - 3 : th + 3, th * 2].filter(function (x, i, a) { return x !== th && a.indexOf(x) === i; }).slice(0, 2);
      return {
        id: 'gen-habis-' + g, tag: 'kp-data', tingkat: 2, generator: true, g: g, tahun: th,
        t: isi(T.t, { g: g }), kunci: [isi(T.kunci, { g: g })], jelas: isi(T.jelas, { g: g, th: th }),
        pilihan: [{ t: isi(T.pilihan, { th: th }), benar: true, nilai: th, fb: '' }].concat(salah.map(function (x) { return { t: isi(T.pilihan, { th: x }), nilai: x, fb: T.fb }; }))
      };
    },
    /* membaca data: pola dari tiga titik model */
    _dataPola: function (rnd, nama, awal, buatKontrol, prefix) {
      var T = teks().data, r, a, b, arahA, arahB, coba = 0, kontrol;
      do {
        kontrol = buatKontrol(rnd);
        r = model().jalankan(kontrol.k, 20); a = r[10][nama]; b = r[20][nama];
        arahA = S.arah(awal, a); arahB = S.arah(a, b);
        coba++;
      } while (coba < 80 && (arahA !== arahB || arahA === 'tetap'));
      var benar = arahA === arahB ? arahA : S.arah(awal, b), A = Math.round(a), B = Math.round(b), L = teks().nama[nama];
      return {
        id: 'gen-' + prefix + '-' + kontrol.id, tag: 'kp-data', tingkat: 2, generator: true, nilai: [awal, A, B],
        t: isi(T.t, { nama: L, awal: awal, a: A, b: B }), kunci: [String(awal), String(A), String(B)],
        jelas: isi(T.jelas, { awal: awal, a: A, b: B }), pilihan: pilihanArah(T, benar)
      };
    },
    dataHutan: function (rnd) { return S._dataPola(rnd, 'hutan', HUTAN_AWAL, function (x) { var n = 1 + bilangan(x, 8), m = bilangan(x, 9); return { k: S.kontrolHutan(n, m), id: n + '-' + m }; }, 'data'); },
    dataAir: function (rnd) { return S._dataPola(rnd, 'air', AIR_AWAL, function (x) { var p = bilangan(x, 4), s = bilangan(x, 4); return { k: S.kontrolAir(p, 3, s), id: p + '-' + s }; }, 'dataair'); },
    dataIkan: function (rnd) { return S._dataPola(rnd, 'ikan', IKAN_AWAL, function (x) { var t = bilangan(x, 6), r = x() < 0.5; return { k: S.kontrolIkan(r, t, 3), id: t + (r ? 'r' : 'l') }; }, 'dataikan'); },
    dataTambang: function (rnd) { return S._dataPola(rnd, 'tambang', TAMBANG_AWAL, function (x) { var g = 1 + bilangan(x, 4), d = x() < 0.5; return { k: S.kontrolTambang(g, d, 0), id: g + (d ? 'd' : 'n') }; }, 'datatambang'); },

    /* generator per bab: skenario (memprediksi) dan data (membaca data) */
    _gen: function (bab, rnd) {
      var G = {
        1: { skenario: S.skenarioHutan, data: S.dataHutan },
        2: { skenario: S.skenarioAir, data: S.dataAir },
        3: { skenario: S.skenarioIkan, data: S.dataIkan },
        4: { skenario: S.tambangHabis, data: S.dataTambang }
      };
      return G[bab] || G[[1, 2, 3, 4][bilangan(rnd, 4)]];
    },

    /* soal berikutnya untuk tingkat ini. sudah: id yang sudah muncul. belum: tag yang belum punya bukti, diutamakan agar Catatan Guru makin lengkap. */
    ambil: function (bank, bab, tingkat, sudah, rnd, belum) {
      belum = belum || [];
      var cocok = bank.filter(function (q) { return q.bab.indexOf(bab) >= 0 && sudah.indexOf(q.id) < 0; });
      var pas = cocok.filter(function (q) { return q.tingkat === tingkat; });
      var q, butuhData = belum.indexOf('kp-data') >= 0, G = S._gen(bab, rnd);
      if (tingkat === 2 && (butuhData || rnd() < 0.5)) {
        q = butuhData || rnd() < 0.4 ? G.data(rnd) : G.skenario(rnd);
        if (sudah.indexOf(q.id) < 0) return S.acakPilihan(q, rnd);
      }
      if (!pas.length) pas = cocok;
      if (!pas.length) { q = G.skenario(rnd); return S.acakPilihan(q, rnd); }
      /* utamakan tag tanpa bukti, lalu tag yang belum muncul di papan ini */
      var tagSudah = sudah.map(function (id) { var f = bank.filter(function (x) { return x.id === id; })[0]; return f && f.tag; });
      var baru = pas.filter(function (x) { return tagSudah.indexOf(x.tag) < 0; });
      var perlu = baru.filter(function (x) { return belum.indexOf(x.tag) >= 0; });
      var dari = perlu.length ? perlu : (baru.length ? baru : pas);
      return S.acakPilihan(dari[Math.floor(rnd() * dari.length)], rnd);
    },
    /* soal serupa untuk soal yang salah: tag sama bila ada, selain itu generator atau soal yang sama */
    serupa: function (bank, soal, bab, sudah, rnd) {
      var lain = bank.filter(function (q) { return q.bab.indexOf(bab) >= 0 && q.tag === soal.tag && sudah.indexOf(q.id) < 0; });
      if (lain.length) return S.acakPilihan(lain[Math.floor(rnd() * lain.length)], rnd);
      if (soal.generator) { var G = S._gen(bab, rnd); return S.acakPilihan(soal.tag === 'kp-data' ? G.data(rnd) : G.skenario(rnd), rnd); }
      return S.acakPilihan(soal, rnd);
    },
    acakPilihan: function (q, rnd) {
      var salin = Object.assign({}, q);
      salin.pilihan = acakUrut(rnd, q.pilihan);
      return salin;
    },
    /* tingkat adaptif per soal: 3 benar beruntun naik, 2 salah beruntun turun */
    aturTingkat: function (keadaan, benarLangsung) {
      if (benarLangsung) { keadaan.benar = (keadaan.benar || 0) + 1; keadaan.salah = 0; }
      else { keadaan.salah = (keadaan.salah || 0) + 1; keadaan.benar = 0; }
      if (keadaan.benar >= 3) { keadaan.tingkat = Math.min(3, keadaan.tingkat + 1); keadaan.benar = 0; }
      if (keadaan.salah >= 2) { keadaan.tingkat = Math.max(1, keadaan.tingkat - 1); keadaan.salah = 0; }
      return keadaan.tingkat;
    }
  };
  root.Soal = S;
  if (typeof module !== 'undefined' && module.exports) module.exports = S;
})(typeof window !== 'undefined' ? window : globalThis);
