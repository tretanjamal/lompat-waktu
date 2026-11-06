/* Partikel: serpihan faset kecil lewat InstancedMesh (daun, tanah, kilau, hujan). Satu draw call, tanpa alokasi saat jalan. */
(function (root) {
  var m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), s = new THREE.Vector3(), warna = new THREE.Color();

  function Partikel(scene, jumlah) {
    jumlah = jumlah || 160;
    var geo = new THREE.IcosahedronGeometry(1, 0);
    this.mesh = new THREE.InstancedMesh(geo, new THREE.MeshLambertMaterial({ flatShading: true }), jumlah);
    this.mesh.frustumCulled = false;
    this.mesh.count = 0;
    this.mesh.setColorAt(0, warna.set(0xffffff));
    this.n = jumlah;
    this.a = [];
    for (var i = 0; i < jumlah; i++) this.a.push({ hidup: 0, umur: 0, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, g: 0, u: 0, c: 0xffffff, rx: 0, ry: 0 });
    this.berikut = 0;
    scene.add(this.mesh);
  }
  /* o: x,y,z, n, warna[], laju, naik, g (gravitasi), ukuran, umur, sebar */
  Partikel.prototype.semprot = function (o) {
    var warnaList = o.warna || [Warna.PAL.pucuk, Warna.PAL.kunyit], jml = o.n || 12;
    for (var i = 0; i < jml; i++) {
      var d = this.a[this.berikut];
      this.berikut = (this.berikut + 1) % this.n;
      var sudut = Math.random() * Math.PI * 2, laju = (o.laju === undefined ? 2 : o.laju) * (0.4 + Math.random() * 0.8), sebar = o.sebar || 0;
      d.x = o.x + (Math.random() - 0.5) * sebar; d.y = o.y; d.z = o.z + (Math.random() - 0.5) * sebar;
      d.vx = Math.cos(sudut) * laju; d.vz = Math.sin(sudut) * laju; d.vy = (o.naik === undefined ? 3 : o.naik) * (0.5 + Math.random() * 0.8);
      d.g = o.g === undefined ? 7 : o.g;
      d.u = (o.ukuran || 0.09) * (0.6 + Math.random() * 0.7);
      d.umur = d.hidup = (o.umur || 0.9) * (0.7 + Math.random() * 0.6);
      d.c = warnaList[Math.floor(Math.random() * warnaList.length)];
      d.rx = Math.random() * 6; d.ry = Math.random() * 6;
      this.warnaBaru = true;
    }
  };
  Partikel.prototype.update = function (dt) {
    var n = 0, list = this.a, warnaBaru = this.warnaBaru;
    for (var i = 0; i < list.length; i++) {
      var d = list[i];
      if (d.hidup <= 0) continue;
      d.hidup -= dt;
      d.vy -= d.g * dt;
      d.x += d.vx * dt; d.y += d.vy * dt; d.z += d.vz * dt;
      d.rx += dt * 3; d.ry += dt * 4;
      var k = Math.min(1, d.hidup / d.umur * 2.2), u = d.u * k;
      p.set(d.x, d.y, d.z); q.setFromEuler(e.set(d.rx, d.ry, 0)); s.set(u, u, u);
      m4.compose(p, q, s);
      this.mesh.setMatrixAt(n, m4);
      this.mesh.setColorAt(n, warna.set(d.c));
      n++;
    }
    this.mesh.count = n;
    if (n) {
      this.mesh.instanceMatrix.needsUpdate = true;
      if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
    }
    this.warnaBaru = false;
  };
  Partikel.prototype.buang = function () { this.mesh.geometry.dispose(); this.mesh.dispose(); };
  root.Partikel = Partikel;
})(window);
