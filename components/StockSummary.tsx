import React from 'react';
import { Package, AlertTriangle, Activity } from 'lucide-react';

const StockSummary = () => {
  // Murni Data Dummy Konstan
  const summaryData = [
    {
      title: "Total Bahan",
      value: "142",
      unit: "Item",
      icon: <Package className="w-6 h-6 text-blue-500" />,
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      title: "Hampir Habis",
      value: "12",
      unit: "Item",
      icon: <AlertTriangle className="w-6 h-6 text-red-500" />,
      bgColor: "bg-red-50",
      textColor: "text-red-600"
    },
    {
      title: "Pemakaian Harian",
      value: "45",
      unit: "Kg/Unit",
      icon: <Activity className="w-6 h-6 text-green-500" />,
      bgColor: "bg-green-50",
      textColor: "text-green-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {summaryData.map((item, index) => (
        <div 
          key={index} 
          className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4 transition-transform hover:scale-105"
        >
          <div className={`${item.bgColor} p-4 rounded-2xl`}>
            {item.icon}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{item.title}</p>
            <div className="flex items-baseline space-x-1">
              <h3 className={`text-2xl font-bold ${item.textColor}`}>{item.value}</h3>
              <span className="text-xs text-gray-400 font-medium">{item.unit}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StockSummary;