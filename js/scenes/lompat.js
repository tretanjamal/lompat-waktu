/* Lompat Waktu: momen utama gim. Dunia berubah mengikuti riwayat simulasi, tahun berjalan, panah sebab-akibat muncul satu per satu,
   lalu tebakan murid berdampingan dengan hasil. Bisa kembali ke hari ini (dunia diputar mundur). */
(function (root) {
  function lerpState(riwayat, raw) {
    var f = raw * (riwayat.length - 1), i = Math.min(riwayat.length - 2, Math.floor(f)), t = f - i, a = riwayat[i], b = riwayat[i + 1], s = {}, k;
    for (k in a) s[k] = a[k] + (b[k] - a[k]) * t;
    return s;
  }
  function htmlRuas() { var r = '', i; for (i = 0; i < 10; i++) r += '<i></i>'; return r; }

  /* o: riwayat, indikator[], judul, apa, rantai[], tebakan {label, pilih, hasil}, baik, cepat, bolehLewati, sasaran{}, balik (kembali ke hari ini), tombol,
     labelAkhir (bawaan "20 tahun kemudian"), riwayatMundur (dunia diputar mundur lewat riwayat lain), bandingkan {riwayat, opsi} (tombol menukar dua masa depan) */
  async function jalankan(o) {
    var A = Arena, zona = A.zona;
    A.kunci = true; A.sibuk = false;
    A.sembunyikanTangan();
    await A.tungguBicara();   // Jam Pasir yang diketuk murid sudah menghentikan kalimat; saat peragaan Rako, kalimatnya selesai dulu
    A.hud.classList.add('sembunyi');
    var w = U.h('div', 'lapis-lompat');
    A.akar.appendChild(w);
    if (zona.mulaiLompat) zona.mulaiLompat(o);
    Aud.sfx('jam');
    if (!UI.kurangi) {
      var jb = UI.jamBesar(w);
      await Tween.wait(900);
      jb.remove();
      Tween.run(900, function (e) { Kamera.zoom = 1 + e * 0.14; });
    }

    /* tahun, batang bambu, rantai */
    var elTahun = U.h('div', 'lapis tahun', '<small>' + STR.hud.hariIni + '</small><b></b>'), elT = elTahun.querySelector('b'), elK = elTahun.querySelector('small');
    elT.textContent = U.fmt(STR.hud.tahun, { t: 0 });
    w.appendChild(elTahun);
    var wadah = U.h('div', 'lapis batang-wadah');
    var batang = o.indikator.map(function (k) {
      var sasar = o.sasaran && o.sasaran[k];
      var ikon = UI.gambar('meter_' + k, 'meter-ikon', 46);
      var el = U.h('div', 'batang' + (ikon ? ' berikon' : ''), ikon + '<div class="lbl"><span>' + STR.indikator[k] + (sasar ? ' <span class="sasar">' + U.fmt(STR.hud.sasarBatang, { n: sasar }) + '</span>' : '') + '</span><b></b></div><div class="ruas">' + htmlRuas() + '</div>');
      wadah.appendChild(el);
      return { k: k, sasar: sasar, angka: el.querySelector('b'), ruas: el.querySelector('.ruas'), i: el.querySelectorAll('.ruas i'), n: -1 };
    });
    w.appendChild(wadah);
    var rantai = U.h('div', 'lapis rantai'), mata = [];
    o.rantai.forEach(function (t, i) {
      var p = null;
      if (i) { p = U.h('span', 'panah-rantai', UI.icon('panah', 48)); rantai.appendChild(p); }
      var m = U.h('div', 'mata-rantai', t);
      rantai.appendChild(m);
      mata.push({ el: m, panah: p, batas: 0.1 + 0.8 * i / Math.max(1, o.rantai.length - 1) * 0.92, on: false });
    });
    w.appendChild(rantai);

    var riwayatAktif = o.riwayat, opsiAktif = o;
    function isiBatang(st) {
      batang.forEach(function (b) {
        var n = Math.round(st[b.k]);
        if (n === b.n) return;
        b.n = n;
        b.angka.textContent = n;
        var isi = Math.round(n / 10);
        for (var i = 0; i < 10; i++) b.i[i].classList.toggle('isi', i < isi);
        /* sampah terbalik: makin banyak makin buruk */
        b.ruas.classList.toggle('rendah', b.k === 'sampah' ? n > 50 : (b.sasar ? n < b.sasar : n < 50));
      });
    }
    function terapkan(raw) {
      var st = lerpState(riwayatAktif, raw);
      zona.terapkan(st, raw, opsiAktif);
      elT.textContent = U.fmt(STR.hud.tahun, { t: Math.round(raw * (riwayatAktif.length - 1)) });
      elK.textContent = raw <= 0 ? STR.hud.hariIni : STR.hud.melompat;
      isiBatang(st);
      mata.forEach(function (m) {
        if (!m.on && raw >= m.batas) {
          m.on = true; m.el.classList.add('on'); if (m.panah) m.panah.classList.add('on');
          Aud.sfx('pop');
        }
      });
    }
    terapkan(0);

    /* jalannya waktu */
    var dur = (o.cepat ? 5400 : 9000), habis = false, selesai;
    var ditunggu = new Promise(function (ok) { selesai = ok; });
    var elLewati = null;
    if (o.bolehLewati) {
      elLewati = Input.button(STR.hud.lewati, 'kertas lewati', function () { if (habis) return; habis = true; terapkan(1); selesai(); }, { id: 'lewati' });
      w.appendChild(elLewati);
    }
    if (UI.kurangi) {
      /* Kurangi animasi: 3 langkah pudar-silang tanpa gerak */
      var langkah = [0.34, 0.67, 1], ci = 0;
      (function maju() {
        if (habis) return;
        if (ci >= langkah.length) { habis = true; selesai(); return; }
        var r = langkah[ci++];
        Tween.run(180, function (e) { if (!habis) Scenes.cover.style.opacity = e * 0.8; }).then(function () {
          if (habis) return;
          terapkan(r);
          return Tween.run(180, function (e) { if (!habis) Scenes.cover.style.opacity = 0.8 * (1 - e); });
        }).then(function () { return habis ? null : Tween.wait(1000); }).then(maju);
      })();
    } else {
      Tween.run(dur, function (e, raw) { if (habis) return; terapkan(raw); if (raw >= 1) { habis = true; selesai(); } }, Ease.linear);
    }
    await ditunggu;
    Scenes.cover.style.opacity = 0;
    if (elLewati) elLewati.remove();
    Aud.sfx(o.baik ? 'cerah' : 'suram');
    if (zona.akhirLompat) zona.akhirLompat(o);
    var labelAkhir = o.labelAkhir || STR.hud.duapuluh;
    elK.textContent = labelAkhir;
    elT.textContent = o.judul;

    /* foto untuk Jurnal: dunia harus digambar di tugas yang sama */
    o.foto = Dunia.cuplik(256);

    if (o.tebakan) {
      var bd = U.h('div', 'lapis banding', '<div class="jd">' + o.tebakan.label + '</div><div class="br"><span>' + STR.hud.tebakanmu + '</span><span class="kartu-mini">' + o.tebakan.pilih + '</span></div><div class="br"><span>' + STR.hud.terjadi + '</span><span class="kartu-mini">' + o.tebakan.hasil + '</span></div>' +
        '<div class="beda">' + (o.tebakan.pilih === o.tebakan.hasil ? STR.hud.cocok : STR.hud.beda) + '</div>');
      w.appendChild(bd);
    }
    await Tween.wait(o.cepat ? 500 : 1100);

    /* Apa yang terjadi? */
    rantai.style.display = 'none';
    var apa = U.h('div', 'lapis apa-panel kena'), kiri = U.h('div', 'kiri');
    kiri.innerHTML = '<div class="rantai-mini">' + o.rantai.map(function (t, i) { return (i ? UI.icon('panah', 22) : '') + '<span>' + t + '</span>'; }).join('') + '</div>' +
      '<div class="jd">' + STR.hud.apa + '</div><div class="tx">' + o.apa + '</div>';
    apa.appendChild(kiri);
    /* Bandingkan: pemandangan dan batang bertukar antara masa depan murid dan masa depan lain */
    if (o.bandingkan) {
      var lain = false, labelB = o.bandingkan.labelTombol, tb = Input.button(labelB, 'toska', function () {
        lain = !lain;
        riwayatAktif = lain ? o.bandingkan.riwayat : o.riwayat;
        opsiAktif = lain ? o.bandingkan.opsi : o;
        terapkan(1);
        elK.textContent = lain ? o.bandingkan.labelLain : labelAkhir;
        elT.textContent = lain ? o.bandingkan.judulLain : o.judul;
        tb.querySelector('.lbl').textContent = lain ? o.bandingkan.labelKembali : labelB;
        kiri.querySelector('.tx').textContent = lain ? o.bandingkan.apaLain : o.apa;
        Aud.sfx(lain ? 'suram' : 'cerah');
        if (zona.akhirLompat) zona.akhirLompat(opsiAktif);
      }, { id: 'bandingkan' });
      apa.appendChild(tb);
      apa.classList.add('dua');
    }
    var tunggu = new Promise(function (ok) {
      var b = Input.button(o.tombol || STR.hud.kembali, 'kunyit', function () {
        b.disabled = true;
        /* pulihkan masa depan murid bila sedang melihat masa depan lain */
        riwayatAktif = o.riwayat; opsiAktif = o;
        ok();
      }, { id: 'kembali' });
      apa.appendChild(b);
      w.appendChild(apa);
      setTimeout(function () { b.focus({ preventScroll: true }); }, 40);
    });
    Voice.say(o.apa);
    await tunggu;
    Voice.stop();

    if (o.balik) {
      Aud.sfx('kembali');
      apa.remove();
      if (o.tebakan) w.querySelector('.banding').remove();
      if (zona.mulaiMundur) zona.mulaiMundur(o);
      if (o.riwayatMundur) riwayatAktif = o.riwayatMundur;
      if (UI.kurangi) terapkan(0);
      else await Tween.run(1250, function (e) { terapkan(1 - e); }, Ease.easeInOutCubic);
      if (zona.keHariIni) zona.keHariIni(o);
    }
    if (!UI.kurangi) Tween.run(500, function (e) { Kamera.zoom = 1 + (1 - e) * 0.14; });
    w.remove();
    A.hud.classList.remove('sembunyi');
    A.kunci = false;
    A.hero.ekspresi('senang'); A.hero.anim = 'diam';
    return o;
  }
  root.Lompat = { jalankan: jalankan };
})(window);
