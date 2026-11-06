/* Zona Lembah Sawah (Bab 2): sawah di hilir, pipa bambu dari mata air, lereng yang bisa diteras, parit bersampah, sungai dari hutan.
   Air dan tanah di layar mengikuti simulasi: genangan dan padi turun bila air kurang, lidah lumpur muncul bila tanah hanyut. */
(function (root) {
  var B = Bentuk, W = Warna.W, campur = Warna.campur, gelap = Warna.gelap, PAL = Warna.PAL, C = Cadangan, UW = Warna.U;
  var jepit = B.jepit, halus = B.halus, derau = B.derau, derauLapis = B.derauLapis, jarakGaris = B.jarakGaris, M = B.M, acak = B.acak;

  var SUNGAI = [[15, -30], [11.5, -14], [13, -6], [11.5, 1], [13, 8], [11.5, 20]];
  var PARIT = [[10.5, 1.5], [5, 1.3], [1, 1.5], [-3.6, 1.3]];
  var SAWAH = { x0: -14, x1: -4, z0: -3, z1: 3.7 };
  var JEMBATAN = { x: 3.4, z: 1.4, lebar: 0.95, dalam: 1.45 };
  var LONGSOR = [[-6, -11], [-6.4, -7.4], [-7.4, -4.4], [-8.4, -1.2]];
  var PIPA = [[7.6, -8.4], [7.3, -4.7], [-6.6, -4.7], [-7.1, -3]];
  var BOCOR = [[4, -4.7], [-0.5, -4.7], [-4.5, -4.7]];
  var TERAS = [[-1.6, -6.9], [2, -6.9], [5.6, -6.9]];
  var SAMPAH = [[6.2, 1.35], [1.4, 1.5], [-1.6, 1.4]];
  var PUSAT_WARNA = { x: -3, z: -0.4, r: 14 };

  function jarakSungai(x, z) { return jarakGaris(SUNGAI, x, z); }
  function jarakParit(x, z) { return jarakGaris(PARIT, x, z); }
  function luarSawah(x, z) { return Math.max(SAWAH.x0 - x, x - SAWAH.x1, SAWAH.z0 - z, z - SAWAH.z1); }

  function tinggiMedan(x, z) {
    var h = (derauLapis(x * 0.12 + 4, z * 0.12 + 2) - 0.5) * 0.45;
    h += halus(-5.3, -15, z) * (3.2 + derauLapis(x * 0.09, z * 0.09) * 5);
    h += halus(-14, -26, x) * 2;
    var ds = jarakSungai(x, z);
    h = h * halus(1.1, 4, ds) + (-0.85) * (1 - halus(0.9, 2.4, ds));
    var dp = jarakParit(x, z);
    h = h * halus(0.55, 1.25, dp) + (-0.46) * (1 - halus(0.5, 1.15, dp));
    var k = 1 - halus(0, 0.85, luarSawah(x, z));
    return h * (1 - k) + (-0.16) * k;
  }
  /* tempat berpijak: sama dengan medan, kecuali jembatan papan di atas parit */
  function tinggi(x, z) {
    if (Math.abs(x - JEMBATAN.x) < JEMBATAN.lebar && Math.abs(z - JEMBATAN.z) < JEMBATAN.dalam) return Math.max(tinggiMedan(x, z), 0.14);
    return tinggiMedan(x, z);
  }

  function buat() {
    var scene = new THREE.Scene(), kabut = 0xDFD6BC, i, x, z;
    scene.background = new THREE.Color(kabut);
    scene.fog = new THREE.Fog(kabut, 21, 48);
    var cahaya = Dunia.pasangCahaya(scene, 1.5, 2.55);
    var bahan = Bahan.pulih();

    /* medan */
    var rumputW = campur(W(PAL.pucuk), W(PAL.zamrud), 0.3), rumputT = W(PAL.pucuk), lumpurW = gelap(W(PAL.bata), 0.6), pasir = campur(W(PAL.kertas), W(PAL.bata), 0.35), lereng = campur(W(PAL.bata), W(PAL.pucuk), 0.32);
    scene.add(Medan.buat({
      lebar: 72, dalam: 60, nx: 60, nz: 48, cz: -6, tinggi: tinggiMedan,
      warna: function (px, py, pz) {
        var ds = jarakSungai(px, pz), dp = jarakParit(px, pz), n1 = derauLapis(px * 0.3, pz * 0.3);
        if (luarSawah(px, pz) < 0.2) return lumpurW;
        if (ds < 2.2 || dp < 1) return pasir;
        if (pz < -5.2 && pz > -9.6) return campur(lereng, rumputW, n1 * 0.7);
        return campur(rumputW, rumputT, jepit(n1 * 1.15 - 0.05 + py * 0.03, 0, 1));
      }
    }, 141, bahan));
    /* air sungai dan parit: bidang datar di bawah tanah, terlihat di bagian yang lebih rendah */
    scene.add(Medan.buatAir({ lebar: 72, dalam: 60, nx: 26, nz: 22, cz: -6, y: -0.24, warna: campur(W(PAL.toska), W(PAL.langit), 0.12), ombak: 0.03, ragam: 0.1 }));
    /* kincir air di hulu parit, jauh dari tempat Bu Sri dan tumpukan sampah, berputar */
    var kincirAir = null;
    if (Aset3D.ada('prop_kincir_air')) {
      kincirAir = new THREE.Mesh(Aset3D.ambil('prop_kincir_air'), Bahan.tetap());
      kincirAir.position.set(8, 0.42, 1.42); kincirAir.scale.setScalar(0.72);
      scene.add(kincirAir);
    }

    /* genangan sawah: naik turun mengikuti air */
    var genangan = Medan.buatAir({ lebar: 10.2, dalam: 6.9, nx: 10, nz: 7, cx: -9, cz: 0.35, y: 0, warna: campur(W(PAL.langit), W(PAL.toska), 0.55), ombak: 0.012, ragam: 0.05, opacity: 0.86 });
    scene.add(genangan);

    /* inti statis */
    var R = new B.Rakit(241), rng = acak(31), kayu = gelap(W(PAL.bata), 0.72), krem = campur(W(PAL.kertas), W(PAL.bata), 0.2);
    /* pematang keliling sawah dan pembagi petak */
    var gel = campur(W(PAL.bata), W(PAL.pucuk), 0.45);
    [[-9, 3.72, 10.3, 0.42], [-9, -3, 10.3, 0.42], [-9, 0.35, 10.1, 0.26]].forEach(function (p) { R.tambah(B.Kotak(p[2], 0.22, p[3]), gel, M(p[0], -0.02, p[1]), 0.05); });
    [[-4, 0.35], [-14, 0.35], [-7.4, 0.35], [-10.8, 0.35]].forEach(function (p, idx) { R.tambah(B.Kotak(idx < 2 ? 0.42 : 0.26, 0.22, 6.9), gel, M(p[0], -0.02, p[1]), 0.05); });
    /* pipa bambu: dari mata air, sepanjang kaki lereng, masuk ke sawah */
    var yPipa = PIPA.map(function (p, idx) { return idx === 3 ? 0.42 : tinggi(p[0], p[1]) + (idx === 0 ? 0.32 : 0.92); });
    yPipa[2] = yPipa[1];
    for (i = 0; i < PIPA.length - 1; i++) C.pipa(R, PIPA[i][0], yPipa[i], PIPA[i][1], PIPA[i + 1][0], yPipa[i + 1], PIPA[i + 1][1]);
    for (i = 0; i <= 5; i++) { x = -6 + i * 2.6; C.tiangPipa(R, x, tinggi(x, -4.7) - 0.05, -4.7, yPipa[1] - tinggi(x, -4.7)); }
    /* mata air */
    R.tambah(B.gumpal(1.4, 243, 1, 0.08), campur(W(PAL.toska), W(PAL.langit), 0.3), M(7.7, tinggi(7.7, -9) + 0.1, -9, 0, 0, 0, 1.25, 0.1, 0.9), 0.05);
    [[6.3, -9.6, 1.1], [9.1, -9.3, 1.3], [7.8, -10.3, 1.5]].forEach(function (p, idx) { C.batu(R, p[0], tinggi(p[0], p[1]), p[1], p[2], 900 + idx); });
    /* jembatan papan di atas parit */
    for (i = 0; i < 6; i++) R.tambah(B.Kotak(1.8, 0.09, 0.42), campur(W(PAL.bata), W(PAL.kertas), 0.25), M(JEMBATAN.x, 0.1, JEMBATAN.z - 1.15 + i * 0.46, 0, (i % 2 ? 0.02 : -0.02), 0), 0.09);
    /* rumah, gubuk, pohon, batu */
    C.pasang(R, 'bld_rumah', -9.5, tinggi(-9.5, -6.2), -6.2, 1, 0.25, function () { C.rumah(R, -9.5, tinggi(-9.5, -6.2), -6.2, 1.02, 0.25); });
    C.kelapa(R, 8.8, tinggi(8.8, -1.8), -1.8, 0.9, 1901);
    C.hiasan(R, 'bld_gubuk', -13.4, tinggi(-13.4, -5.6), -5.6, 1, 0.5);
    C.hiasan(R, 'prop_pipa_bambu', 7.3, tinggi(7.3, -7.3), -7.3, 0.62, Math.PI / 2);
    for (i = 0; i < 26; i++) {
      x = -30 + rng() * 62; z = -32 + rng() * 21;
      if (jarakSungai(x, z) < 2.6 || (Math.abs(x - 2) < 9 && z > -13)) continue;
      C.pohon(R, x, tinggi(x, z) - 0.08, z, 1 + rng() * 0.5, 1000 + i, true);
    }
    var halangan = [], ukur;
    for (i = 0; i < 7; i++) {
      x = -2.5 + rng() * 11; z = -2.8 + rng() * 7.4;
      if (jarakParit(x, z) < 1.8 || jarakSungai(x, z) < 3 || Math.abs(x + 2.2) + Math.abs(z + 0.6) < 3 || Math.abs(x - 1.5) + Math.abs(z - 3.6) < 2) continue;
      if (rng() < 0.6) { ukur = 0.5 + rng() * 0.4; C.semak(R, x, tinggi(x, z), z, ukur, 1650 + i); halangan.push([x, z, ukur * 0.7]); }
      else { ukur = 0.55 + rng() * 0.5; C.batu(R, x, tinggi(x, z), z, ukur, 1670 + i); halangan.push([x, z, ukur * 0.55]); }
    }
    scene.add(R.jadi(bahan));

    /* padi: satu mesh, tingginya mengikuti air dan tanah */
    var Rpadi = new B.Rakit(242);
    for (x = -13.4; x < -4.5; x += 0.72) for (z = -2.55; z < 3.4; z += 0.66) {
      if (Math.abs(z - 0.35) < 0.3 || Math.abs(x + 7.4) < 0.28 || Math.abs(x + 10.8) < 0.28) continue;
      C.padi(Rpadi, x + (rng() - 0.5) * 0.12, -0.17, z + (rng() - 0.5) * 0.12, rng);
    }
    var padi = Rpadi.jadi(bahan); scene.add(padi);

    /* hiasan: hilang di tingkat Hemat */
    var Hi = new B.Rakit(244);
    for (i = 0; i < 46; i++) { x = -3.6 + rng() * 15; z = -4 + rng() * 9; if (jarakSungai(x, z) < 2.6 || jarakParit(x, z) < 1.2) continue; C.rumput(Hi, x, tinggi(x, z), z, rng); }
    for (i = 0; i < 22; i++) { x = -3.6 + rng() * 15; z = -4 + rng() * 9; if (jarakSungai(x, z) < 2.6 || jarakParit(x, z) < 1.2) continue; C.bunga(Hi, x, tinggi(x, z), z, rng() < 0.5 ? W(PAL.kunyit) : W(PAL.kertas)); }
    var hiasan = Hi.jadi(bahan); scene.add(hiasan);
    Dunia.hiasan = hiasan;

    /* tiga deret yang berubah saat murid bertindak: selongsong pipa, teras, tumpukan sampah */
    var Rs = new B.Rakit(245), tali = W(PAL.bata);
    Rs.tambah(B.Tabung(0.19, 0.19, 0.74, 7), campur(W(PAL.kunyit), W(PAL.bata), 0.45), M(0, 0, 0, 0, 0, Math.PI / 2), 0.05);
    [-0.26, 0, 0.26].forEach(function (o) { Rs.tambah(B.Tabung(0.205, 0.205, 0.07, 7), tali, M(o, 0, 0, 0, 0, Math.PI / 2), 0.03); });
    var selongsong = new B.Deret(scene, Rs.geometri(), Bahan.tetap(), BOCOR.map(function (p) { return { x: p[0], y: yPipa[1], z: p[1] }; }));
    var Rt = new B.Rakit(246); C.teras(Rt, 0, 0, 0, 3.6);
    var teras = new B.Deret(scene, Rt.geometri(), bahan, TERAS.map(function (p) { return { x: p[0], y: tinggi(p[0], p[1]) - 0.1, z: p[1] }; }));
    var sampah = C.deretSampah(scene, ['spr_sampah_a', 'spr_sampah_b', 'spr_sampah_c'], SAMPAH.map(function (p, idx) { return { x: p[0], y: -0.22, z: p[1], ry: idx * 1.7 }; }), 1.7, function () { var Rg = new B.Rakit(247); C.tumpukSampah(Rg, 0, 0, 0, 1.15, 251); return Rg.geometri(); });
    BOCOR.forEach(function (p, i2) { selongsong.skala(i2, 0); });
    TERAS.forEach(function (p, i2) { teras.skala(i2, 0); });

    /* lidah lumpur dari lereng ke sawah: tampak bila tanah hanyut */
    var lumpur = new THREE.Color(0x6B4526), lumpurT = new THREE.Color(0x8A5F38), gl = new THREE.PlaneGeometry(1, 1, 6, 24), al = gl.attributes.position, jm = 25;
    for (i = 0; i < al.count; i++) {
      var iy = Math.floor(i / 7), ix = i % 7, t = iy / (jm - 1), n = LONGSOR.length - 1, f = t * n, seg = Math.min(n - 1, Math.floor(f)), ft = f - seg, a = LONGSOR[seg], b = LONGSOR[seg + 1];
      var px = a[0] + (b[0] - a[0]) * ft, pz = a[1] + (b[1] - a[1]) * ft, dx = b[0] - a[0], dz = b[1] - a[1], pj = Math.sqrt(dx * dx + dz * dz);
      var lebar = (1 + t * 2) * (0.85 + derau(t * 9, 3) * 0.4), o = (ix / 6 - 0.5) * lebar * 2, vx = px - dz / pj * o, vz = pz + dx / pj * o;
      al.setXYZ(i, vx, Math.max(tinggiMedan(vx, vz), -0.12) + 0.07, vz);
    }
    var Rl = new B.Rakit(248);
    Rl.tambah(gl, function (px, py, pz) { return campur(lumpur, lumpurT, derauLapis(px * 0.5, pz * 0.5)); }, null, 0.08);
    var lidah = Rl.jadi(Bahan.tetap({ transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, fog: true }));
    lidah.visible = false; scene.add(lidah);

    /* satwa saat sawah pulih */
    var Rv = new B.Rakit(249);
    C.kuntul(Rv, -6.1, -0.16, -1, 1.9, 0.7); C.kuntul(Rv, -9.2, -0.16, 1.7, 1.75, -0.6);
    C.katak(Rv, -4.2, 0.1, 2.1, 1.7); C.katak(Rv, -3.2, tinggi(-3.2, 3), 3, 1.4);
    var satwa = Rv.jadi(Bahan.tetap()); satwa.visible = false; scene.add(satwa);
    var Rc = new B.Rakit(250);
    [[-5.8, 1.7, 1.5], [-2.8, 1.5, -1.3], [-7.6, 1.9, -0.5], [-1.4, 1.5, 2.9]].forEach(function (p) { C.capung(Rc, p[0], p[1], p[2], 1.25); });
    var capung = Rc.jadi(Bahan.tetap()); capung.visible = false; scene.add(capung);

    var zona = {
      scene: scene, tinggi: tinggi, hiasan: hiasan, BOCOR: BOCOR, TERAS: TERAS, SAMPAH: SAMPAH,
      selesai: { pipa: [false, false, false], teras: [false, false, false], sampah: [false, false, false] },
      kamera: { fov: 31, jauh: 90, dasar: [-1.2, 0.7, -0.2], offset: [0, 12.7, 15.8], batas: { x0: -5.6, x1: 2.6, z0: -1.9, z1: 0.9 }, ikutK: 0.42 },
      /* batas: tokoh tidak boleh berdiri di balik balon atau keluar layar (diuji test/smoke/tahan.js) */
      jalur: new Medan.Jalur({ x0: -14, x1: 8.6, z0: -3.9, z1: 4.9, sel: 0.5, boleh: function (px, pz) {
        if (jarakSungai(px, pz) < 2.6 || luarSawah(px, pz) < 0.45 || (px > 7.8 && pz > 3)) return false;   // sudut kanan bawah tertutup Jam Pasir
        if (jarakParit(px, pz) < 0.95 && !(Math.abs(px - JEMBATAN.x) < 0.8 && Math.abs(pz - JEMBATAN.z) < 1.6)) return false;
        return true;
      } })
    };
    halangan.forEach(function (p) { zona.jalur.rintangan(p[0], p[1], p[2]); });

    /* warna kabut mengikuti keadaan dunia */
    var KABUT = new THREE.Color(kabut), KABUT_SEGAR = new THREE.Color(0xCFEDE6), KABUT_KERING = new THREE.Color(0xD6C19B);
    function aturKabut(warna, k) { scene.fog.color.copy(KABUT).lerp(warna, k); scene.background.copy(scene.fog.color); }
    /* jejak warna di sekitar perbaikan, menetap sampai bab selesai */
    function warnaPerbaikan() {
      zona.selesai.pipa.forEach(function (on, i2) { if (on) Warna.atur(i2, BOCOR[i2][0], BOCOR[i2][1], 2.9); });
      zona.selesai.teras.forEach(function (on, i2) { if (on) Warna.atur(3 + i2, TERAS[i2][0], TERAS[i2][1], 3.4); });
      var ns = zona.selesai.sampah.filter(Boolean).length;
      if (ns) Warna.atur(6, 2, 1.4, 1.5 + ns * 1.7);
    }

    /* tiga tindakan murid. Rako memakai fungsi yang sama saat memperagakan. */
    zona.tambal = async function (i2) {
      var h = Arena.hero, p = BOCOR[i2];
      zona.selesai.pipa[i2] = true;
      h.main('tanam', 540);
      await Tween.wait(180);
      Aud.sfx('tanam');
      Tween.run(280, function (e) { selongsong.skala(i2, Math.max(0.01, e)); }, Ease.easeOutBack);
      Warna.tumbuh(i2, p[0], p[1], 0.2, 2.9, 900, Ease.easeOutCubic);
      Arena.partikel.semprot({ x: p[0], y: yPipa[1], z: p[1], n: 10, warna: [PAL.langit, PAL.toska, PAL.kunyit], laju: 1.4, naik: 1.6, ukuran: 0.07 });
      Arena.tambahDaun(1);
      await Tween.wait(300);
    };
    zona.buatTeras = async function (i2) {
      var h = Arena.hero, p = TERAS[i2], y = tinggi(p[0], p[1]);
      zona.selesai.teras[i2] = true;
      h.main('tebang', 760);
      for (var j = 0; j < 3; j++) {
        Aud.sfx('tanam');
        Arena.partikel.semprot({ x: p[0] + (j - 1) * 0.8, y: y + 0.4, z: p[1] + 0.6, n: 6, warna: [0x8A5F38, 0x6B4526], laju: 1.5, naik: 2, ukuran: 0.07 });
        await Tween.wait(240);
      }
      Tween.run(420, function (e) { teras.skala(i2, Math.max(0.01, e)); }, Ease.easeOutBack);
      Warna.tumbuh(3 + i2, p[0], p[1], 0.2, 3.4, 900, Ease.easeOutCubic);
      Arena.tambahDaun(1);
      await Tween.wait(320);
    };
    zona.angkatSampah = async function (i2) {
      var h = Arena.hero, p = SAMPAH[i2];
      zona.selesai.sampah[i2] = true;
      h.main('tanam', 540);
      await Tween.wait(170);
      Aud.sfx('tanam');
      Tween.run(240, function (e) { sampah.skala(i2, 1 - e); }, Ease.easeOutCubic);
      Arena.partikel.semprot({ x: p[0], y: 0.1, z: p[1], n: 10, warna: [PAL.kertas, PAL.toska, PAL.bata], laju: 1.4, naik: 2, ukuran: 0.07 });
      var ns = zona.selesai.sampah.filter(Boolean).length;
      Warna.tumbuh(6, 2, 1.4, 0.2 + (ns - 1) * 1.7, 1.5 + ns * 1.7, 700, Ease.easeOutCubic);
      Arena.tambahDaun(1);
      await Tween.wait(280);
    };

    /* ===== Lompat Waktu ===== */
    zona.mulaiLompat = function () {
      Aud.ambien('sunyi');
      Arena.hero.pergi(1.6, 3.6);   // ke tempat lapang agar semua terlihat
    };
    zona.terapkan = function (st, raw, o) {
      var kurang = Math.min(st.air, st.tanah);
      UW.uKeruh.value = jepit((44 - st.air) / 26, 0, 1) * 0.85;
      UW.uKering.value = o.baik ? 0 : jepit((54 - kurang) / 32, 0, 1);
      genangan.position.y = -0.38 + jepit(st.air / 70, 0, 1) * 0.32;
      genangan.visible = st.air > 14;
      padi.scale.y = jepit(kurang / 62, 0.14, 1);
      var l = jepit((56 - st.tanah) / 14, 0, 1);
      lidah.visible = l > 0.01;
      lidah.material.opacity = l * 0.96;
      if (o.baik) {
        Warna.atur(7, PUSAT_WARNA.x, PUSAT_WARNA.z, 0.3 + raw * raw * PUSAT_WARNA.r); aturKabut(KABUT_SEGAR, raw);
        if (raw > 0.3) { Aud.musik('sawah'); Aud.ambien('sungai'); }
      } else aturKabut(KABUT_KERING, UW.uKering.value);
      satwa.visible = capung.visible = o.baik && raw > 0.6;
      var sudut = raw * Math.PI * 5;
      cahaya.matahari.position.set(-9 * Math.cos(sudut), 16, 8 * Math.sin(sudut) + 4);
      cahaya.matahari.intensity = 2.55 - (o.baik ? 0 : jepit((50 - kurang) / 50, 0, 1) * 0.35) - Math.abs(Math.sin(sudut)) * 0.35;
    };
    zona.akhirLompat = function (o) {
      var h = Arena.hero, w = zona.warga, baik = o.baik;
      h.berhenti();
      h.ekspresi(baik ? 'sorak' : 'sedih'); h.anim = baik ? 'sorak' : 'sedih';
      if (w) { w.ekspresi(baik ? 'sorak' : 'sedih'); w.anim = baik ? 'sorak' : 'sedih'; w.hadap(h.x, h.z); }
      cahaya.matahari.position.set(-9, 16, 8);
      cahaya.matahari.intensity = baik ? 2.55 : 2.25;
    };
    /* kembali ke hari ini: perbaikan murid tetap ada */
    zona.keHariIni = function () {
      Warna.kosongkan();
      warnaPerbaikan();
      aturKabut(KABUT_SEGAR, 0);
      lidah.visible = satwa.visible = capung.visible = false;
      Aud.musik('sunyi'); Aud.ambien('sungai');
      if (zona.warga) { zona.warga.anim = 'diam'; zona.warga.ekspresi('senang'); }
    };
    /* semua tempat tujuan, untuk uji jangkauan */
    zona.tujuan = function () {
      return BOCOR.map(function (p, i2) { return ['pipa' + i2, p[0], p[1] + 0.2, 1]; }).concat(TERAS.map(function (p, i2) { return ['teras' + i2, p[0], p[1] + 0.5, 2.6]; }), SAMPAH.map(function (p, i2) { return ['sampah' + i2, p[0], p[1], 1.25]; }));
    };
    zona.sukses = function () {
      Aud.sfx('gelombang');
      satwa.visible = capung.visible = true;
      return Warna.tumbuh(0, PUSAT_WARNA.x, PUSAT_WARNA.z, PUSAT_WARNA.r, 72, UI.kurangi ? 300 : 2600, Ease.easeInOutCubic);
    };
    /* semburan air dari pipa yang masih bocor */
    var waktuBocor = 0;
    zona.update = function (dt) {
      if (kincirAir && !UI.kurangi) kincirAir.rotation.z -= dt * 1.1;
      var waktu = UW.uWaktu.value;
      if (capung.visible && !UI.kurangi) { capung.position.y = Math.sin(waktu * 2.4) * 0.14; capung.position.x = Math.sin(waktu * 0.7) * 0.5; }
      waktuBocor -= dt;
      if (waktuBocor < 0 && !UI.kurangi && Arena.partikel) {
        waktuBocor = 0.13;
        BOCOR.forEach(function (p, i2) { if (!zona.selesai.pipa[i2]) Arena.partikel.semprot({ x: p[0], y: yPipa[1] - 0.1, z: p[1] + 0.1, n: 2, warna: [PAL.langit, PAL.toska], laju: 0.5, naik: 0.5, g: 6, ukuran: 0.055, umur: 0.5 }); });
      }
    };
    return zona;
  }
  root.ZonaSawah = { buat: buat, tinggi: tinggi };
})(window);
