import { useState, useEffect } from "react";
// ... import lainnya

export default function InventoryDashboardPage() {
  // 1. Bikin state untuk nyimpan data dari Jonathan
  const [dataDashboard, setDataDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 2. Fungsi untuk narik data dari API Jonathan
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Tembak ke URL API lokal Jonathan (sesuaikan nama URL-nya nanti)
        const response = await fetch("http://localhost:8080/api/dashboard-stok");
        const result = await response.json();
        
        setDataDashboard(result); // Simpan datanya
        setIsLoading(false); // Matikan loading
      } catch (error) {
        console.error("Gagal narik data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  // 3. Tampilkan tulisan loading kalau data belum datang
  if (isLoading) return <div className="p-8">Loading data dari database...</div>;

  // ... Di bawah ini, kamu tinggal ganti angka dummy dengan data dari state
  // Contoh: {dataDashboard.totalBahan}