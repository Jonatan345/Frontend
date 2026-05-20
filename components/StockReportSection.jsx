"use client";

import React, { useState, useEffect } from 'react';
import { Search, Download, Filter, ArrowUpRight, ArrowDownRight, Activity, ChevronDown, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const StockReportSection = () => {
  const { token } = useAuth();
  const [stockLogs, setStockLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('Semua');
  const [timeFilter, setTimeFilter] = useState('Semua');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // --- Helper: Format timestamp -> "YYYY-MM-DD HH:MM" ---
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  // --- Helper: Tentukan satuan qty berdasarkan kategori ---
  const getQtyUnit = (category) => {
    if (/bottle|minuman/i.test(category)) return 'Liter';
    return 'Kg';
  };

  // --- Fetch Data dari API ---
  useEffect(() => {
    const loadMovements = async () => {
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE}/api/inventory/movements`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || 'Gagal memuat inventory movements dari database.');
        }

        const data = await res.json();
        if (!Array.isArray(data)) {
          console.error('Unexpected API response for inventory movements:', data);
          throw new Error('Response inventory movements tidak valid dari server.');
        }

        setStockLogs(data.map((movement) => ({
          id: movement.id,
          date: formatDate(movement.createdAt),
          item: movement.menuItem?.name || 'Unknown',
          qty: `${Math.abs(movement.quantityChange)} ${getQtyUnit(movement.menuItem?.category?.name || '')}`,
          type: movement.quantityChange >= 0 ? 'Masuk' : 'Keluar',
          note: movement.reason || '',
        })));
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Gagal memuat data inventory movements.');
      } finally {
        setLoading(false);
      }
    };

    loadMovements();
  }, [token]);

  // --- Helper: Tanggal relatif (untuk "Aktivitas Hari Ini") ---
  const getDynamicDate = (daysAgo) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // --- Helper: Get date string "YYYY-MM-DD" from a Date object ---
  const toDateString = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // --- Logika Search & Filter ---
  const filteredLogs = stockLogs.filter((log) => {
    const matchesSearch =
      log.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.note.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === 'Semua' || log.type === filterType;

    let matchesTime = true;
    if (timeFilter !== 'Semua') {
      const logDateString = log.date.split(' ')[0];
      const logDateObj = new Date(logDateString);
      logDateObj.setHours(0, 0, 0, 0);

      const todayObj = new Date();
      todayObj.setHours(0, 0, 0, 0);

      if (timeFilter === 'Hari Ini') {
        // Exact match with today
        matchesTime = logDateObj.getTime() === todayObj.getTime();

      } else if (timeFilter === '7 Hari') {
        // Rolling last 7 days (today inclusive), avoids getDay() locale issues
        const sevenDaysAgo = new Date(todayObj);
        sevenDaysAgo.setDate(todayObj.getDate() - 6);
        matchesTime = logDateObj >= sevenDaysAgo && logDateObj <= todayObj;

      } else if (timeFilter === '30 Hari') {
        // Same calendar month + year as today
        matchesTime =
          logDateObj.getMonth() === todayObj.getMonth() &&
          logDateObj.getFullYear() === todayObj.getFullYear();

      } else if (timeFilter === 'Spesifik') {
        const isAfterStart = startDate ? logDateString >= startDate : true;
        const isBeforeEnd = endDate ? logDateString <= endDate : true;
        matchesTime = isAfterStart && isBeforeEnd;
      }
    }

    return matchesSearch && matchesType && matchesTime;
  });

  // --- Logika Grafik Dinamis (7 Hari Terakhir) ---
  const graphData = (() => {
    const days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = toDateString(d);

      days.push({
        date: dateStr,
        label: d.toLocaleDateString('id-ID', { weekday: 'short' }),
        total: 0,
      });
    }

    filteredLogs.forEach(log => {
      const logDate = log.date.split(' ')[0];
      const dayIndex = days.findIndex(d => d.date === logDate);
      if (dayIndex !== -1) {
        const numericValue = parseInt(log.qty.replace(/[^0-9]/g, '')) || 0;
        days[dayIndex].total += numericValue;
      }
    });

    const maxTotal = Math.max(...days.map(d => d.total));
    const safeMax = maxTotal === 0 ? 1 : maxTotal;

    return days.map(d => ({
      ...d,
      heightPercent: (d.total / safeMax) * 100,
    }));
  })();

  // --- Fungsi Export CSV ---
  const handleExportCSV = () => {
    const headers = ["Tanggal & Waktu", "Nama Bahan", "Kuantitas", "Tipe", "Catatan"];
    const csvRows = [headers.join(',')];

    filteredLogs.forEach(log => {
      const row = [
        `"${log.date}"`,
        `"${log.item}"`,
        `"${log.qty}"`,
        `"${log.type}"`,
        `"${log.note}"`,
      ];
      csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Laporan_Stok_Bima_Resto_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* --- Header & Toolbar --- */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 border-b border-gray-100 pb-6">
        <h2 className="text-3xl font-black text-gray-800 tracking-tighter shrink-0">Stock Reports</h2>

        <div className="flex flex-wrap items-center gap-3">

          {/* Dropdown Waktu */}
          <div className="relative">
            <select
              value={timeFilter}
              onChange={(e) => {
                setTimeFilter(e.target.value);
                if (e.target.value !== 'Spesifik') {
                  setStartDate('');
                  setEndDate('');
                }
              }}
              className="appearance-none flex items-center gap-2 bg-white border border-gray-200 pl-10 pr-8 py-2.5 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-50 transition-all outline-none cursor-pointer h-[42px]"
            >
              <option value="Semua">Semua</option>
              <option value="Hari Ini">Hari Ini</option>
              <option value="7 Hari">Minggu ini</option>
              <option value="30 Hari">Bulan ini</option>
              <option value="Spesifik">Pilih Tanggal...</option>
            </select>
            <Calendar size={16} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
            <ChevronDown size={16} className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
          </div>

          {/* Input Rentang Tanggal (Hanya muncul jika pilih "Pilih Tanggal...") */}
          {timeFilter === 'Spesifik' && (
            <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border border-gray-200 h-[42px]">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                title="Dari Tanggal"
                className="bg-transparent px-2 text-xs font-bold text-gray-600 outline-none cursor-pointer"
              />
              <span className="text-gray-400 font-bold text-xs">ke</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                title="Sampai Tanggal"
                className="bg-transparent px-2 text-xs font-bold text-gray-600 outline-none cursor-pointer"
              />
            </div>
          )}

          {/* Dropdown Tipe (Masuk/Keluar) */}
          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="appearance-none flex items-center gap-2 bg-white border border-gray-200 pl-10 pr-8 py-2.5 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-50 transition-all outline-none cursor-pointer h-[42px]"
            >
              <option value="Semua">Semua</option>
              <option value="Masuk">Bahan Masuk</option>
              <option value="Keluar">Bahan Keluar</option>
            </select>
            <Filter size={16} className="absolute left-3 top-3.5 text-gray-400 pointer-events-none" />
            <ChevronDown size={16} className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
          </div>

          {/* Tombol Export CSV */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-[#107C41] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-[#0c6334] transition-all active:scale-95 h-[42px]"
          >
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>

      {/* --- Ringkasan Statistik --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
          <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Total Bahan Keluar</p>
          <div className="flex items-center justify-between">
            <h4 className="text-2xl font-black text-gray-800 tracking-tighter">
              {filteredLogs.filter(l => l.type === 'Keluar').length} Items
            </h4>
            <div className="bg-red-50 p-2 rounded-full text-red-500"><ArrowUpRight size={20} /></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
          <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Total Bahan Masuk</p>
          <div className="flex items-center justify-between">
            <h4 className="text-2xl font-black text-gray-800 tracking-tighter">
              {filteredLogs.filter(l => l.type === 'Masuk').length} Items
            </h4>
            <div className="bg-green-50 p-2 rounded-full text-green-500"><ArrowDownRight size={20} /></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
          <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Aktivitas Hari Ini</p>
          <div className="flex items-center justify-between">
            <h4 className="text-2xl font-black text-[#F58A27] tracking-tighter">
              {filteredLogs.filter(l => l.date.includes(getDynamicDate(0))).length} Log
            </h4>
            <div className="bg-orange-50 p-2 rounded-full text-[#F58A27]"><Activity size={20} /></div>
          </div>
        </div>
      </div>

      {/* --- Visualisasi Grafik Pemakaian --- */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-black text-gray-800 tracking-tighter">Usage Graph</h3>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Berdasarkan Filter
          </span>
        </div>

        {graphData.every(d => d.total === 0) ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
            </svg>
            <p className="text-sm font-bold text-gray-400">Belum ada data untuk periode ini</p>
            <div className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1.5 text-xs text-gray-400">
                <span className="w-3 h-3 rounded-full bg-green-400 inline-block"></span> Bahan Masuk
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-400">
                <span className="w-3 h-3 rounded-full bg-[#F58A27] inline-block"></span> Bahan Keluar
              </span>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-end justify-between h-48 gap-2 px-4">
              {graphData.map((data, index) => (
                <div key={index} className="flex flex-col items-center flex-1 gap-3">
                  <div
                    style={{ height: `${data.heightPercent}%`, minHeight: data.total === 0 ? '4px' : '0' }}
                    className={`w-full max-w-[40px] rounded-t-xl transition-all cursor-pointer relative group ${
                      data.total > 0
                        ? 'bg-gradient-to-t from-[#F58A27] to-[#ffb36d] hover:brightness-110'
                        : 'bg-gray-100'
                    }`}
                  >
                    {data.total > 0 && (
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] py-1 px-2 rounded hidden group-hover:block whitespace-nowrap z-10">
                        {data.total} Units
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">{data.label}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-4 justify-center">
              <span className="flex items-center gap-1.5 text-xs text-gray-400">
                <span className="w-3 h-3 rounded-full bg-green-400 inline-block"></span> Bahan Masuk
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-400">
                <span className="w-3 h-3 rounded-full bg-[#F58A27] inline-block"></span> Bahan Keluar
              </span>
            </div>
          </>
        )}
      </div>

      {/* --- Tabel Log Penggunaan Bahan --- */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center">
          <h3 className="text-xl font-black text-gray-800 tracking-tighter">Material Usage Log</h3>

          <div className="relative">
            <input
              type="text"
              placeholder="Cari bahan atau catatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-50 border-none rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium w-64 focus:ring-1 focus:ring-[#F58A27] outline-none"
            />
            <Search className="absolute left-4 top-2.5 text-gray-400" size={14} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Date & Time</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Item Name</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Quantity</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Type</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-8 py-10 text-center text-sm font-bold text-gray-400">
                    Loading stock report data...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="5" className="px-8 py-10 text-center text-sm font-bold text-red-500">
                    {error}
                  </td>
                </tr>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-5 text-xs font-bold text-gray-500">{log.date}</td>
                    <td className="px-8 py-5 text-sm font-black text-gray-800 tracking-tight">{log.item}</td>
                    <td className="px-8 py-5 text-sm font-extrabold text-gray-700">{log.qty}</td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        log.type === 'Keluar' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'
                      }`}>
                        {log.type}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-xs font-medium text-gray-400">{log.note}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-8 py-10 text-center text-sm font-bold text-gray-400">
                    Belum ada data log untuk periode ini
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StockReportSection;