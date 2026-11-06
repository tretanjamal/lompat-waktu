/* Peta Pulau: diorama seluruh pulau. Zona yang pulih berwarna, yang belum pudar. Misi terbuka berurutan; gembok bisa diketuk dan menjelaskan syaratnya. Di layar nomor misi = nomor bab + 1. */
(function () {
  var ADEGAN = { 0: 'bab0', 1: 'bab1', 2: 'bab2', 3: 'bab3', 4: 'bab4', 5: 'bab5' };
  var bar = null;
  /* jalur titik-titik antarlokasi. Bagian yang sudah dilewati berwarna, bagian menuju misi berikutnya bergerak. */
  function jalurPeta(titik) {
    var h = '', i;
    for (i = 0; i < titik.length - 1; i++) {
      var a = titik[i], b = titik[i + 1], t = i % 2 ? 0.14 : -0.14, cx = (a.x + b.x) / 2 - (b.y - a.y) * t, cy = (a.y + b.y) / 2 + (b.x - a.x) * t;
      var d = 'M' + a.x.toFixed(0) + ' ' + a.y.toFixed(0) + 'Q' + cx.toFixed(0) + ' ' + cy.toFixed(0) + ' ' + b.x.toFixed(0) + ' ' + b.y.toFixed(0);
      var kelas = !Save.selesaiBab(i) ? 'depan' : (Save.selesaiBab(i + 1) ? 'lewat' : 'menuju');
      h += '<path class="alas" d="' + d + '"/><path class="' + kelas + '" d="' + d + '"/>';
    }
    return '<svg class="lapis jalur-peta" viewBox="0 0 1280 720" width="1280" height="720" aria-hidden="true">' + h + '</svg>';
  }
  function warnaZona() {
    var semua = Object.keys(Pulau.ZONA).every(function (n) { return Save.selesaiBab(+n); });
    var i = Warna.petaPulau(Pulau.ZONA, Save.selesaiBab);
    Warna.U.uLunak.value = 3;
    if (i === 0 && !semua) Warna.atur(0, Pulau.ZONA[0].x, Pulau.ZONA[0].z, 2);   // sedikit warna di tanjung, tempat bermula
  }
  Scenes.add('peta', {
    enter: function (akar, p) {
      var T = STR.peta;
      Pulau.siapkan();
      Pulau.kameraPeta();
      warnaZona();
      Aud.musik('judul'); Aud.ambien('pantai');
      akar.appendChild(U.h('div', 'lapis peta-judul', T.judul));
      var selesai = Object.keys(Save.data.bab).filter(function (n) { return Save.selesaiBab(+n); }).length, ruas = '', i;
      for (i = 0; i < 6; i++) ruas += '<i class="' + (i < selesai ? 'isi' : '') + '"></i>';
      akar.appendChild(U.h('div', 'lapis jejak kena', U.fmt(T.jejak, { n: selesai }) + '<div class="ruas">' + ruas + '</div>'));
      var berikut = -1;
      for (i = 0; i <= 5; i++) if (!Save.selesaiBab(i) && Save.terbuka(i)) { berikut = i; break; }
      var titik = [], tombol = [];
      Object.keys(Pulau.ZONA).forEach(function (kn) {
        var n = +kn, z = Pulau.ZONA[n], layar = Dunia.keLayar(z.x, Pulau.tinggi(z.x, z.z), z.z), buka = Save.terbuka(n), sls = Save.selesaiBab(n), b = Save.data.bab[n];
        var medali = UI.gambar('lok_' + Lencana.KUNCI[n], 'lok');
        var isi = medali + '<span class="no">' + (n + 1) + '</span><span class="nama">' + STR.bab[n].nama + '</span>';
        if (sls && medali) isi += Lencana.gambar(n, 'lencana-peta');
        if (sls && n > 0) {
          var bt = ''; for (var k = 1; k <= 3; k++) bt += UI.icon(b.stars >= k ? 'bintang' : 'bintangKosong', 21);
          isi += '<span class="bintang">' + bt + '</span>';
        } else if (!buka) isi += '<span class="bintang">' + UI.icon('gembok', 21) + '</span>';
        var tb = Input.button(isi, 'tanda-bab' + (medali ? ' bergambar' : '') + (sls ? ' selesai' : '') + (buka ? '' : ' kunci') + (n === berikut ? ' saran' : ''), function () {
          if (!buka) { Aud.sfx('gembok'); tb.classList.remove('goyang'); void tb.offsetWidth; tb.classList.add('goyang'); UI.toast(U.fmt(T.terkunci, { n: n })); return; }
          if (!ADEGAN[n]) { Aud.sfx('gembok'); UI.toast(T.segera); return; }
          Scenes.go(ADEGAN[n]);
        }, { id: 'bab-' + n, aria: STR.bab[n].nama + (buka ? '' : '. ' + U.fmt(T.terkunci, { n: n })) });
        tb.style.left = layar.x + 'px'; tb.style.top = layar.y + 'px';
        tombol.push(tb);
        titik.push({ x: layar.x, y: layar.y - (medali ? 22 : 0) });   // jalur bertemu di tengah medali
      });
      akar.appendChild(U.h('div', 'lapis', jalurPeta(titik)));
      tombol.forEach(function (tb) { akar.appendChild(tb); });
      var bw = U.h('div', 'peta-bawah');
      bw.appendChild(Input.button(T.beranda, 'bata', function () { Scenes.go('judul'); }, { id: 'beranda' }));
      bw.appendChild(Input.button(T.ganti, 'zamrud', function () { Peta.pilihPenjaga(); }, { id: 'ganti' }));
      bw.appendChild(Input.button(UI.icon('jurnal', 38) + T.jurnal, 'kertas', function () { Jurnal.buka(Jurnal.terakhir); }, { id: 'peta-jurnal' }));
      akar.appendChild(bw);
      bar = UI.iconBar(akar);
      var saran = akar.querySelector('.saran');
      if (saran) setTimeout(function () { saran.focus({ preventScroll: true }); }, 60);
    },
    update: function (dt) { Pulau.update(dt, 'peta'); },
    exit: function () { Warna.U.uLunak.value = 2.4; if (bar && bar._cleanup) bar._cleanup(); bar = null; }
  });

  window.Peta = {
    /* pilih penjaga: dipakai setelah hook pertama dan dari Peta Pulau */
    pilihPenjaga: function () {
      var T = STR.pilihHero;
      return new Promise(function (ok) {
        var o = UI.overlay(T.judul, 'pilih-hero'), baris = U.h('div', 'baris');
        ['laras', 'bayu', 'dewi'].forEach(function (k) {
          var b = Input.button('<img alt="" src="' + (Foto.potret(k, 'senang') || '') + '" draggable="false"><span>' + T[k] + '</span>', 'hero', function () {
            Save.data.hero = k; Save.save();
            Aud.sfx('good');
            o.close(); ok(k);
          }, { id: 'hero-' + k });
          baris.appendChild(b);
        });
        o.body.appendChild(baris);
        o.body.appendChild(U.h('div', 'hint', T.hint));
      });
    }
  };
})();
