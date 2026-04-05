"use client";
import { X } from "lucide-react";

export default function DeleteConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] bg-black/40 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-200">
        
        {/* Tombol Close Oranye */}
        <button 
          onClick={onClose} 
          className="absolute right-6 top-6 bg-bima-orange text-white p-1 rounded-full hover:bg-[#e68a00] transition-colors"
        >
          <X size={18} strokeWidth={3} />
        </button>

        <h2 className="text-xl font-bold mb-4 text-center text-gray-800">Confirm Deletion</h2>
        
        <p className="text-gray-500 text-center font-medium leading-relaxed mb-8 px-6">
          Are you sure you want to delete this item? This action cannot be undone.
        </p>
        
        <div className="flex gap-4">
          {/* Tombol Cancel */}
          <button 
            onClick={onClose}
            className="flex-1 py-3 border border-gray-300 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          
          {/* Tombol Delete Merah */}
          <button 
            onClick={onConfirm}
            className="flex-1 py-3 bg-[#ff7373] text-white rounded-xl font-bold hover:bg-[#ff5c5c] transition-all shadow-md"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}