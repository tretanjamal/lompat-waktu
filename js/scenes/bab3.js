/* Bab 3 Teluk Karang: ikan bisa bertambah lagi, tetapi juga bisa habis. Murid ikut melaut, lalu mengatur jala, pelampung, dan sampah. */
(function () {
  var S = STR.bab3, SAS = Soal.SASARAN_BAB3;

  function alur(z) {
    var A = Arena;
    function jumlahAktif() { return z.aktif.filter(Boolean).length; }
    function sasaranJala(k, ctl) {
      ctl.sasaran({ id: 'jala', kat: 'jala', x: z.RAK.x, z: z.RAK.z + 0.5, jari: 1.25, jarak: 1.5, yTombol: 1.15, label: S.labelJala, nama: S.labelJala, kerja: async function () {
        await z.gantiJala(k.rapat);
        k.rapat = !k.rapat;
        A.kata(k.rapat ? S.infoRapat : S.infoLonggar, 'rako', 'senang', { info: true });
      } });
    }
    function sasaranPelampung(k, ctl, i) {
      var p = z.PELAMPUNG[i];
      var s = ctl.sasaran({ id: 'pel' + i, kat: 'laut', x: p[0], z: p[1], y: z.Y_AIR + 0.03, jari: 0.72, tanpaJalan: true, yTombol: 0.32, label: S.labelPelampung, nama: i === 1 ? S.labelPelampung : null, kerja: async function (t) {
        var on = !z.aktif[i];
        z.aturPelampung(i, on);
        k.trip = jumlahAktif();
        t.warnaCincin = on ? Warna.PAL.kunyit : Warna.PAL.kertas;
        if (!t.terkunci) A.warnaiCincin(t, t.warnaCincin);
      } });
      s.warnaCincin = z.aktif[i] ? Warna.PAL.kunyit : Warna.PAL.kertas;
      A.warnaiCincin(s, s.warnaCincin);
    }
    var D = {
      bab: 3, S: S, hero: [-6, 3.6, 0.4],
      warga: { kunci: 'bahar', x: -2.6, z: 2, arah: 0.7, berdiri: { x: -4.4, z: 2.4 } },
      musik: 'laut', ambien: 'pantai', ambienPulih: 'pantai',
      indikator: ['ikan', 'warga', 'sampah'], kolom: ['ikan', 'warga', 'sampah'], sasaran: { ikan: SAS.ikan, warga: SAS.warga },
      satuHal: 1, tagSerupa: 'seimbang',
      satwa: ['penyu', 'kakatua', 'karang'],
      misTeratasi: ['berhenti-terbaik'],
      keadaanAwal: function () { return { rapat: true, trip: 5, c: 0 }; },
      nilai: function (k) { return Soal.nilaiBab3(k.rapat, k.trip, k.c); },
      tindakan: function (k) { return U.fmt(S.tindakan, { jala: k.rapat ? S.jalaRapat : S.jalaLonggar, n: k.trip, c: k.c }); },
      kategori: function (a, b) { var r = []; if (a.rapat !== b.rapat) r.push('jala'); if (a.trip !== b.trip) r.push('laut'); if (a.c !== b.c) r.push('sampah'); return r; },
      chips: function (k) {
        return [
          { ikon: 'jala', t: k.rapat ? S.chipRapat : S.chipLonggar, cukup: !k.rapat },
          { ikon: 'perahu', t: U.fmt(S.chipLaut, { n: k.trip }) },
          { ikon: 'sampah', t: U.fmt(S.chipSampah, { n: k.c }), cukup: k.c === 3 },
          { t: U.fmt(S.chipSasaran, { i: SAS.ikan, w: SAS.warga }) }
        ];
      },
      tebakPertama: function (v) { return { tanya: S.tebak1, label: STR.indikator.ikan, arah: v.arahIkan }; },
      catatTebakPertama: function (pilih, arah) { if (pilih !== arah) Save.catatMis('laut-luas'); },
      /* ikut melaut: naik perahu, tebar jala, kembali */
      pandu: async function () {
        A.kata(S.naikPerahu);
        A.tambahSasaran({ id: 'perahu', x: z.PERAHU.x, z: z.PERAHU.z, y: z.Y_AIR + 0.1, jari: 1.15, berdiri: { x: 5.6, z: 0.8 }, yTombol: 0.5, label: S.labelPerahu, nama: S.labelPerahu, tepi: true });
        A.utama = { x: z.PERAHU.x, y: 0, z: z.PERAHU.z };
        A.tunjuk(z.PERAHU.x, 0, z.PERAHU.z, true);
        await A.tungguSasaran('perahu');
        A.hapusSasaran('perahu'); A.utama = null;
        A.kunci = true; A.sembunyikanTangan();
        await z.berlayar(true);
        A.kunci = false; A.tanpaGerak = true;
        A.kata(S.tebarJala);
        var p = z.PELAMPUNG[0];
        A.tambahSasaran({ id: 'tebar', x: p[0], z: p[1], y: z.Y_AIR + 0.03, jari: 0.95, tanpaJalan: true, yTombol: 0.32, label: S.labelPelampung, nama: S.labelPelampung, tepi: true });
        A.utama = { x: p[0], y: 0, z: p[1] };
        A.tunjuk(p[0], 0, p[1], true);
        await A.tungguSasaran('tebar');
        A.hapusSasaran('tebar'); A.utama = null; A.sembunyikanTangan();
        A.kunci = true;
        await z.tebarJala();
        A.kata(S.hasilJala, 'rako', 'pikir');
        await A.tungguBicara(1800);
        await z.berlayar(false);
        A.kunci = false; A.tanpaGerak = false;
      },
      tebakan: function (k, v) { return { tanya: S.tebak2, label: STR.indikator.ikan, arah: v.arahIkan }; },
      pasang: function (k, ctl) {
        sasaranJala(k, ctl);
        z.PELAMPUNG.forEach(function (p, i) { sasaranPelampung(k, ctl, i); });
        z.SAMPAH.forEach(function (p, i) {
          if (z.selesaiSampah[i]) return;
          ctl.sasaran({ id: 'sampah' + i, kat: 'sampah', x: p[0], z: p[1], jari: 0.8, jarak: 1.1, yTombol: 0.42, label: S.labelSampah, nama: i === 1 ? S.labelSampah : null, kerja: async function (s) { A.hapusSasaran(s.id); await z.angkatSampah(i); k.c++; } });
        });
      },
      /* isyarat diam 8 detik: jala dulu, lalu pelampung, lalu sampah */
      utama: function (k) {
        if (k.rapat && A.sasaran.jala) return { x: z.RAK.x, z: z.RAK.z };
        var i;
        if (k.trip > 2) for (i = 0; i < 5; i++) if (z.aktif[i]) return { x: z.PELAMPUNG[i][0], y: 0, z: z.PELAMPUNG[i][1] };
        if (k.c < 3) for (i = 0; i < 3; i++) if (!z.selesaiSampah[i]) return { x: z.SAMPAH[i][0], z: z.SAMPAH[i][1] };
        return null;
      },
      sorot: function (k) {
        var r = [];
        if (k.rapat) r.push('jala');
        z.aktif.forEach(function (on, i) { if (on && k.trip > 2) r.push('pel' + i); });
        z.selesaiSampah.forEach(function (ok, i) { if (!ok) r.push('sampah' + i); });
        return r;
      },
      catatMis: function (k) { if (k.trip === 0) Save.catatMis('berhenti-terbaik'); },
      peragaan: async function (k) {
        var i, p;
        if (k.rapat) {
          A.tunjuk(z.RAK.x, z.tinggi(z.RAK.x, z.RAK.z), z.RAK.z, true);
          await A.hero.pergi(z.RAK.x, z.RAK.z + 0.5, 1.5);
          await z.gantiJala(true); k.rapat = false;
          A.aturChips(D.chips(k));
        }
        for (i = 0; i < 5; i++) {
          var mau = i < 2;
          if (z.aktif[i] === mau) continue;
          p = z.PELAMPUNG[i];
          A.tunjuk(p[0], 0, p[1], true);
          z.aturPelampung(i, mau);
          k.trip = jumlahAktif();
          A.aturChips(D.chips(k));
          await Tween.wait(420);
        }
        for (i = 0; i < 3; i++) {
          if (z.selesaiSampah[i]) continue;
          p = z.SAMPAH[i];
          A.tunjuk(p[0], z.tinggi(p[0], p[1]), p[1], true);
          await A.hero.pergi(p[0], p[1], 1.1);
          await z.angkatSampah(i); k.c++;
          A.aturChips(D.chips(k));
        }
      },
      simpulNilai: function (v1, v2) { return { i1: Math.round(v1.akhir.ikan), i2: Math.round(v2.akhir.ikan) }; }
    };
    Percobaan.jalankan(z, D);
  }

  Percobaan.daftarkan('bab3', 'teluk', ZonaTeluk.buat, alur);
})();
