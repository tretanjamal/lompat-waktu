/* Main: muat simpanan, siapkan dunia, lalu ke layar judul. ?test=1 hanya untuk bot QA. */
(function () {
  Save.load();
  document.getElementById('rotate-text').textContent = STR.rotate;
  bootStage();
  document.body.classList.toggle('hp', U.HP);
  Muat.buka();
  Dunia.init();
  UI.applySettings();
  if (U.TEST) {
    window.__test = {
      scene: function () { return Scenes.name; },
      fase: function () { return Arena.mati ? '' : Arena.fase; },
      sasaran: function () { return Arena.mati ? [] : Object.keys(Arena.sasaran); },
      sibuk: function () { return Arena.sibuk || Arena.kunci; },
      save: function () { return Save.data; },
      info: function () { return { segitiga: Dunia.ok ? Dunia.r.info.render.triangles : 0, gambar: Dunia.ok ? Dunia.r.info.render.calls : 0, webgl: Dunia.ok ? (Dunia.r.capabilities.isWebGL2 ? 2 : 1) : 0, tingkat: Dunia.tingkat }; },
      balon: function () { var el = document.querySelector('.btxt'); return el ? { teks: el.textContent, tinggi: el.offsetHeight, garis: parseFloat(getComputedStyle(el).lineHeight) } : null; },
      diam: function (dt) { Arena.diamT = dt; }
    };
    if (/[?&]fresh=1/.test(location.search)) Save.reset();
    if (/[?&]fast=1/.test(location.search)) Tween.speed = 0.3;
  }
  /* HP: ketukan pertama membuka layar penuh, lalu FS mengunci posisi mendatar. Bila ditolak, panggung yang diputar tetap bisa dimainkan. */
  if (U.HP && !U.TEST && FS.supported()) document.addEventListener('pointerup', function sekali() { document.removeEventListener('pointerup', sekali); if (!FS.isFull()) FS.toggle(); });
  var fontsReady = document.fonts && document.fonts.load ? Promise.all([
    document.fonts.load('800 40px "Baloo 2"'), document.fonts.load('700 26px Andika'), document.fonts.load('400 26px Andika')
  ]).catch(function () { }) : Promise.resolve();
  var timeout = new Promise(function (r) { setTimeout(r, 2500); });   // font gagal: tetap jalan dengan cadangan
  var scene = U.TEST && /[?&]scene=(\w+)/.exec(location.search);       // uji: langsung ke layar tertentu
  /* model yang dipakai semua layar: tokoh, Rako, dan pulau. Gagal dimuat = cadangan kode. */
  var model = (ASET.model && ASET.model.umum) || [], dimuat = 0, hurufSiap = false;
  function lapor() { Muat.atur((hurufSiap ? 0.1 : 0) + 0.7 * dimuat / Math.max(1, model.length)); }
  Promise.all([
    Promise.race([fontsReady, timeout]).then(function () { hurufSiap = true; lapor(); }),
    Aset3D.muatZona('umum', function () { dimuat++; lapor(); })
  ]).then(function () {
    Muat.atur(0.85);
    return new Promise(function (ok) { setTimeout(ok, 40); });   // batang sempat tergambar sebelum pulau dibangun
  }).then(function () {
    if (Dunia.ok) Pulau.siapkan();
    Foto.pramuat();
    Muat.atur(1);
    return Muat.tunggu();
  }).then(function () {
    return Scenes.go(scene ? scene[1] : 'judul');
  }).then(function () { Muat.tutup(); });
})();
