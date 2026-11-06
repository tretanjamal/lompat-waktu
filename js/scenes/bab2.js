/* Bab 2 Lembah Sawah: bab tempat murid belajar mengubah satu hal. Pipa memengaruhi air, teras memengaruhi tanah. */
(function () {
  var S = STR.bab2, H = STR.hud, SAS = Soal.SASARAN_BAB2;

  function alur(z) {
    var A = Arena;
    function terdekat(awalan) {
      var best = null, d = 1e9;
      Object.keys(A.sasaran).forEach(function (id) {
        if (id.indexOf(awalan) !== 0) return;
        var s = A.sasaran[id], dx = s.x - A.hero.x, dz = s.z - A.hero.z, k = dx * dx + dz * dz;
        if (k < d) { d = k; best = s; }
      });
      return best;
    }
    function pilih(s) { return s ? { x: s.x, z: s.z } : null; }
    var D = {
      bab: 2, S: S, hero: [1.5, 3.6, 0.3],
      warga: { kunci: 'sri', x: -2.1, z: -0.7, arah: 0.5, berdiri: { x: -0.4, z: -0.3 } },
      musik: 'sawah', ambien: 'sungai', ambienPulih: 'sungai',
      indikator: ['air', 'tanah', 'sampah', 'warga'], kolom: ['air', 'tanah', 'sampah'], sasaran: { air: SAS.air, tanah: SAS.tanah },
      satuHal: 2, tagSerupa: 'kp-variabel',
      satwa: ['capung', 'katak', 'kuntul'],
      misTeratasi: ['berhenti-terbaik'],
      keadaanAwal: function () { return { p: 0, t: 0, s: 0 }; },
      nilai: function (k) { return Soal.nilaiBab2(k.p, k.t, k.s); },
      tindakan: function (k) { return U.fmt(S.tindakan, k); },
      kategori: function (a, b) { var r = []; if (a.p !== b.p) r.push('pipa'); if (a.t !== b.t) r.push('teras'); if (a.s !== b.s) r.push('sampah'); return r; },
      chips: function (k) {
        return [
          { ikon: 'pipa', t: U.fmt(S.chipPipa, { n: k.p }), cukup: k.p === 3 },
          { ikon: 'teras', t: U.fmt(S.chipTeras, { n: k.t }), cukup: k.t === 3 },
          { ikon: 'sampah', t: U.fmt(S.chipSampah, { n: k.s }), cukup: k.s === 3 },
          { t: U.fmt(S.chipSasaran, { a: SAS.air, t: SAS.tanah }) }
        ];
      },
      /* bila Bab 1 sudah selesai, sungai masuk bab ini dalam keadaan jernih */
      setelahTemui: async function () { if (Save.selesaiBab(1)) await A.dialog(S.hutanJernih, 'rako', 'senang'); },
      tebakPertama: function (v) { return { tanya: S.tebak1, label: STR.indikator.air, arah: v.arahAir }; },
      catatTebakPertama: function (pilih, arah) { if (pilih !== arah) Save.catatMis('hujan-air'); },
      tebakan: function (k, v, kat) {
        return kat === 'teras' ? { tanya: S.tebakTanah, label: STR.indikator.tanah, arah: v.arahTanah } : { tanya: S.tebakAir, label: STR.indikator.air, arah: v.arahAir };
      },
      pasang: function (k, ctl) {
        z.BOCOR.forEach(function (p, i) {
          if (z.selesai.pipa[i]) return;
          ctl.sasaran({ id: 'pipa' + i, kat: 'pipa', x: p[0], z: p[1] + 0.2, jari: 0.7, jarak: 1, yTombol: 1, label: S.labelPipa, nama: i === 1 ? S.labelPipa : null, tepi: true, kerja: async function (s) { A.hapusSasaran(s.id); await z.tambal(i); k.p++; } });
        });
        z.TERAS.forEach(function (p, i) {
          if (z.selesai.teras[i]) return;
          ctl.sasaran({ id: 'teras' + i, kat: 'teras', x: p[0], z: p[1] + 0.5, jari: 1.05, jarak: 2.6, yTombol: 0.6, label: S.labelTeras, nama: i === 1 ? S.labelTeras : null, kerja: async function (s) { A.hapusSasaran(s.id); await z.buatTeras(i); k.t++; } });
        });
        z.SAMPAH.forEach(function (p, i) {
          if (z.selesai.sampah[i]) return;
          ctl.sasaran({ id: 'sampah' + i, kat: 'sampah', x: p[0], z: p[1], y: 0, jari: 0.75, jarak: 1.25, yTombol: 0.35, label: S.labelSampah, nama: i === 1 ? S.labelSampah : null, kerja: async function (s) { A.hapusSasaran(s.id); await z.angkatSampah(i); k.s++; } });
        });
      },
      /* isyarat diam 8 detik: pipa dulu, lalu teras, lalu sampah */
      utama: function (k) { return k.p < 3 ? pilih(terdekat('pipa')) : (k.t < 3 ? pilih(terdekat('teras')) : (k.s < 3 ? pilih(terdekat('sampah')) : null)); },
      catatMis: function () { },
      peragaan: async function (k) {
        var i, p;
        for (i = 0; i < 3; i++) {
          if (z.selesai.pipa[i]) continue;
          p = z.BOCOR[i];
          A.tunjuk(p[0], z.tinggi(p[0], p[1]), p[1], true);
          await A.hero.pergi(p[0], p[1] + 0.2, 1);
          await z.tambal(i); k.p++;
          A.aturChips(D.chips(k));
        }
        for (i = 0; i < 3; i++) {
          if (z.selesai.teras[i]) continue;
          p = z.TERAS[i];
          A.tunjuk(p[0], z.tinggi(p[0], p[1]), p[1], true);
          await A.hero.pergi(p[0], p[1] + 0.5, 2.6);
          A.hero.hadap(p[0], p[1]);
          await z.buatTeras(i); k.t++;
          A.aturChips(D.chips(k));
        }
        for (i = 0; i < 3; i++) {
          if (z.selesai.sampah[i]) continue;
          p = z.SAMPAH[i];
          A.tunjuk(p[0], 0, p[1], true);
          await A.hero.pergi(p[0], p[1], 1.25);
          await z.angkatSampah(i); k.s++;
          A.aturChips(D.chips(k));
        }
      },
      simpulNilai: function (v1, v2) { return { a1: Math.round(v1.akhir.air), a2: Math.round(v2.akhir.air) }; }
    };
    Percobaan.jalankan(z, D);
  }

  Percobaan.daftarkan('bab2', 'sawah', ZonaSawah.buat, alur);
})();
