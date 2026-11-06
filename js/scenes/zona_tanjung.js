/* Zona Tanjung Awal (Bab 0): lereng pudar di tepi pantai, lima tempat sumber daya, satu titik tanam untuk hook. */
(function (root) {
  var B = Bentuk, W = Warna.W, campur = Warna.campur, gelap = Warna.gelap, PAL = Warna.PAL, C = Cadangan;
  var jepit = B.jepit, halus = B.halus, derauLapis = B.derauLapis, jarakGaris = B.jarakGaris, M = B.M, acak = B.acak, gumpal = B.gumpal;

  var SUNGAI = [[9, -30], [6.6, -12], [7.6, -5], [6, 1], [8, 6], [9.5, 12]];
  function pantai(x) { return 9.5 - x * 0.28 + Math.sin(x * 0.3) * 1.1; }
  function jarakSungai(x, z) { return jarakGaris(SUNGAI, x, z); }
  function tinggi(x, z) {
    var h = (derauLapis(x * 0.12 + 11, z * 0.12 + 3) - 0.5) * 0.6;
    h += halus(-6.5, -22, z) * (3.6 + derauLapis(x * 0.09 + 2, z * 0.09) * 5);
    h += halus(-12, -26, x) * 2.5;
    var ds = jarakSungai(x, z);
    h = h * halus(1, 3.4, ds) + (-0.7) * (1 - halus(0.8, 2.1, ds));
    var dp = z - pantai(x), k = halus(-3.6, 0, dp);
    return h * (1 - k) + (0.2 - Math.max(dp, 0) * 0.3 - (dp > 0 ? 0.42 : 0)) * k;
  }

  /* tempat lima sumber daya: marka tempat tokoh berdiri */
  var TEMPAT = {
    hutan: { x: -7.4, z: -3.1 }, tambang: { x: 0.6, z: -5.2 }, air: { x: 4.6, z: -3.2 }, tanah: { x: -6.8, z: 3.1 }, ikan: { x: 3, z: 6.6 }
  };
  var RATNA = { x: -2.2, z: -0.9 };
  var TITIK = { x: 1.4, z: 2.2 };

  function buat() {
    var scene = new THREE.Scene(), kabut = 0xE1D9C2, i, x, z;
    scene.background = new THREE.Color(kabut);
    scene.fog = new THREE.Fog(kabut, 22, 52);
    var cahaya = Dunia.pasangCahaya(scene, 1.55, 2.55);
    var bahan = Bahan.pulih();

    var rumputW = campur(W(PAL.pucuk), W(PAL.zamrud), 0.3), rumputT = W(PAL.pucuk), pasir = campur(W(PAL.kertas), W(PAL.kunyit), 0.22), pasirB = campur(W(PAL.kertas), W(PAL.bata), 0.3);
    scene.add(Medan.buat({
      lebar: 76, dalam: 66, nx: 56, nz: 50, cz: -6, tinggi: tinggi,
      warna: function (px, py, pz) {
        var ds = jarakSungai(px, pz), dp = pz - pantai(px), n1 = derauLapis(px * 0.3, pz * 0.3);
        if (dp > -2.7) return campur(pasir, pasirB, n1 * 0.5);
        if (ds < 2) return pasirB;
        return campur(rumputW, rumputT, jepit(n1 * 1.15 - 0.05 + py * 0.03, 0, 1));
      }
    }, 121, bahan));
    /* tanpa hijau: di dunia pudar laut dangkal kehijauan bisa dikira tanda warna yang pulih */
    var dangkal = campur(W(PAL.langit), W(PAL.toska), 0.55), dalam = W(PAL.toska);
    scene.add(Medan.buatAir({
      lebar: 96, dalam: 70, nx: 34, nz: 26, cz: -2, y: -0.24, ombak: 0.05, ragam: 0.06,
      warna: function (px, py, pz) { var dp = pz - pantai(px); return dp < -5 ? campur(W(PAL.toska), W(PAL.langit), 0.14) : campur(dangkal, dalam, halus(0, 8, dp)); }
    }));

    /* hutan kecil, bukit tambang, ladang, perahu */
    var rng = acak(23), jauh = [], dekat = [];
    for (i = 0; i < 58; i++) {
      x = -30 + rng() * 58; z = -32 + rng() * 21;
      if (jarakSungai(x, z) < 2.6 || (Math.abs(x - 0.5) < 5 && z > -14)) continue;
      jauh.push({ x: x, z: z, s: 1 + rng() * 0.5 });
    }
    [[-9.6, -7.2], [-7.4, -6.7], [-5.5, -7.8], [-11.6, -5.8], [-3.9, -8.6]].forEach(function (p, idx) { dekat.push({ x: p[0], z: p[1], s: 1 + (idx % 2) * 0.14 }); });
    var pohonHook = { x: TITIK.x, z: TITIK.z, s: 1.28 };
    var hutan = new Hutan({ scene: scene, tinggi: tinggi, nilaiAwal: 70, bahan: bahan, dekat: dekat, jauh: jauh, calon: [pohonHook] });
    var slotHook = hutan.slot.filter(function (t) { return t.jenis === 'calon'; })[0];
    slotHook.ambang = slotHook.ambangAsli = 999;

    var R = new B.Rakit(131), abu = new THREE.Color(0x8A8373), abuT = new THREE.Color(0xBDB5A2), emas = W(PAL.kunyit);
    /* bukit batu dengan urat logam */
    [[0.5, -8.3, 3.3, 1], [-1.7, -7.4, 1.9, 2], [2.8, -7.5, 2.2, 3], [0.8, -6.6, 1.3, 4]].forEach(function (b) {
      R.tambah(gumpal(b[2], 140 + b[3], 1, 0.2), function (px, py) { return campur(abu, abuT, jepit((py - tinggi(b[0], b[1])) / (b[2] * 1.5), 0, 1)); }, M(b[0], tinggi(b[0], b[1]) + b[2] * 0.25, b[1], 0, b[3], 0, 1.1, 0.8, 0.95));
    });
    [[-0.6, 1.4, -6.6], [0.8, 1.9, -6.2], [2.1, 1.2, -6.5], [-1.5, 0.9, -6.3]].forEach(function (o, idx) { R.tambah(gumpal(0.2, 150 + idx, 0, 0.1), emas, M(o[0], tinggi(o[0], o[2]) + o[1], o[2])); });
    /* ladang: tanah berbaris dengan tunas */
    for (i = 0; i < 4; i++) {
      var lz = -1.5 + i * 0.85;
      R.tambah(B.Kotak(4.2, 0.26, 0.56), gelap(W(PAL.bata), 0.62), M(-7.2, tinggi(-7.2, lz) + 0.09, lz), 0.05);
      for (var j = 0; j < 5; j++) C.bibit(R, -8.9 + j * 0.85, tinggi(-8.9 + j * 0.85, lz) + 0.16, lz, 0.72);
    }
    C.pasang(R, 'veh_perahu', 5.4, 0.02, 8.6, 1, 0.85, function () { C.perahu(R, 5.4, 0.02, 8.6, 1.05, 0.85); });
    C.kelapa(R, 11.6, tinggi(11.6, 2.6), 2.6, 0.95, 1801);
    C.kelapa(R, 10.2, tinggi(10.2, -1.4), -1.4, 0.9, 1802);
    C.kelapa(R, -12.4, tinggi(-12.4, 4.4), 4.4, 1, 1803);
    C.pasang(R, 'bld_rumah', 11, tinggi(11, -6), -6, 1, -0.4, function () { C.rumah(R, 11, tinggi(11, -6), -6, 1, -0.4); });
    /* papan penunjuk di dekat Bu Ratna */
    var kayu = gelap(W(PAL.bata), 0.75);
    R.tambah(B.Kotak(0.16, 1.5, 0.16), kayu, M(-5, tinggi(-5, -2.2) + 0.75, -2.2));
    R.tambah(B.Kotak(1.3, 0.56, 0.1), W(PAL.bata), M(-5, tinggi(-5, -2.2) + 1.32, -2.2, 0, 0.2, 0));
    var halangan = [], ukur;
    for (i = 0; i < 10; i++) {
      x = -13 + rng() * 24; z = -5 + rng() * 13;
      if (jarakSungai(x, z) < 3 || Math.abs(x - TITIK.x) + Math.abs(z - TITIK.z) < 2.6 || z > pantai(x) - 3) continue;
      if (rng() < 0.5) { ukur = 0.55 + rng() * 0.5; C.semak(R, x, tinggi(x, z), z, ukur, 1610 + i); halangan.push([x, z, ukur * 0.7]); }
      else { ukur = 0.6 + rng() * 0.6; C.batu(R, x, tinggi(x, z), z, ukur, 1630 + i); halangan.push([x, z, ukur * 0.55]); }
    }
    scene.add(R.jadi(bahan));

    var H = new B.Rakit(132);
    for (i = 0; i < 70; i++) { x = -14 + rng() * 26; z = -5.5 + rng() * 13; if (jarakSungai(x, z) < 2.6 || z > pantai(x) - 2.9) continue; C.rumput(H, x, tinggi(x, z), z, rng); }
    for (i = 0; i < 26; i++) { x = -13 + rng() * 24; z = -5 + rng() * 12; if (jarakSungai(x, z) < 2.6 || z > pantai(x) - 2.9) continue; C.bunga(H, x, tinggi(x, z), z, rng() < 0.5 ? W(PAL.kunyit) : W(PAL.kertas)); }
    var hiasan = H.jadi(bahan); scene.add(hiasan);
    Dunia.hiasan = hiasan;

    /* bibit hook dan burung yang datang di masa depan */
    var bibit = new THREE.Mesh(C.geoBibit(), bahan);
    bibit.position.set(TITIK.x, tinggi(TITIK.x, TITIK.z), TITIK.z); bibit.scale.setScalar(1.7); bibit.visible = false; scene.add(bibit);
    var burung = [new Rako(1.15), new Rako(1)];
    burung.forEach(function (r) { r.grup.visible = false; r.mode = 'tunjuk'; scene.add(r.grup); });

    var zona = {
      scene: scene, tinggi: tinggi, TEMPAT: TEMPAT, RATNA: RATNA, TITIK: TITIK, hutan: hutan,
      kamera: { fov: 31, jauh: 100, dasar: [-0.4, 0.5, 0.8], offset: [0, 12.7, 15.8], batas: { x0: -6, x1: 4.5, z0: -2.4, z1: 3.4 }, ikutK: 0.5 },
      /* batas bawah: tokoh tidak boleh berdiri di balik balon (diuji test/smoke/tahan.js) */
      jalur: new Medan.Jalur({ x0: -13.5, x1: 10.5, z0: -6.4, z1: 7.4, sel: 0.5, boleh: function (px, pz) { return jarakSungai(px, pz) > 2.3 && pz < pantai(px) - 0.5; } })
    };
    dekat.forEach(function (p) { zona.jalur.rintangan(p.x, p.z, 0.55); });
    zona.jalur.rintangan(0.5, -7.6, 3.2); zona.jalur.rintangan(2.8, -7.5, 1.8); zona.jalur.rintangan(-1.7, -7.4, 1.6);
    zona.jalur.rintangan(-7.2, 0, 2.7); zona.jalur.rintangan(-5, -2.2, 0.35); zona.jalur.rintangan(5.4, 8.6, 1.7);
    halangan.forEach(function (p) { zona.jalur.rintangan(p[0], p[1], p[2]); });

    zona.tanamBibit = function () {
      bibit.visible = true;
      Tween.run(320, function (e) { bibit.scale.setScalar(1.7 * Math.max(0.01, e)); }, Ease.easeOutBack);
    };
    /* raw 0-1: bibit menjadi pohon besar */
    zona.tumbuhHook = function (raw) {
      var k = jepit(raw, 0, 1);
      bibit.visible = k < 0.06;
      slotHook.kadar = slotHook.tuju = k < 0.06 ? 0 : 0.08 + 0.92 * k * k * (3 - 2 * k);
      hutan._gambar(slotHook); hutan._tandai();
      var sudut = k * Math.PI * 4;
      cahaya.matahari.position.set(-9 * Math.cos(sudut), 16, 8 * Math.sin(sudut) + 4);
      cahaya.matahari.intensity = 2.55 - Math.abs(Math.sin(sudut)) * 0.3;
    };
    zona.burungDatang = function () {
      burung.forEach(function (r, i) {
        r.grup.visible = true;
        r.taruh(i ? 15 : -15, 10, -8);
        r.tunjuk(TITIK.x + (i ? 1.3 : -1.1), tinggi(TITIK.x, TITIK.z) + 4.7 + i * 0.5, TITIK.z - 0.5);
      });
    };
    zona.burungPergi = function () { burung.forEach(function (r) { r.grup.visible = false; }); };
    zona.update = function (dt) {
      hutan.update(dt);
      burung.forEach(function (r) { if (r.grup.visible) r.update(dt); });
    };
    return zona;
  }
  root.ZonaTanjung = { buat: buat, tinggi: tinggi };
})(window);
