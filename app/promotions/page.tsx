import PromotionSection from "@/components/PromotionSection";

export default function PromotionsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* --- Header Halaman Promosi --- */}
      <div>
        <h1 className="text-3xl font-black text-gray-800 tracking-tight">Promosi & Diskon</h1>
        <p className="text-gray-400 font-medium mt-1">
          Kelola daftar promosi, diskon, dan penawaran spesial Bima Resto.
        </p>
      </div>

      {/* --- Menampilkan Komponen Promosi SAJA --- */}
      <section>
        <PromotionSection />
      </section>
    </div>
  );
}