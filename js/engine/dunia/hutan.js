/* Hutan: pohon lewat InstancedMesh, mengikuti nilai simulasi. Tiap slot punya ambang: bila nilai hutan di bawah ambang, pohon tumbang
   menjadi tunggul; bila di atas, pohon tumbuh. Jadi gambar di layar selalu cocok dengan angka model. Bisa juga ditebang satu per satu. */
(function (root) {
  var m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), s = new THREE.Vector3();

  /* o: scene, dekat dan jauh: [{x,z,s}] pohon yang sudah ada; calon dan calonJauh: tumbuh hanya bila hutan bertambah. Yang jauh memakai model murah. tinggi(x,z), bahan */
  function Hutan(o) {
    var diri = this, rng = Bentuk.acak(77);
    this.tinggi = o.tinggi;
    this.nilai = o.nilaiAwal === undefined ? 70 : o.nilaiAwal;
    this.slot = [];
    function tambah(list, jenis) {
      list.forEach(function (t, i) {
        var punya = jenis === 'dekat' || jenis === 'jauh';
        diri.slot.push({
          id: i, jenis: jenis, x: t.x, y: o.tinggi(t.x, t.z), z: t.z, s: t.s, ry: rng() * 6.28,
          ambangAsli: punya ? 3 + rng() * (diri.nilai - 5) : diri.nilai + 2 + rng() * (100 - diri.nilai - 3),
          punyaTunggul: punya, ditebang: false, kadar: punya ? 1 : 0, tuju: punya ? 1 : 0, rebah: 0, aRebah: 0
        });
      });
    }
    tambah(o.dekat, 'dekat'); tambah(o.jauh || [], 'jauh'); tambah(o.calon || [], 'calon'); tambah(o.calonJauh || [], 'calonJauh');
    this.slot.forEach(function (t) { t.ambang = t.ambangAsli; });
    var dekat = this.slot.filter(function (t) { return t.jenis === 'dekat' || t.jenis === 'calon'; }), jauh = this.slot.filter(function (t) { return t.jenis === 'jauh' || t.jenis === 'calonJauh'; });
    var bahan = o.bahan || Bahan.pulih();
    this.mDekat = new THREE.InstancedMesh(Cadangan.geoPohon(false), bahan, Math.max(1, dekat.length));
    this.tDekat = new THREE.InstancedMesh(Cadangan.geoTunggul(false), bahan, Math.max(1, dekat.length));
    this.mJauh = new THREE.InstancedMesh(Cadangan.geoPohon(true), bahan, Math.max(1, jauh.length));
    this.tJauh = new THREE.InstancedMesh(Cadangan.geoTunggul(true), bahan, Math.max(1, jauh.length));
    [this.mDekat, this.tDekat, this.mJauh, this.tJauh].forEach(function (m) { m.frustumCulled = false; o.scene.add(m); });
    /* mesh tanpa isi tidak perlu digambar; tanpaTunggul: pulau di kejauhan, tunggul terlalu kecil untuk terlihat */
    this.mDekat.visible = this.tDekat.visible = dekat.length > 0;
    this.mJauh.visible = this.tJauh.visible = jauh.length > 0;
    if (o.tanpaTunggul) this.tDekat.visible = this.tJauh.visible = false;
    dekat.forEach(function (t, i) { t.iM = i; t.m = diri.mDekat; t.t = diri.tDekat; });
    jauh.forEach(function (t, i) { t.iM = i; t.m = diri.mJauh; t.t = diri.tJauh; });
    this.slot.forEach(function (t) { diri._gambar(t); });
    this._tandai();
  }
  Hutan.prototype._gambar = function (t) {
    var u = t.kadar <= 0.01 ? 0.0001 : t.s * (0.15 + 0.85 * t.kadar);
    p.set(t.x, t.y - 0.05, t.z);
    if (t.rebah > 0.001) q.setFromEuler(e.set(Math.cos(t.aRebah) * t.rebah, t.ry, Math.sin(t.aRebah) * t.rebah, 'YXZ'));
    else q.setFromEuler(e.set(0, t.ry, 0));
    m4.compose(p, q, s.set(u, u, u));
    t.m.setMatrixAt(t.iM, m4);
    var ut = (t.punyaTunggul || t.ditebang) && (t.kadar < 0.92 || t.rebah > 0) ? t.s * 1.02 : 0.0001;
    p.set(t.x, t.y, t.z);
    q.setFromEuler(e.set(0, t.ry, 0));
    m4.compose(p, q, s.set(ut, ut, ut));
    t.t.setMatrixAt(t.iM, m4);
    t.gambarBaru = true;
  };
  Hutan.prototype._tandai = function () {
    this.mDekat.instanceMatrix.needsUpdate = true; this.tDekat.instanceMatrix.needsUpdate = true;
    this.mJauh.instanceMatrix.needsUpdate = true; this.tJauh.instanceMatrix.needsUpdate = true;
  };
  /* nilai simulasi 0-100 */
  Hutan.prototype.terapkan = function (nilai) {
    this.nilai = nilai;
    for (var i = 0; i < this.slot.length; i++) { var t = this.slot[i]; if (!t.animasi) t.tuju = nilai >= t.ambang ? 1 : 0; }
  };
  Hutan.prototype.update = function (dt) {
    var ubah = false, i, t;
    for (i = 0; i < this.slot.length; i++) {
      t = this.slot[i];
      if (t.animasi) continue;
      if (Math.abs(t.kadar - t.tuju) > 0.002) {
        var laju = t.tuju > t.kadar ? 0.9 : 3.2;
        t.kadar += Math.sign(t.tuju - t.kadar) * Math.min(Math.abs(t.tuju - t.kadar), laju * dt * Hutan.lajuWaktu);
        this._gambar(t); ubah = true;
      }
    }
    if (ubah) this._tandai();
  };
  Hutan.lajuWaktu = 1;
  /* tebang satu pohon dekat: rebah menjauhi penebang lalu hilang, tunggul tertinggal */
  Hutan.prototype.tebang = function (t, dariX, dariZ) {
    var diri = this;
    t.animasi = true; t.ditebang = true;
    t.aRebah = Math.atan2(t.x - dariX, t.z - dariZ);
    return Tween.run(620, function (ek) { t.rebah = ek * 1.5; diri._gambar(t); diri._tandai(); }, function (x) { return x * x; }).then(function () {
      return Tween.run(240, function (ek) { t.kadar = 1 - ek; diri._gambar(t); diri._tandai(); }, Ease.linear);
    }).then(function () {
      t.rebah = 0; t.kadar = 0; t.tuju = 0; t.animasi = false;
      t.ambang = Math.max(t.ambangAsli, diri.nilai + 3 + Math.random() * 18);   // baru tumbuh lagi bila hutan betul-betul bertambah
      diri._gambar(t); diri._tandai();
    });
  };
  /* semua kembali ke hari ini */
  Hutan.prototype.pulihkan = function (nilaiAwal) {
    this.nilai = nilaiAwal;
    for (var i = 0; i < this.slot.length; i++) {
      var t = this.slot[i];
      t.ditebang = false; t.animasi = false; t.rebah = 0; t.ambang = t.ambangAsli;
      t.kadar = t.tuju = nilaiAwal >= t.ambang ? 1 : 0;
      this._gambar(t);
    }
    this._tandai();
  };
  root.Hutan = Hutan;
})(window);
