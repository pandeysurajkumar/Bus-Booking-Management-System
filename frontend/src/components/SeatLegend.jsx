import React from 'react';

export const SeatLegend = () => {
  const legendItems = [
    { label: 'Available', color: 'bg-emerald-50 border-emerald-500 text-emerald-700' },
    { label: 'Selected (You)', color: 'bg-blue-600 border-blue-700 text-white shadow-md' },
    { label: 'Booked', color: 'bg-rose-50 border-rose-300 text-rose-400 cursor-not-allowed opacity-75' },
    { label: 'Locked (Other)', color: 'bg-amber-100 border-amber-400 text-amber-800 animate-pulse' },
    { label: 'Blocked', color: 'bg-gray-200 border-gray-400 text-gray-500 cursor-not-allowed' }
  ];

  return (
    <div className="flex flex-wrap items-center gap-3 py-3 px-4 bg-gray-50 rounded-xl border border-gray-200 text-xs font-semibold">
      <span className="text-gray-500 uppercase tracking-wider text-[11px] mr-1">Legend:</span>
      {legendItems.map((item) => (
        <div key={item.label} className="flex items-center space-x-1.5">
          <div className={`w-5 h-5 rounded border ${item.color} flex items-center justify-center text-[10px]`}>
            •
          </div>
          <span className="text-gray-700">{item.label}</span>
        </div>
      ))}
    </div>
  );
};
