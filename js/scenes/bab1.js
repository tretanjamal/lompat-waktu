/* Bab 1 Hutan Meranti: tebak, tebang semua (dipandu), lompat, kembali, percobaan bebas dengan petunjuk bertingkat, sukses, kesimpulan, Papan Tantangan. */
(function () {
  var S = STR.bab1, H = STR.hud, SAS = Soal.SASARAN_BAB1;
  var JAM = { lx: 1168, ly: 600 };
  var pilihanArah = [{ id: 'naik', t: H.naik }, { id: 'turun', t: H.turun }, { id: 'tetap', t: H.tetap }];

  function chipsBebas(n, m, butuh) {
    return [
      { ikon: 'kapak', t: U.fmt(S.chipPohon, { n: n, butuh: butuh }), cukup: n >= butuh },
      { ikon: 'bibit', t: U.fmt(S.chipBibit, { m: m }) },
      { t: U.fmt(S.chipSasaran, { h: SAS.hutan, w: SAS.warga }) }
    ];
  }

  /* gerak menebang satu pohon: tiga ayunan lalu rebah */
  async function tebangPohon(A, z, t) {
    var h = A.hero;
    h.main('tebang', 760);
    for (var i = 0; i < 3; i++) {
      Aud.sfx('tebang');
      A.partikel.semprot({ x: t.x, y: t.y + 0.7, z: t.z, n: 5, warna: [Warna.PAL.kertas, Warna.PAL.bata], laju: 1.6, naik: 1.6, ukuran: 0.06, umur: 0.5 });
      await Tween.wait(250);
    }
    await z.tebang(t, h.x, h.z);
  }
  async function tanamBibit(A, z, i) {
    var t = z.slotBibit[i];
    A.hero.main('tanam', 540);
    await Tween.wait(170);
    Aud.sfx('tanam');
    z.tanam(i);
    A.partikel.semprot({ x: t.x, y: t.y + 0.15, z: t.z, n: 10, warna: [0x8A5F38, 0x6B4526, Warna.PAL.pucuk], laju: 1.6, naik: 2.2 });
    A.tambahDaun(1);
    await Tween.wait(300);
  }

  /* pasang sasaran pohon dan bibit untuk percobaan bebas */
  function siapkanBebas(A, z, keadaan) {
    A.bersihSasaran();
    keadaan.n = 0; keadaan.m = 0;
    z.slotPohon.forEach(function (t, i) {
      A.tambahSasaran({ id: 'p' + i, x: t.x, z: t.z, jari: 0.86, jarak: 1.25, yTombol: 1.95, kelas: 'pohon', label: H.labelPohon, kerja: async function (s) {
        A.hapusSasaran(s.id);
        await tebangPohon(A, z, t);
        keadaan.n++;
        A.aturChips(chipsBebas(keadaan.n, keadaan.m, keadaan.butuh));
        if (keadaan.n === keadaan.butuh) A.kata(S.siap);
      } });
    });
    z.slotBibit.forEach(function (t, i) {
      A.tambahSasaran({ id: 'b' + i, x: t.x, z: t.z, jari: 0.58, jarak: 0.85, label: H.labelTanah, kerja: async function (s) {
        A.hapusSasaran(s.id);
        await tanamBibit(A, z, i);
        keadaan.m++;
        A.aturChips(chipsBebas(keadaan.n, keadaan.m, keadaan.butuh));
      } });
    });
    A.aturChips(chipsBebas(0, 0, keadaan.butuh));
    /* isyarat diam 8 detik: langkah berikutnya, tanpa membocorkan jumlah bibit */
    A.utama = function () {
      if (keadaan.n < keadaan.butuh) { var p = terdekat(A, 'p'); if (p) return { x: p.x, z: p.z }; }
      if (keadaan.m < 2) { var b = terdekat(A, 'b'); if (b) return { x: b.x, z: b.z }; }
      return JAM;
    };
  }
  function terdekat(A, awalan) {
    var best = null, d = 1e9;
    Object.keys(A.sasaran).forEach(function (id) {
      if (id[0] !== awalan) return;
      var s = A.sasaran[id], dx = s.x - A.hero.x, dz = s.z - A.hero.z, k = dx * dx + dz * dz;
      if (k < d) { d = k; best = s; }
    });
    return best;
  }

  /* Lompat Waktu ke-2 dan seterusnya: lebih cepat dan bisa dilewati. Kembali ke hari ini bila gagal, atau bila ini peragaan yang masih disusul soal serupa. */
  function lompatUji(nilai, n, butuh, tebakan, tetapKembali) {
    var T = S.hasil[nilai.kelas], balik = !nilai.lulus || !!tetapKembali;
    return Lompat.jalankan({
      riwayat: nilai.riwayat, indikator: ['hutan', 'air', 'warga'], judul: T.judul, apa: T.apa, rantai: T.rantai,
      tebakan: tebakan ? { label: STR.indikator.hutan, pilih: H[tebakan], hasil: H[nilai.arahHutan] } : null,
      baik: nilai.lulus, cepat: true, bolehLewati: true, sasaran: { hutan: SAS.hutan, warga: SAS.warga },
      balik: balik, tombol: balik ? H.kembali : H.lanjut, pohon: n, butuh: butuh
    });
  }

  async function alur(z) {
    var A = Arena, gani, keadaan = { butuh: 3, n: 0, m: 0 }, gagal = 0, peragaan = false, percobaan = 0, lalu = null;
    Jurnal.sesi[1] = [];
    A.hero.taruh(-1.6, 4.3, 0.3);
    A.rako.taruh(0, 5, 4);
    Kamera.ikut(A.hero.x, A.hero.z); Kamera.lompatKe();
    Aud.musik('sunyi'); Aud.ambien('sunyi');
    Aud.pramuat('hutan');
    A.misi(S.misi, []);

    /* temui Pak Gani */
    A.fase = 'temui';
    gani = z.gani = A.tambahWarga('gani', -5.6, 3.1, 0.5);
    z.jalur.rintangan(-5.6, 3.1, 0.5);
    A.kata(S.masuk);
    A.tambahSasaran({ id: 'gani', x: -5.6, z: 3.1, jari: 0.95, berdiri: { x: -3.9, z: 3.4 }, yTombol: 1.35, label: S.labelGani, nama: S.labelGani, tepi: true });
    A.utama = { x: -5.6, z: 3.1 };
    A.tunjuk(-5.6, z.tinggi(-5.6, 3.1), 3.1, true);
    gani.anim = 'lambai';
    await A.tungguSasaran('gani');
    A.hapusSasaran('gani'); A.utama = null;
    gani.hadap(A.hero.x, A.hero.z); gani.anim = 'bicara';
    await A.dialog(S.gani, 'gani', 'senang');
    gani.anim = 'diam';
    await A.dialog(S.aturan, 'rako', 'pikir');

    /* percobaan 1: tebak, tebang semua, lompat */
    A.fase = 'tebak1';
    var P1 = S.pil1;
    var tebak1 = await A.tebak(S.tebak1, [{ id: 'naik', t: P1.naik }, { id: 'turun', t: P1.turun }, { id: 'tetap', t: P1.tetap }]);
    A.fase = 'tebang1';
    A.kata(S.tebangSatu);
    var pohonPertama = z.slotPohon[5];
    A.tambahSasaran({ id: 'p5', x: pohonPertama.x, z: pohonPertama.z, jari: 0.9, jarak: 1.25, yTombol: 1.95, kelas: 'pohon', label: H.labelPohon, nama: H.labelPohon, tepi: true, kerja: async function () { await tebangPohon(A, z, pohonPertama); } });
    A.utama = { x: pohonPertama.x, z: pohonPertama.z };
    A.tunjuk(pohonPertama.x, pohonPertama.y, pohonPertama.z, true);
    await A.tungguSasaran('p5');
    A.hapusSasaran('p5');
    A.utama = null;
    A.kunci = true;
    await A.tungguBicara();
    A.kata(S.tebangSemua);
    await z.tebangSemua(A.hero.x, A.hero.z);
    A.kunci = false;
    A.fase = 'jam1';
    A.kata(S.balik);
    A.utama = JAM;
    A.tunjukLayar(JAM.lx, JAM.ly, true);
    await A.tungguJam();
    A.utama = null;
    var r1 = Soal.bab1Semua(), akhir1 = r1[20], arah1 = Soal.arah(r1[0].air, akhir1.air);
    A.fase = 'lompat1';
    var T1 = S.hasil.semua;
    var o1 = await Lompat.jalankan({
      riwayat: r1, indikator: ['hutan', 'air', 'warga'], judul: T1.judul, apa: T1.apa, rantai: T1.rantai, baik: false, cepat: false, bolehLewati: false,
      tebakan: { label: STR.indikator.air, pilih: P1[tebak1], hasil: P1[arah1] },
      balik: true, tombol: H.kembali, pohon: 12, butuh: 3
    });
    Save.catat('kp-prediksi', tebak1 === arah1);
    Jurnal.catat(1, { semua: true, n: 12, m: 0, tebakan: P1[tebak1], akhir: akhir1, riwayat: r1, foto: o1.foto, kelas: 'semua' });
    var h1 = Math.round(akhir1.hutan);

    /* percobaan bebas */
    A.fase = 'bebas';
    A.kata(S.kembali1, 'rako', 'senang');
    await A.tungguBicara(1700);
    var hasil = null, akhirBaik = null;
    while (!hasil) {
      siapkanBebas(A, z, keadaan);
      A.fase = 'bebas';
      if (percobaan === 0) A.kata(S.bebas);
      /* petunjuk ke-2: sorot pohon dan tanah kosong */
      if (gagal === 2) Object.keys(A.sasaran).forEach(function (id) { A.sasaran[id].sorot = true; });
      await A.tungguJam();
      A.utama = null;
      await A.tungguLuang();
      A.bersihSasaran();
      var n = keadaan.n, m = keadaan.m, nilai = Soal.nilaiBab1(n, m, keadaan.butuh);
      A.fase = 'tebak2';
      var tebakan = await A.tebak(S.tebak2, pilihanArah);
      A.fase = 'lompat';
      percobaan++;
      Save.catat('kp-prediksi', tebakan === nilai.arahHutan);
      if (lalu) Save.catat('kp-variabel', (n === lalu.n) !== (m === lalu.m));   // antar percobaan, tepat satu hal yang berubah
      lalu = { n: n, m: m };
      if (n === 0) Save.catatMis('berhenti-terbaik');
      if (n > 6) Save.catatMis('tanam-cepat');
      var o = await lompatUji(nilai, n, keadaan.butuh, tebakan);
      Jurnal.catat(1, { n: n, m: m, tebakan: H[tebakan], akhir: nilai.akhir, riwayat: nilai.riwayat, foto: o.foto, kelas: nilai.kelas });
      if (nilai.lulus) { hasil = nilai; akhirBaik = nilai.akhir; break; }
      /* petunjuk bertingkat */
      gagal++;
      if (gagal < 3) {
        var pes = gagal === 1 ? U.fmt(S.petunjuk[nilai.kelas], { butuh: keadaan.butuh }) : U.fmt(S.petunjuk.sorot, { butuh: keadaan.butuh });
        A.kata(pes, 'rako', 'pikir');
      } else {
        /* petunjuk ke-3: Rako memperagakan, lalu soal serupa dengan angka lain */
        peragaan = true;
        A.fase = 'peragaan';
        var targetN = keadaan.butuh, targetM = keadaan.butuh === 3 ? 4 : 5;
        A.kunci = true;
        A.kata(keadaan.butuh === 3 ? S.petunjuk.peragaan : U.fmt(S.petunjuk.peragaan2, { n: targetN, m: targetM }), 'rako', 'senang');
        A.aturChips(chipsBebas(0, 0, keadaan.butuh));
        var i;
        for (i = 0; i < targetN; i++) {
          var pt = z.slotPohon[i + 3];
          A.tunjuk(pt.x, pt.y, pt.z, true); await A.hero.pergi(pt.x, pt.z, 1.25); await tebangPohon(A, z, pt);
          A.aturChips(chipsBebas(i + 1, 0, keadaan.butuh));
        }
        for (i = 0; i < targetM; i++) {
          var sb = z.slotBibit[i];
          A.tunjuk(sb.x, sb.y, sb.z, true); await A.hero.pergi(sb.x, sb.z, 0.85); await tanamBibit(A, z, i);
          A.aturChips(chipsBebas(targetN, i + 1, keadaan.butuh));
        }
        A.sembunyikanTangan();
        var adaSerupa = keadaan.butuh === 3, nd = Soal.nilaiBab1(targetN, targetM, keadaan.butuh);
        var od = await lompatUji(nd, targetN, keadaan.butuh, null, adaSerupa);
        Jurnal.catat(1, { n: targetN, m: targetM, tebakan: '-', akhir: nd.akhir, riwayat: nd.riwayat, foto: od.foto, kelas: nd.kelas });
        lalu = null;
        if (adaSerupa) {
          /* soal serupa: butuh 4 pohon, murid mencoba sendiri */
          keadaan.butuh = 4; gagal = 1;
          A.fase = 'serupa';
          A.kata(S.petunjuk.serupa, 'rako', 'pikir');
        } else {
          hasil = nd; akhirBaik = nd.akhir;
        }
      }
    }

    /* sukses: warna menetap, satwa kembali */
    A.fase = 'sukses';
    A.kunci = true;
    A.bersihSasaran();
    var hutanBerhasil = Math.round(akhirBaik.hutan);
    Save.atasiMis('berhenti-terbaik'); Save.atasiMis('tanam-cepat');
    Save.catat('solusi', gagal === 0);
    Save.catat('seimbang', !peragaan);
    A.hero.anim = 'sorak'; A.hero.ekspresi('sorak');
    Aud.musik('hutan'); Aud.ambien('hutan');
    z.sukses();
    A.tambahDaun(10, A.hero.x, A.hero.dasarY + 1, A.hero.z);
    A.misi(S.sukses, []);
    A.kata(S.sukses, 'rako', 'sorak');
    await A.tungguBicara(2200);
    A.hero.anim = 'diam'; A.hero.ekspresi('senang');
    gani.anim = 'lambai'; gani.ekspresi('sorak');
    A.kunci = false;
    await A.dialog(S.terimaKasih, 'gani', 'senang');
    gani.anim = 'diam';
    await A.dialog(S.rangkong, 'rako', 'sorak');
    await Papan.kartu('satwa', 'rangkong');
    await Papan.kartu('satwa', 'kupu');
    await A.dialog(S.keSimpul, 'rako', 'senang');

    /* kesimpulan + bukti */
    A.fase = 'simpul';
    var simpul = await Papan.simpul(S.simpul, { h1: h1, h2: hutanBerhasil });
    Save.data.kesimpulan[1] = U.fmt(S.simpul.catatan, { klaim: S.simpul.klaim[0].t, bukti: U.fmt(S.simpul.bukti[0].t, { h1: h1, h2: hutanBerhasil }) });
    Save.save();
    A.kata(S.simpul.selesai, 'rako', 'sorak');

    /* Papan Tantangan */
    A.fase = 'papan';
    await A.tungguBicara(600);
    await A.dialog(STR.papan.masuk, 'rako', 'senang');
    var papan = await Papan.mulai({ bab: 1, jumlah: 3 });

    var stars = peragaan ? 1 : (simpul.pertama ? 3 : 2);
    Save.data.sesi++;
    Save.catatBab(1, { selesai: true, stars: stars, kilat: papan.kilat, peragaan: peragaan, kesimpulanPertama: simpul.pertama, papan: papan });
    Scenes.go('hasil', { bab: 1, stars: stars, kilat: papan.kilat, papan: papan, pertama: simpul.pertama, kekuatan: S.kekuatan });
  }

  var tiket = 0;
  Scenes.add('bab1', {
    enter: function (akar) {
      var t = ++tiket;
      Aset3D.muatZona('hutan').then(function () {
        if (t !== tiket) return;   // murid sudah pindah layar sebelum model selesai dimuat
        var z = ZonaHutan.buat();
        Arena.mulai(akar, z, { bab: 1 });
        alur(z);
      });
    },
    update: function (dt) { Arena.update(dt); },
    exit: function () { tiket++; Arena.tutup(); }
  });
})();
