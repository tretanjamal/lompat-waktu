/* Input: tombol anak (Pointer Events via click, keyboard Tab/Enter/panah), bunyi klik < 100 ms. Dari gim 577.
   Tambahan: di dunia 3D tanpa panel terbuka, tombol panah menggerakkan tokoh, bukan fokus tombol. */
(function (root) {
  var Input = {
    /* buat tombol. cls: warna (kunyit|zamrud|kertas|toska) + kelas tambahan; o: x,y,w,h (posisi di stage), id, aria */
    button: function (label, cls, onTap, o) {
      o = o || {};
      var b = U.h('button', 'btn ' + (cls || 'kunyit'));
      b.type = 'button';
      b.innerHTML = '<span class="lbl">' + label + '</span>';
      if (o.x != null) { b.style.left = o.x + 'px'; b.style.top = o.y + 'px'; b.style.width = o.w + 'px'; b.style.height = o.h + 'px'; }
      if (o.aria) b.setAttribute('aria-label', o.aria);
      if (o.id) b.dataset.id = o.id;
      var sounded = false;
      b.addEventListener('pointerdown', function () {
        if (b.disabled) return;
        Aud.init(); Aud.sfx('click'); sounded = true;
      });
      b.addEventListener('click', function (e) {
        if (b.disabled) return;
        Aud.init();
        if (!sounded) Aud.sfx('click');   // keyboard / uji
        sounded = false;
        if (onTap) onTap(e, b);
      });
      return b;
    },
    panahDunia: false   // diisi Arena saat tokoh bisa digerakkan dengan panah
  };

  /* navigasi panah antar tombol aktif (di dalam overlay bila ada) */
  document.addEventListener('keydown', function (e) {
    var k = e.key;
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].indexOf(k) < 0) return;
    var ovs = document.querySelectorAll('.overlay');
    if (!ovs.length && Input.panahDunia) return;
    var scope = ovs.length ? ovs[ovs.length - 1] : document.getElementById('scene-root');
    var list = Array.prototype.filter.call(scope.querySelectorAll('button'), function (b) { return !b.disabled && b.offsetParent !== null; });
    if (!list.length) return;
    var cur = list.indexOf(document.activeElement);
    var dir = (k === 'ArrowLeft' || k === 'ArrowUp') ? -1 : 1;
    var next = cur < 0 ? (dir > 0 ? 0 : list.length - 1) : (cur + dir + list.length) % list.length;
    list[next].focus();
    e.preventDefault();
  });
  /* cincin fokus hanya untuk pengguna keyboard: fokus otomatis tidak boleh tampak seperti sorotan di mouse dan sentuh */
  document.addEventListener('keydown', function (e) { if (e.key === 'Tab' || e.key === 'Enter' || e.key.indexOf('Arrow') === 0) document.body.classList.add('kibor'); });
  document.addEventListener('pointerdown', function () { document.body.classList.remove('kibor'); Aud.init(); }, { passive: true });
  root.Input = Input;
})(window);
