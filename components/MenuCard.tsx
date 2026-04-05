"use client";

export default function MenuCard({ 
  name, 
  price, 
  img, 
  onDelete,
  onEdit // 1. Tambahkan props ini
}: { 
  name: string; 
  price: string; 
  img: string; 
  onDelete: () => void; 
  onEdit: () => void; // 2. Definisikan tipenya
}) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="h-40 bg-gray-100 overflow-hidden">
        <img src={img} alt={name} className="w-full h-full object-cover" />
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-800 mb-1 leading-tight h-10 overflow-hidden">{name}</h3>
        <p className="text-gray-500 font-bold mb-4 text-sm">Rp {price}</p>
        
        <div className="flex gap-2">
          <button 
            onClick={onEdit} // 3. Pasang fungsi klik di sini
            className="flex-1 py-2 text-sm font-semibold text-gray-400 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-200 transition-all"
          >
            Edit
          </button>
          
          <button 
            onClick={onDelete}
            className="flex-1 py-2 text-sm font-semibold bg-[#ff4d4d] text-white rounded-lg shadow-sm hover:bg-[#e64545] transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}