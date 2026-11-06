/* Cadangan 3D: semua benda dunia dibuat dari kode, sehingga gim selalu jalan walau model AI belum ada.
   Tiap fungsi menambah bentuk ke Rakit. Bila model AI dengan kunci sama tersedia, Cadangan.pasang memakainya. */
(function (root) {
  var B = Bentuk, W = Warna.W, campur = Warna.campur, gelap = Warna.gelap, PAL = Warna.PAL;
  var M = B.M, gumpal = B.gumpal, Kotak = B.Kotak, Tabung = B.Tabung, Kerucut = B.Kerucut, jepit = B.jepit, acak = B.acak;

  /* model AI bila ada: dasar di y, depan menghadap +Z sebelum diputar ry */
  function ai(R, kunci, x, y, z, s, ry) {
    if (!Aset3D.ada(kunci)) return false;
    R.tambahBerwarna(Aset3D.ambil(kunci), M(x, y, z, 0, ry || 0, 0, s, s, s));
    return true;
  }

  /* Kamera.offset: bidang gambar dimiringkan tegak lurus arah pandang */
  var MIRING_PANDANG = -Math.atan2(12.7, 15.8);
  /* sampah bergambar: satu deret per gambar, dipakai seperti Deret. Tiap salinan memakai gambar bergiliran. */
  function DeretGambar(scene, kunci, daftar, lebar, ombak) {
    var geo = new THREE.PlaneGeometry(lebar, lebar), per = kunci.map(function () { return []; });
    geo.translate(0, lebar / 2, 0);
    geo.rotateX(MIRING_PANDANG);
    this.letak = daftar.map(function (t, i) {
      var j = i % kunci.length;
      per[j].push({ x: t.x, y: t.y, z: t.z, s: t.s });
      return [j, per[j].length - 1];
    });
    this.deret = kunci.map(function (k, j) {
      var opsi = { map: Aset3D.gambar(k), vertexColors: false, flatShading: false, alphaTest: 0.5 };
      return new B.Deret(scene, geo, ombak ? Bahan.laut(ombak, opsi) : Bahan.tetap(opsi), per[j]);
    });
  }
  DeretGambar.prototype.skala = function (i, k, ky) { var a = this.letak[i]; this.deret[a[0]].skala(a[1], k, ky); };
  DeretGambar.prototype.jumlah = function (n) {
    var b = this.deret.length;
    this.deret.forEach(function (d, j) { d.jumlah(Math.floor((n + b - 1 - j) / b)); });
  };

  var C = {
    /* sampah: gambar AI menghadap kamera bila semua ada, bentuk dari kode bila tidak. buatKode mengembalikan geometri cadangan. */
    deretSampah: function (scene, kunci, daftar, lebar, buatKode, ombak) {
      if (kunci.every(Aset3D.ada)) return new DeretGambar(scene, kunci, daftar, lebar, ombak);
      return new B.Deret(scene, buatKode(), ombak ? Bahan.laut(ombak) : Bahan.tetap(), daftar);
    },

    /* pohon sebagai geometri siap instancing, dasar di y = 0. murah: untuk latar jauh. */
    pohon: function (R, x, y, z, s, seed, murah) {
      if (Aset3D.ada('tree_meranti')) { R.tambahBerwarna(Aset3D.ambil('tree_meranti', murah ? 2 : 1), M(x, y, z, 0, seed || 0, 0, s, s, s)); return; }
      var rng = acak(seed), d = murah ? 0 : 1, batang = gelap(W(PAL.bata), 0.72), hijau = W(PAL.zamrud), muda = W(PAL.pucuk), i;
      if (murah) R.tambah(Tabung(0.14 * s, 0.24 * s, 1.5 * s, 5), batang, M(x, y + 0.72 * s, z));
      else R.tambah(Tabung(0.15 * s, 0.27 * s, 2.1 * s, 7), batang, M(x, y + 1.02 * s, z));
      if (!murah) for (i = 0; i < 3; i++) { var a = i * 2.1 + rng(); R.tambah(Kerucut(0.14 * s, 0.56 * s, 4), batang, M(x + Math.cos(a) * 0.25 * s, y + 0.23 * s, z + Math.sin(a) * 0.25 * s)); }
      var warnaTajuk = function (cy) { return function (vx, vy) { return campur(hijau, muda, jepit((vy - (y + cy - 0.5 * s)) / (1.25 * s), 0, 1)); }; };
      var tajuk = murah ? [[0, 2.25, 0, 1.12], [0.68, 1.85, 0.15, 0.8], [-0.66, 1.9, -0.1, 0.82]] : [[0, 2.95, 0, 1.08], [0.72, 2.52, 0.2, 0.76], [-0.7, 2.56, -0.1, 0.78], [0.1, 2.42, 0.66, 0.66], [-0.08, 2.46, -0.66, 0.66]];
      for (i = 0; i < tajuk.length; i++) {
        var t = tajuk[i];
        R.tambah(gumpal(t[3] * s, seed + i * 13, d), warnaTajuk(t[1] * s), M(x + t[0] * s, y + t[1] * s, z + t[2] * s, 0, rng() * 3, 0, 1, 0.82, 1));
      }
    },
    tunggul: function (R, x, y, z, s, murah) {
      if (Aset3D.ada('prop_tunggul')) { R.tambahBerwarna(Aset3D.ambil('prop_tunggul', murah ? 1 : 0), M(x, y - 0.02 * s, z, 0, 0, 0, s, s, s)); return; }
      var kulit = gelap(W(PAL.bata), 0.7), teras = campur(W(PAL.kertas), W(PAL.bata), 0.25), i;
      R.tambah(Tabung(0.3 * s, 0.38 * s, 0.42 * s, murah ? 6 : 8), kulit, M(x, y + 0.2 * s, z));
      R.tambah(Tabung(0.27 * s, 0.3 * s, 0.03 * s, murah ? 6 : 8), teras, M(x, y + 0.42 * s, z));
      if (murah) return;
      for (i = 0; i < 3; i++) { var a = i * 2.2 + 0.4; R.tambah(Kerucut(0.13 * s, 0.4 * s, 4), kulit, M(x + Math.cos(a) * 0.36 * s, y + 0.1 * s, z + Math.sin(a) * 0.36 * s, Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.9)); }
    },
    kayuRebah: function (R, x, y, z, s, ry) {
      /* model membujur searah Z, sedangkan bentuk kode membujur searah X */
      if (ai(R, 'prop_kayu_rebah', x, y - 0.02 * s, z, s, (ry || 0) + Math.PI / 2)) return;
      var kulit = gelap(W(PAL.bata), 0.74), teras = campur(W(PAL.kertas), W(PAL.bata), 0.25);
      R.tambah(Tabung(0.2 * s, 0.24 * s, 2.4 * s, 7), kulit, M(x, y + 0.2 * s, z, 0, ry, Math.PI / 2));
      R.tambah(Tabung(0.19 * s, 0.19 * s, 0.03 * s, 7), teras, M(x + Math.cos(ry) * 1.21 * s, y + 0.2 * s, z - Math.sin(ry) * 1.21 * s, 0, ry, Math.PI / 2));
    },
    bibit: function (R, x, y, z, s) {
      if (ai(R, 'tree_meranti_muda', x, y, z, s, 0)) return;
      R.tambah(gumpal(0.28 * s, 11, 0, 0.1), gelap(W(PAL.bata), 0.62), M(x, y + 0.02, z, 0, 0, 0, 1, 0.3, 1));
      R.tambah(Tabung(0.025 * s, 0.035 * s, 0.5 * s, 5), gelap(W(PAL.bata), 0.8), M(x, y + 0.25 * s, z));
      R.tambah(gumpal(0.17 * s, 3, 0), W(PAL.pucuk), M(x + 0.12 * s, y + 0.5 * s, z, 0, 0, -0.6, 1, 0.55, 0.8));
      R.tambah(gumpal(0.17 * s, 5, 0), W(PAL.pucuk), M(x - 0.12 * s, y + 0.46 * s, z, 0, 0, 0.6, 1, 0.55, 0.8));
      R.tambah(gumpal(0.14 * s, 9, 0), W(PAL.zamrud), M(x, y + 0.62 * s, z, 0, 0, 0, 0.8, 1.05, 0.8));
    },
    semak: function (R, x, y, z, s, seed) {
      if (Aset3D.ada('prop_semak')) {
        var bunga = seed % 3 === 0 && Aset3D.ada('prop_semak_bunga');
        R.tambahBerwarna(Aset3D.ambil(bunga ? 'prop_semak_bunga' : 'prop_semak'), M(x, y - 0.03 * s, z, 0, seed, 0, s, s, s));
        return;
      }
      R.tambah(gumpal(0.5 * s, seed, 1, 0.2), function (vx, vy) { return campur(W(PAL.zamrud), W(PAL.pucuk), jepit((vy - y) / (0.8 * s), 0, 1)); }, M(x, y + 0.28 * s, z, 0, seed, 0, 1.1, 0.72, 1));
    },
    batu: function (R, x, y, z, s, seed, warnaAtas) {
      if (Aset3D.ada('prop_batu')) {
        var besar = s >= 1.5 && Aset3D.ada('prop_batu_besar');
        R.tambahBerwarna(Aset3D.ambil(besar ? 'prop_batu_besar' : 'prop_batu'), M(x, y - 0.02 * s, z, 0, seed, 0, s, s, s));
        return;
      }
      var a = new THREE.Color(0x7E786B), b = warnaAtas || new THREE.Color(0xB5AE9C);
      R.tambah(gumpal(0.42 * s, seed, 0, 0.26), function (vx, vy) { return campur(a, b, jepit((vy - y) / (0.6 * s), 0, 1)); }, M(x, y + 0.18 * s, z, 0, seed, 0, 1, 0.72, 1));
    },
    rumput: function (R, x, y, z, rng) {
      var w = campur(W(PAL.zamrud), W(PAL.pucuk), rng());
      for (var i = 0; i < 3; i++) R.tambah(Kerucut(0.05, 0.28 + rng() * 0.12, 3), w, M(x + (rng() - 0.5) * 0.2, y + 0.13, z + (rng() - 0.5) * 0.2, (rng() - 0.5) * 0.5, 0, (rng() - 0.5) * 0.5));
    },
    bunga: function (R, x, y, z, warna) {
      R.tambah(Tabung(0.012, 0.016, 0.22, 3), W(PAL.zamrud), M(x, y + 0.11, z));
      R.tambah(gumpal(0.075, 2, 0), warna, M(x, y + 0.24, z, 0, 0, 0, 1, 0.7, 1));
    },
    kupu: function (R, x, y, z, warna) {
      R.tambah(gumpal(0.13, 4, 0, 0.05), warna, M(x - 0.1, y, z, 0, 0, 0.55, 1, 0.14, 0.8), 0.02);
      R.tambah(gumpal(0.13, 4, 0, 0.05), warna, M(x + 0.1, y, z, 0, 0, -0.55, 1, 0.14, 0.8), 0.02);
      R.tambah(Tabung(0.012, 0.012, 0.16, 3), W(PAL.tinta), M(x, y, z, Math.PI / 2, 0, 0), 0);
    },
    rumah: function (R, x, y, z, s, ry, warnaAtap) {
      if (ai(R, 'bld_rumah', x, y, z, s, ry)) return;
      var kayu = W(PAL.bata), gelapKayu = gelap(kayu, 0.66), krem = W(PAL.kertas), atap = warnaAtap || campur(W(PAL.kunyit), gelapKayu, 0.35), i, j;
      var P = function (lx, ly, lz) { var c = Math.cos(ry), n = Math.sin(ry); return [x + (lx * c + lz * n) * s, y + ly * s, z + (-lx * n + lz * c) * s]; };
      for (i = -1; i <= 1; i += 2) for (j = -1; j <= 1; j += 2) { var a = P(i * 1.05, 0.35, j * 0.75); R.tambah(Kotak(0.18 * s, 0.75 * s, 0.18 * s), gelapKayu, M(a[0], a[1], a[2], 0, ry)); }
      var c0 = P(0, 0.76, 0); R.tambah(Kotak(2.5 * s, 0.12 * s, 1.9 * s), gelapKayu, M(c0[0], c0[1], c0[2], 0, ry));
      var c1 = P(0, 1.3, 0); R.tambah(Kotak(2.2 * s, 1.0 * s, 1.6 * s), kayu, M(c1[0], c1[1], c1[2], 0, ry));
      var c2 = P(0, 2.2, 0); R.tambah(Kerucut(1.95 * s, 0.95 * s, 4), atap, M(c2[0], c2[1], c2[2], 0, ry + Math.PI / 4, 0, 1.08, 1, 0.8));
      var c3 = P(-0.55, 1.35, 0.81); R.tambah(Kotak(0.46 * s, 0.46 * s, 0.05 * s), krem, M(c3[0], c3[1], c3[2], 0, ry), 0);
      var c4 = P(0.48, 1.18, 0.81); R.tambah(Kotak(0.46 * s, 0.76 * s, 0.05 * s), gelapKayu, M(c4[0], c4[1], c4[2], 0, ry), 0);
      var c5 = P(0.48, 0.42, 1.25); R.tambah(Kotak(0.5 * s, 0.1 * s, 0.34 * s), gelapKayu, M(c5[0], c5[1], c5[2], 0, ry));
      var c6 = P(0.48, 0.2, 1.52); R.tambah(Kotak(0.5 * s, 0.1 * s, 0.3 * s), gelapKayu, M(c6[0], c6[1], c6[2], 0, ry));
    },
    perahuRangka: function (R, x, y, z, ry, sisi) {
      if (ai(R, 'prop_perahu_rangka', x, y, z, 1, ry)) return;
      var kayu = W(PAL.bata), terang = campur(kayu, W(PAL.kertas), 0.25), gelapKayu = gelap(kayu, 0.65), i;
      R.tambah(Kotak(0.16, 0.16, 4.3), gelapKayu, M(x, y + 0.5, z, 0, ry));
      for (i = -2; i <= 2; i++) {
        var r = 0.74 - Math.abs(i) * 0.16, oz = i * 0.82;
        R.tambah(new THREE.TorusGeometry(r, 0.075, 4, 8, Math.PI), terang, M(x + Math.sin(ry) * oz, y + 0.55 + r, z + Math.cos(ry) * oz, 0, ry, Math.PI));
      }
      for (i = -1; i <= 1; i += 2) {
        R.tambah(Kotak(0.09, 0.22, 3.1), kayu, M(x + Math.cos(ry) * i * 0.56, y + 0.74, z - Math.sin(ry) * i * 0.56, 0, ry));
        R.tambah(Kotak(0.16, 0.5, 1.4), gelapKayu, M(x + Math.sin(ry) * i * 1.5, y + 0.25, z + Math.cos(ry) * i * 1.5, 0, ry + Math.PI / 2));
      }
    },
    perahu: function (R, x, y, z, s, ry) {
      if (ai(R, 'veh_perahu', x, y - 0.18 * s, z, s, ry)) return;
      var toska = W(PAL.toska), krem = W(PAL.kertas), bambu = campur(W(PAL.pucuk), W(PAL.kunyit), 0.5), c = Math.cos(ry), n = Math.sin(ry), i;
      R.tambah(gumpal(0.9 * s, 81, 1, 0.02), toska, M(x, y + 0.05 * s, z, 0, ry, 0, 0.62, 0.5, 2.3));
      R.tambah(gumpal(0.84 * s, 82, 1, 0.02), krem, M(x, y + 0.24 * s, z, 0, ry, 0, 0.56, 0.2, 2.1));
      R.tambah(Tabung(0.03 * s, 0.05 * s, 1.5 * s, 5), gelap(W(PAL.bata), 0.7), M(x, y + 0.9 * s, z));
      for (i = -1; i <= 1; i += 2) {
        R.tambah(Tabung(0.09 * s, 0.09 * s, 3 * s, 6), bambu, M(x + c * i * 1.15 * s, y + 0.1 * s, z - n * i * 1.15 * s, Math.PI / 2, ry, 0, 1));
        R.tambah(Kotak(2.3 * s, 0.05 * s, 0.07 * s), gelap(W(PAL.bata), 0.8), M(x + n * i * 0.7 * s, y + 0.34 * s, z + c * i * 0.7 * s, 0, ry));
      }
    },
    kelapa: function (R, x, y, z, s, seed) {
      if (Aset3D.ada('tree_kelapa')) { R.tambahBerwarna(Aset3D.ambil('tree_kelapa', s < 0.85 ? 2 : 1), M(x, y, z, 0, seed || 0, 0, s, s, s)); return; }
      var rng = acak(seed), lean = (rng() - 0.5) * 0.5, batang = gelap(W(PAL.bata), 0.85), i;
      for (i = 0; i < 4; i++) R.tambah(Tabung(0.1 * s - i * 0.012 * s, 0.13 * s - i * 0.012 * s, 0.85 * s, 5), batang, M(x + lean * i * i * 0.13 * s, y + (0.4 + i * 0.8) * s, z, 0, 0, -lean * i * 0.14));
      var tx = x + lean * 1.3 * s, ty = y + 3.5 * s;
      for (i = 0; i < 7; i++) {
        var a = i * Math.PI * 2 / 7 + rng();
        R.tambah(gumpal(0.42 * s, seed + i, 0, 0.05), campur(W(PAL.zamrud), W(PAL.pucuk), rng() * 0.8), M(tx + Math.cos(a) * 0.72 * s, ty - 0.14 * s, z + Math.sin(a) * 0.72 * s, 0, -a, Math.PI * 0.08, 2.1, 0.22, 0.75));
      }
    },
    /* tiang kincir angin; baling dibuat terpisah agar bisa berputar */
    tiangKincir: function (R, x, y, z, s) {
      if (ai(R, 'prop_kincir_tiang', x, y, z, s, 0)) return;
      var krem = W(PAL.kertas);
      R.tambah(Tabung(0.09 * s, 0.17 * s, 3.8 * s, 7), krem, M(x, y + 1.9 * s, z));
      R.tambah(gumpal(0.17 * s, 91, 0, 0.03), krem, M(x, y + 3.9 * s, z + 0.08 * s, 0, 0, 0, 0.9, 0.9, 1.5));
    },
    balingKincir: function (s) {
      if (Aset3D.ada('prop_kincir_bilah')) { var Rb = new B.Rakit(92); ai(Rb, 'prop_kincir_bilah', 0, 0, 0, s, 0); return Rb.geometri(); }
      var R = new B.Rakit(92), krem = W(PAL.kertas), i;
      for (i = 0; i < 3; i++) {
        var a = i * Math.PI * 2 / 3;
        R.tambah(Kotak(0.18 * s, 1.5 * s, 0.05 * s), krem, M(Math.sin(a) * 0.72 * s, Math.cos(a) * 0.72 * s, 0, 0, 0, -a));
        R.tambah(Kotak(0.19 * s, 0.26 * s, 0.06 * s), W(PAL.kunyit), M(Math.sin(a) * 1.35 * s, Math.cos(a) * 1.35 * s, 0, 0, 0, -a), 0);
      }
      return R.geometri();
    },
    ikan: function (R, x, y, z, s, warna, ry) {
      if (ai(R, 'ani_ikan', x, y - (Aset3D.ada('ani_ikan') ? Aset3D.info('ani_ikan').u[1] * s / 2 : 0), z, s, ry)) return;
      var w = warna || W(PAL.kunyit);
      R.tambah(gumpal(0.2 * s, 31, 0, 0.05), w, M(x, y, z, 0, ry || 0, 0, 1.3, 0.8, 0.5));
      R.tambah(Kerucut(0.13 * s, 0.22 * s, 4), gelap(w, 0.85), M(x - Math.cos(ry || 0) * 0.3 * s, y, z + Math.sin(ry || 0) * 0.3 * s, 0, ry || 0, -Math.PI / 2, 1, 1, 0.4));
    },

    /* ===== Bab 2: sawah ===== */
    /* satu ruas pipa bambu dari a ke b, dengan buku-buku */
    pipa: function (R, ax, ay, az, bx, by, bz, r) {
      var bambu = campur(W(PAL.pucuk), W(PAL.kunyit), 0.45), buku = gelap(bambu, 0.72), dx = bx - ax, dy = by - ay, dz = bz - az, pj = Math.sqrt(dx * dx + dy * dy + dz * dz), arah = new THREE.Vector3(dx / pj, dy / pj, dz / pj), q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), arah), s = new THREE.Vector3(1, 1, 1), m = new THREE.Matrix4(), n = Math.max(1, Math.round(pj / 1.5)), i;
      r = r || 0.13;
      m.compose(new THREE.Vector3((ax + bx) / 2, (ay + by) / 2, (az + bz) / 2), q, s);
      R.tambah(Tabung(r, r, pj, 6), bambu, m, 0.04);
      for (i = 0; i <= n; i++) {
        var t = i / n;
        m.compose(new THREE.Vector3(ax + dx * t, ay + dy * t, az + dz * t), q, s);
        R.tambah(Tabung(r * 1.2, r * 1.2, 0.07, 6), buku, m, 0.02);
      }
    },
    /* tiang penyangga pipa */
    tiangPipa: function (R, x, y, z, tinggi) {
      var kayu = gelap(W(PAL.bata), 0.7);
      R.tambah(Kotak(0.09, tinggi + 0.2, 0.09), kayu, M(x - 0.17, y + tinggi / 2, z, 0, 0, 0.15));
      R.tambah(Kotak(0.09, tinggi + 0.2, 0.09), kayu, M(x + 0.17, y + tinggi / 2, z, 0, 0, -0.15));
    },
    /* lima bilah teras berundak, dasar di y */
    teras: function (R, x, y, z, lebar) {
      var tanahW = campur(W(PAL.bata), W(PAL.kertas), 0.15), hijau = campur(W(PAL.pucuk), W(PAL.zamrud), 0.3), i;
      for (i = 0; i < 3; i++) {
        var p = lebar - i * 0.5, py = y + 0.2 + i * 0.5, pz = z + 0.9 - i * 0.95;
        R.tambah(Kotak(p, 0.5, 1.05), tanahW, M(x, py, pz), 0.05);
        R.tambah(Kotak(p - 0.1, 0.1, 0.95), hijau, M(x, py + 0.28, pz), 0.08);
      }
    },
    padi: function (R, x, y, z, rng) {
      var w = campur(W(PAL.pucuk), W(PAL.zamrud), 0.1 + rng() * 0.3), emas = campur(W(PAL.kunyit), W(PAL.pucuk), 0.45), i;
      for (i = 0; i < 4; i++) R.tambah(Kerucut(0.085, 0.74 + rng() * 0.22, 3), function (vx, vy) { return vy > y + 0.5 ? emas : w; }, M(x + (rng() - 0.5) * 0.22, y + 0.36, z + (rng() - 0.5) * 0.22, (rng() - 0.5) * 0.36, rng() * 3, (rng() - 0.5) * 0.36), 0.04);
    },
    tumpukSampah: function (R, x, y, z, s, seed) {
      var rng = acak(seed), warna = [W(PAL.kertas), W(PAL.toska), W(PAL.bata), new THREE.Color(0xCFC6B0), W(PAL.kunyit)], i;
      for (i = 0; i < 7; i++) {
        var w = warna[Math.floor(rng() * warna.length)], a = rng() * 6.28, d = rng() * 0.42 * s, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d, py = y + 0.09 * s + rng() * 0.16 * s;
        if (i % 2) R.tambah(Tabung(0.08 * s, 0.08 * s, 0.26 * s, 6), w, M(px, py, pz, rng() * 2, rng() * 3, Math.PI / 2), 0.06);
        else R.tambah(Kotak(0.3 * s, 0.13 * s, 0.22 * s), w, M(px, py, pz, rng() * 0.6, rng() * 3, rng() * 0.6), 0.06);
      }
    },
    kuntul: function (R, x, y, z, s, ry) {
      if (ai(R, 'ani_kuntul', x, y, z, s, ry)) return;
      var putih = new THREE.Color(0xFBF8EE), paruh = W(PAL.kunyit), kaki = W(PAL.tinta), c = Math.cos(ry || 0), n = Math.sin(ry || 0);
      R.tambah(gumpal(0.2 * s, 41, 1, 0.04), putih, M(x, y + 0.56 * s, z, 0, ry || 0, 0, 0.72, 0.72, 1.22), 0.02);
      R.tambah(Tabung(0.035 * s, 0.05 * s, 0.34 * s, 5), putih, M(x + n * 0.13 * s, y + 0.8 * s, z + c * 0.13 * s, c * 0.35, 0, -n * 0.35), 0.02);
      R.tambah(gumpal(0.065 * s, 42, 0, 0.03), putih, M(x + n * 0.2 * s, y + 0.98 * s, z + c * 0.2 * s), 0.02);
      R.tambah(Kerucut(0.025 * s, 0.2 * s, 4), paruh, M(x + n * 0.31 * s, y + 0.97 * s, z + c * 0.31 * s, c * Math.PI / 2, 0, -n * Math.PI / 2), 0.02);
      [-1, 1].forEach(function (i) { R.tambah(Tabung(0.012 * s, 0.012 * s, 0.42 * s, 3), kaki, M(x + c * i * 0.05 * s, y + 0.21 * s, z - n * i * 0.05 * s), 0); });
    },
    katak: function (R, x, y, z, s) {
      if (ai(R, 'ani_katak', x, y, z, s, 0)) return;
      var h = campur(W(PAL.pucuk), W(PAL.zamrud), 0.45), g = gelap(h, 0.78), mata = new THREE.Color(0xFFFFFF), hitam = new THREE.Color(0x101A17);
      R.tambah(gumpal(0.22 * s, 43, 1, 0.05), h, M(x, y + 0.15 * s, z, 0.2, 0, 0, 1, 0.68, 1.14), 0.03);
      [-1, 1].forEach(function (i) {
        R.tambah(gumpal(0.11 * s, 44, 0, 0.05), g, M(x + i * 0.2 * s, y + 0.08 * s, z - 0.08 * s, 0, 0, 0, 1, 0.6, 1.5), 0.03);
        R.tambah(gumpal(0.055 * s, 45, 0, 0.04), g, M(x + i * 0.15 * s, y + 0.05 * s, z + 0.2 * s, 0, 0, 0, 1, 0.5, 1.4), 0.03);
        R.tambah(gumpal(0.06 * s, 46, 0, 0.02), mata, M(x + i * 0.1 * s, y + 0.3 * s, z + 0.1 * s), 0);
        R.tambah(gumpal(0.032 * s, 47, 0, 0.02), hitam, M(x + i * 0.11 * s, y + 0.31 * s, z + 0.15 * s), 0);
      });
    },
    capung: function (R, x, y, z, s) {
      var badan = W(PAL.bata), sayap = W(PAL.langit);
      R.tambah(Tabung(0.022 * s, 0.03 * s, 0.56 * s, 5), badan, M(x, y, z, Math.PI / 2, 0, 0), 0.02);
      R.tambah(gumpal(0.05 * s, 48, 0, 0.02), W(PAL.tinta), M(x, y, z + 0.3 * s), 0);
      [-1, 1].forEach(function (i) {
        R.tambah(gumpal(0.16 * s, 49, 0, 0.02), sayap, M(x + i * 0.2 * s, y + 0.02 * s, z + 0.12 * s, 0, 0, i * 0.14, 1.4, 0.06, 0.36), 0.02);
        R.tambah(gumpal(0.14 * s, 50, 0, 0.02), sayap, M(x + i * 0.18 * s, y + 0.02 * s, z - 0.02 * s, 0, 0, i * 0.14, 1.4, 0.06, 0.34), 0.02);
      });
    },

    /* ===== Bab 3: teluk ===== */
    dermaga: function (R, x0, x1, y, z, lebar) {
      var kayu = campur(W(PAL.bata), W(PAL.kertas), 0.25), gelapK = gelap(W(PAL.bata), 0.62), n = Math.round((x1 - x0) / 0.62), i;
      for (i = 0; i < n; i++) R.tambah(Kotak(0.56, 0.08, lebar), kayu, M(x0 + 0.31 + i * 0.62, y, z), 0.09);
      for (i = 0; i <= n; i += 3) { [-1, 1].forEach(function (d) { R.tambah(Tabung(0.07, 0.08, 1.5, 5), gelapK, M(x0 + 0.31 + i * 0.62, y - 0.65, z + d * lebar * 0.46)); }); }
    },
    /* rak jemur jala */
    rakJala: function (R, x, y, z) {
      var kayu = gelap(W(PAL.bata), 0.72);
      [-1.25, 1.25].forEach(function (d) { R.tambah(Kotak(0.12, 1.75, 0.12), kayu, M(x + d, y + 0.87, z)); });
      R.tambah(Tabung(0.05, 0.05, 2.75, 5), kayu, M(x, y + 1.7, z, 0, 0, Math.PI / 2));
    },
    /* jala menggantung, rapat = mata jala kecil */
    jalaGantung: function (R, x, y, z, rapat, warna) {
      var w = warna || W(PAL.kertas), n = rapat ? 7 : 3, i, tepi = 1;
      for (i = 0; i <= n; i++) {
        var t = i / n, lebar = 1 - t * 0.25;
        R.tambah(Tabung(0.024, 0.024, 1.25, 3), w, M(x + (t - 0.5) * tepi, y - 0.62, z, 0, 0, (t - 0.5) * 0.25), 0);
        R.tambah(Kotak(lebar * tepi, 0.042, 0.042), w, M(x, y - t * 1.22, z), 0);
      }
    },
    pelampung: function (R, x, y, z, s) {
      var mrh = W(PAL.bata), krem = W(PAL.kertas);
      R.tambah(gumpal(0.26 * s, 51, 1, 0.03), mrh, M(x, y + 0.08 * s, z, 0, 0, 0, 1, 0.7, 1), 0.03);
      R.tambah(Tabung(0.022 * s, 0.022 * s, 0.82 * s, 4), W(PAL.tinta), M(x, y + 0.5 * s, z), 0);
      R.tambah(Kotak(0.34 * s, 0.22 * s, 0.022 * s), W(PAL.kunyit), M(x + 0.17 * s, y + 0.8 * s, z), 0.02);
      R.tambah(Tabung(0.27 * s, 0.27 * s, 0.05 * s, 8), krem, M(x, y + 0.14 * s, z), 0.02);
    },
    karang: function (R, x, y, z, s, seed, warna) {
      if (Aset3D.ada('prop_karang')) { R.tambahBerwarna(Aset3D.ambil('prop_karang', true), M(x, y, z, 0, seed || 0, 0, s, s, s)); return; }
      var rng = acak(seed), w = warna || W(PAL.bata), i;
      R.tambah(gumpal(0.4 * s, seed, 0, 0.2), gelap(w, 0.86), M(x, y + 0.15 * s, z, 0, 0, 0, 1.15, 0.65, 1), 0.08);
      for (i = 0; i < 5; i++) {
        var a = i * 1.26 + rng() * 0.6, d = 0.14 + rng() * 0.24;
        R.tambah(Tabung(0.022 * s, 0.075 * s, (0.45 + rng() * 0.32) * s, 5), campur(w, W(PAL.kertas), rng() * 0.32), M(x + Math.cos(a) * d * s, y + 0.42 * s, z + Math.sin(a) * d * s, Math.sin(a) * 0.35, 0, -Math.cos(a) * 0.35), 0.05);
      }
    },
    penyu: function (R, x, y, z, s, ry) {
      if (Aset3D.ada('ani_penyu')) { R.tambahBerwarna(Aset3D.ambil('ani_penyu'), M(x, y - Aset3D.info('ani_penyu').u[1] * s / 2, z, 0, ry || 0, 0, s, s, s)); return; }
      var tp = campur(W(PAL.zamrud), W(PAL.bata), 0.42), kl = campur(W(PAL.pucuk), W(PAL.kertas), 0.25), c = Math.cos(ry || 0), n = Math.sin(ry || 0);
      R.tambah(gumpal(0.42 * s, 52, 1, 0.05), tp, M(x, y, z, 0, ry || 0, 0, 1, 0.42, 1.2), 0.08);
      R.tambah(gumpal(0.13 * s, 53, 0, 0.04), kl, M(x + n * 0.54 * s, y + 0.02 * s, z + c * 0.54 * s, 0, ry || 0, 0, 0.9, 0.8, 1.2), 0.03);
      [-1, 1].forEach(function (i) {
        R.tambah(gumpal(0.16 * s, 54, 0, 0.04), kl, M(x + c * i * 0.42 * s + n * 0.22 * s, y - 0.03 * s, z - n * i * 0.42 * s + c * 0.22 * s, 0, ry || 0, 0, 1.3, 0.22, 0.6), 0.03);
        R.tambah(gumpal(0.1 * s, 55, 0, 0.04), kl, M(x + c * i * 0.34 * s - n * 0.36 * s, y - 0.03 * s, z - n * i * 0.34 * s - c * 0.36 * s, 0, ry || 0, 0, 1.2, 0.22, 0.6), 0.03);
      });
    },
    /* ikan kakatua: toska dengan moncong kunyit */
    ikanKakatua: function (R, x, y, z, s, ry) {
      var w = W(PAL.toska), c = Math.cos(ry || 0), n = Math.sin(ry || 0);
      R.tambah(gumpal(0.34 * s, 56, 1, 0.04), campur(w, W(PAL.pucuk), 0.25), M(x, y, z, 0, (ry || 0) + Math.PI / 2, 0, 1.25, 0.82, 0.48), 0.04);
      R.tambah(gumpal(0.15 * s, 57, 0, 0.03), W(PAL.kunyit), M(x + n * 0.4 * s, y - 0.02 * s, z + c * 0.4 * s, 0, 0, 0, 0.8, 0.72, 0.8), 0.02);
      R.tambah(Kerucut(0.22 * s, 0.3 * s, 4), W(PAL.bata), M(x - n * 0.5 * s, y, z - c * 0.5 * s, (ry === undefined ? 0 : c) * -Math.PI / 2, 0, n * Math.PI / 2, 1, 1, 0.3), 0.03);
    },

    /* ===== Bab 4: bukit ===== */
    /* mulut urat tambang: bingkai kayu dan rel pendek */
    mulutTambang: function (R, x, y, z, s) {
      if (ai(R, 'prop_gua_tambang', x, y - 0.05, z - 0.62 * s, s * 0.62, 0)) return;
      var kayu = gelap(W(PAL.bata), 0.72), gelapS = new THREE.Color(0x24211C);
      R.tambah(Kotak(1.1 * s, 1.2 * s, 0.1 * s), gelapS, M(x, y + 0.6 * s, z - 0.08 * s), 0.02);
      [-1, 1].forEach(function (d) { R.tambah(Kotak(0.17 * s, 1.35 * s, 0.17 * s), kayu, M(x + d * 0.58 * s, y + 0.67 * s, z)); });
      R.tambah(Kotak(1.4 * s, 0.17 * s, 0.2 * s), kayu, M(x, y + 1.38 * s, z));
    },
    papanTutup: function (R, x, y, z, s) {
      var kayu = campur(W(PAL.bata), W(PAL.kertas), 0.25);
      [0.32, 0.72, 1.12].forEach(function (t, i) { R.tambah(Kotak(1.26 * s, 0.22 * s, 0.06 * s), kayu, M(x, y + t * s, z + 0.04 * s, 0, 0, (i - 1) * 0.08), 0.08); });
    },
    bongkah: function (R, x, y, z, s, seed) {
      R.tambah(gumpal(0.2 * s, seed || 60, 0, 0.14), seed % 3 === 0 ? new THREE.Color(0x2A2A2A) : W(PAL.kunyit), M(x, y, z), 0.05);
    },
    mesinDaur: function (R, x, y, z) {
      if (ai(R, 'prop_mesin_daur', x, y, z, 1, 0)) return;
      var badan = W(PAL.toska), gelapB = gelap(badan, 0.72), krem = W(PAL.kertas), besi = new THREE.Color(0xB5AE9C);
      R.tambah(Kotak(2.1, 1.25, 1.35), badan, M(x, y + 0.82, z), 0.03);
      R.tambah(Kotak(2.25, 0.22, 1.5), gelapB, M(x, y + 0.11, z), 0.03);
      R.tambah(Kerucut(0.7, 0.6, 4), krem, M(x - 0.45, y + 1.74, z, 0, Math.PI / 4, Math.PI), 0.03);
      R.tambah(Kotak(0.9, 0.56, 0.08), krem, M(x + 0.45, y + 0.9, z + 0.69), 0.02);
      R.tambah(Kotak(0.72, 0.12, 0.5), besi, M(x - 1.3, y + 0.48, z + 0.1, 0, 0, 0.42), 0.03);
      R.tambah(Tabung(0.13, 0.15, 0.7, 6), besi, M(x + 0.68, y + 1.72, z - 0.2), 0.03);
    },
    /* roda gigi, terpisah agar bisa berputar */
    geoRoda: function (s) {
      var R = new B.Rakit(61), besi = W(PAL.kunyit), i;
      R.tambah(Tabung(0.28 * s, 0.28 * s, 0.09 * s, 10), besi, M(0, 0, 0, Math.PI / 2, 0, 0), 0.02);
      for (i = 0; i < 8; i++) { var a = i * Math.PI / 4; R.tambah(Kotak(0.12 * s, 0.17 * s, 0.09 * s), besi, M(Math.sin(a) * 0.33 * s, Math.cos(a) * 0.33 * s, 0, 0, 0, -a), 0.02); }
      R.tambah(Tabung(0.09 * s, 0.09 * s, 0.11 * s, 6), W(PAL.tinta), M(0, 0, 0, Math.PI / 2, 0, 0), 0);
      return R.geometri();
    },
    tumpukLogam: function (R, x, y, z) {
      var besi = new THREE.Color(0x9D968A), kr = W(PAL.bata);
      R.tambah(Kotak(0.5, 0.2, 0.32), besi, M(x, y + 0.1, z, 0, 0.3, 0), 0.08);
      R.tambah(Tabung(0.09, 0.09, 0.62, 6), kr, M(x + 0.12, y + 0.26, z - 0.08, 0, 0.8, Math.PI / 2), 0.06);
      R.tambah(Kotak(0.3, 0.15, 0.24), besi, M(x - 0.2, y + 0.27, z + 0.05, 0.3, 1, 0), 0.08);
    },

    /* ===== Bab 5: balai desa ===== */
    /* pendopo tanpa dinding dengan atap limas */
    balai: function (R, x, y, z, s) {
      if (ai(R, 'bld_balai', x, y, z, s, 0)) return;
      var kayu = W(PAL.bata), gelapK = gelap(kayu, 0.66), atap = campur(W(PAL.bata), W(PAL.kunyit), 0.2), krem = W(PAL.kertas), i, j;
      R.tambah(Kotak(6.8 * s, 0.3 * s, 4.8 * s), krem, M(x, y + 0.15 * s, z), 0.03);
      for (i = -1; i <= 1; i++) for (j = -1; j <= 1; j += 2) R.tambah(Tabung(0.13 * s, 0.15 * s, 2.5 * s, 6), gelapK, M(x + i * 2.9 * s, y + 1.5 * s, z + j * 1.9 * s));
      R.tambah(Kerucut(5.2 * s, 1.9 * s, 4), atap, M(x, y + 3.6 * s, z, 0, Math.PI / 4, 0, 1.08, 1, 0.76), 0.05);
      R.tambah(Kotak(7 * s, 0.14 * s, 4.9 * s), gelapK, M(x, y + 2.72 * s, z), 0.03);
    },
    papanRencana: function (R, x, y, z, ry) {
      if (ai(R, 'prop_papan', x, y, z, 1, ry)) return;
      var kayu = gelap(W(PAL.bata), 0.72), krem = W(PAL.kertas), c = Math.cos(ry || 0), n = Math.sin(ry || 0);
      [-1, 1].forEach(function (d) { R.tambah(Kotak(0.16, 2.1, 0.16), kayu, M(x + c * d * 1.05, y + 1.05, z - n * d * 1.05, 0, ry || 0, 0)); });
      R.tambah(Kotak(2.5, 1.5, 0.1), W(PAL.bata), M(x, y + 1.55, z, 0, ry || 0, 0), 0.03);
      R.tambah(Kotak(2.25, 1.26, 0.06), krem, M(x + n * 0.06, y + 1.55, z + c * 0.06, 0, ry || 0, 0), 0.02);
      [[-0.65, 1.88], [-0.65, 1.55], [-0.65, 1.22]].forEach(function (p, i) {
        [0, 0.68, 1.36].forEach(function (o, j) { R.tambah(Kotak(0.5, 0.2, 0.05), j === 1 ? W(PAL.pucuk) : (j === 0 ? W(PAL.bata) : W(PAL.toska)), M(x + c * (p[0] + o - 0.03), y + p[1], z - n * (p[0] + o - 0.03) + c * 0.1, 0, ry || 0, 0), 0.02); });
      });
    },
    /* cahaya: hanya titik terang, untuk kunang-kunang yang terlihat dari jauh */
    kunang: function (R, x, y, z, s, cahaya) {
      var kuning = new THREE.Color(0xFFF08A), hitam = W(PAL.tinta);
      R.tambah(gumpal(0.1 * s, 62, 0, 0.03), kuning, M(x, y, z, 0, 0, 0, 1, 0.8, 1.3), 0.02);
      if (!cahaya) R.tambah(gumpal(0.07 * s, 63, 0, 0.03), hitam, M(x, y + 0.03 * s, z + 0.1 * s), 0);
    },

    /* benda yang hanya ada sebagai model AI. Bila modelnya belum ada, tidak digambar. */
    hiasan: function (R, kunci, x, y, z, s, ry) { return ai(R, kunci, x, y, z, s, ry); },

    /* geometri tunggal untuk instancing dan benda bergerak */
    geoPohon: function (murah) {
      /* pohon paling banyak jumlahnya: tingkat Sedang juga satu langkah lebih murah */
      if (Aset3D.ada('tree_meranti')) return Aset3D.ambil('tree_meranti', murah ? 2 : (Dunia.tingkat === 'tinggi' ? 0 : 1));
      var R = new B.Rakit(murah ? 11 : 12);
      C.pohon(R, 0, 0, 0, 1, murah ? 301 : 401, murah);
      return R.geometri();
    },
    geoTunggul: function (murah) { var R = new B.Rakit(13); C.tunggul(R, 0, 0, 0, 1, murah); return R.geometri(); },
    geoBibit: function () { if (Aset3D.ada('tree_meranti_muda')) return Aset3D.ambil('tree_meranti_muda'); var R = new B.Rakit(14); C.bibit(R, 0, 0, 0, 1); return R.geometri(); },

    /* pasang benda ke Rakit: model AI bila ada (kunci), selain itu fungsi cadangan */
    pasang: function (R, kunci, x, y, z, s, ry, cadangan) {
      if (!ai(R, kunci, x, y, z, s, ry)) cadangan();
    }
  };
  root.Cadangan = C;
})(window);
