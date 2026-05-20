"use client";

import { useEffect, useState } from "react";
import {
  Download,
  ArrowUpRight,
  ArrowDownLeft,
  Activity,
  BarChart3,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface StockLog {
  id: number;
  createdAt: string;
  itemName: string;
  quantity: number;
  type: "MASUK" | "KELUAR";
  note: string;
  unit: string;
}

const toLocalDateStr = (isoString: string) => {
  const d = new Date(isoString);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export default function StockReportsPage() {
  const [logs, setLogs] = useState<StockLog[]>([]);
  const [period, setPeriod] = useState("minggu-ini");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalOut: 0, totalIn: 0, todayActivity: 0 });

  useEffect(() => {
    fetchLogs();
  }, [period]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const now = new Date();
      let startDate = new Date();

      switch (period) {
        case "hari-ini":
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case "minggu-ini":
          startDate.setDate(startDate.getDate() - 7);
          break;
        case "bulan-ini":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          startDate.setDate(startDate.getDate() - 7);
      }

      const res = await fetch(
        `${API_URL}/api/inventory/logs?startDate=${startDate.toISOString()}&limit=500`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      if (!res.ok) throw new Error("Failed to fetch logs");

      const data = await res.json();
      const formattedLogs = Array.isArray(data) ? data : data.data || data.logs || [];

      setLogs(formattedLogs);

      const totalOut = formattedLogs
        .filter((l: any) => l.type === "KELUAR")
        .reduce((sum: number, l: any) => sum + (l.quantity || 0), 0);

      const totalIn = formattedLogs
        .filter((l: any) => l.type === "MASUK")
        .reduce((sum: number, l: any) => sum + (l.quantity || 0), 0);

      const todayStr = toLocalDateStr(new Date().toISOString());
      const todayActivity = formattedLogs.filter((l: any) =>
        toLocalDateStr(l.createdAt) === todayStr
      ).length;

      setStats({ totalOut, totalIn, todayActivity });
    } catch (err) {
      console.error("Fetch logs error:", err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (logs.length === 0) return;
    const headers = ["Date & Time", "Item Name", "Quantity", "Type", "Note"];
    const rows = logs.map((log) => [
      new Date(log.createdAt).toLocaleString("id-ID"),
      log.itemName,
      `${log.quantity} ${log.unit}`,
      log.type,
      log.note,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stock-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  // Build chart data depending on period
  const DAY_LABELS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

  const chartData = (() => {
    if (period === "bulan-ini") {
      // Group by week 1-4 of current month
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();

      const weeks = [
        { label: "Minggu 1", start: 1, end: 7 },
        { label: "Minggu 2", start: 8, end: 14 },
        { label: "Minggu 3", start: 15, end: 21 },
        { label: "Minggu 4", start: 22, end: 31 },
      ];

      return weeks.map(({ label, start, end }) => {
        const startDate = new Date(year, month, start);
        const endDate = new Date(year, month, end, 23, 59, 59);

        const masuk = logs
          .filter((l) => {
            const d = new Date(l.createdAt);
            return l.type === "MASUK" && d >= startDate && d <= endDate;
          })
          .reduce((sum, l) => sum + l.quantity, 0);

        const keluar = logs
          .filter((l) => {
            const d = new Date(l.createdAt);
            return l.type === "KELUAR" && d >= startDate && d <= endDate;
          })
          .reduce((sum, l) => sum + l.quantity, 0);

        return { day: label, masuk, keluar };
      });
    }

    // Default: last 7 days
    return DAY_LABELS.map((day, index) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - index));
      const dateStr = toLocalDateStr(d.toISOString());

      const masuk = logs
        .filter((l) => toLocalDateStr(l.createdAt) === dateStr && l.type === "MASUK")
        .reduce((sum, l) => sum + l.quantity, 0);

      const keluar = logs
        .filter((l) => toLocalDateStr(l.createdAt) === dateStr && l.type === "KELUAR")
        .reduce((sum, l) => sum + l.quantity, 0);

      return { day, masuk, keluar };
    });
  })();

  const maxChart = Math.max(...chartData.map((d) => Math.max(d.masuk, d.keluar)), 1);
  const BAR_MAX_PX = 160;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Stock Reports</h1>
        <div className="flex gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="hari-ini">Hari Ini</option>
            <option value="minggu-ini">Minggu Ini</option>
            <option value="bulan-ini">Bulan Ini</option>
          </select>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Bahan Keluar</p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-2xl font-bold text-gray-900">{stats.totalOut} Items</p>
            <div className="p-2 bg-red-50 rounded-lg">
              <ArrowUpRight className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Bahan Masuk</p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-2xl font-bold text-gray-900">{stats.totalIn} Items</p>
            <div className="p-2 bg-green-50 rounded-lg">
              <ArrowDownLeft className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Aktivitas Hari Ini</p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-2xl font-bold text-orange-600">{stats.todayActivity} Log</p>
            <div className="p-2 bg-orange-50 rounded-lg">
              <Activity className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Usage Graph</h3>
          <span className="text-xs text-gray-400">BERDASARKAN FILTER</span>
        </div>

        {chartData.some((d) => d.masuk > 0 || d.keluar > 0) ? (
          <div>
            <div
              className="flex items-end justify-between gap-3 px-4"
              style={{ height: `${BAR_MAX_PX + 32}px` }}
            >
              {chartData.map((day, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center justify-end flex-1"
                  style={{ height: `${BAR_MAX_PX + 32}px` }}
                >
                  <div
                    className="flex justify-center gap-1 items-end"
                    style={{ height: `${BAR_MAX_PX}px` }}
                  >
                    {/* Masuk bar */}
                    <div
                      className="flex flex-col items-center justify-end"
                      style={{ height: `${BAR_MAX_PX}px` }}
                    >
                      <span className="text-[10px] text-green-600 mb-0.5">
                        {day.masuk > 0 ? day.masuk : ""}
                      </span>
                      <div
                        className="w-4 bg-green-500 rounded-t-sm"
                        style={{
                          height: `${day.masuk > 0 ? Math.max((day.masuk / maxChart) * BAR_MAX_PX, 4) : 0}px`,
                        }}
                      />
                    </div>
                    {/* Keluar bar */}
                    <div
                      className="flex flex-col items-center justify-end"
                      style={{ height: `${BAR_MAX_PX}px` }}
                    >
                      <span className="text-[10px] text-orange-600 mb-0.5">
                        {day.keluar > 0 ? day.keluar : ""}
                      </span>
                      <div
                        className="w-4 bg-orange-500 rounded-t-sm"
                        style={{
                          height: `${day.keluar > 0 ? Math.max((day.keluar / maxChart) * BAR_MAX_PX, 4) : 0}px`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 mt-2 text-center">{day.day}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-sm text-gray-600">Bahan Masuk</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full" />
                <span className="text-sm text-gray-600">Bahan Keluar</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-gray-400">
            <BarChart3 className="w-12 h-12 mb-2 opacity-50" />
            <p>Belum ada data untuk periode ini</p>
          </div>
        )}
      </div>

      {/* Log Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Material Usage Log</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">Loading...</td>
                </tr>
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(log.createdAt).toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{log.itemName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{log.quantity} {log.unit}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        log.type === "MASUK" ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"
                      }`}>
                        {log.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{log.note}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
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
}