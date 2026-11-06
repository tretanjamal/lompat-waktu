/* Layar hasil misi: bintang muncul satu per satu dengan nada bertingkat, Kemampuanmu dalam bahasa anak, Lanjut ke misi berikutnya, Hasil Belajarku. Latar: pulau dengan zona yang sudah pulih. */
(function () {
  Scenes.add('hasil', {
    enter: function (akar, p) {
      var T = STR.hasil, babBerikut = p.bab + 1;
      Pulau.siapkan();
      Pulau.kameraPeta();
      Warna.petaPulau(Pulau.ZONA, Save.selesaiBab);
      Aud.musik('judul'); Aud.ambien('pantai');
      var panel = U.h('div', 'lapis hasil-panel kena');
      panel.appendChild(U.h('div', 'hasil-judul', U.fmt(T.judul, { n: p.bab + 1 }) + ': ' + STR.bab[p.bab].nama));
      var bintang = U.h('div', 'bintang-baris'), elB = [];
      for (var k = 0; k < 3; k++) {
        var b = U.h('div', 'bintang-besar', UI.icon(k < p.stars ? 'bintang' : 'bintangKosong', 124));
        bintang.appendChild(b); elB.push(b);
      }
      panel.appendChild(bintang);
      var gbL = Lencana.gambar(p.bab, 'ico'), elL = gbL ? U.h('div', 'hasil-lencana', gbL + '<small>' + T.lencana + '</small><b>' + STR.bab[p.bab].lencana + '</b>') : null;
      if (elL) panel.appendChild(elL);
      var sub = U.h('div', 'hasil-sub', T.subBintang[p.stars] || '');
      panel.appendChild(sub);
      panel.appendChild(U.h('div', 'hasil-kilat', p.kilat ? T.kilat : ''));
      var kuat = U.h('div', 'kuat-kotak', '<h2>' + T.kekuatan + '</h2>' + (p.kekuatan || []).map(function (s) { return '<div class="kuat-baris">' + UI.icon('centang', 32) + '<span>' + s + '</span></div>'; }).join(''));
      panel.appendChild(kuat);
      panel.appendChild(U.h('div', 'hasil-daun', UI.icon('daun', 40) + T.daun + ' ' + Save.data.daun + Lencana.koleksi()));
      var tb = U.h('div', 'hasil-tombol');
      /* misi terakhir tidak punya lanjutan: tombol utamanya Sertifikat dan Peta Pulau */
      var lanjut = p.bab < 5 ? Input.button(T.lanjut, 'kunyit', function () { Scenes.go('bab' + babBerikut); }, { id: 'hasil-lanjut' }) : null;
      var keP = Input.button(T.peta, lanjut ? 'zamrud' : 'kunyit', function () { Scenes.go('peta', { saran: babBerikut }); }, { id: 'hasil-peta' });
      if (lanjut) tb.appendChild(lanjut);
      tb.appendChild(keP);
      tb.appendChild(Input.button(T.ulang, 'toska', function () { Scenes.go('bab' + p.bab); }, { id: 'hasil-ulang' }));
      tb.appendChild(Input.button(T.guruBtn, 'kertas', function () { Guru.buka(p.bab, p.papan, p.pertama); }, { id: 'hasil-guru' }));
      tb.appendChild(Input.button(T.beranda, 'bata', function () { Scenes.go('judul'); }, { id: 'hasil-beranda' }));
      if (p.bab === 5) tb.insertBefore(Input.button(STR.sertifikat.tombol, 'toska', function () { Voice.stop(); Sertifikat.buka(); }, { id: 'hasil-sertifikat' }), tb.firstChild);
      panel.appendChild(tb);
      akar.appendChild(panel);
      /* bintang satu per satu */
      var jeda = 420;
      elB.forEach(function (el, idx) {
        Tween.wait(jeda + idx * 480).then(function () {
          el.classList.add('on');
          if (idx < p.stars) Aud.sfx('star', idx);
          else Aud.sfx('gembok');
        });
      });
      Tween.wait(jeda + 3 * 480).then(function () {
        Aud.sfx('fanfare', p.stars); Voice.say(T.subBintang[p.stars] || '');
        if (elL) elL.classList.add('on');
        if (p.bab === 5) Promise.all([Tween.wait(900), Voice.selesai()]).then(function () { if (Scenes.name === 'hasil' && !document.querySelector('.overlay')) Sertifikat.buka(); });
      });
      setTimeout(function () { (lanjut || keP).focus({ preventScroll: true }); }, 60);
    },
    update: function (dt) { Pulau.update(dt, 'peta'); }
  });

  /* Lencana: satu untuk tiap misi yang selesai. Tidak perlu disimpan terpisah, karena mengikuti catatan misi. */
  window.Lencana = {
    KUNCI: ['tanjung', 'hutan', 'sawah', 'teluk', 'bukit', 'balai'],
    gambar: function (n, kelas, size) { return UI.gambar('lencana_' + Lencana.KUNCI[n], kelas, size); },
    koleksi: function () {
      var h = '', n;
      for (n = 0; n < 6; n++) h += Lencana.gambar(n, 'lencana-kecil' + (Save.selesaiBab(n) ? '' : ' belum'), 54);
      return h ? '<span class="koleksi">' + h + '</span>' : '';
    },
    /* Misi 1 tidak punya layar hasil, jadi lencananya muncul di tengah layar selama Rako berbicara */
    pop: function (akar, n) {
      var g = Lencana.gambar(n, 'ico');
      if (!g) return null;
      var el = U.h('div', 'lencana-pop', g + '<b>' + STR.bab[n].lencana + '</b>');
      akar.appendChild(el);
      return el;
    }
  };

  /* Sertifikat Penjaga Masa Depan: tanpa nama dan tanpa data pribadi, jadi aman di perangkat bersama */
  window.Sertifikat = {
    buka: function () {
      var T = STR.sertifikat, o = UI.overlay(T.judul, 'sertifikat'), total = 0, n, b = '';
      for (n = 1; n <= 5; n++) { var d = Save.data.bab[n]; total += d ? d.stars : 0; }
      for (n = 0; n < 6; n++) b += Lencana.gambar(n, 'ico', 54);
      if (!b) for (n = 0; n < 5; n++) b += UI.icon('bintang', 54);
      var gambar = Foto.potret(Save.data.hero, 'senang'), rako = Foto.potret('rako', 'sorak');
      if (ASET.img.sertifikat_hias) {
        o.panel.classList.add('berbingkai');
        o.panel.insertBefore(U.h('img', 'sert-bingkai'), o.panel.firstChild);
        o.panel.firstChild.alt = ''; o.panel.firstChild.draggable = false; o.panel.firstChild.src = 'assets/img/' + ASET.img.sertifikat_hias;
      }
      o.body.innerHTML ='<div class="sert-isi">' +
        (gambar ? '<img class="sert-tokoh" alt="" draggable="false" src="' + gambar + '">' : '') +
        '<div class="sert-teks"><div class="sert-kepada">' + T.kepada + '</div><div class="sert-nama">' + T.nama + '</div><div class="sert-kal">' + T.isi + '</div><div class="sert-bintang">' + b + '</div>' +
        '<div class="sert-angka"><span>' + U.fmt(T.bintang, { n: total }) + '</span><span>' + U.fmt(T.daun, { n: Save.data.daun }) + '</span></div></div>' +
        (rako ? '<img class="sert-tokoh" alt="" draggable="false" src="' + rako + '">' : '') + '</div>';
      var t = Input.button(T.tutup, 'zamrud tombol-tutup', function () { Voice.stop(); o.close(); }, { id: 'tutup-sertifikat' });
      o.body.appendChild(t);
      Aud.sfx('fanfare', 3);
      Voice.say(T.kepada + ' ' + T.isi);
      setTimeout(function () { t.focus({ preventScroll: true }); }, 40);
    }
  };
})();
