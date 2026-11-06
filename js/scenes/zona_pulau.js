/* Zona pulau: diorama seluruh Nusa Lestari untuk layar judul, Peta Pulau, dan hasil. Dibuat sekali lalu disimpan. */
(function (root) {
  var B = Bentuk, W = Warna.W, campur = Warna.campur, gelap = Warna.gelap, PAL = Warna.PAL, C = Cadangan;
  var jepit = B.jepit, halus = B.halus, derau = B.derau, derauLapis = B.derauLapis, jarakGaris = B.jarakGaris, M = B.M, gumpal = B.gumpal, acak = B.acak;

  var SUNGAI = [[-6, -9], [-2.5, -3], [1, 1.5], [0.5, 8], [2.6, 14], [2.5, 26]];
  function jari(a) { return 21 + 4.5 * Math.sin(a * 3 + 1.1) + 2.6 * Math.sin(a * 5 + 0.4) + 1.3 * Math.sin(a * 9); }
  function tinggi(x, z) {
    var d = Math.sqrt(x * x + z * z), a = Math.atan2(z, x), R = jari(a), t = 1 - d / R;
    if (t < 0) return t * 7 - 0.3;
    var h = halus(0, 0.24, t) * 1.05;
    h += Math.pow(jepit(t, 0, 1), 1.35) * (derauLapis(x * 0.13 + 3, z * 0.13 + 1) * 11 + halus(4, -14, z) * 7);
    var ds = jarakGaris(SUNGAI, x, z);
    return h * halus(0.5, 2.6, ds) - 0.1 * (1 - halus(0.3, 1, ds));
  }
  /* gambar di langit: selalu menghadap kamera, titik pijak di tepi bawah */
  function gambarLangit(induk, kunci, x, y, z, lebar, opacity) {
    var s = new THREE.Sprite(new THREE.SpriteMaterial({ map: Aset3D.gambar(kunci), transparent: true, depthWrite: false, fog: false, opacity: opacity || 1 }));
    s.center.set(0.5, 0); s.position.set(x, y, z); s.scale.set(lebar, lebar, 1);
    induk.add(s);
    return s;
  }
  function bangun() {
    var scene = new THREE.Scene(), c = document.createElement('canvas'), i, j;
    c.width = 4; c.height = 256;
    var x2 = c.getContext('2d'), gr = x2.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, '#5FC4E0'); gr.addColorStop(0.17, '#A9E2EC'); gr.addColorStop(0.27, '#DDF3E9'); gr.addColorStop(1, '#DDF3E9');
    x2.fillStyle = gr; x2.fillRect(0, 0, 4, 256);
    var langit = new THREE.CanvasTexture(c); langit.colorSpace = THREE.SRGBColorSpace;
    scene.background = langit;
    scene.fog = new THREE.Fog(0xDDF3E9, 110, 480);
    Dunia.pasangCahaya(scene, 1.55, 2.6);

    /* Laut: petak rapat dekat pulau, makin jarang ke kejauhan */
    var Laut = new B.Rakit(301), g = new THREE.PlaneGeometry(2, 2, 56, 56), a = g.attributes.position;
    g.rotateX(-Math.PI / 2);
    for (i = 0; i < a.count; i++) {
      var u = a.getX(i), v = a.getZ(i), lx = u * Math.abs(u) * 520, lz = v * Math.abs(v) * 460;
      a.setXYZ(i, lx, (derau(lx * 0.25, lz * 0.25) - 0.5) * 0.5, lz);
    }
    var dangkal = campur(W(PAL.pucuk), W(PAL.toska), 0.5), dalam = W(PAL.toska), dalam2 = gelap(W(PAL.toska), 0.84);
    Laut.tambah(g, function (x, y, z) {
      var d = Math.sqrt(x * x + z * z), R = jari(Math.atan2(z, x));
      return d < R + 8 ? campur(dangkal, dalam, halus(R - 1, R + 8, d)) : campur(dalam, dalam2, halus(R + 8, R + 60, d));
    }, null, 0.045);
    scene.add(Laut.jadi(Bahan.laut(0.1)));

    /* Buih pantai */
    var Buih = new B.Rakit(302), nb = 110;
    for (j = 0; j < nb; j++) {
      if (j % 9 === 0) continue;
      var a1 = j / nb * Math.PI * 2, a2 = (j + 1) / nb * Math.PI * 2, r1 = jari(a1) + 0.55 + Math.sin(j * 1.7) * 0.2, r2 = jari(a2) + 0.55 + Math.sin((j + 1) * 1.7) * 0.2, w = 0.45;
      var vt = [Math.cos(a1) * r1, 0.28, Math.sin(a1) * r1, Math.cos(a2) * r2, 0.28, Math.sin(a2) * r2, Math.cos(a2) * (r2 + w), 0.28, Math.sin(a2) * (r2 + w), Math.cos(a1) * r1, 0.28, Math.sin(a1) * r1, Math.cos(a2) * (r2 + w), 0.28, Math.sin(a2) * (r2 + w), Math.cos(a1) * (r1 + w), 0.28, Math.sin(a1) * (r1 + w)];
      var bg = new THREE.BufferGeometry(); bg.setAttribute('position', new THREE.Float32BufferAttribute(vt, 3));
      Buih.tambah(bg, W(PAL.kertas), null, 0.02);
    }
    var bahanBuih = Bahan.tetap({ transparent: true, opacity: 0.6, side: THREE.DoubleSide });
    scene.add(Buih.jadi(bahanBuih));

    /* Medan pulau */
    var pasir = campur(W(PAL.kertas), W(PAL.kunyit), 0.2), rum1 = campur(W(PAL.pucuk), W(PAL.zamrud), 0.12), rum2 = campur(W(PAL.pucuk), W(PAL.zamrud), 0.62), batuW = new THREE.Color(0xA49C8A), air = campur(W(PAL.toska), W(PAL.langit), 0.2);
    scene.add(Medan.buat({
      lebar: 64, dalam: 60, nx: 74, nz: 70, tinggi: tinggi,
      warna: function (x, y, z) {
        if (jarakGaris(SUNGAI, x, z) < 0.85) return air;
        if (y < 0.66) return pasir;
        if (y > 7.6) return campur(batuW, W(PAL.kertas), halus(7.6, 11, y) * 0.7);
        return campur(rum1, rum2, jepit(derauLapis(x * 0.22, z * 0.22) * 1.3 + (y - 1) * 0.05, 0, 1));
      }
    }, 303));

    /* Pohon lewat Hutan: di Bab 5 mengikuti nilai simulasi seluruh pulau. Kelapa dan rumah digabung. */
    var R = new B.Rakit(305), rng = acak(9), tx, tz, ty, skala, pohon = [], bahanPulau = Bahan.pulih();
    for (i = 0; i < 250; i++) {
      tx = -24 + rng() * 48; tz = -24 + rng() * 44; ty = tinggi(tx, tz);
      if (ty < 0.95 || ty > 8.2) continue;
      if (Math.abs(tx - 16) < 7.5 && Math.abs(tz - 6) < 7) continue;   // permukiman di sisi kanan, tempat Rapat Besar
      if (jarakGaris(SUNGAI, tx, tz) < 1.5) continue;
      skala = 0.5 + rng() * 0.36 + (tz < 2 ? 0.1 : 0);
      pohon.push({ x: tx, z: tz, s: skala });
    }
    var hutan = new Hutan({ scene: scene, tinggi: tinggi, nilaiAwal: 70, bahan: bahanPulau, dekat: [], jauh: pohon, tanpaTunggul: true });
    for (i = 0; i < 26; i++) {
      var sudutK = rng() * Math.PI * 2, rk = jari(sudutK) - 2.3 - rng() * 1.8;
      tx = Math.cos(sudutK) * rk; tz = Math.sin(sudutK) * rk; ty = tinggi(tx, tz);
      if (ty < 0.2 || ty > 1.6 || tz < -8) continue;
      C.kelapa(R, tx, ty, tz, 0.6 + rng() * 0.28, 1200 + i);
    }
    [[12, 3.5, 0.4, null], [15.5, 6, -0.3, W(PAL.bata)], [19, 2.5, -0.6, null], [12.5, 9, 0.1, null], [16.5, 10, -0.4, W(PAL.bata)], [20, 7.5, -0.7, null]].forEach(function (r) {
      C.rumah(R, r[0], tinggi(r[0], r[1]), r[1], 0.72, r[2], r[3]);
    });
    var KINCIR = [[10, -10, 1], [17, -6, 0.86]], rotor = [];   // kincir angin di dekat Bukit Batu
    KINCIR.forEach(function (k) { C.tiangKincir(R, k[0], tinggi(k[0], k[1]) - 0.2, k[1], k[2]); });
    scene.add(R.jadi(bahanPulau));
    /* di luar pulau tidak ikut pudar: perahu dan pulau jauh */
    var Luar = new B.Rakit(307);
    C.perahu(Luar, -1.5, 0.15, 30, 1.2, 0.9);
    C.perahu(Luar, 8, 0.15, 27, 1.1, -0.5);
    if (Aset3D.ada('spr_pulau_a') && Aset3D.ada('spr_pulau_b')) {
      [[34, -310, 46, 'a'], [112, -330, 58, 'b'], [-58, -300, 38, 'b'], [170, -290, 40, 'a']].forEach(function (p) { gambarLangit(scene, 'spr_pulau_' + p[3], p[0], -2, p[1], p[2], 0.8); });
    } else [[-30, -300, 15], [36, -330, 22], [118, -290, 13], [190, -310, 18]].forEach(function (p, idx) {
      Luar.tambah(gumpal(p[2], 1400 + idx, 1, 0.14), campur(W(PAL.zamrud), W(PAL.langit), 0.4), M(p[0], -p[2] * 0.12, p[1], 0, idx, 0, 1.7, 0.6, 1));
    });
    scene.add(Luar.jadi(Bahan.tetap()));

    KINCIR.forEach(function (k) {
      var m = new THREE.Mesh(C.balingKincir(k[2]), Bahan.tetap());
      m.position.set(k[0], tinggi(k[0], k[1]) - 0.2 + 3.9 * k[2], k[1] + 0.28 * k[2]);
      scene.add(m); rotor.push(m);
    });

    /* Awan */
    var A = new B.Rakit(306), awan = new THREE.Group(), DAFTAR_AWAN = [[-92, 44, -170, 3], [-6, 56, -210, 3.6], [84, 42, -170, 3.2], [38, 33, -100, 1.4], [-40, 30, -80, 1.1]];
    var awanGambar = Aset3D.ada('spr_awan_a') && Aset3D.ada('spr_awan_b') && Aset3D.ada('spr_awan_c');
    if (awanGambar) DAFTAR_AWAN.forEach(function (a0, idx) { gambarLangit(awan, 'spr_awan_' + 'abc'[idx % 3], a0[0], a0[1] - 7, a0[2], a0[3] * 19); });
    else DAFTAR_AWAN.forEach(function (a0, idx) {
      var s = a0[3];
      A.tambah(gumpal(2.6 * s, 1500 + idx, 1, 0.1), new THREE.Color(0xFFFFFF), M(a0[0], a0[1], a0[2], 0, 0, 0, 1.5, 0.62, 1), 0.012);
      A.tambah(gumpal(2.1 * s, 1510 + idx, 1, 0.1), new THREE.Color(0xFFFDF4), M(a0[0] + 3 * s, a0[1] - 0.5 * s, a0[2] + 0.5, 0, 0, 0, 1.3, 0.6, 1), 0.012);
      A.tambah(gumpal(1.7 * s, 1520 + idx, 1, 0.1), new THREE.Color(0xFFFDF4), M(a0[0] - 3 * s, a0[1] - 0.6 * s, a0[2], 0, 0, 0, 1.3, 0.55, 1), 0.012);
    });
    /* tanpa bayangan, supaya bidang-bidang awan tidak tampak abu-abu dan bersudut */
    if (!awanGambar) awan.add(A.jadi(new THREE.MeshBasicMaterial({ vertexColors: true, fog: false })));
    scene.add(awan);

    var rako = new Rako(3);
    scene.add(rako.grup);
    var burung = Aset3D.ada('spr_burung') ? gambarLangit(scene, 'spr_burung', -8, 25, -30, 9) : null;

    return { scene: scene, rotor: rotor, awan: awan, rako: rako, burung: burung, bahanBuih: bahanBuih, hutan: hutan, t: 0 };
  }

  var P = null;
  root.Pulau = {
    tinggi: tinggi,
    /* urutan misi di peta: dari kiri ke kanan, naik turun bergantian */
    ZONA: { 0: { x: -17, z: 10 }, 1: { x: -8.4, z: -5.7 }, 2: { x: -0.6, z: 8.3 }, 3: { x: 9.2, z: 13.7 }, 4: { x: 14, z: -6.5 }, 5: { x: 20.5, z: 4.5 } },
    siapkan: function () { if (!P) P = bangun(); P.hutan.pulihkan(70); Dunia.hiasan = null; Dunia.pakai(P.scene); return P; },
    kameraJudul: function () { Kamera.atur({ fov: 30, jauh: 900, dasar: [-20, 8, 0], offset: [-9.6, 12.6, 94], ikutK: 0 }); },
    kameraPeta: function () { Kamera.atur({ fov: 30, jauh: 900, dasar: [2, 0, 3], offset: [0, 50, 47], ikutK: 0 }); },
    /* Bab 5: seluruh pulau mengikuti rencana murid. Warna tiap zona melebar atau menyempit sesuai nilainya, jadi peta terbaca sebagai hasil. */
    terapkanRencana: function (st, raw, o) {
      var Z = Pulau.ZONA, baik = !!o.baik;
      function r(v) { return 1.5 + jepit(v / 100, 0, 1) * 12.5; }
      P.hutan.terapkan(st.hutan);
      Warna.U.uLunak.value = 3;
      Warna.atur(0, Z[1].x, Z[1].z, r(st.hutan));
      Warna.atur(1, Z[2].x, Z[2].z, r(st.air));
      Warna.atur(2, Z[3].x, Z[3].z, r(st.ikan));
      Warna.atur(3, Z[4].x, Z[4].z, r(st.tambang));
      /* warga tidak mewarnai alam yang sudah habis: di masa depan buruk permukiman hanya sedikit berwarna */
      Warna.atur(4, Z[5].x, Z[5].z, r(st.warga) * (baik ? 1 : 0.5));
      Warna.atur(5, Z[0].x, Z[0].z, r(st.warga) * (baik ? 1 : 0.5));
      Warna.U.uKering.value = baik ? 0 : jepit((46 - (st.hutan + st.ikan + st.air + st.tambang) / 4) / 34, 0, 1);
      Warna.U.uKeruh.value = 0;
    },
    /* burung Rako: terbang berkeliling atau melayang */
    update: function (dt, modus) {
      if (!P) return;
      Pulau.gerak(dt, modus);
      Dunia.render(dt);
    },
    gerak: function (dt, modus) {
      P.t += dt;
      P.hutan.update(dt);
      var t = P.t, gerak = !UI.kurangi;
      P.rotor.forEach(function (m, i) { if (gerak) m.rotation.z -= dt * (1.6 + i * 0.4); });
      if (gerak) P.awan.position.x = Math.sin(t * 0.03) * 24;
      /* burung hanya di layar judul, terbang ke kiri sesuai arah gambarnya */
      if (P.burung) {
        P.burung.visible = modus === 'judul';
        if (gerak) { P.burung.position.x = 60 - (t * 3) % 135; P.burung.position.y = 25 + Math.sin(t * 0.6) * 1.2; }
      }
      P.bahanBuih.opacity = 0.5 + Math.sin(t * 0.9) * 0.14;
      var r = P.rako;
      if (modus === 'judul') {
        r.tuju.set(7 + (gerak ? Math.sin(t * 0.33) * 4 : 0), 21 + (gerak ? Math.sin(t * 0.7) * 0.5 : 0), 24);
      } else {
        r.tuju.set(9 + (gerak ? Math.cos(t * 0.25) * 14 : 0), 15, 6 + (gerak ? Math.sin(t * 0.25) * 12 : 0));
      }
      r.mode = 'tunjuk';
      r.update(dt);
    }
  };
})(window);
