/* Semua teks UI agar mudah ditinjau guru. Balon Rako maksimal 2 baris (sekitar 80 karakter), bahasa kelas 3-4. */
window.STR = {
  rotate: 'Putar perangkatmu agar mendatar.',
  muat: 'Memuat pulau',
  muatTahu: 'Tahukah kamu?',
  muatTips: [
    'Akar pohon memegang tanah, jadi lereng tidak mudah longsor.',
    'Hutan dan ikan bisa pulih bila dipakai secukupnya.',
    'Logam dan batu bara tidak bisa tumbuh lagi, jadi harus dihemat.',
    'Sampah yang dibuang ke laut bisa dikira makanan oleh penyu.',
    'Kincir angin membuat listrik tanpa membakar batu bara.'
  ],
  judulGim: 'Lompat Waktu: Penjaga Nusa Lestari',
  tanpaWebgl: {
    judul: 'Dunia 3D belum bisa dibuka di peramban ini',
    langkah: ['Di Chrome: ketik chrome://restart di kolom alamat, lalu tekan Enter.', 'Pastikan "Gunakan akselerasi grafis" menyala di Setelan, lalu Sistem.', 'Atau buka gim ini dengan Microsoft Edge.'],
    coba: 'Coba Lagi', alasan: 'Keterangan: {a}'
  },
  intro: { jam: 'Pulau ini sedang sakit. Ketuk Jam Pasir!', jamLabel: 'Balik Jam Pasir', akhir: 'Ini 20 tahun lagi kalau dibiarkan. Tetapi ini belum terjadi!', kembali: 'Kembali ke Hari Ini' },
  judul: { a: 'LOMPAT', b: 'WAKTU', motto: 'Lihat masa depan. Ubah hari ini.', mulai: 'MULAI', suaraAi: 'Suara tokoh dibuat dengan AI, bukan suara orang sungguhan.', info: 'Informasi', ref: 'Referensi', dev: 'Pengembang' },
  icons: { soundOn: 'Suara nyala', soundOff: 'Suara mati', full: 'Layar penuh', fullExit: 'Keluar layar penuh', fsDenied: 'Layar penuh tidak tersedia di sini.', settings: 'Pengaturan', pause: 'Jeda', replay: 'Dengar lagi', jurnal: 'Jurnal Penjaga', peta: 'Peta Pulau', daun: 'Daun yang terkumpul' },
  settings: {
    title: 'Pengaturan', on: 'Nyala', off: 'Mati', sound: 'Suara', voice: 'Suara tokoh', voiceNote: 'Bila mati, tulisan tetap tampil.', voiceNoteAi: 'Suara tokoh dibuat dengan AI. Bila mati, tulisan tetap tampil.',
    reduce: 'Kurangi animasi', santai: 'Mode Santai', santaiNote: 'Tanpa batas waktu.',
    kualitas: 'Tampilan 3D', kualitasNote: 'Pilih Hemat bila terasa lambat.', kualitasPilih: { auto: 'Otomatis', hemat: 'Hemat', sedang: 'Sedang', tinggi: 'Tinggi' },
    fresh: 'Murid baru', freshNote: 'Menghapus catatan permainan di perangkat ini.', freshBtn: 'Hapus', freshSure: 'Yakin?', close: 'Tutup'
  },
  jeda: { title: 'Jeda', lanjut: 'Lanjut', ulang: 'Ulangi Misi', peta: 'Peta Pulau', beranda: 'Beranda', atur: 'Pengaturan' },

  about: {
    info: {
      title: 'Informasi',
      tabs: { goal: 'Tujuan', how: 'Cara Main', bab: 'Misi', teacher: 'Untuk Guru' },
      intro: 'Di gim ini kamu menjadi Penjaga Muda dan memakai Jam Pasir ajaib untuk melihat pulau 20 tahun lagi.',
      goalHead: 'Setelah bermain, kamu bisa:',
      goals: [
        'Menyebutkan sumber daya alam dan manfaatnya.',
        'Membedakan sumber daya yang bisa pulih dan yang tidak.',
        'Menjelaskan akibat tindakan manusia terhadap alam.',
        'Mencari cara yang baik untuk alam dan warga.',
        'Menyimpulkan sesuatu dari bukti percobaan.'
      ],
      meta: 'Topik: Pelestarian Sumber Daya Alam. Bisa dimainkan tanpa internet.',
      steps: [
        'Ketuk tanah untuk berjalan. Ketuk tanda kuning untuk bertindak.',
        'Tebak dulu apa yang akan terjadi.',
        'Balik Jam Pasir dan lihat pulau 20 tahun lagi.',
        'Kembali ke hari ini, lalu ubah pilihanmu.',
        'Tulis kesimpulan dan buktinya di Jurnal Penjaga.'
      ],
      howNote: 'Keyboard: panah untuk berjalan, Tab untuk memilih, Enter untuk memakai.',
      bab: {
        0: 'Mengenal lima sumber daya, lalu menebak mana yang bisa pulih.',
        1: 'Warga butuh kayu. Bagaimana agar hutan tetap lebat?',
        2: 'Air dan tanah. Pipa bocor dan lereng tanpa terasering.',
        3: 'Ikan bisa pulih, tetapi juga bisa habis.',
        4: 'Logam dan batu bara tidak bisa pulih.',
        5: 'Rapat Besar: rencana untuk seluruh pulau.'
      },
      teacher: [
        ['Sasaran', 'Sumber daya alam, sebab-akibat, dan solusi, disertai keterampilan memprediksi, mengubah satu hal, mengamati, dan menyimpulkan.'],
        ['Durasi', 'Sekitar 5 menit per misi. Kemajuan tersimpan, jadi bisa dipecah menjadi beberapa pertemuan.'],
        ['Model', 'Angka berasal dari model sederhana, bukan ramalan alam sungguhan. Penjelasannya ada pada berkas pendamping.'],
        ['Hasil Belajarku', 'Tombol di layar hasil ini menunjukkan keterampilan, pemahaman yang masih keliru, dan tebakan awal murid. Tidak ada data pribadi.'],
        ['Perangkat bersama', 'Pakai Murid baru di Pengaturan untuk menghapus progres sebelum murid berikutnya.']
      ]
    },
    ref: {
      title: 'Referensi',
      tabs: { source: 'Sumber Materi', ai: 'Kecerdasan Artifisial' },
      sourceIntro: 'Sumber materi gim ini:',
      sources: [
        ['Badan Standar, Kurikulum, dan Asesmen Pendidikan (2025).', 'Keputusan Kepala BSKAP Nomor 046/H/KR/2025 tentang Capaian Pembelajaran.', 'Kementerian Pendidikan Dasar dan Menengah Republik Indonesia.'],
        ['Dr. Cucun Sutinah, M.Pd., dkk. (2025).', 'Panduan Mata Pelajaran Ilmu Pengetahuan Alam dan Sosial (IPAS) Fase B dan C.', 'Badan Standar, Kurikulum, dan Asesmen Pendidikan, Kementerian Pendidikan Dasar dan Menengah Republik Indonesia.']
      ],
      topic: 'Topik gim ini: Pelestarian Sumber Daya Alam.',
      aiIntro: 'Pengembang memakai kecerdasan artifisial (KA) sebagai alat bantu.',
      aiRows: [
        ['Kode dan konsep', 'Program, tanah dan air dari kode, dan draf teks dibuat bersama Claude (Anthropic).'],
        ['Gambar, 3D, video', 'Gambar dibuat dengan ChatGPT (OpenAI), model 3D dengan Meshy, video dengan Google Flow, lalu diolah oleh program.'],
        ['Musik', 'Musik latar dibuat dengan Suno, lalu dipotong dan diolah oleh program.'],
        ['Peninjauan', 'Pengembang mengarahkan, memilih, dan meninjau hasilnya.']
      ],
      aiSuara: ['Suara tokoh', 'Dibuat dengan AI (OpenAI Text-to-Speech), bukan suara orang sungguhan.'],
      aiRefHead: 'Rujukan',
      aiRef: ['Purwarianti, A., dkk. (2025).', 'Panduan Pemanfaatan Kecerdasan Artifisial untuk Guru PAUD, Pendidikan Dasar, dan Pendidikan Menengah.', 'Jakarta: Pusat Kurikulum dan Pembelajaran & Pusat Standar dan Kebijakan Pendidikan.']
    },
    dev: {
      title: 'Pengembang', photoAlt: 'Foto Jamaluddin',
      name: 'Jamaluddin', school: 'UPTD SMPN 2 Robatal', email: 'jamaluddin551@guru.smp.belajar.id', year: 'Tahun pembuatan: 2026',
      listHead: 'Prestasi dan Pengalaman',
      list: [
        'Narasumber Digitalisasi Pembelajaran Kemendikdasmen',
        'Guru Pejuang Digital',
        'Juara 1 Lomba Inovasi Guru SMP Kabupaten Sampang 2026',
        'Juara 1 Guru Inspiratif SMP Kabupaten Sampang 2026',
        'Komunitas Belajar Terbaik BLPT Kemendikdasmen 2024'
      ]
    }
  },

  bab: {
    0: { nama: 'Tanjung Awal', lencana: 'Penanam Bibit' }, 1: { nama: 'Hutan Meranti', lencana: 'Penjaga Hutan' }, 2: { nama: 'Lembah Sawah', lencana: 'Penjaga Sawah' }, 3: { nama: 'Teluk Karang', lencana: 'Penjaga Laut' }, 4: { nama: 'Bukit Batu', lencana: 'Penghemat Tambang' }, 5: { nama: 'Rapat Besar', lencana: 'Perencana Pulau' }
  },
  babLabel: 'Misi {n}: {nama}',

  tokoh: { rako: 'Rako', ratna: 'Bu Ratna', gani: 'Pak Gani', laras: 'Laras', bayu: 'Bayu', dewi: 'Dewi', sri: 'Bu Sri', bahar: 'Pak Bahar', mira: 'Kak Mira' },
  pilihHero: { judul: 'Siapa penjaga muda hari ini?', laras: 'Laras', bayu: 'Bayu', dewi: 'Dewi', hint: 'Pilih satu. Nanti bisa diganti di Peta Pulau.' },

  hud: {
    lanjut: 'Lanjut', aksi: 'Aksi', jam: 'Lompat 20 Tahun', jam100: 'Lompat 100 Tahun', kembali: 'Kembali ke Hari Ini', lewati: 'Lewati',
    tahun: 'Tahun ke-{t}', duapuluh: '20 tahun kemudian', hariIni: 'Hari ini', melompat: 'Melompat ke masa depan', tebakanmu: 'Tebakanmu', terjadi: 'Yang terjadi', apa: 'Apa yang terjadi?', tebakJudul: 'Tebak dulu',
    beda: 'Berbeda? Itu sebabnya kita mencoba.', cocok: 'Tebakanmu cocok!', sasarBatang: '(sasaran {n})',
    model: 'Angka ini perkiraan sederhana, bukan ramalan sungguhan.', naik: 'Naik', turun: 'Turun', tetap: 'Tetap',
    labelPohon: 'Pohon tua', labelTanah: 'Tanah kosong',
    terkunci: 'Ubah satu hal saja supaya tahu penyebabnya.', bebas: 'Sekarang boleh mengubah apa saja. Lalu balik Jam Pasir.',
    kembali1: 'Itu belum terjadi. Kamu bisa mengubahnya!', balik: 'Sekarang balik Jam Pasir!', keSimpul: 'Waktunya menulis di Jurnal Penjaga.', serupa: 'Sekarang jawab satu soal serupa.', simpulSelesai: 'Kesimpulanmu sudah tercatat. Hebat!',
    bandingkan: 'Bandingkan', lihatRencanamu: 'Lihat Rencanamu', rencanamu: 'Rencanamu', rencanaBoros: 'Rencana boros', seratusTahun: '100 tahun kemudian'
  },
  indikator: { hutan: 'Hutan', air: 'Air jernih', tanah: 'Tanah subur', ikan: 'Ikan', tambang: 'Cadangan', warga: 'Warga', sampah: 'Sampah' },

  kartu: {
    judul: 'Kartu Sumber Daya',
    hutan: { nama: 'Hutan', isi: 'Hutan memberi kayu, udara segar, dan rumah bagi satwa.' },
    air: { nama: 'Air', isi: 'Air dipakai untuk minum, mencuci, dan mengairi sawah.' },
    tanah: { nama: 'Tanah', isi: 'Tanah subur menumbuhkan padi, sayur, dan buah.' },
    ikan: { nama: 'Ikan', isi: 'Ikan dari laut menjadi makanan dan pekerjaan nelayan.' },
    tambang: { nama: 'Tambang', isi: 'Logam dan batu bara digali dari dalam bumi.' },
    batubara: { nama: 'Batu bara', isi: 'Batu bara terbentuk selama jutaan tahun. Bila dibakar, Bumi makin panas.' },
    angin: { nama: 'Angin', isi: 'Angin terus bertiup. Kincir angin mengubahnya menjadi listrik.' },
    matahari: { nama: 'Matahari', isi: 'Matahari bersinar setiap hari. Panel surya mengubah sinarnya menjadi listrik.' }
  },
  satwa: {
    judul: 'Kartu Satwa',
    rangkong: { nama: 'Rangkong', isi: 'Rangkong bersarang di lubang pohon besar dan membantu menyebarkan biji.' },
    kupu: { nama: 'Kupu-kupu', isi: 'Kupu-kupu membantu penyerbukan bunga di hutan.' },
    capung: { nama: 'Capung', isi: 'Anak capung hidup di air. Capung banyak terlihat bila airnya bersih.' },
    katak: { nama: 'Katak', isi: 'Katak memakan serangga di sawah, jadi membantu petani.' },
    kuntul: { nama: 'Kuntul', isi: 'Burung kuntul mencari ikan kecil dan serangga di sawah berair.' },
    penyu: { nama: 'Penyu', isi: 'Penyu bisa mengira plastik sebagai makanan. Laut bersih menjaganya.' },
    kakatua: { nama: 'Ikan kakatua', isi: 'Ikan kakatua memakan ganggang, jadi membantu karang tetap sehat.' },
    karang: { nama: 'Karang', isi: 'Karang menjadi rumah dan tempat mencari makan bagi banyak ikan.' },
    bunga: { nama: 'Bunga liar', isi: 'Bunga liar bisa tumbuh lagi di bekas tambang bila tanahnya dirawat.' },
    kunang: { nama: 'Kunang-kunang', isi: 'Kunang-kunang menyukai tempat yang bersih, lembap, dan tidak terlalu terang.' }
  },

  bab0: {
    hook1: 'Ketuk tanah yang bercahaya!',
    hook2: 'Bibit tertanam! Jam Pasir akan menunjukkan 20 tahun lagi.',
    hookJudul: 'Pohon besar!',
    hook3: 'Pohon besar! Warna kembali! Burung pun datang.',
    hook4: 'Tetapi ini belum terjadi. Ayo kita buat jadi nyata!',
    jalan: 'Ketuk tanah untuk berjalan. Temui Bu Ratna di tanda kuning.',
    ratna: ['Selamat datang, Penjaga Muda! Aku Bu Ratna, kepala desa.', 'Warga butuh kayu, air, ikan, dan logam. Tetapi semuanya makin sedikit.', 'Pakai Jam Pasir untuk melihat masa depan. Itu belum terjadi.'],
    tur: 'Ada lima sumber daya di sini. Ketuk semua tanda kuning.',
    turSisa: 'Bagus! Masih ada {n} lagi.',
    pilahTanya: 'Menurutmu, mana yang bisa pulih lagi? Ini tebakan, tidak dinilai.',
    pilahA: 'Bisa pulih', pilahB: 'Tidak bisa pulih',
    pilahBantu: 'Ketuk kartu, lalu ketuk kotaknya. Bisa juga diseret.',
    pilahSelesai: 'Tebakanmu kusimpan di Jurnal. Nanti kita buktikan bersama!',
    lencana: 'Kamu mendapat Lencana {nama}!',
    keBab1: 'Ayo ke Hutan Meranti!',
    label: { ratna: 'Bu Ratna' }
  },

  bab1: {
    misi: 'Sediakan kayu, tetapi hutan tetap lebat.',
    chipPohon: 'Pohon {n} dari {butuh}', chipBibit: 'Bibit {m}', chipSasaran: 'Sasaran: Hutan {h}, Warga {w}',
    masuk: 'Pohon di hutan ini makin sedikit. Ayo temui Pak Gani.',
    labelGani: 'Pak Gani',
    gani: ['Perahu warga rusak. Aku butuh kayu dari 3 pohon.', 'Bagaimana kalau kutebang saja semua, supaya kayunya banyak?'],
    aturan: 'Kita lihat dulu akibatnya. Anggap warga berbuat begini setiap tahun.',
    tebak1: 'Kalau semua pohon ditebang, bagaimana air sungai 20 tahun lagi?',
    pil1: { naik: 'Lebih jernih', turun: 'Lebih keruh', tetap: 'Tetap' },
    tebangSatu: 'Ketuk pohon yang dilingkari untuk menebang.',
    tebangSemua: 'Warga menebang semua pohon.',
    balik: 'Sekarang balik Jam Pasir!',
    kembali1: 'Itu belum terjadi. Kamu bisa mengubahnya!',
    bebas: 'Pohon tua boleh ditebang. Tanah kosong bisa ditanami.',
    siap: 'Kalau sudah siap, balik Jam Pasir.',
    tebak2: 'Menurutmu, bagaimana hutan 20 tahun lagi?',
    hasil: {
      semua: { judul: 'Hutan habis', apa: 'Semua pohon habis. Akar tidak lagi menahan tanah. Tanah longsor dan sungai menjadi keruh.', rantai: ['Pohon habis', 'Akar hilang', 'Tanah longsor', 'Sungai keruh'] },
      nol: { judul: 'Perahu tidak jadi', apa: 'Hutan makin lebat. Tetapi tanpa kayu, perahu warga tidak jadi. Warga kesulitan.', rantai: ['Tidak menebang', 'Kayu tidak ada', 'Perahu tidak jadi', 'Warga kesulitan'] },
      kurang: { judul: 'Kayu kurang', apa: 'Hutan tetap banyak. Tetapi kayunya belum cukup untuk perahu warga.', rantai: ['Menebang sedikit', 'Kayu kurang', 'Perahu belum jadi', 'Warga menunggu'] },
      menyusut: { judul: 'Hutan berkurang', apa: 'Warga dapat kayu. Tetapi pohon ditebang lebih cepat daripada tumbuhnya, jadi hutan berkurang.', rantai: ['Menebang terus', 'Bibit kurang', 'Hutan berkurang', 'Kayu makin sedikit'] },
      habis: { judul: 'Hutan hampir habis', apa: 'Terlalu banyak pohon ditebang. Bibit butuh waktu untuk tumbuh. Tanah longsor dan sungai makin keruh.', rantai: ['Banyak ditebang', 'Bibit masih kecil', 'Tanah longsor', 'Air makin keruh'] },
      berhasil: { judul: 'Hutan tetap lebat', apa: 'Warga punya perahu. Bibit tumbuh menggantikan pohon yang ditebang. Hutan dan sungai tetap baik.', rantai: ['Tebang secukupnya', 'Tanam bibit lagi', 'Hutan tetap lebat', 'Sungai jernih'] }
    },
    petunjuk: {
      nol: 'Hutannya lebat, tetapi warga tidak punya perahu. Coba cari yang seimbang.',
      kurang: 'Kayunya belum cukup. Pak Gani butuh {butuh} pohon.',
      menyusut: 'Hutannya berkurang. Bagaimana kalau ada yang menanam?',
      habis: 'Bibit butuh waktu. Menebang terlalu banyak tidak bisa diganti cepat.',
      sorot: 'Tebang {butuh} pohon tua saja. Tanam bibit di tanah yang menyala.',
      peragaan: 'Lihat caraku: tebang 3 pohon, lalu tanam 4 bibit.',
      peragaan2: 'Lihat caraku: tebang {n} pohon, lalu tanam {m} bibit.',
      serupa: 'Sekarang Pak Gani butuh 4 pohon. Berapa bibit yang perlu ditanam?'
    },
    sukses: 'Berhasil! Warga punya perahu, dan hutan tetap lebat.',
    terimaKasih: 'Terima kasih, Penjaga Muda! Perahu jadi, hutan pun tetap ada.',
    rangkong: 'Sepasang rangkong kembali! Mereka bersarang di lubang pohon besar.',
    keSimpul: 'Waktunya menulis di Jurnal Penjaga.',
    simpul: {
      judul: 'Jurnal Penjaga', awal: 'Aku menyimpulkan ...', karena: 'karena ...', catatan: 'Aku menyimpulkan {klaim} Buktinya, {bukti}',
      klaim: [
        { t: 'hutan bisa habis bila ditebang lebih cepat daripada tumbuhnya.', benar: true },
        { t: 'hutan tidak pernah habis karena pohon selalu tumbuh.', fb: 'Lihat Jurnalmu: saat semua ditebang, hutan tinggal {h1}.', mis: 'terbarukan-tak-habis' },
        { t: 'pohon sama sekali tidak boleh ditebang.', fb: 'Warga tetap butuh kayu. Kamu sudah melihat cara yang seimbang.', mis: 'berhenti-terbaik' }
      ],
      bukti: [
        { t: 'saat semua ditebang hutan tinggal {h1}, saat ditanam lagi hutan {h2}.', benar: true },
        { t: 'warna pulau berubah saat Jam Pasir dibalik.', fb: 'Itu hanya tampilan. Buktinya ada pada angka di Jurnalmu.' },
        { t: 'Pak Gani meminta 3 pohon.', fb: 'Itu kebutuhan warga, bukan hasil percobaan.' }
      ],
      selesai: 'Kesimpulanmu sudah tercatat. Hebat!'
    },
    kekuatan: ['Aku tahu hutan bisa habis bila ditebang terlalu cepat.', 'Aku bisa menebak dulu, lalu melihat buktinya.', 'Aku bisa mencari cara yang baik untuk hutan dan warga.']
  },

  bab2: {
    misi: 'Air dan tanah cukup, sungai bersih.',
    chipPipa: 'Pipa {n}/3', chipTeras: 'Terasering {n}/3', chipSampah: 'Sampah {n}/3', chipSasaran: 'Sasaran: Air {a}, Tanah {t}',
    masuk: 'Sawah ini makin kering. Ayo temui Bu Sri.',
    labelWarga: 'Bu Sri', labelPipa: 'Pipa bocor', labelTeras: 'Lereng', labelSampah: 'Sampah',
    warga: ['Sawah di atas kering, padahal hujan masih turun.', 'Pipa bambu bocor, lereng belum berundak, dan sungai penuh sampah.', 'Undakan di lereng disebut terasering. Tanah jadi tidak mudah hanyut.'],
    aturan: 'Kita lihat dulu akibatnya kalau semua dibiarkan.',
    hutanJernih: 'Sungai itu jernih karena hutan di hulu sudah kamu jaga!',
    tebak1: 'Hujan masih turun. Kalau dibiarkan, bagaimana air sawah 20 tahun lagi?',
    pil1: { naik: 'Lebih banyak', turun: 'Lebih sedikit', tetap: 'Tetap' },
    satuHal: 'Pilih satu hal saja: pipa, terasering, atau sampah. Lalu balik Jam Pasir.',
    tebakAir: 'Menurutmu, bagaimana air sawah 20 tahun lagi?',
    tebakTanah: 'Menurutmu, bagaimana tanah subur 20 tahun lagi?',
    tindakan: 'Pipa {p}, terasering {t}, sampah {s}',
    hasil: {
      awal: { judul: 'Sawah kering', apa: 'Hujan masih turun, tetapi air terbuang lewat pipa bocor. Sawah kering dan panen berkurang.', rantai: ['Pipa bocor', 'Air terbuang', 'Sawah kering', 'Panen berkurang'] },
      tanahKurang: { judul: 'Tanah hanyut', apa: 'Airnya cukup, tanahnya belum. Jadi pipa memengaruhi air. Apa yang bisa menahan tanah?', rantai: ['Lereng terbuka', 'Terbawa hujan', 'Tanah hanyut', 'Panen kurang'] },
      airKurang: { judul: 'Air masih kurang', apa: 'Tanah tertahan, tetapi air masih kurang. Jadi terasering memengaruhi tanah, bukan air.', rantai: ['Pipa masih bocor', 'Air terbuang', 'Sawah kering', 'Panen kurang'] },
      duaKurang: { judul: 'Keduanya kurang', apa: 'Air dan tanah sama-sama belum cukup. Pipa masih bocor, dan terasering belum cukup.', rantai: ['Pipa bocor', 'Tanah hanyut', 'Keduanya kurang', 'Panen kurang'] },
      sampahAda: { judul: 'Sungai masih kotor', apa: 'Air dan tanah sudah cukup, tetapi sampah masih ada di sungai. Sampah menyumbat saluran dan mengotori air.', rantai: ['Sampah dibiarkan', 'Saluran tersumbat', 'Air kotor', 'Sawah terganggu'] },
      berhasil: { judul: 'Sawah subur', apa: 'Air sampai ke sawah, terasering menahan tanah, dan sungai bersih dari sampah. Padi tumbuh subur.', rantai: ['Pipa utuh', 'Terasering menahan tanah', 'Sungai bersih', 'Panen cukup'] }
    },
    petunjuk: {
      tanahKurang: 'Airnya sudah cukup. Apa yang bisa menahan tanah di lereng?',
      airKurang: 'Tanahnya sudah aman. Ke mana air di pipa itu pergi?',
      duaKurang: 'Air dan tanah masih kurang. Coba ubah satu hal lagi.',
      sampahAda: 'Air dan tanah sudah cukup. Apa yang masih mengotori sungai?',
      sorot: 'Lihat lingkaran yang berkedip: tambal pipa, buat terasering, dan angkat sampah.',
      peragaan: 'Lihat caraku: tambal pipa, buat terasering, lalu angkat sampah.'
    },
    sukses: 'Berhasil! Air dan tanah cukup, dan sungainya bersih.',
    terimaKasih: 'Terima kasih, Penjaga Muda! Sawah kami hijau lagi.',
    satwaKalimat: 'Capung, katak, dan kuntul kembali ke sawah!',
    simpul: {
      judul: 'Jurnal Penjaga', awal: 'Aku menyimpulkan ...', karena: 'karena ...', catatan: 'Aku menyimpulkan {klaim} Buktinya, {bukti}', tagKlaim: 'laju-pulih',
      klaim: [
        { t: 'air bersih bisa berkurang walau hujan masih turun.', benar: true },
        { t: 'air tidak akan berkurang karena hujan selalu turun.', fb: 'Lihat Jurnalmu: saat pipa bocor, air tinggal {a1}.', mis: 'hujan-air' },
        { t: 'warga harus berhenti memakai air.', fb: 'Warga tetap butuh air. Kamu sudah melihat caranya.', mis: 'berhenti-terbaik' }
      ],
      bukti: [
        { t: 'saat pipa bocor air tinggal {a1}, saat pipa ditambal air {a2}.', benar: true },
        { t: 'warna sawah berubah saat Jam Pasir dibalik.', fb: 'Itu hanya tampilan. Buktinya ada pada angka di Jurnalmu.' },
        { t: 'Bu Sri berkata sawahnya kering.', fb: 'Itu cerita warga, bukan hasil percobaan.' }
      ]
    },
    kekuatan: ['Aku tahu air bisa berkurang walau hujan masih turun.', 'Aku bisa mengubah satu hal untuk mencari penyebabnya.', 'Aku bisa menjaga air dan tanah untuk sawah.']
  },

  bab3: {
    misi: 'Ikan tetap ada, warga tercukupi.',
    chipRapat: 'Jala rapat', chipLonggar: 'Jala longgar', chipLaut: 'Melaut {n}x', chipSampah: 'Sampah {n}/3', chipSasaran: 'Sasaran: Ikan {i}, Warga {w}',
    masuk: 'Ikan di laut ini makin sedikit. Ayo temui Pak Bahar.',
    labelWarga: 'Pak Bahar', labelJala: 'Jala', labelPelampung: 'Pelampung', labelSampah: 'Sampah', labelPerahu: 'Perahu',
    warga: ['Ikan makin kecil dan makin jarang.', 'Kami melaut sesering mungkin dengan jala rapat.', 'Tiap pelampung di laut berarti satu kali melaut dalam setahun.'],
    aturan: 'Ayo ikut melaut, lalu kita lihat akibatnya.',
    tebak1: 'Kalau nelayan terus memakai jala rapat, bagaimana ikan 20 tahun lagi?',
    pil1: { naik: 'Makin banyak', turun: 'Makin sedikit', tetap: 'Tetap' },
    naikPerahu: 'Ketuk perahu untuk ikut melaut.',
    tebarJala: 'Ketuk pelampung untuk menebar jala.',
    hasilJala: 'Lihat, banyak ikan kecil ikut tertangkap!',
    satuHal: 'Pilih satu hal saja: jala, pelampung, atau sampah. Lalu balik Jam Pasir.',
    tebak2: 'Menurutmu, bagaimana ikan 20 tahun lagi?',
    infoRapat: 'Jala rapat: ikan kecil ikut tertangkap.', infoLonggar: 'Jala longgar: ikan kecil bisa lolos.',
    tindakan: '{jala}, melaut {n} kali, sampah {c}',
    jalaRapat: 'Jala rapat', jalaLonggar: 'Jala longgar',
    hasil: {
      awal: { judul: 'Ikan habis', apa: 'Ikan kecil ikut tertangkap sebelum sempat bertelur. Ikan habis, padahal laut sangat luas.', rantai: ['Jala rapat', 'Anak ikan tertangkap', 'Tidak sempat bertelur', 'Ikan habis'] },
      runtuh: { judul: 'Ikan habis', apa: 'Ikan ditangkap lebih cepat daripada pulihnya, sampai habis. Laut luas pun bisa kosong.', rantai: ['Banyak ditangkap', 'Tidak sempat pulih', 'Makin sedikit', 'Ikan habis'] },
      berkurang: { judul: 'Ikan berkurang', apa: 'Ikan masih ditangkap lebih cepat daripada pulihnya, jadi jumlahnya berkurang.', rantai: ['Banyak ditangkap', 'Pulih lambat', 'Ikan berkurang', 'Tangkapan turun'] },
      berhenti: { judul: 'Warga kesulitan', apa: 'Ikan banyak. Tetapi tanpa melaut, warga kehilangan makanan dan pekerjaan.', rantai: ['Tidak melaut', 'Ikan banyak', 'Tidak ada tangkapan', 'Warga kesulitan'] },
      tercemar: { judul: 'Laut tercemar', apa: 'Cara melautnya sudah baik. Tetapi sampah masih ada di pantai dan masuk ke laut.', rantai: ['Sampah di pantai', 'Masuk ke laut', 'Laut tercemar', 'Ikan terganggu'] },
      wargaKurang: { judul: 'Tangkapan kurang', apa: 'Ikan cukup, tetapi tangkapannya terlalu sedikit. Warga masih kekurangan.', rantai: ['Jarang melaut', 'Tangkapan sedikit', 'Makanan kurang', 'Warga kesulitan'] },
      berhasil: { judul: 'Ikan tetap ada', apa: 'Ikan sempat tumbuh dan bertelur. Warga tetap dapat ikan, dan laut lebih bersih.', rantai: ['Melaut secukupnya', 'Ikan bertelur', 'Laut lebih bersih', 'Ikan tetap ada'] }
    },
    petunjuk: {
      runtuh: 'Ikannya habis. Coba kurangi pelampung agar lebih jarang melaut, atau ganti jala.',
      berkurang: 'Ikan masih berkurang. Apa yang memberi ikan waktu untuk pulih?',
      berhenti: 'Ikannya banyak, tetapi warga tidak dapat ikan. Coba melaut secukupnya.',
      tercemar: 'Ikannya cukup, tetapi laut masih kotor. Angkat semua sampah di pantai.',
      wargaKurang: 'Warga butuh lebih banyak tangkapan. Coba tambah satu pelampung.',
      sorot: 'Pakai jala longgar, sisakan 2 pelampung, dan angkat semua sampah.',
      peragaan: 'Lihat caraku: jala longgar, 2 pelampung, semua sampah diangkat.'
    },
    sukses: 'Berhasil! Ikan tetap ada, dan warga tetap tercukupi.',
    terimaKasih: 'Terima kasih, Penjaga Muda! Anak ikan kini sempat tumbuh besar.',
    satwaKalimat: 'Penyu dan ikan kakatua kembali. Karang pun cerah lagi!',
    simpul: {
      judul: 'Jurnal Penjaga', awal: 'Aku menyimpulkan ...', karena: 'karena ...', catatan: 'Aku menyimpulkan {klaim} Buktinya, {bukti}', tagKlaim: 'laju-pulih',
      klaim: [
        { t: 'ikan bisa habis bila ditangkap lebih cepat daripada pulihnya.', benar: true },
        { t: 'laut sangat luas, jadi ikannya tidak mungkin habis.', fb: 'Lihat Jurnalmu: saat melaut berlebihan, ikan tinggal {i1}.', mis: 'laut-luas' },
        { t: 'nelayan harus berhenti melaut.', fb: 'Warga tetap butuh ikan. Kamu sudah melihat caranya.', mis: 'berhenti-terbaik' }
      ],
      bukti: [
        { t: 'saat melaut berlebihan ikan tinggal {i1}, saat melaut secukupnya ikan {i2}.', benar: true },
        { t: 'warna laut berubah saat Jam Pasir dibalik.', fb: 'Itu hanya tampilan. Buktinya ada pada angka di Jurnalmu.' },
        { t: 'Pak Bahar berkata ikannya jarang.', fb: 'Itu cerita warga, bukan hasil percobaan.' }
      ]
    },
    kekuatan: ['Aku tahu ikan bisa habis walau bisa bertambah lagi.', 'Aku bisa mencari cara melaut yang baik untuk ikan dan warga.', 'Aku tahu sampah di laut merugikan satwa dan warga.']
  },

  bab4: {
    misi: 'Hemat cadangan, warga tercukupi.',
    chipUrat: 'Lubang {n}/4', chipMesin: 'Mesin {s}', chipKincir: 'Kincir {k}/2', chipSasaran: 'Sasaran: Cadangan {c}, Warga {w}', nyala: 'nyala', mati: 'mati',
    masuk: 'Bukit ini terus digali. Ayo temui Kak Mira.',
    labelWarga: 'Kak Mira', labelUrat: 'Lubang tambang', labelMesin: 'Mesin Daur Ulang', labelKincir: 'Kincir', labelLubang: 'Bekas galian',
    warga: ['Logam dipakai untuk cangkul, kabel, dan sepeda.', 'Batu bara untuk listrik. Empat lubang tambang kami gali tiap tahun.', 'Cadangan itu logam dan batu bara yang masih tersisa di dalam bukit.'],
    aturan: 'Ayo kita lihat akibatnya kalau terus begitu.',
    tebak1: 'Kalau semua lubang tambang digali terus, bagaimana cadangan 20 tahun lagi?',
    pil1: { naik: 'Bertambah', turun: 'Berkurang', tetap: 'Tetap' },
    uji1: 'Cadangan sudah habis. Apakah bisa tumbuh lagi seperti pohon?',
    ujiTebak: 'Kalau bibit ditanam di bekas galian ini, bagaimana cadangan 100 tahun lagi?',
    ujiTanam: 'Ketuk bekas galian untuk menanam bibit.',
    ujiJam: 'Balik Jam Pasir. Kali ini kita lompat 100 tahun!',
    uji2: 'Hutan bisa pulih, tambang tidak. Karena itu cadangan harus dihemat.',
    satuHal: 'Pilih satu hal saja: lubang tambang, mesin, atau kincir. Lalu balik Jam Pasir.',
    tebak2: 'Menurutmu, bagaimana cadangan 20 tahun lagi?',
    tindakan: 'Gali {u} lubang, mesin {d}, kincir {k}', tindakanUji: 'Tanam bibit di bekas galian, tunggu 100 tahun',
    hasil: {
      awal: { judul: 'Habis tahun ke-{th}', apa: 'Semua lubang tambang digali tiap tahun. Cadangan habis di tahun ke-{th}, lalu tidak ada logam lagi.', rantai: ['Semua digali', 'Cadangan turun', 'Cadangan habis', 'Logam tidak ada'] },
      seratus: { judul: 'Cadangan tetap 0', apa: 'Pohon tumbuh lagi, tetapi cadangan tetap 0. Hutan bisa pulih, tambang tidak.', rantai: ['Bibit ditanam', 'Hutan tumbuh', 'Logam tidak tumbuh', 'Cadangan tetap 0'] },
      habis: { judul: 'Cadangan habis', apa: 'Digali terlalu banyak. Cadangan habis, dan tidak kembali walau ditunggu lama.', rantai: ['Banyak digali', 'Cadangan turun', 'Cadangan habis', 'Tidak bisa kembali'] },
      menipis: { judul: 'Cadangan menipis', apa: 'Cadangan bertahan lebih lama, tetapi tetap menuju habis. Sisanya di bawah sasaran.', rantai: ['Banyak digali', 'Cadangan turun', 'Cadangan menipis', 'Menuju habis'] },
      berhenti: { judul: 'Warga kesulitan', apa: 'Cadangan utuh. Tetapi tanpa digali, warga kekurangan logam untuk alat dan kabel.', rantai: ['Tidak menggali', 'Cadangan utuh', 'Logam kurang', 'Warga kesulitan'] },
      wargaKurang: { judul: 'Hasil kurang', apa: 'Cadangan cukup, tetapi hasil galian kurang untuk warga. Bagaimana memenuhinya tanpa menggali lagi?', rantai: ['Gali sedikit', 'Cadangan cukup', 'Hasil kurang', 'Warga kesulitan'] },
      berhasil: { judul: 'Cadangan terjaga', apa: 'Galian sedikit, kebutuhan warga tetap terpenuhi. Cadangan lebih lama, walau tetap berkurang.', rantai: ['Gali sedikit', 'Ada cara lain', 'Cadangan bertahan', 'Warga tercukupi'] }
    },
    petunjuk: {
      habis: 'Cadangan habis. Tutup beberapa lubang tambang supaya galiannya berkurang.',
      menipis: 'Cadangan masih turun cepat. Coba sisakan 1 lubang tambang saja.',
      berhenti: 'Cadangan utuh, tetapi warga butuh logam. Coba gali sedikit saja.',
      wargaKurang: 'Warga butuh lebih banyak. Bagaimana dengan mesin atau kincir?',
      sorot: 'Sisakan 1 lubang tambang, lalu nyalakan Mesin Daur Ulang.',
      peragaan: 'Lihat caraku: sisakan 1 lubang tambang, lalu nyalakan mesin.'
    },
    sukses: 'Berhasil! Cadangan terjaga, dan warga tetap punya logam.',
    terimaKasih: 'Terima kasih, Penjaga Muda! Bukit kami bisa bertahan lebih lama.',
    jujur: 'Ingat: daur ulang membuat cadangan lebih lama, bukan selamanya.',
    satwaKalimat: 'Lihat, rumput dan bunga tumbuh di bekas galian!',
    kartuKalimat: 'Ini tiga kartu baru untukmu: batu bara, angin, dan matahari.',
    pilah:'Sekarang pilah lagi kartunya, pakai bukti percobaanmu.',
    pilahTanya: 'Mana yang bisa pulih lagi? Pakai bukti dari percobaanmu.',
    pilahBeda: 'Tebakanmu berubah pada {n} kartu. Itu tanda kamu belajar!',
    pilahSama: 'Tebakanmu sama seperti awal, dan kini ada buktinya!',
    pilahIngat: 'Ingat: setelah 100 tahun, hutan tumbuh, tetapi cadangan tetap 0.',
    simpul: {
      judul: 'Jurnal Penjaga', awal: 'Aku menyimpulkan ...', karena: 'karena ...', catatan: 'Aku menyimpulkan {klaim} Buktinya, {bukti}', tagKlaim: 'terbarukan',
      klaim: [
        { t: 'tambang tidak bisa pulih, jadi harus dihemat.', benar: true },
        { t: 'tambang bisa tumbuh lagi seperti pohon.', fb: 'Kita sudah menunggu 100 tahun. Cadangannya tetap {c1}.', mis: 'tambang-tumbuh' },
        { t: 'daur ulang tidak ada gunanya.', fb: 'Tanpa daur ulang, cadangan lebih cepat habis.', mis: 'daur-tak-penting' }
      ],
      bukti: [
        { t: 'setelah 100 tahun cadangan tetap {c1}, saat dihemat cadangan {c2}.', benar: true },
        { t: 'bukit terlihat sangat besar.', fb: 'Itu pendapat dari melihat. Buktinya ada pada angka di Jurnalmu.' },
        { t: 'Kak Mira bekerja di tambang.', fb: 'Itu pekerjaan warga, bukan hasil percobaan.' }
      ]
    },
    kekuatan: ['Aku tahu tambang tidak bisa pulih walau ditunggu 100 tahun.', 'Aku tahu daur ulang membuat cadangan lebih lama.', 'Aku bisa membedakan yang bisa pulih dan yang tidak.']
  },

  bab5: {
    misi: 'Rencana untuk seluruh pulau.',
    chipSasaran: 'Sasaran: Hutan {h}, Ikan {i}', chipSasaran2: 'Warga {w}, Cadangan ada',
    masuk: 'Semua warga sudah berkumpul. Ayo temui Bu Ratna.',
    labelWarga: 'Bu Ratna', labelPapan: 'Papan Rencana',
    warga: ['Inilah Rapat Besar. Pulau kita butuh satu rencana.', 'Pilih rencana untuk hutan, laut, dan tambang.'],
    bukaPapan: 'Ketuk Papan Rencana untuk memilih.',
    balik: 'Rencana siap. Balik Jam Pasir untuk melihat seluruh pulau!',
    judulPanel: 'Papan Rencana', panelTanya: 'Pilih satu rencana di tiap baris.', panelTombol: 'Pakai Rencana Ini',
    baris: { hutan: 'Hutan', laut: 'Laut', tambang: 'Tambang' },
    jenis: { boros: 'Boros', seimbang: 'Seimbang', ketat: 'Ketat' },
    rincian: {
      hutan: { boros: 'Tebang banyak, tidak menanam', seimbang: 'Tebang secukupnya dan menanam', ketat: 'Tidak menebang sama sekali' },
      laut: { boros: 'Jala rapat, sering melaut', seimbang: 'Jala longgar, secukupnya', ketat: 'Tidak melaut sama sekali' },
      tambang: { boros: 'Gali terus, tanpa daur ulang', seimbang: 'Gali sedikit dan daur ulang', ketat: 'Tidak menggali sama sekali' }
    },
    tebak: 'Dengan rencanamu, bagaimana warga 20 tahun lagi?',
    tindakan: '{h}, {l}, {t}', judulTindakan: 'Hutan, laut, tambang', judulBoros: 'Alam habis', apaBoros: 'Semua dipakai sebanyak-banyaknya. Alam habis, lalu warga ikut kesulitan.',
    hasil: {
      hutan: { judul: 'Hutan habis', apa: 'Pohon ditebang lebih cepat daripada tumbuhnya. Hutan habis, dan warga ikut merasakan akibatnya.', rantai: ['Tebang banyak', 'Tanpa menanam', 'Hutan habis', 'Warga kesulitan'] },
      ikan: { judul: 'Ikan habis', apa: 'Ikan ditangkap lebih cepat daripada pulihnya. Ikan habis, dan warga kehilangan makanan.', rantai: ['Jala rapat', 'Sering melaut', 'Ikan habis', 'Makanan berkurang'] },
      tambang: { judul: 'Cadangan habis', apa: 'Tambang digali terus tanpa daur ulang. Cadangan habis dan tidak bisa kembali.', rantai: ['Gali terus', 'Tanpa daur ulang', 'Cadangan habis', 'Tidak bisa kembali'] },
      warga: { judul: 'Warga kesulitan', apa: 'Alamnya terjaga, tetapi terlalu banyak yang dilarang. Warga kekurangan kayu, ikan, atau logam.', rantai: ['Terlalu ketat', 'Alam terjaga', 'Kebutuhan kurang', 'Warga kesulitan'] },
      berhasil: { judul: 'Pulau lestari', apa: 'Alam dipakai secukupnya dan dirawat. Alam tetap ada, warga pun tercukupi.', rantai: ['Pakai secukupnya', 'Rawat alamnya', 'Alam tetap ada', 'Warga tercukupi'] }
    },
    petunjuk: {
      hutan: 'Hutannya habis. Coba ganti rencana hutan.',
      ikan: 'Ikannya habis. Coba ganti rencana laut.',
      tambang: 'Cadangannya habis. Coba ganti rencana tambang.',
      warga: 'Alamnya terjaga, tetapi warga kesulitan. Coba kurangi yang Ketat.',
      sorot: 'Baris yang menyala belum cukup. Coba pilih Seimbang di sana.',
      peragaan: 'Lihat caraku: pilih Seimbang di semua baris.'
    },
    sukses: 'Berhasil! Alam tetap ada, dan warga tercukupi.',
    terimaKasih: 'Terima kasih, Penjaga Muda! Rencanamu kami pakai bersama.',
    satwaKalimat: 'Lihat, kunang-kunang menyala di sekitar beringin!',
    adeganKalimat: 'Ini dua masa depan pulau kita. Pilihan kita yang menentukan.',
    adegan: { judul: 'Dua Masa Depan', boros: 'Bila boros', borosIsi: 'Hutan gundul, sungai keruh, sawah kering.', bijak: 'Bila bijak', bijakIsi: 'Hutan lebat, air jernih, warga tercukupi.', catatan: 'Ini gambaran, bukan ramalan.', tutup: 'Lanjut' },
    simpul: {
      judul: 'Jurnal Penjaga', awal: 'Aku menyimpulkan ...', karena: 'karena ...', catatan: 'Aku menyimpulkan {klaim} Buktinya, {bukti}', tagKlaim: 'seimbang',
      klaim: [
        { t: 'memakai secukupnya baik untuk alam dan warga.', benar: true },
        { t: 'alam harus dihabiskan agar warga tercukupi.', fb: 'Lihat rencana boros: warga {w1}, hutan {h1}.' },
        { t: 'alam sama sekali tidak boleh dipakai.', fb: 'Warga tetap butuh kayu, ikan, dan logam.', mis: 'berhenti-terbaik' }
      ],
      bukti: [
        { t: 'rencanaku: warga {w2}, hutan {h2}. Rencana boros: warga {w1}, hutan {h1}.', benar: true },
        { t: 'pulau terlihat hijau dari atas.', fb: 'Itu hanya tampilan. Buktinya ada pada angka di Jurnalmu.' },
        { t: 'Bu Ratna setuju dengan rencanaku.', fb: 'Itu pendapat warga, bukan hasil percobaan.' }
      ]
    },
    kekuatan: ['Aku bisa membuat rencana untuk alam dan warga.', 'Aku tahu mengapa memakai secukupnya lebih baik daripada boros atau berhenti.', 'Aku bisa menyimpulkan sesuatu dengan bukti.']
  },

  sertifikat: {
    judul: 'Sertifikat', nama: 'Penjaga Masa Depan', kepada: 'Diberikan kepada Penjaga Muda', isi: 'yang sudah menjaga hutan, air, laut, dan tambang di Nusa Lestari.',
    bintang: 'Bintang {n} dari 15', daun: 'Daun {n}', tombol: 'Sertifikat', tutup: 'Tutup'
  },

  papan: {
    judul: 'Papan Tantangan', hitung: 'Soal {i} dari {n}', serupa: 'Soal serupa', benar: 'Betul!', lanjut: 'Lanjut', kilat: 'Bintang Kilat!', jawaban: 'Jawabannya:',
    dorong: 'Hampir. Coba baca lagi pelan-pelan.', masuk: 'Ayo uji yang sudah kamu pelajari.', santai: 'Mode Santai: tanpa batas waktu.'
  },

  jurnal: {
    judul: 'Jurnal Penjaga', tabs: { coba: 'Percobaan', grafik: 'Grafik', kartu: 'Kartu', catatan: 'Catatan', masa: 'Masa Depan' }, kosong: 'Belum ada percobaan. Balik Jam Pasir untuk memulai.',
    kolomKe: 'Ke-', kolomTindakan: 'Tindakan', kolomTebakan: 'Tebakan', kolomFoto: 'Foto', tindakan: '{n} pohon, {m} bibit', semua: 'Semua pohon',
    grafikJudul: 'Percobaan terakhirmu, dari tahun ke-0 sampai ke-{n}', sumbuTahun: 'Tahun', tebakanAwal: 'Tebakan awal', tebakanAkhir: 'Tebakan akhir', belumKartu: 'Belum ditemukan', kartuJudul: 'Kartu yang sudah kamu temukan', pulihPendek: 'Pulih', tidakPendek: 'Tidak pulih',
    pulih: 'Bisa pulih', tidak: 'Tidak bisa pulih', kesimpulan: 'Kesimpulanmu', babPendek: 'Misi {n}:', belumCatatan: 'Belum ada catatan. Selesaikan satu misi dulu.'
  },

  peta: { judul: 'Peta Pulau', jejak: 'Misi selesai {n} dari 6', terkunci: 'Selesaikan Misi {n} dulu.', segera: 'Misi ini segera hadir.', ganti: 'Ganti penjaga', jurnal: 'Jurnal', beranda: 'Beranda' },

  hasil: {
    judul: 'Misi {n} Selesai', kekuatan: 'Kemampuanmu', lanjut: 'Lanjut', peta: 'Peta Pulau', ulang: 'Main Lagi', beranda: 'Beranda', guruBtn: 'Hasil Belajarku', lencana: 'Lencana', tutup: 'Tutup', daun: 'Daun',
    subBintang: { 1: 'Selesai dengan bantuan Rako. Coba lagi sendiri?', 2: 'Sasaran tercapai! Bagus sekali.', 3: 'Luar biasa! Sasaran dan kesimpulanmu tepat.' },
    kilat: 'Bonus Bintang Kilat!'
  },

  guru: {
    judul: 'Hasil Belajarku', tabs: { sesi: 'Misi ini', trampil: 'Kemampuanku', mis: 'Perlu Diingat' },
    status: { lancar: 'Lancar', cukup: 'Cukup', latihan: 'Perlu latihan', belum: 'Belum dicoba' },
    percobaan: 'Berapa kali Lompat Waktu', peragaan: 'Dibantu contoh dari Rako', ya: 'Ya', tidak: 'Tidak', kesimpulan: 'Kesimpulan langsung benar',
    papan: 'Soal Papan Tantangan langsung benar', dari: '{a} dari {b}', tebakan: 'Tebakan awalku (Misi 1)', tebakanAkhir: 'Tebakan akhirku (Misi 5)', tebakanBeda: 'Kotak hijau: tebakanku berubah.', tebakanBelum: 'Belum ada.',
    misKosong: 'Belum ada yang perlu diingat. Hebat!', masih: 'perlu dibahas lagi', teratasi: 'sudah paham',
    catatan: 'Tunjukkan kepada gurumu. Tidak ada data pribadi.',
    tag: {
      'kenal-sda': 'Mengenal sumber daya alam', terbarukan: 'Membedakan yang bisa pulih', 'laju-pulih': 'Tahu yang bisa pulih pun bisa habis', 'sebab-akibat': 'Menjelaskan sebab dan akibat',
      solusi: 'Mencari jalan keluar', seimbang: 'Memakai secukupnya', 'kp-prediksi': 'Menebak akibat', 'kp-variabel': 'Mengubah satu hal', 'kp-data': 'Membaca angka dan grafik', 'kp-simpul': 'Menyimpulkan dengan bukti'
    },
    misNama: {
      'terbarukan-tak-habis': 'Mengira yang bisa pulih tidak bisa habis',
      'berhenti-terbaik': 'Mengira berhenti memakai sama sekali adalah yang terbaik',
      'tanam-cepat': 'Mengira menanam pohon langsung membereskan semuanya',
      'pengguna-jahat': 'Menyalahkan orangnya, bukan caranya',
      'hujan-air': 'Mengira air tidak akan berkurang karena hujan terus turun',
      'laut-luas': 'Mengira laut terlalu luas untuk kehabisan ikan',
      'tambang-tumbuh': 'Mengira tambang bisa tumbuh lagi',
      'daur-tak-penting': 'Mengira daur ulang tidak penting'
    }
  },
  segera: 'Misi berikutnya segera hadir.',
  webglHilang: 'Tampilan 3D sedang dipulihkan...'
};
