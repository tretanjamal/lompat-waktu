/* Zona Bukit Batu (Bab 4): bukit berurat logam dan batu bara, empat mulut tambang, Mesin Daur Ulang, kincir angin.
   Bongkah di bukit berkurang mengikuti cadangan dan tidak pernah kembali, sedangkan hutan di sekitarnya bisa tumbuh lagi. */
(function (root) {
  var B = Bentuk, W = Warna.W, campur = Warna.campur, gelap = Warna.gelap, PAL = Warna.PAL, C = Cadangan, UW = Warna.U;
  var jepit = B.jepit, halus = B.halus, derauLapis = B.derauLapis, M = B.M, acak = B.acak, gumpal = B.gumpal;

  var URAT = [[-4.4, -4.5], [-1.8, -5], [3.3, -5], [5.8, -4.5]];
  var LUBANG = { x: 0.8, z: -5.4 };
  var MESIN = { x: -3, z: 1.8 };
  var KINCIR = [[6.2, 0.3], [7.7, -1.6]];
  var PUSAT_WARNA = { x: 0.4, z: -2, r: 15 };

  function tinggi(x, z) {
    var h = (derauLapis(x * 0.12 + 13, z * 0.12 + 6) - 0.5) * 0.5;
    h += halus(-3.9, -13, z) * (4.4 + derauLapis(x * 0.1 + 3, z * 0.1) * 6.5);
    h += halus(-11, -24, x) * 2.4 + halus(13, 26, x) * 2.4;
    return h;
  }

  function buat() {
    var scene = new THREE.Scene(), kabut = 0xE0D8C2, i, x, z;
    scene.background = new THREE.Color(kabut);
    scene.fog = new THREE.Fog(kabut, 23, 52);
    var cahaya = Dunia.pasangCahaya(scene, 1.5, 2.55);
    var bahan = Bahan.pulih();

    var rumputW = campur(W(PAL.pucuk), W(PAL.zamrud), 0.3), rumputT = W(PAL.pucuk), abu = new THREE.Color(0x8A8373), abuT = new THREE.Color(0xBDB5A2), tanah = campur(W(PAL.bata), W(PAL.kertas), 0.3);
    scene.add(Medan.buat({
      lebar: 76, dalam: 60, nx: 54, nz: 46, cz: -7, tinggi: tinggi,
      warna: function (px, py, pz) {
        var n1 = derauLapis(px * 0.3, pz * 0.3);
        if (pz < -3.7) return campur(abu, abuT, jepit(n1 * 0.9 + (py - 1) * 0.05, 0, 1));
        if (pz < -2.3) return campur(tanah, abu, n1);
        return campur(rumputW, rumputT, jepit(n1 * 1.15 - 0.05 + py * 0.03, 0, 1));
      }
    }, 181, bahan));

    /* inti statis */
    var R = new B.Rakit(281), rng = acak(51);
    URAT.forEach(function (p) { C.mulutTambang(R, p[0], tinggi(p[0], p[1]) - 0.08, p[1], 1.3); });
    /* rel dan gerobak dari tiap mulut ke tempat kumpul */
    var kayu = gelap(W(PAL.bata), 0.7);
    URAT.forEach(function (p) { for (i = 0; i < 4; i++) R.tambah(B.Kotak(1, 0.06, 0.14), kayu, M(p[0], tinggi(p[0], p[1] + 0.5 + i * 0.42) + 0.04, p[1] + 0.5 + i * 0.42), 0.06); });
    C.mesinDaur(R, MESIN.x, tinggi(MESIN.x, MESIN.z), MESIN.z);
    C.tumpukLogam(R, MESIN.x - 1.9, tinggi(MESIN.x - 1.9, MESIN.z + 0.5), MESIN.z + 0.5);
    if (!C.hiasan(R, 'prop_gerobak', MESIN.x - 2.1, tinggi(MESIN.x - 2.1, MESIN.z - 0.6), MESIN.z - 0.6, 1, 0.5)) C.tumpukLogam(R, MESIN.x - 2.1, tinggi(MESIN.x - 2.1, MESIN.z - 0.2), MESIN.z - 0.2);
    /* panel surya di dekat kincir: listrik tanpa membakar batu bara */
    [[10.6, -0.6, -0.4], [12, 0.5, -0.5]].forEach(function (p) { C.hiasan(R, 'prop_panel_surya', p[0], tinggi(p[0], p[1]), p[1], 1, p[2]); });
    /* pondasi kincir */
    KINCIR.forEach(function (k) { R.tambah(B.Tabung(0.58, 0.68, 0.22, 8), abuT, M(k[0], tinggi(k[0], k[1]) + 0.08, k[1]), 0.04); });
    C.pasang(R, 'bld_rumah', -10.2, tinggi(-10.2, -2.2), -2.2, 1, 0.4, function () { C.rumah(R, -10.2, tinggi(-10.2, -2.2), -2.2, 1, 0.4); });
    C.kelapa(R, 9.8, tinggi(9.8, 2.6), 2.6, 0.9, 1980);
    var halangan = [], ukur;
    [[-8.4, -3], [10.8, -3], [-0.2, -3.6], [8, -5.4]].forEach(function (p, idx) { ukur = 1 + idx * 0.25; C.batu(R, p[0], tinggi(p[0], p[1]), p[1], ukur, 910 + idx); halangan.push([p[0], p[1], ukur * 0.55]); });
    for (i = 0; i < 5; i++) {
      x = -7 + rng() * 15; z = 0.4 + rng() * 3.6;
      if (Math.abs(x - 1) + Math.abs(z - 3.8) < 2.4 || Math.abs(x - MESIN.x) + Math.abs(z - MESIN.z) < 3.4 || Math.abs(x + 6.2) + Math.abs(z - 0.6) < 2.2) continue;
      ukur = 0.5 + rng() * 0.4; C.semak(R, x, tinggi(x, z), z, ukur, 1700 + i); halangan.push([x, z, ukur * 0.7]);
    }
    scene.add(R.jadi(bahan));

    /* hutan di sisi bukit dan bibit di lubang tambang */
    var jauh = [], calonJauh = [];
    for (i = 0; i < 40; i++) {
      x = -32 + rng() * 64; z = -30 + rng() * 26;
      if (Math.abs(x) < 10 && z > -14) continue;
      jauh.push({ x: x, z: z, s: 1 + rng() * 0.5 });
    }
    for (i = 0; i < 22; i++) { x = -11 + rng() * 22; z = -15 + rng() * 8; calonJauh.push({ x: x, z: z, s: 0.9 + rng() * 0.4 }); }
    var hutan = new Hutan({ scene: scene, tinggi: tinggi, nilaiAwal: 70, bahan: bahan, dekat: [], jauh: jauh, calon: [{ x: LUBANG.x, z: LUBANG.z, s: 1.05 }], calonJauh: calonJauh });
    var slotLubang = hutan.slot.filter(function (t) { return t.jenis === 'calon'; })[0];
    slotLubang.animasi = true;   // tumbuh diatur sendiri, tidak mengikuti ambang
    var bibit = new THREE.Mesh(C.geoBibit(), bahan);
    bibit.position.set(LUBANG.x, tinggi(LUBANG.x, LUBANG.z) + 0.02, LUBANG.z); bibit.scale.setScalar(1.7); bibit.visible = false; scene.add(bibit);

    /* hiasan: hilang di tingkat Hemat */
    var Hi = new B.Rakit(282);
    for (i = 0; i < 44; i++) { x = -14 + rng() * 26; z = -1.8 + rng() * 7; C.rumput(Hi, x, tinggi(x, z), z, rng); }
    for (i = 0; i < 16; i++) { x = -13 + rng() * 24; z = -1.2 + rng() * 6; C.bunga(Hi, x, tinggi(x, z), z, rng() < 0.5 ? W(PAL.kunyit) : W(PAL.kertas)); }
    var hiasan = Hi.jadi(bahan); scene.add(hiasan);
    Dunia.hiasan = hiasan;

    /* bongkah logam dan batu bara di bukit: makin sedikit mengikuti cadangan */
    function deretBongkah(warna, n, seed, ukuran) {
      var Rb = new B.Rakit(seed), daftar = [];
      Rb.tambah(gumpal(0.2, seed, 0, 0.14), warna, null, 0.05);
      for (var j = 0; j < n; j++) {
        var bx = -10 + rng() * 20, bz = -5.5 - rng() * 3.6;
        if (Math.abs(bx - LUBANG.x) < 1.8 && Math.abs(bz - LUBANG.z) < 1.5) { j--; continue; }
        daftar.push({ x: bx, y: tinggi(bx, bz) + 0.08, z: bz, ry: rng() * 6, s: ukuran * (0.8 + rng() * 0.7) });
      }
      /* lebih dulu digali yang paling dekat dengan mulut tambang: urutan acak sudah cukup */
      return new B.Deret(scene, Rb.geometri(), Bahan.tetap(), daftar);
    }
    var logam = deretBongkah(W(PAL.kunyit), 34, 283, 1.45), batubara = deretBongkah(new THREE.Color(0x2A2A2A), 22, 284, 1.75);
    function aturBongkah(cadangan) {
      var k = jepit(cadangan / 100, 0, 1);
      logam.mesh.count = Math.round(34 * k); batubara.mesh.count = Math.round(22 * k);
    }

    /* lubang tambang: makin dalam saat cadangan habis */
    var Rl = new B.Rakit(285), gelapL = new THREE.Color(0x201D18);
    Rl.tambah(gumpal(1.5, 286, 1, 0.1), gelapL, M(0, 0.02, 0, 0, 0, 0, 1.25, 0.07, 1), 0.04);
    [[-1.7, 0.2], [1.7, 0.3], [-0.8, -1.25], [1, -1.2], [0, 1.25], [-1.3, 0.85], [1.3, 0.85]].forEach(function (p, idx) { Rl.tambah(gumpal(0.36, 287 + idx, 0, 0.2), abu, M(p[0], 0.08, p[1], 0, idx, 0, 1, 0.7, 1), 0.06); });
    var lubang = Rl.jadi(bahan); lubang.position.set(LUBANG.x, tinggi(LUBANG.x, LUBANG.z) + 0.04, LUBANG.z); lubang.scale.setScalar(0.01); lubang.visible = false; scene.add(lubang);

    /* papan penutup urat, kincir, dan roda mesin */
    var Rt = new B.Rakit(290); C.papanTutup(Rt, 0, 0, 0, 1.3);
    var tutup = new B.Deret(scene, Rt.geometri(), Bahan.tetap(), URAT.map(function (p) { return { x: p[0], y: tinggi(p[0], p[1]) - 0.08, z: p[1] }; }));
    URAT.forEach(function (p, i2) { tutup.skala(i2, 0); });
    var Rk = new B.Rakit(291); C.tiangKincir(Rk, 0, 0, 0, 1);
    var tiang = new B.Deret(scene, Rk.geometri(), bahan, KINCIR.map(function (k) { return { x: k[0], y: tinggi(k[0], k[1]) + 0.1, z: k[1] }; }));
    var baling = KINCIR.map(function (k) {
      var m = new THREE.Mesh(C.balingKincir(1), Bahan.tetap());
      m.position.set(k[0], tinggi(k[0], k[1]) + 0.1 + 3.9, k[1] + 0.28);
      m.scale.setScalar(0.001); m.visible = false; scene.add(m);
      return m;
    });
    KINCIR.forEach(function (k, i2) { tiang.skala(i2, 0); });
    var roda = new THREE.Mesh(C.geoRoda(1.3), Bahan.tetap());
    roda.position.set(MESIN.x + 0.45, tinggi(MESIN.x, MESIN.z) + 0.9, MESIN.z + 0.76); scene.add(roda);

    /* rumput dan bunga di bekas galian saat berhasil */
    var Rs = new B.Rakit(292);
    for (i = 0; i < 26; i++) { x = -6 + rng() * 13; z = -4.2 + rng() * 1.9; C.rumput(Rs, x, tinggi(x, z), z, rng); }
    for (i = 0; i < 18; i++) { x = -6 + rng() * 13; z = -4.2 + rng() * 2; C.bunga(Rs, x, tinggi(x, z), z, i % 3 ? W(PAL.kunyit) : W(PAL.kertas)); }
    var tumbuhan = Rs.jadi(Bahan.tetap()); tumbuhan.visible = false; scene.add(tumbuhan);

    var zona = {
      scene: scene, tinggi: tinggi, hiasan: hiasan, URAT: URAT, LUBANG: LUBANG, MESIN: MESIN, KINCIR: KINCIR,
      uratAktif: [true, true, true, true], mesin: false, kincir: [false, false],
      kamera: { fov: 31, jauh: 90, dasar: [-0.2, 0.7, -0.4], offset: [0, 12.7, 15.8], batas: { x0: -3.6, x1: 3.2, z0: -1.9, z1: 0.9 }, ikutK: 0.42 },
      /* batas: tokoh tidak boleh berdiri di balik balon atau keluar layar (diuji test/smoke/tahan.js) */
      jalur: new Medan.Jalur({ x0: -11.4, x1: 10.5, z0: -3.2, z1: 4.6, sel: 0.5, boleh: function (px, pz) { return !(px > 7.8 && pz > 2.2); } })   // sudut kanan bawah tertutup Jam Pasir
    };
    zona.jalur.rintangan(MESIN.x, MESIN.z, 1.6);
    zona.jalur.rintangan(MESIN.x - 2, MESIN.z + 0.2, 0.75);
    KINCIR.forEach(function (k) { zona.jalur.rintangan(k[0], k[1], 0.8); });
    halangan.forEach(function (p) { zona.jalur.rintangan(p[0], p[1], p[2]); });

    var KABUT = new THREE.Color(kabut), KABUT_SEGAR = new THREE.Color(0xCFEDE6), KABUT_KERING = new THREE.Color(0xD6C19B);
    function aturKabut(warna, k) { scene.fog.color.copy(KABUT).lerp(warna, k); scene.background.copy(scene.fog.color); }
    function warnaPerbaikan() {
      if (zona.mesin) Warna.atur(0, MESIN.x, MESIN.z, 3.8);
      zona.kincir.forEach(function (on, i2) { if (on) Warna.atur(1 + i2, KINCIR[i2][0], KINCIR[i2][1], 3); });
      zona.uratAktif.forEach(function (on, i2) { if (!on) Warna.atur(3 + i2, URAT[i2][0], URAT[i2][1], 2.6); });
    }

    /* ===== tindakan murid. Rako memakai fungsi yang sama saat memperagakan. ===== */
    zona.aturUrat = async function (i2, aktif) {
      var p = URAT[i2];
      zona.uratAktif[i2] = aktif;
      Arena.hero.main('tanam', 480);
      await Tween.wait(160);
      Aud.sfx(aktif ? 'tebang' : 'tanam');
      Tween.run(280, function (e) { tutup.skala(i2, aktif ? Math.max(0.001, 1 - e) : Math.max(0.01, e)); }, aktif ? Ease.easeOutCubic : Ease.easeOutBack);
      Arena.partikel.semprot({ x: p[0], y: tinggi(p[0], p[1]) + 0.7, z: p[1] + 0.2, n: 8, warna: [PAL.kertas, PAL.bata], laju: 1.2, naik: 1.6, ukuran: 0.07 });
      if (!aktif) { Warna.tumbuh(3 + i2, p[0], p[1], 0.2, 2.6, 800, Ease.easeOutCubic); Arena.tambahDaun(1); }
      else Warna.atur(3 + i2, 0, 0, -1);
      await Tween.wait(240);
    };
    zona.aturMesin = async function (nyala) {
      zona.mesin = nyala;
      Arena.hero.main('tanam', 480);
      await Tween.wait(160);
      Aud.sfx(nyala ? 'tumbuh' : 'gembok');
      if (nyala) { Warna.tumbuh(0, MESIN.x, MESIN.z, 0.2, 3.8, 900, Ease.easeOutCubic); Arena.tambahDaun(1); Arena.partikel.semprot({ x: MESIN.x, y: tinggi(MESIN.x, MESIN.z) + 1.8, z: MESIN.z, n: 12, warna: [PAL.pucuk, PAL.kunyit], laju: 1.4, naik: 2.2, ukuran: 0.08 }); }
      else Warna.atur(0, 0, 0, -1);
      await Tween.wait(240);
    };
    zona.aturKincir = async function (i2, ada) {
      var p = KINCIR[i2];
      zona.kincir[i2] = ada;
      Arena.hero.main('tebang', 500);
      await Tween.wait(200);
      Aud.sfx(ada ? 'tumbuh' : 'gembok');
      baling[i2].visible = true;
      Tween.run(360, function (e) { var k = ada ? Math.max(0.01, e) : Math.max(0.001, 1 - e); tiang.skala(i2, k); baling[i2].scale.setScalar(k); }, ada ? Ease.easeOutBack : Ease.easeOutCubic).then(function () { baling[i2].visible = ada; });
      if (ada) { Warna.tumbuh(1 + i2, p[0], p[1], 0.2, 3, 800, Ease.easeOutCubic); Arena.tambahDaun(1); }
      else Warna.atur(1 + i2, 0, 0, -1);
      await Tween.wait(260);
    };
    /* uji khusus: bibit di lubang tambang */
    zona.tanamDiLubang = async function () {
      var h = Arena.hero;
      h.main('tanam', 560);
      await Tween.wait(180);
      Aud.sfx('tanam');
      bibit.visible = true;
      Tween.run(320, function (e) { bibit.scale.setScalar(1.7 * Math.max(0.01, e)); }, Ease.easeOutBack);
      Arena.partikel.semprot({ x: LUBANG.x, y: bibit.position.y + 0.15, z: LUBANG.z, n: 14, warna: [0x8A5F38, 0x6B4526, PAL.pucuk], laju: 1.8, naik: 2.6 });
      Warna.tumbuh(6, LUBANG.x, LUBANG.z, 0.2, 2.9, 900, Ease.easeOutCubic);
      Arena.tambahDaun(1);
      await Tween.wait(320);
    };

    /* ===== Lompat Waktu ===== */
    var debuT = 0, gerakLompat = false;
    zona.mulaiLompat = function (o) {
      Hutan.lajuWaktu = 2.4; gerakLompat = true;
      Aud.ambien('sunyi');
      Arena.hero.pergi(1, 3.6);
      /* 100 tahun: kamera naik ke bukit supaya pohon di lubang dan hutan yang tumbuh terlihat */
      if (o.seratus) Kamera.geser({ dasar: [0.8, 1.6, -3.8], ikutK: 0 });
    };
    zona.terapkan = function (st, raw, o) {
      hutan.terapkan(st.hutan);
      aturBongkah(st.tambang);
      var bolong = jepit((100 - st.tambang) / 100, 0, 1);
      lubang.visible = bolong > 0.02;
      lubang.scale.setScalar(Math.max(0.01, bolong));
      var sudut = raw * Math.PI * 5;
      if (o.seratus) {
        /* 100 tahun: bibit menjadi pohon besar dan warna kembali di sekitarnya, tetapi bongkah tidak pernah muncul lagi */
        var k = jepit(raw * 1.25, 0, 1);
        slotLubang.kadar = slotLubang.tuju = k > 0.04 ? 0.08 + 0.92 * k : 0;
        hutan._gambar(slotLubang); hutan._tandai();
        bibit.visible = k <= 0.04;
        UW.uKering.value = (1 - k) * 0.5;
        Warna.atur(7, LUBANG.x, LUBANG.z, 0.3 + k * k * 11);
        aturKabut(KABUT_KERING, UW.uKering.value);
      } else {
        UW.uKering.value = o.baik ? 0 : jepit((46 - st.tambang) / 46, 0, 1) * 0.82;
        if (o.baik) {
          Warna.atur(7, PUSAT_WARNA.x, PUSAT_WARNA.z, 0.3 + raw * raw * PUSAT_WARNA.r); aturKabut(KABUT_SEGAR, raw);
          if (raw > 0.3) { Aud.musik('bukit'); Aud.ambien('hutan'); }
        } else aturKabut(KABUT_KERING, UW.uKering.value);
        /* debu dari urat yang masih digali, selama cadangan masih ada */
        if (st.tambang > 0.5 && raw < 0.98 && !UI.kurangi && Math.random() < 0.2) {
          var aktif = URAT.filter(function (p, i2) { return zona.uratAktif[i2]; });
          if (aktif.length) { var u = aktif[Math.floor(Math.random() * aktif.length)]; Arena.partikel.semprot({ x: u[0], y: tinggi(u[0], u[1]) + 0.9, z: u[1] + 0.2, n: 2, warna: [0xB5AE9C, 0x8A8373], laju: 0.6, naik: 1.2, g: 0.6, ukuran: 0.1, umur: 1 }); }
        }
      }
      cahaya.matahari.position.set(-9 * Math.cos(sudut), 16, 8 * Math.sin(sudut) + 4);
      cahaya.matahari.intensity = 2.55 - Math.abs(Math.sin(sudut)) * 0.35;
    };
    zona.akhirLompat = function (o) {
      var h = Arena.hero, w = zona.warga, baik = o.baik;
      h.berhenti();
      h.ekspresi(baik ? 'sorak' : 'sedih'); h.anim = baik ? 'sorak' : 'sedih';
      if (w) { w.ekspresi(baik ? 'sorak' : 'sedih'); w.anim = baik ? 'sorak' : 'sedih'; w.hadap(h.x, h.z); }
      cahaya.matahari.position.set(-9, 16, 8);
      cahaya.matahari.intensity = 2.55;
      Hutan.lajuWaktu = 1; gerakLompat = false;
    };
    zona.mulaiMundur = function () { Hutan.lajuWaktu = 6; };
    /* kembali ke hari ini: pilihan murid tetap ada, bibit dan lubang kembali seperti semula */
    zona.keHariIni = function () {
      Kamera.geser(zona.kamera);
      hutan.pulihkan(70);
      slotLubang.animasi = true; slotLubang.ambang = 999; slotLubang.kadar = slotLubang.tuju = 0;
      hutan._gambar(slotLubang); hutan._tandai();
      Hutan.lajuWaktu = 1;
      bibit.visible = false;
      lubang.visible = false; lubang.scale.setScalar(0.01);
      aturBongkah(100);
      Warna.kosongkan();
      warnaPerbaikan();
      aturKabut(KABUT_SEGAR, 0);
      Aud.musik('sunyi'); Aud.ambien('sunyi');
      if (zona.warga) { zona.warga.anim = 'diam'; zona.warga.ekspresi('senang'); }
    };
    /* semua tempat tujuan, untuk uji jangkauan */
    zona.tujuan = function () {
      return URAT.map(function (p, i2) { return ['urat' + i2, p[0], p[1] + 0.3, 1.5]; }).concat(KINCIR.map(function (p, i2) { return ['kincir' + i2, p[0], p[1], 1.4]; }), [['mesin', MESIN.x, MESIN.z + 1.05, 0.9], ['lubang', LUBANG.x, LUBANG.z, 2.5]]);
    };
    zona.sukses = function () {
      Aud.sfx('gelombang');
      tumbuhan.visible = true;
      return Warna.tumbuh(0, PUSAT_WARNA.x, PUSAT_WARNA.z, PUSAT_WARNA.r, 72, UI.kurangi ? 300 : 2600, Ease.easeInOutCubic);
    };
    zona.update = function (dt) {
      hutan.update(dt);
      if (!UI.kurangi) {
        if (zona.mesin) roda.rotation.z -= dt * 2.2;
        baling.forEach(function (m, i2) { if (m.visible) m.rotation.z -= dt * (1.8 + i2 * 0.3); });
      }
      if (zona.mesin && !UI.kurangi && !gerakLompat) {
        debuT -= dt;
        if (debuT < 0) { debuT = 0.5; Arena.partikel.semprot({ x: MESIN.x + 0.68, y: tinggi(MESIN.x, MESIN.z) + 2.15, z: MESIN.z - 0.2, n: 1, warna: [PAL.kertas, 0xCFC6B0], laju: 0.15, naik: 0.8, g: 0, ukuran: 0.12, umur: 1.1 }); }
      }
    };
    return zona;
  }
  root.ZonaBukit = { buat: buat, tinggi: tinggi };
})(window);
