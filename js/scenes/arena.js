/* Arena: kerangka bersama semua bab. Tokoh + Rako di dunia, HUD, sasaran yang bisa diketuk (tombol DOM di atas posisi 3D,
   jadi sentuh, mouse, Tab, Enter, dan bot memakai jalur yang sama), balon, kartu tebakan, tangan penunjuk, jeda. */
(function (root) {
  var ls = {}, ka = {}, am = {};   // titik proyeksi yang dipakai ulang
  var TITIK_LANJUT = { lx: 850, ly: 622 };

  /* sasaran di luar layar atau tertutup panel antarmuka? */
  function tersembunyi(p) {
    return p.x < 40 || p.x > 1240 || p.y < 40 || p.y > 680 ||
      (p.x < 530 && p.y < 195) ||    // Papan Misi
      (p.x > 905 && p.y < 95) ||     // ikon kanan atas
      (p.x < 1030 && p.y > 585) ||   // balon
      (p.x > 1030 && p.y > 470) ||   // Jam Pasir
      (U.HP && ((p.x < 240 && p.y > 340) || (p.x > 1060 && p.y > 310) || (p.x > 840 && p.y < 120)));   // joystick, Aksi, ikon besar
  }
  /* titik pengganti yang bisa diketuk, tidak di tepi dan tidak tertutup panel */
  function amankan(p, q) {
    var x = Math.max(70, Math.min(1210, p.x)), y = Math.max(70, Math.min(530, p.y));
    if (x < 540 && y < 250) y = 250;     // Papan Misi
    if (x > 890 && y < 140) y = 140;     // ikon kanan atas
    if (x > 1000 && y > 430) y = 430;    // Jam Pasir
    if (U.HP) { if (x < 250 && y > 330) x = 250; if (x > 1050 && y > 300) y = 300; if (x > 830 && y < 150) y = 150; }
    q.x = x; q.y = y;
  }

  var A = {
    mati: true, fase: '', kunci: false, sibuk: false,

    mulai: function (akar, zona, o) {
      o = o || {};
      A.sesi = (A.sesi || 0) + 1; A.akar = akar; A.zona = zona; A.mati = false; A.kunci = false; A.sibuk = false; A.tanpaGerak = false; A.antrean = null; A.sasaran = {}; A.utama = null;
      A.diamT = 0; A.tombol = {}; A.warga = []; A.fase = ''; A.tanganPos = null; A.tanganLayar = false; A.tanganKekal = false; A.bab = o.bab; A.dialogAktif = false; A._jamOk = null; A._lanjutOk = null; A._luang = null; A.teksSekarang = ''; A.stik = { x: 0, z: 0 }; A.elStik = null; A.elAksi = null; A._aksiS = null;
      var sc = zona.scene;
      Dunia.pakai(sc);
      Kamera.atur(zona.kamera);
      Warna.kosongkan();
      A.hero = new Tokoh(o.tokoh || Save.data.hero, zona); A.hero.bunyiLangkah = true;
      sc.add(A.hero.grup);
      A.bayangHero = Dunia.bayangan(0.72); sc.add(A.bayangHero);
      A.rako = new Rako(1.7); A.rako.ikuti(A.hero); sc.add(A.rako.grup);
      /* Jam Pasir melayang di dekat tokoh saat siap dibalik, supaya tombolnya terhubung dengan dunia */
      A.jam3d = null;
      if (Aset3D.ada('prop_jam_pasir')) { var Rj = new Bentuk.Rakit(95); Cadangan.hiasan(Rj, 'prop_jam_pasir', 0, 0, 0, 1.6, 0); A.jam3d = Rj.jadi(Bahan.tetap()); A.jam3d.visible = false; sc.add(A.jam3d); }
      A.partikel = new Partikel(sc, 170);
      A._bangunHud(o);
      Dunia.onKetuk = A._ketukTanah;
      A._kd = function (e) { var k = KUNCI[e.key]; if (!k) return; if (document.querySelector('.overlay') || A.kunci) return; A.tombol[k] = true; A.sentuh(); e.preventDefault(); };
      A._ku = function (e) { var k = KUNCI[e.key]; if (k) A.tombol[k] = false; };
      document.addEventListener('keydown', A._kd); document.addEventListener('keyup', A._ku);
      Input.panahDunia = true;
    },
    tutup: function () {
      A.mati = true;
      Dunia.onKetuk = null;
      Input.panahDunia = false;
      document.removeEventListener('keydown', A._kd); document.removeEventListener('keyup', A._ku);
      Tween.paused = false;
      if (A.zona) { Dunia.buangAdegan(A.zona.scene); A.zona = null; }
      Dunia.scene = null; Dunia.hiasan = null;
    },

    /* ===== HUD ===== */
    _bangunHud: function (o) {
      var h = A.hud = U.h('div', 'hud');
      A.lapisSasaran = U.h('div', 'sasaran-lapis');
      A.akar.appendChild(A.lapisSasaran);
      A.akar.appendChild(h);
      var misi = A.elMisi = U.h('div', 'lapis misi kena');
      misi.innerHTML = '<div class="pita"></div><div class="isi"><div class="kalimat"></div><div class="chips"></div></div>';
      misi.querySelector('.pita').textContent = U.fmt(STR.babLabel, { n: o.bab + 1, nama: STR.bab[o.bab].nama });
      h.appendChild(misi);

      var pj = U.h('div', 'iconbar');
      A.elDaun = U.h('div', 'daun kena', UI.icon('daun') + '<span>' + Save.data.daun + '</span>');
      A.elDaun.setAttribute('aria-label', STR.icons.daun);
      pj.appendChild(A.elDaun);
      pj.appendChild(UI.iconButton('jurnal', 'kertas', function () { Jurnal.buka(A.bab); }, { id: 'jurnal', aria: STR.icons.jurnal }));
      pj.appendChild(UI.iconButton('peta', 'kertas', function () { Scenes.go('peta'); }, { id: 'peta', aria: STR.icons.peta }));
      pj.appendChild(UI.iconButton('pause', 'kertas', function () { A.jeda(); }, { id: 'pause', aria: STR.icons.pause }));
      h.appendChild(pj);

      A.elPotret = U.h('div', 'lapis potret kena', '<img alt="" draggable="false">');
      h.appendChild(A.elPotret);
      A.elNama = U.h('div', 'nama-bicara');
      h.appendChild(A.elNama);
      var balon = A.elBalon = U.h('div', 'lapis balon kena');
      A.elTeks = U.h('div', 'btxt');
      A.elTeks.setAttribute('role', 'status'); A.elTeks.setAttribute('aria-live', 'polite');
      balon.appendChild(A.elTeks);
      var dengar = UI.iconButton('dengar', 'kertas dengar', function () { Voice.stop(); if (A.teksSekarang) A._baca(A.teksSekarang); A.sentuh(); }, { id: 'dengar', aria: STR.icons.replay, size: 36 });
      balon.appendChild(dengar);
      A.elLanjut = Input.button(STR.hud.lanjut, 'kunyit lanjut', function () { if (A._lanjutOk) { var f = A._lanjutOk; A._lanjutOk = null; Voice.stop(); f(); } A.sentuh(); }, { id: 'lanjut' });
      A.elLanjut.style.display = 'none';
      balon.appendChild(A.elLanjut);
      h.appendChild(balon);

      var jam = A.elJam = U.h('div', 'lapis jam');
      A.tombolJam = Input.button(UI.JAM, 'kunyit jam-bulat', function () {
        A.sentuh();
        if (A._jamOk && !A.tombolJam.classList.contains('padam')) { var f = A._jamOk; A._jamOk = null; A.jamAktif(false); Voice.stop(); f(); return; }
        /* belum bisa dipakai: goyang lembut, lalu ulangi arahan yang sedang berlaku */
        Aud.sfx('gembok');
        A.tombolJam.classList.remove('goyang'); void A.tombolJam.offsetWidth; A.tombolJam.classList.add('goyang');
        if (A.teksSekarang && !Voice.sibuk()) A._baca(A.teksSekarang);
      }, { id: 'jam', aria: STR.hud.jam });
      A.labelJam = U.h('div', 'jam-label', STR.hud.jam);
      jam.appendChild(A.tombolJam); jam.appendChild(A.labelJam);
      h.appendChild(jam);
      A.jamAktif(false);

      A.elTangan = U.h('div', 'tangan', UI.TANGAN);
      h.appendChild(A.elTangan);
      if (U.HP) A._bangunKendali(h);
    },
    /* Kendali HP: joystick di kiri dan tombol Aksi di kanan. Mengetuk tanah dan sasaran tetap bisa. */
    _bangunKendali: function (h) {
      var stik = A.elStik = U.h('div', 'stik kena', '<i></i>'), kepala = stik.firstChild, JARI = 64, aktif = null;
      function arahkan(e) {
        var p = Stage.toLocal(e.clientX, e.clientY), dx = p.x - (stik.offsetLeft + stik.offsetWidth / 2), dy = p.y - (stik.offsetTop + stik.offsetHeight / 2), d = Math.sqrt(dx * dx + dy * dy), k = d > JARI ? JARI / d : 1;
        kepala.style.transform = 'translate(' + (dx * k).toFixed(1) + 'px,' + (dy * k).toFixed(1) + 'px)';
        A.stik.x = d > 12 ? dx / d : 0; A.stik.z = d > 12 ? dy / d : 0;
        A.sentuh();
      }
      function lepas() { aktif = null; A.stik.x = A.stik.z = 0; kepala.style.transform = ''; }
      stik.addEventListener('pointerdown', function (e) { aktif = e.pointerId; try { stik.setPointerCapture(e.pointerId); } catch (x) { } Aud.init(); arahkan(e); e.preventDefault(); });
      stik.addEventListener('pointermove', function (e) { if (e.pointerId === aktif) arahkan(e); });
      stik.addEventListener('pointerup', lepas);
      stik.addEventListener('pointercancel', lepas);
      h.appendChild(stik);
      A.elAksi = Input.button(STR.hud.aksi, 'kunyit aksi padam', function () {
        A.sentuh();
        if (A._aksiS && A.sasaran[A._aksiS.id] === A._aksiS) { A.ketukSasaran(A._aksiS); return; }
        Aud.sfx('gembok');
        A.elAksi.classList.remove('goyang'); void A.elAksi.offsetWidth; A.elAksi.classList.add('goyang');
      }, { id: 'aksi', aria: STR.hud.aksi });
      h.appendChild(A.elAksi);
    },
    /* tombol Aksi menyala bila ada sasaran dekat tokoh, dan sasaran itu ditandai */
    _perbaruiAksi: function () {
      var h = A.hero, pilih = null, terdekat = Infinity;
      Object.keys(A.sasaran).forEach(function (id) {
        var s = A.sasaran[id];
        if (s.terkunci) return;
        var d = Math.sqrt((s.x - h.x) * (s.x - h.x) + (s.z - h.z) * (s.z - h.z));
        if (d < s.jarak + s.jari + 1.8 && d < terdekat) { terdekat = d; pilih = s; }
      });
      if (pilih === A._aksiS) return;
      if (A._aksiS) A._aksiS.el.classList.remove('terpilih');
      if (pilih) pilih.el.classList.add('terpilih');
      A._aksiS = pilih;
      A.elAksi.classList.toggle('padam', !pilih);
    },
    misi: function (kalimat, chips) {
      A.elMisi.querySelector('.kalimat').textContent = kalimat;
      A.aturChips(chips || []);
    },
    aturChips: function (chips) {
      A.elMisi.querySelector('.chips').innerHTML = chips.map(function (c) {
        return '<span class="chip' + (c.cukup ? ' cukup' : '') + '">' + (c.ikon ? UI.icon(c.ikon, 26) : '') + c.t + '</span>';
      }).join('');
    },
    jamAktif: function (on) {
      var b = A.tombolJam;
      b.classList.toggle('siap', on); b.classList.toggle('padam', !on);
      if (A.jam3d) A.jam3d.visible = on;
      b.setAttribute('aria-disabled', on ? 'false' : 'true');
    },
    /* tunggu murid membalik Jam Pasir. padam: tetap padam sampai A.jamAktif(true) dipanggil (belum ada perubahan). */
    tungguJam: function (padam) { A.jamAktif(!padam); return new Promise(function (ok) { A._jamOk = ok; }); },
    jamLabel: function (t) { A.labelJam.textContent = t; A.tombolJam.setAttribute('aria-label', t); },
    _sorotKata: function () {
      var ws = null;
      return function (i) { ws = ws || A.elTeks.querySelectorAll('.w'); for (var k = 0; k < ws.length; k++) ws[k].classList.toggle('on', k === i); };
    },
    _baca: function (t) { return Voice.say(t, { tokoh: A.tokohBicara, eks: A.eksBicara, onWord: A._sorotKata() }); },
    /* satu kalimat di balon; tokoh: rako (bawaan) atau warga. Balon baru berganti saat kalimat sebelumnya selesai.
       o: mulai (dipanggil saat kalimat ini tampil), info (lihat Voice.say). Hasil: janji yang selesai saat kalimat ini selesai. */
    kata: function (teks, tokoh, eks, o) {
      tokoh = tokoh || 'rako'; o = o || {};
      return Voice.say(teks, { tokoh: tokoh, eks: eks, info: o.info, onWord: A._sorotKata(), mulai: function () {
        if (A.mati) return;
        A.teksSekarang = teks; A.tokohBicara = tokoh; A.eksBicara = eks;
        A.elTeks.innerHTML = teks.split(/\s+/).map(function (w) { return '<span class="w">' + w + '</span>'; }).join(' ');
        A.elBalon.classList.remove('muncul'); void A.elBalon.offsetWidth; A.elBalon.classList.add('muncul');
        var img = A.elPotret.querySelector('img'), u = Foto.potret(tokoh, eks || 'senang');
        if (u) img.src = u;
        A.elNama.textContent = STR.tokoh[tokoh] || '';
        A.elPotret.classList.remove('nyala'); void A.elPotret.offsetWidth; A.elPotret.classList.add('nyala');
        if (o.mulai) o.mulai();
      } });
    },
    /* tunggu kalimat yang sedang diucapkan selesai, paling sebentar min ms. Alur layar yang sudah ditinggalkan berhenti di sini. */
    tungguBicara: function (min) {
      var sesi = A.sesi;
      return Promise.all([Tween.wait(min || 1), Voice.selesai()]).then(function () { return Tween.wait(1); }).then(function () {
        if (sesi !== A.sesi || A.mati) return new Promise(function () { });
      });
    },
    /* kalimat yang harus dilanjutkan dengan tombol */
    dialog: function (kalimat, tokoh, eks) {
      var daftar = [].concat(kalimat), i = 0;
      return new Promise(function (selesai) {
        A.dialogAktif = true;
        function berikut() {
          if (i >= daftar.length) { A.dialogAktif = false; A.elBalon.classList.remove('ada-lanjut'); A.elLanjut.style.display = 'none'; selesai(); return; }
          A.kata(daftar[i++], tokoh, eks, { mulai: function () {
            A.elBalon.classList.add('ada-lanjut'); A.elLanjut.style.display = '';
            A._lanjutOk = berikut;
          } });
        }
        berikut();
      });
    },

    /* ganti model tokoh (setelah memilih penjaga) */
    gantiHero: function (kunci) {
      var lama = A.hero, baru = new Tokoh(kunci, A.zona);
      baru.bunyiLangkah = true;
      baru.taruh(lama.x, lama.z, lama.arah);
      A.zona.scene.remove(lama.grup); lama.buang();
      A.zona.scene.add(baru.grup);
      A.hero = baru;
      A.rako.ikuti(baru);
      A.partikel.semprot({ x: baru.x, y: A.zona.tinggi(baru.x, baru.z) + 0.8, z: baru.z, n: 16, warna: [Warna.PAL.kunyit, Warna.PAL.kertas], laju: 2, naik: 2.6 });
    },

    /* ===== Warga dan efek ===== */
    /* tanpaBayang: warga yang diam di tempat, bayangannya digambar bersama lewat Dunia.bayanganDeret */
    tambahWarga: function (kunci, x, z, arah, tanpaBayang) {
      var t = new Tokoh(kunci, A.zona);
      t.taruh(x, z, arah);
      A.zona.scene.add(t.grup);
      if (!tanpaBayang) { t.bayang = Dunia.bayangan(0.68); A.zona.scene.add(t.bayang); }
      A.warga.push(t);
      return t;
    },
    tambahDaun: function (n, x, y, z) {
      Save.data.daun += n; Save.save();
      var el = A.elDaun.querySelector('span'), awal = +el.textContent, akhir = Save.data.daun;
      Tween.value(awal, akhir, 420, Ease.easeOutCubic, function (v) { el.textContent = Math.round(v); });
      A.elDaun.classList.remove('denyut'); void A.elDaun.offsetWidth; A.elDaun.classList.add('denyut');
      Aud.sfx('daun');
      if (x !== undefined) A.partikel.semprot({ x: x, y: y + 0.4, z: z, n: 10, warna: [Warna.PAL.pucuk, Warna.PAL.zamrud, Warna.PAL.kunyit], laju: 1.8, naik: 3.4, ukuran: 0.1 });
    },

    /* ===== Sasaran ===== */
    tambahSasaran: function (o) {
      var s = Object.assign({ jari: 0.9, jarak: 0 }, o);
      s.y = o.y !== undefined ? o.y : A.zona.tinggi(o.x, o.z);
      s.yTombol = o.yTombol === undefined ? 0.25 : o.yTombol;
      if (o.cincin !== false) { s.ring = Dunia.cincin(s.jari); s.ring.position.set(s.x, s.y + 0.09, s.z); A.zona.scene.add(s.ring); }
      var el = s.el = U.h('button', 'sasaran' + (o.kelas ? ' ' + o.kelas : ''));
      el.type = 'button'; el.dataset.id = 'sas-' + s.id;
      el.setAttribute('aria-label', s.label || s.id);
      if (s.nama) el.appendChild(U.h('span', 'papan-nama', s.nama));
      if (s.tepi) { s.elPanah = U.h('span', 'panah-tepi', UI.icon('panah', 40)); el.appendChild(s.elPanah); }
      el.appendChild(U.h('span', 'gembok-sasaran', UI.icon('gembok', 34)));
      el.addEventListener('pointerdown', function (e) { e.stopPropagation(); Aud.init(); Aud.sfx('pilih'); A.sentuh(); A._terkena = true; });
      el.addEventListener('click', function () { if (!A._terkena) Aud.sfx('pilih'); A._terkena = false; A.ketukSasaran(s); });
      /* langsung di tempatnya: sasaran baru tidak boleh tampak sekejap di pojok layar */
      Dunia.keLayar(s.x, s.y + s.yTombol, s.z, ls);
      el.style.transform = 'translate(' + ls.x.toFixed(1) + 'px,' + ls.y.toFixed(1) + 'px)';
      A.lapisSasaran.appendChild(el);
      A.sasaran[s.id] = s;
      return s;
    },
    hapusSasaran: function (id) {
      var s = A.sasaran[id];
      if (!s) return;
      if (s.ring) { A.zona.scene.remove(s.ring); s.ring.traverse(function (o) { if (o.geometry) { o.geometry.dispose(); o.material.dispose(); } }); }
      if (s.el.parentNode) s.el.parentNode.removeChild(s.el);
      delete A.sasaran[id];
    },
    bersihSasaran: function () { Object.keys(A.sasaran).forEach(A.hapusSasaran); },
    /* warna cincin sasaran */
    warnaiCincin: function (s, warna) { if (s.ring) s.ring.children[0].material.color.setHex(warna); },
    /* sasaran yang sedang tidak boleh dipakai: cincin abu-abu dan ikon gembok, tetap bisa diketuk untuk tahu alasannya */
    kunciSasaran: function (s, on) {
      s.terkunci = on;
      s.el.classList.toggle('terkunci', on);
      A.warnaiCincin(s, on ? 0x8A8373 : (s.warnaCincin === undefined ? Warna.PAL.kunyit : s.warnaCincin));
    },
    tungguSasaran: function (id) { var s = A.sasaran[id]; return new Promise(function (ok) { s.janji = ok; }); },
    /* tunggu tindakan yang sedang berjalan selesai; tidak pernah selesai bila murid keluar dari bab */
    tungguLuang: function () { return A.sibuk ? new Promise(function (ok) { A._luang = ok; }) : Promise.resolve(); },
    ketukSasaran: function (s) {
      if (A.kunci || !A.sasaran[s.id]) return;
      A.sentuh();
      if (s.cegah && s.cegah(s)) return;
      if (A.sibuk) { A.antrean = s; return; }
      A._kerjakan(s);
    },
    _kerjakan: function (s) {
      A.sibuk = true;
      A.sembunyikanTangan();
      /* berdiri: tempat berdiri yang ditentukan, supaya tokoh tidak menutupi warga yang diajak bicara. tanpaJalan: benda jauh (di laut) yang diketuk dari tempat berdiri. */
      var b = s.berdiri;
      (s.tanpaJalan ? Promise.resolve() : A.hero.pergi(b ? b.x : s.x, b ? b.z : s.z, b ? 0 : s.jarak)).then(function () {
        if (A.mati) return;
        if (b || s.jarak || s.tanpaJalan) A.hero.hadap(s.x, s.z);
        return s.kerja ? s.kerja(s) : null;
      }).then(function () {
        if (A.mati) return;
        A.sibuk = false;
        if (s.janji) { var j = s.janji; s.janji = null; j(s); }
        /* ketukan ganda pada sasaran yang sama tidak dikerjakan dua kali */
        var n = A.antrean; A.antrean = null;
        if (n && n !== s && A.sasaran[n.id] === n) A._kerjakan(n);
        else if (A._luang) { var l = A._luang; A._luang = null; l(); }
      });
    },
    _ketukTanah: function (lx, ly) {
      if (A.mati || A.kunci || A.sibuk || A.tanpaGerak || Tween.paused || document.querySelector('.overlay')) return;
      A.sentuh();
      var p = Dunia.dariLayar(lx, ly, A.zona.tinggi);
      if (!p) return;
      var q = A.zona.jalur.terdekat(p.x, p.z);
      Aud.sfx('tap');
      A.partikel.semprot({ x: q.x, y: A.zona.tinggi(q.x, q.z) + 0.1, z: q.z, n: 5, warna: [Warna.PAL.kertas, Warna.PAL.kunyit], laju: 1.2, naik: 1.2, ukuran: 0.06, umur: 0.45 });
      A.hero.pergi(q.x, q.z);
    },

    /* ===== Penunjuk ===== */
    sentuh: function () {
      A.diamT = 0;
      if ((A.tanganPos || A.tanganLayar) && !A.tanganKekal) A.sembunyikanTangan();
      if (A.rako && A.rako.mode === 'tunjuk' && !A.tanganKekal) A.rako.ikuti(A.hero);
    },
    /* tunjuk titik dunia sampai murid bertindak */
    tunjuk: function (x, y, z, kekal) {
      A.tanganPos = { x: x, y: y, z: z };
      A.tanganKekal = !!kekal;
      A.elTangan.style.display = 'block';
      A.rako.tunjuk(x, y + 2.4, z);
    },
    /* tunjuk titik di layar (tombol Jam Pasir) */
    tunjukLayar: function (lx, ly, kekal) {
      A.tanganPos = null; A.tanganLayar = true; A.tanganKekal = !!kekal;
      A.elTangan.style.display = 'block';
      A.elTangan.style.transform = 'translate(' + lx + 'px,' + ly + 'px)';
    },
    sembunyikanTangan: function () {
      A.tanganPos = null; A.tanganLayar = false; A.tanganKekal = false;
      A.elTangan.style.display = 'none';
      if (A.rako) A.rako.ikuti(A.hero);
    },

    /* ===== Kartu tebakan ===== */
    tebak: function (tanya, pilihan) {
      A.sembunyikanTangan();
      return new Promise(function (ok) {
        var o = UI.overlay(STR.hud.tebakJudul, 'tebak', true), b = o.body;
        b.appendChild(U.h('div', 'tanya', tanya));
        var baris = U.h('div', 'kartu-baris');
        pilihan.forEach(function (p) {
          var t = Input.button(UI.icon(p.id, 96) + '<span>' + p.t + '</span>', 'kartu', function () {
            if (b.dataset.terpilih) return;   // ketukan kedua tidak mengubah tebakan
            b.dataset.terpilih = '1';
            Voice.stop();
            t.classList.add('dipilih'); Aud.sfx('pilih');
            Tween.wait(280).then(function () { o.close(); ok(p.id); });
          }, { id: 'tebak-' + p.id });
          baris.appendChild(t);
        });
        b.appendChild(baris);
        /* fokus tidak dipindah ke kartu pertama: sorotnya bisa disangka jawaban yang disarankan. Panah atau Tab tetap bisa. */
        Voice.say(tanya);
      });
    },

    jeda: function () {
      if (Tween.paused) return;
      Tween.paused = true; Voice.stop();
      var T = STR.jeda, o = UI.overlay(T.title, 'settings');
      function tutup() { o.close(); Tween.paused = false; }
      o.body.appendChild(Input.button(T.lanjut, 'kunyit lebar', tutup, { id: 'jeda-lanjut' }));
      o.body.appendChild(Input.button(T.atur, 'kertas lebar', function () { UI.settings(); }, { id: 'jeda-atur' }));
      o.body.appendChild(Input.button(T.ulang, 'zamrud lebar', function () { Tween.paused = false; Scenes.go(Scenes.name, { ulang: Date.now() }); }, { id: 'jeda-ulang' }));
      o.body.appendChild(Input.button(T.peta, 'zamrud lebar', function () { Tween.paused = false; Scenes.go('peta'); }, { id: 'jeda-peta' }));
      o.body.appendChild(Input.button(T.beranda, 'bata lebar', function () { Tween.paused = false; Scenes.go('judul'); }, { id: 'jeda-beranda' }));
      setTimeout(function () { var f = o.body.querySelector('button'); if (f) f.focus(); }, 30);
    },

    /* ===== Loop ===== */
    update: function (dt) {
      if (A.mati || Tween.paused) return;
      var h = A.hero, b = A.tombol, dx = (b.kanan ? 1 : 0) - (b.kiri ? 1 : 0) + A.stik.x, dz = (b.bawah ? 1 : 0) - (b.atas ? 1 : 0) + A.stik.z;
      if ((dx || dz) && !A.kunci && !A.sibuk && !A.tanpaGerak && !document.querySelector('.overlay')) {
        var pj = Math.sqrt(dx * dx + dz * dz);
        h.gerakArah(dx / pj, dz / pj, dt);
        A._kbJalan = true;
      } else if (A._kbJalan) { A._kbJalan = false; if (h.anim === 'jalan' && !h.rute) h.anim = 'diam'; }
      /* tokoh yang lama diam menoleh ke kamera, agar wajahnya terlihat */
      if (h.anim === 'diam' && !h.rute && !A.dialogAktif && !A.sibuk) { A.diamTokoh = (A.diamTokoh || 0) + dt; if (A.diamTokoh > 2) h.arahTuju = 0.3; }
      else A.diamTokoh = 0;
      h.update(dt);
      A.bayangHero.position.set(h.x, h.dasarY + 0.06, h.z);
      for (var i = 0; i < A.warga.length; i++) {
        var w = A.warga[i];
        w.update(dt);
        if (w.bayang) w.bayang.position.set(w.x, w.dasarY + 0.06, w.z);
      }
      A.rako.update(dt);
      if (A.jam3d && A.jam3d.visible) {
        A.jam3d.position.set(A.hero.x + 1.05, A.hero.dasarY + 1.55 + Math.sin(A.hero.t * 2) * 0.07, A.hero.z + 0.35);
        if (!UI.kurangi) A.jam3d.rotation.y += dt * 1.1;
      }
      A.partikel.update(dt);
      if (A.zona.update) A.zona.update(dt);
      Kamera.ikut(h.x, h.z);
      Kamera.update(dt);
      /* tombol sasaran mengikuti posisi 3D */
      var ids = Object.keys(A.sasaran), T = Warna.U.uWaktu.value;
      for (i = 0; i < ids.length; i++) {
        var s = A.sasaran[ids[i]], luar = false;
        Dunia.keLayar(s.x, s.y + s.yTombol, s.z, ls);
        if (s.tepi) {
          /* sasaran penting di luar layar atau tertutup panel: tombol menempel di tempat aman dengan panah, jadi murid tahu arahnya */
          Dunia.keLayar(s.x, s.y + 0.3, s.z, ka);
          luar = tersembunyi(ka);
          s.el.classList.toggle('tepi', luar);
          if (luar) {
            amankan(ka, am);
            s.elPanah.style.transform = 'rotate(' + Math.atan2(ka.y - am.y, ka.x - am.x).toFixed(2) + 'rad)';
            s.el.style.transform = 'translate(' + am.x.toFixed(1) + 'px,' + am.y.toFixed(1) + 'px)';
          }
        }
        if (!luar) {
          if (ls.x < -40 || ls.x > 1320 || ls.y < -130 || ls.y > 760) s.el.style.display = 'none';
          else { s.el.style.display = ''; s.el.style.transform = 'translate(' + ls.x.toFixed(1) + 'px,' + ls.y.toFixed(1) + 'px)'; }
        }
        if (s.ring) {
          var k = s.sorot ? (UI.kurangi ? 1.25 : 1.2 + Math.sin(T * 6 + i) * 0.16) : (UI.kurangi ? 1 : 1 + Math.sin(T * 4.2 + i) * 0.07);
          s.ring.scale.set(k, 1, k);
        }
      }
      if (A.elAksi) A._perbaruiAksi();
      /* isyarat bila 8 detik tidak ada aksi */
      A.diamT += dt;
      if (A.diamT >= 8 && !A.tanganPos && !A.tanganLayar && !document.querySelector('.overlay')) {
        var u = A.dialogAktif ? TITIK_LANJUT : (A.utama && !A.kunci ? (typeof A.utama === 'function' ? A.utama() : A.utama) : null);
        if (u && u.lx !== undefined) A.tunjukLayar(u.lx, u.ly);
        else if (u) A.tunjuk(u.x, u.y !== undefined ? u.y : A.zona.tinggi(u.x, u.z), u.z);
      }
      if (A.tanganPos) {
        Dunia.keLayar(A.tanganPos.x, A.tanganPos.y + 0.1, A.tanganPos.z, ls);
        A.elTangan.style.transform = 'translate(' + ls.x.toFixed(1) + 'px,' + ls.y.toFixed(1) + 'px)';
      }
      Dunia.render(dt);
    }
  };
  var KUNCI = { ArrowUp: 'atas', ArrowDown: 'bawah', ArrowLeft: 'kiri', ArrowRight: 'kanan', w: 'atas', s: 'bawah', a: 'kiri', d: 'kanan', W: 'atas', S: 'bawah', A: 'kiri', D: 'kanan' };
  root.Arena = A;
})(window);
