"use client";

import React, { useState } from 'react';
import { Search, Download, Filter, ArrowUpRight, ArrowDownRight, Activity, ChevronDown, Calendar } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const StockReportSection = () => {
  // Data Dummy untuk Log Penggunaan Bahan
  const [stockLogs] = useState([
    { id: 1, date: '2026-04-05 14:20', item: 'Beras Premium', qty: '10 Kg', type: 'Keluar', note: 'Masak Nasi Goreng' },
    { id: 2, date: '2026-04-05 10:00', item: 'Minyak Goreng', qty: '5 Liter', type: 'Masuk', note: 'Restock Supplier' },
    { id: 3, date: '2026-04-04 18:45', item: 'Daging Ayam', qty: '3 Kg', type: 'Keluar', note: 'Menu Ayam Bakar' },
    { id: 4, date: '2026-04-04 09:15', item: 'Telur Ayam', qty: '30 Butir', type: 'Keluar', note: 'Sarapan Buffet' },
    { id: 5, date: '2026-04-03 08:00', item: 'Sayur Kol', qty: '2 Kg', type: 'Masuk', note: 'Restock Pasar' },
    { id: 6, date: '2026-03-28 15:30', item: 'Kecap Manis', qty: '1 Dus', type: 'Masuk', note: 'Restock Bulanan' },
    { id: 7, date: '2026-03-15 07:00', item: 'Gula Pasir', qty: '5 Kg', type: 'Keluar', note: 'Pembuatan Minuman' },
  ]);

  // --- States untuk Filter & Search ---
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('Semua'); 
  
  const [timeFilter, setTimeFilter] = useState('Semua'); 
  const [startDate, setStartDate] = useState(''); 
  const [endDate, setEndDate] = useState(''); 

  // --- Logika Search & Filter ---
  const filteredLogs = stockLogs.filter((log) => {
    // 1. Filter Pencarian Teks
    const matchesSearch = 
      log.item.toLowerCase().includes(searchQuery.toLowerCase()) || 
      log.note.toLowerCase().includes(searchQuery.toLowerCase());
    
    // 2. Filter Tipe
    const matchesType = filterType === 'Semua' || log.type === filterType;

    // 3. Filter Waktu (Kalender Asli)
    let matchesTime = true;
    if (timeFilter !== 'Semua') {
      const logDateString = log.date.split(' ')[0]; // Ambil YYYY-MM-DD
      const logDateObj = new Date(logDateString);
      const todayObj = new Date();
      
      // Hilangkan jam agar perbandingan tanggal akurat
      todayObj.setHours(0, 0, 0, 0);
      logDateObj.setHours(0, 0, 0, 0);

      if (timeFilter === 'Hari Ini') {
        matchesTime = logDateObj.getTime() === todayObj.getTime();
        
      } else if (timeFilter === '7 Hari') {
        // Logika "Minggu Ini" (Dari Senin sampai Minggu di minggu yang sama)
        const dayOfWeek = todayObj.getDay(); // 0 = Minggu, 1 = Senin, dst
        const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; 
        
        const startOfWeek = new Date(todayObj);
        startOfWeek.setDate(todayObj.getDate() + diffToMonday);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        matchesTime = logDateObj >= startOfWeek && logDateObj <= endOfWeek;

      } else if (timeFilter === '30 Hari') {
        // Logika "Bulan Ini" (Bulan dan Tahun kalender harus sama persis)
        matchesTime = 
          logDateObj.getMonth() === todayObj.getMonth() && 
          logDateObj.getFullYear() === todayObj.getFullYear();

      } else if (timeFilter === 'Spesifik') {
        // Logika "Rentang Tanggal"
        const isAfterStart = startDate ? logDateString >= startDate : true;
        const isBeforeEnd = endDate ? logDateString <= endDate : true;
        matchesTime = isAfterStart && isBeforeEnd;
      }
    }

    return matchesSearch && matchesType && matchesTime;
  });

  // --- Fungsi Export PDF ---
  const handleExportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Laporan Stok Bahan - Bima Resto', 14, 22);
    
    doc.setFontSize(10);
    const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    doc.text(`Tanggal Cetak: ${today}`, 14, 30);
    
    // Format teks filter untuk di PDF agar lebih rapi
    let timeLabel = timeFilter;
    if (timeFilter === '7 Hari') timeLabel = 'Minggu Ini';
    if (timeFilter === '30 Hari') timeLabel = 'Bulan Ini';

    let timeInfo = `Waktu: ${timeLabel}`;
    if (timeFilter === 'Spesifik') {
      if (startDate && endDate) timeInfo = `Periode: ${startDate} s/d ${endDate}`;
      else if (startDate) timeInfo = `Periode: Sejak ${startDate}`;
      else if (endDate) timeInfo = `Periode: Sampai ${endDate}`;
      else timeInfo = `Periode: Semua`;
    }
    
    doc.text(`Tipe: ${filterType} | ${timeInfo} | Pencarian: ${searchQuery || '-'}`, 14, 36);

    const tableColumn = ["Tanggal & Waktu", "Nama Bahan", "Kuantitas", "Tipe", "Catatan"];
    const tableRows = [];

    filteredLogs.forEach(log => {
      const logData = [log.date, log.item, log.qty, log.type, log.note];
      tableRows.push(logData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 42,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [245, 138, 39], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [250, 250, 250] }
    });

    doc.save(`Laporan_Stok_Bima_Resto_${Date.now()}.pdf`);
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

          {/* Input Rentang Tanggal */}
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

          {/* Dropdown Tipe */}
          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="appearance-none flex items-center gap-2 bg-white border border-gray-200 pl-10 pr-8 py-2.5 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-50 transition-all outline-none cursor-pointer h-[42px]"
            >
              <option value="Semua">Filter</option>
              <option value="Masuk">Bahan Masuk</option>
              <option value="Keluar">Bahan Keluar</option>
            </select>
            <Filter size={16} className="absolute left-3 top-3.5 text-gray-400 pointer-events-none" />
            <ChevronDown size={16} className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
          </div>

          {/* Tombol PDF */}
          <button 
            onClick={handleExportPDF}
            className="flex items-center gap-2 bg-[#F58A27] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-[#e07a1f] transition-all active:scale-95 h-[42px]"
          >
            <Download size={18} /> Export PDF
          </button>
        </div>
      </div>

      {/* --- Ringkasan Statistik --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
          <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Total Bahan Keluar</p>
          <div className="flex items-center justify-between">
            <h4 className="text-2xl font-black text-gray-800 tracking-tighter">142 Items</h4>
            <div className="bg-red-50 p-2 rounded-full text-red-500"><ArrowUpRight size={20}/></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
          <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Total Bahan Masuk</p>
          <div className="flex items-center justify-between">
            <h4 className="text-2xl font-black text-gray-800 tracking-tighter">85 Items</h4>
            <div className="bg-green-50 p-2 rounded-full text-green-500"><ArrowDownRight size={20}/></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
          <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Aktivitas Hari Ini</p>
          <div className="flex items-center justify-between">
            <h4 className="text-2xl font-black text-[#F58A27] tracking-tighter">24 Log</h4>
            <div className="bg-orange-50 p-2 rounded-full text-[#F58A27]"><Activity size={20}/></div>
          </div>
        </div>
      </div>

      {/* --- Visualisasi Grafik --- */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-black text-gray-800 tracking-tighter">Usage Graph (Last 7 Days)</h3>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">April 2026</span>
        </div>
        
        <div className="flex items-end justify-between h-48 gap-2 px-4">
          {[40, 70, 45, 90, 65, 80, 55].map((height, index) => (
            <div key={index} className="flex flex-col items-center flex-1 gap-3">
              <div 
                style={{ height: `${height}%` }} 
                className="w-full max-w-[40px] bg-gradient-to-t from-[#F58A27] to-[#ffb36d] rounded-t-xl hover:brightness-110 transition-all cursor-pointer relative group"
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] py-1 px-2 rounded hidden group-hover:block whitespace-nowrap">
                  {height} Units
                </div>
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase">Day {index + 1}</span>
            </div>
          ))}
        </div>
      </div>

      {/* --- Tabel Log --- */}
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
              {filteredLogs.length > 0 ? (
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
                    Tidak ada data stok pada filter tersebut.
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