import Sidebar from "@/components/Sidebar";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen bg-[#f8f9fa] text-gray-900 antialiased">
        <Sidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header Bima Resto - Universitas Pradita */}
          <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-10 sticky top-0 z-10 shadow-sm/5">
            <div className="flex flex-col">
              <h1 className="text-xl font-black text-gray-800 tracking-tight">Inventory Management</h1>
              {/* Menambahkan identitas Bima Resto dan Kampus */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-bima-orange/10 text-bima-orange px-2 py-0.5 rounded-full font-bold uppercase">
                  Bima Resto
                </span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  Universitas Pradita
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Menampilkan profil mahasiswa */}
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-800"></p>
                <p className="text-[10px] text-gray-400 font-medium italic"></p>
              </div>
              
              <div className="group cursor-pointer relative">
                <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center shadow-sm group-hover:border-bima-orange transition-colors">
                  <span className="text-gray-400 text-lg group-hover:text-bima-orange">👤</span>
                </div>
                {/* Efek dot online hijau */}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
            </div>
          </header>
          
          <main className="p-10 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}