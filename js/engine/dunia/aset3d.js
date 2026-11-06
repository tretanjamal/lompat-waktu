/* Aset3D: model dari Meshy yang sudah diproses tools/proses-3d.js, satu berkas js/data/model3d/<kunci>.js per model, dimuat lewat <script> supaya jalan di file://.
   Kunci yang belum ada atau gagal dimuat memakai cadangan dari kode. ?noaset=1 memaksa cadangan. Warna disimpan sRGB, di sini diubah ke linear. */
(function (root) {
  var paksaCadangan = /[?&]noaset=1/.test(location.search);
  var dimuat = {};
  var LINEAR = new Float32Array(256);
  for (var q = 0; q < 256; q++) { var c = q / 255; LINEAR[q] = c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }

  function keArray(b64, Jenis) {
    var bin = atob(b64), u = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    return new Jenis(u.buffer);
  }
  function geometri(d) {
    var n = d.n, Pq = keArray(d.p, Uint16Array), No = keArray(d.o, Int8Array), Cq = keArray(d.c, Uint8Array), P = new Float32Array(n * 3), N = new Float32Array(n * 3), C = new Float32Array(n * 3), i, k;
    for (i = 0; i < n; i++) for (k = 0; k < 3; k++) {
      P[i * 3 + k] = d.m[k] + Pq[i * 3 + k] / 65535 * d.s[k];
      N[i * 3 + k] = No[i * 3 + k] / 127;
      C[i * 3 + k] = LINEAR[Cq[i * 3 + k]];
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(P, 3));
    g.setAttribute('normal', new THREE.BufferAttribute(N, 3));
    g.setAttribute('color', new THREE.BufferAttribute(C, 3));
    g.setIndex(new THREE.BufferAttribute(keArray(d.i, n > 65535 ? Uint32Array : Uint16Array), 1));
    if (d.j) {
      g.setAttribute('skinIndex', new THREE.BufferAttribute(keArray(d.j, Uint8Array), 4));
      g.setAttribute('skinWeight', new THREE.BufferAttribute(keArray(d.w, Uint8Array), 4, true));
    }
    return g;
  }

  var Aset3D = {
    data: {},    // kunci -> isi berkas model
    geo: {},     // kunci -> geometri siap pakai sesuai tingkat kualitas
    murah: {},   // kunci -> geometri versi murah
    jauh: {},    // kunci -> geometri versi sangat murah, untuk pohon di kejauhan
    daftar: function (kunci, isi) { Aset3D.data[kunci] = isi; },
    ada: function (kunci) { return !paksaCadangan && !!Aset3D.data[kunci]; },
    /* rincian: 0 penuh, 1 murah, 2 sangat murah (bila ada), dibuat sekali. */
    geoDari: function (kunci, rincian) {
      var d = Aset3D.data[kunci], r = rincian === true ? 1 : (rincian || 0);
      if (r === 2 && !d.c) r = 1;
      var tempat = r === 2 ? Aset3D.jauh : (r === 1 ? Aset3D.murah : Aset3D.geo);
      if (!tempat[kunci]) tempat[kunci] = geometri(r === 2 ? d.c : (r === 1 ? d.b : d.a));
      return tempat[kunci];
    },
    /* tingkat Hemat selalu satu langkah lebih murah */
    ambil: function (kunci, rincian) {
      var r = rincian === true ? 1 : (rincian || 0);
      return Aset3D.geoDari(kunci, root.Dunia && Dunia.tingkat === 'hemat' ? Math.min(2, r + 1) : r);
    },
    /* gambar sampah: data URI di berkas js/data/model3d/spr_*.js, karena WebGL menolak tekstur dari file:// */
    tekstur: {},
    gambar: function (kunci) {
      if (!Aset3D.tekstur[kunci]) {
        var t = new THREE.TextureLoader().load(Aset3D.data[kunci].sprite);
        t.colorSpace = THREE.SRGBColorSpace;
        Aset3D.tekstur[kunci] = t;
      }
      return Aset3D.tekstur[kunci];
    },
    /* data tambahan model: ukuran (u), sendi tokoh (t) */
    info: function (kunci) { return Aset3D.data[kunci]; },
    /* onSatu dipanggil tiap satu berkas selesai, untuk batang kemajuan */
    muat: function (daftar, onSatu) {
      if (paksaCadangan) return Promise.resolve();
      return Promise.all(daftar.map(function (k) {
        return dimuat[k] || (dimuat[k] = new Promise(function (ok) {
          var s = document.createElement('script');
          s.src = 'js/data/model3d/' + k + '.js'; s.onload = s.onerror = function () { if (onSatu) onSatu(); ok(); };   // gagal: cadangan
          document.head.appendChild(s);
        }));
      }));
    },
    /* model satu zona menurut ASET.model. Tidak ada data = langsung selesai. */
    muatZona: function (zona, onSatu) { return Aset3D.muat((root.ASET && ASET.model && ASET.model[zona]) || [], onSatu); }
  };
  root.Aset3D = Aset3D;
})(window);
