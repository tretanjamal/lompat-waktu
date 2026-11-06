/* Percobaan: alur bersama Bab 2-4. Temui warga, tebak, Lompat Waktu, lalu percobaan berulang dengan petunjuk bertingkat, sukses, kesimpulan, Papan Tantangan.
   Perubahan murid tetap ada setelah kembali ke hari ini, jadi tiap percobaan mengubah sesuatu dibanding percobaan sebelumnya.
   Pada percobaan awal (D.satuHal kali) hanya satu jenis hal yang boleh diubah: yang lain bergembok dan Jam Pasir padam sampai ada perubahan.

   D: bab, S (teks bab), warga {kunci,x,z,arah,berdiri}, hero [x,z,arah], musik, ambien, ambienPulih, indikator[], sasaran{}, kolom[],
      keadaanAwal(), nilai(k), tindakan(k), chips(k), tebakPertama(v), catatTebakPertama(pilih,arah), pandu(k)?, setelahPertama(v1,k)?,
      satuHal, kategori(a,b), pasang(k,ctl), utama(k), sorot(k)?, tebakan(k,v,kat), catatMis(k,v), peragaan(k), misTeratasi[], satwa[], simpulNilai(v1,v2), sebelumSimpul()?, tagSerupa */
(function (root) {
  var JAM = { lx: 1168, ly: 600 };
  function pilihanArah(P) { return ['naik', 'turun', 'tetap'].map(function (k) { return { id: k, t: P[k] }; }); }
  function salin(o) { return JSON.parse(JSON.stringify(o)); }

  /* Jam Pasir menunggu, dan tangan menunjuknya */
  async function balikJam(A, kalimat, tokoh) {
    A.kata(kalimat, tokoh || 'rako');
    A.utama = JAM;
    A.tunjukLayar(JAM.lx, JAM.ly, true);
    await A.tungguJam();
    A.utama = null;
  }

  /* warga pertama yang ditemui di tiap bab */
  async function temuiWarga(A, z, D) {
    var S = D.S, w = D.warga;
    A.fase = 'temui';
    var warga = z.warga = A.tambahWarga(w.kunci, w.x, w.z, w.arah === undefined ? 0.5 : w.arah);
    z.jalur.rintangan(w.x, w.z, 0.5);
    A.kata(S.masuk);
    A.tambahSasaran({ id: 'warga', x: w.x, z: w.z, jari: 0.95, berdiri: w.berdiri, yTombol: 1.35, label: S.labelWarga, nama: S.labelWarga, tepi: true });
    A.utama = { x: w.x, z: w.z };
    A.tunjuk(w.x, z.tinggi(w.x, w.z), w.z, true);
    warga.anim = 'lambai';
    await A.tungguSasaran('warga');
    A.hapusSasaran('warga'); A.utama = null;
    warga.hadap(A.hero.x, A.hero.z); warga.anim = 'bicara';
    await A.dialog(S.warga, w.kunci, 'senang');
    warga.anim = 'diam';
    return warga;
  }

  /* akhir bab: warna menetap, satwa kembali, kesimpulan dengan bukti, Papan Tantangan, layar hasil */
  async function penutup(A, z, D, o) {
    var S = D.S, H = STR.hud, bab = D.bab, warga = z.warga;
    A.fase = 'sukses';
    A.kunci = true;
    A.bersihSasaran();
    (D.misTeratasi || []).forEach(Save.atasiMis);
    Save.catat('solusi', o.gagalBebas === 0);
    Save.catat('seimbang', !o.peragaan);
    A.hero.anim = 'sorak'; A.hero.ekspresi('sorak');
    Aud.musik(D.musik); Aud.ambien(D.ambienPulih);
    z.sukses();
    A.tambahDaun(10, A.hero.x, A.hero.dasarY + 1, A.hero.z);
    A.misi(S.sukses, []);
    A.kata(S.sukses, 'rako', 'sorak');
    await A.tungguBicara(2200);
    A.hero.anim = 'diam'; A.hero.ekspresi('senang');
    if (warga) { warga.anim = 'lambai'; warga.ekspresi('sorak'); }
    A.kunci = false;
    await A.dialog(S.terimaKasih, D.warga.kunci, 'senang');
    if (warga) warga.anim = 'diam';
    if (S.jujur) await A.dialog(S.jujur, 'rako', 'pikir');
    await A.dialog(S.satwaKalimat, 'rako', 'sorak');
    for (var i = 0; i < D.satwa.length; i++) await Papan.kartu('satwa', D.satwa[i]);
    if (D.kartuBaru) {
      await A.dialog(S.kartuKalimat, D.warga.kunci, 'senang');
      for (i = 0; i < D.kartuBaru.length; i++) await Papan.kartu('sumber', D.kartuBaru[i]);
    }
    if (D.sebelumSimpul) await D.sebelumSimpul();
    await A.dialog(H.keSimpul, 'rako', 'senang');

    /* kesimpulan + bukti */
    A.fase = 'simpul';
    var nilai = D.simpulNilai(o.v1, o.v2);
    var simpul = await Papan.simpul(S.simpul, nilai);
    Save.data.kesimpulan[bab] = U.fmt(S.simpul.catatan, { klaim: S.simpul.klaim[0].t, bukti: U.fmt(S.simpul.bukti[0].t, nilai) });
    Save.save();
    A.kata(H.simpulSelesai, 'rako', 'sorak');

    /* Papan Tantangan */
    A.fase = 'papan';
    await A.tungguBicara(600);
    await A.dialog(STR.papan.masuk, 'rako', 'senang');
    var papan = await Papan.mulai({ bab: bab, jumlah: 3 });
    var stars = o.peragaan ? 1 : (simpul.pertama ? 3 : 2);
    Save.data.sesi++;
    Save.catatBab(bab, { selesai: true, stars: stars, kilat: papan.kilat, peragaan: o.peragaan, kesimpulanPertama: simpul.pertama, papan: papan });
    Scenes.go('hasil', { bab: bab, stars: stars, kilat: papan.kilat, papan: papan, pertama: simpul.pertama, kekuatan: S.kekuatan });
  }

  async function jalankan(z, D) {
    var A = Arena, S = D.S, H = STR.hud, bab = D.bab;
    Jurnal.sesi[bab] = [];
    A.hero.taruh(D.hero[0], D.hero[1], D.hero[2]);
    A.rako.taruh(D.hero[0] + 1.6, 5, D.hero[1]);
    Kamera.ikut(A.hero.x, A.hero.z); Kamera.lompatKe();
    Aud.musik('sunyi'); Aud.ambien(D.ambien);
    Aud.pramuat(D.musik);
    A.misi(S.misi, []);

    await temuiWarga(A, z, D);
    if (D.setelahTemui) await D.setelahTemui();
    await A.dialog(S.aturan, 'rako', 'pikir');

    /* gagal: gagal saat semua terbuka. Gagal saat hanya boleh mengubah satu hal memang bagian dari percobaan, jadi tidak dianggap salah. */
    var k = D.keadaanAwal(), gagal = 0, peragaan = false, percobaan = 0, hasil = null, coba = 0;
    function catat(v, o, teks) { Jurnal.catat(bab, { tindakan: D.tindakan(k), kolom: D.kolom, indikator: D.indikator, tebakan: teks, akhir: v.akhir, riwayat: v.riwayat, foto: o.foto, kelas: v.kelas }); }

    /* percobaan pertama: tebak, lalu lihat akibatnya bila tidak ada yang berubah */
    A.fase = 'tebak1';
    var v1 = D.nilai(k), tb = D.tebakPertama(v1);
    var pil1 = await A.tebak(tb.tanya, pilihanArah(S.pil1));
    if (D.pandu) { A.fase = 'pandu'; await D.pandu(k); }
    A.fase = 'jam1';
    await balikJam(A, H.balik);
    A.fase = 'lompat1';
    var T1 = D.hasilAwal ? D.hasilAwal(v1) : S.hasil.awal;
    var o1 = await Lompat.jalankan({
      riwayat: v1.riwayat, indikator: D.indikator, judul: T1.judul, apa: T1.apa, rantai: T1.rantai, baik: false, cepat: false, bolehLewati: false, sasaran: D.sasaran, k: k,
      tebakan: { label: tb.label, pilih: S.pil1[pil1], hasil: S.pil1[tb.arah] },
      balik: !D.setelahPertama, tombol: D.setelahPertama ? H.lanjut : H.kembali
    });
    Save.catat('kp-prediksi', pil1 === tb.arah);
    if (D.catatTebakPertama) D.catatTebakPertama(pil1, tb.arah);
    catat(v1, o1, S.pil1[pil1]);
    if (D.setelahPertama) await D.setelahPertama(v1, k);

    /* ===== percobaan berulang ===== */
    var dibatasi = false, awalCoba = null, katAktif = null;
    function perbarui() {
      A.aturChips(D.chips(k));
      if (!dibatasi) return;
      var ubah = D.kategori(awalCoba, k);
      katAktif = ubah.length ? ubah[0] : null;
      Object.keys(A.sasaran).forEach(function (id) { var s = A.sasaran[id]; if (s.kat) A.kunciSasaran(s, !!katAktif && s.kat !== katAktif); });
      if (A._jamOk) A.jamAktif(ubah.length > 0);
    }
    var ctl = {
      /* sasaran milik satu kategori. Yang terkunci bisa diketuk, tetapi hanya menjelaskan alasannya. */
      sasaran: function (o) {
        var kerja = o.kerja;
        o.cegah = function (s) {
          if (!s.terkunci) return false;
          Aud.sfx('gembok');
          s.el.classList.remove('goyang'); void s.el.offsetWidth; s.el.classList.add('goyang');
          A.kata(H.terkunci, 'rako', 'pikir', { info: true });
          return true;
        };
        o.kerja = async function (s) { await kerja(s); if (!A.mati) perbarui(); };
        return A.tambahSasaran(o);
      }
    };

    A.fase = 'bebas';
    A.kata(H.kembali1, 'rako', 'senang');
    await A.tungguBicara(1700);
    while (!hasil) {
      var tiket = ++coba;
      dibatasi = percobaan < D.satuHal;
      awalCoba = salin(k); katAktif = null;
      A.bersihSasaran();
      D.pasang(k, ctl);
      perbarui();
      A.fase = 'bebas';
      if (percobaan === 0) A.kata(dibatasi ? S.satuHal : H.bebas);
      else if (percobaan === D.satuHal) Tween.wait(2800).then(function (t) { return function () { if (t === coba && !A.mati && A.fase === 'bebas') A.kata(H.bebas); }; }(tiket));
      /* petunjuk ke-2: sorot yang penting */
      if (gagal === 2) (D.sorot ? D.sorot(k) : Object.keys(A.sasaran)).forEach(function (id) { if (A.sasaran[id]) A.sasaran[id].sorot = true; });
      A.utama = function () { return (dibatasi && katAktif) ? JAM : (D.utama(k) || JAM); };
      await A.tungguJam(dibatasi);
      A.utama = null;
      await A.tungguLuang();
      A.bersihSasaran();

      var v = D.nilai(k), ubahan = D.kategori(awalCoba, k), t = D.tebakan(k, v, ubahan[0]);
      A.fase = 'tebak2';
      var pilih = await A.tebak(t.tanya, pilihanArah({ naik: H.naik, turun: H.turun, tetap: H.tetap }));
      A.fase = 'lompat';
      percobaan++;
      Save.catat('kp-prediksi', pilih === t.arah);
      if (!dibatasi) Save.catat('kp-variabel', ubahan.length === 1);   // saat bebas: apakah murid sendiri memilih mengubah satu hal?
      if (D.catatMis) D.catatMis(k, v);
      var T = S.hasil[v.kelas];
      var o = await Lompat.jalankan({
        riwayat: v.riwayat, indikator: D.indikator, judul: T.judul, apa: T.apa, rantai: T.rantai, baik: v.lulus, cepat: true, bolehLewati: true, sasaran: D.sasaran, k: k,
        tebakan: { label: t.label, pilih: H[pilih], hasil: H[t.arah] },
        balik: !v.lulus, tombol: v.lulus ? H.lanjut : H.kembali
      });
      catat(v, o, H[pilih]);
      if (v.lulus) { hasil = v; break; }

      /* saat hanya boleh mengubah satu hal: cukup petunjuk tentang hasil ini, tidak naik tingkat */
      if (dibatasi) { A.kata(S.petunjuk[v.kelas], 'rako', 'pikir'); continue; }

      /* petunjuk bertingkat */
      gagal++;
      if (gagal < 3) {
        A.kata(gagal === 1 ? S.petunjuk[v.kelas] : S.petunjuk.sorot, 'rako', 'pikir');
      } else {
        /* petunjuk ke-3: Rako memperagakan, lalu satu soal serupa */
        peragaan = true;
        A.fase = 'peragaan';
        A.kunci = true;
        A.kata(S.petunjuk.peragaan, 'rako', 'senang');
        await D.peragaan(k);
        A.sembunyikanTangan();
        var nd = D.nilai(k), Td = S.hasil[nd.kelas];
        var od = await Lompat.jalankan({ riwayat: nd.riwayat, indikator: D.indikator, judul: Td.judul, apa: Td.apa, rantai: Td.rantai, baik: nd.lulus, cepat: true, bolehLewati: true, sasaran: D.sasaran, k: k, tebakan: null, balik: false, tombol: H.lanjut });
        catat(nd, od, '-');
        A.fase = 'serupa';
        A.kata(H.serupa, 'rako', 'pikir');
        await A.tungguBicara(1300);
        await Papan.satuSoal(bab, D.tagSerupa);
        hasil = nd;
      }
    }
    await penutup(A, z, D, { gagalBebas: gagal, peragaan: peragaan, v1: v1, v2: hasil });
  }

  /* Babak bab: muat model zona lalu jalankan alurnya. Murid bisa pindah layar sebelum model selesai dimuat. */
  function daftarkan(nama, kunciAset, buatZona, alur) {
    var tiket = 0;
    Scenes.add(nama, {
      enter: function (akar) {
        var t = ++tiket;
        Aset3D.muatZona(kunciAset).then(function () {
          if (t !== tiket) return;
          var z = buatZona();
          Arena.mulai(akar, z, { bab: +nama.slice(3) });
          alur(z);
        });
      },
      update: function (dt) { Arena.update(dt); },
      exit: function () { tiket++; Arena.tutup(); }
    });
  }

  root.Percobaan = { jalankan: jalankan, penutup: penutup, temuiWarga: temuiWarga, balikJam: balikJam, pilihanArah: pilihanArah, daftarkan: daftarkan, JAM: JAM };
})(window);
