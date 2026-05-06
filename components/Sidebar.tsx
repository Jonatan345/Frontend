"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { BookOpen, Folder, ClipboardList, LayoutDashboard, LogOut, Truck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const menuItems = [
    { name: "Dashboard Stok", href: "/inventory-dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Stock Management", href: "/", icon: <BookOpen size={20} /> },
    { name: "Categories", href: "/categories", icon: <Folder size={20} /> },
    { name: "Stock Reports", href: "/stock-reports", icon: <ClipboardList size={20} /> },
    { name: "Supplier", href: "/suppliers", icon: <Truck size={20} />, badge: "Baru" },
  ];

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col z-20 h-screen sticky top-0">

      {/* --- Bagian Header / Logo --- */}
      <div className="p-8 flex flex-col items-center border-b border-gray-50 mb-6">
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
          const isActive = item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-bold ${
                isActive
                  ? "bg-[#FFF4EA] text-[#F58A27] shadow-sm"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              }`}
            >
              <div className={`${isActive ? "text-[#F58A27]" : "text-gray-400"}`}>
                {item.icon}
              </div>
              <span className="text-[15px] tracking-tight">{item.name}</span>
              {item.badge && (
                <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF4EA] text-[#F58A27] border border-[#F58A27]/30">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* --- User Info & Logout --- */}
      <div className="mt-auto p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-bima-orange rounded-full flex items-center justify-center text-white font-bold text-sm">
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-800 truncate">{user?.username || 'User'}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role || 'Staff'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors text-sm font-medium"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>

    </aside>
  );
}
