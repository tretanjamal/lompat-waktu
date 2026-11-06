/* Save: progres di localStorage (try/catch); tetap jalan bila penyimpanan diblokir. Tanpa data pribadi. */
(function (root) {
  var KEY = 'jejakhijau.v1';   // nama lama gim, sengaja tetap supaya progres murid tidak hilang
  var memory = null;
  function fresh() {
    return {
      settings: { santai: false, reduce: false, mute: false, voice: true, kualitas: 'auto' },
      onboarded: false, intro: false, hero: 'laras', daun: 0,
      tingkat: 1,        // tingkat adaptif Papan Tantangan (1-3), dibawa antarbab
      tebakanAwal: {},   // hutan|air|tanah|ikan|tambang -> pulih|tidak (Bab 0, tidak dinilai)
      pilahAkhir: {},    // sama, setelah Bab 4
      kartu: {},         // Kartu Sumber yang sudah dibuka
      satwa: {},         // Kartu Satwa yang sudah dibuka
      keterampilan: {},  // tag -> {seen, ok, first, wrong}
      miskonsepsi: {},   // kode -> {muncul, teratasi}; teratasi = muncul berarti bukti terakhir sudah benar
      bab: {},           // nomor -> {selesai, stars, kilat, peragaan, lompat, papan}
      kesimpulan: {},    // nomor bab -> kalimat kesimpulan untuk Jurnal
      sesi: 0
    };
  }
  function isObj(o) { return !!o && typeof o === 'object' && !Array.isArray(o); }
  /* simpanan lama atau rusak: kunci yang hilang diisi, entri salah bentuk dibuang (gim tidak boleh macet karena data) */
  function clean(d) {
    var f = fresh(), k;
    if (!isObj(d)) return f;
    if (!isObj(d.settings)) d.settings = f.settings;
    for (k in f.settings) if (typeof d.settings[k] !== typeof f.settings[k]) d.settings[k] = f.settings[k];
    ['daun', 'tingkat', 'sesi'].forEach(function (n) { if (typeof d[n] !== 'number' || !isFinite(d[n])) d[n] = f[n]; });
    d.tingkat = Math.max(1, Math.min(3, d.tingkat));
    if (typeof d.onboarded !== 'boolean') d.onboarded = f.onboarded;
    if (typeof d.intro !== 'boolean') d.intro = f.intro;
    if (d.hero !== 'laras' && d.hero !== 'bayu' && d.hero !== 'dewi') d.hero = f.hero;
    ['tebakanAwal', 'pilahAkhir', 'kartu', 'satwa', 'miskonsepsi', 'bab', 'kesimpulan'].forEach(function (n) { if (!isObj(d[n])) d[n] = {}; });
    /* tebakan hanya boleh berisi kartu dan pilihan yang dikenal, kesimpulan hanya teks */
    ['tebakanAwal', 'pilahAkhir'].forEach(function (n) { Object.keys(d[n]).forEach(function (e) { if (['hutan', 'air', 'tanah', 'ikan', 'tambang'].indexOf(e) < 0 || (d[n][e] !== 'pulih' && d[n][e] !== 'tidak')) delete d[n][e]; }); });
    Object.keys(d.kesimpulan).forEach(function (e) { if (typeof d.kesimpulan[e] !== 'string') delete d.kesimpulan[e]; });
    if (!isObj(d.keterampilan)) d.keterampilan = {};
    Object.keys(d.keterampilan).forEach(function (e) { var v = d.keterampilan[e]; if (!isObj(v) || ['seen', 'ok', 'first', 'wrong'].some(function (x) { return typeof v[x] !== 'number'; })) delete d.keterampilan[e]; });
    Object.keys(d.bab).forEach(function (e) { var v = d.bab[e]; if (!isObj(v) || typeof v.stars !== 'number') delete d.bab[e]; });
    return d;
  }
  function slot(map, k) { return map[k] || (map[k] = { seen: 0, ok: 0, first: 0, wrong: 0 }); }
  var Save = {
    data: fresh(),
    load: function () {
      try {
        var raw = root.localStorage.getItem(KEY);
        if (raw) Save.data = clean(JSON.parse(raw));
      } catch (e) { Save.data = memory || fresh(); }
    },
    save: function () {
      memory = Save.data;
      try { root.localStorage.setItem(KEY, JSON.stringify(Save.data)); } catch (e) { /* diblokir: abaikan */ }
    },
    /* satu butir keterampilan: benar langsung (tanpa salah)? */
    catat: function (tag, langsung) {
      var s = slot(Save.data.keterampilan, tag);
      s.seen++; s.ok++; if (langsung) s.first++;
    },
    catatSalah: function (tag) { slot(Save.data.keterampilan, tag).wrong++; },
    /* miskonsepsi muncul saat murid memilih pengecoh terkait; teratasi saat sesudahnya menjawab benar langsung pada soal yang menguji hal itu */
    catatMis: function (kode) { if (!kode) return; var m = Save.data.miskonsepsi[kode] || (Save.data.miskonsepsi[kode] = { muncul: 0, teratasi: 0 }); m.muncul++; },
    atasiMis: function (kode) { if (!kode) return; var m = Save.data.miskonsepsi[kode]; if (m) m.teratasi = m.muncul; },
    /* status keterampilan untuk guru: proporsi benar langsung */
    status: function (tag) {
      var s = Save.data.keterampilan[tag];
      if (!s || !s.seen) return 'belum';
      var r = s.first / s.seen;
      return r >= 0.8 ? 'lancar' : (r >= 0.5 ? 'cukup' : 'latihan');
    },
    /* bab n terbuka bila bab sebelumnya selesai; patokannya bab tertinggi yang selesai */
    terbuka: function (n) {
      if (n <= 0) return true;
      for (var i = n - 1; i <= 5; i++) { var b = Save.data.bab[i]; if (b && b.selesai) return true; }
      return false;
    },
    selesaiBab: function (n) { var b = Save.data.bab[n]; return !!(b && b.selesai); },
    catatBab: function (n, isi) {
      var lama = Save.data.bab[n] || { selesai: false, stars: 0, kilat: false };
      var baru = Object.assign({}, lama, isi);
      baru.stars = Math.max(lama.stars || 0, isi.stars || 0);
      baru.kilat = !!(lama.kilat || isi.kilat);
      Save.data.bab[n] = baru;
      Save.save();
    },
    reset: function () { Save.data = fresh(); Save.save(); },
    /* Murid baru di perangkat yang sama: progres dihapus, pengaturan tetap */
    newStudent: function () { var s = Save.data.settings; Save.data = fresh(); Save.data.settings = s; Save.save(); }
  };
  root.Save = Save;
})(typeof window !== 'undefined' ? window : globalThis);
