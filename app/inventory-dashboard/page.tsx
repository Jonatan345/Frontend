"use client";

import { useEffect, useState } from "react";
import { Box, Package, AlertTriangle, TrendingUp, BarChart3 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface WeeklyDay {
  day: string;
  usage: number;
}

interface TopMaterial {
  name: string;
  usage: number;
  unit: string;
}

interface DashboardStats {
  totalItems: number;
  lowStock: number;
  dailyUsage: number;
  weeklyTrend: WeeklyDay[];
  topMaterials: TopMaterial[];
}

export default function InventoryDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalItems: 0,
    lowStock: 0,
    dailyUsage: 0,
    weeklyTrend: [],
    topMaterials: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      // ✅ FIXED: was /api/inventory/items → correct endpoint is /api/inventory
      const itemsRes = await fetch(`${API_URL}/api/inventory`, { headers });

      // ✅ FIXED: was /api/inventory/logs → correct endpoint is /api/inventory/movements
      const logsRes = await fetch(`${API_URL}/api/inventory/movements`, { headers });

      // ✅ NEW: dedicated summary endpoint for accurate dashboard numbers
      const summaryRes = await fetch(`${API_URL}/api/inventory/summary`, { headers });

      // ✅ NEW: dedicated weekly trend endpoint
      const trendRes = await fetch(`${API_URL}/api/inventory/weekly-trend`, { headers });

      // ✅ NEW: dedicated top-used endpoint
      const topRes = await fetch(`${API_URL}/api/inventory/top-used`, { headers });

      let totalItems = 0;
      let lowStock = 0;
      let dailyUsage = 0;
      let weeklyTrend: WeeklyDay[] = [];
      let topMaterials: TopMaterial[] = [];

      // --- Summary stats (preferred source) ---
      if (summaryRes.ok) {
        const summary = await summaryRes.json();
        totalItems  = summary.totalItems    ?? 0;
        lowStock    = summary.lowStockItems ?? 0;
        dailyUsage  = summary.dailyUsage    ?? 0;
      } else if (itemsRes.ok) {
        // Fallback: calculate from raw items list
        const items = await itemsRes.json();
        totalItems = Array.isArray(items) ? items.length : 0;
        lowStock   = Array.isArray(items)
          ? items.filter((item: any) => item.stock <= (item.minStock ?? 10)).length
          : 0;
      }

      // --- Weekly trend ---
      if (trendRes.ok) {
        const trend = await trendRes.json();
        // Server returns: [{ day: 'Sen', masuk: 10, keluar: 5, date: '...' }]
        weeklyTrend = Array.isArray(trend)
          ? trend.map((d: any) => ({ day: d.day, usage: d.keluar ?? 0 }))
          : [];
      } else if (logsRes.ok) {
        // Fallback: build weekly trend from raw movements
        const movements = await logsRes.json();
        if (Array.isArray(movements)) {
          const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
          const now = new Date();
          weeklyTrend = days.map((day, index) => {
            const d = new Date(now);
            d.setDate(d.getDate() - (6 - index));
            const dateStr = d.toISOString().split("T")[0];
            const dayMovements = movements.filter(
              // ✅ FIXED: server returns lowercase 'keluar', not 'KELUAR'
              (m: any) => m.createdAt?.startsWith(dateStr) && m.type === "keluar"
            );
            return {
              day,
              usage: dayMovements.reduce((sum: number, m: any) => sum + (m.quantity ?? 0), 0),
            };
          });

          // Also compute dailyUsage from movements if summary failed
          if (!summaryRes.ok) {
            const today = new Date().toISOString().split("T")[0];
            const todayMovements = movements.filter(
              (m: any) => m.createdAt?.startsWith(today) && m.type === "keluar"
            );
            dailyUsage = todayMovements.reduce((sum: number, m: any) => sum + (m.quantity ?? 0), 0);
          }
        }
      }

      // --- Top used materials ---
      if (topRes.ok) {
        const top = await topRes.json();
        // Server returns: [{ id, name, category, totalUsed }]
        topMaterials = Array.isArray(top)
          ? top.map((t: any) => ({ name: t.name, usage: t.totalUsed, unit: "unit" }))
          : [];
      } else if (logsRes.ok) {
        // Fallback: aggregate from raw movements
        const movements = await logsRes.json();
        if (Array.isArray(movements)) {
          const materialUsage: Record<string, { usage: number; unit: string }> = {};
          movements
            // ✅ FIXED: lowercase 'keluar', not 'KELUAR'
            .filter((m: any) => m.type === "keluar")
            .forEach((m: any) => {
              // ✅ FIXED: server normalizes name as m.itemName (not m.item?.name)
              const name = m.itemName || m.menuItem?.name || "Unknown";
              if (!materialUsage[name]) {
                materialUsage[name] = { usage: 0, unit: "unit" };
              }
              materialUsage[name].usage += m.quantity ?? 0;
            });

          topMaterials = Object.entries(materialUsage)
            .map(([name, data]) => ({ name, usage: data.usage, unit: data.unit }))
            .sort((a, b) => b.usage - a.usage)
            .slice(0, 5);
        }
      }

      setStats({ totalItems, lowStock, dailyUsage, weeklyTrend, topMaterials });
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError("Gagal memuat data dashboard. Pastikan server backend berjalan.");
    } finally {
      setLoading(false);
    }
  };

  const maxUsage    = Math.max(...stats.weeklyTrend.map((d) => d.usage), 1);
  const maxTopUsage = Math.max(...stats.topMaterials.map((m) => m.usage), 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 font-semibold">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Inventory Dashboard</h1>
        <p className="text-gray-500 mt-1">Ringkasan kondisi stok Bima Resto hari ini.</p>
      </div>

      {/* --- Stat Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Bahan</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.totalItems}{" "}
                <span className="text-sm font-normal text-gray-400">Item</span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Hampir Habis</p>
              <p className="text-2xl font-bold text-red-600">
                {stats.lowStock}{" "}
                <span className="text-sm font-normal text-gray-400">Item</span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pemakaian Harian</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.dailyUsage}{" "}
                <span className="text-sm font-normal text-gray-400">Kg/Unit</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- Charts --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trend */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Tren Pemakaian Bahan (Mingguan)
          </h3>
          {stats.weeklyTrend.length > 0 && stats.weeklyTrend.some((d) => d.usage > 0) ? (
            <div className="h-64 flex items-end justify-between gap-2 px-2">
              {stats.weeklyTrend.map((day, index) => {
                const heightPercentage = (day.usage / maxUsage) * 100;
                return (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div className="w-full flex flex-col items-center justify-end h-48">
                      <span className="text-xs text-gray-600 mb-1 font-medium">
                        {day.usage > 0 ? day.usage : ""}
                      </span>
                      <div
                        className="w-full max-w-[40px] bg-orange-500 rounded-t-md transition-all duration-500 hover:bg-orange-600"
                        style={{ height: `${Math.max(heightPercentage, 4)}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 mt-2 font-medium">{day.day}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-gray-400">
              <BarChart3 className="w-12 h-12 mb-2 opacity-50" />
              <p>Belum ada data pemakaian minggu ini</p>
            </div>
          )}
        </div>

        {/* Top Materials */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Bahan Paling Banyak Dipakai
          </h3>
          {stats.topMaterials.length > 0 ? (
            <div className="space-y-4">
              {stats.topMaterials.map((material, index) => {
                const colors = [
                  "bg-orange-500", "bg-blue-500", "bg-green-500",
                  "bg-yellow-500", "bg-purple-500",
                ];
                const percentage = (material.usage / maxTopUsage) * 100;
                return (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">{material.name}</span>
                      <span className="text-sm text-gray-500">
                        {material.usage} {material.unit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${colors[index % colors.length]} transition-all duration-500`}
                        style={{ width: `${Math.max(percentage, 4)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-gray-400">
              <Box className="w-12 h-12 mb-2 opacity-50" />
              <p>Belum ada data penggunaan bahan</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}