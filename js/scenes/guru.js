/* Hasil Belajarku: kemampuan, pemahaman yang masih keliru, dan tebakan awal. Dilihat murid dan bisa ditunjukkan kepada guru. Tanpa data pribadi. */
(function (root) {
  var TAG = ['kenal-sda', 'terbarukan', 'laju-pulih', 'sebab-akibat', 'solusi', 'seimbang', 'kp-prediksi', 'kp-variabel', 'kp-data', 'kp-simpul'];
  function status(s) { var T = STR.guru.status; return '<span class="guru-status ' + s + '"><i></i>' + T[s] + '</span>'; }
  var Guru = {
    buka: function (bab, papan, pertama) {
      var T = STR.guru, o = UI.overlay(T.judul, 'aboutpanel');
      UI.tabs(o.body, [
        { id: 'sesi', label: T.tabs.sesi, html: function () { return Guru._sesi(bab, papan, pertama); } },
        { id: 'trampil', label: T.tabs.trampil, html: function () { return Guru._trampil(); } },
        { id: 'mis', label: T.tabs.mis, html: function () { return Guru._mis(); } }
      ]);
      o.body.appendChild(U.h('div', 'model-label', T.catatan));
      var t = Input.button(STR.hasil.tutup, 'zamrud tombol-tutup', function () { o.close(); }, { id: 'tutup-guru' });
      o.body.appendChild(t);
      setTimeout(function () { t.focus({ preventScroll: true }); }, 30);
    },
    _baris: function (kiri, kanan) { return '<div class="guru-baris"><span>' + kiri + '</span><b>' + kanan + '</b></div>'; },
    _sesi: function (bab, papan, pertama) {
      var T = STR.guru, b = Save.data.bab[bab] || {}, h = '';
      h += Guru._baris(T.percobaan, Jurnal.jumlah(bab) || b.lompat || 0);
      h += Guru._baris(T.peragaan, b.peragaan ? T.ya : T.tidak);
      h += Guru._baris(T.kesimpulan, pertama ? T.ya : T.tidak);
      if (papan) h += Guru._baris(T.papan, U.fmt(T.dari, { a: papan.benar, b: papan.total }));
      h += '<div class="subjudul">' + T.tebakan + '</div>';
      var tb = Save.data.tebakanAwal, k = Object.keys(tb);
      if (!k.length) h += '<p>' + T.tebakanBelum + '</p>';
      else h += '<div class="tebakan-baris">' + k.map(function (x) { return '<span class="chip">' + STR.kartu[x].nama + ': ' + (tb[x] === 'pulih' ? STR.jurnal.pulihPendek : STR.jurnal.tidakPendek) + '</span>'; }).join('') + '</div>';
      /* tebakan akhir setelah Bab 4: guru bisa melihat apa yang berubah */
      var ta = Save.data.pilahAkhir, ka = Object.keys(ta);
      if (ka.length) h += '<div class="subjudul">' + T.tebakanAkhir + '</div><div class="tebakan-baris">' + ka.map(function (x) { return '<span class="chip' + (tb[x] && tb[x] !== ta[x] ? ' cukup' : '') + '">' + STR.kartu[x].nama + ': ' + (ta[x] === 'pulih' ? STR.jurnal.pulihPendek : STR.jurnal.tidakPendek) + '</span>'; }).join('') + '</div><div class="guru-catatan">' + T.tebakanBeda + '</div>';
      return h;
    },
    _trampil: function () {
      var T = STR.guru;
      return '<div class="guru-kolom">' + TAG.map(function (t) { return '<div class="guru-baris"><span>' + T.tag[t] + '</span>' + status(Save.status(t)) + '</div>'; }).join('') + '</div>';
    },
    _mis: function () {
      var T = STR.guru, m = Save.data.miskonsepsi, k = Object.keys(m);
      if (!k.length) return '<p style="margin:14px 0;font-weight:700">' + T.misKosong + '</p>';
      return k.map(function (x) {
        var d = m[x], beres = d.teratasi >= d.muncul;
        return '<div class="guru-baris" style="grid-template-columns:1fr 240px"><span>' + (T.misNama[x] || x) + '</span><b>' + (beres ? T.teratasi : T.masih) + '</b></div>';
      }).join('');
    }
  };
  root.Guru = Guru;
})(window);
