import { Link } from "react-router-dom";
import PublicLayout from "@/components/PublicLayout";
import { Reveal } from "@/components/Reveal";

function Check() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#A88339" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

type Step = { title: string; desc: string; details?: string[] };

const STEPS: { section: string; eyebrow: string; intro: string; steps: Step[] }[] = [
  {
    section: "Memulai",
    eyebrow: "01 · LANGKAH AWAL",
    intro: "Buat akun, jelajahi pustaka tema, dan buat undangan pertama Anda dalam hitungan menit.",
    steps: [
      {
        title: "Daftarkan akun",
        desc: "Buat akun dengan email aktif. Tidak perlu kartu kredit. Konfirmasi melalui tautan yang dikirim ke email Anda.",
        details: [
          "Buka tombol Daftar di pojok kanan atas",
          "Isi nama, email, dan kata sandi minimal 8 karakter",
          "Anda akan langsung diarahkan ke dasbor",
        ],
      },
      {
        title: "Pilih template",
        desc: "Telusuri pustaka tema dan pilih desain yang paling mencerminkan kepribadian Anda berdua.",
        details: [
          "Filter berdasarkan kategori (Klasik, Modern, Islami, Rustik, Floral, Mewah)",
          "Filter paket: Pro atau Eksklusif",
          "Klik template untuk preview interaktif sebelum memutuskan",
        ],
      },
      {
        title: "Buat undangan pertama",
        desc: "Isi nama panggilan kedua mempelai dan pilih template untuk mulai. Anda dapat menyesuaikan semuanya nanti.",
      },
    ],
  },
  {
    section: "Editor Konten",
    eyebrow: "02 · MENYUSUN ISI",
    intro: "Susun seluruh konten undangan melalui dasbor yang sederhana dan terstruktur per blok.",
    steps: [
      {
        title: "Identitas mempelai",
        desc: "Lengkapi profil mempelai putri dan putra: nama lengkap, panggilan, orang tua, dan akun Instagram.",
      },
      {
        title: "Salam pembuka & penutup",
        desc: "Pilih salam sesuai agama atau preferensi: Islam, Kristen/Katolik, Hindu, Buddha, Konghucu, atau Umum. Kosongkan untuk menyembunyikan.",
      },
      {
        title: "Perjalanan Kami",
        desc: "Tambahkan bab cerita perjalanan kalian (Pertemuan, Lamaran, dst). Setiap bab dapat dilengkapi judul, foto pendukung, dan paragraf cerita.",
        details: [
          "Buka menu Perjalanan Kami di sidebar dasbor",
          "Klik Tambah Bab dan isi judul + isi cerita",
          "Tambahkan URL foto untuk visualisasi (opsional)",
          "Atur urutan dengan tombol ↑ ↓",
        ],
      },
      {
        title: "Acara",
        desc: "Tambahkan rangkaian acara (Akad, Resepsi, Ngunduh Mantu, dll) lengkap dengan tanggal, jam, tempat, alamat, peta, dan dresscode.",
      },
      {
        title: "Galeri foto",
        desc: "Tempel URL foto dari Unsplash, Google Drive (yang dipublik), atau hosting Anda. Minimal 4 foto direkomendasikan untuk tampilan optimal.",
      },
      {
        title: "Musik latar",
        desc: "Tempel tautan YouTube pada Editor Konten. Lagu akan terputar otomatis (tidak bersuara) dengan tombol mengambang untuk mengaktifkan suara.",
        details: [
          "Format: youtube.com/watch?v=ID, youtu.be/ID, atau ID 11 karakter langsung",
          "Pastikan video dapat diembed (tidak dibatasi pemilik)",
          "Tamu dapat menjeda atau mengaktifkan suara kapan saja",
        ],
      },
    ],
  },
  {
    section: "Tamu & RSVP",
    eyebrow: "03 · MENGUNDANG TAMU",
    intro: "Kelola daftar tamu, kirim undangan via WhatsApp, dan pantau konfirmasi kehadiran.",
    steps: [
      {
        title: "Tambah daftar tamu",
        desc: "Daftarkan nama, nomor WA, grup (Keluarga/Teman/Kantor/VIP), dan sesi yang diundang.",
        details: [
          "Setiap tamu otomatis mendapat slug pribadi (mis. weddq.id/arini-bagas?to=rangga-bila)",
          "Saat tamu membuka tautan, namanya akan tampil di cover undangan",
          "RSVP juga jadi 1-klik: cukup pilih Hadir/Tidak/Ragu",
        ],
      },
      {
        title: "Atur template pesan WhatsApp",
        desc: "Buka menu Daftar Tamu, klik Template Pesan WhatsApp, dan sesuaikan dengan gaya Anda.",
        details: [
          "Gunakan variabel: {nama} {link} {tanggal} {venue} {brideShort} {groomShort}",
          "Klik chip variabel untuk menyisipkan otomatis",
          "Simpan template untuk dipakai ulang",
        ],
      },
      {
        title: "Kirim undangan",
        desc: "Dua pilihan: kirim via Bot weddQ (otomatis dari nomor weddQ) atau WA Saya (membuka WhatsApp pribadi Anda dengan pesan terisi).",
        details: [
          "Bot weddQ: 1-klik kirim per tamu atau bulk ke semua, status otomatis ter-update",
          "WA Saya: buka wa.me dengan pesan template, kirim manual",
          "Pantau status Terkirim/Gagal di kolom WA",
        ],
      },
      {
        title: "Pantau konfirmasi RSVP",
        desc: "Lihat konfirmasi tamu masuk secara real-time di menu RSVP. Filter berdasarkan status: Hadir, Tidak, atau Ragu.",
      },
    ],
  },
  {
    section: "Publish & Bagikan",
    eyebrow: "04 · MEMPUBLIKASIKAN",
    intro: "Aktifkan undangan dan bagikan tautan kepada tamu undangan Anda.",
    steps: [
      {
        title: "Publish undangan",
        desc: "Buka menu Pengaturan dan ubah status dari Draft menjadi Publish. Undangan akan dapat diakses di tautan publik.",
      },
      {
        title: "Salin tautan publik",
        desc: "Tautan undangan Anda berbentuk weddq.id/nama-anda. Salin dan bagikan via WhatsApp, Instagram, atau email.",
      },
      {
        title: "Tautan personal per tamu",
        desc: "Untuk pengalaman terbaik, gunakan tautan personal (weddq.id/nama-anda?to=nama-tamu) yang menampilkan nama tamu di cover.",
      },
    ],
  },
];

const FAQS = [
  {
    q: "Apakah ada masa aktif undangan?",
    a: "Tidak ada langganan atau biaya tambahan. Cukup bayar sekali dan undangan tetap aktif untuk acara Anda.",
  },
  {
    q: "Bisakah saya mengganti template setelah membuat undangan?",
    a: "Bisa. Buka Pengaturan di dasbor dan pilih template yang baru. Seluruh konten Anda otomatis tertranslasi ke template baru.",
  },
  {
    q: "Bagaimana cara mengaktifkan musik latar?",
    a: "Tempel tautan YouTube di Editor Konten. Musik akan otomatis terputar (tanpa suara karena kebijakan browser). Tamu dapat klik tombol mengambang untuk mengaktifkan suara.",
  },
  {
    q: "Domain .my.id seperti apa contohnya?",
    a: "Untuk paket Eksklusif, Anda dapat menggunakan domain pribadi misalnya arini-bagas.my.id yang lebih elegan dibanding subdomain weddq.id/arini-bagas. Hubungi tim kami untuk pendaftaran.",
  },
  {
    q: "Bagaimana jika bot WhatsApp weddQ sedang tidak aktif?",
    a: "Anda tetap dapat mengirim undangan dengan tombol WA Saya yang membuka WhatsApp pribadi dengan pesan template terisi otomatis. Hasilnya identik.",
  },
];

export default function PanduanPage() {
  return (
    <PublicLayout>
      <section className="bg-brown text-cream-soft">
        <div className="container-narrow pt-32 md:pt-40 pb-20 md:pb-24">
          <div className="max-w-3xl">
            <span className="label-soft text-rose-soft">Panduan Pengguna</span>
            <h1 className="mt-4 text-4xl md:text-6xl font-serif leading-[1.1] text-cream-soft">
              Panduan lengkap, <span className="text-rose-soft">selangkah demi selangkah</span>
            </h1>
            <p className="mt-6 text-cream-soft/80 text-[16px] md:text-[17px] leading-relaxed">
              Pelajari cara membuat, menyusun, dan membagikan undangan digital weddQ dari awal hingga publish. Tidak ada jargon teknis — hanya langkah-langkah yang jelas.
            </p>
          </div>
        </div>
      </section>

      <section className="container-narrow py-16 md:py-20">
        {/* TOC */}
        <Reveal className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
          {STEPS.map((sec, i) => (
            <a
              key={sec.section}
              href={`#sec-${i}`}
              className="card-soft p-5 group"
            >
              <div className="text-[10px] tracking-[0.3em] uppercase text-gold-deep">{String(i + 1).padStart(2, "0")}</div>
              <div className="font-serif text-xl mt-2 text-sepia">{sec.section}</div>
              <div className="text-xs text-sepia-mute mt-1 group-hover:text-sepia-soft">{sec.steps.length} langkah</div>
            </a>
          ))}
        </Reveal>

        {STEPS.map((sec, i) => (
          <section key={sec.section} id={`sec-${i}`} className="mb-20 scroll-mt-24">
            <Reveal>
              <div className="mb-10">
                <span className="label-soft">{sec.eyebrow}</span>
                <h2 className="mt-3 font-serif text-3xl md:text-4xl text-sepia">{sec.section}</h2>
                <p className="mt-3 text-sepia-soft max-w-2xl">{sec.intro}</p>
              </div>
            </Reveal>

            <div className="space-y-5">
              {sec.steps.map((step, j) => (
                <Reveal key={step.title}>
                  <div className="card-soft p-6 md:p-8 grid md:grid-cols-[80px_1fr] gap-6">
                    <div>
                      <div className="text-[10px] tracking-[0.3em] uppercase text-gold-deep">Langkah</div>
                      <div className="font-serif text-5xl mt-2 text-gold">{String(j + 1).padStart(2, "0")}</div>
                    </div>
                    <div>
                      <h3 className="font-serif text-2xl text-sepia">{step.title}</h3>
                      <p className="text-sm md:text-base text-sepia-soft mt-3 leading-relaxed">{step.desc}</p>
                      {step.details && (
                        <ul className="mt-5 space-y-2.5">
                          {step.details.map((d, k) => (
                            <li key={k} className="flex gap-2.5 text-sm text-sepia-soft">
                              <Check />
                              <span>{d}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>
        ))}

        {/* FAQ */}
        <section id="faq" className="scroll-mt-24">
          <Reveal>
            <div className="text-center mb-10">
              <span className="label-soft">Pertanyaan Umum</span>
              <h2 className="mt-3 font-serif text-3xl md:text-4xl text-sepia">Hal yang sering ditanyakan</h2>
            </div>
          </Reveal>

          <Reveal className="max-w-3xl mx-auto card-soft overflow-hidden divide-y divide-line">
            {FAQS.map((f) => (
              <details key={f.q} className="group">
                <summary className="cursor-pointer list-none flex items-center justify-between gap-4 px-6 py-5 transition hover:bg-cream-soft/60">
                  <span className="font-serif font-bold text-lg text-sepia">{f.q}</span>
                  <svg
                    width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="#A88339" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className="shrink-0 text-gold-deep transition-transform duration-300 group-open:rotate-180"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </summary>
                <p className="px-6 pb-5 -mt-1 text-sm md:text-[15px] text-sepia-soft leading-relaxed">{f.a}</p>
              </details>
            ))}
          </Reveal>
        </section>

        {/* CTA */}
        <Reveal className="mt-20">
          <div className="rounded-3xl bg-brown text-cream-soft text-center px-8 py-14 md:px-16 md:py-16">
            <span className="label-soft text-rose-soft">Siap Mulai?</span>
            <h2 className="mt-4 font-serif text-3xl md:text-4xl text-cream-soft">Buat undangan pertama Anda hari ini</h2>
            <p className="mt-4 text-cream-soft/80 max-w-xl mx-auto">
              Dapat dicoba tanpa kartu kredit. Pilih template kesukaan, isi konten, dan publikasikan dalam waktu kurang dari 15 menit.
            </p>
            <div className="mt-7 flex gap-3 flex-wrap justify-center">
              <Link to="/register" className="btn-gold">Buat Undangan Sekarang →</Link>
              <Link
                to="/templates"
                className="inline-flex items-center gap-2.5 rounded-full border border-cream-soft/40 bg-transparent text-cream-soft px-7 py-3.5 text-sm font-medium tracking-wide transition hover:bg-cream-soft/10 hover:border-cream-soft"
              >
                Lihat Template
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </PublicLayout>
  );
}
