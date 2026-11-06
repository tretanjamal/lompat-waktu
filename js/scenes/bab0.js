/* Bab 0 Tanjung Awal: hook menanam dan Lompat Waktu pertama, pilih penjaga, temui Bu Ratna, tur 5 Kartu Sumber Daya, tebakan awal memilah. */
(function () {
  var S = STR.bab0;

  /* Hook: tanam, Jam Pasir terbalik sendiri, 20 tahun berlalu dalam beberapa detik */
  async function hook(z) {
    var A = Arena, T = z.TITIK, y = z.tinggi(T.x, T.z);
    A.fase = 'hook';
    A.misi(S.hook1, []);
    A.kata(S.hook1);
    A.utama = { x: T.x, z: T.z };
    A.tambahSasaran({ id: 'titik', x: T.x, z: T.z, jari: 0.95, jarak: 0.95, label: S.hook1, kerja: async function () {
      A.hero.main('tanam', 560);
      await Tween.wait(180);
      Aud.sfx('tanam');
      z.tanamBibit();
      A.tambahDaun(1, T.x, y, T.z);
      A.partikel.semprot({ x: T.x, y: y + 0.15, z: T.z, n: 14, warna: [0x8A5F38, 0x6B4526, Warna.PAL.pucuk], laju: 1.8, naik: 2.6 });
      await Tween.wait(320);
    } });
    A.tunjuk(T.x, y, T.z, true);
    await A.tungguSasaran('titik');
    A.hapusSasaran('titik');
    A.utama = null;
    A.kunci = true;

    A.hud.classList.add('sembunyi');
    Aud.sfx('jam');
    A.hero.pergi(T.x - 2.1, T.z + 2);   // mundur agar pohon yang tumbuh tidak menutupi tokoh
    var w = U.h('div', 'lapis-lompat');
    A.akar.appendChild(w);
    if (!UI.kurangi) {
      var jb = UI.jamBesar(w);
      await Tween.wait(800);
      jb.remove();
    }
    var pil = U.h('div', 'lapis tahun', '<small>' + STR.hud.melompat + '</small><b></b>'), elB = pil.querySelector('b');
    elB.textContent = U.fmt(STR.hud.tahun, { t: 0 });
    w.appendChild(pil);
    Aud.musik('hutan'); Aud.ambien('hutan'); Aud.sfx('tumbuh');
    var dur = UI.kurangi ? 900 : 3200;
    z.burungDatang();
    if (!UI.kurangi) Tween.run(dur, function (e) { Kamera.zoom = 1 + Math.sin(e * Math.PI) * 0.07; }, Ease.linear);
    Tween.wait(dur * 0.35).then(function () { Aud.sfx('gelombang'); });
    await Tween.run(dur, function (e) {
      z.tumbuhHook(e);
      elB.textContent = U.fmt(STR.hud.tahun, { t: Math.round(e * 20) });
      Warna.atur(0, T.x, T.z, 0.3 + e * e * 52);
      if (Math.random() < 0.3) A.partikel.semprot({ x: T.x, y: y + 0.4 + e * 3, z: T.z, n: 1, warna: [Warna.PAL.pucuk, Warna.PAL.zamrud, Warna.PAL.kunyit], laju: 2.4, naik: 2.2, ukuran: 0.08, umur: 1 });
    }, Ease.linear);
    z.tumbuhHook(1);
    pil.querySelector('small').textContent = STR.hud.duapuluh;
    elB.textContent = S.hookJudul;
    A.fase = 'hook-akhir';
    A.hero.ekspresi('sorak'); A.hero.anim = 'sorak';
    Aud.sfx('cerah');
    await Tween.wait(1500);
    A.hud.classList.remove('sembunyi');
    A.elMisi.style.visibility = 'hidden';
    await A.dialog(S.hook3, 'rako', 'sorak');
    await A.dialog(S.hook4, 'rako', 'senang');
    pil.remove();
    w.remove();
    A.elMisi.style.visibility = '';

    /* kembali ke hari ini: warna hanya tersisa di sekitar bibit */
    Aud.sfx('kembali');
    A.hero.anim = 'diam'; A.hero.ekspresi('senang');
    z.burungPergi();
    Aud.musik('sunyi'); Aud.ambien('pantai');
    await Tween.run(UI.kurangi ? 200 : 1100, function (e) {
      z.tumbuhHook(1 - e);
      Warna.atur(0, T.x, T.z, 2.6 + (1 - e) * (1 - e) * 50);
    }, Ease.easeInOutCubic);
    z.tumbuhHook(0);
    z.tanamBibit();
    A.kunci = false;
  }

  /* memilah 5 kartu ke dua kotak: seret, atau ketuk kartu lalu ketuk kotak. tanya: kalimat di atas panel. Hasil: {hutan: 'pulih'|'tidak', ...} */
  function pilah(tanya) {
    var keys = ['hutan', 'air', 'tanah', 'ikan', 'tambang'];
    tanya = tanya || S.pilahTanya;
    return new Promise(function (ok) {
      var o = UI.overlay(S.pilahA + ' / ' + S.pilahB, 'pilah', false), b = o.body, terpilih = null, sisa = keys.length, hasil = {};
      b.appendChild(U.h('div', 'tanya', tanya));
      b.appendChild(U.h('div', 'bantu', S.pilahBantu));
      var tumpuk = U.h('div', 'tumpuk'), baris = U.h('div', 'kotak-baris');
      function bikinKotak(id, label, kelas) {
        var kb = Input.button('', 'kotak-pilah ' + kelas, function () { if (terpilih) taruh(terpilih, kb); }, { id: 'kotak-' + id, aria: label });
        kb.innerHTML = '<div class="jd">' + label + '</div><div class="isi-kotak"></div>';
        kb.dataset.pilih = id;
        baris.appendChild(kb);
        return kb;
      }
      bikinKotak('pulih', S.pilahA, 'a'); bikinKotak('tidak', S.pilahB, 'b');
      function taruh(k, kotak) {
        hasil[k.kunci] = kotak.dataset.pilih;
        var img = U.h('img'); img.alt = STR.kartu[k.kunci].nama; img.src = Foto.kartu(k.kunci) || ''; img.draggable = false;
        kotak.querySelector('.isi-kotak').appendChild(img);
        k.el.remove();
        terpilih = null;
        Aud.sfx('tanam');
        Arena.tambahDaun(1);
        sisa--;
        if (sisa === 0) {
          Voice.stop();
          Tween.wait(420).then(function () { o.close(); ok(hasil); });
        } else { var f = tumpuk.querySelector('button'); if (f) f.focus({ preventScroll: true }); }
      }
      keys.forEach(function (kunci) {
        var isi = '<img alt="" draggable="false" src="' + (Foto.kartu(kunci) || '') + '"><span>' + STR.kartu[kunci].nama + '</span>', d = { kunci: kunci };
        var el = Input.button(isi, 'ktr', function () {
          if (d.seretSelesai) { d.seretSelesai = false; return; }
          tumpuk.querySelectorAll('.terpilih').forEach(function (x) { x.classList.remove('terpilih'); });
          el.classList.add('terpilih'); terpilih = d; Aud.sfx('pilih');
        }, { id: 'ktr-' + kunci });
        d.el = el;
        /* seret */
        var sx = 0, sy = 0, hantu = null;
        el.addEventListener('pointerdown', function (e) { sx = e.clientX; sy = e.clientY; hantu = null; try { el.setPointerCapture(e.pointerId); } catch (x) { } });
        el.addEventListener('pointermove', function (e) {
          if (e.buttons === 0 && e.pointerType === 'mouse') return;
          if (!hantu && Math.abs(e.clientX - sx) + Math.abs(e.clientY - sy) > 14 && (e.pressure > 0 || e.buttons)) {
            hantu = el.cloneNode(true); hantu.classList.add('seret');
            hantu.style.transform = Stage.transformLuar();   // di luar panggung, jadi skala dan putarannya harus diberi sendiri
            hantu.removeAttribute('data-id');
            document.body.appendChild(hantu);
            el.style.visibility = 'hidden';
          }
          if (hantu) {
            Stage.letakLuar(hantu, e.clientX, e.clientY);
            var di = document.elementFromPoint(e.clientX, e.clientY), kt = di && di.closest && di.closest('.kotak-pilah');
            baris.querySelectorAll('.kotak-pilah').forEach(function (x) { x.classList.toggle('sasar', x === kt); });
          }
        });
        function lepas(e) {
          if (!hantu) return;
          hantu.style.display = 'none';
          var di = document.elementFromPoint(e.clientX, e.clientY), kt = di && di.closest && di.closest('.kotak-pilah');
          hantu.remove(); hantu = null;
          el.style.visibility = '';
          baris.querySelectorAll('.kotak-pilah').forEach(function (x) { x.classList.remove('sasar'); });
          d.seretSelesai = true;   // klik yang menyusul seret bukan ketukan memilih; tidak semua peramban mengirimnya
          setTimeout(function () { d.seretSelesai = false; }, 60);
          if (kt) taruh(d, kt);
        }
        el.addEventListener('pointerup', lepas);
        el.addEventListener('pointercancel', lepas);
        tumpuk.appendChild(el);
      });
      b.appendChild(tumpuk); b.appendChild(baris);
      Voice.say(tanya);
    });
  }

  async function alur(z) {
    var A = Arena;
    A.elJam.style.display = 'none';   // di Bab 0 Jam Pasir bekerja sendiri
    A.hero.taruh(-1.2, 4.6, 0.6);
    A.rako.taruh(0, 5, 4);
    Kamera.ikut(A.hero.x, A.hero.z); Kamera.lompatKe();
    /* kamera meluncur dari atas ke tokoh */
    if (!UI.kurangi) Tween.run(1300, function (e) { Kamera.zoom = 1.9 - 0.9 * e; }, Ease.easeInOutCubic);
    Aud.musik('sunyi'); Aud.ambien('pantai');
    Aud.pramuat('hutan');
    await hook(z);

    A.fase = 'pilih';
    var kunci = await Peta.pilihPenjaga();
    if (kunci !== A.hero.kunci) A.gantiHero(kunci);

    A.fase = 'ratna';
    var R = z.RATNA;
    var ratna = A.tambahWarga('ratna', R.x, R.z, 0.5);
    z.jalur.rintangan(R.x, R.z, 0.5);
    A.misi(S.jalan, []);
    A.kata(S.jalan);
    A.tambahSasaran({ id: 'ratna', x: R.x, z: R.z, jari: 0.95, berdiri: { x: R.x + 1.7, z: R.z + 0.3 }, yTombol: 1.3, label: S.label.ratna, nama: S.label.ratna, tepi: true });
    A.utama = { x: R.x, z: R.z };
    A.tunjuk(R.x, z.tinggi(R.x, R.z), R.z, true);
    ratna.anim = 'lambai';
    await A.tungguSasaran('ratna');
    A.hapusSasaran('ratna');
    A.utama = null;
    ratna.hadap(A.hero.x, A.hero.z); ratna.anim = 'bicara';
    await A.dialog(S.ratna, 'ratna', 'senang');
    ratna.anim = 'diam';

    /* tur lima sumber daya */
    A.fase = 'tur';
    var kunciT = Object.keys(z.TEMPAT), sisa = kunciT.length;
    A.misi(S.tur, []);
    A.kata(S.tur);
    await new Promise(function (ok) {
      kunciT.forEach(function (k) {
        var t = z.TEMPAT[k];
        A.tambahSasaran({ id: k, x: t.x, z: t.z, jari: 0.85, jarak: 0.4, label: STR.kartu[k].nama, nama: STR.kartu[k].nama, tepi: true, kerja: async function (s) {
          A.hapusSasaran(s.id);
          A.tambahDaun(1, t.x, z.tinggi(t.x, t.z), t.z);
          await Papan.kartu('sumber', k);
          sisa--;
          if (sisa > 0) A.kata(U.fmt(S.turSisa, { n: sisa }));
          else ok();
        } });
      });
      A.utama = function () { var ids = Object.keys(A.sasaran); if (!ids.length) return null; var s = A.sasaran[ids[0]]; return { x: s.x, z: s.z }; };
    });
    A.utama = null;

    A.fase = 'pilah';
    var tebakan = await pilah();
    /* yang dicatat untuk guru hanya tebakan pertama, walau bab ini dimainkan lagi */
    if (!Object.keys(Save.data.tebakanAwal).length) { Save.data.tebakanAwal = tebakan; Save.save(); }
    A.hero.anim = 'sorak'; A.hero.ekspresi('sorak');
    A.fase = 'selesai';
    await A.dialog(S.pilahSelesai, 'rako', 'sorak');
    Save.data.onboarded = true;
    Save.catatBab(0, { selesai: true, stars: 1 });
    var popL = Lencana.pop(A.akar, 0);
    await A.dialog(U.fmt(S.lencana, { nama: STR.bab[0].lencana }), 'rako', 'sorak');
    if (popL) popL.remove();
    await A.dialog(S.keBab1, 'rako', 'senang');
    Scenes.go('peta', { saran: 1 });
  }

  window.PilahKartu = pilah;   // dipakai lagi di akhir Bab 4

  var tiket = 0;
  Scenes.add('bab0', {
    enter: function (akar) {
      var t = ++tiket;
      Aset3D.muatZona('tanjung').then(function () {
        if (t !== tiket) return;   // murid sudah pindah layar sebelum model selesai dimuat
        var z = ZonaTanjung.buat();
        Arena.mulai(akar, z, { bab: 0 });
        alur(z);
      });
    },
    update: function (dt) { Arena.update(dt); },
    exit: function () { tiket++; Arena.tutup(); }
  });
})();
