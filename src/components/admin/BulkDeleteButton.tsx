'use client';

import React, { useState } from 'react';
import { Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BulkDeleteButton() {
    const [loading, setLoading] = useState(false);
    const [confirm, setConfirm] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm) {
            setConfirm(true);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/admin/products/bulk-delete', {
                method: 'DELETE',
            });

            if (res.ok) {
                alert('Каталог успешно очищен');
                setConfirm(false);
                router.refresh();
            } else {
                const data = await res.json();
                alert(`Ошибка: ${data.error}`);
            }
        } catch (error) {
            alert('Произошла ошибка при удалении');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            {confirm && (
                <span className="text-[10px] text-red-400 font-bold uppercase animate-pulse flex items-center gap-1">
                    <AlertTriangle size={12} /> Вы уверены? Это удалит ВСЕ товары!
                </span>
            )}
            <button
                onClick={handleDelete}
                disabled={loading}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all active:scale-95 shrink-0 ${
                    confirm 
                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/40' 
                    : 'bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-red-400'
                }`}
            >
                {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                ) : (
                    <Trash2 size={16} />
                )}
                {confirm ? 'ДА, УДАЛИТЬ ВСЁ' : 'Очистить каталог'}
            </button>
            {confirm && (
                <button 
                    onClick={() => setConfirm(false)}
                    className="text-[10px] text-gray-500 hover:text-white uppercase font-bold px-2"
                >
                    Отмена
                </button>
            )}
        </div>
    );
}
