/* Panel pop up di layar judul: Informasi (bertab), Referensi (bertab), Pengembang. Teks di STR.about; tanpa tautan keluar. Dari gim 577. */
(function (root) {
  var A = STR.about;
  function bullets(items) { return '<ul class="ab-list">' + items.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul>'; }
  function rows(items) { return '<div class="ab-rows">' + items.map(function (r) { return '<div class="ab-row"><b>' + r[0] + '</b><span>' + r[1] + '</span></div>'; }).join('') + '</div>'; }
  function cite(c) { return '<p class="ab-cite">' + c[0] + ' <i>' + c[1] + '</i> ' + c[2] + '</p>'; }
  function goalHTML() { return '<p class="ab-lead">' + A.info.intro + '</p><p class="ab-tujuan">' + A.info.tujuan + '</p><h3>' + A.info.goalHead + '</h3>' + bullets(A.info.goals) + '<p class="ab-note">' + A.info.meta + '</p>'; }
  function howHTML() { return '<ol class="ab-steps">' + A.info.steps.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ol><p class="ab-note">' + A.info.howNote + '</p>'; }
  function babHTML() { return rows([0, 1, 2, 3, 4, 5].map(function (n) { return [U.fmt(STR.babLabel, { n: n + 1, nama: STR.bab[n].nama }), A.info.bab[n]]; })); }
  function sourceHTML() { return '<p class="ab-lead">' + A.ref.sourceIntro + '</p>' + A.ref.sources.map(cite).join('') + '<p class="ab-note">' + A.ref.topic + '</p>'; }
  function aiHTML() { return '<p class="ab-lead">' + A.ref.aiIntro + '</p>' + rows(A.ref.aiRows.concat(root.REKAMAN && REKAMAN.ai ? [A.ref.aiSuara] : [])) + '<h3>' + A.ref.aiRefHead + '</h3>' + cite(A.ref.aiRef); }

  /* kerangka panel: isi + tombol Tutup; pages (opsional) menjadi tab */
  function open(title, pages, html) {
    var o = UI.overlay(title, 'aboutpanel');
    o.panel.dataset.about = title;
    if (pages) UI.tabs(o.body, pages, 'ab-body');
    else o.body.appendChild(U.h('div', 'ab-body', html));
    var close = Input.button(STR.settings.close, 'zamrud tombol-tutup', function () { o.close(); }, { id: 'close' });
    o.body.appendChild(close);
    setTimeout(function () { close.focus({ preventScroll: true }); }, 30);
    return o;
  }

  root.About = {
    info: function () {
      var t = A.info.tabs;
      return open(A.info.title, [
        { id: 'goal', label: t.goal, html: goalHTML }, { id: 'how', label: t.how, html: howHTML },
        { id: 'bab', label: t.bab, html: babHTML }, { id: 'teacher', label: t.teacher, html: function () { return rows(A.info.teacher); } }
      ]);
    },
    ref: function () { return open(A.ref.title, [{ id: 'source', label: A.ref.tabs.source, html: sourceHTML }, { id: 'ai', label: A.ref.tabs.ai, html: aiHTML }]); },
    /* Pengembang: satu kartu per orang, pindah dengan tombol panah kiri/kanan (berputar) */
    dev: function () {
      var d = A.dev, n = d.people.length, i = 0;
      var o = open(d.title, null, '<div class="ab-carousel"><div class="ab-dev"></div><div class="ab-nav"><span class="ab-count" aria-live="polite"></span></div></div>');
      var car = o.body.querySelector('.ab-carousel'), kartu = car.querySelector('.ab-dev'), nav = car.querySelector('.ab-nav'), hitung = nav.querySelector('.ab-count');
      function show() {
        var p = d.people[i];
        kartu.innerHTML = '<img class="ab-photo" src="assets/img/' + p.photo + '" alt="' + p.photoAlt + '" draggable="false">' +
          '<div><div class="ab-name">' + p.name + '</div><div class="ab-school">' + p.school + '</div>' +
          (p.email ? '<div class="ab-contact">' + p.email + '</div>' : '') + '<div class="ab-contact">' + d.year + '</div>' +
          (p.list ? '<h3>' + p.listHead + '</h3>' + bullets(p.list) : '') + '</div>';
        kartu.classList.remove('ganti'); void kartu.offsetWidth; kartu.classList.add('ganti');
        hitung.textContent = U.fmt(d.count, { n: i + 1, total: n });
      }
      function geser(arah) { i = (i + arah + n) % n; show(); }
      if (n > 1) {
        nav.insertBefore(Input.button(UI.icon('panah', 40), 'kunyit ab-panah kiri', function () { geser(-1); }, { aria: d.prev, id: 'devPrev' }), hitung);
        nav.appendChild(Input.button(UI.icon('panah', 40), 'kunyit ab-panah kanan', function () { geser(1); }, { aria: d.next, id: 'devNext' }));
      } else nav.style.display = 'none';
      show();
      return o;
    }
  };
})(window);
