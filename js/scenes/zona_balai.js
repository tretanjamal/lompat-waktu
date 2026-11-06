/* Zona Balai Desa (Bab 5): alun-alun di bawah beringin, tempat semua warga berkumpul. Lompat Waktu di bab ini berpindah ke diorama seluruh pulau. */
(function (root) {
  var B = Bentuk, W = Warna.W, campur = Warna.campur, gelap = Warna.gelap, PAL = Warna.PAL, C = Cadangan, UW = Warna.U;
  var jepit = B.jepit, halus = B.halus, derauLapis = B.derauLapis, M = B.M, acak = B.acak;

  var PAPAN = { x: 1.2, z: -2.4 };
  var BERINGIN = { x: -2.6, z: -5.8 };
  var BALAI = { x: 6, z: -5.4 };
  var WARGA = { gani: [-6.4, -0.6, 0.8], sri: [-7.8, 2, 1.2], bahar: [5.4, -0.2, -0.8], mira: [7.2, 2.2, -1.2] };
  var PUSAT_WARNA = { x: 0, z: -1.5, r: 14 };

  function tinggi(x, z) {
    var h = (derauLapis(x * 0.12 + 17, z * 0.12 + 8) - 0.5) * 0.3;
    h += halus(-7, -20, z) * (2.4 + derauLapis(x * 0.09, z * 0.09) * 4);
    h += halus(-12, -26, x) * 2 + halus(12, 26, x) * 2;
    return h;
  }

  function buat() {
    var scene = new THREE.Scene(), kabut = 0xDFD9C2, i, x, z;
    scene.background = new THREE.Color(kabut);
    scene.fog = new THREE.Fog(kabut, 23, 50);
    var cahaya = Dunia.pasangCahaya(scene, 1.5, 2.55);
    var bahan = Bahan.pulih();

    var rumputW = campur(W(PAL.pucuk), W(PAL.zamrud), 0.3), rumputT = W(PAL.pucuk), tanah = campur(W(PAL.kertas), W(PAL.bata), 0.34);
    scene.add(Medan.buat({
      lebar: 72, dalam: 56, nx: 48, nz: 38, cz: -6, tinggi: tinggi,
      warna: function (px, py, pz) {
        var n1 = derauLapis(px * 0.3, pz * 0.3), alun = Math.sqrt(px * px / 2 + (pz - 1) * (pz - 1));
        if (alun < 4.2 + n1) return campur(tanah, campur(tanah, rumputT, 0.5), n1 * 0.6);
        return campur(rumputW, rumputT, jepit(n1 * 1.15 - 0.05 + py * 0.03, 0, 1));
      }
    }, 201, bahan));

    var R = new B.Rakit(301), rng = acak(61);
    /* beringin besar: tempat rapat */
    if (!C.hiasan(R, 'tree_beringin', BERINGIN.x, tinggi(BERINGIN.x, BERINGIN.z) - 0.1, BERINGIN.z, 1, 0)) C.pohon(R, BERINGIN.x, tinggi(BERINGIN.x, BERINGIN.z) - 0.1, BERINGIN.z, 2.3, 621);
    C.balai(R, BALAI.x, tinggi(BALAI.x, BALAI.z), BALAI.z, 1);
    C.papanRencana(R, PAPAN.x, tinggi(PAPAN.x, PAPAN.z), PAPAN.z, 0);
    /* umbul-umbul di sekitar alun-alun */
    [[-9.6, -2.6], [-4.6, -3.2], [3.6, -3.4], [10, -2.2], [-10.2, 3.6], [10.6, 3.6]].forEach(function (p, idx) {
      var y0 = tinggi(p[0], p[1]);
      R.tambah(B.Tabung(0.035, 0.05, 2.9, 5), gelap(W(PAL.bata), 0.7), M(p[0], y0 + 1.45, p[1]));
      R.tambah(B.Kotak(0.5, 0.82, 0.03), idx % 2 ? W(PAL.kunyit) : W(PAL.toska), M(p[0] + 0.27, y0 + 2.45, p[1]), 0.05);
    });
    /* bangku rapat */
    [[-3.4, 1.6, 0.5], [3.4, 1.8, -0.5]].forEach(function (p) {
      var y0 = tinggi(p[0], p[1]), kayu = campur(W(PAL.bata), W(PAL.kertas), 0.2);
      R.tambah(B.Kotak(2.1, 0.12, 0.52), kayu, M(p[0], y0 + 0.42, p[1], 0, p[2]), 0.06);
      [-0.8, 0.8].forEach(function (d) { R.tambah(B.Kotak(0.13, 0.42, 0.42), gelap(W(PAL.bata), 0.7), M(p[0] + Math.cos(p[2]) * d, y0 + 0.2, p[1] - Math.sin(p[2]) * d, 0, p[2])); });
    });
    C.pasang(R, 'bld_rumah', -10.8, tinggi(-10.8, -5.2), -5.2, 1, 0.4, function () { C.rumah(R, -10.8, tinggi(-10.8, -5.2), -5.2, 1, 0.4); });
    C.rumah(R, 12, tinggi(12, -1.8), -1.8, 0.95, -0.6, W(PAL.bata));
    C.kelapa(R, -12.2, tinggi(-12.2, 1.6), 1.6, 0.95, 2000);
    C.kelapa(R, 12.8, tinggi(12.8, 3.8), 3.8, 0.9, 2001);
    for (i = 0; i < 24; i++) {
      x = -30 + rng() * 60; z = -30 + rng() * 19;
      if (Math.abs(x) < 12 && z > -14) continue;
      C.pohon(R, x, tinggi(x, z) - 0.08, z, 1 + rng() * 0.5, 1200 + i, true);
    }
    scene.add(R.jadi(bahan));

    var Hi = new B.Rakit(302);
    for (i = 0; i < 50; i++) { x = -14 + rng() * 28; z = -5 + rng() * 10; if (Math.sqrt(x * x / 2 + (z - 1) * (z - 1)) < 5) continue; C.rumput(Hi, x, tinggi(x, z), z, rng); }
    for (i = 0; i < 24; i++) { x = -14 + rng() * 28; z = -5 + rng() * 10; if (Math.sqrt(x * x / 2 + (z - 1) * (z - 1)) < 5) continue; C.bunga(Hi, x, tinggi(x, z), z, rng() < 0.5 ? W(PAL.kunyit) : W(PAL.kertas)); }
    var hiasan = Hi.jadi(bahan); scene.add(hiasan);
    Dunia.hiasan = hiasan;

    /* kunang-kunang di sekitar beringin saat berhasil */
    var Rk = new B.Rakit(303);
    for (i = 0; i < 26; i++) C.kunang(Rk, BERINGIN.x - 4 + rng() * 9, 1.1 + rng() * 3.8, BERINGIN.z - 1.2 + rng() * 4.6, 1.5, true);
    var kunang = Rk.jadi(new THREE.MeshBasicMaterial({ vertexColors: true })); kunang.visible = false; scene.add(kunang);

    var zona = {
      scene: scene, tinggi: tinggi, hiasan: hiasan, PAPAN: PAPAN, WARGA: WARGA,
      kamera: { fov: 31, jauh: 90, dasar: [0, 0.7, -0.3], offset: [0, 12.7, 15.8], batas: { x0: -3.4, x1: 3.4, z0: -1.4, z1: 0.9 }, ikutK: 0.42 },
      /* batas: tokoh tidak boleh berdiri di balik balon atau keluar layar (diuji test/smoke/tahan.js) */
      jalur: new Medan.Jalur({ x0: -11, x1: 11, z0: -2.8, z1: 4.6, sel: 0.5, boleh: function (px, pz) { return !(px > 8.2 && pz > 2.2); } })   // sudut kanan bawah tertutup Jam Pasir
    };
    zona.jalur.rintangan(PAPAN.x, PAPAN.z, 1.15);
    Object.keys(WARGA).forEach(function (k) { zona.jalur.rintangan(WARGA[k][0], WARGA[k][1], 0.5); });
    zona.jalur.rintangan(-3.4, 1.6, 1.1); zona.jalur.rintangan(3.4, 1.8, 1.1);

    var KABUT = new THREE.Color(kabut), KABUT_SEGAR = new THREE.Color(0xCFEDE6);
    function aturKabut(warna, k) { scene.fog.color.copy(KABUT).lerp(warna, k); scene.background.copy(scene.fog.color); }

    function keBalai() {
      Warna.kosongkan();
      Warna.U.uLunak.value = 2.4;
      Dunia.hiasan = hiasan;
      Dunia.pakai(scene);
      Kamera.atur(zona.kamera);
      Kamera.ikut(Arena.hero.x, Arena.hero.z); Kamera.lompatKe();
      diPulau = false;
      Hutan.lajuWaktu = 1;
    }
    /* ===== Lompat Waktu: seluruh pulau dari atas ===== */
    var diPulau = false;
    zona.mulaiLompat = function () {
      diPulau = true;
      Pulau.siapkan();
      Pulau.kameraPeta();
      Hutan.lajuWaktu = 2.4;
      Aud.ambien('pantai');
    };
    zona.terapkan = function (st, raw, o) {
      Pulau.terapkanRencana(st, raw, o);
      if (o.baik && raw > 0.3) Aud.musik('rapat');
    };
    zona.akhirLompat = function (o) {
      var h = Arena.hero;
      h.berhenti();
      h.ekspresi(o.baik ? 'sorak' : 'sedih'); h.anim = o.baik ? 'sorak' : 'sedih';
    };
    zona.mulaiMundur = function () { Hutan.lajuWaktu = 6; };
    zona.keHariIni = function () {
      keBalai();
      aturKabut(KABUT_SEGAR, 0);
      Aud.musik('sunyi'); Aud.ambien('hutan');
      Object.keys(zona.tokohWarga || {}).forEach(function (k) { zona.tokohWarga[k].anim = 'diam'; zona.tokohWarga[k].ekspresi('senang'); });
    };
    /* semua tempat tujuan, untuk uji jangkauan */
    zona.tujuan = function () { return [['papan', PAPAN.x, PAPAN.z + 0.3, 1.7]]; };
    zona.sukses = function () {
      keBalai();
      aturKabut(KABUT_SEGAR, 1);
      Aud.sfx('gelombang');
      kunang.visible = true;
      Object.keys(zona.tokohWarga || {}).forEach(function (k) { zona.tokohWarga[k].anim = 'sorak'; zona.tokohWarga[k].ekspresi('sorak'); });
      Warna.atur(1, PUSAT_WARNA.x, PUSAT_WARNA.z, 1);
      return Warna.tumbuh(0, PUSAT_WARNA.x, PUSAT_WARNA.z, 1, PUSAT_WARNA.r * 5, UI.kurangi ? 300 : 2600, Ease.easeInOutCubic);
    };
    zona.update = function (dt) {
      if (diPulau) Pulau.gerak(dt, 'peta');
      if (kunang.visible && !UI.kurangi) { var w = UW.uWaktu.value; kunang.position.y = Math.sin(w * 1.1) * 0.22; kunang.position.x = Math.sin(w * 0.6) * 0.26; }
    };
    return zona;
  }
  root.ZonaBalai = { buat: buat, tinggi: tinggi };
})(window);
