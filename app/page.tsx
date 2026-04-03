"use client";
import { useState } from "react";
import { Plus, Search, ChevronDown, Package2, Edit3, Trash2, AlertCircle, BellRing } from "lucide-react";
import StockModal from "@/components/StockModal";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";

export default function StockManagement() {
  // --- States ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingStock, setEditingStock] = useState<any>(null);

  // Data Awal: Menambahkan properti minStock untuk setiap item
  const [stockData, setStockData] = useState([
    { name: "Daging Sapi Sirloin", quantity: 15, unit: "Kg", category: "Fresh Ingredients (Meat)", minStock: 10 },
    { name: "Daging Ayam Fillet", quantity: 8, unit: "Kg", category: "Fresh Ingredients (Poultry)", minStock: 10 }, // Menipis
    { name: "Telur Ayam", quantity: 50, unit: "Kg", category: "Fresh Ingredients (Poultry)", minStock: 20 },
    { name: "Minyak Goreng", quantity: 5, unit: "Liter", category: "Bottle", minStock: 10 }, // Menipis
    { name: "Beras Pandan Wangi", quantity: 100, unit: "Kg", category: "Dry Ingredients", minStock: 20 },
  ]);

  // --- Functions ---
  const handleOpenAdd = () => {
    setEditingStock(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingStock(item);
    setIsModalOpen(true);
  };

  const handleAddOrUpdate = (item: any) => {
    if (editingStock) {
      setStockData((prev) => prev.map((s) => s.name === editingStock.name ? item : s));
    } else {
      setStockData((prev) => [item, ...prev]);
    }
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStock(null);
  };

  const triggerDelete = (name: string) => {
    setItemToDelete(name);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      setStockData((prev) => prev.filter((item) => item.name !== itemToDelete));
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const handleExport = () => {
    const headers = ["Item Name", "Stock Level", "Unit", "Category", "Min Stock"];
    const csvRows = stockData.map(item => 
      `"${item.name}",${item.quantity},"${item.unit}","${item.category}",${item.minStock}`
    );
    const csvContent = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `BimaResto_Stock_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  const filteredStock = stockData.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Logika untuk menghitung berapa banyak item yang stoknya menipis
  const lowStockItems = stockData.filter(item => item.quantity <= (item.minStock || 0));
  const hasLowStock = lowStockItems.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* --- Header Section --- */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3">
            <Package2 className="text-bima-orange" size={32} />
            Stock Management
          </h1>
          <p className="text-gray-500 text-sm mt-1 italic">Pradita University - Bima Resto Inventory System</p>
        </div>
        
        <button 
          onClick={handleOpenAdd}
          className="bg-bima-orange text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-100 hover:bg-[#e68a00] active:scale-95 transition-all"
        >
          Add New Stock <Plus size={18} strokeWidth={3} />
        </button>
      </div>

      {/* --- Alert Banner: Muncul jika ada stok di bawah batas minimum --- */}
      {hasLowStock && (
        <div className="mb-8 bg-red-50 border border-red-100 p-5 rounded-[2rem] flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-4">
            <div className="bg-red-500 p-2.5 rounded-2xl shadow-lg shadow-red-100">
              <BellRing className="text-white animate-bounce" size={20} />
            </div>
            <div>
              <h4 className="text-red-800 font-black text-sm uppercase tracking-tight">Perhatian: Stok Menipis!</h4>
              <p className="text-red-600/80 text-xs font-bold">
                Ada {lowStockItems.length} item yang sudah mencapai batas minimum pemesanan.
              </p>
            </div>
          </div>
          <div className="hidden sm:flex gap-2">
            {lowStockItems.slice(0, 2).map((item, i) => (
              <span key={i} className="bg-white/50 border border-red-100 px-3 py-1 rounded-xl text-[10px] font-black text-red-500 uppercase">
                {item.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* --- Toolbar / Filter Section --- */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <input 
            type="text" 
            placeholder="Search by ingredient name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-10 outline-none focus:ring-2 focus:ring-bima-orange/20 text-sm" 
          />
          <Search className="absolute right-3 top-3 text-gray-400" size={18} />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <select className="flex-1 md:w-40 appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-gray-600 outline-none font-medium text-sm cursor-pointer">
            <option>All Units</option>
            <option>Kg</option>
            <option>Liter</option>
            <option>Pcs</option>
          </select>
          <button 
            onClick={handleExport}
            className="bg-gray-100 text-gray-600 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
          >
            Export
          </button>
        </div>
      </div>

      {/* --- Table Section --- */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="p-5 text-xs font-black text-gray-400 uppercase tracking-wider">Item Name</th>
                <th className="p-5 text-xs font-black text-gray-400 uppercase tracking-wider">Stock Level</th>
                <th className="p-5 text-xs font-black text-gray-400 uppercase tracking-wider">Unit</th>
                <th className="p-5 text-xs font-black text-gray-400 uppercase tracking-wider text-center">Category</th>
                <th className="p-5 text-xs font-black text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredStock.length > 0 ? (
                filteredStock.map((item, index) => {
                  // Mengecek apakah stok saat ini kurang dari atau sama dengan batas minimum
                  const isLowStock = item.quantity <= (item.minStock || 0);
                  
                  return (
                    <tr key={index} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="p-5">
                        <span className="font-bold text-gray-700">{item.name}</span>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-black ${isLowStock ? 'text-red-500' : 'text-gray-700'}`}>
                            {item.quantity}
                          </span>
                          {isLowStock && (
                            <div className="group relative flex items-center">
                              <AlertCircle size={14} className="text-red-500 animate-pulse" />
                              {/* Tooltip Batas Minimum */}
                              <span className="absolute left-6 hidden group-hover:block bg-gray-800 text-white text-[9px] px-2 py-1 rounded whitespace-nowrap z-10 font-bold uppercase tracking-widest">
                                Min: {item.minStock} {item.unit}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-5 text-gray-500 text-sm font-medium">{item.unit}</td>
                      <td className="p-5 text-center">
                        <span className="bg-bima-orange-light text-bima-orange px-3 py-1 rounded-full text-[10px] font-black border border-orange-100 uppercase tracking-tighter">
                          {item.category}
                        </span>
                      </td>
                      <td className="p-5 text-right">
                        <div className="flex justify-end gap-1">
                          <button 
                            onClick={() => handleOpenEdit(item)}
                            className="p-2 text-gray-400 hover:text-bima-orange hover:bg-orange-50 rounded-lg transition-all"
                          >
                            <Edit3 size={18} />
                          </button>
                          <button 
                            onClick={() => triggerDelete(item.name)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-gray-400 italic">
                    No stock data found for "{searchQuery}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Modals Section --- */}
      <StockModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        onAdd={handleAddOrUpdate}
        editData={editingStock}
      />

      <DeleteConfirmModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        onConfirm={handleConfirmDelete} 
      />
    </div>
  );
}