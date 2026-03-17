'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FileUp, Loader2, CheckCircle, AlertCircle, Terminal, Package, Database, Info } from 'lucide-react';

interface ImportLog {
    id: string;
    timestamp: string;
    message: string;
    type: 'info' | 'success' | 'error' | 'warning';
    sku?: string;
}

export default function ImportDashboard() {
    const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'failed'>('idle');
    const [progress, setProgress] = useState(0);
    const [logs, setLogs] = useState<ImportLog[]>([]);
    const [currentItem, setCurrentItem] = useState<{name: string, sku: string} | null>(null);
    const [stats, setStats] = useState({ imported: 0, skipped: 0, total: 0 });
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const logEndRef = useRef<HTMLDivElement>(null);

    // Авто-скролл логов
    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const addLog = (message: string, type: ImportLog['type'] = 'info', sku?: string) => {
        const newLog: ImportLog = {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toLocaleTimeString(),
            message,
            type,
            sku
        };
        setLogs(prev => [...prev.slice(-100), newLog]); // Храним последние 100 логов
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setStatus('processing');
        setProgress(0);
        setLogs([]);
        setStats({ imported: 0, skipped: 0, total: 0 });
        addLog(`Начало импорта файла: ${file.name}`, 'info');

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/admin/import/csv', {
                method: 'POST',
                body: formData,
            });

            if (!response.body) throw new Error('Поток данных недоступен');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                // Поток может содержать несколько JSON-объектов, разделенных новой строкой
                const messages = chunk.split('\n').filter(Boolean);

                for (const msg of messages) {
                    try {
                        const data = JSON.parse(msg);

                        if (data.type === 'start') {
                            setStats(prev => ({ ...prev, total: data.total }));
                            addLog(`Обнаружено строк для обработки: ${data.total}`, 'info');
                        } 
                        else if (data.type === 'progress') {
                            const percent = Math.round((data.current / data.total) * 100);
                            setProgress(percent);
                            setCurrentItem({ name: data.name, sku: data.sku });
                            setStats(prev => ({ 
                                ...prev, 
                                imported: data.imported, 
                                skipped: data.skipped 
                            }));
                            addLog(`Обработан: ${data.sku} - ${data.name}`, 'success', data.sku);
                        }
                        else if (data.type === 'error') {
                            setStatus('failed');
                            addLog(`ОСТАНОВКА: ${data.sku ? `Строка ${data.sku}: ` : ''}${data.message}`, 'error', data.sku);
                            // Прекращаем чтение потока на фронтенде
                            await reader.cancel();
                            return;
                        }
                        else if (data.type === 'info') {
                            addLog(data.message, 'info');
                        }
                        else if (data.type === 'complete') {
                            setStatus('completed');
                            addLog(`Импорт завершен! Успешно: ${data.stats.imported}, Пропущено: ${data.stats.skipped}`, 'success');
                        }
                    } catch (e) {
                        console.error('Ошибка парсинга чанка:', e, msg);
                    }
                }
            }

        } catch (error: any) {
            setStatus('failed');
            addLog(`Критическая ошибка: ${error.message}`, 'error');
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Header / Actions */}
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                        <Database className="text-blue-400" size={32} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Центр импорта данных</h2>
                        <p className="text-gray-400 text-sm mt-1 uppercase tracking-widest text-[10px]">Загрузка CSV каталога (Лимит: 100 товаров)</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <input type="file" ref={fileInputRef} onChange={handleImport} accept=".csv" className="hidden" />
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={status === 'processing'}
                        className="btn-accent h-14 px-8 flex items-center gap-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                    >
                        {status === 'processing' ? <Loader2 className="animate-spin" /> : <FileUp size={18} />}
                        Выгрузка CSV файла
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center"><CheckCircle className="text-emerald-400" size={24} /></div>
                    <div><p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Импортировано</p><p className="text-2xl font-bold text-white">{stats.imported}</p></div>
                </div>
                <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center"><AlertCircle className="text-red-400" size={24} /></div>
                    <div><p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Пропущено</p><p className="text-2xl font-bold text-white">{stats.skipped}</p></div>
                </div>
                <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center"><Package className="text-blue-400" size={24} /></div>
                    <div><p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Всего в сессии</p><p className="text-2xl font-bold text-white">{stats.total}</p></div>
                </div>
            </div>

            {/* Progress & Current Item */}
            {status === 'processing' && (
                <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center animate-pulse">
                                <Package className="text-white" size={20} />
                             </div>
                             <div>
                                <p className="text-[10px] text-blue-400 uppercase tracking-[0.2em] font-black">Сейчас обрабатывается:</p>
                                <p className="text-white font-bold truncate max-w-md">{currentItem?.sku} — {currentItem?.name}</p>
                             </div>
                        </div>
                        <div className="text-right">
                            <p className="text-3xl font-black text-white">{progress}%</p>
                        </div>
                    </div>
                    <div className="h-4 bg-gray-800 rounded-full overflow-hidden border border-gray-700 p-1">
                        <div 
                            className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all duration-500 relative"
                            style={{ width: `${progress}%` }}
                        >
                            <div className="absolute inset-0 bg-white/20 animate-[pulse_1.5s_infinite]" />
                        </div>
                    </div>
                </div>
            )}

            {/* Real-time Broadcast Terminal */}
            <div className="bg-black rounded-2xl border border-gray-800 overflow-hidden flex flex-col shadow-2xl h-[500px]">
                <div className="bg-gray-900 px-6 py-4 border-b border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/40"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/40"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/40"></div>
                        </div>
                        <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-500 ml-4 flex items-center gap-2">
                            <Terminal size={14} /> LIVE_BROADCAST_FEED
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Online</span>
                    </div>
                </div>
                
                <div className="flex-grow overflow-y-auto p-6 font-mono text-sm space-y-2 custom-scrollbar">
                    {logs.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-4 opacity-50">
                            <Info size={40} />
                            <p className="uppercase tracking-widest text-xs">Ожидание начала загрузки...</p>
                        </div>
                    )}
                    {logs.map((log) => (
                        <div key={log.id} className="flex gap-4 animate-in fade-in slide-in-from-left-2">
                            <span className="text-gray-600 flex-shrink-0">[{log.timestamp}]</span>
                            <span className={`
                                ${log.type === 'success' ? 'text-emerald-400' : ''}
                                ${log.type === 'error' ? 'text-red-400' : ''}
                                ${log.type === 'warning' ? 'text-yellow-400' : ''}
                                ${log.type === 'info' ? 'text-blue-400' : ''}
                            `}>
                                {log.type === 'success' ? '✓' : log.type === 'error' ? '✗' : '•'} {log.message}
                            </span>
                        </div>
                    ))}
                    <div ref={logEndRef} />
                </div>

                <div className="bg-gray-900 px-6 py-3 border-t border-gray-800 text-[9px] text-gray-500 uppercase tracking-[0.2em] flex justify-between">
                    <span>Logs: {logs.length}</span>
                    <span>Buffer: 100 entries</span>
                </div>
            </div>
        </div>
    );
}
