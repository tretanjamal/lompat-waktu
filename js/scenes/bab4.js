/* Bab 4 Bukit Batu: tambang tidak bisa pulih. Uji khusus 100 tahun menunjukkan bedanya dengan hutan. Akhir bab: memilah ulang kartu dengan bukti. */
(function () {
  var S = STR.bab4, H = STR.hud, SAS = Soal.SASARAN_BAB4;

  function alur(z) {
    var A = Arena;
    function jumlahUrat() { return z.uratAktif.filter(Boolean).length; }
    function jumlahKincir() { return z.kincir.filter(Boolean).length; }
    /* warna cincin menunjukkan keadaan: kunyit = sedang digali atau belum dipasang */
    function warnaSasaran(s, aktif) { s.warnaCincin = aktif ? Warna.PAL.kunyit : Warna.PAL.kertas; if (!s.terkunci) A.warnaiCincin(s, s.warnaCincin); }
    var D = {
      bab: 4, S: S, hero: [1, 3.8, 0.3],
      warga: { kunci: 'mira', x: -6.2, z: 0.6, arah: 0.6, berdiri: { x: -4.5, z: 1.1 } },
      musik: 'bukit', ambien: 'sunyi', ambienPulih: 'hutan',
      indikator: ['tambang', 'warga', 'hutan'], kolom: ['tambang', 'warga'], sasaran: { tambang: SAS.tambang, warga: SAS.warga },
      satuHal: 1, tagSerupa: 'solusi',
      satwa: ['bunga'],
      kartuBaru: ['batubara', 'angin', 'matahari'],
      misTeratasi: ['berhenti-terbaik'],
      keadaanAwal: function () { return { u: 4, daur: false, k: 0 }; },
      nilai: function (k) { return Soal.nilaiBab4(k.u * 2, k.daur, k.k); },
      tindakan: function (k) { return U.fmt(S.tindakan, { u: k.u, d: k.daur ? S.nyala : S.mati, k: k.k }); },
      kategori: function (a, b) { var r = []; if (a.u !== b.u) r.push('urat'); if (a.daur !== b.daur) r.push('mesin'); if (a.k !== b.k) r.push('kincir'); return r; },
      chips: function (k) {
        return [
          { ikon: 'logam', t: U.fmt(S.chipUrat, { n: k.u }) },
          { ikon: 'mesin', t: U.fmt(S.chipMesin, { s: k.daur ? S.nyala : S.mati }), cukup: k.daur },
          { ikon: 'kincir', t: U.fmt(S.chipKincir, { k: k.k }), cukup: k.k > 0 },
          { t: U.fmt(S.chipSasaran, { c: SAS.tambang, w: SAS.warga }) }
        ];
      },
      tebakPertama: function (v) { return { tanya: S.tebak1, label: STR.indikator.tambang, arah: v.arahTambang }; },
      catatTebakPertama: function (pilih) { if (pilih === 'naik') Save.catatMis('tambang-tumbuh'); },
      hasilAwal: function (v) { var T = S.hasil.awal; return { judul: U.fmt(T.judul, { th: v.tahunHabis }), apa: U.fmt(T.apa, { th: v.tahunHabis }), rantai: T.rantai }; },
      /* uji khusus: dunia tetap di tahun ke-20, bibit ditanam di lubang, lalu lompat 100 tahun */
      setelahPertama: async function (v1) {
        A.fase = 'uji';
        await A.dialog(S.uji1, 'rako', 'pikir');
        A.fase = 'uji-tebak';
        var pil = await A.tebak(S.ujiTebak, Percobaan.pilihanArah(S.pil1));
        if (pil === 'naik') Save.catatMis('tambang-tumbuh');
        Save.catat('terbarukan', pil === 'tetap');
        A.fase = 'uji-tanam';
        A.kata(S.ujiTanam);
        A.tambahSasaran({ id: 'lubang', x: z.LUBANG.x, z: z.LUBANG.z, jari: 1.15, jarak: 2.5, yTombol: 0.3, label: S.labelLubang, nama: S.labelLubang, tepi: true, kerja: async function () { await z.tanamDiLubang(); } });
        A.utama = { x: z.LUBANG.x, z: z.LUBANG.z };
        A.tunjuk(z.LUBANG.x, z.tinggi(z.LUBANG.x, z.LUBANG.z), z.LUBANG.z, true);
        await A.tungguSasaran('lubang');
        A.hapusSasaran('lubang'); A.utama = null;
        A.fase = 'uji-jam';
        A.jamLabel(H.jam100);
        await Percobaan.balikJam(A, S.ujiJam);
        A.fase = 'uji-lompat';
        var r = Soal.bab4Seratus(v1.akhir), T = S.hasil.seratus;
        var o = await Lompat.jalankan({
          riwayat: r, indikator: ['tambang', 'hutan'], judul: T.judul, apa: T.apa, rantai: T.rantai, baik: false, seratus: true, cepat: false, bolehLewati: false, labelAkhir: H.seratusTahun,
          tebakan: { label: STR.indikator.tambang, pilih: S.pil1[pil], hasil: S.pil1.tetap },
          balik: true, tombol: H.kembali, riwayatMundur: v1.riwayat
        });
        A.jamLabel(H.jam);
        Jurnal.catat(4, { tindakan: S.tindakanUji, kolom: D.kolom, indikator: ['tambang', 'hutan'], tebakan: S.pil1[pil], akhir: r[100], riwayat: r, foto: o.foto, kelas: 'seratus' });
        await A.dialog(S.uji2, 'rako', 'senang');
        A.fase = 'bebas';
      },
      tebakan: function (k, v) { return { tanya: S.tebak2, label: STR.indikator.tambang, arah: v.arahTambang }; },
      pasang: function (k, ctl) {
        z.URAT.forEach(function (p, i) {
          var s = ctl.sasaran({ id: 'urat' + i, kat: 'urat', x: p[0], z: p[1] + 0.3, jari: 0.92, jarak: 1.5, yTombol: 0.85, label: S.labelUrat, nama: i === 2 ? S.labelUrat : null, kerja: async function (t) {
            var aktif = !z.uratAktif[i];
            await z.aturUrat(i, aktif);
            k.u = jumlahUrat();
            warnaSasaran(t, aktif);
          } });
          warnaSasaran(s, z.uratAktif[i]);
        });
        var m = ctl.sasaran({ id: 'mesin', kat: 'mesin', x: z.MESIN.x, z: z.MESIN.z + 1.05, jari: 1.25, jarak: 0.9, yTombol: 0.85, label: S.labelMesin, nama: S.labelMesin, kerja: async function (t) {
          await z.aturMesin(!z.mesin);
          k.daur = z.mesin;
          warnaSasaran(t, !z.mesin);
        } });
        warnaSasaran(m, !z.mesin);
        z.KINCIR.forEach(function (p, i) {
          var s = ctl.sasaran({ id: 'kincir' + i, kat: 'kincir', x: p[0], z: p[1], jari: 0.85, jarak: 1.4, yTombol: 0.7, label: S.labelKincir, nama: i === 0 ? S.labelKincir : null, kerja: async function (t) {
            await z.aturKincir(i, !z.kincir[i]);
            k.k = jumlahKincir();
            warnaSasaran(t, !z.kincir[i]);
          } });
          warnaSasaran(s, !z.kincir[i]);
        });
      },
      /* isyarat diam 8 detik: urat dulu, lalu mesin */
      utama: function (k) {
        var i;
        if (k.u > 1) for (i = 3; i >= 0; i--) if (z.uratAktif[i]) return { x: z.URAT[i][0], z: z.URAT[i][1] };
        if (!k.daur && !k.k) return { x: z.MESIN.x, z: z.MESIN.z };
        return null;
      },
      sorot: function (k) {
        var r = [];
        z.uratAktif.forEach(function (on, i) { if (on && k.u > 1) r.push('urat' + i); });
        if (!k.daur) r.push('mesin');
        return r;
      },
      catatMis: function (k) { if (k.u === 0) Save.catatMis('berhenti-terbaik'); },
      peragaan: async function (k) {
        var i, p, sisa = 1;
        for (i = 0; i < 4; i++) {
          var mau = i < sisa;
          if (z.uratAktif[i] === mau) continue;
          p = z.URAT[i];
          A.tunjuk(p[0], z.tinggi(p[0], p[1]), p[1], true);
          await A.hero.pergi(p[0], p[1] + 0.3, 1.5);
          A.hero.hadap(p[0], p[1]);
          await z.aturUrat(i, mau);
          k.u = jumlahUrat();
          A.aturChips(D.chips(k));
        }
        if (!k.daur) {
          A.tunjuk(z.MESIN.x, z.tinggi(z.MESIN.x, z.MESIN.z), z.MESIN.z, true);
          await A.hero.pergi(z.MESIN.x, z.MESIN.z + 1.05, 0.9);
          A.hero.hadap(z.MESIN.x, z.MESIN.z);
          await z.aturMesin(true);
          k.daur = true;
          A.aturChips(D.chips(k));
        }
      },
      /* memilah ulang kartu yang sama dengan Bab 0, kali ini dengan bukti */
      sebelumSimpul: async function () {
        A.fase = 'pilah';
        await A.dialog(S.pilah, 'rako', 'senang');
        var awal = Save.data.tebakanAwal, akhir = await PilahKartu(S.pilahTanya);
        Save.data.pilahAkhir = akhir; Save.save();
        var beda = Object.keys(akhir).filter(function (x) { return awal[x] && awal[x] !== akhir[x]; }).length;
        var keliru = akhir.tambang === 'pulih' || akhir.hutan === 'tidak' || akhir.ikan === 'tidak';
        if (akhir.tambang === 'pulih') Save.catatMis('tambang-tumbuh'); else Save.atasiMis('tambang-tumbuh');
        Save.catat('terbarukan', !keliru);
        await A.dialog(keliru ? S.pilahIngat : (beda ? U.fmt(S.pilahBeda, { n: beda }) : S.pilahSama), 'rako', keliru ? 'pikir' : 'sorak');
      },
      simpulNilai: function (v1, v2) { return { c1: Math.round(v1.akhir.tambang), c2: Math.round(v2.akhir.tambang) }; }
    };
    Percobaan.jalankan(z, D);
  }

  Percobaan.daftarkan('bab4', 'bukit', ZonaBukit.buat, alur);
})();
