/* Jurnal Penjaga: terisi otomatis dengan percobaan, grafik, foto Lompat Waktu, kartu, dan catatan. Foto dan riwayat hanya di memori, tidak disimpan. */
(function (root) {
  var POLA = ['0', '10 6', '3 6', '16 8'], WARNA = ['#1F8A5B', '#1592A8', '#B9653A', '#16352C'];
  var KARTU = ['hutan', 'air', 'tanah', 'ikan', 'tambang', 'batubara', 'angin', 'matahari'], SATWA = ['rangkong', 'kupu', 'capung', 'katak', 'kuntul', 'penyu', 'kakatua', 'karang', 'bunga', 'kunang'];
  var Jurnal = {
    sesi: {},   // bab -> daftar percobaan {tindakan, kolom[], indikator[], tebakan, akhir, riwayat, foto, kelas}
    terakhir: 1,
    catat: function (bab, p) {
      (Jurnal.sesi[bab] = Jurnal.sesi[bab] || []).push(p);
      Jurnal.terakhir = bab;
      var b = Save.data.bab[bab] || (Save.data.bab[bab] = { selesai: false, stars: 0, kilat: false });
      b.lompat = (b.lompat || 0) + 1;
      Save.save();
    },
    jumlah: function (bab) { return (Jurnal.sesi[bab] || []).length; },
    buka: function (bab) {
      var T = STR.jurnal, o = UI.overlay(T.judul, 'jurnal'), daftar = Jurnal.sesi[bab] || [], jeda = root.Arena && !Arena.mati;
      Voice.stop();
      if (jeda) Tween.paused = true;
      var halaman = [
        { id: 'coba', label: T.tabs.coba, html: function () { return Jurnal._coba(daftar); } },
        { id: 'grafik', label: T.tabs.grafik, html: function () { return Jurnal._grafik(daftar); } },
        { id: 'kartu', label: T.tabs.kartu, html: function () { return Jurnal._kartu(); } },
        { id: 'catatan', label: T.tabs.catatan, html: function () { return Jurnal._catatan(); } }
      ];
      /* hadiah akhir gim: terbuka setelah Bab 5 selesai */
      if (Jurnal.adaMasa() && Save.data.bab[5] && Save.data.bab[5].selesai) halaman.push({ id: 'masa', label: T.tabs.masa, html: function () { return Jurnal._masa(); } });
      UI.tabs(o.body, halaman);
      o.body.appendChild(U.h('div', 'model-label', STR.hud.model));
      var t = Input.button(STR.settings.close, 'zamrud tombol-tutup', function () { o.close(); if (jeda) Tween.paused = false; }, { id: 'tutup-jurnal' });
      o.body.appendChild(t);
      setTimeout(function () { t.focus({ preventScroll: true }); }, 30);
    },
    adaMasa: function () { return !!(ASET.img.adegan_boros && ASET.img.adegan_bijak); },
    /* dua gambar masa depan berdampingan, dipakai di akhir Bab 5 dan di Jurnal */
    _masa: function () {
      var T = STR.bab5.adegan;
      function satu(g, j, isi) { return '<figure><img alt="' + j + '" draggable="false" src="assets/img/' + g + '"><figcaption><b>' + j + '</b>' + isi + '</figcaption></figure>'; }
      return '<div class="dua-masa">' + satu(ASET.img.adegan_boros, T.boros, T.borosIsi) + satu(ASET.img.adegan_bijak, T.bijak, T.bijakIsi) + '</div><div class="masa-catatan">' + T.catatan + '</div>';
    },
    _tindakan: function (p) { return p.tindakan || (p.semua ? STR.jurnal.semua : U.fmt(STR.jurnal.tindakan, { n: p.n, m: p.m })); },
    _coba: function (daftar) {
      var T = STR.jurnal;
      if (!daftar.length) return '<p class="jurnal-kosong">' + T.kosong + '</p>';
      var tampil = daftar.slice(-5), mulaiNo = daftar.length - tampil.length, kolom = tampil[0].kolom || ['hutan', 'warga'];
      var kepala = [T.kolomKe, tampil[0].judulTindakan || T.kolomTindakan, T.kolomTebakan].concat(kolom.map(function (k) { return STR.indikator[k]; })).concat([T.kolomFoto]);
      return '<table class="tbl"><tr>' + kepala.map(function (k) { return '<th>' + k + '</th>'; }).join('') + '</tr>' + tampil.map(function (p, i) {
        return '<tr><td>' + (mulaiNo + i + 1) + '</td><td>' + Jurnal._tindakan(p) + '</td><td>' + (p.tebakan || '-') + '</td>' + kolom.map(function (k) { return '<td>' + Math.round(p.akhir[k]) + '</td>'; }).join('') + '<td>' + (p.foto ? '<img alt="" src="' + p.foto + '">' : '') + '</td></tr>';
      }).join('') + '</table>';
    },
    /* grafik garis dengan pola berbeda dan label langsung, terbaca tanpa warna */
    _grafik: function (daftar) {
      var T = STR.jurnal;
      if (!daftar.length) return '<p class="jurnal-kosong">' + T.kosong + '</p>';
      var p = daftar[daftar.length - 1], r = p.riwayat, akhir = r.length - 1, W0 = 1090, H0 = 360, ki = 58, ka = 170, at = 12, ba = 40, lebar = W0 - ki - ka, tinggi = H0 - at - ba;
      var indik = p.indikator || ['hutan', 'air', 'warga'], judul = U.fmt(T.grafikJudul, { n: akhir });
      function X(t) { return ki + t / akhir * lebar; }
      function Y(v) { return at + (1 - v / 100) * tinggi; }
      var svg = '<svg viewBox="0 0 ' + W0 + ' ' + H0 + '" role="img" aria-label="' + judul + '">';
      [0, 25, 50, 75, 100].forEach(function (v) {
        svg += '<line x1="' + ki + '" x2="' + (ki + lebar) + '" y1="' + Y(v) + '" y2="' + Y(v) + '" stroke="#E8D7AE" stroke-width="3"/><text x="' + (ki - 10) + '" y="' + (Y(v) + 8) + '" text-anchor="end" font-family="Andika" font-size="23" fill="#16352C">' + v + '</text>';
      });
      [0, 1, 2, 3, 4].forEach(function (i) { var t = akhir * i / 4; svg += '<text x="' + X(t) + '" y="' + (H0 - 8) + '" text-anchor="middle" font-family="Andika" font-size="23" fill="#16352C">' + t + '</text>'; });
      /* label di ujung garis, digeser bila berdekatan */
      var labelY = [];
      indik.forEach(function (k, idx) {
        var titik = r.map(function (s, t) { return X(t) + ',' + Y(s[k]); }).join(' ');
        svg += '<polyline points="' + titik + '" fill="none" stroke="' + WARNA[idx] + '" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="' + POLA[idx] + '"/>';
      });
      indik.slice().sort(function (a, b) { return r[akhir][b] - r[akhir][a]; }).forEach(function (k) {
        var y = Y(r[akhir][k]);
        while (labelY.some(function (a) { return Math.abs(a - y) < 28; })) y += 28;
        labelY.push(y);
        svg += '<text x="' + (ki + lebar + 12) + '" y="' + (y + 8) + '" font-family="Andika" font-weight="700" font-size="24" fill="#16352C">' + STR.indikator[k] + ' ' + Math.round(r[akhir][k]) + '</text>';
      });
      return '<div class="subjudul atas">' + judul + '</div><div class="grafik">' + svg + '</svg></div>';
    },
    _kartu: function () {
      var T = STR.jurnal, h = '<div class="subjudul atas">' + T.kartuJudul + '</div><div class="kartu-kisi">';
      function satu(ada, kunci, isi) {
        return ada ? '<div class="kartu-kecil"><img alt="" src="' + (Foto.kartu(kunci) || '') + '">' + isi.nama + '</div>' : '<div class="kartu-kecil belum">' + T.belumKartu + '</div>';
      }
      KARTU.forEach(function (k) { h += satu(Save.data.kartu[k], k, STR.kartu[k]); });
      SATWA.forEach(function (k) { h += satu(Save.data.satwa[k], k, STR.satwa[k]); });
      return h + '</div>';
    },
    /* tebakan awal dan akhir berdampingan, lalu kesimpulan tiap bab */
    _catatan: function () {
      var T = STR.jurnal, h = '', ada = false;
      function baris(judul, tb) {
        var kunci = Object.keys(tb);
        if (!kunci.length) return '';
        ada = true;
        return '<div class="tebakan-baris"><b>' + judul + '</b>' + kunci.map(function (k) { return '<span class="chip">' + STR.kartu[k].nama + ': ' + (tb[k] === 'pulih' ? T.pulihPendek : T.tidakPendek) + '</span>'; }).join('') + '</div>';
      }
      h += baris(T.tebakanAwal, Save.data.tebakanAwal) + baris(T.tebakanAkhir, Save.data.pilahAkhir);
      var ks = Save.data.kesimpulan, babAda = Object.keys(ks).filter(function (n) { return ks[n]; });
      if (babAda.length) {
        ada = true;
        h += babAda.map(function (n) { return '<div class="jurnal-simpul"><b>' + U.fmt(T.babPendek, { n: +n + 1 }) + '</b> ' + ks[n] + '</div>'; }).join('');
      }
      return ada ? h : '<p class="jurnal-kosong">' + T.belumCatatan + '</p>';
    }
  };
  root.Jurnal = Jurnal;
})(window);
