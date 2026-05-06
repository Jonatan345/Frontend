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

  useEffect(() => {
    const loadCategories = async () => {
      if (!token) return;

      try {
        const [categoryRes, menuRes] = await Promise.all([
          fetch(`${API_BASE}/api/kategori`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }),
          fetch(`${API_BASE}/api/menu`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }),
        ]);

        if (!categoryRes.ok) throw new Error("Gagal memuat kategori dari database.");
        if (!menuRes.ok) throw new Error("Gagal memuat menu dari database.");

        const categoryList = await categoryRes.json();
        const menuList = await menuRes.json();

        const counts = menuList.reduce((acc: Record<string, number>, item: any) => {
          const name = item?.category?.name || "Unknown";
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
        console.error("Error loading categories:", error);
      }
    };

    loadCategories();
  }, [token]);

  return (
    <section className="p-6 space-y-8 bg-gray-50 rounded-[2rem] shadow-sm border border-gray-100 mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-800">Category Dashboard</h2>
          <p className="text-sm text-gray-500 mt-1">Tampilkan kategori dan ringkasan item kategori.</p>
        </div>

        <button className="flex items-center gap-2 bg-[#F58A27] text-white px-5 py-2.5 rounded-xl font-bold shadow-md hover:scale-105 transition">
          <Plus size={18} /> Add Category
        </button>
      </div>

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
              <button className="p-2 rounded-lg hover:bg-gray-100 transition">
                <Pencil size={18} />
              </button>
              <button className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
