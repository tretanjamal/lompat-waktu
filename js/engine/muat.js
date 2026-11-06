/* Layar muat: gambar pulau, papan judul, batang kemajuan, dan satu pengetahuan singkat. Tampil minimal MIN ms supaya sempat terbaca, bukan sekadar berkedip. */
(function (root) {
  var MIN = U.TEST && !/[?&]muat=1/.test(location.search) ? 0 : 2200, el = null, t0 = 0, nilai = 0;
  var Muat = {
    buka: function () {
      t0 = performance.now(); nilai = 0;
      var S = STR.judul, tips = STR.muatTips, papan = ASET.img.logo_papan, daun = UI.gambar('ikon_daun', 'muat-daun');
      el = U.h('div', '',
        '<div class="muat-judul">' + (papan ? '<img class="lapis logo-papan" alt="" draggable="false" src="assets/img/' + papan + '">' : '') +
        '<div class="lapis logo' + (papan ? ' berpapan' : '') + '"><span class="a">' + S.a + '</span><span class="b">' + S.b + '</span></div></div>' +
        '<div class="muat-tip"><b>' + STR.muatTahu + '</b>' + tips[Math.floor(Math.random() * tips.length)] + '</div>' +
        '<div class="muat-wadah"><div class="muat-isi"></div>' + daun + '</div>' +
        '<div class="muat-teks"></div>');
      el.id = 'muat';
      if (ASET.img.muat_pulau) el.style.backgroundImage = 'url(assets/img/' + ASET.img.muat_pulau + ')';
      Stage.el.appendChild(el);
      Muat.atur(0);
    },
    /* k: 0 sampai 1, tidak pernah mundur */
    atur: function (k) {
      if (!el) return;
      nilai = Math.max(nilai, k);
      el.style.setProperty('--k', nilai);
      el.querySelector('.muat-teks').textContent = STR.muat + '... ' + Math.round(nilai * 100) + '%';
    },
    tunggu: function () { return new Promise(function (ok) { setTimeout(ok, Math.max(0, MIN - (performance.now() - t0))); }); },
    tutup: function () {
      if (!el) return;
      var e = el;
      el = null;
      if (!MIN) { e.remove(); return; }
      e.classList.add('tutup');
      setTimeout(function () { e.remove(); }, 420);
    }
  };
  root.Muat = Muat;
})(window);
