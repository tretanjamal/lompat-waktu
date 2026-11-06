/* Palet dan bahan bersama. Bahan Pulih mencampur warna asli ke warna pudar berdasarkan jarak dari lingkaran-lingkaran
   (maks. 8), jadi dunia sakit dan dunia pulih memakai model yang sama. uKering membawa dunia ke warna kering (masa depan boros). */
(function (root) {
  var PAL = { tinta: 0x16352C, zamrud: 0x1F8A5B, pucuk: 0x8FCF4E, toska: 0x1592A8, langit: 0xBFE9EE, kunyit: 0xF5A623, bata: 0xB9653A, kertas: 0xFFF4D9 };
  function W(hex) { return new THREE.Color(hex); }
  function campur(a, b, t) { return a.clone().lerp(b, t); }
  function gelap(c, f) { return c.clone().multiplyScalar(f); }

  var MAKS = 8;
  var U = { uLingkar: { value: [] }, uLunak: { value: 2.4 }, uKering: { value: 0 }, uWaktu: { value: 0 }, uKeruh: { value: 0 } };
  for (var i = 0; i < MAKS; i++) U.uLingkar.value.push(new THREE.Vector3(0, 0, -1));

  var VS_ATAS = 'uniform vec3 uLingkar[8]; uniform float uLunak; varying float vPulih;\n';
  var VS_HITUNG = [
    '#ifdef USE_INSTANCING',
    ' vec4 wpP = modelMatrix * instanceMatrix * vec4(transformed, 1.0);',
    '#else',
    ' vec4 wpP = modelMatrix * vec4(transformed, 1.0);',
    '#endif',
    ' float mP = 0.0;',
    ' for (int iP = 0; iP < 8; iP++) {',
    '   if (uLingkar[iP].z > 0.0) { float dP = distance(wpP.xz, uLingkar[iP].xy); mP = max(mP, 1.0 - smoothstep(uLingkar[iP].z - uLunak, uLingkar[iP].z, dP)); }',
    ' }',
    ' vPulih = mP;'
  ].join('\n');
  var FS_ATAS = 'uniform float uKering; varying float vPulih;\n';
  var FS_WARNA = [
    '#include <color_fragment>',
    ' vec3 dasarP = diffuseColor.rgb;',
    ' float lumP = dot(dasarP, vec3(0.30, 0.59, 0.11));',
    ' vec3 pudarP = mix(vec3(lumP), vec3(0.60, 0.47, 0.32) * (0.40 + lumP * 0.95), 0.72);',
    ' vec3 keringP = mix(vec3(lumP), vec3(0.47, 0.30, 0.15) * (0.62 + lumP * 1.15), 0.8);',
    ' vec3 sakitP = mix(pudarP, keringP, uKering);',
    ' float tepiP = vPulih * (1.0 - vPulih) * 4.0;',
    ' diffuseColor.rgb = mix(sakitP, dasarP, vPulih) + tepiP * vec3(0.20, 0.17, 0.03);'
  ].join('\n');

  function tempel(m, jenis, ombak) {
    var uOmbak = { value: ombak || 0 };
    m.onBeforeCompile = function (s) {
      s.uniforms.uLingkar = U.uLingkar; s.uniforms.uLunak = U.uLunak; s.uniforms.uKering = U.uKering;
      var awalV = VS_ATAS, hitung = VS_HITUNG, awalF = FS_ATAS, warna = FS_WARNA;
      if (jenis !== 'pulih') {
        s.uniforms.uWaktu = U.uWaktu; s.uniforms.uOmbak = uOmbak;
        awalV = 'uniform float uWaktu; uniform float uOmbak;\n' + awalV;
        hitung = ' transformed.y += (sin(position.x * 0.55 + uWaktu * 1.15) + cos(position.z * 0.5 + uWaktu * 0.95)) * uOmbak;\n' + hitung;
      }
      if (jenis === 'air') {
        /* sungai di dunia pudar tetap terbaca sebagai air; baru menjadi cokelat saat keruh atau kering */
        s.uniforms.uKeruh = U.uKeruh;
        awalF = 'uniform float uKeruh;\n' + awalF;
        warna = '#include <color_fragment>\n diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.20, 0.10, 0.035), uKeruh);\n' + warna.replace('#include <color_fragment>', '')
          .replace('vec3 sakitP = mix(pudarP, keringP, uKering);', 'vec3 sakitP = mix(mix(pudarP, keringP, uKering), dasarP, 0.5 * (1.0 - uKering));');
      }
      if (jenis === 'laut') warna = '#include <color_fragment>';   // laut lepas selalu berwarna: pulau di peta tetap terbaca sebagai pulau
      s.vertexShader = awalV + s.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n' + hitung);
      s.fragmentShader = awalF + s.fragmentShader.replace('#include <color_fragment>', warna);
    };
    m.customProgramCacheKey = function () { return 'jejak-' + jenis; };
    return m;
  }

  var Bahan = {
    /* Bentuk dari kode tetap berfaset karena Rakit memberi normal per segitiga, model AI halus karena membawa normalnya sendiri. */
    /* bahan dunia: ikut gelombang warna */
    pulih: function (opsi) { return tempel(new THREE.MeshLambertMaterial(Object.assign({ vertexColors: true }, opsi || {})), 'pulih'); },
    /* air: gelombang warna + ombak di vertex + bisa keruh */
    air: function (ombak, opsi) { return tempel(new THREE.MeshLambertMaterial(Object.assign({ vertexColors: true, flatShading: true }, opsi || {})), 'air', ombak); },
    /* laut lepas: berombak, tidak ikut pudar */
    laut: function (ombak, opsi) { return tempel(new THREE.MeshLambertMaterial(Object.assign({ vertexColors: true, flatShading: true }, opsi || {})), 'laut', ombak); },
    /* tokoh dan pemandu: tidak ikut pudar, selalu menonjol di dunia yang sakit */
    tetap: function (opsi) { return new THREE.MeshLambertMaterial(Object.assign({ vertexColors: true }, opsi || {})); }
  };

  var Warna = {
    PAL: PAL, W: W, campur: campur, gelap: gelap, U: U, MAKS: MAKS,
    atur: function (i, x, z, r) { U.uLingkar.value[i].set(x, z, r); },
    kosongkan: function () { U.uLingkar.value.forEach(function (v) { v.z = -1; }); U.uKering.value = 0; U.uKeruh.value = 0; },
    penuh: function () { Warna.kosongkan(); Warna.atur(0, 0, 0, 10000); },
    /* warna Peta Pulau: zona bab yang selesai berwarna, dan bila semua selesai seluruh pulau berwarna */
    petaPulau: function (zona, selesai) {
      Warna.kosongkan();
      var kunci = Object.keys(zona), i = 0;
      if (kunci.every(function (n) { return selesai(+n); })) { Warna.atur(0, 0, 0, 10000); return 0; }
      kunci.forEach(function (n) { if (selesai(+n) && i < MAKS) { var z = zona[n]; Warna.atur(i++, z.x, z.z, 9.5); } });
      return i;
    },
    /* lingkaran warna tumbuh dari titik itu */
    tumbuh: function (i, x, z, r0, r1, dur, ease) {
      Warna.atur(i, x, z, Math.max(r0, 0.01));
      return Tween.run(dur, function (e) { U.uLingkar.value[i].z = Math.max(0.01, r0 + (r1 - r0) * e); }, ease || Ease.easeOutCubic);
    }
  };
  root.Warna = Warna; root.Bahan = Bahan;
})(window);
