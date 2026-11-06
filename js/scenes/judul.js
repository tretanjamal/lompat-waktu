/* Layar judul: pulau 3D hidup, logo, MULAI, Informasi, Referensi, Pengembang. Pemain baru langsung ke hook, pemain lama ke Peta Pulau. */
(function () {
  var bar = null, t = 0;
  Scenes.add('judul', {
    enter: function (akar) {
      var S = STR.judul;
      t = 0;
      if (!Dunia.ok) {
        var W = STR.tanpaWebgl, latar = ASET.img.muat_pulau ? ' style="background:url(assets/img/' + ASET.img.muat_pulau + ') center/cover"' : '';
        akar.innerHTML = '<div class="pesan-webgl"' + latar + '><h1>' + W.judul + '</h1><ol>' + W.langkah.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ol></div>';
        var pesan = akar.firstChild;
        pesan.appendChild(Input.button(W.coba, 'kunyit rel', function () { location.reload(); }, { id: 'coba-lagi' }));
        if (Dunia.alasan) { var kecil = U.h('small'); kecil.textContent = U.fmt(W.alasan, { a: String(Dunia.alasan).slice(0, 170) }); pesan.appendChild(kecil); }
        return;
      }
      Pulau.siapkan();
      Pulau.kameraJudul();
      Warna.penuh();
      Aud.musik('judul'); Aud.ambien('pantai');
      var berpapan = ASET.img.logo_papan ? ' berpapan' : '';
      if (berpapan) { var papan = U.h('img', 'lapis logo-papan'); papan.alt = ''; papan.draggable = false; papan.src = 'assets/img/' + ASET.img.logo_papan; akar.appendChild(papan); }
      akar.appendChild(U.h('div', 'lapis logo' + berpapan, '<span class="a">' + S.a + '</span><span class="b">' + S.b + '</span>'));
      akar.appendChild(U.h('div', 'lapis motto' + berpapan, S.motto));
      var mulai = Input.button(S.mulai, 'kunyit mulai' + berpapan, function () {
        Scenes.go(Save.data.onboarded ? 'peta' : (Intro.perlu() ? 'intro' : 'bab0'));
      }, { id: 'mulai' });
      akar.appendChild(mulai);
      var tiga = U.h('div', 'judul-tiga' + berpapan);
      tiga.appendChild(Input.button(S.info, 'zamrud', function () { About.info(); }, { id: 'info' }));
      tiga.appendChild(Input.button(S.ref, 'zamrud', function () { About.ref(); }, { id: 'ref' }));
      tiga.appendChild(Input.button(S.dev, 'zamrud', function () { About.dev(); }, { id: 'dev' }));
      akar.appendChild(tiga);
      if (window.REKAMAN && REKAMAN.ai) akar.appendChild(U.h('div', 'lapis judul-ai', S.suaraAi));
      bar = UI.iconBar(akar);
      setTimeout(function () { mulai.focus({ preventScroll: true }); }, 60);
    },
    update: function (dt) {
      if (!Dunia.ok) return;
      t += dt;
      if (!UI.kurangi) { Kamera.offset.x = -9.6 + Math.sin(t * 0.13) * 1.6; Kamera.terapkan(); }
      Pulau.update(dt, 'judul');
    },
    exit: function () { if (bar && bar._cleanup) bar._cleanup(); bar = null; Kamera.offset.x = -9.6; }
  });
})();
