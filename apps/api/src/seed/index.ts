import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { slugify } from "../lib/slug.js";

async function main() {
  console.log("▸ Seeding weddQ database…");

  // ---------- TEMPLATES ----------
  const templates = [
    {
      slug: "sekar-kencana",
      name: "Sekar Kencana",
      style: "Klasik · Jawa",
      category: "klasik",
      priceIdr: 299000,
      badge: "Bestseller",
      isFeatured: true,
      palette: "cream",
      description: "Sentuhan klasik Jawa dengan ornamen kawung dan tipografi serif yang anggun.",
      features: ["120+ blok konten", "RSVP otomatis", "Galeri 20 foto", "Hitung mundur", "QR Check-in"],
    },
    {
      slug: "kasmaran",
      name: "Kasmaran",
      style: "Klasik · Maroon",
      category: "klasik",
      priceIdr: 349000,
      badge: "Baru",
      palette: "maroon",
      description: "Maroon mendalam berpadu emas, menghadirkan kesan elegan untuk resepsi malam yang megah.",
      features: ["Mode malam", "Animasi sinematik", "Galeri foto + video", "Buku tamu", "Amplop digital"],
    },
    {
      slug: "larasati",
      name: "Larasati",
      style: "Modern · Minimalis",
      category: "modern",
      priceIdr: 249000,
      palette: "paper",
      description: "Tata letak bersih dengan banyak ruang putih, cocok untuk pasangan yang mengusung tema modern.",
      features: ["Layout minimalis", "Tipografi serif kontemporer", "RSVP cepat", "Galeri storytelling"],
    },
    {
      slug: "kalpataru",
      name: "Kalpataru",
      style: "Islami · Klasik",
      category: "islami",
      priceIdr: 299000,
      palette: "emerald",
      description: "Kalimat thayyibah dengan ornamen geometris yang santun, sejuk, dan penuh doa.",
      features: ["Bismillah & ayat pembuka", "Hijriah & Masehi", "Mahram pribadi", "Amplop digital"],
    },
    {
      slug: "prada-emas",
      name: "Prada Emas",
      style: "Mewah · Dark Mode",
      category: "mewah",
      priceIdr: 399000,
      isFeatured: true,
      palette: "sepia",
      description: "Latar gelap dengan aksen emas pekat, menghadirkan kemewahan modern yang tetap berakar pada tradisi.",
      features: ["Dark mode", "Hero video", "Parallax scroll", "Multi-bahasa", "Live streaming"],
    },
    {
      slug: "mekar-wangi",
      name: "Mekar Wangi",
      style: "Floral · Pastel",
      category: "floral",
      priceIdr: 279000,
      palette: "blush",
      description: "Pucuk bunga pastel dan watercolor lembut, menghadirkan wangi musim semi pada setiap scroll.",
      features: ["Ilustrasi floral", "Palet pastel", "Animasi mekar", "RSVP & buku tamu"],
    },
    {
      slug: "rustik-jati",
      name: "Rustik Jati",
      style: "Rustik · Hangat",
      category: "rustic",
      priceIdr: 269000,
      palette: "sage",
      description: "Tekstur kraft dan warna tanah yang menghadirkan undangan rustic hangat untuk acara outdoor.",
      features: ["Tekstur kertas kraft", "Palet earthy", "Tata letak landscape", "Galeri polaroid"],
    },
    {
      slug: "anggun-navy",
      name: "Anggun Navy",
      style: "Mewah · Royal",
      category: "mewah",
      priceIdr: 379000,
      palette: "navy",
      description: "Navy royal dengan ornamen emas yang bersahaja sekaligus megah, cocok untuk royal wedding.",
      features: ["Aksen emas foil", "Layout simetris", "Hitung mundur", "Live streaming"],
    },
    {
      slug: "saka-bumi",
      name: "Saka Bumi",
      style: "Klasik · Bali",
      category: "klasik",
      priceIdr: 319000,
      palette: "emerald",
      description: "Motif endek Bali yang lembut, dipadu warna senja, menghadirkan suasana upacara yang khidmat.",
      features: ["Motif endek", "Kalender Saka", "Galeri prosesi", "RSVP per upacara"],
    },
    {
      slug: "purnama",
      name: "Purnama",
      style: "Modern · Cinematic",
      category: "modern",
      priceIdr: 449000,
      badge: "Baru",
      palette: "plum",
      description: "Mode storytelling scroll-driven dengan typography editorial, menghadirkan undangan bernuansa sinema.",
      features: ["Scroll-driven", "Hero video 15 dtk", "Galeri tak terbatas", "Domain pribadi"],
    },
    {
      slug: "kembang-setaman",
      name: "Kembang Setaman",
      style: "Floral · Watercolor",
      category: "floral",
      priceIdr: 289000,
      palette: "dustyRose",
      description: "Bunga kantil dan melati watercolor yang hangat, klasik, dan sangat Indonesia.",
      features: ["Watercolor floral", "Animasi parallax", "RSVP per sesi"],
    },
    {
      slug: "terakota-senja",
      name: "Terakota Senja",
      style: "Rustik · Terracotta",
      category: "rustic",
      priceIdr: 279000,
      palette: "terracotta",
      description: "Palet terracotta dan beige yang hangat, layaknya senja di pelataran rumah joglo.",
      features: ["Tone terracotta", "Tekstur linen", "Galeri 30 foto"],
    },
    {
      slug: "mahligai",
      name: "Mahligai",
      style: "Modern · Romantis",
      category: "modern",
      priceIdr: 75000,
      badge: "Baru",
      isFeatured: true,
      palette: "paper",
      description: "Tata letak editorial dengan tipografi serif besar dan ruang bernapas, menghadirkan nuansa romantis modern yang lembut.",
      features: [
        "Layout editorial",
        "Tipografi serif besar",
        "Hero foto full-bleed",
        "Galeri mosaic",
        "RSVP & buku tamu",
        "Amplop digital",
        "Hitung mundur",
      ],
    },
  ];

  for (const t of templates) {
    await prisma.template.upsert({
      where: { slug: t.slug },
      update: t,
      create: t,
    });
  }
  console.log(`  ✓ ${templates.length} templates`);

  // ---------- USERS ----------
  const adminPass = await bcrypt.hash("admin1234", 10);
  const userPass = await bcrypt.hash("demo1234", 10);

  await prisma.user.upsert({
    where: { email: "admin@weddq.id" },
    update: { password: adminPass, role: "ADMIN" },
    create: {
      email: "admin@weddq.id",
      password: adminPass,
      name: "Admin weddQ",
      role: "ADMIN",
    },
  });

  const arini = await prisma.user.upsert({
    where: { email: "arini@weddq.id" },
    update: { password: userPass },
    create: {
      email: "arini@weddq.id",
      password: userPass,
      name: "Arini Salsabila",
      phone: "+62 812 3456 7890",
    },
  });

  const iqbal = await prisma.user.upsert({
    where: { email: "iqbal@weddq.id" },
    update: { password: userPass },
    create: {
      email: "iqbal@weddq.id",
      password: userPass,
      name: "Iqbal Ramadhan",
      phone: "+62 813 5678 9012",
    },
  });

  // Additional demo users
  for (let i = 0; i < 4; i++) {
    const email = `mempelai${i + 1}@weddq.id`;
    await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        password: userPass,
        name: ["Maharani Wisesa", "Larasati Putra", "Khadijah Az-Zahra", "Anindya Tegar"][i],
      },
    });
  }
  console.log("  ✓ users (admin@weddq.id / admin1234, arini@weddq.id / demo1234, iqbal@weddq.id / demo1234)");

  // ---------- DEMO WEDDING ----------
  const tpl = await prisma.template.findUniqueOrThrow({ where: { slug: "sekar-kencana" } });

  await prisma.wedding.deleteMany({ where: { slug: "arini-bagas" } });
  const wedding = await prisma.wedding.create({
    data: {
      slug: "arini-bagas",
      ownerId: arini.id,
      templateId: tpl.id,
      status: "PUBLISHED",
      eyebrow: "The Wedding Of",
      coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1800&q=80",
      quote:
        "Dan di antara tanda-tanda kekuasaan-Nya, Dia menciptakan untukmu pasangan dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya. (QS. Ar-Rum: 21)",
      openingSalutation: "Bismillahirrahmanirrahim",
      closingSalutation: "Wassalamu'alaikum Warahmatullahi Wabarakatuh",
      story:
        `## PERTEMUAN
Tidak ada yang kebetulan di dunia ini, semua sudah tersusun rapi oleh Sang Maha Kuasa. Kami pertama kali bertemu pada tahun 2016, di sebuah kedai kopi sederhana di sudut kota Yogyakarta. Pertemuan singkat yang ternyata menjadi awal dari segalanya.

## MENJALIN HUBUNGAN
Perjalanan kami dimulai dari sapa sederhana dan kehangatan yang tumbuh perlahan. Tepatnya di bulan September 2018, kami memutuskan untuk saling membuka hati. Waktu demi waktu kami jalani bersama, melewati jarak, perbedaan, dan ujian yang justru membuat hubungan kami semakin kuat.

## LAMARAN
Atas Kehendak-Nya dan restu kedua orang tua, kami melangsungkan acara lamaran pada Desember 2025 dengan penuh rasa syukur dan bahagia. Sebuah janji telah kami ucapkan untuk membangun rumah tangga yang sakinah, mawaddah, warahmah.

## PERNIKAHAN
Akhirnya, kami melangkah ke hari yang selama ini kami panjatkan dalam doa. Bukan karena waktu yang panjang, tapi karena keyakinan yang kuat bahwa cinta yang diridhoi Allah pasti akan menemukan jalannya. Hari ini, kami berjanji untuk mengarungi sisa hidup bersama.`,
      primaryColor: "#A88339",
      couple: {
        create: {
          brideName: "Arini Salsabila, S.Ds.",
          brideShort: "Arini",
          brideParents: "Putri pertama dari Bapak Hidayat Surya & Ibu Nurhayati",
          brideOrder: "Putri pertama",
          bridePhoto: "https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=700&q=80",
          brideInstagram: "@arinisalsabila",
          groomName: "Bagas Pradipta, S.T.",
          groomShort: "Bagas",
          groomParents: "Putra kedua dari Bapak Pramono Adi & Ibu Ratna Wulandari",
          groomOrder: "Putra kedua",
          groomPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=700&q=80",
          groomInstagram: "@bagaspradipta",
        },
      },
      events: {
        create: [
          {
            kind: "AKAD",
            title: "Akad Nikah",
            date: new Date("2026-09-07T08:00:00+07:00"),
            endTime: new Date("2026-09-07T10:00:00+07:00"),
            venueName: "Pendopo Sasana Bhakti",
            address: "Jl. Magelang KM 9, Sleman, Yogyakarta",
            mapUrl: "https://maps.google.com/?q=Pendopo+Sasana+Bhakti+Yogyakarta",
            dressCode: "Beskap & Kebaya Krem",
            order: 1,
          },
          {
            kind: "RESEPSI",
            title: "Resepsi Pernikahan",
            date: new Date("2026-09-07T18:00:00+07:00"),
            endTime: new Date("2026-09-07T21:30:00+07:00"),
            venueName: "Royal Ambarrukmo Ballroom",
            address: "Jl. Laksda Adisucipto No.81, Yogyakarta",
            mapUrl: "https://maps.google.com/?q=Royal+Ambarrukmo+Yogyakarta",
            dressCode: "Formal · Sentuhan Emas",
            order: 2,
          },
        ],
      },
      gallery: {
        create: [
          { url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=900", caption: "Prewedding · Borobudur", order: 1 },
          { url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=900", caption: "Sesi sore", order: 2 },
          { url: "https://images.unsplash.com/photo-1525772764200-be829a350797?w=900", caption: "Cincin lamaran", order: 3 },
          { url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=900", caption: "Halaman rumah", order: 4 },
          { url: "https://images.unsplash.com/photo-1606490194859-07c18c9f0968?w=900", caption: "Bunga tujuh rupa", order: 5 },
          { url: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=900", caption: "Sore di Kotagede", order: 6 },
        ],
      },
      gifts: {
        create: [
          { kind: "BANK", bankName: "BCA", number: "1234567890", holder: "Arini Salsabila", order: 1 },
          { kind: "BANK", bankName: "Mandiri", number: "0987654321", holder: "Bagas Pradipta", order: 2 },
          { kind: "EWALLET", bankName: "GoPay", number: "+6281234567890", holder: "Arini Salsabila", order: 3 },
        ],
      },
      storyChapters: {
        create: [
          {
            title: "Pertemuan",
            body: "Pertama kali kami bertemu di akhir tahun 2019, di sebuah kedai kopi kecil di kawasan Prawirotaman, Yogyakarta. Bagas datang mencari ruang tenang untuk menyelesaikan revisi tugas akhir teknik sipilnya, sementara Arini sedang menyiapkan presentasi pameran desain bersama dosennya. Obrolan singkat tentang gambar denah dan sketsa moodboard, yang sebenarnya tidak ada kaitannya, justru menjadi awal dari sebuah cerita panjang yang tidak pernah kami duga.",
            photo: "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?w=1200&q=80",
            order: 0,
          },
          {
            title: "Menjalin Hubungan",
            body: "Pada Maret 2021, di tepi pantai Parangtritis ketika senja perlahan turun, Bagas memberanikan diri menyatakan perasaannya. Sejak hari itu, kami menjalani hubungan dengan sederhana, melewati pekerjaan, jarak Yogyakarta dengan Jakarta, hingga kerinduan yang dikirim lewat pesan-pesan tanpa jeda. Setiap akhir pekan menjadi penting, setiap pulang ke Yogyakarta menjadi alasan untuk bersyukur.",
            photo: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80",
            order: 1,
          },
          {
            title: "Lamaran",
            body: "Tepat pada 27 Desember 2025, dengan diiringi doa kedua keluarga di rumah orang tua Arini di kawasan Kotagede, Bagas datang melamar disertai seserahan sederhana dan keluarga besarnya. Hari itu kami yakin bahwa apa yang selama ini kami niatkan akan dijalani dalam jalan yang diridhoi. Janji telah diucapkan, dan persiapan menuju hari yang lebih besar pun perlahan kami rajut bersama.",
            photo: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1200&q=80",
            order: 2,
          },
          {
            title: "Pernikahan",
            body: "Hari ini, 7 September 2026, kami melangkah pada momen yang telah lama kami panjatkan. Akad nikah akan dilaksanakan di Pendopo Sasana Bhakti dengan balutan beskap dan kebaya krem, dilanjutkan dengan resepsi di Royal Ambarrukmo Ballroom pada sore harinya. Bukan akhir dari sebuah perjalanan, melainkan halaman pertama dari sebuah cerita yang Insya Allah akan kami tulis bersama hingga ke jannah-Nya.",
            photo: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1200&q=80",
            order: 3,
          },
        ],
      },
    },
  });

  // Guests + RSVP samples
  const guestsSeed = [
    { name: "Ratna Sari Dewi", phone: "+62 812-3456-7890", group: "Keluarga", invitedTo: "Akad + Resepsi" },
    { name: "Dimas Aryanto", email: "dimas.a@gmail.com", group: "Teman", invitedTo: "Resepsi" },
    { name: "Kemala Putri", phone: "+62 821-1122-3344", group: "Teman", invitedTo: "Resepsi" },
    { name: "Pradipta Hartono", group: "Kantor", invitedTo: "Resepsi" },
    { name: "Rangga & Bila", phone: "+62 819-2345-6789", group: "VIP", invitedTo: "Akad + Resepsi" },
  ];
  for (const g of guestsSeed) {
    await prisma.guest.create({ data: { ...g, slug: slugify(g.name), weddingId: wedding.id } });
  }
  const allGuests = await prisma.guest.findMany({ where: { weddingId: wedding.id } });
  await prisma.rsvp.createMany({
    data: [
      { weddingId: wedding.id, guestId: allGuests[0].id, name: allGuests[0].name, status: "HADIR", pax: 2, session: "Akad + Resepsi" },
      { weddingId: wedding.id, guestId: allGuests[1].id, name: allGuests[1].name, status: "HADIR", pax: 1, session: "Resepsi" },
      { weddingId: wedding.id, guestId: allGuests[2].id, name: allGuests[2].name, status: "TIDAK", pax: 1 },
      { weddingId: wedding.id, guestId: allGuests[3].id, name: allGuests[3].name, status: "RAGU", pax: 1 },
    ],
  });

  await prisma.wish.createMany({
    data: [
      {
        weddingId: wedding.id,
        name: "Ratna Sari Dewi",
        message:
          "Selamat menempuh hidup baru, Arini & Bagas! Semoga Allah meridhai dan melimpahkan keberkahan pada setiap langkah kalian.",
      },
      {
        weddingId: wedding.id,
        name: "Dimas Aryanto",
        message: "Barakallahu lakuma wa baraka 'alaikuma wa jama'a bainakuma fi khair. Sakinah, mawaddah, warahmah selalu.",
      },
      {
        weddingId: wedding.id,
        name: "Kemala & Pradipta",
        message: "Kabar paling membahagiakan minggu ini! Doa terbaik dari kami berdua, semoga menjadi keluarga yang penuh tawa.",
      },
    ],
  });

  console.log(`  ✓ demo wedding /${wedding.slug}`);

  // ---------- DEMO WEDDING #2: IQBAL & WULAN ----------
  const tplMahligai = await prisma.template.findUniqueOrThrow({ where: { slug: "mahligai" } });

  await prisma.wedding.deleteMany({ where: { slug: "iqbal-wulan" } });
  const wedding2 = await prisma.wedding.create({
    data: {
      slug: "iqbal-wulan",
      ownerId: iqbal.id,
      templateId: tplMahligai.id,
      status: "PUBLISHED",
      eyebrow: "Walimatul 'Urs",
      coverImage: "https://images.unsplash.com/photo-1606490194859-07c18c9f0968?w=1800&q=80",
      quote:
        "Maka nikahilah perempuan-perempuan yang kamu senangi. (QS. An-Nisa: 3)",
      openingSalutation: "Bismillahirrahmanirrahim",
      closingSalutation: "Wassalamu'alaikum Warahmatullahi Wabarakatuh",
      story:
        `## PERTEMUAN
Kami dipertemukan dalam sebuah forum diskusi mahasiswa di Bandung, empat tahun silam. Saat itu, tidak ada yang menyangka bahwa obrolan ringan tentang buku akan menjadi awal dari sebuah perjalanan panjang yang penuh makna.

## MENJALIN HUBUNGAN
Seiring waktu, kami semakin dekat dan berbagi banyak hal. Dari diskusi, kuliner, hingga mimpi-mimpi tentang masa depan. Kami belajar untuk saling mendukung, memahami, dan tumbuh bersama meski kerap diuji oleh jarak dan kesibukan masing-masing.

## LAMARAN
Pada tahun 2026, dengan ridho Allah dan restu kedua orang tua, kami melangsungkan acara lamaran. Sebuah janji suci telah kami ucapkan untuk meneguhkan niat membangun rumah tangga yang dipenuhi cinta dan keberkahan.

## PERNIKAHAN
Hari ini, dengan penuh rasa syukur, kami siap memulai babak baru sebagai sepasang suami-istri. Semoga ikatan yang kami bangun atas nama-Nya menjadi jalan menuju surga, sebagaimana yang selalu kami panjatkan dalam doa.`,
      primaryColor: "#A88339",
      couple: {
        create: {
          brideName: "Wulandari Khairunisa, S.Pd.",
          brideShort: "Wulan",
          brideParents: "Putri kedua dari Bapak Suryanto Wibawa & Ibu Halimah Tussa'diyah",
          brideOrder: "Putri kedua",
          bridePhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=700&q=80",
          brideInstagram: "@wulandari.kh",
          groomName: "Iqbal Ramadhan, S.E.",
          groomShort: "Iqbal",
          groomParents: "Putra pertama dari Bapak H. Abdullah Mansyur & Ibu Hj. Siti Rohmah",
          groomOrder: "Putra pertama",
          groomPhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=700&q=80",
          groomInstagram: "@iqbalramadhan_",
        },
      },
      events: {
        create: [
          {
            kind: "AKAD",
            title: "Akad Nikah",
            date: new Date("2027-02-14T09:00:00+07:00"),
            endTime: new Date("2027-02-14T11:00:00+07:00"),
            venueName: "Masjid Raya Bandung",
            address: "Jl. Asia Afrika No.1, Alun-alun, Bandung, Jawa Barat",
            mapUrl: "https://maps.google.com/?q=Masjid+Raya+Bandung",
            dressCode: "Busana Muslim · Tone Sage",
            order: 1,
          },
          {
            kind: "RESEPSI",
            title: "Resepsi Pernikahan",
            date: new Date("2027-02-14T19:00:00+07:00"),
            endTime: new Date("2027-02-14T22:00:00+07:00"),
            venueName: "The Trans Luxury Hotel Ballroom",
            address: "Jl. Jenderal Gatot Subroto No.289, Bandung, Jawa Barat",
            mapUrl: "https://maps.google.com/?q=The+Trans+Luxury+Hotel+Bandung",
            dressCode: "Formal · Sentuhan Putih Gading",
            order: 2,
          },
        ],
      },
      gallery: {
        create: [
          { url: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1200&q=80", caption: "Prewedding di Lembang", order: 1 },
          { url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200&q=80", caption: "Sesi pagi", order: 2 },
          { url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1200&q=80", caption: "Tasbih dan cincin", order: 3 },
          { url: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=1200&q=80", caption: "Bunga melati", order: 4 },
          { url: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200&q=80", caption: "Pelaminan", order: 5 },
          { url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&q=80", caption: "Foto keluarga", order: 6 },
        ],
      },
      gifts: {
        create: [
          { kind: "BANK", bankName: "BSI", number: "7011223344", holder: "Wulandari Khairunisa", order: 1 },
          { kind: "BANK", bankName: "BCA", number: "5566778899", holder: "Iqbal Ramadhan", order: 2 },
          { kind: "EWALLET", bankName: "ShopeePay", number: "+6281356789012", holder: "Iqbal Ramadhan", order: 3 },
        ],
      },
      storyChapters: {
        create: [
          {
            title: "Pertemuan",
            body: "Kami dipertemukan dalam sebuah forum diskusi mahasiswa di Bandung, empat tahun silam. Saat itu, tidak ada yang menyangka bahwa obrolan ringan tentang buku akan menjadi awal dari sebuah perjalanan panjang yang penuh makna.",
            photo: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=900&q=70",
            order: 0,
          },
          {
            title: "Menjalin Hubungan",
            body: "Seiring waktu, kami semakin dekat dan berbagi banyak hal. Dari diskusi, kuliner, hingga mimpi-mimpi tentang masa depan. Kami belajar untuk saling mendukung, memahami, dan tumbuh bersama meski kerap diuji oleh jarak dan kesibukan masing-masing.",
            photo: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=900&q=70",
            order: 1,
          },
          {
            title: "Lamaran",
            body: "Pada tahun 2026, dengan ridho Allah dan restu kedua orang tua, kami melangsungkan acara lamaran. Sebuah janji suci telah kami ucapkan untuk meneguhkan niat membangun rumah tangga yang dipenuhi cinta dan keberkahan.",
            photo: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=900&q=70",
            order: 2,
          },
          {
            title: "Pernikahan",
            body: "Hari ini, dengan penuh rasa syukur, kami siap memulai babak baru sebagai sepasang suami-istri. Semoga ikatan yang kami bangun atas nama-Nya menjadi jalan menuju surga, sebagaimana yang selalu kami panjatkan dalam doa.",
            photo: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=900&q=70",
            order: 3,
          },
        ],
      },
    },
  });

  // Guests + RSVP for Iqbal & Wulan
  const guests2Seed = [
    { name: "Hilman Setiawan", phone: "+62 815-2233-4455", group: "Keluarga", invitedTo: "Akad + Resepsi" },
    { name: "Aisyah Putri", email: "aisyah.putri@gmail.com", group: "Teman", invitedTo: "Resepsi" },
    { name: "Fauzi & Ratu", phone: "+62 818-9988-7766", group: "Teman", invitedTo: "Akad + Resepsi" },
    { name: "Bu Endang Sutrisno", group: "Keluarga", invitedTo: "Resepsi" },
    { name: "Pak Heru Sukarno", group: "Kantor", invitedTo: "Resepsi" },
    { name: "Keluarga Besar Mansyur", group: "VIP", invitedTo: "Akad + Resepsi" },
  ];
  for (const g of guests2Seed) {
    await prisma.guest.create({ data: { ...g, slug: slugify(g.name), weddingId: wedding2.id } });
  }
  const allGuests2 = await prisma.guest.findMany({ where: { weddingId: wedding2.id } });
  await prisma.rsvp.createMany({
    data: [
      { weddingId: wedding2.id, guestId: allGuests2[0].id, name: allGuests2[0].name, status: "HADIR", pax: 3, session: "Akad + Resepsi" },
      { weddingId: wedding2.id, guestId: allGuests2[1].id, name: allGuests2[1].name, status: "HADIR", pax: 1, session: "Resepsi", message: "Tidak sabar bertemu di acara!" },
      { weddingId: wedding2.id, guestId: allGuests2[2].id, name: allGuests2[2].name, status: "HADIR", pax: 2, session: "Akad + Resepsi" },
      { weddingId: wedding2.id, guestId: allGuests2[3].id, name: allGuests2[3].name, status: "RAGU", pax: 1 },
    ],
  });

  await prisma.wish.createMany({
    data: [
      {
        weddingId: wedding2.id,
        name: "Hilman Setiawan",
        message:
          "Selamat menempuh hidup baru, Iqbal & Wulan. Semoga Allah SWT senantiasa memberkahi rumah tangga yang akan dibangun, dan menjadikannya keluarga sakinah, mawaddah, wa rahmah.",
      },
      {
        weddingId: wedding2.id,
        name: "Aisyah Putri",
        message: "Barakallahu lakuma. Doa terbaik untuk pasangan terbaik. Sampai jumpa di hari bahagia!",
      },
      {
        weddingId: wedding2.id,
        name: "Fauzi & Ratu",
        message: "Akhirnya hari yang dinantikan tiba juga. Semoga senantiasa diberi kemudahan, kelancaran, dan keberkahan di setiap langkah.",
      },
      {
        weddingId: wedding2.id,
        name: "Bu Endang Sutrisno",
        message: "Semoga menjadi keluarga yang penuh cinta, sabar, dan saling melengkapi. Selamat menempuh hidup baru, Nak.",
      },
    ],
  });

  console.log(`  ✓ demo wedding /${wedding2.slug}`);

  await prisma.adminLog.create({
    data: { actorEmail: "system", action: "SEED", target: "database", meta: { templates: templates.length } },
  });

  console.log("✓ Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
