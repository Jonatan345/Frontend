"use client";
import { useState } from "react";
import { Plus, Search, ChevronDown, Package2, Edit3, Trash2, AlertCircle } from "lucide-react";
import StockModal from "@/components/StockModal";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";

export default function StockManagement() {
  // --- States ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingStock, setEditingStock] = useState<any>(null);

  // Data Awal dengan Kategori
  const [stockData, setStockData] = useState([
    { name: "Daging Sapi Sirloin", quantity: 15, unit: "Kg", category: "Fresh Ingredients (Meat)" },
    { name: "Daging Ayam Fillet", quantity: 8, unit: "Kg", category: "Fresh Ingredients (Poultry)" },
    { name: "Telur Ayam", quantity: 50, unit: "Kg", category: "Fresh Ingredients (Poultry)" },
    { name: "Minyak Goreng", quantity: 5, unit: "Liter", category: "Bottle" },
    { name: "Beras Pandan Wangi", quantity: 100, unit: "Kg", category: "Dry Ingredients" },
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

  // --- Fungsi Export CSV ---
  const handleExport = () => {
    // Menentukan header tabel
    const headers = ["Item Name", "Stock Level", "Unit", "Category"];
    
    // Mengonversi data stok menjadi baris CSV
    const csvRows = stockData.map(item => 
      `"${item.name}",${item.quantity},"${item.unit}","${item.category}"`
    );

    // Menggabungkan header dan isi
    const csvContent = [headers.join(","), ...csvRows].join("\n");

    // Membuat file download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `BimaResto_Stock_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredStock = stockData.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            className="bg-gray-100 text-gray-600 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors active:scale-95"
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
                filteredStock.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-5">
                      <span className="font-bold text-gray-700">{item.name}</span>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-black ${item.quantity < 10 ? 'text-red-500' : 'text-gray-700'}`}>
                          {item.quantity}
                        </span>
                        {item.quantity < 10 && (
                          <AlertCircle size={14} className="text-red-500 animate-pulse" />
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
                ))
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