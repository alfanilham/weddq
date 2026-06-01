import { Link } from "react-router-dom";
import PublicLayout from "@/components/PublicLayout";
import { Divider } from "@/components/Ornaments";

export default function NotFoundPage() {
  return (
    <PublicLayout>
      <section className="container-narrow py-32 text-center">
        <span className="eyebrow">404</span>
        <h1 className="mt-6 text-6xl md:text-8xl font-serif">Halaman tidak ditemukan</h1>
        <Divider width={300} className="mx-auto mt-8" />
        <p className="mt-6 max-w-md mx-auto text-sepia-soft">
          Tautan yang Anda buka mungkin telah berpindah, kedaluwarsa, atau tidak pernah ada. Silakan kembali ke beranda untuk memulai kembali.
        </p>
        <Link to="/" className="btn mt-10">Kembali ke beranda</Link>
      </section>
    </PublicLayout>
  );
}
