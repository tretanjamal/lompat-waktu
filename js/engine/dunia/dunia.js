/* Dunia: renderer dan tingkat kualitas, kamera mengikuti tokoh, proyeksi layar <-> dunia, ketukan tanah, foto kanvas. */
(function (root) {
  var v1 = new THREE.Vector3(), v2 = new THREE.Vector3();

  var Kamera = {
    cam: new THREE.PerspectiveCamera(31, 1280 / 720, 0.5, 900),
    offset: new THREE.Vector3(0, 12.7, 15.8), pusat: new THREE.Vector3(), tujuan: new THREE.Vector3(), dasar: new THREE.Vector3(),
    zoom: 1, batas: null, ikutK: 0.55, halus: 3.2,
    /* o: dasar [x,y,z], offset [x,y,z], fov, batas {x0,x1,z0,z1}, ikutK */
    atur: function (o) {
      if (o.fov) { Kamera.cam.fov = o.fov; }
      if (o.jauh) Kamera.cam.far = o.jauh;
      Kamera.cam.updateProjectionMatrix();
      if (o.offset) Kamera.offset.set(o.offset[0], o.offset[1], o.offset[2]);
      if (o.dasar) { Kamera.dasar.set(o.dasar[0], o.dasar[1], o.dasar[2]); Kamera.tujuan.copy(Kamera.dasar); Kamera.pusat.copy(Kamera.dasar); }
      Kamera.batas = o.batas || null;
      Kamera.ikutK = o.ikutK === undefined ? 0.55 : o.ikutK;
      Kamera.zoom = 1;
      Kamera.terapkan();
    },
    /* ganti tujuan tanpa melompat: kamera meluncur pelan ke sana */
    geser: function (o) {
      if (o.dasar) Kamera.dasar.set(o.dasar[0], o.dasar[1], o.dasar[2]);
      Kamera.batas = o.batas || null;
      Kamera.ikutK = o.ikutK === undefined ? 0.55 : o.ikutK;
    },
    ikut: function (x, z) {
      var k = Kamera.ikutK, d = Kamera.dasar, tx = d.x + (x - d.x) * k, tz = d.z + (z - d.z) * k, b = Kamera.batas;
      if (b) { tx = Math.max(b.x0, Math.min(b.x1, tx)); tz = Math.max(b.z0, Math.min(b.z1, tz)); }
      Kamera.tujuan.set(tx, d.y, tz);
    },
    /* langsung ke titik (tanpa pelan), untuk awal adegan */
    lompatKe: function () { Kamera.pusat.copy(Kamera.tujuan); Kamera.terapkan(); },
    update: function (dt) {
      Kamera.pusat.lerp(Kamera.tujuan, 1 - Math.exp(-dt * Kamera.halus));
      Kamera.terapkan();
    },
    terapkan: function () {
      var c = Kamera.cam, o = Kamera.offset, p = Kamera.pusat, z = Kamera.zoom;
      c.position.set(p.x + o.x * z, p.y + o.y * z, p.z + o.z * z);
      c.lookAt(p);
      c.updateMatrixWorld();   // proyeksi layar <-> dunia harus memakai posisi kamera terbaru, bukan bingkai sebelumnya
    }
  };

  var Dunia = {
    ok: false, r: null, kanvas: null, scene: null, tingkat: 'sedang', Kamera: Kamera, onKetuk: null,
    _waktu: [], _tTurun: 0, _kunciTingkat: false, _tinggi: null,

    init: function () {
      var c = this.kanvas = document.getElementById('dunia');
      var paksa = /[?&]tier=(hemat|sedang|tinggi)/.exec(location.search);
      this._kunciTingkat = !!paksa;
      this.tingkat = paksa ? paksa[1] : this._pilihAwal();
      var diri = this, i;
      /* sebagian peramban menolak setelan tertentu, jadi dicoba dari yang terbaik sampai yang paling ringan */
      var opsi = [{ antialias: this.tingkat !== 'hemat', powerPreference: 'high-performance' }, { antialias: false }, { antialias: false, powerPreference: 'low-power', precision: 'mediump', stencil: false }];
      function catat(e) { if (e.statusMessage) diri.alasan = e.statusMessage; }
      c.addEventListener('webglcontextcreationerror', catat);
      for (i = 0; i < opsi.length && !this.r; i++) {
        try { this.r = new THREE.WebGLRenderer(Object.assign({ canvas: c, alpha: false }, opsi[i])); } catch (e) { this.alasan = this.alasan || e.message; }
      }
      c.removeEventListener('webglcontextcreationerror', catat);
      if (!this.r) { this.ok = false; return false; }
      this.ok = true;
      this.r.setPixelRatio(1);
      this.r.info.autoReset = true;
      Stage.onFit(function () { diri.ukur(); });
      this.ukur();
      c.addEventListener('webglcontextlost', function (e) { e.preventDefault(); diri.hilang = true; if (root.UI) UI.toast(STR.webglHilang); });
      c.addEventListener('webglcontextrestored', function () { diri.hilang = false; });
      c.addEventListener('pointerdown', function (e) { if (diri.onKetuk) { var p = Stage.toLocal(e.clientX, e.clientY); diri.onKetuk(p.x, p.y, e); } });
      return true;
    },
    _pilihAwal: function () {
      var s = Save.data.settings.kualitas;
      if (s && s !== 'auto' && KUALITAS.tingkat[s]) { this._kunciTingkat = true; return s; }
      var inti = navigator.hardwareConcurrency || 4, mem = navigator.deviceMemory || 4, hp = /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent);
      return (hp || inti <= 2 || mem <= 2) ? 'hemat' : 'sedang';
    },
    ukur: function () {
      if (!this.r) return;
      var t = KUALITAS.tingkat[this.tingkat], dpr = Math.min(root.devicePixelRatio || 1, t.rasio);
      var w = Math.min(Math.round(1280 * Stage.scale * dpr), t.lebarMaks), h = Math.round(w * 9 / 16);
      if (w < 16) return;
      this.r.setSize(w, h, false);
    },
    aturTingkat: function (nama) {
      Save.data.settings.kualitas = nama; Save.save();
      this._kunciTingkat = nama !== 'auto';
      if (nama !== 'auto') { this.tingkat = nama; this.ukur(); this.terapkanHiasan(); }
    },
    /* mesh hiasan (rumput, bunga) hilang di tingkat Hemat */
    hiasan: null,
    terapkanHiasan: function () { if (this.hiasan) this.hiasan.visible = KUALITAS.tingkat[this.tingkat].hiasan; },
    pakai: function (scene) { this.scene = scene; this.terapkanHiasan(); },
    /* render + pantau waktu bingkai: bila terus lambat, turun satu tingkat */
    render: function (dt) {
      if (!this.ok || !this.scene || this.hilang) return;
      Warna.U.uWaktu.value += dt;
      this.r.render(this.scene, Kamera.cam);
      if (this._kunciTingkat) return;
      this._tTurun += dt;
      this._waktu.push(dt);
      if (this._tTurun >= KUALITAS.jendelaDetik) {
        var total = 0, i;
        for (i = 0; i < this._waktu.length; i++) total += this._waktu[i];
        var fps = this._waktu.length / total, u = KUALITAS.urutan.indexOf(this.tingkat);
        if (fps < KUALITAS.fpsTurun && u > 0) { this.tingkat = KUALITAS.urutan[u - 1]; this.ukur(); this.terapkanHiasan(); }
        this._waktu.length = 0; this._tTurun = 0;
      }
    },
    /* koordinat dunia -> kanvas logis */
    keLayar: function (x, y, z, keluar) {
      var p = keluar || {};
      v1.set(x, y, z).project(Kamera.cam);
      p.x = (v1.x + 1) / 2 * 1280; p.y = (1 - v1.y) / 2 * 720; p.z = v1.z;
      return p;
    },
    /* kanvas logis -> titik di permukaan (jalan menyusuri sinar sampai menyentuh tinggi medan) */
    dariLayar: function (lx, ly, tinggi) {
      v1.set(lx / 1280 * 2 - 1, -(ly / 720 * 2 - 1), 0.5).unproject(Kamera.cam);
      v2.copy(v1).sub(Kamera.cam.position).normalize();
      var o = Kamera.cam.position, t = 0, langkah = 0.25, i;
      for (i = 0; i < 400; i++) {
        t += langkah;
        var x = o.x + v2.x * t, y = o.y + v2.y * t, z = o.z + v2.z * t;
        if (y <= tinggi(x, z)) {
          var a = t - langkah, b = t;
          for (var j = 0; j < 6; j++) { var m = (a + b) / 2; if (o.y + v2.y * m <= tinggi(o.x + v2.x * m, o.z + v2.z * m)) b = m; else a = m; }
          return { x: o.x + v2.x * b, z: o.z + v2.z * b };
        }
      }
      return null;
    },
    /* cuplikan kanvas kecil untuk Jurnal. Harus dipanggil setelah render di tugas yang sama. */
    cuplik: function (lebar) {
      if (!this.ok || !this.scene) return null;
      this.r.render(this.scene, Kamera.cam);
      var w = lebar || 256, h = Math.round(w * 9 / 16), c = document.createElement('canvas');
      c.width = w; c.height = h;
      try { c.getContext('2d').drawImage(this.kanvas, 0, 0, w, h); return c.toDataURL('image/jpeg', 0.7); } catch (e) { return null; }
    },
    /* render objek ke gambar beralfa (potret dan kartu), hasil data URL */
    bidik: function (scene, cam, w, h) {
      if (!this.ok || this.hilang) return null;
      var r = this.r, rt = new THREE.WebGLRenderTarget(w, h, { depthBuffer: true }), gl2 = r.capabilities.isWebGL2;
      if (gl2) rt.texture.colorSpace = THREE.SRGBColorSpace;
      var lamaW = r.getClearColor(new THREE.Color()), lamaA = r.getClearAlpha(), buf = new Uint8Array(w * h * 4);
      r.setRenderTarget(rt); r.setClearColor(0x000000, 0); r.clear();
      r.render(scene, cam);
      r.readRenderTargetPixels(rt, 0, 0, w, h, buf);
      r.setRenderTarget(null); r.setClearColor(lamaW, lamaA);
      rt.dispose();
      var c = document.createElement('canvas'); c.width = w; c.height = h;
      var x = c.getContext('2d'), img = x.createImageData(w, h), d = img.data, j, i;
      var lut = null;
      if (!gl2) { lut = new Uint8Array(256); for (i = 0; i < 256; i++) { var v = i / 255; lut[i] = Math.round(255 * (v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055)); } }
      for (j = 0; j < h; j++) {
        var sumber = (h - 1 - j) * w * 4, tuju = j * w * 4;
        for (i = 0; i < w * 4; i += 4) {
          d[tuju + i] = lut ? lut[buf[sumber + i]] : buf[sumber + i];
          d[tuju + i + 1] = lut ? lut[buf[sumber + i + 1]] : buf[sumber + i + 1];
          d[tuju + i + 2] = lut ? lut[buf[sumber + i + 2]] : buf[sumber + i + 2];
          d[tuju + i + 3] = buf[sumber + i + 3];
        }
      }
      x.putImageData(img, 0, 0);
      return c.toDataURL('image/png');
    },
    buangAdegan: function (scene) {
      if (!scene) return;
      scene.traverse(function (o) {
        if (!o.isMesh) return;
        if (o.isSkinnedMesh) o.skeleton.dispose();   // tekstur tulang tidak ikut terbuang bersama geometri
        if (o.geometry) o.geometry.dispose();
        if (o.material && o.material.dispose) o.material.dispose();
        if (o.isInstancedMesh) o.dispose();
      });
    }
  };

  /* cahaya standar zona */
  Dunia.pasangCahaya = function (scene, langitI, matahariI) {
    var hemi = new THREE.HemisphereLight(0xdcf6ff, 0x9c8a62, langitI === undefined ? 1.5 : langitI);
    var s = new THREE.DirectionalLight(0xfff0cf, matahariI === undefined ? 2.55 : matahariI);
    s.position.set(-9, 16, 8);
    scene.add(hemi); scene.add(s);
    return { hemi: hemi, matahari: s };
  };

  /* bayangan bulat lembut */
  var teksturBayang = null;
  Dunia.bayangan = function (r) {
    if (!teksturBayang) {
      var c = document.createElement('canvas'); c.width = c.height = 64;
      var x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 4, 32, 32, 32);
      gr.addColorStop(0, 'rgba(22,53,44,0.46)'); gr.addColorStop(0.65, 'rgba(22,53,44,0.28)'); gr.addColorStop(1, 'rgba(22,53,44,0)');
      x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
      teksturBayang = new THREE.CanvasTexture(c);
    }
    var m = new THREE.Mesh(new THREE.CircleGeometry(r, 18), new THREE.MeshBasicMaterial({ map: teksturBayang, transparent: true, depthWrite: false }));
    m.rotation.x = -Math.PI / 2;
    return m;
  };
  /* bayangan banyak benda diam dalam satu draw call. posisi: [{x,y,z}] */
  Dunia.bayanganDeret = function (r, posisi, scene) {
    var satu = Dunia.bayangan(r), m = new THREE.InstancedMesh(satu.geometry, satu.material, posisi.length), m4 = new THREE.Matrix4(), q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0)), s = new THREE.Vector3(1, 1, 1), p = new THREE.Vector3();
    posisi.forEach(function (t, i) { m.setMatrixAt(i, m4.compose(p.set(t.x, t.y, t.z), q, s)); });
    m.frustumCulled = false;
    scene.add(m);
    return m;
  };
  /* cincin benda yang bisa diketuk */
  Dunia.cincin = function (r) {
    var g = new THREE.Group();
    var a = new THREE.Mesh(new THREE.RingGeometry(r * 0.78, r, 28), new THREE.MeshBasicMaterial({ color: Warna.PAL.kunyit, transparent: true, opacity: 0.95, depthWrite: false }));
    var b = new THREE.Mesh(new THREE.RingGeometry(r * 1.06, r * 1.2, 28), new THREE.MeshBasicMaterial({ color: Warna.PAL.kertas, transparent: true, opacity: 0.55, depthWrite: false }));
    a.rotation.x = b.rotation.x = -Math.PI / 2;
    g.add(a); g.add(b);
    return g;
  };

  root.Dunia = Dunia;
  root.Kamera = Kamera;
})(window);
