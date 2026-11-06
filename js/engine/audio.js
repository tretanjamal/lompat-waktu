/* Audio: SFX, ambient, dan musik, ducking, dan Voice (speechSynthesis id-ID + sorot kata).
   Kerangka (bus, senyap, jeda saat tab tersembunyi, Voice yang selalu selesai) dari gim 577; bunyi diganti suasana pulau.
   Musik dari Suno terdaftar di ASET.audio (data URI, dimuat malas). Sintesis WebAudio menjadi cadangan bila berkasnya gagal atau belum ada. */
(function (root) {
  function hz(m) { return 440 * Math.pow(2, (m - 69) / 12); }

  /* Akord per birama dan melodi per delapan ketukan (0 = diam). Cadangan bila berkas Suno belum ada. */
  var C = [60, 64, 67, 72], Am = [57, 60, 64, 69], F = [53, 57, 60, 65], G = [55, 59, 62, 67], Em = [52, 55, 59, 64];
  var LAGU = {
    judul: { bpm: 96, akord: [C, Am, F, G, C, Am, F, C], arp: 1, bass: 1, perkusi: 1, vol: 0.85, mel: [
      76, 0, 79, 0, 81, 0, 79, 76, 74, 0, 76, 0, 72, 0, 0, 0, 69, 0, 72, 0, 74, 0, 76, 79, 76, 0, 74, 0, 0, 0, 0, 0,
      76, 0, 79, 0, 81, 0, 84, 81, 79, 0, 76, 0, 74, 0, 72, 0, 69, 0, 72, 74, 76, 0, 74, 72, 72, 0, 0, 0, 0, 0, 0, 0] },
    sunyi: { bpm: 72, akord: [Am, Am, F, Em, Am, Am, F, Em], arp: 0, bass: 0, perkusi: 0, vol: 0.8, mel: [
      76, 0, 0, 0, 0, 0, 74, 0, 72, 0, 0, 0, 0, 0, 0, 0, 69, 0, 0, 0, 72, 0, 0, 0, 71, 0, 0, 0, 0, 0, 0, 0,
      76, 0, 0, 0, 79, 0, 0, 0, 76, 0, 0, 74, 72, 0, 0, 0, 69, 0, 0, 0, 72, 0, 74, 0, 69, 0, 0, 0, 0, 0, 0, 0] },
    hutan: { bpm: 88, akord: [C, G, Am, F, C, G, F, C], arp: 1, bass: 1, perkusi: 1, vol: 0.8, mel: [
      79, 0, 76, 0, 79, 0, 84, 0, 79, 0, 74, 0, 79, 0, 81, 79, 76, 0, 72, 0, 76, 0, 79, 76, 77, 0, 76, 74, 72, 0, 0, 0,
      79, 0, 76, 79, 84, 0, 81, 79, 74, 0, 79, 0, 81, 0, 79, 74, 72, 0, 74, 0, 76, 0, 74, 72, 72, 0, 0, 0, 0, 0, 0, 0] }
  };
  var POLA_ARP = [0, 2, 1, 3, 2, 1, 3, 2];

  var A = {
    ctx: null, master: null, sfxBus: null, musikBus: null, ambienBus: null, duckGain: null,
    muted: false, hidden: false, streak: 0, _mau: null, _mauAmb: null,
    init: function () {
      if (A.ctx) { if (A.ctx.state === 'suspended' && !A.hidden) A.ctx.resume(); return; }
      var AC = root.AudioContext || root.webkitAudioContext;
      if (!AC) return;
      try {
        var c = A.ctx = new AC();
        var comp = c.createDynamicsCompressor();
        A.master = c.createGain(); A.sfxBus = c.createGain(); A.musikBus = c.createGain(); A.ambienBus = c.createGain(); A.duckGain = c.createGain();
        A.sfxBus.gain.value = 0.9; A.musikBus.gain.value = 0.62; A.ambienBus.gain.value = 0.9;
        A.musikBus.connect(A.duckGain); A.ambienBus.connect(A.duckGain);
        A.sfxBus.connect(A.master); A.duckGain.connect(A.master);
        A.master.connect(comp); comp.connect(c.destination);
        A.applyMute();
        if (A._mau) { var m = A._mau; A._mau = null; A.musik(m); }
        if (A._mauAmb) { var b = A._mauAmb; A._mauAmb = null; A.ambien(b); }
      } catch (e) { A.ctx = null; }
    },
    applyMute: function () {
      if (!A.master) return;
      A.master.gain.setTargetAtTime(A.muted || A.hidden ? 0 : 1, A.ctx.currentTime, 0.02);
    },
    setMuted: function (m) { A.muted = m; A.applyMute(); if (m && root.Voice) root.Voice.stop(); },
    setHidden: function (hid) {
      A.hidden = hid; A.applyMute();
      if (!A.ctx) return;
      if (hid) A.ctx.suspend(); else A.ctx.resume();
    },
    duck: function (on) {
      if (!A.duckGain) return;
      A.duckGain.gain.setTargetAtTime(on ? 0.3 : 1, A.ctx.currentTime, 0.08);
    },

    tone: function (f, t0, dur, type, vol, bus, f2) {
      var c = A.ctx; if (!c) return;
      var o = c.createOscillator(), g = c.createGain();
      o.type = type || 'sine';
      o.frequency.setValueAtTime(f, t0);
      if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(vol || 0.2, t0 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g); g.connect(bus || A.sfxBus);
      o.start(t0); o.stop(t0 + dur + 0.05);
    },
    noise: function (t0, dur, vol, freq, bus, type) {
      var c = A.ctx; if (!c) return;
      var n = Math.floor(c.sampleRate * dur), buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0);
      for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
      var s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
      s.buffer = buf; f.type = type || 'lowpass'; f.frequency.value = freq || 1500;
      g.gain.value = vol || 0.2;
      s.connect(f); f.connect(g); g.connect(bus || A.sfxBus); s.start(t0);
    },
    /* kicau sintesis: sapuan nada pendek berurutan */
    kicau: function (t, dasar, n, vol, bus) {
      for (var i = 0; i < n; i++) A.tone(dasar * (1 + (i % 2) * 0.22), t + i * 0.09, 0.08, 'sine', vol, bus, dasar * (1.25 + (i % 2) * 0.2));
    },
    /* bunyi seperti paruh besar: nada kotak pendek yang turun, ditambah ketukan */
    kok: function (t, f) {
      A.tone(f, t, 0.07, 'square', 0.045, null, f * 0.72);
      A.tone(f * 2, t, 0.05, 'triangle', 0.05, null, f * 1.4);
      A.noise(t, 0.015, 0.03, 2400);
    },
    sfx: function (name, arg) {
      var c = A.ctx; if (!c || A.muted || A.hidden) return;
      var t = c.currentTime;
      switch (name) {
        case 'click': A.tone(380, t, 0.05, 'triangle', 0.2, null, 240); A.noise(t, 0.015, 0.05, 2200); break;       // "tok" kayu
        case 'tap': A.tone(620, t, 0.05, 'sine', 0.07, null, 500); break;                                         // ketuk tanah
        case 'langkah': A.noise(t, 0.05, 0.035, 700); break;
        case 'pilih': A.tone(520, t, 0.08, 'sine', 0.13, null, 780); break;
        case 'tanam': A.noise(t, 0.09, 0.2, 500); A.tone(240, t + 0.04, 0.09, 'sine', 0.16, null, 130); A.tone(860, t + 0.12, 0.07, 'sine', 0.11, null, 1250); break;
        case 'tumbuh': [523, 659, 784, 1047, 1319].forEach(function (f, n) { A.tone(f, t + n * 0.08, 0.2, 'triangle', 0.1); }); A.noise(t, 0.5, 0.03, 3500, null, 'highpass'); break;
        case 'tebang': A.noise(t, 0.05, 0.3, 1300); A.tone(170, t, 0.1, 'triangle', 0.22, null, 90); break;
        case 'tumbang': A.tone(300, t, 0.6, 'sawtooth', 0.025, null, 90); A.noise(t + 0.08, 0.5, 0.05, 2600); A.noise(t + 0.62, 0.2, 0.3, 240); A.tone(85, t + 0.62, 0.22, 'sine', 0.28, null, 45); break;
        case 'longsor': A.noise(t, 1.5, 0.16, 300); A.tone(62, t, 1.2, 'sine', 0.14, null, 38); break;
        case 'jam': [392, 440, 523, 587, 659, 784].forEach(function (f, n) { A.tone(f, t + n * 0.2, 0.42, 'triangle', 0.075); A.tone(f * 2.76, t + n * 0.2, 0.2, 'sine', 0.018); }); A.noise(t, 1.8, 0.045, 5000, null, 'highpass'); break;
        case 'kembali': [784, 659, 587, 523, 440].forEach(function (f, n) { A.tone(f, t + n * 0.11, 0.3, 'triangle', 0.07); }); A.noise(t, 0.8, 0.04, 5000, null, 'highpass'); break;
        case 'cerah': [523, 659, 784, 1047].forEach(function (f, n) { A.tone(f, t + n * 0.12, 0.5, 'triangle', 0.16); A.tone(f * 2, t + n * 0.12, 0.3, 'sine', 0.04); }); break;
        case 'suram': [440, 392, 349, 330].forEach(function (f, n) { A.tone(f, t + n * 0.24, 0.6, 'sine', 0.13); }); break;
        case 'gelombang': A.noise(t, 1.6, 0.05, 3000, null, 'highpass'); [659, 784, 988, 1175, 1319, 1568].forEach(function (f, n) { A.tone(f, t + n * 0.13, 0.7, 'sine', 0.06); }); break;
        case 'good': {
          var up = Math.pow(2, Math.min(5, A.streak) / 12);   // nada naik tiap jawaban benar beruntun
          A.streak++;
          [523, 659, 784, 1047].forEach(function (f, n) { A.tone(f * up, t + n * 0.07, 0.18, 'triangle', 0.2); });
          break;
        }
        case 'bad': A.streak = 0; A.tone(262, t, 0.26, 'sine', 0.11, null, 208); A.tone(208, t + 0.16, 0.26, 'sine', 0.08, null, 185); break;   // lembut, bukan keras
        case 'tick': A.tone(1318 * (arg || 1), t, 0.05, 'triangle', 0.07); break;   // hitung naik
        case 'pop': A.tone(480 + Math.random() * 120, t, 0.07, 'sine', 0.12, null, 900); break;
        case 'daun': A.tone(1046, t, 0.08, 'triangle', 0.09); A.tone(1568, t + 0.06, 0.13, 'triangle', 0.09); break;
        case 'whoosh': A.noise(t, 0.3, 0.1, 1100); break;
        case 'star': A.tone([523, 659, 784, 1047, 1319, 1568][Math.min(5, arg || 0)], t, 0.42, 'triangle', 0.2); A.tone([1047, 1319, 1568][Math.min(2, arg || 0)], t + 0.02, 0.5, 'sine', 0.07); break;
        case 'gembok': A.tone(330, t, 0.16, 'sine', 0.08, null, 280); A.noise(t, 0.03, 0.05, 1800); break;
        /* panggilan Rako: "kok-kok" rangkong seperti ketukan kayu, lalu siulan yang mengikuti ekspresinya */
        case 'rako_senang': A.kok(t, 640); A.kok(t + 0.13, 760); A.tone(1250, t + 0.27, 0.13, 'sine', 0.09, null, 2100); break;
        case 'rako_pikir': A.kok(t, 520); A.tone(620, t + 0.14, 0.26, 'sine', 0.08, null, 980); break;
        case 'rako_sorak': A.kok(t, 680); A.kok(t + 0.09, 800); A.kok(t + 0.18, 940); A.tone(1500, t + 0.27, 0.12, 'sine', 0.08, null, 2300); break;
        case 'rako_akhir': A.tone(1500, t, 0.09, 'sine', 0.05, null, 2150); break;
        case 'fanfare': {
          var seq = [[392, 523], [392, 523, 659], [392, 523, 659, 784], [392, 523, 659, 784, 1047, 1319]][Math.max(0, Math.min(3, arg || 0))];
          seq.forEach(function (f, n) { A.tone(f, t + n * 0.11, 0.3, 'triangle', 0.18); A.tone(f / 2, t + n * 0.11, 0.3, 'sine', 0.09); });
          break;
        }
      }
    },

    /* ===== Musik: satu lagu aktif, berganti lewat pudar-silang ===== */
    _lagu: null, _timer: 0, _bufs: {}, _antre: {},
    _infoBerkas: function (k) { var d = root.ASET && root.ASET.audio; return d && d[k]; },
    /* musik berkas (js/data/musik_<kunci>.js), dimuat malas satu kali. Bila gagal, cb(null) dan sintesis yang jalan. */
    _muatBerkas: function (k, cb) {
      if (A._bufs[k]) { cb(A._bufs[k]); return; }
      if (A._antre[k]) { A._antre[k].push(cb); return; }
      var tunggu = A._antre[k] = [cb];
      function selesai(buf) {
        A._antre[k] = null;
        if (buf) A._bufs[k] = buf;
        tunggu.forEach(function (f) { f(buf); });
      }
      function dekode() {
        try {
          var bin = atob(root.AUDIO_DATA[k].split(',')[1]), u = new Uint8Array(bin.length);
          for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
          var p = A.ctx.decodeAudioData(u.buffer, selesai, function () { selesai(null); });
          if (p && p.catch) p.catch(function () { });
        } catch (e) { selesai(null); }
      }
      if (root.AUDIO_DATA && root.AUDIO_DATA[k]) { dekode(); return; }
      var s = document.createElement('script');
      s.src = 'js/data/musik_' + k + '.js'; s.onload = dekode; s.onerror = function () { selesai(null); };
      document.head.appendChild(s);
    },
    /* siapkan musik lebih awal, agar pergantian saat gelombang warna tidak terlambat */
    pramuat: function (kunci) { if (A.ctx && A._infoBerkas('bgm_' + kunci)) A._muatBerkas('bgm_' + kunci, function () { }); },
    musik: function (kunci) {
      if (!A.ctx) { A._mau = kunci; return; }
      if (A._lagu && A._lagu.kunci === kunci) return;
      if (A._lagu) A._hentikanLagu(A._lagu, 1.4);
      A._lagu = null;
      if (!kunci) return;
      var g = A.ctx.createGain(), t = A.ctx.currentTime;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(1, t + 1.4);
      g.connect(A.musikBus);
      var k = 'bgm_' + kunci, info = A._infoBerkas(k);
      var L = LAGU[kunci] || LAGU.judul, lagu = { kunci: kunci, g: g, def: L, langkah: 0, tBerikut: t + 0.08, sumber: null, tunggu: !!info };
      A._lagu = lagu;
      if (info) A._muatBerkas(k, function (buf) {
        lagu.tunggu = false;
        if (A._lagu !== lagu) return;
        var n = A.ctx.currentTime;
        if (!buf) { lagu.tBerikut = n + 0.05; return; }   // gagal: sintesis mengambil alih
        var s = A.ctx.createBufferSource();
        s.buffer = buf; s.loop = true; s.loopStart = info.mulai; s.loopEnd = info.mulai + info.panjang;
        s.connect(g); s.start(0, info.mulai);
        g.gain.cancelScheduledValues(n); g.gain.setValueAtTime(0.0001, n); g.gain.exponentialRampToValueAtTime(1, n + 1);
        lagu.sumber = s;
      });
      if (!A._timer) A._timer = setInterval(A._jadwal, 80);
    },
    _hentikanLagu: function (lagu, fade) {
      var t = A.ctx.currentTime;
      lagu.mati = true;
      lagu.g.gain.cancelScheduledValues(t);
      lagu.g.gain.setTargetAtTime(0.0001, t, fade / 3);
      setTimeout(function () { try { lagu.g.disconnect(); if (lagu.sumber) lagu.sumber.stop(); } catch (e) { } }, (fade + 0.6) * 1000);
    },
    _jadwal: function () {
      var lagu = A._lagu, c = A.ctx;
      if (!lagu || !c || c.state !== 'running' || lagu.sumber || lagu.tunggu) return;
      while (lagu.tBerikut < c.currentTime + 0.25) {
        A._mainLangkah(lagu, lagu.langkah, lagu.tBerikut);
        lagu.tBerikut += 30 / lagu.def.bpm;   // satu langkah = seperdelapan
        lagu.langkah++;
      }
    },
    _mainLangkah: function (lagu, n, t) {
      var L = lagu.def, s = n % 8, b = Math.floor(n / 8) % L.akord.length, ak = L.akord[b], g = lagu.g, dur = 30 / L.bpm, v = L.vol;
      if (L.arp) { A._kolintang(hz(ak[POLA_ARP[s]] + 12), t, 0.075 * v, g); }
      else if (s === 0 || s === 4) { A._kolintang(hz(ak[s === 0 ? 0 : 2]), t, 0.05 * v, g); }
      if (L.bass && (s === 0 || s === 4)) A.tone(hz(ak[0] - 12), t, dur * 1.8, 'sine', 0.11 * v, g);
      if (L.perkusi) {
        if (s === 2 || s === 6) A.tone(150, t, 0.11, 'sine', 0.07 * v, g, 90);
        if (s % 2 === 1) A.noise(t, 0.025, 0.018 * v, 6500, g, 'highpass');
      }
      var m = L.mel[n % L.mel.length];
      if (m) {
        var panjang = 1, i = 1;
        while (i < 5 && !L.mel[(n + i) % L.mel.length]) { panjang++; i++; }
        A._suling(hz(m), t, dur * panjang * 0.95, 0.06 * v, g);
      }
    },
    /* kolintang: nada kayu pendek + serangan terang */
    _kolintang: function (f, t, vol, bus) {
      A.tone(f, t, 0.32, 'triangle', vol, bus);
      A.tone(f * 3.9, t, 0.05, 'sine', vol * 0.28, bus);
    },
    /* suling bambu: nada lembut dengan vibrato */
    _suling: function (f, t, dur, vol, bus) {
      var c = A.ctx, o = c.createOscillator(), g = c.createGain(), lfo = c.createOscillator(), lg = c.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(f, t);
      lfo.frequency.value = 5; lg.gain.value = f * 0.006; lfo.connect(lg); lg.connect(o.frequency);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.07);
      g.gain.setValueAtTime(vol, t + Math.max(0.08, dur - 0.12));
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.08);
      o.connect(g); g.connect(bus);
      o.start(t); lfo.start(t); o.stop(t + dur + 0.12); lfo.stop(t + dur + 0.12);
    },

    /* ===== Ambient: desau derau + kicau acak, lewat bus yang ikut turun saat Rako bicara ===== */
    _amb: null, _derauBuf: null,
    AMB: {
      pantai: { f: 900, tipe: 'lowpass', vol: 0.055, ombak: 0.14, burung: 0.5 },
      hutan: { f: 2600, tipe: 'bandpass', vol: 0.014, ombak: 0, burung: 1 },
      sunyi: { f: 480, tipe: 'lowpass', vol: 0.028, ombak: 0.08, burung: 0 },
      sungai: { f: 1800, tipe: 'bandpass', vol: 0.03, ombak: 0.3, burung: 0.5 }
    },
    ambien: function (jenis) {
      if (!A.ctx) { A._mauAmb = jenis; return; }
      if (A._amb && A._amb.jenis === jenis) return;
      var c = A.ctx, t = c.currentTime;
      if (A._amb) {
        var lama = A._amb;
        clearTimeout(lama.timer); lama.mati = true;
        lama.g.gain.cancelScheduledValues(t); lama.g.gain.setTargetAtTime(0.0001, t, 0.5);
        setTimeout(function () { try { lama.s.stop(); if (lama.lfo) lama.lfo.stop(); lama.g.disconnect(); } catch (e) { } }, 2200);
      }
      A._amb = null;
      if (!jenis || !A.AMB[jenis]) return;
      if (!A._derauBuf) {
        var n = c.sampleRate * 3, buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0), last = 0, i;
        for (i = 0; i < n; i++) { last = (last + (Math.random() * 2 - 1) * 0.12) / 1.02; d[i] = last * 3; }
        for (i = 0; i < 3000; i++) d[n - 1 - i] = d[n - 1 - i] * (i / 3000) + d[3000 - 1 - i] * (1 - i / 3000);
        A._derauBuf = buf;
      }
      var def = A.AMB[jenis], s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
      s.buffer = A._derauBuf; s.loop = true; f.type = def.tipe; f.frequency.value = def.f;
      g.gain.setValueAtTime(0.0001, t); g.gain.setTargetAtTime(def.vol, t, 0.8);
      s.connect(f); f.connect(g); g.connect(A.ambienBus); s.start();
      var amb = { jenis: jenis, s: s, g: g };
      if (def.ombak) {
        var lfo = c.createOscillator(), lg = c.createGain();
        lfo.frequency.value = def.ombak; lg.gain.value = def.vol * 0.7;
        lfo.connect(lg); lg.connect(g.gain); lfo.start();
        amb.lfo = lfo;
      }
      A._amb = amb;
      var burung = function () {
        if (amb.mati) return;
        amb.timer = setTimeout(burung, 2500 + Math.random() * 6000);
        if (!A.ctx || A.hidden || A.muted || !def.burung || Math.random() > def.burung) return;
        A.kicau(A.ctx.currentTime + 0.02, 1700 + Math.random() * 1500, 2 + Math.floor(Math.random() * 3), 0.016, A.ambienBus);
      };
      amb.timer = setTimeout(burung, 1800);
    }
  };

  /* Voice: speechSynthesis id-ID + sorot kata. Tiap tokoh punya profil di config/suara.js. Selalu selesai (tidak ada softlock); tanpa suara id-ID cukup subtitle. */
  var V = {
    token: 0, log: [], aktif: null, antrean: [], penunggu: [], jedaT: 0, terakhir: { k: '', saat: -1e9 },
    jenisSuara: function (v) { return SUARA.namaPria.test(v.name) ? 'p' : 'w'; },
    /* jenis yang diminta didahulukan, lalu suara daring bila tersambung karena biasanya lebih alami */
    voice: function (lang, jenis, hanyaLokal) {
      var ss = root.speechSynthesis; if (!ss) return null;
      function kode(v) { return v.lang.replace('_', '-').replace(/^in\b/, 'id'); }   // Android lama memakai in_ID
      var semua = ss.getVoices() || [], pre = lang.slice(0, 2);
      var cocok = semua.filter(function (v) { return kode(v) === lang; });
      if (!cocok.length) cocok = semua.filter(function (v) { return kode(v).slice(0, 2) === pre; });
      if (hanyaLokal) cocok = cocok.filter(function (v) { return v.localService; });
      var daring = !root.navigator || navigator.onLine !== false, best = null, nilaiBest = -1;
      cocok.forEach(function (v) {
        var n = (V.jenisSuara(v) === jenis ? 2 : 0) + (daring && !v.localService ? 1 : 0);
        if (n > nilaiBest) { nilaiBest = n; best = v; }
      });
      return best;
    },
    /* suara Windows di perangkat hanya mengenal langkah kecepatan, jadi perbedaan kecil dibulatkan supaya tetap terdengar */
    kecepatan: function (vc, r) {
      if (!vc.localService || !/^Microsoft/.test(vc.name)) return r;
      return r > 1.04 ? Math.max(r, 1.26) : (r < 0.96 ? Math.min(r, 0.79) : 1);
    },
    izin: function () { return !U.TEST || /[?&]suara=1/.test(location.search); },
    available: function () { return !!root.speechSynthesis && V.izin(); },
    /* rekaman tokoh bila ada. Kuncinya memuat teks, jadi kalimat yang diubah di strings.js tidak memutar rekaman lama. Hasil: [berkas, detik] */
    rekaman: function (text, tokoh) {
      var R = root.REKAMAN;
      return (R && V.izin() && R.daftar[(tokoh || 'narasi') + '|' + text]) || null;
    },
    /* Hanya tindakan murid dan pergantian layar yang memanggil ini. Kalimat berhenti; yang masih antre tidak dibacakan, tetapi tulisannya tetap tampil. */
    stop: function () {
      V.token++;
      try { if (root.speechSynthesis) root.speechSynthesis.cancel(); } catch (e) { }
      if (V.el) { V.el.onended = V.el.onerror = V.el.onplaying = null; try { V.el.pause(); } catch (e) { } }
      clearTimeout(V.jedaT); V.jedaT = 0;
      var ak = V.aktif, sisa = V.antrean;
      V.aktif = null; V.antrean = [];
      A.duck(false);
      if (ak) ak.ok();
      sisa.forEach(function (x) { V._giliran(x); x.ok(); });
      V._tuntas();
    },
    /* galat di layar tidak boleh menghentikan antrean untuk selamanya */
    _giliran: function (x) { if (x.opts.mulai) { try { x.opts.mulai(); } catch (e) { console.error(e); } } },
    sibuk: function () { return !!(V.aktif || V.jedaT || V.antrean.length); },
    /* janji yang selesai saat tidak ada lagi kalimat yang diucapkan atau antre */
    selesai: function () { return V.sibuk() ? new Promise(function (ok) { V.penunggu.push(ok); }) : Promise.resolve(); },
    _tuntas: function () {
      if (V.sibuk()) return;
      var p = V.penunggu; V.penunggu = [];
      p.forEach(function (ok) { ok(); });
    },
    /* Kalimat baru menunggu kalimat yang sedang diucapkan: hanya Voice.stop yang memotongnya.
       opts: tokoh (kunci di SUARA.tokoh, kosong = narasi), eks (ekspresi Rako), rate, lang, onWord(i) (i = indeks kata yang sedang dibaca, words.length = selesai),
       mulai (dipanggil saat giliran kalimat ini tiba), info (pemberitahuan yang bisa basi: hanya yang terbaru yang antre) */
    say: function (text, opts) {
      opts = opts || {};
      if (U.TEST) V.log.push({ t: text, k: opts.tokoh || 'narasi', e: opts.eks || '' });
      if (opts.info) {
        if (V.aktif && V.aktif.text === text) return Promise.resolve();
        V.antrean = V.antrean.filter(function (x) { if (!x.opts.info) return true; x.ok(); return false; });
      }
      return new Promise(function (ok) {
        var item = { text: text, opts: opts, ok: ok };
        if (V.sibuk()) V.antrean.push(item); else V._ucap(item);
      });
    },
    _ucap: function (item) {
      var text = item.text, opts = item.opts;
      V.aktif = item;
      V._giliran(item);
      var P = SUARA.tokoh[opts.tokoh] || SUARA.narasi, my = V.token, words = text.split(/\s+/), rate = opts.rate || P.rate, lang = opts.lang || 'id-ID';
      var rek = V.rekaman(text, opts.tokoh);
      /* panggilan Rako hanya saat ia mulai berbicara, bukan di tiap kalimat */
      var panggil = P.panggilan && V.izin() && (V.terakhir.k !== opts.tokoh || performance.now() - V.terakhir.saat > SUARA.jedaPanggilan * 1000);
      var tunda = panggil ? SUARA.tundaPanggilan : 0;
      var perWord = U.TEST ? 0.02 : 0.36 / rate, total = tunda + (rek ? rek[1] : words.length * perWord) + 0.3;
      var finished = false, sawBoundary = false, berbunyi = false;
      A.duck(true);
      if (panggil) A.sfx('rako_' + (opts.eks || 'senang'));
      function mark(i) { if (my === V.token && opts.onWord) opts.onWord(i); }
      function finish() {
        if (finished) return; finished = true;
        if (my !== V.token) return;
        mark(words.length);
        V.terakhir = { k: opts.tokoh, saat: performance.now() };
        V.aktif = null;
        if (!V.antrean.length) A.duck(false);
        item.ok();
        if (V.antrean.length) V.jedaT = setTimeout(function () { V.jedaT = 0; var n = V.antrean.shift(); if (n) V._ucap(n); else V._tuntas(); }, 200);
        else V._tuntas();
      }
      var acc = tunda;
      for (var i = 0; i < words.length; i++) (function (idx) {
        Tween.wait(acc * 1000 / Tween.speed).then(function () { if (!sawBoundary && !finished) mark(idx); });
        acc += rek ? rek[1] * (words[idx].length + 1) / (text.length + 1) : perWord;
      })(i);
      function akhirUcap() { if (opts.eks === 'sorak' && P.panggilan && my === V.token) A.sfx('rako_akhir'); finish(); }
      function ucap(vc, ulang) {
        var u = new SpeechSynthesisUtterance(text);
        u.lang = lang; u.rate = V.kecepatan(vc, rate); u.voice = vc;
        u.pitch = V.jenisSuara(vc) === P.jenis ? P.pitch : P.pitchLain;
        u.onstart = function () { berbunyi = true; };
        u.onboundary = function (e) {
          if (e.name && e.name !== 'word') return;
          sawBoundary = true;
          var idx = text.slice(0, e.charIndex).split(/\s+/).length - 1;
          mark(Math.max(0, Math.min(words.length - 1, idx)));
        };
        u.onend = akhirUcap;
        /* suara daring gagal saat tidak ada internet: ulang dengan suara di perangkat. Bila tetap gagal, pewaktu yang menyelesaikan. */
        u.onerror = function (e) {
          if (my !== V.token || (e && (e.error === 'canceled' || e.error === 'interrupted'))) return;
          if (!ulang && !vc.localService) {
            var lokal = V.voice(lang, P.jenis, true);
            if (lokal) { try { ucap(lokal, true); return; } catch (x) { } }
          }
          if (berbunyi) finish();
        };
        root.speechSynthesis.speak(u);
      }
      /* rekaman gagal diputar: lanjut dengan suara perangkat */
      function putar() {
        var el = V.el || (V.el = new Audio()), dialih = false;
        function alih() {
          if (dialih || my !== V.token) return;
          dialih = true;
          if (vc) { try { ucap(vc); } catch (x) { } }
          else if (berbunyi) finish();
        }
        el.onplaying = function () { berbunyi = true; };
        el.onended = akhirUcap;
        el.onerror = alih;
        el.src = root.REKAMAN.dasar + rek[0] + '.mp3';
        var j = el.play();
        if (j && j.catch) j.catch(alih);
      }
      var vc = V.available() ? V.voice(lang, P.jenis) : null;
      var voiceOn = !(root.Save && Save.data.settings.voice === false);   // "Suara tokoh" mati: subtitle saja
      var minta = (rek || vc) && !A.muted && !A.hidden && voiceOn;
      /* Tanpa suara: selesai setelah waktu baca. Dengan suara: mesin yang menentukan, pewaktu hanya berjaga bila suara tidak pernah mulai atau penanda selesai tidak datang. */
      var waktuBaca = U.TEST && !V.izin() ? 0.1 : total + 0.5;
      setTimeout(function () { if (!berbunyi) finish(); }, (minta ? Math.max(waktuBaca * 1.5, tunda + 4) : waktuBaca) * 1000);
      if (minta) {
        setTimeout(finish, Math.max(total * 3, total + 8) * 1000);
        var mulai = function () { if (my !== V.token) return; try { if (rek) putar(); else ucap(vc); } catch (e) { /* abaikan, subtitle tetap jalan */ } };
        if (tunda) setTimeout(mulai, tunda * 1000); else mulai();
      }
    }
  };
  root.Aud = A;
  root.Voice = V;
})(typeof window !== 'undefined' ? window : globalThis);
