"use client";

import React, { useState } from 'react';
import { Search, PlusCircle, X, XCircle } from 'lucide-react';

const PackageSection = () => {
  // --- Data Dummy ---
  const [packages, setPackages] = useState([
    {
      id: 1,
      title: 'Classic Nusantara Bundle',
      items: ['Nasi Goreng Special', 'Regular Tea (Ice/Hot)'],
      price: '60.000',
    },
    {
      id: 2,
      title: 'Kids Bundle',
      items: ['Chicken Nugget', 'Any Milkshake'],
      price: '45.000',
    },
    {
      id: 3,
      title: 'Pizza Party',
      items: ['2 Pizza', '4 Soft Drinks'],
      price: '160.000',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackageId, setEditingPackageId] = useState(null);

  // --- States Form Modal ---
  const [newPackageName, setNewPackageName] = useState('');
  const [newPackagePrice, setNewPackagePrice] = useState('');
  const [selectedMenus, setSelectedMenus] = useState([]);
  const [menuSearchText, setMenuSearchText] = useState('');

  // --- Fungsi-fungsi ---
  const handleOpenAdd = () => {
    setEditingPackageId(null);
    setNewPackageName('');
    setNewPackagePrice('');
    setSelectedMenus([]);
    setMenuSearchText('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pkg) => {
    setEditingPackageId(pkg.id);
    setNewPackageName(pkg.title);
    setNewPackagePrice(pkg.price);
    setSelectedMenus([...pkg.items]); // Salin daftar menu
    setMenuSearchText('');
    setIsModalOpen(true);
  };

  const handleSavePackage = (e) => {
    e.preventDefault();
    if (!newPackageName || !newPackagePrice) return;

    if (editingPackageId) {
      // Update
      const updatedPackages = packages.map((pkg) =>
        pkg.id === editingPackageId
          ? { ...pkg, title: newPackageName, items: selectedMenus, price: newPackagePrice }
          : pkg
      );
      setPackages(updatedPackages);
    } else {
      // Add Baru
      const newPkg = {
        id: packages.length > 0 ? Math.max(...packages.map((p) => p.id)) + 1 : 1,
        title: newPackageName,
        items: selectedMenus.length > 0 ? selectedMenus : ['Custom Menu'],
        price: newPackagePrice,
      };
      setPackages([...packages, newPkg]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    setPackages(packages.filter((pkg) => pkg.id !== id));
  };

  // Simulasi menambah menu ke dalam list saat tekan Enter di kolom "Search Menu"
  const handleAddMenu = (e) => {
    if (e.key === 'Enter' && menuSearchText.trim() !== '') {
      e.preventDefault();
      setSelectedMenus([...selectedMenus, menuSearchText.trim()]);
      setMenuSearchText('');
    }
  };

  // Menghapus menu dari list yang sudah dipilih (chip)
  const handleRemoveMenu = (indexToRemove) => {
    setSelectedMenus(selectedMenus.filter((_, index) => index !== indexToRemove));
  };

  // Filter pencarian
  const filteredPackages = packages.filter((pkg) =>
    pkg.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* --- TOOLBAR ATAS --- */}
      <div className="flex justify-between items-center mb-6">
        {/* Tombol New Package */}
        <button
          onClick={handleOpenAdd}
          className="bg-[#F58A27] hover:bg-[#e07a1f] text-white px-6 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 w-64 shadow-sm transition-colors"
        >
          New Package <PlusCircle size={18} strokeWidth={2} />
        </button>

        {/* Kotak Pencarian */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-gray-300 rounded-lg pl-4 pr-10 py-2 w-72 focus:outline-none focus:border-gray-400 text-sm"
          />
          <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />
        </div>
      </div>

      {/* --- LIST DAFTAR PACKAGES --- */}
      <div className="flex flex-col gap-5">
        {filteredPackages.map((pkg) => (
          <div
            key={pkg.id}
            className="bg-white border border-gray-200 rounded-xl p-6 flex justify-between items-center"
          >
            {/* Sisi Kiri: Info Package */}
            <div>
              <h3 className="text-[17px] font-bold text-gray-900 mb-1">{pkg.title}</h3>
              <ul className="list-disc list-inside text-[#F58A27] text-sm font-medium space-y-0.5">
                {pkg.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              <p className="text-gray-400 text-sm font-medium mt-4">Rp {pkg.price}</p>
            </div>

            {/* Sisi Kanan: Tombol Aksi */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleOpenEdit(pkg)}
                className="border border-gray-300 text-gray-600 px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(pkg.id)}
                className="bg-[#F17878] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-red-500 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {filteredPackages.length === 0 && (
          <div className="py-10 text-center text-gray-400 font-medium">
            Tidak ada paket yang ditemukan.
          </div>
        )}
      </div>

      {/* --- PAGINATION (Statis sesuai gambar) --- */}
      <div className="flex justify-center items-center gap-2 pt-10 pb-4">
        <button className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded text-gray-500 hover:bg-gray-50">
          &lt;
        </button>
        <button className="w-8 h-8 flex items-center justify-center bg-[#F58A27] text-white rounded font-medium">
          1
        </button>
        <button className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded text-gray-500 hover:bg-gray-50">
          &gt;
        </button>
      </div>

      {/* --- POP-UP MODAL ADD / EDIT --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-[1.5rem] p-8 w-full max-w-md shadow-2xl relative">
            
            {/* Tombol Close Circle Orange */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-6 top-6 bg-[#F58A27] text-white p-1.5 rounded-full hover:bg-[#e07a1f] transition-colors"
            >
              <X size={18} strokeWidth={3} />
            </button>

            {/* Judul Modal */}
            <h2 className="text-xl font-bold text-gray-900 text-center mb-8 mt-2">
              {editingPackageId ? 'Edit Package' : 'Add New Package'}
            </h2>

            <form onSubmit={handleSavePackage} className="space-y-5">
              
              {/* Input Package Name */}
              <div>
                <label className="block text-[15px] font-bold text-gray-900 mb-2">
                  Package Name
                </label>
                <input
                  type="text"
                  required
                  value={newPackageName}
                  onChange={(e) => setNewPackageName(e.target.value)}
                  placeholder={editingPackageId ? "" : "e.g. Party Pack"}
                  className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#F58A27] text-sm ${editingPackageId ? 'bg-gray-50' : 'bg-white'}`}
                />
              </div>

              {/* Input Menu & Daftar Chip Menu */}
              <div>
                <label className="block text-[15px] font-bold text-gray-900 mb-2">
                  Menu
                </label>
                <div className="relative mb-2">
                  <input
                    type="text"
                    value={menuSearchText}
                    onChange={(e) => setMenuSearchText(e.target.value)}
                    onKeyDown={handleAddMenu} // Tekan Enter untuk menambah menu
                    placeholder="Search"
                    className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#F58A27] text-sm"
                  />
                  <Search className="absolute right-3 top-3 text-gray-500" size={16} />
                </div>

                {/* Chips Menu yang Dipilih */}
                <div className="flex flex-col gap-2">
                  {selectedMenus.map((menu, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center bg-[#FCE1C6] px-3 py-2 rounded-md text-sm text-gray-900 font-medium"
                    >
                      {menu}
                      <XCircle
                        size={16}
                        className="text-gray-500 cursor-pointer hover:text-gray-700"
                        onClick={() => handleRemoveMenu(index)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Input Price */}
              <div>
                <label className="block text-[15px] font-bold text-gray-900 mb-2">
                  Price
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white focus-within:border-[#F58A27]">
                  <span className="px-4 text-gray-600 text-sm border-r border-gray-300 bg-white">
                    Rp
                  </span>
                  <input
                    type="text"
                    required
                    value={newPackagePrice}
                    onChange={(e) => setNewPackagePrice(e.target.value)}
                    placeholder={editingPackageId ? "" : "e.g. 55000"}
                    className="w-full px-4 py-2.5 focus:outline-none text-sm"
                  />
                </div>
              </div>

              {/* Tombol Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#F58A27] hover:bg-[#e07a1f] text-white py-2.5 rounded-lg font-bold shadow-sm transition-colors text-[15px]"
                >
                  {editingPackageId ? 'Update' : 'Add'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackageSection;