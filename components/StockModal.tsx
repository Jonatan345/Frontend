"use client";
import { useState, useEffect } from "react";
import { X, Package, Tag, AlertTriangle, ChevronDown } from "lucide-react";

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
  const [category, setCategory] = useState("Dry Ingredients");
  const [minStock, setMinStock] = useState<number>(5);

  useEffect(() => {
    if (editData) {
      setName(editData.name);
      setQuantity(editData.quantity);
      setUnit(editData.unit || "Kg");
      setCategory(editData.category || "Dry Ingredients");
    } else {
      setName(""); setQuantity(0); setUnit("Kg"); setCategory("Dry Ingredients");
    }
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    onAdd({ name, quantity, unit, category, minStock });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-[2rem] p-7 w-full max-w-[420px] shadow-2xl relative">
        
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
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Bahan Baku</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Contoh: Daging Sapi Sirloin"
              className="w-full border border-gray-200 p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-bima-orange/20" 
            />
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1 flex items-center gap-1">
              <Tag size={12} /> Category
            </label>
            <div className="relative">
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full appearance-none border border-gray-200 p-3 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-bima-orange/20 cursor-pointer"
              >
                <option value="Dry Ingredients">Dry Ingredients</option>
                <option value="Fresh Ingredients (Vegetable)">Fresh Ingredients (Vegetable)</option>
                <option value="Fresh Ingredients (Fruits)">Fresh Ingredients (Fruits)</option>
                <option value="Fresh Ingredients (Poultry)">Fresh Ingredients (Poultry)</option>
                <option value="Fresh Ingredients (Meat)">Fresh Ingredients (Meat)</option>
                <option value="Fresh Ingredients (Seafood)">Fresh Ingredients (Seafood)</option>
                <option value="Bottle">Bottle</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Quantity & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Quantity</label>
              <input 
                type="number" 
                value={quantity} 
                onChange={(e) => setQuantity(Number(e.target.value))} 
                className="w-full border border-gray-200 p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-bima-orange/20" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Unit</label>
              <select 
                value={unit} 
                onChange={(e) => setUnit(e.target.value)}
                className="w-full border border-gray-200 p-3 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-bima-orange/20"
              >
                <option>Kg</option>
                <option>Gram</option>
                <option>Liter</option>
                <option>Pcs</option>
              </select>
            </div>
          </div>

          {/* Min Stock Warning */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1 flex items-center gap-1">
              <AlertTriangle size={12} className="text-amber-500" /> Minimum Stock Warning
            </label>
            <input 
              type="number" 
              value={minStock} 
              onChange={(e) => setMinStock(Number(e.target.value))}
              className="w-full border border-gray-200 p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-bima-orange/20" 
            />
          </div>

          <button 
            onClick={handleSubmit}
            className="w-full bg-bima-orange text-white py-3.5 rounded-xl font-black text-sm shadow-lg shadow-orange-100 hover:bg-[#e68a00] active:scale-[0.98] transition-all mt-4 uppercase tracking-wider"
          >
            Update Inventory
          </button>
        </div>
      </div>
    </div>
  );
}