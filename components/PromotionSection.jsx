"use client";

import React, { useState } from 'react';
import { Edit2, Trash2, Plus, Search, X, Calendar, ImagePlus, ChevronDown } from 'lucide-react';

const PromotionSection = () => {
  // --- Data Dummy ---
  const [promotions, setPromotions] = useState([
    { 
      id: 1, 
      title: 'Promo Grand Opening', 
      type: 'Diskon',
      value: '20%', 
      status: 'Aktif',
      validity: 's/d 30 April 2026',
      img: 'https://placehold.co/600x400/f3f4f6/a1a1aa?text=Banner+Promo+1' 
    },
    { 
      id: 2, 
      title: 'Happy Hour Jumat', 
      type: 'Harga Spesial',
      value: 'Rp 15.000', 
      status: 'Non-Aktif',
      validity: 'Setiap Hari Jumat (14:00 - 17:00)',
      img: 'https://placehold.co/600x400/f3f4f6/a1a1aa?text=Banner+Promo+2'
    },
    { 
      id: 3, 
      title: 'Paket Mahasiswa', 
      type: 'Diskon',
      value: '10%', 
      status: 'Aktif',
      validity: 'Setiap Hari (Tunjukkan KTM)',
      img: 'https://placehold.co/600x400/f3f4f6/a1a1aa?text=Banner+Promo+3'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // --- States untuk Form Modal ---
  const [newPromoTitle, setNewPromoTitle] = useState('');
  const [newPromoType, setNewPromoType] = useState('Diskon'); 
  const [newPromoValue, setNewPromoValue] = useState('');
  const [newPromoValidity, setNewPromoValidity] = useState('');
  const [newPromoStatus, setNewPromoStatus] = useState('Aktif');

  // STATE BARU: Untuk melacak ID promo yang sedang diedit (null = mode Tambah Baru)
  const [editingPromoId, setEditingPromoId] = useState(null);

  // --- Fungsi-fungsi ---
  
  // Fungsi Buka Modal Tambah Baru
  const handleOpenAdd = () => {
    setEditingPromoId(null); // Set mode tambah
    setNewPromoTitle('');
    setNewPromoType('Diskon');
    setNewPromoValue('');
    setNewPromoValidity('');
    setNewPromoStatus('Aktif');
    setIsModalOpen(true);
  };

  // Fungsi Buka Modal Edit (Mengisi form dengan data lama)
  const handleOpenEdit = (promo) => {
    setEditingPromoId(promo.id); // Set mode edit dengan ID promo
    setNewPromoTitle(promo.title);
    setNewPromoType(promo.type);
    setNewPromoValue(promo.value);
    setNewPromoValidity(promo.validity === 'Setiap Hari' ? '' : promo.validity);
    setNewPromoStatus(promo.status);
    setIsModalOpen(true);
  };

  // Fungsi Simpan (Bisa untuk Tambah Baru ATAU Update Data)
  const handleSavePromo = (e) => {
    e.preventDefault();
    if (!newPromoTitle || !newPromoValue) return;

    if (editingPromoId) {
      // MODE EDIT: Perbarui data yang ID-nya cocok
      const updatedPromotions = promotions.map((promo) => 
        promo.id === editingPromoId 
          ? { 
              ...promo, 
              title: newPromoTitle, 
              type: newPromoType, 
              value: newPromoValue, 
              validity: newPromoValidity || 'Setiap Hari', 
              status: newPromoStatus 
            } 
          : promo
      );
      setPromotions(updatedPromotions);
    } else {
      // MODE TAMBAH: Buat data baru
      const newPromo = {
        id: promotions.length > 0 ? Math.max(...promotions.map(p => p.id)) + 1 : 1,
        title: newPromoTitle,
        type: newPromoType,
        value: newPromoValue,
        validity: newPromoValidity || 'Setiap Hari',
        status: newPromoStatus,
        img: 'https://placehold.co/600x400/f3f4f6/a1a1aa?text=New+Banner' 
      };
      setPromotions([newPromo, ...promotions]);
    }

    setIsModalOpen(false); 
    setEditingPromoId(null); // Bersihkan mode edit setelah selesai
  };

  const handleDelete = (id) => {
    setPromotions(promotions.filter(promo => promo.id !== id));
  };

  // Filter pencarian
  const filteredPromotions = promotions.filter(promo => 
    promo.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      
      {/* --- Toolbar Atas --- */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
        <h2 className="text-2xl font-black text-gray-800 tracking-tighter ml-2">Daftar Promosi</h2>
        
        <div className="flex w-full md:w-auto gap-4">
          <div className="relative flex-1 md:flex-initial">
            <input 
              type="text" 
              placeholder="Cari promosi..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-gray-200 rounded-xl px-5 py-3 pr-12 outline-none w-full md:w-64 focus:ring-1 focus:ring-bima-orange transition-all text-sm font-medium bg-gray-50/50" 
            />
            <Search className="absolute right-4 top-3.5 text-gray-400" size={18} />
          </div>

          <button 
            onClick={handleOpenAdd}
            className="bg-bima-orange text-white px-6 py-3 rounded-xl font-bold flex items-center gap-3 shadow-md hover:bg-[#e68a00] transition-all text-sm active:scale-95 whitespace-nowrap"
          >
            Promo Baru <span className="flex items-center justify-center w-5 h-5 border-2 border-white rounded-full text-[10px] font-black"><Plus size={14} /></span>
          </button>
        </div>
      </div>

      {/* --- GRID KARTU PROMOSI VERTIKAL --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredPromotions.length > 0 ? (
          filteredPromotions.map((promo) => (
            <div key={promo.id} className="bg-white rounded-[2rem] border border-gray-100 flex flex-col overflow-hidden hover:shadow-xl transition-all group h-full">
              
              <div className="w-full h-48 bg-gray-50 relative overflow-hidden border-b border-gray-100">
                <img src={promo.img} alt={promo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                
                <div className="absolute top-4 right-4">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase shadow-sm ${
                    promo.status === 'Aktif' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-400 text-white'
                  }`}>
                    {promo.status}
                  </span>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-black text-gray-800 tracking-tight leading-tight mb-2 line-clamp-2">
                  {promo.title}
                </h3>
                
                <p className="text-bima-orange font-black text-2xl tracking-tighter mb-4">
                  <span className="text-sm font-bold text-gray-400 block tracking-normal uppercase mb-0.5">{promo.type}</span>
                  {promo.value}
                </p>

                <div className="flex items-start gap-2.5 mt-auto mb-6 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <Calendar size={16} className="text-bima-orange mt-0.5 flex-shrink-0" />
                  <p className="text-xs font-bold text-gray-500 leading-snug">
                    <span className="block text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Masa Berlaku</span>
                    {promo.validity}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  {/* TOMBOL EDIT SEKARANG MEMANGGIL handleOpenEdit */}
                  <button 
                    onClick={() => handleOpenEdit(promo)}
                    className="text-gray-400 hover:text-bima-orange font-bold text-xs flex items-center gap-2 transition-colors px-2 py-1.5 rounded-lg hover:bg-orange-50"
                  >
                    <Edit2 size={16} /> Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(promo.id)}
                    className="text-gray-400 hover:text-red-500 font-bold text-xs flex items-center gap-2 transition-colors px-2 py-1.5 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 size={16} /> Hapus
                  </button>
                </div>
              </div>

            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-200 rounded-[2rem] bg-white">
            <p className="text-gray-400 font-medium">Promosi "{searchQuery}" tidak ditemukan.</p>
          </div>
        )}
      </div>

      {/* --- POP-UP MODAL (Berubah dinamis tergantung mode Edit/Tambah) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[3rem] p-10 w-full max-w-2xl shadow-2xl relative animate-in fade-in zoom-in-95 duration-300 max-h-[95vh] overflow-y-auto">
            
            <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-6 sticky top-0 bg-white z-10">
              {/* Judul Modal berubah dinamis */}
              <h3 className="text-3xl font-black text-gray-800 tracking-tighter">
                {editingPromoId ? 'Edit Promosi' : 'Tambah Promosi'}
              </h3>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingPromoId(null);
                }} 
                className="bg-gray-100 text-gray-400 p-2.5 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <X size={20} strokeWidth={3} />
              </button>
            </div>
            
            <form onSubmit={handleSavePromo} className="space-y-6">
              
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">Banner Promosi (Opsional)</label>
                <div className="border-2 border-dashed border-gray-200 rounded-3xl p-8 flex flex-col items-center justify-center text-gray-400 gap-3 cursor-pointer hover:border-bima-orange hover:text-bima-orange transition-colors bg-gray-50/50">
                  <div className="bg-white shadow-sm text-gray-400 p-3 rounded-full">
                    <ImagePlus size={24} />
                  </div>
                  <span className="text-sm font-bold">Upload Gambar Banner</span>
                  <span className="text-[11px] font-medium text-gray-400">Format: JPG, PNG. Rekomendasi 800x400px</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">Nama Promosi</label>
                <input
                  type="text"
                  required
                  value={newPromoTitle}
                  onChange={(e) => setNewPromoTitle(e.target.value)}
                  placeholder="Contoh: Diskon Kemerdekaan, Paket Hemat Akhir Bulan"
                  className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:border-bima-orange focus:ring-1 focus:ring-bima-orange text-sm font-medium transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3">Tipe Promosi</label>
                  <div className="relative">
                    <select
                      value={newPromoType}
                      onChange={(e) => setNewPromoType(e.target.value)}
                      className="w-full appearance-none px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:border-bima-orange focus:ring-1 focus:ring-bima-orange text-sm font-medium transition-all cursor-pointer bg-white"
                    >
                      <option value="Diskon">Diskon (Persentase / Potongan Harga)</option>
                      <option value="Harga Spesial">Harga Spesial (Harga Jadi)</option>
                    </select>
                    <ChevronDown className="absolute right-5 top-5 text-gray-400 pointer-events-none" size={18} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3">Nilai Promo</label>
                  <input
                    type="text"
                    required
                    value={newPromoValue}
                    onChange={(e) => setNewPromoValue(e.target.value)}
                    placeholder={newPromoType === 'Diskon' ? "Contoh: 20% atau Rp 10.000" : "Contoh: Rp 25.000"}
                    className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:border-bima-orange focus:ring-1 focus:ring-bima-orange text-sm font-medium transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3">Masa Berlaku (Jadwal)</label>
                  <input
                    type="text"
                    value={newPromoValidity}
                    onChange={(e) => setNewPromoValidity(e.target.value)}
                    placeholder="Contoh: Setiap Hari Jumat, s/d 30 April..."
                    className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:border-bima-orange focus:ring-1 focus:ring-bima-orange text-sm font-medium transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3">Status</label>
                  <div className="relative">
                    <select
                      value={newPromoStatus}
                      onChange={(e) => setNewPromoStatus(e.target.value)}
                      className="w-full appearance-none px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:border-bima-orange focus:ring-1 focus:ring-bima-orange text-sm font-medium transition-all cursor-pointer bg-white"
                    >
                      <option value="Aktif">Aktif</option>
                      <option value="Non-Aktif">Non-Aktif</option>
                    </select>
                    <ChevronDown className="absolute right-5 top-5 text-gray-400 pointer-events-none" size={18} />
                  </div>
                </div>
              </div>
              
              <div className="pt-6">
                <button
                  type="submit"
                  className="w-full bg-bima-orange text-white py-4.5 rounded-2xl font-black text-lg shadow-lg shadow-orange-100 hover:bg-[#e68a00] active:scale-[0.98] transition-all tracking-tight"
                >
                  {/* Teks Tombol berubah dinamis */}
                  {editingPromoId ? 'Update Promosi' : 'Simpan Promosi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromotionSection;