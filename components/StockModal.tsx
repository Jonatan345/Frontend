"use client";
import { useState, useEffect } from "react";
import { X, Package, Scale, AlertTriangle } from "lucide-react";

export default function StockModal({ 
  isOpen, 
  onClose, 
  onAdd, 
  editData 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onAdd: (item: any) => void; 
  editData?: any;
}) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState<number>(0);
  const [unit, setUnit] = useState("Kg");
  const [minStock, setMinStock] = useState<number>(5);

  // Logika Kalkulator Porsi Otomatis (Standar Bima Resto: 200g/porsi)
  const estimatedPortions = unit === "Kg" ? Math.floor((quantity * 1000) / 200) : 0;

  useEffect(() => {
    if (editData) {
      setName(editData.name);
      setQuantity(editData.quantity);
      setUnit(editData.unit || "Kg");
    } else {
      setName(""); setQuantity(0); setUnit("Kg");
    }
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    onAdd({ name, quantity, unit, minStock, portions: estimatedPortions });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-[2rem] p-7 w-full max-w-[400px] shadow-2xl relative animate-in fade-in zoom-in duration-200">
        
        <button onClick={onClose} className="absolute right-5 top-5 bg-bima-orange text-white p-1 rounded-full hover:bg-[#e68a00]">
          <X size={16} strokeWidth={3} />
        </button>

        <h2 className="text-xl font-bold mb-6 text-center text-gray-800 flex items-center justify-center gap-2">
          <Package className="text-bima-orange" size={24} />
          {editData ? "Edit Stock" : "Add New Stock"}
        </h2>
        
        <div className="space-y-4">
          {/* Item Name */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1 text-left">Bahan Baku / Item Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Contoh: Daging Sapi Sirloin"
              className="w-full border border-gray-200 p-2.5 rounded-lg text-sm outline-none focus:ring-1 focus:ring-bima-orange" 
            />
          </div>

          {/* Quantity & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1 text-left">Quantity</label>
              <input 
                type="number" 
                value={quantity} 
                onChange={(e) => setQuantity(Number(e.target.value))} 
                className="w-full border border-gray-200 p-2.5 rounded-lg text-sm outline-none focus:ring-1 focus:ring-bima-orange" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1 text-left">Unit</label>
              <select 
                value={unit} 
                onChange={(e) => setUnit(e.target.value)}
                className="w-full border border-gray-200 p-2.5 rounded-lg text-sm bg-white outline-none focus:ring-1 focus:ring-bima-orange"
              >
                <option>Kg</option>
                <option>Gram</option>
                <option>Liter</option>
                <option>Pcs</option>
              </select>
            </div>
          </div>

          {/* Kalkulator Porsi Otomatis */}
          {unit === "Kg" && quantity > 0 && (
            <div className="bg-orange-50 border border-orange-100 p-3 rounded-xl flex items-start gap-3">
              <Scale className="text-bima-orange mt-1" size={18} />
              <div>
                <p className="text-[11px] font-bold text-orange-800 uppercase">Estimasi Porsi Dapur</p>
                <p className="text-lg font-extrabold text-bima-orange">{estimatedPortions} <span className="text-xs font-normal">Porsi (200g/porsi)</span></p>
              </div>
            </div>
          )}

          {/* Min Stock Warning */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1 text-left flex items-center gap-1">
              <AlertTriangle size={14} className="text-amber-500" /> Minimum Stock Warning
            </label>
            <input 
              type="number" 
              value={minStock} 
              onChange={(e) => setMinStock(Number(e.target.value))}
              className="w-full border border-gray-200 p-2.5 rounded-lg text-sm outline-none focus:ring-1 focus:ring-bima-orange" 
            />
          </div>

          <button 
            onClick={handleSubmit}
            className="w-full bg-bima-orange text-white py-3 rounded-xl font-bold text-base shadow-lg hover:bg-[#e68a00] transition-all mt-2"
          >
            Update Inventory
          </button>
        </div>
      </div>
    </div>
  );
}