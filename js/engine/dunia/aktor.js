/* Aktor: tokoh rakitan bagian kaku yang dianimasikan kode (berjalan, menebang, menanam, bersorak, berpikir, sedih, melambai),
   wajah dari mesh terpisah (berkedip, berganti ekspresi), dan Rako si rangkong pemandu. */
(function (root) {
  var B = Bentuk, W = Warna.W, gelap = Warna.gelap, PAL = Warna.PAL, Rakit = B.Rakit, M = B.M, gumpal = B.gumpal, Kotak = B.Kotak, Tabung = B.Tabung, Bola = B.Bola, Kerucut = B.Kerucut;
  var KULIT = 0xB97C50, KULIT2 = 0xA56D45, KULIT3 = 0xC68A5C;

  /* Desain tokoh. Warna mengikuti docs/ASET-3D.md. */
  var DESAIN = {
    laras: { s: 1.7, kulit: KULIT, celana: PAL.bata, sepatu: PAL.tinta, baju: PAL.kertas, rompi: PAL.kunyit, tas: PAL.zamrud, kepala: 'jilbab', jilbab: PAL.toska },
    bayu: { s: 1.7, kulit: KULIT2, celana: PAL.bata, sepatu: PAL.tinta, baju: PAL.kertas, rompi: PAL.zamrud, tas: PAL.kunyit, kepala: 'topi', topi: PAL.zamrud, rambut: 0x1E1D1B, pendek: true },
    dewi: { s: 1.7, kulit: KULIT, celana: 0x1F5A48, sepatu: PAL.tinta, baju: PAL.kertas, rompi: PAL.bata, tas: PAL.toska, kepala: 'topi', topi: 0xE6CE9A, rambut: 0x1E1D1B, bob: true, kacamata: true },
    ratna: { s: 1.85, kulit: KULIT3, celana: 0x0F6170, sepatu: 0x5A4632, baju: PAL.kunyit, kepala: 'jilbab', jilbab: PAL.zamrud, dewasa: true },
    gani: { s: 1.9, kulit: KULIT2, celana: 0x35594E, sepatu: 0x5A4632, baju: PAL.kertas, celemek: PAL.bata, kepala: 'rambut', rambut: 0x3B3A36, kumis: true, dewasa: true },
    sri: { s: 1.85, kulit: KULIT3, celana: 0x1F4A3D, sepatu: 0x1F4A3D, baju: PAL.kunyit, kepala: 'jilbab', jilbab: PAL.zamrud, caping: 0xE6CE9A, dewasa: true },
    bahar: { s: 1.9, kulit: KULIT2, celana: 0x35594E, sepatu: 0x5A4632, baju: PAL.toska, kepala: 'topi', topi: PAL.kertas, rambut: 0x1E1D1B, dewasa: true },
    mira: { s: 1.8, kulit: KULIT, celana: 0x35594E, sepatu: PAL.tinta, baju: PAL.kertas, rompi: PAL.bata, kepala: 'helm', rambut: 0x1E1D1B, helm: PAL.kunyit, dewasa: true }
  };

  function mesh(R, tetap) { var m = R.jadi(tetap || Tokoh.bahan()); return m; }

  function Tokoh(kunci, zona) {
    var d = DESAIN[kunci];
    this.kunci = kunci; this.d = d; this.zona = zona; this.s = d.s;
    this.grup = new THREE.Group();
    this.x = 0; this.z = 0; this.arah = 0; this.arahTuju = 0;
    this.rute = null; this.laju = 4.4; this.anim = 'diam'; this.t = Math.random() * 5; this.fase = 0; this.dasarY = 0; this.miring = -0.42;
    this.sendi = { kKi: 0, kKa: 0, lKiX: 0, lKaX: 0, lKiZ: 0.32, lKaZ: 0.32, kepX: 0, kepZ: 0, atasX: 0, naik: 0 };
    /* kulit tokoh di Three r160 butuh WebGL2. Di WebGL1 tokoh rakitan kode yang dipakai. */
    if (Aset3D.ada('chr_' + kunci) && Dunia.r && Dunia.r.capabilities.isWebGL2) this._bangunAI('chr_' + kunci);
    else this._bangunKode(d);
    this.ekspresi('senang');
    this.kedip = 2 + Math.random() * 3;
    this._terapkan();
  }

  /* tokoh dari Meshy: satu mesh berkulit. Tulangnya memakai nama yang sama dengan tokoh kode, jadi semua gerak di bawah tetap berlaku. */
  Tokoh.prototype._bangunAI = function (kunci) {
    var T = Aset3D.info(kunci).t, geo = Aset3D.ambil(kunci), h = T.pinggul;
    var atas = new THREE.Bone(), kep = new THREE.Bone(), lKi = new THREE.Bone(), lKa = new THREE.Bone(), kKi = new THREE.Bone(), kKa = new THREE.Bone();
    atas.position.set(0, h, 0);
    kep.position.set(0, T.leher.y - h, T.leher.z);
    lKi.position.set(-T.bahu[0].x, T.bahu[0].y - h, T.bahu[0].z); lKa.position.set(T.bahu[1].x, T.bahu[1].y - h, T.bahu[1].z);
    kKi.position.set(-T.kakiX, h, 0); kKa.position.set(T.kakiX, h, 0);
    /* lengan model menjauh dari badan (A-pose), jadi itulah sudut nolnya */
    lKi.rotation.z = -T.bahu[0].a; lKa.rotation.z = T.bahu[1].a;
    atas.add(kep); atas.add(lKi); atas.add(lKa);
    this.grup.add(atas); this.grup.add(kKi); this.grup.add(kKa);
    var m = new THREE.SkinnedMesh(geo, Tokoh.bahan());
    m.frustumCulled = false;
    this.grup.add(m);
    this.grup.updateMatrixWorld(true);
    m.bind(new THREE.Skeleton([atas, kep, lKi, lKa, kKi, kKa]));
    this.atas = atas; this.kepala = kep; this.lengan = [lKi, lKa]; this.kaki = [kKi, kKa];
    this.miring = -0.2;   // kepala besar: cukup sedikit menengadah ke kamera
    /* wajah kode ditempel pada wajah polos model */
    var wr = T.wajah.rx / 0.205, fy = T.wajah.y - T.leher.y, zm = T.wajah.zm - T.leher.z;
    this._wajah(wr, fy, zm, T.wajah.zt - T.leher.z + 0.02 * wr, 0.68);
    var pipi = new Rakit(89), warna = new THREE.Color(0xE8836B);
    [-1, 1].forEach(function (sx) { pipi.tambah(Bola(0.036 * wr, 6, 4), warna, M(sx * 0.142 * wr, fy - 0.04 * wr, zm - 0.012 * wr, 0, 0, 0, 1.2, 0.8, 0.35), 0); });
    this.kepala.add(mesh(pipi));
    this._alat(T.bahu[1].p);
  };

  /* mata, mulut, dan alis. s: skala wajah, fy: tinggi wajah dari leher, zm: permukaan di letak mata, zMulut: permukaan di tengah wajah */
  Tokoh.prototype._wajah = function (s, fy, zm, zMulut, besarMata) {
    var diri = this, hitam = new THREE.Color(0x14201C), putih = new THREE.Color(0xFFFFFF), i, sisi, bm = besarMata || 1;
    var RM = new Rakit(90);
    for (i = 0; i < 2; i++) {
      sisi = i ? 1 : -1;
      RM.tambah(Bola(0.05 * s * bm, 10, 8), hitam, M(sisi * 0.092 * s, 0, 0, 0, 0, 0, 1, 1.22, 0.48), 0);
      RM.tambah(Bola(0.017 * s * bm, 6, 4), putih, M(sisi * 0.092 * s + 0.016 * s * bm, 0.023 * s * bm, 0.021 * s * bm), 0);
    }
    this.mata = mesh(RM); this.mata.position.set(0, fy + 0.022 * s, zm); this.kepala.add(this.mata);
    function mulut(geo, m) { var R = new Rakit(92); R.tambah(geo, hitam, m, 0); var me = mesh(R); me.visible = false; diri.kepala.add(me); return me; }
    this.mulut = {
      senang: mulut(new THREE.TorusGeometry(0.045 * s, 0.012 * s, 4, 10, Math.PI), M(0, fy - 0.042 * s, zMulut - 0.004 * s, 0, 0, Math.PI)),
      sedih: mulut(new THREE.TorusGeometry(0.045 * s, 0.012 * s, 4, 10, Math.PI), M(0, fy - 0.092 * s, zMulut - 0.006 * s)),
      sorak: mulut(Bola(0.05 * s, 8, 6), M(0, fy - 0.066 * s, zMulut - 0.012 * s, 0, 0, 0, 1.05, 0.92, 0.4)),
      pikir: mulut(Bola(0.024 * s, 8, 6), M(0.02 * s, fy - 0.07 * s, zMulut - 0.006 * s, 0, 0, 0, 1.3, 1, 0.5))
    };
    var RA = new Rakit(93);
    [-1, 1].forEach(function (sx) { RA.tambah(Kotak(0.095 * s, 0.018 * s, 0.012 * s), hitam, M(sx * 0.092 * s, fy + 0.098 * s, zm + 0.004 * s, 0, 0, -sx * 0.45), 0); });
    this.alis = mesh(RA); this.alis.visible = false; this.kepala.add(this.alis);
  };

  /* kapak di tangan kanan, tampil saat menebang. panjang: jarak bahu ke tangan */
  Tokoh.prototype._alat = function (panjang) {
    var s = this.s, RT = new Rakit(94), kayu = gelap(W(PAL.bata), 0.7), besi = new THREE.Color(0xC9CDBF);
    RT.tambah(Tabung(0.022 * s, 0.026 * s, 0.34 * s, 5), kayu, M(0, -0.04 * s, 0.1 * s, Math.PI / 2, 0, 0));
    RT.tambah(Kotak(0.03 * s, 0.13 * s, 0.09 * s), besi, M(0, -0.04 * s, 0.26 * s), 0.02);
    this.alat = mesh(RT); this.alat.position.set(0, -panjang, 0); this.alat.visible = false;
    this.lengan[1].add(this.alat);
  };

  /* tokoh rakitan dari kode: cadangan bila model AI tidak ada */
  Tokoh.prototype._bangunKode = function (d) {
    var s = d.s, hip = (d.dewasa ? 0.46 : 0.38) * s, panjangKaki = hip - 0.12 * s;
    var warnaKulit = new THREE.Color(d.kulit), warnaCelana = new THREE.Color(d.celana), warnaSepatu = new THREE.Color(d.sepatu), warnaBaju = new THREE.Color(d.baju);

    /* kaki: poros di pinggul */
    this.kaki = [-1, 1].map(function (sisi, i) {
      var R = new Rakit(50 + i), pendek = d.pendek ? 0.55 : 1;
      R.tambah(Tabung(0.075 * s, 0.085 * s, panjangKaki, 7), d.pendek ? warnaCelana : warnaCelana, M(0, -panjangKaki / 2, 0), 0.03);
      if (d.pendek) R.tambah(Tabung(0.062 * s, 0.068 * s, panjangKaki * 0.5, 7), warnaKulit, M(0, -panjangKaki * 0.8, 0), 0.02);
      R.tambah(gumpal(0.1 * s, 5 + i, 1, 0.05), warnaSepatu, M(0, -hip + 0.08 * s, 0.03 * s, 0, 0, 0, 1, 0.8, 1.35));
      var m = mesh(R); m.position.set(sisi * 0.1 * s, hip, 0);
      return m;
    });
    this.grup.add(this.kaki[0]); this.grup.add(this.kaki[1]);

    /* tubuh atas: poros di pinggul, membawa kepala dan lengan */
    this.atas = new THREE.Group(); this.atas.position.y = hip; this.grup.add(this.atas);
    var RB = new Rakit(60), y0 = 0.15 * s;
    RB.tambah(Tabung(0.17 * s, 0.2 * s, 0.34 * s, 8), warnaBaju, M(0, y0, 0));
    if (d.rompi) {
      var rompi = new THREE.Color(d.rompi);
      RB.tambah(Tabung(0.182 * s, 0.212 * s, 0.32 * s, 8), rompi, M(0, y0, -0.012 * s));
      RB.tambah(Kotak(0.1 * s, 0.32 * s, 0.03 * s), warnaBaju, M(0, y0, 0.2 * s), 0);
      RB.tambah(Kotak(0.09 * s, 0.09 * s, 0.03 * s), gelap(rompi, 0.8), M(-0.115 * s, y0 - 0.07 * s, 0.175 * s, 0, -0.5, 0), 0);
      RB.tambah(Kotak(0.09 * s, 0.09 * s, 0.03 * s), gelap(rompi, 0.8), M(0.115 * s, y0 - 0.07 * s, 0.175 * s, 0, 0.5, 0), 0);
    }
    if (d.celemek) {
      var cel = new THREE.Color(d.celemek);
      RB.tambah(Tabung(0.19 * s, 0.218 * s, 0.25 * s, 8), cel, M(0, y0 - 0.06 * s, 0.006 * s), 0.02);
      RB.tambah(Kotak(0.22 * s, 0.1 * s, 0.03 * s), cel, M(0, y0 + 0.1 * s, 0.17 * s), 0.02);
    }
    if (d.tas) RB.tambah(gumpal(0.17 * s, 41, 1, 0.05), new THREE.Color(d.tas), M(0, y0 + 0.05 * s, -0.2 * s, 0, 0, 0, 0.95, 1.1, 0.72));
    if (d.kepala === 'jilbab') RB.tambah(Tabung(0.13 * s, 0.205 * s, 0.13 * s, 8), new THREE.Color(d.jilbab), M(0, 0.37 * s, 0));
    else RB.tambah(Tabung(0.09 * s, 0.1 * s, 0.08 * s, 7), warnaKulit, M(0, 0.36 * s, 0));
    this.atas.add(mesh(RB));

    /* lengan: poros di bahu */
    var diri = this;
    this.lengan = [-1, 1].map(function (sisi, i) {
      var R = new Rakit(70 + i);
      R.tambah(Tabung(0.052 * s, 0.062 * s, 0.26 * s, 6), warnaBaju, M(0, -0.13 * s, 0), 0.03);
      R.tambah(gumpal(0.068 * s, 8 + i, 0, 0.04), warnaKulit, M(0, -0.28 * s, 0));
      var m = mesh(R); m.position.set(sisi * 0.205 * s, 0.28 * s, 0);
      diri.atas.add(m);
      return m;
    });

    /* kepala: poros di leher */
    this.kepala = new THREE.Group(); this.kepala.position.y = 0.38 * s; this.atas.add(this.kepala);
    var RK = new Rakit(80), hy = 0.2 * s, zm;
    if (d.kepala === 'jilbab') {
      RK.tambah(Bola(0.27 * s, 12, 8), new THREE.Color(d.jilbab), M(0, hy, 0), 0.03);
      RK.tambah(Bola(0.205 * s, 12, 8), warnaKulit, M(0, hy - 0.01 * s, 0.11 * s, 0, 0, 0, 1, 0.98, 0.82), 0);
      zm = 0.27 * s;
      if (d.caping) {
        /* caping lebar: kerucut anyaman di atas jilbab */
        var cp = new THREE.Color(d.caping);
        RK.tambah(Kerucut(0.46 * s, 0.26 * s, 12), cp, M(0, hy + 0.33 * s, -0.01 * s, -0.14, 0, 0), 0.05);
        RK.tambah(Tabung(0.1 * s, 0.11 * s, 0.02 * s, 8), gelap(cp, 0.8), M(0, hy + 0.455 * s, -0.026 * s, -0.14, 0, 0), 0.02);
      }
    } else {
      RK.tambah(Bola(0.215 * s, 12, 8), warnaKulit, M(0, hy, 0.01 * s), 0);
      zm = 0.205 * s;
      if (d.kepala === 'topi') {
        RK.tambah(new THREE.SphereGeometry(0.228 * s, 12, 6, 0, Math.PI * 2, 0, Math.PI * 0.5), new THREE.Color(d.rambut), M(0, hy + 0.012 * s, -0.012 * s, -0.2, 0, 0), 0.03);
        var topi = new THREE.Color(d.topi);
        RK.tambah(Tabung(0.16 * s, 0.2 * s, 0.15 * s, 10), topi, M(0, hy + 0.2 * s, -0.01 * s, -0.12, 0, 0), 0.03);
        RK.tambah(Tabung(0.3 * s, 0.31 * s, 0.03 * s, 12), gelap(topi, 0.85), M(0, hy + 0.13 * s, 0, -0.12, 0, 0), 0.03);
        /* rambut bob: di sisi dan belakang kepala, wajah tetap terbuka */
        if (d.bob) RK.tambah(Bola(0.2 * s, 10, 6), new THREE.Color(d.rambut), M(0, hy - 0.04 * s, -0.05 * s, 0, 0, 0, 1.16, 1, 0.95), 0.03);
      } else if (d.kepala === 'helm') {
        /* helm kerja dengan pinggiran depan */
        var hm = new THREE.Color(d.helm);
        RK.tambah(new THREE.SphereGeometry(0.228 * s, 12, 6, 0, Math.PI * 2, 0, Math.PI * 0.5), new THREE.Color(d.rambut), M(0, hy + 0.012 * s, -0.012 * s, -0.2, 0, 0), 0.03);
        RK.tambah(new THREE.SphereGeometry(0.245 * s, 12, 6, 0, Math.PI * 2, 0, Math.PI * 0.5), hm, M(0, hy + 0.06 * s, -0.012 * s, -0.16, 0, 0), 0.03);
        RK.tambah(Tabung(0.27 * s, 0.28 * s, 0.024 * s, 12), gelap(hm, 0.85), M(0, hy + 0.055 * s, 0.014 * s, -0.16, 0, 0), 0.02);
        RK.tambah(Kotak(0.05 * s, 0.05 * s, 0.26 * s), gelap(hm, 0.9), M(0, hy + 0.3 * s, 0, -0.16, 0, 0), 0.02);
      } else {
        RK.tambah(new THREE.SphereGeometry(0.228 * s, 12, 6, 0, Math.PI * 2, 0, Math.PI * 0.5), new THREE.Color(d.rambut), M(0, hy + 0.024 * s, -0.016 * s, -0.25, 0, 0), 0.04);
      }
    }
    if (d.kumis) RK.tambah(Kotak(0.17 * s, 0.03 * s, 0.03 * s), new THREE.Color(d.rambut), M(0, hy - 0.058 * s, zm + 0.002 * s), 0);
    /* pipi ikut mesh kepala: satu draw call lebih hemat per tokoh */
    var fy = d.kepala === 'jilbab' ? hy - 0.012 * s : hy, pipi = new THREE.Color(0xE8836B);
    [-1, 1].forEach(function (sx) { RK.tambah(Bola(0.036 * s, 6, 4), pipi, M(sx * 0.142 * s, fy - 0.04 * s, zm - 0.03 * s, 0, 0, 0, 1.2, 0.8, 0.35), 0); });
    if (d.kacamata) {
      var bingkai = new THREE.Color(0x3A2A1E);
      [-1, 1].forEach(function (sx) { RK.tambah(new THREE.TorusGeometry(0.072 * s, 0.011 * s, 4, 12), bingkai, M(sx * 0.092 * s, fy + 0.022 * s, zm + 0.004 * s), 0); });
      RK.tambah(Kotak(0.04 * s, 0.012 * s, 0.012 * s), bingkai, M(0, fy + 0.028 * s, zm + 0.006 * s), 0);
    }
    this.kepala.add(mesh(RK));

    this._wajah(s, fy, zm, zm);
    this._alat(0.28 * s);
  };
  Tokoh.bahan = function () { return Tokoh._b || (Tokoh._b = Bahan.tetap({ flatShading: false })); };
  Tokoh.DESAIN = DESAIN;

  Tokoh.prototype.ekspresi = function (nama) {
    this.eks = nama;
    var mu = this.mulut;
    Object.keys(mu).forEach(function (k) { mu[k].visible = false; });
    (mu[nama] || mu.senang).visible = true;
    this.alis.visible = nama === 'sedih' || nama === 'pikir';
  };
  Tokoh.prototype.taruh = function (x, z, arah) {
    this.x = x; this.z = z; this.rute = null;
    /* perjalanan yang terpotong harus tetap selesai, kalau tidak yang menunggunya macet selamanya */
    var ok = this._selesaiRute; this._selesaiRute = null; if (ok) ok();
    if (arah !== undefined) { this.arah = this.arahTuju = arah; }
    this.grup.position.set(x, this._tinggi(x, z), z);
    this.grup.rotation.y = this.arah;
  };
  /* yTetap: tokoh berdiri di benda yang bukan tanah (perahu) */
  Tokoh.prototype._tinggi = function (x, z) { return this.yTetap !== undefined && this.yTetap !== null ? this.yTetap : (this.zona ? this.zona.tinggi(x, z) : 0); };
  Tokoh.prototype.hadap = function (x, z) { this.arahTuju = Math.atan2(x - this.x, z - this.z); };
  /* berjalan ke titik, berhenti sejauh jarak. Promise selesai saat tiba. */
  Tokoh.prototype.pergi = function (x, z, jarak) {
    var diri = this, jalur = this.zona && this.zona.jalur, tx = x, tz = z;
    jarak = jarak || 0;
    if (jarak) {
      var dx = this.x - x, dz = this.z - z, d = Math.sqrt(dx * dx + dz * dz) || 1;
      if (d <= jarak + 0.05) { this.hadap(x, z); return Promise.resolve(); }
      tx = x + dx / d * jarak; tz = z + dz / d * jarak;
    }
    var rute = jalur ? jalur.cari(this.x, this.z, tx, tz) : [{ x: tx, z: tz }];
    if (this._selesaiRute) this._selesaiRute();
    this.rute = rute.length ? rute : null;
    this.titikHadap = jarak ? { x: x, z: z } : null;
    if (!this.rute) { this.hadap(x, z); return Promise.resolve(); }
    this.anim = 'jalan';
    return new Promise(function (ok) { diri._selesaiRute = ok; });
  };
  Tokoh.prototype.berhenti = function () {
    this.rute = null; if (this.anim === 'jalan') this.anim = 'diam';
    var ok = this._selesaiRute; this._selesaiRute = null; if (ok) ok();
  };
  /* gerak langsung dari keyboard: dx, dz arah dunia (panjang 1) */
  Tokoh.prototype.gerakArah = function (dx, dz, dt) {
    var jalur = this.zona && this.zona.jalur, langkah = this.laju * dt, nx = this.x + dx * langkah, nz = this.z + dz * langkah;
    if (this.rute) this.berhenti();
    this.arahTuju = Math.atan2(dx, dz);
    this.anim = 'jalan';
    if (!jalur || jalur.bisa(nx, nz)) { this.x = nx; this.z = nz; }
    else if (jalur.bisa(nx, this.z)) { this.x = nx; }
    else if (jalur.bisa(this.x, nz)) { this.z = nz; }
  };
  /* mainkan gerakan selama dur ms, lalu kembali diam */
  Tokoh.prototype.main = function (anim, dur) {
    var diri = this;
    this.anim = anim; this.tAnim = 0;
    if (anim === 'tebang') this.alat.visible = true;
    return Tween.wait(dur).then(function () { if (diri.anim === anim) diri.anim = 'diam'; diri.alat.visible = false; });
  };

  Tokoh.prototype.update = function (dt) {
    this.t += dt;
    this.tAnim = (this.tAnim || 0) + dt;
    /* rute */
    if (this.rute) {
      var sisa = this.laju * dt;
      while (this.rute && sisa > 0) {
        var p = this.rute[0], dx = p.x - this.x, dz = p.z - this.z, d = Math.sqrt(dx * dx + dz * dz);
        if (d <= sisa) {
          this.x = p.x; this.z = p.z; sisa -= d; this.rute.shift();
          if (!this.rute.length) {
            this.rute = null; this.anim = 'diam';
            if (this.titikHadap) this.hadap(this.titikHadap.x, this.titikHadap.z);
            var ok = this._selesaiRute; this._selesaiRute = null; if (ok) ok();
          }
        } else {
          this.x += dx / d * sisa; this.z += dz / d * sisa; this.arahTuju = Math.atan2(dx, dz); sisa = 0;
        }
      }
    }
    /* kedip */
    this.kedip -= dt;
    var skalaMata = 1;
    if (this.kedip < 0) { skalaMata = 0.12; if (this.kedip < -0.12) this.kedip = 2 + Math.random() * 3.5; }
    this.mata.scale.y = skalaMata;
    /* sendi sasaran */
    var tg = { kKi: 0, kKa: 0, lKiX: 0, lKaX: 0, lKiZ: 0.32, lKaZ: 0.32, kepX: 0, kepZ: Math.sin(this.t * 0.7) * 0.03, atasX: 0, naik: 0 };
    var a = this.t, ta = this.tAnim, sin = Math.sin;
    switch (this.anim) {
      case 'jalan':
        this.fase += dt * 11;
        var f = sin(this.fase);
        tg.kKi = f * 0.72; tg.kKa = -f * 0.72; tg.lKiX = -f * 0.6; tg.lKaX = f * 0.6; tg.naik = Math.abs(f) * 0.06; tg.atasX = 0.06;
        if (this.langkah !== undefined) { var lk = f > 0; if (lk !== this.langkah) { this.langkah = lk; if (this.bunyiLangkah) Aud.sfx('langkah'); } } else this.langkah = f > 0;
        break;
      case 'tebang':
        var ay = sin(ta * 9);
        tg.lKaX = -1.9 - ay * 0.85; tg.lKiX = -0.9 - ay * 0.3; tg.atasX = 0.14 + ay * 0.1; tg.kKi = -0.25; tg.kKa = 0.25;
        break;
      case 'tanam':
        tg.atasX = 0.85; tg.lKiX = -1.2 + sin(ta * 12) * 0.25; tg.lKaX = -1.2 - sin(ta * 12) * 0.25; tg.lKiZ = 0.1; tg.lKaZ = 0.1; tg.kKi = -0.3; tg.kKa = 0.3; tg.kepX = -0.3;
        break;
      case 'sorak':
        tg.lKiZ = 2.5 + sin(a * 12) * 0.15; tg.lKaZ = 2.5 - sin(a * 12) * 0.15; tg.naik = Math.abs(sin(a * 6.5)) * 0.42; tg.kKi = -0.25; tg.kKa = 0.25;
        break;
      case 'pikir':
        tg.lKaX = -2.2; tg.lKaZ = 0.5; tg.kepZ = 0.16; tg.lKiX = -0.1;
        break;
      case 'sedih':
        tg.kepX = 0.28; tg.atasX = 0.12; tg.lKiZ = 0.14; tg.lKaZ = 0.14;
        break;
      case 'lambai':
        tg.lKaZ = 2.65 + sin(a * 9) * 0.34; tg.kepZ = sin(a * 4.5) * 0.05;
        break;
      case 'bicara':
        tg.lKaX = -0.7 + sin(a * 5) * 0.2; tg.kepX = sin(a * 7) * 0.05; tg.lKaZ = 0.4;
        break;
      default:   // diam: bernapas dan sedikit bergoyang
        tg.lKiX = sin(a * 1.2) * 0.05; tg.lKaX = -sin(a * 1.2) * 0.05; tg.naik = 0.01 + sin(a * 1.7) * 0.008;
    }
    var k = 1 - Math.exp(-dt * 14), s = this.sendi, n;
    for (n in s) s[n] += (tg[n] - s[n]) * k;
    this._terapkan();
    /* arah */
    var beda = this.arahTuju - this.arah;
    while (beda > Math.PI) beda -= Math.PI * 2;
    while (beda < -Math.PI) beda += Math.PI * 2;
    this.arah += beda * (1 - Math.exp(-dt * 12));
    this.grup.rotation.y = this.arah;
    this.dasarY = this._tinggi(this.x, this.z);
    this.grup.position.set(this.x, this.dasarY + s.naik, this.z);
    this.atas.scale.y = this.anim === 'diam' ? 1 + sin(a * 1.7) * 0.012 : 1;
  };
  Tokoh.prototype._terapkan = function () {
    var s = this.sendi;
    this.kaki[0].rotation.x = s.kKi; this.kaki[1].rotation.x = s.kKa;
    this.lengan[0].rotation.set(s.lKiX, 0, -s.lKiZ); this.lengan[1].rotation.set(s.lKaX, 0, s.lKaZ);
    this.kepala.rotation.set(this.miring + s.kepX - s.atasX * 0.6, 0, s.kepZ);
    this.atas.rotation.x = s.atasX;
  };
  /* posisi kepala di dunia, untuk kamera potret dan balon */
  Tokoh.prototype.posKepala = function (v) {
    v = v || new THREE.Vector3();
    this.kepala.getWorldPosition(v);
    return v;
  };
  /* geometri model AI dipakai bersama, jadi hanya kerangkanya yang dibuang */
  Tokoh.prototype.buang = function () { this.grup.traverse(function (o) { if (o.isSkinnedMesh) o.skeleton.dispose(); else if (o.isMesh) o.geometry.dispose(); }); };

  /* ===== Rako ===== */
  function Rako(skala) {
    var s = skala || 1.7, luar = new THREE.Group(), g = new THREE.Group(), R = new Rakit(55), hitam = new THREE.Color(0x24463B), krem = W(PAL.kertas), kunyit = W(PAL.kunyit), i, sisi;
    this.s = s; this.grup = luar; this.badan = g; this.sayap = [];
    var ai = Aset3D.ada('ani_rako'), sk = s / 1.7 * 1.2;
    if (ai) R.tambahBerwarna(Aset3D.ambil('ani_rako'), M(0, -0.4 * sk, 0, 0, 0, 0, sk, sk, sk));
    else {
    R.tambah(gumpal(0.24 * s, 61, 1, 0.05), hitam, M(0, 0, 0, 0, 0, 0, 1, 0.95, 1.1));
    R.tambah(gumpal(0.18 * s, 62, 1, 0.04), krem, M(0, -0.06 * s, 0.1 * s, 0, 0, 0, 1, 1, 0.9));
    R.tambah(gumpal(0.175 * s, 63, 1, 0.04), hitam, M(0, 0.2 * s, 0.13 * s));
    R.tambah(Kerucut(0.115 * s, 0.42 * s, 7), kunyit, M(0, 0.165 * s, 0.42 * s, Math.PI * 0.56, 0, 0), 0.02);
    R.tambah(gumpal(0.1 * s, 64, 0, 0.06), W(PAL.bata), M(0, 0.325 * s, 0.25 * s, 0, 0, 0, 0.7, 0.75, 1.5));
    for (i = 0; i < 2; i++) {
      sisi = i ? 1 : -1;
      R.tambah(Bola(0.058 * s, 8, 6), new THREE.Color(0xFFFFFF), M(sisi * 0.12 * s, 0.25 * s, 0.22 * s, 0, 0, 0, 1, 1, 0.6), 0);
      R.tambah(Bola(0.032 * s, 6, 5), new THREE.Color(0x101A17), M(sisi * 0.132 * s, 0.256 * s, 0.25 * s, 0, 0, 0, 1, 1, 0.6), 0);
      R.tambah(Kerucut(0.03 * s, 0.1 * s, 4), kunyit, M(sisi * 0.08 * s, -0.25 * s, 0.03 * s, Math.PI, 0, 0));
    }
    R.tambah(Kotak(0.18 * s, 0.05 * s, 0.26 * s), hitam, M(0, 0, -0.3 * s, 0.3, 0, 0));
    }
    var bt = Bahan.tetap();
    g.add(R.jadi(bt));
    var diri = this;
    [-1, 1].forEach(function (sx) {
      var S = new Rakit(70 + sx);
      /* sayap model: pangkal di -x, ujung krem di +x. Sisi lain dicerminkan. */
      if (ai && Aset3D.ada('ani_rako_sayap')) S.tambahBerwarna(Aset3D.ambil('ani_rako_sayap'), M(sx * 0.3 * sk, -0.1 * sk, 0, 0, 0, 0, sx * sk, sk, sk));
      else {
        S.tambah(gumpal(0.2 * s, 71, 1, 0.08), hitam, M(sx * 0.2 * s, 0, 0, 0, 0, 0, 1.25, 0.2, 0.72));
        S.tambah(gumpal(0.12 * s, 72, 0, 0.08), krem, M(sx * 0.38 * s, -0.005 * s, 0, 0, 0, 0, 1, 0.22, 1));
      }
      var sy = S.jadi(bt);
      sy.position.set(sx * 0.16 * s, 0.05 * s, -0.02 * s);
      sy.userData.sisi = sx;
      g.add(sy); diri.sayap.push(sy);
    });
    g.rotation.x = ai ? -0.3 : -0.5;   // wajah terangkat menghadap kamera atas
    luar.add(g);
    this.pos = new THREE.Vector3(); this.tuju = new THREE.Vector3(); this.t = Math.random() * 6; this.ikut = null; this.mode = 'ikut'; this.arah = 0;
    this.kepak = 18; this.bentang = 0.62;
  }
  Rako.prototype.taruh = function (x, y, z) { this.pos.set(x, y, z); this.tuju.copy(this.pos); this.grup.position.copy(this.pos); };
  Rako.prototype.ikuti = function (tokoh) { this.ikut = tokoh; this.mode = 'ikut'; };
  Rako.prototype.tunjuk = function (x, y, z) { this.mode = 'tunjuk'; this.tuju.set(x, y, z); };
  Rako.prototype.update = function (dt) {
    this.t += dt;
    if (this.mode === 'ikut' && this.ikut) {
      var o = this.ikut, sway = Math.sin(this.t * 0.8) * 0.3;
      this.tuju.set(o.x + 1.45 + sway, o.dasarY + 3.1 + Math.sin(this.t * 1.3) * 0.12, o.z - 1.2);
    }
    var kx = 1 - Math.exp(-dt * 2.6), dx = this.tuju.x - this.pos.x;
    this.pos.lerp(this.tuju, kx);
    this.grup.position.set(this.pos.x, this.pos.y + Math.sin(this.t * 3.1) * 0.06, this.pos.z);
    var lajuX = Math.abs(dx);
    var arahT = lajuX > 0.3 ? (dx > 0 ? 0.75 : -0.75) : -0.3;
    this.arah += (arahT - this.arah) * (1 - Math.exp(-dt * 4));
    this.grup.rotation.y = this.arah;
    var kepak = lajuX > 0.3 ? 26 : this.kepak, a = Math.sin(this.t * kepak);
    for (var i = 0; i < this.sayap.length; i++) { var sy = this.sayap[i]; sy.rotation.z = sy.userData.sisi * (this.bentang + a * 0.45); }
  };
  Rako.prototype.buang = function () { this.grup.traverse(function (o) { if (o.isMesh) o.geometry.dispose(); }); };

  root.Tokoh = Tokoh; root.Rako = Rako;
})(window);
