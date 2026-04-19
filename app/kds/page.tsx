"use client";
import { useState, useEffect } from "react";

const API_URL = "http://localhost:8080/api/kds/orders";

const OrderTimer = ({ createdAt, status }: { createdAt: any, status: string }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!createdAt || status === 'ready' || status === 'completed') return;

    const startTime = new Date(createdAt).getTime();
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [createdAt, status]);

  if (!createdAt) return <div className="font-mono font-bold text-xl text-gray-400">00:00</div>;

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  let textColor = "text-gray-400";
  if (minutes >= 20) textColor = "text-red-500 animate-pulse";
  else if (minutes >= 10) textColor = "text-[#F58A27]";

  return <div className={`font-mono font-bold text-xl ${textColor}`}>{minutes}:{seconds.toString().padStart(2, '0')}</div>;
};

export default function KitchenDisplay() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const response = await fetch(API_URL);
      const result = await response.json();
      if (result.success) setOrders(result.data);
    } catch (err) {
      console.error("Gagal mengambil data dapur:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); 
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (id: string | number, currentStatus: string) => {
    const nextStatus = currentStatus === 'pending' ? 'cooking' : 'ready';
    
    try {
      const response = await fetch(`${API_URL}/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });

      if (response.ok) {
        fetchOrders(); 
      }
    } catch (err) {
      alert("Gagal mengupdate status ke server!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center text-center">
        <div>
          <div className="w-12 h-12 border-4 border-[#F58A27] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Menyambung ke Backend...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-8 text-gray-900 font-sans">
      <header className="flex justify-between items-center mb-10 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex flex-col">
          <h1 className="text-2xl font-black text-gray-800 tracking-tight leading-none">Kitchen Display System</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] bg-[#F58A27]/10 text-[#F58A27] px-2 py-0.5 rounded-full font-bold uppercase">Bima Resto</span>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Universitas Pradita</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-gray-800">{new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
          <span className="flex items-center justify-end gap-1 text-[10px] text-green-500 font-black uppercase tracking-widest mt-1">
             <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span> Live Monitoring
          </span>
        </div>
      </header>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border border-dashed border-gray-200">
          <span className="text-5xl mb-4">🍳</span>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-sm text-center px-4">Belum ada pesanan aktif<br/><span className="text-[10px] font-medium lowercase italic"></span></p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {orders.map((order: any) => (
            <div key={order.id} className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm flex flex-col">
              <div className="p-6 bg-gray-50/50 flex justify-between items-start border-b border-gray-50">
                <div>
                  <span className="text-2xl font-black text-gray-800 italic">TABLE {order.table}</span>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">ORDER #{order.id}</p>
                </div>
                <OrderTimer createdAt={order.createdAt} status={order.status} />
              </div>
              <div className="p-8 flex-1">
                <ul className="space-y-4">
                  {order.items.map((item: string, idx: number) => (
                    <li key={idx} className="text-lg font-bold text-gray-700 border-l-4 border-[#F58A27] pl-4 py-1 leading-tight">{item}</li>
                  ))}
                </ul>
              </div>
              <div className="p-6 mt-auto">
                <button 
                  onClick={() => handleUpdateStatus(order.id, order.status)}
                  disabled={order.status === 'ready'}
                  className={`w-full py-5 rounded-[1.8rem] font-black text-sm uppercase tracking-widest transition-all active:scale-95 ${
                    order.status === 'pending' ? 'bg-[#F58A27] text-white hover:bg-[#d4721a]' : 
                    order.status === 'cooking' ? 'bg-green-500 text-white hover:bg-green-600' : 
                    'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {order.status === 'pending' ? 'Start Cooking' : order.status === 'cooking' ? 'Mark As Ready' : 'Done'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}