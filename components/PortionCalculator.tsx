"use client";
import { useState, useEffect, useRef } from "react"; // Tambahkan useRef
import { UploadCloud, X, ChevronDown, PlusCircle } from "lucide-react";

export default function PortionCalculator({ 
  isOpen, 
  onClose, 
  onAdd, 
  editData 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onAdd: (menu: any) => void; 
  editData?: any;
}) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Poultry");
  const [variants, setVariants] = useState(["Cheese", "Chocolate Sprinkles", "Choco & Cheese"]);
  const [imagePreview, setImagePreview] = useState<string | null>(null); // State untuk simpan gambar

  const fileInputRef = useRef<HTMLInputElement>(null); // Ref untuk input file tersembunyi
  const isEdit = !!editData;

  useEffect(() => {
    if (editData) {
      setName(editData.name);
      setPrice(editData.price);
      setDescription("Deep fried battered fermented cassava");
      setImagePreview(editData.img);
    } else {
      setName(""); setPrice(""); setDescription(""); setImagePreview(null);
    }
  }, [editData, isOpen]);

  if (!isOpen) return null;

  // Fungsi untuk memicu pemilihan file
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  // Fungsi untuk menangani file yang dipilih
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string); // Simpan hasil gambar sebagai URL preview
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    onAdd({ 
      name, 
      price, 
      img: imagePreview || `https://placehold.co/400x300?text=${name.split(" ")[0]}` 
    });
    setImagePreview(null);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-[2rem] p-7 w-full max-w-[440px] shadow-2xl relative animate-in fade-in zoom-in duration-200 overflow-y-auto max-h-[95vh]">
        
        <button 
          onClick={onClose} 
          className="absolute right-5 top-5 bg-bima-orange text-white p-1 rounded-full hover:bg-[#e68a00] transition-colors shadow-sm"
        >
          <X size={16} strokeWidth={3} />
        </button>

        <h2 className="text-xl font-bold mb-5 text-center text-gray-800">
          {isEdit ? "Edit Menu" : "Add New Menu"}
        </h2>
        
        <div className="space-y-3.5">
          {/* Menu Name */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">Menu Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="e.g. Nasi Goreng Special"
              className="w-full border border-gray-200 p-2.5 rounded-lg text-sm outline-none focus:ring-1 focus:ring-bima-orange" 
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">Description</label>
            <textarea 
              rows={2} 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="A brief and enticing description..."
              className="w-full border border-gray-200 p-2.5 rounded-lg text-sm resize-none outline-none focus:ring-1 focus:ring-bima-orange" 
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">Price</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-gray-400 text-xs border-r border-gray-200 pr-2 py-1">Rp</span>
              <input 
                type="text" 
                value={price} 
                onChange={(e) => setPrice(e.target.value)} 
                placeholder="e.g. 55000"
                className="w-full border border-gray-200 p-2.5 pl-14 rounded-lg text-sm outline-none focus:ring-1 focus:ring-bima-orange" 
              />
            </div>
          </div>

          {/* Category - Hanya muncul di Mode EDIT */}
          {isEdit && (
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Category</label>
              <div className="relative">
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full appearance-none border border-gray-200 p-2.5 rounded-lg text-sm bg-white outline-none focus:ring-1 focus:ring-bima-orange text-gray-500"
                >
                  <option>Poultry</option>
                  <option>Snacks</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 text-gray-400" size={14} />
              </div>
            </div>
          )}

          {/* Menu Variants - Hanya muncul di Mode EDIT */}
          {isEdit && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input type="checkbox" checked readOnly className="w-3.5 h-3.5 rounded accent-bima-orange" />
                <label className="text-xs font-bold text-gray-800">Menu Variants</label>
              </div>
              {variants.map((v, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-50 border border-gray-200 p-2 rounded-lg text-[13px] text-gray-600">
                  {v} <X size={14} className="text-gray-400 cursor-pointer" />
                </div>
              ))}
              <button className="w-full flex justify-center py-2 bg-gray-200/50 text-gray-400 rounded-lg">
                <PlusCircle size={18} />
              </button>
            </div>
          )}

          {/* Upload Files - Input File Tersembunyi */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">Upload Files</label>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*" 
            />
            <div className="border border-dashed border-gray-200 rounded-xl p-5 flex flex-col items-center justify-center bg-white text-center">
              {/* Tampilkan preview kecil jika sudah ada gambar yang dipilih */}
              {imagePreview ? (
                <img src={imagePreview} className="w-20 h-20 object-cover rounded-lg mb-2 shadow-sm" alt="Preview" />
              ) : (
                <UploadCloud size={32} className="text-gray-800 mb-2" strokeWidth={1.5} />
              )}
              <p className="text-[11px] font-medium text-gray-800">Choose a file or drag & drop it here</p>
              <p className="text-[9px] text-gray-400 mt-0.5 mb-2 uppercase">JPEG, PNG, up to 50MB</p>
              <button 
                onClick={handleBrowseClick}
                className="border border-gray-300 px-4 py-1 rounded-lg text-[10px] font-bold text-gray-600 bg-white shadow-sm hover:bg-gray-50 transition-colors"
              >
                Browse File
              </button>
            </div>
          </div>

          <button 
            onClick={handleSubmit}
            className="w-full bg-bima-orange text-white py-3 rounded-xl font-bold text-base shadow-lg shadow-orange-100 hover:bg-[#e68a00] active:scale-[0.98] transition-all mt-1"
          >
            {isEdit ? "Update" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}