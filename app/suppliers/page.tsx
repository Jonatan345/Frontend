"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
import { Plus, Search, Truck, Phone, Mail, MapPin, User, X, Pencil, ChevronLeft, Trash2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Supplier {
  id: number;
  name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  category: string;
  status: "active" | "inactive";
  created_at: string;
  total_transactions: number;
  total_value: number;
}

interface Transaction {
  id: number;
  supplier_id: number;
  supplier_name: string;
  type: "purchase" | "stock_in";
  item_name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_price: number;
  date: string;
  notes: string;
  status: "completed" | "pending" | "cancelled";
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_SUPPLIERS: Supplier[] = [
  {
    id: 1,
    name: "PT Sumber Makmur",
    contact_person: "Budi Santoso",
    phone: "0812-3456-7890",
    email: "budi@sumbermakmur.co.id",
    address: "Jl. Pasar Baru No. 12, Jakarta",
    category: "Sayuran & Buah",
    status: "active",
    created_at: "2025-01-15",
    total_transactions: 45,
    total_value: 18500000,
  },
  {
    id: 2,
    name: "CV Berkah Abadi",
    contact_person: "Siti Rahayu",
    phone: "0856-9876-5432",
    email: "siti@berkah.com",
    address: "Jl. Industri Raya No. 88, Bekasi",
    category: "Daging & Seafood",
    status: "active",
    created_at: "2025-02-20",
    total_transactions: 32,
    total_value: 42300000,
  },
  {
    id: 3,
    name: "UD Mitra Sejati",
    contact_person: "Ahmad Fauzi",
    phone: "0878-1234-5678",
    email: "ahmad@mitrasejati.id",
    address: "Jl. Raya Bogor Km.25, Depok",
    category: "Bumbu & Rempah",
    status: "inactive",
    created_at: "2024-11-10",
    total_transactions: 18,
    total_value: 7650000,
  },
  {
    id: 4,
    name: "PT Kemasan Prima",
    contact_person: "Dewi Lestari",
    phone: "0821-5555-6666",
    email: "dewi@kemasanprima.co.id",
    address: "Kawasan MM2100 Blok A-5, Cikarang",
    category: "Kemasan & Alat",
    status: "active",
    created_at: "2025-03-05",
    total_transactions: 27,
    total_value: 9200000,
  },
];

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 1,
    supplier_id: 1,
    supplier_name: "PT Sumber Makmur",
    type: "purchase",
    item_name: "Bawang Merah",
    quantity: 50,
    unit: "kg",
    unit_price: 28000,
    total_price: 1400000,
    date: "2026-04-20",
    notes: "Pengiriman rutin mingguan",
    status: "completed",
  },
  {
    id: 2,
    supplier_id: 2,
    supplier_name: "CV Berkah Abadi",
    type: "stock_in",
    item_name: "Daging Sapi Segar",
    quantity: 30,
    unit: "kg",
    unit_price: 135000,
    total_price: 4050000,
    date: "2026-04-20",
    notes: "",
    status: "completed",
  },
  {
    id: 3,
    supplier_id: 1,
    supplier_name: "PT Sumber Makmur",
    type: "purchase",
    item_name: "Tomat Segar",
    quantity: 40,
    unit: "kg",
    unit_price: 12000,
    total_price: 480000,
    date: "2026-04-18",
    notes: "Grade A",
    status: "completed",
  },
  {
    id: 4,
    supplier_id: 4,
    supplier_name: "PT Kemasan Prima",
    type: "stock_in",
    item_name: "Box Kemasan Ukuran M",
    quantity: 500,
    unit: "pcs",
    unit_price: 2500,
    total_price: 1250000,
    date: "2026-04-17",
    notes: "Restock bulanan",
    status: "pending",
  },
  {
    id: 5,
    supplier_id: 2,
    supplier_name: "CV Berkah Abadi",
    type: "purchase",
    item_name: "Udang Vaname",
    quantity: 20,
    unit: "kg",
    unit_price: 98000,
    total_price: 1960000,
    date: "2026-04-15",
    notes: "",
    status: "completed",
  },
  {
    id: 6,
    supplier_id: 3,
    supplier_name: "UD Mitra Sejati",
    type: "stock_in",
    item_name: "Kemiri Sangrai",
    quantity: 15,
    unit: "kg",
    unit_price: 55000,
    total_price: 825000,
    date: "2026-04-10",
    notes: "Stok habis mendadak",
    status: "cancelled",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatRupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

const CATEGORY_COLORS: Record<string, string> = {
  "Sayuran & Buah": "bg-green-100 text-green-700",
  "Daging & Seafood": "bg-red-100 text-red-700",
  "Bumbu & Rempah": "bg-yellow-100 text-yellow-700",
  "Kemasan & Alat": "bg-blue-100 text-blue-700",
};

const TX_STATUS_STYLES: Record<string, string> = {
  completed: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  cancelled: "bg-red-100 text-red-700",
};

const TX_STATUS_LABEL: Record<string, string> = {
  completed: "Selesai",
  pending: "Proses",
  cancelled: "Dibatalkan",
};

const CATEGORIES = [
  "Sayuran & Buah",
  "Daging & Seafood",
  "Bumbu & Rempah",
  "Kemasan & Alat",
  "Minuman",
  "Lainnya",
];

// ─── Add/Edit Modal ───────────────────────────────────────────────────────────
function SupplierModal({
  supplier,
  onClose,
  onSave,
}: {
  supplier: Supplier | null;
  onClose: () => void;
  onSave: (data: Partial<Supplier>) => void;
}) {
  const [form, setForm] = useState({
    name: supplier?.name ?? "",
    contact_person: supplier?.contact_person ?? "",
    phone: supplier?.phone ?? "",
    email: supplier?.email ?? "",
    address: supplier?.address ?? "",
    category: supplier?.category ?? "Sayuran & Buah",
    status: supplier?.status ?? "active",
  });

  const fields: { label: string; key: keyof typeof form; placeholder: string }[] = [
    { label: "Nama Perusahaan", key: "name", placeholder: "PT / CV / UD ..." },
    { label: "Nama Kontak (PIC)", key: "contact_person", placeholder: "Nama penanggung jawab" },
    { label: "No. Telepon", key: "phone", placeholder: "08xx-xxxx-xxxx" },
    { label: "Email", key: "email", placeholder: "email@perusahaan.com" },
    { label: "Alamat", key: "address", placeholder: "Jl. ..." },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-gray-800 font-bold text-lg">
              {supplier ? "Edit Supplier" : "Tambah Supplier Baru"}
            </h2>
            <p className="text-gray-400 text-sm mt-0.5">Lengkapi informasi supplier</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {fields.map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="block text-gray-600 text-sm font-semibold mb-1.5">{label}</label>
              <input
                value={form[key] as string}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 text-sm placeholder:text-gray-300 focus:outline-none focus:border-[#F58A27] focus:ring-2 focus:ring-[#F58A27]/20 transition-all"
              />
            </div>
          ))}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-600 text-sm font-semibold mb-1.5">Kategori</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-[#F58A27] focus:ring-2 focus:ring-[#F58A27]/20 transition-all"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-600 text-sm font-semibold mb-1.5">Status</label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({ ...f, status: e.target.value as "active" | "inactive" }))
                }
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-[#F58A27] focus:ring-2 focus:ring-[#F58A27]/20 transition-all"
              >
                <option value="active">Aktif</option>
                <option value="inactive">Tidak Aktif</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100 transition-all"
          >
            Batal
          </button>
          <button
            onClick={() => { onSave(form); onClose(); }}
            className="px-5 py-2 rounded-xl text-sm font-bold bg-[#F58A27] hover:bg-[#e07d1e] text-white transition-all shadow-sm"
          >
            {supplier ? "Simpan Perubahan" : "Tambah Supplier"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────
function SupplierDetail({
  supplier,
  transactions,
  onEdit,
  onClose,
}: {
  supplier: Supplier;
  transactions: Transaction[];
  onEdit: () => void;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"info" | "transactions">("info");
  const supplierTxs = transactions.filter((t) => t.supplier_id === supplier.id);

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-100">
      {/* Panel Header */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onClose}
            className="flex items-center gap-1 text-gray-400 hover:text-gray-600 text-sm transition-colors"
          >
            <ChevronLeft size={16} /> Kembali
          </button>
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 text-sm font-semibold text-[#F58A27] hover:bg-[#FFF4EA] px-3 py-1.5 rounded-lg transition-all"
          >
            <Pencil size={14} /> Edit
          </button>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF4EA] flex items-center justify-center">
            <Truck size={22} className="text-[#F58A27]" />
          </div>
          <div>
            <h3 className="text-gray-800 font-bold text-base leading-tight">{supplier.name}</h3>
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                supplier.status === "active"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {supplier.status === "active" ? "Aktif" : "Tidak Aktif"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-gray-400 text-xs mb-1">Total Transaksi</p>
            <p className="text-gray-800 font-bold text-xl">{supplier.total_transactions}x</p>
          </div>
          <div className="bg-[#FFF4EA] rounded-xl p-3">
            <p className="text-[#F58A27]/70 text-xs mb-1">Total Nilai</p>
            <p className="text-[#F58A27] font-bold text-sm leading-tight">
              {formatRupiah(supplier.total_value)}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        {(["info", "transactions"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-bold transition-all ${
              activeTab === tab
                ? "text-[#F58A27] border-b-2 border-[#F58A27]"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab === "info" ? "Kontak" : "Riwayat Transaksi"}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {activeTab === "info" ? (
          <div className="space-y-4">
            {[
              { icon: <User size={15} />, label: "PIC", value: supplier.contact_person },
              { icon: <Phone size={15} />, label: "Telepon", value: supplier.phone },
              { icon: <Mail size={15} />, label: "Email", value: supplier.email },
              { icon: <MapPin size={15} />, label: "Alamat", value: supplier.address },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex gap-3">
                <div className="mt-0.5 text-[#F58A27]">{icon}</div>
                <div>
                  <p className="text-gray-400 text-xs">{label}</p>
                  <p className="text-gray-700 text-sm mt-0.5 font-medium">{value}</p>
                </div>
              </div>
            ))}
            <div className="flex gap-3">
              <div className="mt-0.5 text-[#F58A27]">
                <Truck size={15} />
              </div>
              <div>
                <p className="text-gray-400 text-xs">Kategori</p>
                <span
                  className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full mt-1 ${
                    CATEGORY_COLORS[supplier.category] ?? "bg-gray-100 text-gray-600"
                  }`}
                >
                  {supplier.category}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {supplierTxs.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">
                Belum ada transaksi
              </div>
            ) : (
              supplierTxs.map((tx) => (
                <div
                  key={tx.id}
                  className="border border-gray-100 rounded-xl p-3.5 hover:border-[#F58A27]/30 hover:bg-[#FFF4EA]/30 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex gap-2">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          tx.type === "purchase"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {tx.type === "purchase" ? "Pembelian" : "Stok Masuk"}
                      </span>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TX_STATUS_STYLES[tx.status]}`}
                      >
                        {TX_STATUS_LABEL[tx.status]}
                      </span>
                    </div>
                    <span className="text-gray-400 text-xs">
                      {new Date(tx.date).toLocaleDateString("id-ID")}
                    </span>
                  </div>
                  <p className="text-gray-800 text-sm font-semibold">{tx.item_name}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <p className="text-gray-400 text-xs">
                      {tx.quantity} {tx.unit} × {formatRupiah(tx.unit_price)}
                    </p>
                    <p className="text-[#F58A27] text-sm font-bold">
                      {formatRupiah(tx.total_price)}
                    </p>
                  </div>
                  {tx.notes && (
                    <p className="text-gray-400 text-xs mt-1.5 italic">"{tx.notes}"</p>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SuppliersPage() {
  const { token } = useAuth();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [transactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [activeTab, setActiveTab] = useState<"suppliers" | "transactions">("suppliers");
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [modalSupplier, setModalSupplier] = useState<Supplier | null | "new">(null);
  const [txSearch, setTxSearch] = useState("");
  const [txTypeFilter, setTxTypeFilter] = useState<"all" | "purchase" | "stock_in">("all");

  const filteredSuppliers = suppliers.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.contact_person.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || s.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const filteredTransactions = transactions.filter((t) => {
    const matchSearch =
      t.item_name.toLowerCase().includes(txSearch.toLowerCase()) ||
      t.supplier_name.toLowerCase().includes(txSearch.toLowerCase());
    const matchType = txTypeFilter === "all" || t.type === txTypeFilter;
    return matchSearch && matchType;
  });

  const handleSaveSupplier = (data: Partial<Supplier>) => {
    // persist to server then reload
    (async () => {
      try {
        if (!token) throw new Error('Not authenticated');
        if (modalSupplier === 'new') {
          const res = await fetch(`${API_BASE}/api/supplier`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: data.name,
              companyName: data.contact_person ?? data.name,
              category: data.category,
              phone: data.phone,
              email: data.email,
              address: data.address,
              city: '',
              status: data.status ?? 'Aktif',
            }),
          });
          if (!res.ok) throw new Error('Gagal menambah supplier');
        } else if (modalSupplier && typeof modalSupplier !== 'string') {
          const id = modalSupplier.id;
          const res = await fetch(`${API_BASE}/api/supplier/${id}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: data.name,
              companyName: data.contact_person ?? data.name,
              category: data.category,
              phone: data.phone,
              email: data.email,
              address: data.address,
              city: '',
              status: data.status ?? 'Aktif',
            }),
          });
          if (!res.ok) throw new Error('Gagal memperbarui supplier');
        }
        await loadSuppliers();
      } catch (e: any) {
        console.error('Save supplier error:', e);
      }
    })();
  };

  // load suppliers from server
  const loadSuppliers = async () => {
    try {
      if (!token) return;
      const res = await fetch(`${API_BASE}/api/supplier`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Gagal memuat supplier');
      const data = await res.json();
      // map server fields to frontend Supplier type
      setSuppliers(data.map((s: any) => ({
        id: s.id,
        name: s.name,
        contact_person: s.companyName || '',
        phone: s.phone || '',
        email: s.email || '',
        address: s.address || '',
        category: s.category || 'Lainnya',
        status: s.status === 'Aktif' || s.status === 'active' ? 'active' : 'inactive',
        created_at: s.createdAt ? new Date(s.createdAt).toISOString().split('T')[0] : '',
        total_transactions: s._count?.transactions || 0,
        total_value: 0,
      })));
    } catch (e) {
      console.error('Load suppliers error:', e);
    }
  };

  useEffect(() => { loadSuppliers(); }, [token]);

  const handleDeleteSupplier = async (id: number) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/supplier/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Gagal menghapus supplier');
      await loadSuppliers();
    } catch (e) { console.error(e); }
  };

  const totalActive = suppliers.filter((s) => s.status === "active").length;
  const totalValue = suppliers.reduce((sum, s) => sum + s.total_value, 0);
  const totalTx = suppliers.reduce((sum, s) => sum + s.total_transactions, 0);

  return (
    <div className="flex h-full overflow-hidden">
        <div className="flex-1 flex overflow-hidden">
          {/* ── Main Content ── */}
          <div className="flex-1 flex flex-col overflow-hidden">

            {/* Page Header */}
            <div className="bg-white border-b border-gray-100 px-8 py-6 flex-shrink-0">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-gray-800 text-2xl font-black tracking-tight">
                    Manajemen Supplier
                  </h1>
                  <p className="text-gray-400 text-sm mt-1">
                    Kelola data pemasok dan riwayat transaksi
                  </p>
                </div>
                <button
                  onClick={() => setModalSupplier("new")}
                  className="flex items-center gap-2 bg-[#F58A27] hover:bg-[#e07d1e] text-white text-sm font-bold px-4 py-2.5 rounded-2xl transition-all shadow-sm active:scale-95"
                >
                  <Plus size={16} />
                  Tambah Supplier
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Total Supplier", value: suppliers.length, sub: "terdaftar", color: "text-gray-800" },
                  { label: "Aktif", value: totalActive, sub: "supplier", color: "text-green-600" },
                  { label: "Total Transaksi", value: `${totalTx}x`, sub: "semua waktu", color: "text-[#F58A27]" },
                  { label: "Total Nilai", value: formatRupiah(totalValue), sub: "semua pembelian", color: "text-[#F58A27]" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                    <p className="text-gray-400 text-xs font-medium mb-1">{stat.label}</p>
                    <p className={`font-black text-xl ${stat.color}`}>{stat.value}</p>
                    <p className="text-gray-300 text-xs mt-0.5">{stat.sub}</p>
                  </div>
                ))}
              </div>

              {/* Tabs */}
              <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 w-fit">
                {(["suppliers", "transactions"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                      activeTab === tab
                        ? "bg-white text-gray-800 shadow-sm"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {tab === "suppliers" ? "Data Supplier" : "Riwayat Transaksi"}
                  </button>
                ))}
              </div>
            </div>

            {/* ── SUPPLIERS TAB ── */}
            {activeTab === "suppliers" && (
              <div className="flex-1 overflow-y-auto p-8">
                {/* Search & Filter */}
                <div className="flex gap-3 mb-6">
                  <div className="flex-1 relative">
                    <Search
                      size={16}
                      className="text-gray-300 absolute left-3.5 top-1/2 -translate-y-1/2"
                    />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Cari supplier atau kontak..."
                      className="w-full bg-white border border-gray-200 rounded-2xl pl-10 pr-4 py-2.5 text-gray-800 text-sm placeholder:text-gray-300 focus:outline-none focus:border-[#F58A27] focus:ring-2 focus:ring-[#F58A27]/20 transition-all"
                    />
                  </div>
                  <div className="flex gap-2">
                    {(["all", "active", "inactive"] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setFilterStatus(s)}
                        className={`px-4 py-2.5 rounded-2xl text-sm font-bold transition-all ${
                          filterStatus === s
                            ? "bg-[#F58A27] text-white shadow-sm"
                            : "bg-white border border-gray-200 text-gray-400 hover:text-gray-600"
                        }`}
                      >
                        {s === "all" ? "Semua" : s === "active" ? "Aktif" : "Nonaktif"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Card Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredSuppliers.map((supplier) => (
                    <div
                      key={supplier.id}
                      onClick={() => setSelectedSupplier(supplier)}
                      className={`bg-white border rounded-2xl p-5 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md group ${
                        selectedSupplier?.id === supplier.id
                          ? "border-[#F58A27] shadow-md shadow-[#F58A27]/10"
                          : "border-gray-100 hover:border-[#F58A27]/40"
                      }`}
                    >
                      {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-2xl bg-[#FFF4EA] flex items-center justify-center">
                            <Truck size={18} className="text-[#F58A27]" />
                          </div>
                          <div>
                            <h3 className="text-gray-800 font-bold text-sm leading-tight">
                              {supplier.name}
                            </h3>
                            <p className="text-gray-400 text-xs mt-0.5">{supplier.contact_person}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                              supplier.status === "active"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {supplier.status === "active" ? "Aktif" : "Tidak Aktif"}
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); setModalSupplier(supplier); }}
                              className="p-2 rounded-lg text-sm text-[#F58A27] hover:bg-[#FFF4EA]"
                              aria-label={`Edit ${supplier.name}`}
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteSupplier(supplier.id); }}
                              className="p-2 rounded-lg text-sm text-red-500 hover:bg-red-50"
                              aria-label={`Hapus ${supplier.name}`}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Category */}
                      <span
                        className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-3 ${
                          CATEGORY_COLORS[supplier.category] ?? "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {supplier.category}
                      </span>

                      {/* Contact */}
                      <div className="space-y-1.5 mb-4">
                        <div className="flex items-center gap-2 text-gray-400 text-xs">
                          <Phone size={12} className="flex-shrink-0" />
                          {supplier.phone}
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 text-xs truncate">
                          <Mail size={12} className="flex-shrink-0" />
                          <span className="truncate">{supplier.email}</span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-50">
                        <div>
                          <p className="text-gray-300 text-xs">Transaksi</p>
                          <p className="text-gray-700 text-sm font-bold">{supplier.total_transactions}x</p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-300 text-xs">Total Nilai</p>
                          <p className="text-[#F58A27] text-sm font-bold">
                            {formatRupiah(supplier.total_value)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredSuppliers.length === 0 && (
                    <div className="col-span-3 text-center py-16 text-gray-300 text-sm">
                      <Truck size={40} className="mx-auto mb-3 opacity-30" />
                      Tidak ada supplier ditemukan
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── TRANSACTIONS TAB ── */}
            {activeTab === "transactions" && (
              <div className="flex-1 overflow-y-auto p-8">
                {/* Filters */}
                <div className="flex gap-3 mb-6">
                  <div className="flex-1 relative">
                    <Search
                      size={16}
                      className="text-gray-300 absolute left-3.5 top-1/2 -translate-y-1/2"
                    />
                    <input
                      value={txSearch}
                      onChange={(e) => setTxSearch(e.target.value)}
                      placeholder="Cari item atau supplier..."
                      className="w-full bg-white border border-gray-200 rounded-2xl pl-10 pr-4 py-2.5 text-gray-800 text-sm placeholder:text-gray-300 focus:outline-none focus:border-[#F58A27] focus:ring-2 focus:ring-[#F58A27]/20 transition-all"
                    />
                  </div>
                  <div className="flex gap-2">
                    {(["all", "purchase", "stock_in"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTxTypeFilter(t)}
                        className={`px-4 py-2.5 rounded-2xl text-sm font-bold transition-all ${
                          txTypeFilter === t
                            ? "bg-[#F58A27] text-white shadow-sm"
                            : "bg-white border border-gray-200 text-gray-400 hover:text-gray-600"
                        }`}
                      >
                        {t === "all" ? "Semua" : t === "purchase" ? "Pembelian" : "Stok Masuk"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Table */}
                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        {["Tanggal", "Supplier", "Item", "Tipe", "Qty", "Total", "Status"].map((h) => (
                          <th
                            key={h}
                            className="text-left text-gray-400 text-xs font-bold px-5 py-3.5 uppercase tracking-wide"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map((tx) => (
                        <tr
                          key={tx.id}
                          className="border-b border-gray-50 hover:bg-[#FFF4EA]/30 transition-colors"
                        >
                          <td className="px-5 py-3.5 text-gray-500 text-sm">
                            {new Date(tx.date).toLocaleDateString("id-ID")}
                          </td>
                          <td className="px-5 py-3.5 text-gray-800 text-sm font-semibold">
                            {tx.supplier_name}
                          </td>
                          <td className="px-5 py-3.5 text-gray-600 text-sm">{tx.item_name}</td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                tx.type === "purchase"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-purple-100 text-purple-700"
                              }`}
                            >
                              {tx.type === "purchase" ? "Pembelian" : "Stok Masuk"}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-gray-500 text-sm">
                            {tx.quantity} {tx.unit}
                          </td>
                          <td className="px-5 py-3.5 text-[#F58A27] text-sm font-bold">
                            {formatRupiah(tx.total_price)}
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${TX_STATUS_STYLES[tx.status]}`}
                            >
                              {TX_STATUS_LABEL[tx.status]}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredTransactions.length === 0 && (
                    <div className="text-center py-12 text-gray-300 text-sm">
                      Tidak ada transaksi ditemukan
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Detail Side Panel ── */}
          {selectedSupplier && (
            <div className="w-80 flex-shrink-0 overflow-hidden flex flex-col">
              <SupplierDetail
                supplier={selectedSupplier}
                transactions={transactions}
                onEdit={() => setModalSupplier(selectedSupplier)}
                onClose={() => setSelectedSupplier(null)}
              />
            </div>
          )}
        </div>

        {/* Modal */}
        {modalSupplier !== null && (
          <SupplierModal
            supplier={modalSupplier === "new" ? null : modalSupplier}
            onClose={() => setModalSupplier(null)}
            onSave={handleSaveSupplier}
          />
        )}
      </div>
  );
}