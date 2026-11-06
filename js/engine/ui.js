/* UI: ikon, deret ikon pojok kanan atas, panel (overlay), Pengaturan, toast, tab. Kerangka dari gim 577; bentuk "Papan Penjelajah" dibuat kode. */
(function (root) {
  var T = '#16352C', K = '#F5A623', P = '#8FCF4E', Z = '#1F8A5B', C = '#FFF4D9', B = '#B9653A', L = '#BFE9EE', S = '#1592A8';
  var ST = 'fill="none" stroke="' + T + '" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"';
  function isi(warna) { return 'fill="' + warna + '" stroke="' + T + '" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"'; }
  /* roda gigi dengan 6 gigi tegas, supaya tidak terbaca sebagai matahari */
  function rodaGigi() {
    var d = '', i, n = 6, langkah = Math.PI * 2 / n;
    for (i = 0; i < n; i++) {
      [[-0.32, 15], [-0.19, 21.5], [0.19, 21.5], [0.32, 15]].forEach(function (t, j) {
        var a = i * langkah + t[0];
        d += (i === 0 && j === 0 ? 'M' : 'L') + (24 + Math.sin(a) * t[1]).toFixed(1) + ' ' + (24 - Math.cos(a) * t[1]).toFixed(1);
      });
    }
    return d + 'z';
  }
  var ICON = {
    soundOn: '<path d="M8 19h7l10-8v26l-10-8H8z" ' + isi(K) + '/><path d="M31 18c3 3 3 9 0 12M36 13c6 6 6 16 0 22" ' + ST + '/>',
    soundOff: '<path d="M8 19h7l10-8v26l-10-8H8z" ' + isi(C) + '/><path d="M31 18l10 12M41 18l-10 12" ' + ST + '/>',
    full: '<path d="M8 18V8h10M30 8h10v10M40 30v10H30M18 40H8V30" ' + ST + '/>',
    fullExit: '<path d="M18 8v10H8M30 8v10h10M18 40V30H8M30 40V30h10" ' + ST + '/>',
    gear: '<path d="' + rodaGigi() + '" fill="' + K + '" stroke="' + T + '" stroke-width="3.2" stroke-linejoin="round"/><circle cx="24" cy="24" r="6" fill="' + C + '" stroke="' + T + '" stroke-width="3.2"/>',
    jurnal: '<path d="M9 8h13c2 0 2 2 2 2s0-2 2-2h13v30H26c-2 0-2 2-2 2s0-2-2-2H9z" ' + isi(C) + '/><path d="M24 10v30M14 16h5M14 23h5M29 16h5M29 23h5" ' + ST + '/>',
    peta: '<path d="M6 12l12-5 12 5 12-5v29l-12 5-12-5-12 5z" ' + isi(P) + '/><path d="M18 7v29M30 12v29" ' + ST + '/>',
    pause: '<rect x="13" y="10" width="8" height="28" rx="2" ' + isi(C) + '/><rect x="27" y="10" width="8" height="28" rx="2" ' + isi(C) + '/>',
    daun: '<path d="M9 39C7 22 18 9 40 8c1 22-11 33-31 31z" ' + isi(P) + '/><path d="M9 39C15 28 23 21 32 16" ' + ST + '/>',
    dengar: '<path d="M8 19h7l10-8v26l-10-8H8z" ' + isi(C) + '/><path d="M31 18c3 3 3 9 0 12" ' + ST + '/>',
    kapak: '<path d="M15 41L32 14" ' + ST + ' /><path d="M26 8c7 0 13 5 15 12l-10 4-9-10z" ' + isi(C) + '/>',
    bibit: '<path d="M24 41V22" ' + ST + '/><path d="M24 26C14 26 9 21 8 12c10 0 15 5 16 14z" ' + isi(P) + '/><path d="M24 22c1-7 6-11 15-11-1 8-6 12-15 11z" ' + isi(P) + '/>',
    panah: '<path d="M6 24h32M28 13l11 11-11 11" fill="none" stroke="' + T + '" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>',
    naik: '<path d="M24 41V10M12 22L24 9l12 13" fill="none" stroke="' + Z + '" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>',
    turun: '<path d="M24 7v31M12 26l12 13 12-13" fill="none" stroke="' + B + '" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>',
    tetap: '<path d="M7 24h31M26 12l13 12-13 12" fill="none" stroke="' + S + '" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>',
    bintang: '<path d="M24 5l5.8 12.2 13.2 1.8-9.7 9.3 2.5 13.4L24 35.2l-11.8 6.5 2.5-13.4L5 19l13.2-1.8z" ' + isi(K) + '/>',
    bintangKosong: '<path d="M24 5l5.8 12.2 13.2 1.8-9.7 9.3 2.5 13.4L24 35.2l-11.8 6.5 2.5-13.4L5 19l13.2-1.8z" ' + isi('#E8D7AE') + '/>',
    gembok: '<rect x="11" y="21" width="26" height="20" rx="4" ' + isi(C) + '/><path d="M16 21v-6a8 8 0 0 1 16 0v6" ' + ST + '/>',
    centang: '<circle cx="24" cy="24" r="19" ' + isi(P) + '/><path d="M15 25l7 7 12-14" ' + ST + '/>',
    rumah: '<path d="M7 24L24 9l17 15M12 21v18h24V21" ' + isi(C) + '/><rect x="20" y="28" width="8" height="11" fill="' + T + '"/>',
    orang: '<circle cx="24" cy="15" r="8" ' + isi(K) + '/><path d="M9 41c0-10 7-15 15-15s15 5 15 15z" ' + isi(C) + '/>',
    pipa: '<rect x="5" y="17" width="38" height="14" rx="4" ' + isi(P) + '/><path d="M18 17v14M31 17v14" ' + ST + '/><path d="M24 36c-2 3-2 5 0 6 2-1 2-3 0-6z" ' + isi(L) + '/>',
    teras: '<path d="M5 41h38V31H33V21H21V11H5z" ' + isi(P) + '/><path d="M5 21h16M5 31h28" ' + ST + '/>',
    sampah: '<path d="M12 16h24l-3 25H15z" ' + isi(C) + '/><path d="M8 16h32M19 16v-5h10v5M20 23l1 12M28 23l-1 12" ' + ST + '/>',
    jala: '<path d="M7 9h34L31 41H17z" ' + isi(C) + '/><path d="M12 19h24M15 30h18M19 9l5 32M29 9l-5 32" ' + ST + '/>',
    perahu: '<path d="M4 29h40c-2 8-6 12-11 12H15C10 41 6 37 4 29z" ' + isi(S) + '/><path d="M24 29V7" ' + ST + '/><path d="M26 9l12 16H26z" ' + isi(C) + '/>',
    logam: '<path d="M6 34l8-14h20l8 14z" ' + isi(K) + '/><path d="M14 20l5 14M34 20l-5 14" ' + ST + '/>',
    mesin: '<circle cx="24" cy="24" r="10" ' + isi(P) + '/><path d="M24 7v7M24 34v7M7 24h7M34 24h7M12 12l5 5M31 31l5 5M12 36l5-5M31 17l5-5" ' + ST + '/>',
    kincir: '<path d="M24 24v18" ' + ST + '/><path d="M24 24L12 8l12 3zM24 24l19 3-11 8zM24 24L8 36l6-14z" ' + isi(C) + '/>'
  };
  /* gambar AI bila ada (ASET.img.ikon_<nama>), SVG menjadi cadangan */
  function gambar(kunci, kelas, size) {
    var g = root.ASET && ASET.img[kunci];
    return g ? '<img class="' + kelas + '" alt="" draggable="false"' + (size ? ' width="' + size + '" height="' + size + '"' : '') + ' src="assets/img/' + g + '">' : '';
  }
  function icon(name, size) { return gambar('ikon_' + name, 'ico', size || 42) || '<svg class="ico" viewBox="0 0 48 48" width="' + (size || 42) + '" height="' + (size || 42) + '" aria-hidden="true">' + ICON[name] + '</svg>'; }
  var JAM = gambar('ikon_jam', 'ico') || '<svg viewBox="0 0 64 80" aria-hidden="true"><path d="M14 8h36M14 72h36" fill="none" stroke="' + T + '" stroke-width="8" stroke-linecap="round"/><path d="M19 12c0 14 11 18 11 28S19 54 19 68h26c0-14-11-18-11-28s11-14 11-28z" ' + isi(L) + '/><path d="M24 62c3-7 7-10 8-11 1 1 5 4 8 11z" fill="' + S + '"/><path d="M26 25h12c-2 3-4 5-6 8-2-3-4-5-6-8z" fill="' + S + '"/><path d="M32 40v9" stroke="' + S + '" stroke-width="3"/></svg>';
  /* gambar AI memakai titik ujung jari yang sama (18%, 12%), jadi penempatannya tidak berubah. SVG menjadi cadangan. */
  var TANGAN = root.ASET && ASET.img.tangan_penunjuk ? '<img alt="" draggable="false" src="assets/img/' + ASET.img.tangan_penunjuk + '">' : '<svg viewBox="0 0 84 84" aria-hidden="true"><g transform="rotate(-38 40 42)"><path d="M33 40V13a6 6 0 0 1 12 0v22l12 2c5 1 8 4 7 9l-2 14c-1 6-5 9-11 9H39c-5 0-8-2-11-7l-9-14c-3-5 4-9 8-5z" ' + isi(C) + '/><path d="M45 37v9M53 39v8" ' + ST + '/><rect x="33" y="70" width="32" height="11" rx="4" ' + isi(K) + '/></g></svg>';

  var UI = {
    icon: icon, gambar: gambar, ICON: ICON, JAM: JAM, TANGAN: TANGAN,
    /* Jam Pasir besar saat melompat, dengan pusaran waktu di belakangnya */
    jamBesar: function (induk) {
      var w = U.h('div', 'lompat-jam', gambar('lompat_pusaran', 'pusaran-waktu') + '<div class="jam-besar">' + JAM + '</div>');
      induk.appendChild(w);
      return w;
    },
    iconButton: function (name, cls, onTap, o) {
      o = o || {};
      return Input.button(icon(name, o.size), 'ibtn ' + (cls || 'kertas'), onTap, o);
    },
    prefersReduced: !!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches),
    kurangi: false,
    applySettings: function () {
      var s = Save.data.settings;
      Aud.setMuted(s.mute);
      UI.kurangi = s.reduce || UI.prefersReduced;
      document.body.classList.toggle('reduce', UI.kurangi);
    },

    /* deret ikon pojok kanan atas: suara, layar penuh, lalu tombol terakhir (pengaturan) */
    iconBar: function (parent) {
      var bar = U.h('div', 'iconbar');
      var snd = UI.iconButton(Save.data.settings.mute ? 'soundOff' : 'soundOn', 'kertas', function () {
        Save.data.settings.mute = !Save.data.settings.mute; Save.save(); UI.applySettings(); refresh();
      }, { id: 'sound' });
      bar.appendChild(snd);
      var fs = null;
      if (FS.supported()) {
        fs = UI.iconButton(FS.isFull() ? 'fullExit' : 'full', 'kertas', function () {
          FS.toggle(function () { UI.toast(STR.icons.fsDenied); });
        }, { id: 'fullscreen' });
        bar.appendChild(fs);
      }
      var lb = UI.iconButton('gear', 'kertas', function () { UI.settings(); }, { id: 'settings' });
      bar.appendChild(lb);
      function refresh() {
        var m = Save.data.settings.mute;
        snd.innerHTML = '<span class="lbl">' + icon(m ? 'soundOff' : 'soundOn') + '</span>';
        snd.setAttribute('aria-label', m ? STR.icons.soundOff : STR.icons.soundOn);
        if (fs) {
          var f = FS.isFull();
          fs.innerHTML = '<span class="lbl">' + icon(f ? 'fullExit' : 'full') + '</span>';
          fs.setAttribute('aria-label', f ? STR.icons.fullExit : STR.icons.full);
        }
        lb.setAttribute('aria-label', STR.icons.settings);
      }
      refresh();
      FS.onChange(refresh);
      bar._cleanup = function () { FS.offChange(refresh); };
      UI.refreshIcons = refresh;
      parent.appendChild(bar);
      return bar;
    },

    /* panel modal bergaya kertas jurnal. Mengembalikan {el, body, panel, close} */
    overlay: function (title, cls, ringan) {
      var ov = U.h('div', 'overlay' + (ringan ? ' ringan' : '')), panel = U.h('div', 'panel ' + (cls || '')), opener = document.activeElement;
      panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'true'); panel.setAttribute('aria-label', title);
      // fokus tidak boleh lolos ke belakang panel
      document.getElementById('scene-root').inert = true;
      document.querySelectorAll('.overlay').forEach(function (x) { x.inert = true; });
      panel.innerHTML = '<div class="phead">' + title + '</div>';
      var body = U.h('div', 'pbody'); panel.appendChild(body); ov.appendChild(panel);
      document.getElementById('stage').appendChild(ov);
      var api = {
        el: ov, body: body, panel: panel,
        close: function () {
          if (ov.parentNode) ov.parentNode.removeChild(ov);
          var rest = document.querySelectorAll('.overlay');
          if (rest.length) rest[rest.length - 1].inert = false; else document.getElementById('scene-root').inert = false;
          if (opener && opener.isConnected && !opener.disabled) opener.focus({ preventScroll: true });
          if (api.onClose) api.onClose();
        }
      };
      return api;
    },
    closeOverlays: function () {
      document.querySelectorAll('.overlay').forEach(function (x) { x.parentNode.removeChild(x); });
      document.getElementById('scene-root').inert = false;
    },
    /* sakelar Nyala/Mati dengan label (bukan hanya warna) */
    switchRow: function (label, get, set, id, note) {
      var row = U.h('div', 'swrow');
      row.innerHTML = '<span class="swlbl">' + label + (note ? '<small>' + note + '</small>' : '') + '</span>';
      var b = Input.button('', 'switch', function () { set(!get()); paint(); }, { id: id, aria: label });
      function paint() {
        var on = get();
        b.classList.toggle('on', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        b.innerHTML = '<span class="knob"></span><span class="swtxt">' + (on ? STR.settings.on : STR.settings.off) + '</span>';
      }
      paint(); row.appendChild(b);
      return row;
    },
    settings: function (onClose) {
      var o = UI.overlay(STR.settings.title, 'settings');
      var s = Save.data.settings, T2 = STR.settings;
      o.body.appendChild(UI.switchRow(T2.sound, function () { return !s.mute; }, function (v) { s.mute = !v; Save.save(); UI.applySettings(); if (UI.refreshIcons) UI.refreshIcons(); }, 'sw-sound'));
      o.body.appendChild(UI.switchRow(T2.voice, function () { return s.voice !== false; }, function (v) { s.voice = v; Save.save(); if (!v) Voice.stop(); }, 'sw-voice', window.REKAMAN && REKAMAN.ai ? T2.voiceNoteAi : T2.voiceNote));
      var rd = UI.switchRow(T2.reduce, function () { return s.reduce || UI.prefersReduced; }, function (v) { s.reduce = v; Save.save(); UI.applySettings(); }, 'sw-reduce');
      if (UI.prefersReduced) rd.querySelector('button').disabled = true;   // diatur perangkat: selalu nyala
      o.body.appendChild(rd);
      o.body.appendChild(UI.switchRow(T2.santai, function () { return s.santai; }, function (v) { s.santai = v; Save.save(); }, 'sw-santai', T2.santaiNote));
      // kualitas tampilan 3D: berputar di antara pilihan
      var kr = U.h('div', 'swrow'), urut = ['auto', 'hemat', 'sedang', 'tinggi'];
      kr.innerHTML = '<span class="swlbl">' + T2.kualitas + '<small>' + T2.kualitasNote + '</small></span>';
      var kb = Input.button(T2.kualitasPilih[s.kualitas] || T2.kualitasPilih.auto, 'kertas pilihan', function () {
        var nama = urut[(urut.indexOf(s.kualitas) + 1) % urut.length];
        Dunia.aturTingkat(nama);
        kb.querySelector('.lbl').textContent = T2.kualitasPilih[nama];
      }, { id: 'kualitas', aria: T2.kualitas });
      kr.appendChild(kb); o.body.appendChild(kr);
      // Murid baru (perangkat dipakai bergantian): ketuk dua kali agar tidak terhapus tanpa sengaja
      var row = U.h('div', 'swrow'), sure = false;
      row.innerHTML = '<span class="swlbl">' + T2.fresh + '<small>' + T2.freshNote + '</small></span>';
      var del = Input.button(T2.freshBtn, 'bata hapus', function () {
        if (!sure) { sure = true; del.querySelector('.lbl').textContent = T2.freshSure; return; }
        Save.newStudent(); Scenes.go('judul');
      }, { id: 'new-student' });
      row.appendChild(del); o.body.appendChild(row);
      var close = Input.button(T2.close, 'zamrud lebar', function () { o.close(); }, { id: 'close' });
      o.body.appendChild(close);
      o.onClose = onClose;
      setTimeout(function () { close.focus(); }, 30);
      return o;
    },
    toast: function (text) {
      var t = U.h('div', 'toast', text);
      document.getElementById('stage').appendChild(t);
      setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 2600);
    },
    /* tab sederhana: pages [{id, label, html()}]. Mengembalikan elemen isi. */
    tabs: function (parent, pages, kelasIsi) {
      var tabs = U.h('div', 'ttabs'), isiEl = U.h('div', kelasIsi || 'tab-isi');
      tabs.setAttribute('role', 'tablist');
      function pick(p) {
        isiEl.innerHTML = p.html();
        tabs.querySelectorAll('.btn').forEach(function (b) { var on = b.dataset.id === 'tab-' + p.id; b.classList.toggle('on', on); b.setAttribute('aria-selected', on ? 'true' : 'false'); });
      }
      pages.forEach(function (p) {
        var b = Input.button(p.label, 'kertas', function () { pick(p); }, { id: 'tab-' + p.id });
        b.setAttribute('role', 'tab');
        tabs.appendChild(b);
      });
      parent.appendChild(tabs); parent.appendChild(isiEl);
      pick(pages[0]);
      return isiEl;
    }
  };
  root.UI = UI;
})(window);
