import { LayoutGrid, Utensils, Tag, Package } from "lucide-react";

export default function Sidebar() {
  const menuItems = [
    { name: "Menu", icon: <Utensils size={18} />, active: true },
    { name: "Categories", icon: <LayoutGrid size={18} />, active: false },
    { name: "Promos", icon: <Tag size={18} />, active: false },
    { name: "Packages", icon: <Package size={18} />, active: false },
  ];

  return (
    /* Gunakan border-gray-100 agar garis hitam berubah jadi abu-abu sangat tipis */
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col z-20">
      <div className="p-6">
        {/* Placeholder Logo */}
        <div className="bg-gray-100 h-10 flex items-center justify-center rounded text-xs font-bold text-gray-400">
          LOGO BIMA RESTO
        </div>
      </div>
      
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => (
          <div
            key={item.name}
            /* border-r-4 memindahkan garis indikator ke sisi kanan */
            className={`flex items-center gap-4 px-6 py-3 cursor-pointer transition-all ${
              item.active 
                ? "bg-[#fff5eb] text-bima-orange border-r-4 border-bima-orange font-bold" 
                : "text-gray-500 hover:bg-gray-50 border-r-4 border-transparent"
            }`}
          >
            {item.icon}
            <span className="text-sm">{item.name}</span>
          </div>
        ))}
      </nav>
    </aside>
  );
}