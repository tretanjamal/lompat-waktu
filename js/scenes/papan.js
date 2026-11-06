/* Papan Tantangan adaptif, kesimpulan dengan bukti, dan kartu yang didapat.
   Salah ke-1: dorongan. Ke-2: sorot kata penting. Ke-3: tunjukkan jawabannya. Soal yang sempat salah muncul lagi dalam bentuk serupa di akhir papan. */
(function (root) {
  function jadiHtmlTanya(q, sorot) {
    var t = q.t;
    if (sorot && q.kunci) q.kunci.forEach(function (k) { t = t.replace(k, '<b>' + k + '</b>'); });
    return t;
  }
  /* tanda benar bukan hanya warna */
  function tandaiBenar(tb) {
    tb.classList.add('benar');
    tb.querySelector('.lbl').insertAdjacentHTML('afterbegin', UI.icon('centang', 34));
  }

  var Papan = {
    /* Kartu Sumber Daya atau Kartu Satwa yang baru didapat */
    kartu: function (jenis, kunci) {
      var isi = (jenis === 'satwa' ? STR.satwa : STR.kartu)[kunci], gudang = jenis === 'satwa' ? Save.data.satwa : Save.data.kartu;
      gudang[kunci] = true; Save.save();
      return new Promise(function (ok) {
        var o = UI.overlay((jenis === 'satwa' ? STR.satwa : STR.kartu).judul, 'kartu-sumber', true);
        var img = Foto.kartu(kunci);
        o.body.innerHTML = '<div class="isi-kartu">' + (img ? '<img alt="" src="' + img + '" draggable="false">' : '') + '<div><div class="nama">' + isi.nama + '</div><div class="kal">' + isi.isi + '</div></div></div>';
        var b = Input.button(STR.hud.lanjut, 'kunyit lebar', function () { Voice.stop(); o.close(); ok(); }, { id: 'tutup-kartu' });
        o.body.appendChild(b);
        Aud.sfx('tumbuh');
        Voice.say(isi.isi);
        setTimeout(function () { b.focus({ preventScroll: true }); }, 40);
      });
    },

    /* Kesimpulan dua langkah: klaim lalu bukti. nilai: {h1, h2}. Hasil: {pertama: benar pada coba pertama di kedua langkah} */
    simpul: function (data, nilai) {
      var pertama = true;
      function fmt(s) { return U.fmt(s, nilai); }
      function langkah(judul, daftar, tag) {
        return new Promise(function (ok) {
          var o = UI.overlay(data.judul, 'papan-t', true), b = o.body, ada = false, salahKe = 0;
          b.appendChild(U.h('div', 'simpul-awal', judul));
          var wadah = U.h('div', 'piltombol'), um = U.h('div', 'umpan');
          U.shuffle(Math.random, daftar).forEach(function (p) {
            var tb = Input.button(fmt(p.t), 'opsi', function () {
              if (ada) return;
              Voice.stop();
              if (p.benar) {
                ada = true; tandaiBenar(tb); Aud.sfx('good'); um.classList.remove('on');
                Save.catat(tag, salahKe === 0);
                if (salahKe === 0) daftar.forEach(function (x) { Save.atasiMis(x.mis); });
                Arena.tambahDaun(salahKe === 0 ? 3 : 1);
                Tween.wait(560).then(function () { o.close(); ok(); });
              } else {
                pertama = false; salahKe++;
                tb.classList.remove('salah'); void tb.offsetWidth; tb.classList.add('salah');
                Aud.sfx('bad'); Save.catatSalah(tag); Save.catatMis(p.mis);
                um.textContent = fmt(p.fb || STR.papan.dorong); um.classList.add('on');
                Voice.say(um.textContent);
              }
            }, { id: 'simpul-' + daftar.indexOf(p) });
            if (U.TEST) tb.dataset.benar = p.benar ? '1' : '0';
            wadah.appendChild(tb);
          });
          b.appendChild(wadah); b.appendChild(um);
          Voice.say(judul);
        });
      }
      return langkah(data.awal, data.klaim, data.tagKlaim || 'laju-pulih').then(function () { return langkah(data.karena, data.bukti, 'kp-simpul'); }).then(function () { return { pertama: pertama }; });
    },

    /* satu soal serupa setelah Rako memperagakan caranya */
    satuSoal: function (bab, tag) {
      var daftar = BANK_SOAL.filter(function (q) { return q.bab.indexOf(bab) >= 0 && q.tag === tag; });
      if (!daftar.length) daftar = BANK_SOAL.filter(function (q) { return q.bab.indexOf(bab) >= 0; });
      return Papan.mulai({ bab: bab, jumlah: 0, antre: [Soal.acakPilihan(daftar[Math.floor(Math.random() * daftar.length)], Math.random)] });
    },

    /* o: bab, jumlah, antre (soal yang langsung ditampilkan sebagai soal serupa). Hasil: {benar, total, kilat} */
    mulai: function (o) {
      var T = STR.papan, rnd = Math.random, sudah = [], antre = o.antre || [], keadaan = { tingkat: Save.data.tingkat, benar: 0, salah: 0 };
      var jumlah = o.jumlah === undefined ? 3 : o.jumlah, ke = 0, benarLangsung = 0, totalDinilai = 0, t0 = performance.now(), santai = Save.data.settings.santai;
      var panel = UI.overlay(T.judul, 'papan-t', true);
      return new Promise(function (selesai) {
        function akhir() {
          var dur = (performance.now() - t0) / 1000, kilat = !santai && dur <= 60 && benarLangsung === totalDinilai;
          Save.data.tingkat = keadaan.tingkat; Save.save();
          panel.close();
          selesai({ benar: benarLangsung, total: totalDinilai, kilat: kilat });
        }
        function berikut() {
          if (ke < jumlah) {
            var belum = Object.keys(STR.guru.tag).filter(function (t) { return !Save.data.keterampilan[t]; });
            var q = Soal.ambil(BANK_SOAL, o.bab, keadaan.tingkat, sudah, rnd, belum);
            ke++; sudah.push(q.id); tampil(q, false);
          }
          else if (antre.length) { var u = antre.shift(); sudah.push(u.id); tampil(u, true); }
          else akhir();
        }
        function tampil(q, ulangan) {
          var b = panel.body, salahKe = 0, tuntas = false;
          b.innerHTML = '';
          b.appendChild(U.h('div', 'hitung', ulangan ? T.serupa : U.fmt(T.hitung, { i: ke, n: jumlah })));
          var tanya = U.h('div', 'tanya', jadiHtmlTanya(q, false));
          b.appendChild(tanya);
          var wadah = U.h('div', 'piltombol'), um = U.h('div', 'umpan');
          q.pilihan.forEach(function (p, i) {
            var tb = Input.button(p.t, 'opsi', function () {
              if (tuntas) return;
              Voice.stop();
              if (p.benar) {
                tuntas = true; tandaiBenar(tb); Aud.sfx('good');
                var langsung = salahKe === 0;
                totalDinilai++; if (langsung) benarLangsung++;
                Save.catat(q.tag, langsung);
                if (langsung) { Soal.aturTingkat(keadaan, true); q.pilihan.forEach(function (x) { Save.atasiMis(x.mis); }); }
                Arena.tambahDaun(langsung ? 2 : 1);
                um.textContent = T.benar + ' ' + q.jelas; um.classList.add('on');
                Voice.say(um.textContent);
                lanjut();
              } else {
                salahKe++;
                tb.classList.remove('salah'); void tb.offsetWidth; tb.classList.add('salah');
                Aud.sfx('bad'); Save.catatSalah(q.tag); Save.catatMis(p.mis);
                if (salahKe === 1) {
                  Soal.aturTingkat(keadaan, false);
                  if (!ulangan) antre.push(Soal.serupa(BANK_SOAL, q, o.bab, sudah, rnd));
                }
                if (salahKe === 1) { um.textContent = p.fb || T.dorong; }
                else if (salahKe === 2) { um.textContent = p.fb || T.dorong; tanya.innerHTML = jadiHtmlTanya(q, true); }
                else {
                  tuntas = true; totalDinilai++;
                  q.pilihan.forEach(function (x, j) { if (x.benar) tandaiBenar(wadah.children[j]); });
                  um.textContent = T.jawaban + ' ' + q.jelas;
                  Save.catat(q.tag, false);
                  lanjut();
                }
                um.classList.add('on');
                Voice.say(um.textContent);
              }
            }, { id: 'opsi-' + i });
            if (U.TEST) tb.dataset.benar = p.benar ? '1' : '0';
            wadah.appendChild(tb);
          });
          b.appendChild(wadah); b.appendChild(um);
          function lanjut() {
            var nx = Input.button(T.lanjut, 'kunyit lanjut-papan', function () { Voice.stop(); berikut(); }, { id: 'lanjut-papan' });
            b.appendChild(nx);
            setTimeout(function () { nx.focus({ preventScroll: true }); }, 40);
          }
          Voice.say(q.t);
        }
        berikut();
      });
    }
  };
  root.Papan = Papan;
})(window);
