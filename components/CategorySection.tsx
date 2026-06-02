"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type Category = {
  id: number;
  name: string;
  icon: string;
  types: string[];
  totalItems: number;
};

const categoryIcon = (name: string) => {
  if (/meat/i.test(name)) return "🥩";
  if (/poultry/i.test(name)) return "🐔";
  if (/vegetables/i.test(name)) return "🥦";
  if (/fruit/i.test(name)) return "🍓";
  if (/seafood/i.test(name)) return "🐟";
  if (/dry/i.test(name)) return "🧂";
  if (/bottle/i.test(name)) return "🍾";
  if (/pastry/i.test(name)) return "🥐";
  return "🍳";
};

const categoryTypes = (name: string) => {
  if (/fresh/i.test(name)) return ["Fresh Ingredients"];
  if (/dry/i.test(name)) return ["Dry Ingredients"];
  if (/bottle/i.test(name)) return ["Bottle/Can"];
  if (/pastry/i.test(name)) return ["Pastry"];
  return ["General"];
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function CategorySection() {
  const { token } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [formError, setFormError] = useState('');

  const openCreateModal = () => {
    setModalMode('create');
    setActiveCategory(null);
    setCategoryName('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setModalMode('edit');
    setActiveCategory(category);
    setCategoryName(category.name);
    setFormError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormError('');
    setActiveCategory(null);
  };

  const handleSaveCategory = async () => {
    const trimmedName = categoryName.trim();
    if (!trimmedName) {
      setFormError('Nama kategori harus diisi.');
      return;
    }
    if (!token) {
      setFormError('Token tidak tersedia. Silakan login ulang.');
      return;
    }

    try {
      const endpoint = modalMode === 'create'
        ? `${API_BASE}/api/kategori`
        : `${API_BASE}/api/kategori/${activeCategory?.id}`;
      const method = modalMode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: trimmedName }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Gagal menyimpan kategori.');
      }

      // after successful save, reload from server to keep UI consistent
      closeModal();
      await loadCategories();
    } catch (error: any) {
      console.error('Category save error:', error);
      setFormError(error.message || 'Terjadi kesalahan saat menyimpan kategori.');
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    const confirmed = window.confirm(`Hapus kategori "${category.name}"?`);
    if (!confirmed) return;
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE}/api/kategori/${category.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Gagal menghapus kategori.');
      // reload categories from server to ensure consistency
      await loadCategories();
    } catch (error: any) {
      console.error('Category delete error:', error);
      setFormError(error.message || 'Terjadi kesalahan saat menghapus kategori.');
    }
  };
  // extract loadCategories so other handlers can refresh UI from server
  const loadCategories = async () => {
    if (!token) return;

    try {
      const [categoryRes, menuRes] = await Promise.all([
        fetch(`${API_BASE}/api/kategori`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch(`${API_BASE}/api/menu`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
      ]);

      if (!categoryRes.ok) throw new Error('Gagal memuat kategori dari database.');
      if (!menuRes.ok) throw new Error('Gagal memuat menu dari database.');

      const categoryList = await categoryRes.json();
      const menuList = await menuRes.json();

      const counts = menuList.reduce((acc: Record<string, number>, item: any) => {
        const name = item?.category?.name || 'Unknown';
        acc[name] = (acc[name] || 0) + 1;
        return acc;
      }, {});

      setCategories(
        categoryList.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          icon: categoryIcon(cat.name),
          types: categoryTypes(cat.name),
          totalItems: counts[cat.name] || 0,
        }))
      );
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [token]);

  return (
    <section className="p-6 space-y-8 bg-gray-50 rounded-[2rem] shadow-sm border border-gray-100 mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-800">Category Dashboard</h2>
          <p className="text-sm text-gray-500 mt-1">Tampilkan kategori dan ringkasan item kategori.</p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-[#F58A27] text-white px-5 py-2.5 rounded-xl font-bold shadow-md hover:scale-105 transition"
        >
          <Plus size={18} /> Add Category
        </button>
      </div>

      {formError && !isModalOpen && (
        <p className="text-sm text-red-600 mb-4">{formError}</p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white rounded-[2.5rem] p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-black text-gray-800">{cat.name}</h3>
                <p className="text-xs text-gray-400">Total Items: {cat.totalItems}</p>
              </div>
              <span className="text-3xl">{cat.icon}</span>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {cat.types.map((type, i) => (
                <span
                  key={i}
                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                    type === "Fresh Ingredients"
                      ? "bg-orange-100 text-orange-600"
                      : type === "Dry Ingredients"
                      ? "bg-yellow-100 text-yellow-600"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {type}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-gray-50 p-3 rounded-xl">
                <p className="text-xs text-gray-400">Low Stock</p>
                <h4 className="text-lg font-bold text-red-500">5</h4>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl">
                <p className="text-xs text-gray-400">Available</p>
                <h4 className="text-lg font-bold text-green-500">{cat.totalItems}</h4>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => openEditModal(cat)}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
                aria-label={`Edit kategori ${cat.name}`}
              >
                <Pencil size={18} />
              </button>
              <button
                onClick={() => handleDeleteCategory(cat)}
                className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition"
                aria-label={`Hapus kategori ${cat.name}`}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {modalMode === 'create' ? 'Add Category' : 'Edit Category'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {modalMode === 'create'
                    ? 'Tambahkan kategori baru ke dashboard.'
                    : `Perbarui nama kategori ${activeCategory?.name}.`}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-900 rounded-full p-2"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <label className="block text-sm font-bold text-gray-700 mb-2">Category Name</label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              placeholder="e.g. Fresh Ingredients"
            />
            {formError && <p className="text-sm text-red-600 mt-3">{formError}</p>}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full border border-gray-200 px-5 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCategory}
                className="rounded-full bg-[#F58A27] px-5 py-3 text-sm font-bold text-white hover:bg-[#db7a1f] transition"
              >
                {modalMode === 'create' ? 'Add Category' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
