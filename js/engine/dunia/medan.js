/* Medan dan jalur: permukaan zona dari fungsi tinggi dan warna, plus grid jalan kaki dengan A*. */
(function (root) {
  var B = Bentuk;

  /* def: lebar, dalam, nx, nz, tinggi(x,z), warna(x,y,z), cx, cz */
  function buatMedan(def, seed, bahan) {
    var g = new THREE.PlaneGeometry(def.lebar, def.dalam, def.nx, def.nz), a, i;
    g.rotateX(-Math.PI / 2);
    g.translate(def.cx || 0, 0, def.cz || 0);
    a = g.attributes.position;
    for (i = 0; i < a.count; i++) a.setY(i, def.tinggi(a.getX(i), a.getZ(i)));
    var R = new B.Rakit(seed || 101);
    R.tambah(g, def.warna, null, def.ragam === undefined ? 0.045 : def.ragam);
    return R.jadi(bahan || Bahan.pulih());
  }

  /* permukaan air datar dengan warna per titik; ombak dari shader */
  function buatAir(def) {
    var g = new THREE.PlaneGeometry(def.lebar, def.dalam, def.nx, def.nz), a, i;
    g.rotateX(-Math.PI / 2);
    g.translate(def.cx || 0, 0, def.cz || 0);
    a = g.attributes.position;
    for (i = 0; i < a.count; i++) a.setY(i, def.y);
    var R = new B.Rakit(def.seed || 103);
    R.tambah(g, def.warna, null, def.ragam === undefined ? 0.1 : def.ragam);
    return R.jadi(Bahan.air(def.ombak === undefined ? 0.035 : def.ombak, { transparent: true, opacity: def.opacity || 0.94 }));
  }

  /* Grid jalan kaki. o: x0, x1, z0, z1, sel, boleh(x,z) */
  function Jalur(o) {
    this.x0 = o.x0; this.z0 = o.z0; this.sel = o.sel || 0.5;
    this.nx = Math.ceil((o.x1 - o.x0) / this.sel); this.nz = Math.ceil((o.z1 - o.z0) / this.sel);
    this.g = new Uint8Array(this.nx * this.nz);
    for (var j = 0; j < this.nz; j++) for (var i = 0; i < this.nx; i++) this.g[j * this.nx + i] = o.boleh(this.x0 + (i + 0.5) * this.sel, this.z0 + (j + 0.5) * this.sel) ? 1 : 0;
  }
  Jalur.prototype.indeks = function (x, z) {
    var i = Math.floor((x - this.x0) / this.sel), j = Math.floor((z - this.z0) / this.sel);
    if (i < 0 || j < 0 || i >= this.nx || j >= this.nz) return -1;
    return j * this.nx + i;
  };
  Jalur.prototype.bisa = function (x, z) { var k = this.indeks(x, z); return k >= 0 && this.g[k] === 1; };
  /* tandai lingkaran sebagai rintangan (batang pohon, tokoh diam) */
  Jalur.prototype.rintangan = function (x, z, r) {
    for (var j = 0; j < this.nz; j++) for (var i = 0; i < this.nx; i++) {
      var dx = this.x0 + (i + 0.5) * this.sel - x, dz = this.z0 + (j + 0.5) * this.sel - z;
      if (dx * dx + dz * dz < r * r) this.g[j * this.nx + i] = 0;
    }
  };
  /* titik terdekat yang bisa diinjak */
  Jalur.prototype.terdekat = function (x, z) {
    if (this.bisa(x, z)) return { x: x, z: z };
    var i0 = Math.floor((x - this.x0) / this.sel), j0 = Math.floor((z - this.z0) / this.sel), r, i, j;
    for (r = 1; r < Math.max(this.nx, this.nz); r++) {
      var terbaik = null, dBest = 1e9;
      for (j = j0 - r; j <= j0 + r; j++) for (i = i0 - r; i <= i0 + r; i++) {
        if (Math.max(Math.abs(i - i0), Math.abs(j - j0)) !== r) continue;
        if (i < 0 || j < 0 || i >= this.nx || j >= this.nz || !this.g[j * this.nx + i]) continue;
        var px = this.x0 + (i + 0.5) * this.sel, pz = this.z0 + (j + 0.5) * this.sel, d = (px - x) * (px - x) + (pz - z) * (pz - z);
        if (d < dBest) { dBest = d; terbaik = { x: px, z: pz }; }
      }
      if (terbaik) return terbaik;
    }
    return { x: x, z: z };
  };
  Jalur.prototype.garisBebas = function (ax, az, bx, bz) {
    var d = Math.sqrt((bx - ax) * (bx - ax) + (bz - az) * (bz - az)), n = Math.ceil(d / (this.sel * 0.5)), i;
    for (i = 0; i <= n; i++) { var t = n ? i / n : 0; if (!this.bisa(ax + (bx - ax) * t, az + (bz - az) * t)) return false; }
    return true;
  };
  /* A* 8 arah lalu dirapikan dengan garis pandang. Mengembalikan daftar titik tanpa titik awal. */
  Jalur.prototype.cari = function (ax, az, bx, bz) {
    var awal = this.terdekat(ax, az), akhir = this.terdekat(bx, bz);
    if (this.garisBebas(awal.x, awal.z, akhir.x, akhir.z)) return [akhir];
    var nx = this.nx, nz = this.nz, g = this.g, total = nx * nz;
    var s = this.indeks(awal.x, awal.z), t = this.indeks(akhir.x, akhir.z);
    if (s < 0 || t < 0) return [akhir];
    var biaya = new Float32Array(total).fill(1e9), asal = new Int32Array(total).fill(-1), tutup = new Uint8Array(total);
    var hx = t % nx, hz = Math.floor(t / nx);
    function h(k) { var dx = Math.abs(k % nx - hx), dz = Math.abs(Math.floor(k / nx) - hz); return Math.max(dx, dz) + 0.41 * Math.min(dx, dz); }
    var buka = [[h(s), s]];
    biaya[s] = 0;
    function dorong(item) { var i = buka.length; buka.push(item); while (i > 0) { var p = (i - 1) >> 1; if (buka[p][0] <= buka[i][0]) break; var tmp = buka[p]; buka[p] = buka[i]; buka[i] = tmp; i = p; } }
    function ambil() {
      var top = buka[0], last = buka.pop();
      if (buka.length) { buka[0] = last; var i = 0; for (;;) { var l = 2 * i + 1, r = l + 1, m = i; if (l < buka.length && buka[l][0] < buka[m][0]) m = l; if (r < buka.length && buka[r][0] < buka[m][0]) m = r; if (m === i) break; var tmp = buka[m]; buka[m] = buka[i]; buka[i] = tmp; i = m; } }
      return top;
    }
    var ARAH = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, 1.41], [1, -1, 1.41], [-1, 1, 1.41], [-1, -1, 1.41]], ketemu = false;
    while (buka.length) {
      var k = ambil()[1];
      if (tutup[k]) continue;
      tutup[k] = 1;
      if (k === t) { ketemu = true; break; }
      var ki = k % nx, kj = Math.floor(k / nx);
      for (var a = 0; a < 8; a++) {
        var ni = ki + ARAH[a][0], nj = kj + ARAH[a][1];
        if (ni < 0 || nj < 0 || ni >= nx || nj >= nz) continue;
        var n = nj * nx + ni;
        if (!g[n] || tutup[n]) continue;
        if (ARAH[a][0] && ARAH[a][1] && (!g[kj * nx + ni] || !g[nj * nx + ki])) continue;   // tidak memotong sudut
        var c = biaya[k] + ARAH[a][2];
        if (c < biaya[n]) { biaya[n] = c; asal[n] = k; dorong([c + h(n), n]); }
      }
    }
    if (!ketemu) return [];
    var titik = [], cur = t;
    while (cur >= 0 && cur !== s) { titik.push({ x: this.x0 + (cur % nx + 0.5) * this.sel, z: this.z0 + (Math.floor(cur / nx) + 0.5) * this.sel }); cur = asal[cur]; }
    titik.reverse();
    titik[titik.length - 1] = akhir;
    var rapi = [], ax2 = awal.x, az2 = awal.z, i = 0;
    while (i < titik.length) {
      var j = titik.length - 1;
      while (j > i && !this.garisBebas(ax2, az2, titik[j].x, titik[j].z)) j--;
      rapi.push(titik[j]); ax2 = titik[j].x; az2 = titik[j].z; i = j + 1;
    }
    return rapi;
  };

  root.Medan = { buat: buatMedan, buatAir: buatAir, Jalur: Jalur };
})(window);
