/* Pengantar: dua klip dari mata murid. Murid sendiri yang mengetuk Jam Pasir di antara keduanya, lalu kembali ke hari ini dan masuk ke Misi 1.
   Hanya pada permainan pertama. Tanpa video, gagal diputar, atau Kurangi animasi: langsung ke Misi 1. */
(function (root) {
  var JAM_X = 630, JAM_Y = 333;   // letak Jam Pasir pada akhir klip 1, dalam kanvas logis
  var v1, v2, habis = true, timer = [];

  function keGim() {
    if (habis) return;
    habis = true;
    Scenes.go('bab0');
  }
  function buatVideo(induk, nama) {
    var v = U.h('video', 'intro-video');
    v.preload = 'auto';
    v.playsInline = true; v.setAttribute('playsinline', ''); v.setAttribute('webkit-playsinline', '');
    v.muted = !!Save.data.settings.mute;
    v.addEventListener('error', keGim);
    v.src = 'assets/video/' + nama;
    induk.appendChild(v);
    return v;
  }
  /* macet di tengah jalan pun murid tetap bisa lanjut, karena batas waktu ikut menyelesaikan klip */
  function putar(v, selesai) {
    var kelar = false;
    function akhir() { if (kelar || habis) return; kelar = true; selesai(); }
    v.addEventListener('ended', akhir);
    timer.push(setTimeout(akhir, 16000));
    var p = v.play();
    if (p && p.catch) p.catch(function () {
      if (habis) return;
      /* peramban menolak memutar dengan suara: coba tanpa suara, bila tetap gagal langsung ke gim */
      v.muted = true;
      var q = v.play();
      if (q && q.catch) q.catch(keGim);
    });
  }
  function tabBerubah() {
    [v1, v2].forEach(function (v) {
      if (document.hidden) { v.ditahan = !v.paused; v.pause(); }
      else if (v.ditahan) { v.ditahan = false; var p = v.play(); if (p && p.catch) p.catch(function () { }); }
    });
  }

  Scenes.add('intro', {
    enter: function (akar) {
      var T = STR.intro, balik = false;
      habis = false;
      Save.data.intro = true; Save.save();
      Voice.stop(); Aud.musik(null); Aud.ambien(null);
      var w = U.h('div', 'intro');
      v2 = buatVideo(w, ASET.video.intro2);
      v1 = buatVideo(w, ASET.video.intro1);   // klip 1 di atas; klip 2 baru tampak setelah mulai bergerak
      akar.appendChild(w);
      document.addEventListener('visibilitychange', tabBerubah);

      var bicara = U.h('div', 'intro-bicara'), potret = U.h('div', 'lapis potret kena', '<img alt="" draggable="false">'), balon = U.h('div', 'lapis balon kena'), teks = U.h('div', 'btxt');
      teks.setAttribute('role', 'status'); teks.setAttribute('aria-live', 'polite');
      balon.appendChild(teks);
      balon.appendChild(UI.iconButton('dengar', 'kertas dengar', function () { Voice.stop(); Voice.say(teks.textContent, { tokoh: 'rako' }); }, { id: 'intro-dengar', aria: STR.icons.replay, size: 36 }));
      bicara.appendChild(potret); bicara.appendChild(U.h('div', 'nama-bicara', STR.tokoh.rako)); bicara.appendChild(balon);
      w.appendChild(bicara);
      function kata(t, eks) {
        teks.textContent = t;
        var u = Foto.potret('rako', eks);
        if (u) potret.querySelector('img').src = u;
        bicara.style.display = 'block';
        balon.classList.remove('muncul'); void balon.offsetWidth; balon.classList.add('muncul');
        Voice.say(t, { tokoh: 'rako', eks: eks });
      }
      w.appendChild(Input.button(STR.hud.lewati, 'kertas intro-lewati', keGim, { id: 'intro-lewati' }));

      /* tahap 1: klip berhenti, murid membalik Jam Pasir */
      putar(v1, function () {
        var jam = U.h('button', 'intro-jam'), tangan = U.h('div', 'tangan', UI.TANGAN);
        jam.type = 'button'; jam.dataset.id = 'intro-jam'; jam.setAttribute('aria-label', T.jamLabel);
        tangan.style.display = 'block';
        tangan.style.transform = 'translate(' + (JAM_X + 96) + 'px,' + (JAM_Y + 100) + 'px)';
        jam.addEventListener('click', function () {
          if (balik || habis) return;
          balik = true;
          Aud.init();
          jam.remove(); tangan.remove(); bicara.style.display = 'none';
          Voice.stop();
          Aud.sfx('jam');
          var jb = UI.jamBesar(w);
          timer.push(setTimeout(function () { jb.remove(); }, 900));
          v2.addEventListener('playing', function () { v1.style.display = 'none'; });
          putar(v2, tahapDua);
        });
        w.appendChild(jam); w.appendChild(tangan);
        kata(T.jam, 'senang');
        setTimeout(function () { jam.focus({ preventScroll: true }); }, 40);
      });

      /* tahap 2: pulau 20 tahun lagi, murid kembali ke hari ini */
      function tahapDua() {
        var b = Input.button(T.kembali, 'kunyit intro-kembali', function () {
          if (b.disabled) return;
          b.disabled = true;
          Voice.stop();
          Aud.sfx('kembali');
          UI.jamBesar(w);
          timer.push(setTimeout(keGim, 650));
        }, { id: 'intro-kembali' });
        w.appendChild(b);
        kata(T.akhir, 'pikir');
        setTimeout(function () { b.focus({ preventScroll: true }); }, 40);
      }
    },
    exit: function () {
      habis = true;
      timer.forEach(clearTimeout); timer = [];
      document.removeEventListener('visibilitychange', tabBerubah);
      Voice.stop();
      [v1, v2].forEach(function (v) { v.removeEventListener('error', keGim); v.pause(); v.removeAttribute('src'); v.load(); });
    }
  });

  root.Intro = {
    perlu: function () {
      var d = ASET.video;
      if (!d || !d.intro1 || !d.intro2 || Save.data.intro || UI.kurangi) return false;
      return !U.TEST || /[?&]intro=1/.test(location.search);   // bot uji langsung ke Misi 1
    }
  };
})(window);
