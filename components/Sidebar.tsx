"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Folder, Tag, Package } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname(); // Mendeteksi halaman aktif

  // Menggunakan ikon yang sesuai dengan desain Figma
  const menuItems = [
    { name: "Stock Management", href: "/", icon: <BookOpen size={20} /> },
    { name: "Categories", href: "/categories", icon: <Folder size={20} /> },
    { name: "Promotion", href: "/promotions", icon: <Tag size={20} /> },
    { name: "Packages", href: "/packages", icon: <Package size={20} /> },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col z-20 h-screen sticky top-0">
      
      {/* --- Bagian Header / Logo --- */}
      <div className="p-8 flex flex-col items-center border-b border-gray-50 mb-6">
        {/* Menggunakan tag <img> biasa untuk menghindari error Next.js Image optimizer */}
        <img 
          src="/logopradita.png" 
          alt="Pradita University Logo" 
          className="w-full h-19 object-contain mb-2"
        />
        <h2 className="text-[16px] font-black text-[#F58A27] tracking-[0.2em] uppercase mt-1">
          BIMA RESTO
        </h2>
      </div>
      
      {/* --- Bagian Navigasi Menu --- */}
      <nav className="flex-1 space-y-2 px-4">
        {menuItems.map((item) => {
          // Logika untuk mengecek apakah menu ini sedang aktif
          // (pathname === '/' khusus untuk Home, sisanya pakai startsWith agar sub-halaman tetap aktif)
          const isActive = item.href === "/" 
            ? pathname === "/" 
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-bold ${
                isActive 
                  ? "bg-[#FFF4EA] text-[#F58A27] shadow-sm" // Gaya saat menu aktif (Orange)
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800" // Gaya saat menu tidak aktif
              }`}
            >
              <div className={`${isActive ? "text-[#F58A27]" : "text-gray-400"}`}>
                {item.icon}
              </div>
              <span className="text-[15px] tracking-tight">{item.name}</span>
            </Link>
          );
        })}
      </nav>

    </aside>
  );
}