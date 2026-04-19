import StockSummary from "@/components/StockSummary";

export default function InventoryDashboardPage() {
  // Murni Data Dummy Konstan untuk Grafik
  const chartData = [
    { day: "Sen", value: 40 },
    { day: "Sel", value: 65 },
    { day: "Rab", value: 45 },
    { day: "Kam", value: 80 },
    { day: "Jum", value: 120 },
    { day: "Sab", value: 150 },
    { day: "Min", value: 130 },
  ];

  // Murni Data Dummy Konstan untuk Top Items
  const topItems = [
    { name: "Beras Premium", usage: "85 kg", percentage: "85%", color: "bg-orange-500" },
    { name: "Minyak Goreng", usage: "42 Liter", percentage: "60%", color: "bg-blue-500" },
    { name: "Daging Ayam", usage: "38 kg", percentage: "55%", color: "bg-green-500" },
    { name: "Telur Horn", usage: "12 Rak", percentage: "40%", color: "bg-yellow-500" },
  ];

  return (
    <div className="w-full p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Inventory Dashboard</h1>
        <p className="text-gray-500">Ringkasan kondisi stok Bima Resto hari ini.</p>
      </div>

      <StockSummary />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
        
        {/* --- KOTAK 1: Grafik Pemakaian Bahan --- */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-80 flex flex-col">
          <h3 className="text-lg font-bold text-gray-700 mb-6">Tren Pemakaian Bahan (Mingguan)</h3>
          
          <div className="flex-1 flex items-end justify-between space-x-2 pt-4">
            {chartData.map((item, index) => (
              <div key={index} className="flex flex-col items-center w-full group cursor-pointer">
                <span className="text-xs font-bold text-gray-500 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.value}
                </span>
                <div 
                  className="w-full bg-orange-100 group-hover:bg-orange-400 rounded-t-md transition-all duration-300"
                  style={{ height: `${(item.value / 150) * 100}%` }} 
                ></div>
                <span className="text-xs text-gray-400 mt-3 font-medium">{item.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* --- KOTAK 2: Daftar Bahan Paling Laris --- */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-80 flex flex-col">
          <h3 className="text-lg font-bold text-gray-700 mb-6">Bahan Paling Banyak Dipakai</h3>
          
          <div className="flex-1 space-y-5 overflow-y-auto pr-2">
            {topItems.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-gray-600">{item.name}</span>
                  <span className="text-xs font-bold text-gray-400">{item.usage}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div 
                    className={`${item.color} h-2.5 rounded-full`} 
                    style={{ width: item.percentage }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}