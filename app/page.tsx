"use client";
import { useState } from "react";
import { Plus, Search, ChevronDown } from "lucide-react";
import MenuCard from "@/components/MenuCard";
import PortionCalculator from "@/components/PortionCalculator";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";

export default function MenuManagement() {
  // --- States ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingMenu, setEditingMenu] = useState<any>(null); // Untuk mode Edit

  const [menuData, setMenuData] = useState([
    { name: "Seasoning Pokpok Chicken", price: "33.884", img: "https://placehold.co/400x300?text=Pokpok" },
    { name: "Roti Pisang Bakar", price: "42.975", img: "https://placehold.co/400x300?text=Roti" },
    { name: "Singkong Goreng", price: "45.455", img: "https://placehold.co/400x300?text=Singkong" },
    { name: "Sup Buntut", price: "125.620", img: "https://placehold.co/400x300?text=Sup" },
    { name: "Fried Sausage", price: "37.190", img: "https://placehold.co/400x300?text=Sausage" },
    { name: "Tahu Cabe Garam", price: "27.273", img: "https://placehold.co/400x300?text=Tahu" },
    { name: "Pisang Goreng Keju", price: "38.843", img: "https://placehold.co/400x300?text=Pisang" },
    { name: "Tempe Goreng Tepung", price: "20.661", img: "https://placehold.co/400x300?text=Tempe" },
  ]);

  // --- Functions ---
  const handleOpenAdd = () => {
    setEditingMenu(null); // Pastikan mode tambah, bukan edit
    setIsModalOpen(true);
  };

  const handleOpenEdit = (menu: any) => {
    setEditingMenu(menu);
    setIsModalOpen(true);
  };

  const handleAddOrUpdate = (menu: any) => {
    if (editingMenu) {
      // Logika Update: Ganti data lama dengan data baru
      setMenuData((prev) => prev.map((item) => item.name === editingMenu.name ? menu : item));
    } else {
      // Logika Tambah: Masukkan ke urutan paling atas
      setMenuData((prev) => [menu, ...prev]);
    }
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMenu(null);
  };

  const triggerDelete = (name: string) => {
    setItemToDelete(name);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      setMenuData((prev) => prev.filter((menu) => menu.name !== itemToDelete));
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const filteredMenu = menuData.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* --- Toolbar Section --- */}
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={handleOpenAdd}
          className="bg-bima-orange text-white px-8 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-md hover:bg-[#e68a00] transition-all"
        >
          New Menu <span className="flex items-center justify-center w-5 h-5 border-2 border-white rounded-full text-xs font-black">+</span>
        </button>

        <div className="flex gap-4">
          <div className="relative">
            <select className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-10 text-gray-500 outline-none w-40 font-medium cursor-pointer">
              <option>Category</option>
            </select>
            <ChevronDown className="absolute right-3 top-3 text-gray-400" size={16} />
          </div>
          
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search menu..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-gray-200 rounded-lg px-4 py-2 pr-10 outline-none w-64 focus:ring-1 focus:ring-bima-orange transition-all" 
            />
            <Search className="absolute right-3 top-3 text-gray-400" size={18} />
          </div>
        </div>
      </div>

      {/* --- Menu Grid Section --- */}
      {filteredMenu.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-10">
          {filteredMenu.map((item, index) => (
            <MenuCard 
              key={index} 
              {...item}
              onDelete={() => triggerDelete(item.name)}
              onEdit={() => handleOpenEdit(item)} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <p className="text-gray-400 font-medium">Menu "{searchQuery}" tidak ditemukan.</p>
        </div>
      )}

      {/* --- Modals Section --- */}
      <PortionCalculator 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        onAdd={handleAddOrUpdate}
        editData={editingMenu}
      />

      <DeleteConfirmModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        onConfirm={handleConfirmDelete} 
      />
    </div>
  );
}