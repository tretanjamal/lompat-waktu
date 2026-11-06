/* Bab 5 Rapat Besar: pilih rencana hutan, laut, tambang, lalu lihat seluruh pulau 20 tahun lagi. Semua terbuka, tanpa gembok. Tombol Bandingkan menukar masa depan. */
(function () {
  var S = STR.bab5, H = STR.hud, BARIS = ['hutan', 'laut', 'tambang'], JENIS = ['boros', 'seimbang', 'ketat'];
  var INDIK = ['hutan', 'ikan', 'tambang', 'warga'];
  var KE_BARIS = { hutan: 'hutan', ikan: 'laut', tambang: 'tambang' };

  /* panel 3 x 3. pilihan: {hutan, laut, tambang} berubah saat diketuk. sorot: baris yang menyala (petunjuk ke-2). oto: Rako memperagakan. */
  function panelRencana(pilihan, sorot, oto) {
    return new Promise(function (ok) {
      var o = UI.overlay(S.judulPanel, 'rencana', false), b = o.body, kisi = U.h('div', 'rencana-kisi'), tombol = {};
      b.appendChild(U.h('div', 'tanya', S.panelTanya));
      kisi.appendChild(U.h('div', 'kepala', ''));
      JENIS.forEach(function (j) { kisi.appendChild(U.h('div', 'kepala', S.jenis[j])); });
      var pakai;
      function cat() {
        BARIS.forEach(function (br) { JENIS.forEach(function (j) { var t = tombol[br + j], on = pilihan[br] === j; t.classList.toggle('on', on); t.setAttribute('aria-pressed', on ? 'true' : 'false'); }); });
        pakai.disabled = !BARIS.every(function (br) { return pilihan[br]; });
      }
      BARIS.forEach(function (br) {
        kisi.appendChild(U.h('div', 'barisan' + (sorot && sorot.indexOf(br) >= 0 ? ' sorot' : ''), S.baris[br]));
        JENIS.forEach(function (j) {
          var t = tombol[br + j] = Input.button(S.rincian[br][j], 'rencana-pilih', function () { if (oto) return; pilihan[br] = j; Aud.sfx('pilih'); cat(); }, { id: 'pil-' + br + '-' + j, aria: S.baris[br] + ': ' + S.jenis[j] + '. ' + S.rincian[br][j] });
          kisi.appendChild(t);
        });
      });
      b.appendChild(kisi);
      pakai = Input.button(S.panelTombol, 'kunyit pakai', function () { if (oto) return; Voice.stop(); o.close(); ok(pilihan); }, { id: 'pakai-rencana' });
      b.appendChild(pakai);
      cat();
      Voice.say(S.panelTanya);
      if (oto) {
        /* Rako memilih Seimbang baris demi baris */
        (async function () {
          for (var i = 0; i < BARIS.length; i++) { await Tween.wait(520); pilihan[BARIS[i]] = 'seimbang'; Aud.sfx('pilih'); cat(); }
          await Tween.wait(760);
          await Arena.tungguBicara();
          o.close(); ok(pilihan);
        })();
      }
    });
  }

  /* dua masa depan pulau: gambaran akhir sebelum menulis kesimpulan */
  function duaMasaDepan() {
    return new Promise(function (ok) {
      var T = S.adegan, o = UI.overlay(T.judul, 'adegan');
      o.body.innerHTML = Jurnal._masa();
      var b = Input.button(T.tutup, 'kunyit lanjut-adegan', function () { Voice.stop(); o.close(); ok(); }, { id: 'tutup-adegan' });
      o.body.appendChild(b);
      Voice.say(T.borosIsi + ' ' + T.bijakIsi);
      setTimeout(function () { b.focus({ preventScroll: true }); }, 40);
    });
  }

  async function alur(z) {
    var A = Arena, SK = Soal, Z = Soal.SASARAN_BAB5;
    Jurnal.sesi[5] = [];
    A.hero.taruh(0.6, 3.8, 0.2);
    A.rako.taruh(2.2, 5, 3.8);
    Kamera.ikut(A.hero.x, A.hero.z); Kamera.lompatKe();
    Aud.musik('sunyi'); Aud.ambien('hutan');
    Aud.pramuat('rapat');
    A.misi(S.misi, []);
    z.tokohWarga = {};
    Object.keys(z.WARGA).forEach(function (k) { var w = z.WARGA[k]; z.tokohWarga[k] = A.tambahWarga(k, w[0], w[1], w[2], true); });
    Dunia.bayanganDeret(0.68, Object.keys(z.WARGA).map(function (k) { var w = z.WARGA[k]; return { x: w[0], y: z.tinggi(w[0], w[1]) + 0.06, z: w[1] }; }), z.scene);

    var D = {
      bab: 5, S: S, warga: { kunci: 'ratna', x: -1.8, z: 0.2, arah: 0.5, berdiri: { x: -0.2, z: 0.8 } }, musik: 'rapat', ambienPulih: 'hutan',
      satwa: ['kunang'], misTeratasi: ['berhenti-terbaik'],
      sebelumSimpul: async function () {
        if (!Jurnal.adaMasa()) return;
        A.fase = 'adegan';
        await A.dialog(S.adeganKalimat, 'rako', 'pikir');
        await duaMasaDepan();
      },
      simpulNilai: function (v1, v2) { return { w1: Math.round(v1.akhir.warga), h1: Math.round(v1.akhir.hutan), w2: Math.round(v2.akhir.warga), h2: Math.round(v2.akhir.hutan) }; }
    };
    var ratna = await Percobaan.temuiWarga(A, z, D);
    z.tokohWarga.ratna = ratna;

    var pilihan = { hutan: null, laut: null, tambang: null }, gagal = 0, peragaan = false, hasil = null, percobaan = 0, sorot = null, boros = SK.nilaiBab5('boros', 'boros', 'boros');
    var chips = [{ t: U.fmt(S.chipSasaran, { h: Z.hutan, i: Z.ikan }) }, { t: U.fmt(S.chipSasaran2, { w: Z.warga }) }];
    var sasaran = { hutan: Z.hutan, ikan: Z.ikan, tambang: Z.tambang, warga: Z.warga };
    function tindakan() { return U.fmt(S.tindakan, { h: S.jenis[pilihan.hutan], l: S.jenis[pilihan.laut], t: S.jenis[pilihan.tambang] }); }
    function bandingkan() { return { riwayat: boros.riwayat, opsi: { baik: false }, labelTombol: H.bandingkan, labelKembali: H.lihatRencanamu, labelLain: H.rencanaBoros, judulLain: S.judulBoros, apaLain: S.apaBoros }; }
    A.aturChips(chips);

    while (!hasil) {
      A.fase = 'rencana';
      if (percobaan === 0) A.kata(S.bukaPapan);
      A.tambahSasaran({ id: 'papan', x: z.PAPAN.x, z: z.PAPAN.z + 0.3, jari: 1.3, jarak: 1.7, yTombol: 1.2, label: S.labelPapan, nama: S.labelPapan, tepi: true });
      A.utama = { x: z.PAPAN.x, z: z.PAPAN.z };
      if (percobaan === 0) A.tunjuk(z.PAPAN.x, z.tinggi(z.PAPAN.x, z.PAPAN.z), z.PAPAN.z, true);
      await A.tungguSasaran('papan');
      A.hapusSasaran('papan'); A.utama = null;
      await panelRencana(pilihan, sorot);
      var v = SK.nilaiBab5(pilihan.hutan, pilihan.laut, pilihan.tambang);
      A.fase = 'tebak';
      var pilih = await A.tebak(S.tebak, Percobaan.pilihanArah({ naik: H.naik, turun: H.turun, tetap: H.tetap }));
      A.fase = 'jam';
      await Percobaan.balikJam(A, S.balik);
      A.fase = 'lompat';
      percobaan++;
      Save.catat('kp-prediksi', pilih === v.arahWarga);
      if (pilihan.hutan === 'ketat' && pilihan.laut === 'ketat' && pilihan.tambang === 'ketat') Save.catatMis('berhenti-terbaik');
      var T = S.hasil[v.kelas];
      var o = await Lompat.jalankan({
        riwayat: v.riwayat, indikator: INDIK, judul: T.judul, apa: T.apa, rantai: T.rantai, baik: v.lulus, cepat: percobaan > 1, bolehLewati: percobaan > 1, sasaran: sasaran,
        tebakan: { label: STR.indikator.warga, pilih: H[pilih], hasil: H[v.arahWarga] },
        balik: !v.lulus, tombol: v.lulus ? H.lanjut : H.kembali, bandingkan: v.lulus ? bandingkan() : null
      });
      Jurnal.catat(5, { tindakan: tindakan(), judulTindakan: S.judulTindakan, kolom: INDIK, indikator: INDIK, tebakan: H[pilih], akhir: v.akhir, riwayat: v.riwayat, foto: o.foto, kelas: v.kelas });
      if (v.lulus) { hasil = v; break; }

      /* petunjuk bertingkat */
      gagal++;
      if (gagal === 1) A.kata(S.petunjuk[v.kelas], 'rako', 'pikir');
      else if (gagal === 2) {
        A.kata(S.petunjuk.sorot, 'rako', 'pikir');
        sorot = v.kurang.indexOf('warga') >= 0 ? BARIS.filter(function (br) { return pilihan[br] === 'ketat'; }) : v.kurang.map(function (k) { return KE_BARIS[k]; }).filter(Boolean);
      } else {
        /* petunjuk ke-3: Rako memperagakan, lalu satu soal serupa */
        peragaan = true;
        A.fase = 'peragaan';
        A.kunci = true;
        A.kata(S.petunjuk.peragaan, 'rako', 'senang');
        A.tunjuk(z.PAPAN.x, z.tinggi(z.PAPAN.x, z.PAPAN.z), z.PAPAN.z, true);
        await A.hero.pergi(z.PAPAN.x, z.PAPAN.z + 0.3, 1.7);
        A.sembunyikanTangan();
        await panelRencana(pilihan, null, true);
        var nd = SK.nilaiBab5(pilihan.hutan, pilihan.laut, pilihan.tambang), Td = S.hasil[nd.kelas];
        var od = await Lompat.jalankan({ riwayat: nd.riwayat, indikator: INDIK, judul: Td.judul, apa: Td.apa, rantai: Td.rantai, baik: nd.lulus, cepat: true, bolehLewati: true, sasaran: sasaran, tebakan: null, balik: false, tombol: H.lanjut, bandingkan: bandingkan() });
        Jurnal.catat(5, { tindakan: tindakan(), judulTindakan: S.judulTindakan, kolom: INDIK, indikator: INDIK, tebakan: '-', akhir: nd.akhir, riwayat: nd.riwayat, foto: od.foto, kelas: nd.kelas });
        A.fase = 'serupa';
        A.kata(H.serupa, 'rako', 'pikir');
        await A.tungguBicara(1300);
        await Papan.satuSoal(5, 'seimbang');
        hasil = nd;
      }
    }
    await Percobaan.penutup(A, z, D, { gagalBebas: gagal, peragaan: peragaan, v1: boros, v2: hasil });
  }

  Percobaan.daftarkan('bab5', 'balai', ZonaBalai.buat, alur);
})();
