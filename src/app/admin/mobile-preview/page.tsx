'use client';

import { useState } from 'react';
import { Smartphone, RotateCw, RefreshCw, ChevronLeft, ChevronRight, Globe } from 'lucide-react';

export const runtime = "edge";

const DEVICES = [
  { name: 'iPhone 13 Pro', width: 390, height: 844, scale: 0.8 },
  { name: 'Samsung S21', width: 360, height: 800, scale: 0.8 },
  { name: 'iPhone SE', width: 375, height: 667, scale: 0.9 },
  { name: 'iPad Mini', width: 768, height: 1024, scale: 0.5 },
];

export default function MobilePreviewPage() {
  const [activeDevice, setActiveDevice] = useState(DEVICES[0]);
  const [url, setUrl] = useState('/');
  const [iframeKey, setIframeKey] = useState(0); // For refreshing iframe

  const refresh = () => setIframeKey(k => k + 1);

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-6 p-6 bg-gray-900 border border-gray-800 rounded-2xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-xl">
            <Smartphone className="text-blue-400" size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Mobile Preview</h2>
            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Проверка адаптивности</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {DEVICES.map((device) => (
            <button
              key={device.name}
              onClick={() => setActiveDevice(device)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeDevice.name === device.name
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {device.name}
            </button>
          ))}
        </div>

        <div className="flex-grow max-w-md flex items-center gap-2 px-4 py-2 bg-gray-950 rounded-xl border border-gray-800">
          <Globe size={14} className="text-gray-600" />
          <input 
            type="text" 
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="bg-transparent border-none text-xs text-gray-300 focus:ring-0 w-full font-mono"
            placeholder="Путь (напр: /catalog/mixers)"
          />
          <button onClick={refresh} className="p-1 hover:text-blue-400 transition-colors">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Device Viewport */}
      <div className="flex justify-center py-10 bg-gray-950/50 rounded-[40px] border border-gray-800 min-h-[900px]">
        {/* Device Wrapper (iPhone Frame) */}
        <div 
          className="relative bg-gray-900 rounded-[60px] p-4 shadow-[0_0_100px_rgba(0,0,0,0.5)] border-[8px] border-gray-800 ring-4 ring-gray-900/50"
          style={{ 
            width: activeDevice.width + 32, 
            height: activeDevice.height + 32,
            transform: `scale(${activeDevice.scale})`,
            transformOrigin: 'top center'
          }}
        >
          {/* Speaker/Camera Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-gray-800 rounded-b-3xl z-50 flex items-center justify-center gap-3">
             <div className="w-10 h-1 bg-gray-900 rounded-full"></div>
             <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
          </div>

          {/* Iframe */}
          <div className="w-full h-full bg-white rounded-[40px] overflow-hidden relative">
            <iframe 
              key={iframeKey}
              src={url}
              className="w-full h-full border-none"
              title="Mobile View"
            />
          </div>

          {/* Home Bar */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-gray-700 rounded-full opacity-50"></div>
          
          {/* Side Buttons (Physical) */}
          <div className="absolute -left-2.5 top-32 w-1 h-12 bg-gray-800 rounded-l-md"></div>
          <div className="absolute -left-2.5 top-48 w-1 h-12 bg-gray-800 rounded-l-md"></div>
          <div className="absolute -right-2.5 top-40 w-1 h-16 bg-gray-800 rounded-r-md"></div>
        </div>
      </div>

      <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl text-center">
        <p className="text-sm text-blue-300">
          💡 <strong>Подсказка:</strong> Вы можете вводить любые пути вашего магазина в поле выше, чтобы проверить, как выглядит страница товара или корзина на разных экранах.
        </p>
      </div>
    </div>
  );
}
