/* Zona Teluk Karang (Bab 3): pantai di kiri, laut dangkal di kanan, dermaga, pelampung, karang, dan kawanan ikan yang terlihat dari atas.
   Banyaknya ikan di air mengikuti simulasi: bila model berkata 0, ikan betul-betul hilang dari pemandangan. */
(function (root) {
  var B = Bentuk, W = Warna.W, campur = Warna.campur, gelap = Warna.gelap, PAL = Warna.PAL, C = Cadangan, UW = Warna.U;
  var jepit = B.jepit, halus = B.halus, derauLapis = B.derauLapis, M = B.M, acak = B.acak;

  var PELAMPUNG = [[4.8, -4.6], [7.6, -3.1], [9.6, -5.6], [6.8, -7], [10.2, -1.2]];
  var SAMPAH = [[-2.6, -4.4], [-1.4, -2.8], [0.8, 3.5]];
  var DERMAGA = { x0: 0.2, x1: 6.1, z: 0.8, lebar: 1.4, y: 0.44 };
  var RAK = { x: -4.8, z: -0.5 };
  var PERAHU = { x: 7.3, z: 0.8 };
  var LAUT_PERAHU = { x: 6.4, z: -1.8 };
  var PUSAT_IKAN = [[6, -3.6], [9, -6.2], [8.2, 1.8], [11, -2.6]];
  var PUSAT_WARNA = { x: 3.4, z: -1.6, r: 15 };
  var Y_AIR = -0.1;

  function garis(z) { return 0.5 + z * 0.35 + Math.sin(z * 0.5) * 0.4; }
  function diDermaga(x, z) { return x > DERMAGA.x0 - 0.2 && x < DERMAGA.x1 + 0.1 && Math.abs(z - DERMAGA.z) < DERMAGA.lebar * 0.5; }
  function tinggiMedan(x, z) {
    var dp = x - garis(z);
    var darat = 0.55 + (derauLapis(x * 0.12 + 7, z * 0.12 + 3) - 0.5) * 0.45 + halus(-7.5, -20, z) * (2.6 + derauLapis(x * 0.09, z * 0.09) * 4) + halus(-7, -22, x) * 2.4;
    var dasar = -0.42 - jepit(dp / 7, 0, 1) * 0.92;
    var k = halus(-1.3, 0.9, dp);
    return darat * (1 - k) + dasar * k;
  }
  function tinggi(x, z) { return diDermaga(x, z) ? DERMAGA.y : tinggiMedan(x, z); }

  function buat() {
    var scene = new THREE.Scene(), kabut = 0xDEE0CC, i, x, z;
    scene.background = new THREE.Color(kabut);
    scene.fog = new THREE.Fog(kabut, 24, 56);
    var cahaya = Dunia.pasangCahaya(scene, 1.6, 2.5);
    var bahan = Bahan.pulih();

    /* medan: rumput, pasir, lalu dasar laut */
    var rumputW = campur(W(PAL.pucuk), W(PAL.zamrud), 0.32), rumputT = W(PAL.pucuk), pasir = campur(W(PAL.kertas), W(PAL.kunyit), 0.2), pasirB = campur(W(PAL.kertas), W(PAL.bata), 0.25), dasarLaut = campur(W(PAL.toska), W(PAL.kertas), 0.42), dasarDalam = gelap(W(PAL.toska), 0.72);
    scene.add(Medan.buat({
      lebar: 84, dalam: 60, nx: 56, nz: 44, cx: 2, cz: -6, tinggi: tinggiMedan,
      warna: function (px, py, pz) {
        var dp = px - garis(pz), n1 = derauLapis(px * 0.3, pz * 0.3);
        if (dp > 0.6) return campur(dasarLaut, dasarDalam, jepit(dp / 8, 0, 1));
        if (dp > -3.4) return campur(pasir, pasirB, n1 * 0.5);
        return campur(rumputW, rumputT, jepit(n1 * 1.15 - 0.05 + py * 0.03, 0, 1));
      }
    }, 161, bahan));

    /* karang di dasar laut: ikut gelombang warna */
    var R = new B.Rakit(261), rng = acak(41), warnaKarang = [W(PAL.bata), W(PAL.kunyit), campur(W(PAL.bata), W(PAL.kertas), 0.4), W(PAL.pucuk)];
    for (i = 0; i < 20; i++) {
      x = 3.4 + rng() * 11; z = -9 + rng() * 15;
      if (diDermaga(x, z) || x - garis(z) < 1.4) continue;
      C.karang(R, x, tinggiMedan(x, z) - 0.05, z, 0.62 + rng() * 0.62, 400 + i, warnaKarang[i % 4]);
    }
    /* dermaga, rak jala, rumah, kelapa */
    C.dermaga(R, DERMAGA.x0, DERMAGA.x1, DERMAGA.y - 0.04, DERMAGA.z, DERMAGA.lebar);
    C.rakJala(R, RAK.x, tinggi(RAK.x, RAK.z), RAK.z);
    C.pasang(R, 'bld_rumah', -9.2, tinggi(-9.2, -3.4), -3.4, 1, 0.3, function () { C.rumah(R, -9.2, tinggi(-9.2, -3.4), -3.4, 1, 0.3); });
    C.rumah(R, -6.4, tinggi(-6.4, -6.8), -6.8, 0.9, 0.1, W(PAL.bata));
    /* kelapa di tepi: tidak boleh menutupi rak jala dan tempat tokoh berjalan */
    [[-10.4, 3.4, 0.95], [-11.4, -1.4, 0.9], [-0.8, -6.8, 1.05], [-3.6, -8.2, 1], [-8.8, -6.6, 1]].forEach(function (p, idx) { C.kelapa(R, p[0], tinggi(p[0], p[1]), p[1], p[2], 1950 + idx); });
    C.perahu(R, 0.6, Y_AIR - 0.02, -5.9, 0.9, 0);
    /* bakau di tepi air */
    [[-7.2, 0.2], [-8.8, 2.2], [-10.4, 0.8], [-12, 3]].forEach(function (p, idx) { var bz = p[0]; C.hiasan(R, 'tree_bakau', garis(bz) + 0.5, tinggi(garis(bz) + 0.5, bz) - 0.05, bz, 0.9 + idx * 0.06, p[1] + idx); });
    for (i = 0; i < 18; i++) {
      x = -32 + rng() * 26; z = -30 + rng() * 22;
      C.pohon(R, x, tinggi(x, z) - 0.08, z, 1 + rng() * 0.5, 1100 + i, true);
    }
    var halangan = [], ukur;
    for (i = 0; i < 6; i++) {
      x = -8 + rng() * 6; z = -4 + rng() * 8;
      if (Math.abs(x - RAK.x) + Math.abs(z - RAK.z) < 2.6 || Math.abs(x + 4.6) + Math.abs(z - 3.4) < 2) continue;
      ukur = 0.5 + rng() * 0.4; C.semak(R, x, tinggi(x, z), z, ukur, 1680 + i); halangan.push([x, z, ukur * 0.7]);
    }
    scene.add(R.jadi(bahan));

    /* air: agak bening, jadi ikan dan karang terlihat dari atas */
    var dangkal = campur(W(PAL.langit), W(PAL.toska), 0.45), dalam = W(PAL.toska);
    var air = Medan.buatAir({
      lebar: 84, dalam: 60, nx: 30, nz: 22, cx: 2, cz: -6, y: Y_AIR, ombak: 0.035, ragam: 0.05, opacity: 0.6,
      warna: function (px, py, pz) { return campur(dangkal, dalam, jepit((px - garis(pz)) / 9, 0, 1)); }
    });
    /* air digambar lebih dulu dan tidak menulis kedalaman, jadi ikan dan penyu tetap jelas walau dunia pudar */
    air.material.depthWrite = false; air.renderOrder = 1;
    scene.add(air);
    function bahanDiAir() { return Bahan.tetap({ transparent: true, opacity: 0.94 }); }

    /* hiasan: hilang di tingkat Hemat */
    var Hi = new B.Rakit(262);
    for (i = 0; i < 40; i++) { x = -13 + rng() * 11; z = -7 + rng() * 12; if (x - garis(z) > -3.6) continue; C.rumput(Hi, x, tinggi(x, z), z, rng); }
    for (i = 0; i < 16; i++) { x = -12 + rng() * 10; z = -6 + rng() * 11; if (x - garis(z) > -3.6) continue; C.bunga(Hi, x, tinggi(x, z), z, rng() < 0.5 ? W(PAL.kunyit) : W(PAL.kertas)); }
    var hiasan = Hi.jadi(bahan); scene.add(hiasan);
    Dunia.hiasan = hiasan;

    /* jala di rak: rapat atau longgar */
    function buatJala(rapat) { var Rj = new B.Rakit(263); C.jalaGantung(Rj, 0, 0, 0, rapat); var m = Rj.jadi(Bahan.tetap()); m.position.set(RAK.x, tinggi(RAK.x, RAK.z) + 1.66, RAK.z + 0.03); m.scale.set(1.95, 1.1, 1); scene.add(m); return m; }
    var jalaRapat = buatJala(true), jalaLonggar = buatJala(false);
    jalaLonggar.visible = false;

    /* pelampung dan tumpukan sampah */
    var Rp = new B.Rakit(264); C.pelampung(Rp, 0, 0, 0, 1.25);
    var pelampung = new B.Deret(scene, Rp.geometri(), Bahan.tetap(), PELAMPUNG.map(function (p) { return { x: p[0], y: Y_AIR, z: p[1] }; }));
    var sampah = C.deretSampah(scene, ['spr_sampah_a', 'spr_sampah_b', 'spr_sampah_c'], SAMPAH.map(function (p, idx) { return { x: p[0], y: tinggi(p[0], p[1]) - 0.02, z: p[1], ry: idx * 2 }; }), 1.85, function () { var Rg = new B.Rakit(265); C.tumpukSampah(Rg, 0, 0, 0, 1.3, 266); return Rg.geometri(); });

    /* sampah mengapung di laut: makin banyak bila sampah dibiarkan */
    var ngambang = [];
    for (i = 0; i < 26; i++) ngambang.push({ x: 2.6 + rng() * 11, y: Y_AIR, z: -9 + rng() * 15, ry: rng() * 6 });
    var deretNgambang = C.deretSampah(scene, ['spr_apung_a', 'spr_apung_b', 'spr_apung_c'], ngambang, 0.72, function () { var Rm = new B.Rakit(267); C.tumpukSampah(Rm, 0, 0, 0, 0.62, 268); return Rm.geometri(); }, 0.035);
    deretNgambang.jumlah(0);

    /* ikan: InstancedMesh, jumlah yang digambar sebanding nilai ikan */
    var Ri = new B.Rakit(269), IKAN_N = 70, dataIkan = [], tintaIkan = [W(PAL.kunyit), W(PAL.kertas), campur(W(PAL.bata), W(PAL.kunyit), 0.5)];
    C.ikan(Ri, 0.06, 0, 0, 1.3, new THREE.Color(0xFFFFFF), 0);
    var geoIkan = Ri.geometri(), mIkan = new THREE.InstancedMesh(geoIkan, bahanDiAir(), IKAN_N);
    mIkan.frustumCulled = false; mIkan.renderOrder = 3; scene.add(mIkan);
    /* model AI sudah berwarna: pewarnaan tiap ikan cukup variasi halus */
    if (Aset3D.ada('ani_ikan')) tintaIkan = [new THREE.Color(0xFFFFFF), new THREE.Color(0xFFE9C8), new THREE.Color(0xE8F4FF)];
    for (i = 0; i < IKAN_N; i++) mIkan.setColorAt(i, tintaIkan[i % 3]);
    mIkan.instanceColor.needsUpdate = true;
    for (i = 0; i < IKAN_N; i++) {
      var pc = PUSAT_IKAN[i % PUSAT_IKAN.length], rr = 0.7 + rng() * 2;
      dataIkan.push({ cx: pc[0] + (rng() - 0.5) * 1.5, cz: pc[1] + (rng() - 0.5) * 1.5, rx: rr, rz: rr * 0.68, w: (0.45 + rng() * 0.5) * (i % 2 ? 1 : -1), f: rng() * 6.28, y: -0.42 - rng() * 0.28, s: 0.72 + rng() * 0.5 });
    }
    mIkan.count = Math.round(IKAN_N * 0.7);
    var m4 = new THREE.Matrix4(), qt = new THREE.Quaternion(), ey = new THREE.Euler(), vp = new THREE.Vector3(), vs = new THREE.Vector3();
    function gerakIkan(waktu) {
      for (var n = 0; n < mIkan.count; n++) {
        var d = dataIkan[n], a = waktu * d.w + d.f;
        vp.set(d.cx + Math.cos(a) * d.rx, d.y + Math.sin(waktu * 1.4 + d.f) * 0.04, d.cz + Math.sin(a) * d.rz);
        qt.setFromEuler(ey.set(0, Math.atan2(-Math.cos(a) * d.rz * d.w, -Math.sin(a) * d.rx * d.w), 0));
        mIkan.setMatrixAt(n, m4.compose(vp, qt, vs.set(d.s, d.s, d.s)));
      }
      mIkan.instanceMatrix.needsUpdate = true;
    }
    /* semua matriks terisi sejak awal: saat Kurangi animasi ikan diam, tetapi jumlahnya tetap bisa bertambah */
    var jumlahAwal = mIkan.count; mIkan.count = IKAN_N; gerakIkan(0); mIkan.count = jumlahAwal;

    /* perahu yang dinaiki murid */
    var Rb = new B.Rakit(270); C.pasang(Rb, 'veh_perahu', 0, 0, 0, 1, 0, function () { C.perahu(Rb, 0, 0, 0, 1.05, 0); });
    var perahu = Rb.jadi(Bahan.tetap()); perahu.position.set(PERAHU.x, Y_AIR - 0.02, PERAHU.z); perahu.rotation.y = 1.25; scene.add(perahu);

    /* jala yang ditebar di laut */
    var Rt = new B.Rakit(271), garisJala = W(PAL.kertas);
    for (i = -3; i <= 3; i++) { Rt.tambah(B.Kotak(2.4, 0.03, 0.05), garisJala, M(0, 0, i * 0.34), 0); Rt.tambah(B.Kotak(0.05, 0.03, 2.4), garisJala, M(i * 0.34, 0, 0), 0); }
    var jalaLaut = Rt.jadi(Bahan.tetap()); jalaLaut.visible = false; scene.add(jalaLaut);

    /* satwa yang kembali saat laut pulih */
    var Rs = new B.Rakit(272); C.penyu(Rs, 0, 0, 0, 1.25, Math.PI / 2);
    var penyu = Rs.jadi(bahanDiAir()); penyu.visible = false; penyu.renderOrder = 3; scene.add(penyu);
    var Rk = new B.Rakit(273); C.ikanKakatua(Rk, 4.4, -0.5, -0.8, 1.5, 0.4); C.ikanKakatua(Rk, 8.2, -0.56, -2, 1.3, -0.9); C.ikanKakatua(Rk, 6.2, -0.55, 3.6, 1.4, 2);
    var kakatua = Rk.jadi(bahanDiAir()); kakatua.visible = false; kakatua.renderOrder = 3; scene.add(kakatua);

    var zona = {
      scene: scene, tinggi: tinggi, hiasan: hiasan, PELAMPUNG: PELAMPUNG, SAMPAH: SAMPAH, RAK: RAK, PERAHU: PERAHU, Y_AIR: Y_AIR,
      aktif: [true, true, true, true, true], selesaiSampah: [false, false, false],
      kamera: { fov: 31, jauh: 100, dasar: [1.4, 0.7, -0.6], offset: [0, 12.7, 15.8], batas: { x0: -3.6, x1: 4, z0: -2.2, z1: 0.9 }, ikutK: 0.42 },
      /* batas: tokoh tidak boleh berdiri di balik balon atau keluar layar (diuji test/smoke/tahan.js) */
      jalur: new Medan.Jalur({ x0: -11.5, x1: 6.4, z0: -6.2, z1: 4.9, sel: 0.5, boleh: function (px, pz) { return px < garis(pz) - 0.35 || (px > DERMAGA.x0 - 0.4 && px < DERMAGA.x1 && Math.abs(pz - DERMAGA.z) < 0.55); } })
    };
    zona.jalur.rintangan(RAK.x, RAK.z, 1.5);
    halangan.forEach(function (p) { zona.jalur.rintangan(p[0], p[1], p[2]); });

    var KABUT = new THREE.Color(kabut), KABUT_SEGAR = new THREE.Color(0xCFEDE6), KABUT_KERING = new THREE.Color(0xD8CBAA);
    function aturKabut(warna, k) { scene.fog.color.copy(KABUT).lerp(warna, k); scene.background.copy(scene.fog.color); }
    function warnaPerbaikan() {
      var i2;
      for (i2 = 0; i2 < 3; i2++) if (zona.selesaiSampah[i2]) Warna.atur(i2, SAMPAH[i2][0], SAMPAH[i2][1], 3);
      if (zona.jalaLonggar) Warna.atur(3, RAK.x, RAK.z, 3.2);
    }
    function aturJumlahIkan(nilai) { mIkan.count = Math.round(IKAN_N * jepit(nilai, 0, 100) / 100); }

    /* ===== tindakan murid. Rako memakai fungsi yang sama saat memperagakan. ===== */
    zona.gantiJala = async function (longgar) {
      zona.jalaLonggar = longgar;
      Arena.hero.main('tanam', 480);
      await Tween.wait(160);
      Aud.sfx('tanam');
      jalaRapat.visible = !longgar; jalaLonggar.visible = longgar;
      Arena.partikel.semprot({ x: RAK.x, y: tinggi(RAK.x, RAK.z) + 1.2, z: RAK.z, n: 8, warna: [PAL.kertas, PAL.kunyit], laju: 1.4, naik: 1.4, ukuran: 0.06 });
      Warna.kosongkan(); warnaPerbaikan();
      await Tween.wait(240);
    };
    zona.aturPelampung = function (i2, on) {
      zona.aktif[i2] = on;
      Tween.run(240, function (e) { pelampung.skala(i2, on ? Math.max(0.02, e) : Math.max(0.02, 1 - e)); }, on ? Ease.easeOutBack : Ease.easeOutCubic);
      Aud.sfx(on ? 'pop' : 'tap');
      Arena.partikel.semprot({ x: PELAMPUNG[i2][0], y: Y_AIR + 0.1, z: PELAMPUNG[i2][1], n: 6, warna: [PAL.langit, PAL.kertas], laju: 1.1, naik: 1.4, ukuran: 0.06, umur: 0.5 });
    };
    zona.angkatSampah = async function (i2) {
      var p = SAMPAH[i2];
      zona.selesaiSampah[i2] = true;
      Arena.hero.main('tanam', 540);
      await Tween.wait(170);
      Aud.sfx('tanam');
      Tween.run(240, function (e) { sampah.skala(i2, 1 - e); }, Ease.easeOutCubic);
      Arena.partikel.semprot({ x: p[0], y: tinggi(p[0], p[1]) + 0.2, z: p[1], n: 10, warna: [PAL.kertas, PAL.toska, PAL.bata], laju: 1.4, naik: 2, ukuran: 0.07 });
      Warna.tumbuh(i2, p[0], p[1], 0.2, 3, 900, Ease.easeOutCubic);
      Arena.tambahDaun(1);
      await Tween.wait(280);
    };

    /* ===== percobaan pertama: ikut melaut ===== */
    /* naik: dari dermaga ke laut. turun: kembali. Tokoh menempel pada perahu. */
    zona.berlayar = async function (keLaut) {
      var h = Arena.hero, a = keLaut ? PERAHU : LAUT_PERAHU, b = keLaut ? LAUT_PERAHU : PERAHU;
      if (keLaut) { h.yTetap = Y_AIR + 0.2; h.taruh(a.x, a.z, 0.4); }
      Aud.sfx('whoosh');
      await Tween.run(UI.kurangi ? 300 : 1700, function (e) {
        var x = a.x + (b.x - a.x) * e, c = a.z + (b.z - a.z) * e;
        perahu.position.x = x; perahu.position.z = c;
        h.x = x; h.z = c;
      }, Ease.easeInOutCubic);
      if (!keLaut) { h.yTetap = null; h.taruh(DERMAGA.x1 - 0.5, DERMAGA.z, -1.2); }
    };
    zona.tebarJala = async function () {
      var p = PELAMPUNG[0], h = Arena.hero;
      h.hadap(p[0], p[1]);
      h.main('tebang', 620);
      Aud.sfx('whoosh');
      jalaLaut.visible = true; jalaLaut.position.set(p[0] - 0.4, Y_AIR + 0.04, p[1] + 0.3);
      await Tween.run(420, function (e) { jalaLaut.scale.setScalar(Math.max(0.05, e)); }, Ease.easeOutBack);
      Aud.sfx('tanam');
      /* ikan kecil ikut terangkat */
      for (var j = 0; j < 3; j++) {
        Arena.partikel.semprot({ x: p[0] - 0.4, y: Y_AIR + 0.1, z: p[1] + 0.3, n: 12, warna: [PAL.kunyit, PAL.kertas, PAL.bata], laju: 1.3, naik: 3.2, ukuran: 0.09, umur: 0.8, sebar: 1.2 });
        await Tween.wait(180);
      }
      jalaLaut.visible = false;
    };

    /* ===== Lompat Waktu ===== */
    zona.mulaiLompat = function () {
      Aud.ambien('sunyi');
      Arena.hero.pergi(-3.6, 3.4);
    };
    zona.terapkan = function (st, raw, o) {
      aturJumlahIkan(st.ikan);
      deretNgambang.jumlah(Math.round(26 * jepit((st.sampah - 16) / 72, 0, 1)));
      UW.uKeruh.value = jepit((st.sampah - 44) / 50, 0, 1) * 0.5;
      UW.uKering.value = o.baik ? 0 : Math.min(jepit((46 - st.ikan) / 44, 0, 1) * 0.72, 0.72);
      if (o.baik) {
        Warna.atur(7, PUSAT_WARNA.x, PUSAT_WARNA.z, 0.3 + raw * raw * PUSAT_WARNA.r); aturKabut(KABUT_SEGAR, raw);
        if (raw > 0.3) { Aud.musik('laut'); Aud.ambien('pantai'); }
      } else aturKabut(KABUT_KERING, UW.uKering.value);
      penyu.visible = kakatua.visible = o.baik && raw > 0.6;
      var sudut = raw * Math.PI * 5;
      cahaya.matahari.position.set(-9 * Math.cos(sudut), 16, 8 * Math.sin(sudut) + 4);
      cahaya.matahari.intensity = 2.5 - Math.abs(Math.sin(sudut)) * 0.35;
    };
    zona.akhirLompat = function (o) {
      var h = Arena.hero, w = zona.warga, baik = o.baik;
      h.berhenti();
      h.ekspresi(baik ? 'sorak' : 'sedih'); h.anim = baik ? 'sorak' : 'sedih';
      if (w) { w.ekspresi(baik ? 'sorak' : 'sedih'); w.anim = baik ? 'sorak' : 'sedih'; w.hadap(h.x, h.z); }
      cahaya.matahari.position.set(-9, 16, 8);
      cahaya.matahari.intensity = 2.5;
    };
    /* kembali ke hari ini: pilihan murid tetap ada */
    zona.keHariIni = function () {
      Warna.kosongkan();
      warnaPerbaikan();
      aturKabut(KABUT_SEGAR, 0);
      penyu.visible = kakatua.visible = false;
      Aud.musik('sunyi'); Aud.ambien('pantai');
      if (zona.warga) { zona.warga.anim = 'diam'; zona.warga.ekspresi('senang'); }
    };
    /* semua tempat tujuan, untuk uji jangkauan */
    zona.tujuan = function () {
      return SAMPAH.map(function (p, i2) { return ['sampah' + i2, p[0], p[1], 1.1]; }).concat([['jala', RAK.x, RAK.z + 0.5, 1.5], ['perahu', 5.6, 0.8, 0]]);
    };
    zona.sukses = function () {
      Aud.sfx('gelombang');
      penyu.visible = kakatua.visible = true;
      return Warna.tumbuh(0, PUSAT_WARNA.x, PUSAT_WARNA.z, PUSAT_WARNA.r, 76, UI.kurangi ? 300 : 2600, Ease.easeInOutCubic);
    };
    zona.update = function () {
      var waktu = UW.uWaktu.value;
      if (!UI.kurangi) gerakIkan(waktu);
      var t0 = waktu * 0.32;
      if (penyu.visible) { penyu.position.set(6.4 + Math.cos(t0) * 2.6, -0.5 + Math.sin(waktu) * 0.03, -0.8 + Math.sin(t0) * 1.8); penyu.rotation.y = -t0; }
      if (kakatua.visible && !UI.kurangi) kakatua.position.y = Math.sin(waktu * 1.8) * 0.05;
      perahu.position.y = Y_AIR - 0.02 + Math.sin(waktu * 1.3) * 0.035;
      perahu.rotation.x = Math.sin(waktu * 0.9) * 0.018;
    };
    return zona;
  }
  root.ZonaTeluk = { buat: buat, tinggi: tinggi };
})(window);
