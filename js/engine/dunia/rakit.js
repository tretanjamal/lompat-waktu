/* Perakit bentuk: menggabungkan banyak bentuk menjadi satu mesh warna per titik, faset datar. Plus derau medan. */
(function (root) {
  function acak(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function jepit(x, a, b) { return x < a ? a : (x > b ? b : x); }
  function halus(a, b, x) { var t = jepit((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }

  function derau(x, z) {
    function n(ix, iz) { var s = Math.sin(ix * 127.1 + iz * 311.7) * 43758.5453; return s - Math.floor(s); }
    var ix = Math.floor(x), iz = Math.floor(z), fx = x - ix, fz = z - iz;
    var u = fx * fx * (3 - 2 * fx), v = fz * fz * (3 - 2 * fz);
    return (n(ix, iz) * (1 - u) + n(ix + 1, iz) * u) * (1 - v) + (n(ix, iz + 1) * (1 - u) + n(ix + 1, iz + 1) * u) * v;
  }
  function derauLapis(x, z) { return derau(x, z) * 0.6 + derau(x * 2.1 + 9, z * 2.1 + 5) * 0.3 + derau(x * 4.3 + 3, z * 4.3 + 7) * 0.1; }
  function jarakGaris(pts, x, z) {
    var d = 1e9, i;
    for (i = 0; i < pts.length - 1; i++) {
      var a = pts[i], b = pts[i + 1], vx = b[0] - a[0], vz = b[1] - a[1], t = jepit(((x - a[0]) * vx + (z - a[1]) * vz) / (vx * vx + vz * vz), 0, 1);
      var dx = x - a[0] - vx * t, dz = z - a[1] - vz * t;
      d = Math.min(d, Math.sqrt(dx * dx + dz * dz));
    }
    return d;
  }

  /* matriks dari posisi, rotasi, skala */
  function M(x, y, z, rx, ry, rz, sx, sy, sz) {
    var m = new THREE.Matrix4();
    var e = new THREE.Euler(rx || 0, ry || 0, rz || 0);
    var s = new THREE.Vector3(sx === undefined ? 1 : sx, sy === undefined ? (sx === undefined ? 1 : sx) : sy, sz === undefined ? (sx === undefined ? 1 : sx) : sz);
    m.compose(new THREE.Vector3(x || 0, y || 0, z || 0), new THREE.Quaternion().setFromEuler(e), s);
    return m;
  }

  function Rakit(seed) { this.p = []; this.c = []; this.r = acak(seed || 1); }
  /* warna: THREE.Color atau fungsi (x, y, z) -> Color. ragam: variasi terang per segitiga */
  Rakit.prototype.tambah = function (geo, warna, m, ragam) {
    var g = geo.index ? geo.toNonIndexed() : geo, a = g.attributes.position, v = new THREE.Vector3(), i, c = null, k = 1, fungsi = typeof warna === 'function';
    ragam = ragam === undefined ? 0.05 : ragam;
    for (i = 0; i < a.count; i++) {
      if (i % 3 === 0) { c = fungsi ? null : warna; k = 1 + (this.r() - 0.5) * 2 * ragam; }
      v.fromBufferAttribute(a, i);
      if (m) v.applyMatrix4(m);
      this.p.push(v.x, v.y, v.z);
      var cv = c || warna(v.x, v.y, v.z);
      this.c.push(cv.r * k, cv.g * k, cv.b * k);
    }
    return this;
  };
  /* geometri yang sudah punya warna per titik dan normal halus (model AI hasil proses) */
  Rakit.prototype.tambahBerwarna = function (geo, m) {
    var g = geo.index ? (geo._tanpaIndeks || (geo._tanpaIndeks = geo.toNonIndexed())) : geo, a = g.attributes.position, w = g.attributes.color, no = g.attributes.normal, v = new THREE.Vector3(), i;
    var awal = this.p.length, N = no ? new Float32Array(a.count * 3) : null, nm = m ? new THREE.Matrix3().getNormalMatrix(m) : null;
    /* skala negatif (sayap cermin) membalik arah segitiga, jadi urutan titik ikut dibalik */
    var balik = m && m.determinant() < 0;
    for (var t = 0; t < a.count; t++) {
      i = balik ? t - t % 3 + 2 - t % 3 : t;
      v.fromBufferAttribute(a, i);
      if (m) v.applyMatrix4(m);
      this.p.push(v.x, v.y, v.z);
      if (w) this.c.push(w.getX(i), w.getY(i), w.getZ(i)); else this.c.push(0.7, 0.7, 0.7);
      if (no) {
        v.fromBufferAttribute(no, i);
        if (nm) v.applyMatrix3(nm).normalize();
        N[t * 3] = v.x; N[t * 3 + 1] = v.y; N[t * 3 + 2] = v.z;
      }
    }
    if (N) (this.nHalus = this.nHalus || []).push({ awal: awal, n: N });
    return this;
  };
  Rakit.prototype.geometri = function () {
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.c, 3));
    g.computeVertexNormals();   // tak berindeks: normal tiap segitiga, jadi bentuk dari kode tetap berfaset
    if (this.nHalus) this.nHalus.forEach(function (b) { g.attributes.normal.array.set(b.n, b.awal); });
    return g;
  };
  Rakit.prototype.jadi = function (mat) { return new THREE.Mesh(this.geometri(), mat); };
  Rakit.prototype.kosong = function () { return this.p.length === 0; };

  /* Gumpalan faset: ikosahedron yang digeser acak, titik sama tetap menyatu */
  function gumpal(r, seed, detail, kasar) {
    var g = new THREE.IcosahedronGeometry(r, detail === undefined ? 1 : detail), a = g.attributes.position, geser = {}, rng = acak(seed || 7), i;
    kasar = kasar === undefined ? 0.16 : kasar;
    for (i = 0; i < a.count; i++) {
      var kunci = Math.round(a.getX(i) * 500) + '_' + Math.round(a.getY(i) * 500) + '_' + Math.round(a.getZ(i) * 500);
      if (geser[kunci] === undefined) geser[kunci] = 1 + (rng() - 0.5) * 2 * kasar;
      a.setXYZ(i, a.getX(i) * geser[kunci], a.getY(i) * geser[kunci], a.getZ(i) * geser[kunci]);
    }
    return g;
  }

  /* Deret: banyak salinan satu bentuk dalam satu draw call. Tiap salinan bisa dimunculkan atau disembunyikan lewat skala. daftar: [{x,y,z,ry,s}] */
  var d4 = new THREE.Matrix4(), dq = new THREE.Quaternion(), de = new THREE.Euler(), dp = new THREE.Vector3(), ds = new THREE.Vector3();
  function Deret(scene, geo, bahan, daftar) {
    this.daftar = daftar;
    this.mesh = new THREE.InstancedMesh(geo, bahan, daftar.length);
    this.mesh.frustumCulled = false;
    scene.add(this.mesh);
    for (var i = 0; i < daftar.length; i++) this.skala(i, 1);
  }
  Deret.prototype.jumlah = function (n) { this.mesh.count = n; };
  /* k: kali ukuran asli; ky: kali tinggi saja */
  Deret.prototype.skala = function (i, k, ky) {
    var t = this.daftar[i], u = (t.s || 1) * Math.max(k, 0.0001);
    d4.compose(dp.set(t.x, t.y, t.z), dq.setFromEuler(de.set(0, t.ry || 0, 0)), ds.set(u, u * (ky === undefined ? 1 : Math.max(ky, 0.0001)), u));
    this.mesh.setMatrixAt(i, d4);
    this.mesh.instanceMatrix.needsUpdate = true;
  };

  root.Bentuk = {
    acak: acak, jepit: jepit, halus: halus, derau: derau, derauLapis: derauLapis, jarakGaris: jarakGaris, M: M, Rakit: Rakit, gumpal: gumpal, Deret: Deret,
    Kotak: function (w, h, d) { return new THREE.BoxGeometry(w, h, d); },
    Tabung: function (a, b, h, n) { return new THREE.CylinderGeometry(a, b, h, n || 6); },
    Kerucut: function (r, h, n) { return new THREE.ConeGeometry(r, h, n || 6); },
    Bola: function (r, a, b) { return new THREE.SphereGeometry(r, a || 10, b || 8); }
  };
})(window);
