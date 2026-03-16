'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Check, X, Search, Clock, Tag, Edit2, Calendar } from 'lucide-react';
import Image from 'next/image';

interface Deal {
  id: string;
  productId: string;
  discount: number;
  endDate: string | null;
  isActive: boolean;
  product: {
    name: string;
    media: { url: string }[];
    variants: { price: number }[];
  };
}

export default function DealsClient({ initialDeals, products }: { initialDeals: Deal[], products: any[] }) {
  const router = useRouter();
  const [deals, setDeals] = useState(initialDeals);
  const [searchTerm, setSearchString] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Deal>>({});
  const [loading, setLoading] = useState(false);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
    !deals.some(d => d.productId === p.id)
  ).slice(0, 10);

  const addDeal = async (productId: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          productId, 
          discount: 15, 
          isActive: true,
          endDate: new Date(Date.now() + 86400000).toISOString() // По умолчанию на 24 часа
        }),
      });
      if (res.ok) {
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const saveEdit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        const updated = await res.json();
        setDeals(deals.map(d => d.id === updated.id ? { ...d, ...updated } : d));
        setEditingId(null);
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const deleteDeal = async (id: string) => {
    if (!confirm('Удалить акцию?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/deals?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDeals(deals.filter(d => d.id !== id));
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-900/50 p-6 rounded-3xl border border-gray-800 space-y-4">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <Plus size={16} className="text-accent" /> Добавить товар в акцию
        </h3>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text"
            placeholder="Введите название товара для быстрого поиска..."
            className="w-full bg-gray-950 border border-gray-800 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:border-accent outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchString(e.target.value)}
          />
          
          {searchTerm && filteredProducts.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
              {filteredProducts.map(p => (
                <button
                  key={p.id}
                  onClick={() => {
                    addDeal(p.id);
                    setSearchString('');
                  }}
                  className="w-full px-6 py-4 text-left text-sm hover:bg-gray-800 transition-colors flex items-center justify-between border-b border-gray-800 last:border-0"
                >
                  <span className="truncate font-medium">{p.name}</span>
                  <Plus size={16} className="text-accent" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6">
        {deals.map((deal) => (
          <div key={deal.id} className={`bg-gray-900 border ${editingId === deal.id ? 'border-accent shadow-[0_0_20px_rgba(201,169,110,0.1)]' : 'border-gray-800'} rounded-[32px] overflow-hidden transition-all`}>
            {editingId === deal.id ? (
              <div className="p-8 space-y-6">
                <div className="flex items-center gap-4 border-b border-gray-800 pb-6">
                  <div className="w-16 h-16 bg-gray-950 rounded-xl relative overflow-hidden flex-shrink-0">
                    <Image src={deal.product.media[0]?.url || ''} alt="" fill className="object-contain p-2" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold">{deal.product.name}</h4>
                    <p className="text-gray-500 text-xs mt-1">Редактирование условий акции</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 flex items-center gap-2">
                      <Tag size={12} /> Скидка (%)
                    </label>
                    <input 
                      type="number"
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-accent outline-none"
                      value={editForm.discount || 0}
                      onChange={e => setEditForm({ ...editForm, discount: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 flex items-center gap-2">
                      <Clock size={12} /> Окончание акции
                    </label>
                    <input 
                      type="datetime-local"
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-accent outline-none"
                      value={editForm.endDate ? new Date(editForm.endDate).toISOString().slice(0, 16) : ''}
                      onChange={e => setEditForm({ ...editForm, endDate: new Date(e.target.value).toISOString() })}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button 
                    onClick={() => setEditingId(null)}
                    className="px-6 py-3 rounded-xl bg-gray-800 text-white text-xs font-bold hover:bg-gray-700 transition-colors"
                  >
                    Отмена
                  </button>
                  <button 
                    onClick={saveEdit}
                    disabled={loading}
                    className="px-8 py-3 rounded-xl bg-accent text-white text-xs font-bold hover:bg-accent/80 transition-all flex items-center gap-2"
                  >
                    <Check size={16} /> Сохранить изменения
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 flex flex-col md:flex-row items-center gap-8 group">
                <div className="w-24 h-24 bg-gray-950 rounded-2xl relative overflow-hidden flex-shrink-0 border border-gray-800/50">
                  <Image src={deal.product.media[0]?.url || ''} alt="" fill className="object-contain p-3" />
                </div>
                
                <div className="flex-grow min-w-0 space-y-2">
                  <h3 className="text-white font-bold text-lg truncate">{deal.product.name}</h3>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 text-accent rounded-full text-[10px] font-black uppercase tracking-widest border border-accent/20">
                      <Tag size={12} /> -{deal.discount}%
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                      <Clock size={12} /> 
                      {deal.endDate ? new Date(deal.endDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Бессрочно'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setEditingId(deal.id);
                      setEditForm(deal);
                    }}
                    className="p-4 rounded-2xl bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-all shadow-sm"
                  >
                    <Edit2 size={20} />
                  </button>
                  <button
                    onClick={() => deleteDeal(deal.id)}
                    className="p-4 rounded-2xl bg-red-950/20 text-red-400 hover:bg-red-950/40 transition-all shadow-sm"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {deals.length === 0 && (
          <div className="py-24 text-center border-2 border-dashed border-gray-800 rounded-[40px] bg-gray-900/20">
            <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <Zap size={32} className="text-gray-700" />
            </div>
            <p className="text-gray-500 font-serif text-xl italic max-w-sm mx-auto">Список товаров дня пуст. Используйте поиск выше, чтобы добавить эксклюзивные предложения.</p>
          </div>
        )}
      </div>
    </div>
  );
}
