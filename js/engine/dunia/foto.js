/* Foto: potret dan kartu dirender dari model 3D kode lalu disimpan sebagai gambar. Bila gambar AI ada (ASET.img), gambar itu yang dipakai.
   Karena memakai model yang sama dengan dunia, potret selalu seragam gayanya. */
(function (root) {
  var B = Bentuk, W = Warna.W, campur = Warna.campur, gelap = Warna.gelap, PAL = Warna.PAL, M = B.M, gumpal = B.gumpal;
  var simpan = {}, adegan = null, pramuatan = [];

  function siapAdegan() {
    if (adegan) { while (adegan.children.length > 2) adegan.remove(adegan.children[2]); return adegan; }
    adegan = new THREE.Scene();
    adegan.add(new THREE.HemisphereLight(0xeaf8ff, 0xa89a78, 1.9));
    var s = new THREE.DirectionalLight(0xfff0cf, 2.1); s.position.set(-3, 5, 6);
    adegan.add(s);
    return adegan;
  }
  function kamera(fov, px, py, pz, tx, ty, tz) {
    var c = new THREE.PerspectiveCamera(fov, 1, 0.1, 60);
    c.position.set(px, py, pz); c.lookAt(tx, ty, tz);
    return c;
  }
  function benda(fn) { var R = new B.Rakit(7); fn(R); return R.jadi(Bahan.tetap()); }

  var GAMBAR = {
    potret: function (kunci, eks) {
      var sc = siapAdegan(), UK = 300;
      if (kunci === 'rako') {
        var r = new Rako(2.4), g = r.badan;
        g.rotation.x = -0.12;
        var sudut = eks === 'sorak' ? 1.05 : (eks === 'pikir' ? 0.3 : 0.55);
        r.sayap.forEach(function (sy) { sy.rotation.z = sy.userData.sisi * sudut; });
        if (eks === 'pikir') { g.rotation.z = 0.2; r.sayap[1].rotation.z = -0.25; }
        if (eks === 'sorak') g.position.y = 0.05;
        r.grup.rotation.y = 0.55;
        sc.add(r.grup);
        var u = Dunia.bidik(sc, kamera(26, 0, 0.45, 3.3, 0.14, 0.18, 0), UK, UK);
        r.buang();
        return u;
      }
      var t = new Tokoh(kunci, null);
      t.miring = -0.06;
      t.ekspresi(eks === 'senang' ? 'senang' : eks);
      t.anim = eks === 'sorak' ? 'sorak' : (eks === 'pikir' ? 'pikir' : (eks === 'sedih' ? 'sedih' : 'diam'));
      t.t = 0.4;
      for (var i = 0; i < 14; i++) { t.t = 0.4; t.kedip = 5; t.update(0.05); }
      t.grup.position.set(0, 0, 0); t.grup.rotation.y = 0.3;
      t.grup.updateMatrixWorld(true);
      var k = t.posKepala(), kp = k.y + t.s * 0.14;
      sc.add(t.grup);
      /* penutup kepala yang lebar butuh bingkai lebih longgar */
      var kk = t.d.kepala, longgar = t.d.caping || kk === 'helm' || kk === 'topi';
      var c = longgar ? kamera(21, 0, kp + 0.3, 4.5, 0.02, kp + 0.02, 0) : kamera(21, 0, kp + 0.1, 3.3, 0.02, kp - 0.12, 0), hasil = Dunia.bidik(sc, c, UK, UK);
      t.buang();
      return hasil;
    },
    kartu: {
      hutan: function () {
        return benda(function (R) {
          R.tambah(gumpal(1.5, 3, 1, 0.08), W(PAL.pucuk), M(0, -0.35, 0, 0, 0, 0, 1.3, 0.34, 1));
          Cadangan.pohon(R, -0.68, -0.1, -0.2, 0.4, 401); Cadangan.pohon(R, 0.72, -0.1, -0.1, 0.46, 411); Cadangan.pohon(R, 0.05, -0.05, 0.5, 0.34, 421);
        });
      },
      air: function () {
        return benda(function (R) {
          R.tambah(gumpal(1.5, 5, 1, 0.08), campur(W(PAL.toska), W(PAL.langit), 0.18), M(0, -0.25, 0.2, 0, 0, 0, 1.2, 0.2, 0.95));
          Cadangan.batu(R, -0.9, 0, -0.5, 1.5, 21); Cadangan.batu(R, 0.2, 0, -0.75, 2.1, 22); Cadangan.batu(R, 1.0, 0, -0.35, 1.3, 23);
          R.tambah(B.Tabung(0.1, 0.17, 0.9, 7), W(PAL.langit), M(0.2, 0.25, -0.3, 0.2, 0, 0));
        });
      },
      tanah: function () {
        return benda(function (R) {
          var tanah = gelap(W(PAL.bata), 0.72);
          R.tambah(B.Kotak(2.1, 0.9, 1.5), function (x, y) { return campur(gelap(W(PAL.bata), 0.55), W(PAL.bata), B.jepit((y + 0.5) / 0.9, 0, 1)); }, M(0, -0.45, 0), 0.06);
          R.tambah(gumpal(0.26, 4, 0, 0.1), tanah, M(-0.5, 0.05, 0.1, 0, 0, 0, 1.2, 0.5, 1));
          R.tambah(gumpal(0.24, 6, 0, 0.1), tanah, M(0.55, 0.05, -0.2, 0, 0, 0, 1.2, 0.5, 1));
          Cadangan.bibit(R, 0, 0, 0.1, 1.5); Cadangan.bibit(R, -0.5, 0, -0.35, 1); Cadangan.bibit(R, 0.55, 0, 0.3, 1.05);
        });
      },
      ikan: function () {
        return benda(function (R) {
          R.tambah(gumpal(1.35, 8, 1, 0.05), campur(W(PAL.toska), W(PAL.langit), 0.3), M(0, -0.65, 0, 0, 0, 0, 1.2, 0.24, 1));
          Cadangan.ikan(R, -0.45, 0.25, 0.1, 2.4, W(PAL.kunyit), 0.2);
          Cadangan.ikan(R, 0.6, 0.55, -0.2, 2.1, W(PAL.bata), -0.2);
          Cadangan.ikan(R, 0.3, -0.25, 0.45, 2.2, W(PAL.kertas), 0.1);
        });
      },
      tambang: function () {
        return benda(function (R) {
          var abu = new THREE.Color(0x8A8373), abu2 = new THREE.Color(0xB8B09D), emas = W(PAL.kunyit), hitam = new THREE.Color(0x2A2A2A);
          R.tambah(gumpal(1.1, 12, 1, 0.22), function (x, y) { return campur(abu, abu2, B.jepit((y + 0.6) / 1.5, 0, 1)); }, M(0, -0.05, 0, 0, 0.4, 0, 1.2, 0.92, 1));
          R.tambah(gumpal(0.2, 14, 0, 0.1), emas, M(-0.42, 0.25, 0.82));
          R.tambah(gumpal(0.15, 15, 0, 0.1), emas, M(0.12, 0.5, 0.8));
          R.tambah(gumpal(0.17, 16, 0, 0.1), emas, M(0.5, 0.05, 0.86));
          R.tambah(gumpal(0.32, 17, 0, 0.14), hitam, M(1.05, -0.55, 0.5));
          R.tambah(gumpal(0.24, 18, 0, 0.14), hitam, M(0.65, -0.65, 0.85));
        });
      },
      batubara: function () {
        return benda(function (R) {
          var hitam = new THREE.Color(0x26282A);
          R.tambah(gumpal(1.2, 12, 1, 0.2), new THREE.Color(0x4A4A48), M(0, -0.6, 0, 0, 0, 0, 1.2, 0.45, 1));
          [[-0.45, -0.1, 0.2, 0.5], [0.4, -0.05, 0.1, 0.55], [0, 0.35, -0.05, 0.5], [0.1, -0.2, 0.7, 0.34]].forEach(function (b, i) { R.tambah(gumpal(b[3], 40 + i, 0, 0.18), hitam, M(b[0], b[1], b[2])); });
        });
      },
      angin: function () {
        return benda(function (R) {
          var c = W(PAL.kertas), i, a;
          R.tambah(B.Tabung(0.07, 0.14, 1.9, 8), c, M(0, -0.35, 0), 0);
          for (i = 0; i < 3; i++) { a = i / 3 * Math.PI * 2; R.tambah(B.Kotak(0.18, 0.95, 0.05), c, M(Math.sin(a) * 0.52, 0.62 + Math.cos(a) * 0.52, 0.12, 0, 0, -a), 0); }
          R.tambah(B.Bola(0.14, 10, 8), W(PAL.toska), M(0, 0.62, 0.16), 0);
        });
      },
      matahari: function () {
        return benda(function (R) {
          var k = W(PAL.kunyit), i, a;
          R.tambah(B.Bola(0.7, 14, 10), k, M(0, 0.2, 0), 0);
          for (i = 0; i < 8; i++) { a = i / 8 * Math.PI * 2; R.tambah(B.Kerucut(0.16, 0.42, 5), k, M(Math.sin(a) * 1.05, 0.2 + Math.cos(a) * 1.05, 0, 0, 0, -a), 0); }
        });
      },
      rangkong: function () { var r = new Rako(2.2); r.sayap.forEach(function (s) { s.rotation.z = s.userData.sisi * 0.3; }); r.grup.rotation.y = 0.6; r.badan.rotation.x = -0.1; return r.grup; },
      kupu: function () {
        return benda(function (R) {
          var k = W(PAL.kunyit), b = W(PAL.bata), t = W(PAL.tinta), c = W(PAL.kertas);
          [-1, 1].forEach(function (s) {
            R.tambah(gumpal(0.72, 4, 1, 0.04), k, M(s * 0.68, 0.42, 0, -0.34, 0, s * -0.35, 1, 0.85, 0.12), 0.02);    // sayap atas, menghadap kamera
            R.tambah(gumpal(0.5, 6, 1, 0.04), b, M(s * 0.5, -0.38, 0, -0.34, 0, s * 0.4, 1, 0.9, 0.12), 0.02);        // sayap bawah
            R.tambah(gumpal(0.2, 7, 0, 0.02), c, M(s * 0.82, 0.54, 0.12, -0.34, 0, 0, 1, 1, 0.3), 0);                 // bintik sayap
            R.tambah(gumpal(0.12, 8, 0, 0.02), t, M(s * 0.42, 0.7, 0.14, -0.34, 0, 0, 1, 1, 0.3), 0);
            R.tambah(gumpal(0.13, 9, 0, 0.02), c, M(s * 0.5, -0.4, 0.14, -0.34, 0, 0, 1, 1, 0.3), 0);
            R.tambah(B.Tabung(0.02, 0.02, 0.6, 4), t, M(s * 0.17, 1.04, 0.3, -0.34, 0, s * -0.5), 0);                 // antena
            R.tambah(gumpal(0.055, 3, 0, 0.02), t, M(s * 0.32, 1.3, 0.38), 0);
          });
          R.tambah(gumpal(0.14, 11, 0, 0.02), t, M(0, 0.04, 0.12, -0.34, 0, 0, 0.8, 5, 0.9), 0);                      // badan
          R.tambah(gumpal(0.16, 12, 0, 0.02), t, M(0, 0.76, 0.3), 0);                                                  // kepala
        });
      },
      capung: function () {
        return benda(function (R) {
          R.tambah(gumpal(1.35, 8, 1, 0.05), campur(W(PAL.toska), W(PAL.langit), 0.3), M(0, -0.75, 0, 0, 0, 0, 1.2, 0.18, 1));
          Cadangan.capung(R, 0, 0.45, 0, 3.2);
        });
      },
      katak: function () {
        return benda(function (R) {
          R.tambah(gumpal(1.35, 8, 1, 0.05), campur(W(PAL.toska), W(PAL.langit), 0.3), M(0, -0.45, 0, 0, 0, 0, 1.2, 0.16, 1));
          R.tambah(gumpal(0.85, 9, 1, 0.05), W(PAL.pucuk), M(0.05, -0.32, 0.1, 0, 0, 0, 1.1, 0.1, 1));
          Cadangan.katak(R, 0.05, -0.26, 0.15, 3.2);
        });
      },
      kuntul: function () {
        return benda(function (R) {
          R.tambah(gumpal(1.35, 8, 1, 0.05), campur(W(PAL.toska), W(PAL.langit), 0.3), M(0, -0.8, 0, 0, 0, 0, 1.2, 0.14, 1));
          Cadangan.kuntul(R, -0.1, -0.72, 0, 1.95, 0.7);
          Cadangan.padi(R, -0.95, -0.72, -0.2, B.acak(3)); Cadangan.padi(R, 0.95, -0.72, -0.2, B.acak(4));
        });
      },
      penyu: function () {
        return benda(function (R) {
          R.tambah(gumpal(1.35, 8, 1, 0.05), campur(W(PAL.toska), W(PAL.langit), 0.35), M(0, -0.72, 0, 0, 0, 0, 1.2, 0.14, 1));
          Cadangan.penyu(R, 0, 0.1, 0.1, 2, 0.5);
        });
      },
      kakatua: function () {
        return benda(function (R) {
          R.tambah(gumpal(1.35, 8, 1, 0.05), campur(W(PAL.toska), W(PAL.langit), 0.35), M(0, -0.8, 0, 0, 0, 0, 1.2, 0.14, 1));
          Cadangan.karang(R, -0.8, -0.72, -0.3, 1, 11, W(PAL.bata));
          Cadangan.ikanKakatua(R, 0.05, 0.2, 0.25, 2.3, Math.PI / 2 - 0.4);
        });
      },
      karang: function () {
        return benda(function (R) {
          R.tambah(gumpal(1.35, 8, 1, 0.05), campur(W(PAL.kertas), W(PAL.kunyit), 0.2), M(0, -0.7, 0, 0, 0, 0, 1.2, 0.16, 1));
          Cadangan.karang(R, -0.45, -0.58, 0, 1.6, 21, W(PAL.bata));
          Cadangan.karang(R, 0.55, -0.58, -0.1, 1.35, 22, W(PAL.kunyit));
          Cadangan.karang(R, 0.1, -0.6, 0.6, 1, 23, W(PAL.pucuk));
        });
      },
      bunga: function () {
        return benda(function (R) {
          R.tambah(gumpal(1.35, 8, 1, 0.08), W(PAL.pucuk), M(0, -0.72, 0, 0, 0, 0, 1.2, 0.2, 1));
          [[-0.5, 0, 2.6, W(PAL.kunyit)], [0.15, -0.3, 3.2, W(PAL.kertas)], [0.65, 0.2, 2.5, W(PAL.bata)], [-0.1, 0.5, 2.2, W(PAL.kunyit)]].forEach(function (b, i) {
            R.tambah(B.Tabung(0.02, 0.03, 0.75 * b[2] / 2.6, 4), W(PAL.zamrud), M(b[0], -0.28 * b[2] / 2.6, b[1]));
            R.tambah(gumpal(0.2 * b[2] / 2.6, 30 + i, 0, 0.06), b[3], M(b[0], 0.12 * b[2] / 2.6, b[1], 0, 0, 0, 1, 0.7, 1));
          });
        });
      },
      kunang: function () {
        return benda(function (R) {
          R.tambah(gumpal(1.35, 8, 1, 0.08), campur(W(PAL.zamrud), W(PAL.tinta), 0.5), M(0, -0.75, 0, 0, 0, 0, 1.2, 0.18, 1));
          Cadangan.kunang(R, -0.1, 0.4, 0.1, 5); Cadangan.kunang(R, 0.75, 0.05, -0.2, 3); Cadangan.kunang(R, -0.8, -0.1, 0.3, 2.6);
        });
      }
    }
  };

  var Foto = {
    /* potret tokoh sebagai data URL. eks: senang|pikir|sorak (anak dan Rako), senang|sedih (warga) */
    potret: function (kunci, eks) {
      eks = eks || 'senang';
      var id = 'por_' + kunci + '_' + eks, gb = root.ASET && ASET.img;
      /* tokoh yang punya gambar AI tidak pernah dicampur dengan potret kode: ekspresi yang tidak ada memakai wajah senangnya */
      if (gb && (gb[id] || gb['por_' + kunci + '_senang'])) return 'assets/img/' + (gb[id] || gb['por_' + kunci + '_senang']);
      if (simpan[id]) return simpan[id];
      var u = null;
      try { u = GAMBAR.potret(kunci, eks); } catch (e) { u = null; }
      if (u) simpan[id] = u;   // gagal (mis. konteks WebGL hilang): dicoba lagi lain kali
      return u;
    },
    /* gambar kartu sumber daya atau satwa sebagai data URL */
    kartu: function (kunci) {
      var id = 'kartu_' + kunci;
      if (root.ASET && ASET.img && ASET.img[id]) return 'assets/img/' + ASET.img[id];
      if (simpan[id]) return simpan[id];
      var u = null;
      try {
        var sc = siapAdegan(), o = GAMBAR.kartu[kunci]();
        sc.add(o);
        u = Dunia.bidik(sc, kamera(24, 0, 2.2, 6.2, 0, 0.3, 0), 300, 300);
        o.traverse(function (x) { if (x.isSkinnedMesh) x.skeleton.dispose(); if (x.isMesh) x.geometry.dispose(); });
      } catch (e) { u = null; }
      if (u) simpan[id] = u;
      return u;
    },
    /* potret dan kartu AI dimuat lebih dulu, supaya tidak berkedip saat pertama tampil */
    pramuat: function () {
      var gb = root.ASET && ASET.img;
      if (!gb) return;
      Object.keys(gb).forEach(function (id) {
        if (!/^(por|kartu|ikon|lok|lencana|meter|lompat)_/.test(id)) return;
        var im = new Image(); im.src = 'assets/img/' + gb[id]; pramuatan.push(im);
      });
    }
  };
  root.Foto = Foto;
})(window);
