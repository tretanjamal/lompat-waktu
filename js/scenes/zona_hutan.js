/* Zona Hutan Meranti (Bab 1): medan, sungai, hutan yang mengikuti simulasi, perahu, longsor, satwa yang kembali. */
(function (root) {
  var B = Bentuk, W = Warna.W, campur = Warna.campur, gelap = Warna.gelap, PAL = Warna.PAL, C = Cadangan, UW = Warna.U;
  var jepit = B.jepit, halus = B.halus, derau = B.derau, derauLapis = B.derauLapis, jarakGaris = B.jarakGaris, M = B.M, acak = B.acak;

  var SUNGAI = [[13, -32], [7.8, -14], [8.8, -6], [5.8, 1], [7.2, 8], [4.6, 16], [6, 30]];
  var LONGSOR = [[-3, -21], [-1, -14], [2.6, -8], [6.4, -3.4]];
  var SETAPAK = [[-15, 13], [-7.5, 5.2], [-2.5, 2], [1, -1.4], [3.8, -3.2]];
  /* pohon yang bisa ditebang. Yang di kiri dimajukan agar tidak tertutup Papan Misi, dan jaraknya cukup agar daerah ketuknya tidak bertumpuk (diuji test/smoke/tahan.js). */
  var POHON = [[-11.2, -3.2], [-9.2, -4.0], [-7.2, -4.4], [-5.4, -6.8], [-3.4, -5.7], [-1.4, -6.9], [0.6, -5.6], [2.6, -6.9], [4.6, -5.7], [6.5, -6.6]];
  var POHON_LATAR = [[-12.2, -0.4], [-11.6, 2.8]];   // ikut tumbang dan tumbuh, tetapi tidak bisa diketuk
  var SPOT = [[2.3, -0.9], [3.7, 0.5], [1.1, 0.1], [0.2, -2.6], [3.2, -2.9], [-2.4, -1.6], [-4.4, -0.2], [-0.4, 1.7]];
  var TUNGGUL_LAMA = [[-4.6, -2.6], [-1.6, -4.1]];

  function jarakSungai(x, z) { return jarakGaris(SUNGAI, x, z); }
  function jarakSetapak(x, z) { return jarakGaris(SETAPAK, x, z); }
  function tinggi(x, z) {
    var h = (derauLapis(x * 0.12 + 4, z * 0.12 + 2) - 0.5) * 0.7;
    h += halus(-7, -24, z) * (4.2 + derauLapis(x * 0.09, z * 0.09) * 5);
    h += halus(-12, -26, x) * 3;
    var ds = jarakSungai(x, z);
    return h * halus(1.1, 4.2, ds) + (-0.85) * (1 - halus(0.9, 2.5, ds));
  }

  function buat() {
    var scene = new THREE.Scene(), kabut = 0xDCD6BD, i, x, z;
    scene.background = new THREE.Color(kabut);
    scene.fog = new THREE.Fog(kabut, 19, 46);
    var cahaya = Dunia.pasangCahaya(scene, 1.5, 2.55);
    var bahan = Bahan.pulih();

    /* medan */
    var rumputW = campur(W(PAL.pucuk), W(PAL.zamrud), 0.32), rumputT = W(PAL.pucuk), tanah = campur(W(PAL.bata), W(PAL.kertas), 0.28), pasir = campur(W(PAL.kertas), W(PAL.bata), 0.35);
    scene.add(Medan.buat({
      lebar: 76, dalam: 76, nx: 52, nz: 52, tinggi: tinggi,
      warna: function (px, py, pz) {
        var ds = jarakSungai(px, pz), js = jarakSetapak(px, pz), n1 = derauLapis(px * 0.3, pz * 0.3);
        if (ds < 2.2) return pasir;
        if (js < 1.2) return campur(tanah, pasir, n1 * 0.6);
        return campur(rumputW, rumputT, jepit(n1 * 1.15 - 0.05 + py * 0.03, 0, 1));
      }
    }, 101, bahan));
    scene.add(Medan.buatAir({ lebar: 76, dalam: 76, nx: 26, nz: 26, y: -0.34, warna: campur(W(PAL.toska), W(PAL.langit), 0.12), ombak: 0.035, ragam: 0.11 }));

    /* hutan */
    var rng = acak(11), jauh = [], calon = [], calonJauh = [];
    for (i = 0; i < 70; i++) {
      x = -30 + rng() * 60; z = -34 + rng() * 24;
      if (jarakSungai(x, z) < 2.8) continue;
      jauh.push({ x: x, z: z, s: 1.05 + rng() * 0.5 });
    }
    POHON_LATAR.forEach(function (p) { jauh.push({ x: p[0], z: p[1], s: 1.2 }); });
    SPOT.forEach(function (p) { calon.push({ x: p[0], z: p[1], s: 1.05 }); });
    for (i = 0; i < 10; i++) {
      x = -14 + rng() * 21; z = -11.5 + rng() * 3.4;
      if (jarakSungai(x, z) < 3) continue;
      calonJauh.push({ x: x, z: z, s: 0.95 + rng() * 0.35 });
    }
    var hutan = new Hutan({ scene: scene, tinggi: tinggi, nilaiAwal: 70, bahan: bahan, dekat: POHON.map(function (p, idx) { return { x: p[0], z: p[1], s: 1.0 + (idx % 3) * 0.12 }; }), jauh: jauh, calon: calon, calonJauh: calonJauh });
    var slotPohon = hutan.slot.filter(function (t) { return t.jenis === 'dekat'; });
    var slotBibit = hutan.slot.filter(function (t) { return t.jenis === 'calon'; });
    slotBibit.forEach(function (t) { t.ambangAsli = t.ambang = 999; });

    /* inti statis */
    var R = new B.Rakit(201);
    TUNGGUL_LAMA.forEach(function (p) { C.tunggul(R, p[0], tinggi(p[0], p[1]), p[1], 1.05); });
    var halangan = [], ukur;
    for (i = 0; i < 16; i++) { x = -14 + rng() * 26; z = -5 + rng() * 15; if (jarakSungai(x, z) < 3.2 || jarakSetapak(x, z) < 1.7 || Math.abs(x + 2) + Math.abs(z - 3) < 3 || SPOT.some(function (p) { return Math.abs(p[0] - x) + Math.abs(p[1] - z) < 1.6; })) continue; ukur = 0.55 + rng() * 0.5; C.semak(R, x, tinggi(x, z), z, ukur, 600 + i); halangan.push([x, z, ukur * 0.7]); }
    for (i = 0; i < 12; i++) { x = -13 + rng() * 34; z = -9 + rng() * 22; var ds = jarakSungai(x, z); if (ds < 2.1 || ds > 3.8) continue; ukur = 0.6 + rng() * 0.7; C.batu(R, x, tinggi(x, z), z, ukur, 700 + i); halangan.push([x, z, ukur * 0.55]); }
    C.pasang(R, 'bld_rumah', 11.3, tinggi(11.3, -5.5), -5.5, 1, -0.35, function () { C.rumah(R, 11.3, tinggi(11.3, -5.5), -5.5, 1.0, -0.35); });
    C.kelapa(R, 10.2, tinggi(10.2, 0.8), 0.8, 0.95, 1701);
    scene.add(R.jadi(bahan));

    /* hiasan: hilang di tingkat Hemat */
    var H = new B.Rakit(202);
    for (i = 0; i < 60; i++) { x = -16 + rng() * 30; z = -7 + rng() * 20; if (jarakSungai(x, z) < 2.7 || jarakSetapak(x, z) < 1.3) continue; C.rumput(H, x, tinggi(x, z), z, rng); }
    for (i = 0; i < 34; i++) { x = -15 + rng() * 28; z = -6 + rng() * 17; if (jarakSungai(x, z) < 2.7 || jarakSetapak(x, z) < 1.3) continue; C.bunga(H, x, tinggi(x, z), z, rng() < 0.5 ? W(PAL.kunyit) : W(PAL.kertas)); }
    var hiasan = H.jadi(bahan);
    scene.add(hiasan);
    Dunia.hiasan = hiasan;

    /* bayangan pohon dekat */
    var bayang = slotPohon.map(function (t) { var b = Dunia.bayangan(1.5); b.position.set(t.x, t.y + 0.05, t.z); scene.add(b); return b; });

    /* rangka perahu dan perahu jadi */
    var Rr = new B.Rakit(210); C.perahuRangka(Rr, -8, tinggi(-8, 1.6), 1.6, 1.25);
    var rangka = Rr.jadi(bahan); scene.add(rangka);
    var Rp = new B.Rakit(211); C.pasang(Rp, 'veh_perahu', 0, 0, 0, 1, 0.15, function () { C.perahu(Rp, 0, 0, 0, 1.05, 0.15); });
    var perahu = Rp.jadi(Bahan.tetap()); perahu.position.set(6.1, -0.24, 1.2); perahu.visible = false; scene.add(perahu);

    /* bibit yang ditanam */
    var geoBibit = C.geoBibit();
    var bibit = slotBibit.map(function (t) { var m = new THREE.Mesh(geoBibit, bahan); m.position.set(t.x, t.y, t.z); m.scale.setScalar(1.55); m.visible = false; scene.add(m); return m; });

    /* longsor: lidah lumpur di atas medan, batu besar, kayu rebah */
    var lumpur = new THREE.Color(0x6B4526), lumpurT = new THREE.Color(0x8A5F38), gl = new THREE.PlaneGeometry(1, 1, 6, 26), al = gl.attributes.position, jm = 27;
    for (i = 0; i < al.count; i++) {
      var iy = Math.floor(i / 7), ix = i % 7, t = iy / (jm - 1), n = LONGSOR.length - 1, f = t * n, seg = Math.min(n - 1, Math.floor(f)), ft = f - seg, a = LONGSOR[seg], b = LONGSOR[seg + 1];
      var px = a[0] + (b[0] - a[0]) * ft, pz = a[1] + (b[1] - a[1]) * ft, dx = b[0] - a[0], dz = b[1] - a[1], pj = Math.sqrt(dx * dx + dz * dz);
      var lebar = (1.3 + t * 1.5) * (0.85 + derau(t * 9, 3) * 0.4), o = (ix / 6 - 0.5) * lebar * 2, vx = px - dz / pj * o, vz = pz + dx / pj * o;
      al.setXYZ(i, vx, tinggi(vx, vz) + 0.06, vz);
    }
    var Rl = new B.Rakit(220);
    Rl.tambah(gl, function (px, py, pz) { return campur(lumpur, lumpurT, derauLapis(px * 0.5, pz * 0.5)); }, null, 0.08);
    var longsor = Rl.jadi(Bahan.tetap({ transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, fog: true }));
    longsor.visible = false; scene.add(longsor);
    var Rb = new B.Rakit(221);
    [[1.3, -10, 2.3], [3.6, -7, 1.7], [4.6, -4.9, 2.1], [0.2, -12.6, 2.6], [5.6, -3.6, 1.4]].forEach(function (p, idx) { C.batu(Rb, p[0], tinggi(p[0], p[1]), p[1], p[2], 801 + idx); });
    C.kayuRebah(Rb, -2.4, tinggi(-2.4, -3.2), -3.2, 1, 0.5);
    C.kayuRebah(Rb, 1.2, tinggi(1.2, -1.6), -1.6, 0.9, -0.7);
    C.kayuRebah(Rb, -6, tinggi(-6, -1), -1, 0.9, 1.1);
    var batuLongsor = Rb.jadi(Bahan.tetap()); batuLongsor.visible = false; scene.add(batuLongsor);

    /* kupu-kupu dan rangkong saat pulih */
    var Rk = new B.Rakit(230);
    [[-2.6, 1.7, -1.6], [3.8, 1.5, 3.4], [-5, 1.9, 0.6], [0.4, 2.1, 5]].forEach(function (k, idx) { C.kupu(Rk, k[0], tinggi(k[0], k[2]) + k[1], k[2], idx % 2 ? W(PAL.kertas) : W(PAL.kunyit)); });
    var kupu = Rk.jadi(Bahan.tetap()); kupu.visible = false; scene.add(kupu);
    var pasangan = [new Rako(1.25), new Rako(1.25)];
    pasangan.forEach(function (r) { r.grup.visible = false; r.mode = 'tunjuk'; scene.add(r.grup); });

    var zona = {
      scene: scene, tinggi: tinggi, hutan: hutan, slotPohon: slotPohon, slotBibit: slotBibit, bibitAktif: [],
      kamera: { fov: 31, jauh: 90, dasar: [-0.6, 0.7, -0.2], offset: [0, 12.7, 15.8], batas: { x0: -6.5, x1: 2.2, z0: -1.9, z1: 0.9 }, ikutK: 0.42 },
      /* batas bawah dan kiri: tokoh tidak boleh berdiri di balik balon atau keluar layar (diuji test/smoke/tahan.js) */
      jalur: new Medan.Jalur({ x0: -14, x1: 8, z0: -6.1, z1: 4.9, sel: 0.5, boleh: function (px, pz) { return jarakSungai(px, pz) > 2.5; } })
    };
    POHON.concat(POHON_LATAR).forEach(function (p) { zona.jalur.rintangan(p[0], p[1], 0.55); });
    TUNGGUL_LAMA.forEach(function (p) { zona.jalur.rintangan(p[0], p[1], 0.5); });
    zona.jalur.rintangan(-8, 1.6, 1.3);
    zona.jalur.rintangan(-9, 2, 0.9);
    zona.jalur.rintangan(-7, 1.2, 0.9);
    halangan.forEach(function (p) { zona.jalur.rintangan(p[0], p[1], p[2]); });

    /* warna kabut mengikuti keadaan dunia */
    var KABUT = new THREE.Color(kabut), KABUT_SEGAR = new THREE.Color(0xCFEDE6), KABUT_KERING = new THREE.Color(0xD6C19B);
    function aturKabut(warna, k) { scene.fog.color.copy(KABUT).lerp(warna, k); scene.background.copy(scene.fog.color); }
    /* pratinjau masa depan yang baik: warna kembali di sekitar hutan saja. Seluruh dunia baru berwarna saat keberhasilan menetap. */
    var PUSAT_WARNA = { x: -1.2, z: -0.6, r: 13 };

    /* tanam satu bibit: bibit muncul, lingkaran warna kecil tumbuh di sekitarnya (jejak hijau) */
    zona.tanam = function (i) {
      var t = slotBibit[i], m = bibit[i];
      m.visible = true;
      Tween.run(320, function (e) { m.scale.setScalar(1.55 * Math.max(0.01, e)); }, Ease.easeOutBack);
      zona.bibitAktif.push(i);
      Warna.tumbuh(i, t.x, t.z, 0.2, 2.9, 900, Ease.easeOutCubic);
    };
    /* animasi menebang satu slot */
    zona.tebang = function (t, dariX, dariZ) {
      Aud.sfx('tumbang');
      return hutan.tebang(t, dariX, dariZ).then(function () {
        Arena.partikel.semprot({ x: t.x, y: t.y + 0.3, z: t.z, n: 12, warna: [PAL.pucuk, PAL.zamrud, PAL.bata], laju: 2.2, naik: 2.4, ukuran: 0.09 });
      });
    };
    /* semua pohon dekat tumbang berurutan (percobaan pertama) */
    zona.tebangSemua = function (dariX, dariZ) {
      var sisa = slotPohon.filter(function (t) { return !t.ditebang; });
      return Promise.all(sisa.map(function (t, i) {
        return Tween.wait(i * 170).then(function () { return zona.tebang(t, dariX, dariZ); });
      }));
    };

    /* ===== Lompat Waktu ===== */
    var bunyiLongsor = false;
    zona.mulaiLompat = function () {
      bunyiLongsor = false; Hutan.lajuWaktu = 2.4; Aud.ambien('sunyi');
      Arena.hero.pergi(-2.2, 4.1);   // ke tempat lapang agar pohon yang tumbuh tidak menutupi tokoh
      /* tanah kosong yang tidak ditanami ikut tertutup pohon bila hutan benar-benar bertambah lebat */
      slotBibit.forEach(function (t, i) { if (zona.bibitAktif.indexOf(i) < 0) t.ambang = 78 + i * 2.2; });
    };
    /* st: keadaan simulasi, raw: 0-1, o: pilihan Lompat */
    zona.terapkan = function (st, raw, o) {
      hutan.terapkan(st.hutan);
      var h = st.hutan;
      UW.uKeruh.value = Math.max(jepit((52 - st.air) / 24, 0, 1), jepit((24 - h) / 20, 0, 1)) * 0.92;
      UW.uKering.value = o.baik ? 0 : jepit((48 - h) / 32, 0, 1);
      var l = o.baik ? 0 : jepit((27 - h) / 13, 0, 1);
      longsor.visible = batuLongsor.visible = l > 0.01;
      longsor.material.opacity = l * 0.96;
      batuLongsor.scale.y = Math.max(0.01, l);
      batuLongsor.position.y = (1 - l) * -0.4;
      if (l > 0.35 && !bunyiLongsor) { bunyiLongsor = true; Aud.sfx('longsor'); Arena.partikel.semprot({ x: 3, y: tinggi(3, -7) + 0.5, z: -7, n: 20, warna: [0x6B4526, 0x8A5F38], laju: 2.6, naik: 2.2, ukuran: 0.13, umur: 1.2 }); }
      /* bibit tumbuh menjadi pohon muda */
      zona.bibitAktif.forEach(function (i) {
        var t = slotBibit[i], k = jepit(raw * 1.15, 0, 1);
        t.tuju = t.kadar = k > 0.08 ? 0.1 + 0.62 * k : 0;
        t.ambang = 0;
        hutan._gambar(t);
        bibit[i].visible = k <= 0.08;
      });
      hutan._tandai();
      /* warna kembali bila masa depannya baik */
      if (o.baik) {
        Warna.atur(7, PUSAT_WARNA.x, PUSAT_WARNA.z, 0.3 + raw * raw * PUSAT_WARNA.r); aturKabut(KABUT_SEGAR, raw);
        if (raw > 0.3) { Aud.musik('hutan'); Aud.ambien('hutan'); }   // dunia pulih, musik ikut mekar
      }
      else aturKabut(KABUT_KERING, UW.uKering.value);
      var jadi = o.pohon >= o.butuh && raw > 0.22;
      rangka.visible = !jadi; perahu.visible = jadi;
      kupu.visible = o.baik && raw > 0.6;
      bayang.forEach(function (b, i) { b.visible = slotPohon[i].kadar > 0.5; });
      if (raw > 0.3 && raw < 0.95 && !UI.kurangi && Math.random() < 0.05) {
        Arena.partikel.semprot({ x: -8 + Math.random() * 14, y: 4, z: -6 + Math.random() * 6, n: 1, warna: o.baik ? [PAL.pucuk, PAL.zamrud] : [PAL.bata, 0xA58A62], laju: 0.6, naik: -0.4, g: 1.2, ukuran: 0.07, umur: 2 });
      }
      /* cahaya berganti pelan: aman untuk anak yang peka kedipan (kurang dari 3 kali per detik) */
      var sudut = raw * Math.PI * 5;
      cahaya.matahari.position.set(-9 * Math.cos(sudut), 16, 8 * Math.sin(sudut) + 4);
      cahaya.matahari.intensity = 2.55 - (o.baik ? 0 : jepit((48 - h) / 48, 0, 1) * 0.35) - Math.abs(Math.sin(sudut)) * 0.35;
    };
    zona.akhirLompat = function (o) {
      var h = Arena.hero, gani = zona.gani, baik = o.baik;
      h.berhenti();   // Lewati bisa ditekan saat tokoh masih berjalan ke tempat lapang
      h.ekspresi(baik ? 'sorak' : 'sedih'); h.anim = baik ? 'sorak' : 'sedih';
      if (gani) { gani.ekspresi(baik ? 'sorak' : 'sedih'); gani.anim = baik ? 'sorak' : 'sedih'; gani.hadap(h.x, h.z); }
      cahaya.matahari.position.set(-9, 16, 8);
      cahaya.matahari.intensity = baik ? 2.55 : 2.25;
      Hutan.lajuWaktu = 1;
    };
    zona.mulaiMundur = function () { Hutan.lajuWaktu = 6; };
    /* kembali ke hari ini: semua persis seperti awal percobaan */
    zona.keHariIni = function () {
      hutan.pulihkan(70);
      zona.bibitAktif.forEach(function (i) { var t = slotBibit[i]; t.ambang = t.ambangAsli = 999; t.kadar = t.tuju = 0; hutan._gambar(t); bibit[i].visible = false; });
      hutan._tandai();
      zona.bibitAktif = [];
      Warna.kosongkan();
      aturKabut(KABUT_SEGAR, 0);
      longsor.visible = batuLongsor.visible = false;
      rangka.visible = true; perahu.visible = false; kupu.visible = false;
      bayang.forEach(function (b) { b.visible = true; });
      Hutan.lajuWaktu = 1;
      Aud.musik('sunyi'); Aud.ambien('sunyi');
      if (zona.gani) { zona.gani.anim = 'diam'; zona.gani.ekspresi('senang'); }
    };
    /* keberhasilan yang menetap: gelombang warna melanjutkan pratinjau sampai menyapu seluruh hutan, rangkong datang */
    zona.sukses = function () {
      Aud.sfx('gelombang');
      var a = Warna.tumbuh(0, PUSAT_WARNA.x, PUSAT_WARNA.z, PUSAT_WARNA.r, 72, UI.kurangi ? 300 : 2600, Ease.easeInOutCubic);
      pasangan.forEach(function (r, i) {
        r.grup.visible = true;
        r.taruh(i ? 16 : -16, 12, -12);
        r.tunjuk(i ? 2.6 : -1.4, tinggi(i ? 2.6 : -1.4, -6.9) + 4.3, i ? -6.9 : -6.9);
      });
      kupu.visible = true;
      return a;
    };
    zona.update = function (dt) {
      hutan.update(dt);
      if (perahu.visible) { perahu.position.y = -0.24 + Math.sin(UW.uWaktu.value * 1.3) * 0.04; perahu.rotation.z = Math.sin(UW.uWaktu.value * 0.9) * 0.02; }
      if (kupu.visible && !UI.kurangi) kupu.position.y = Math.sin(UW.uWaktu.value * 3) * 0.08;
      pasangan.forEach(function (r) { if (r.grup.visible) r.update(dt); });
    };
    return zona;
  }
  root.ZonaHutan = { buat: buat, tinggi: tinggi, POHON: POHON, SPOT: SPOT };
})(window);
