'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Edit2, Check, X, GripVertical, Power } from 'lucide-react';

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  tagline: string;
  image: string;
  buttonText: string;
  link: string;
  order: number;
  isActive: boolean;
}

export default function HeroSliderClient({ initialSlides }: { initialSlides: HeroSlide[] }) {
  const router = useRouter();
  const [slides, setSlides] = useState(initialSlides);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<HeroSlide>>({});
  const [loading, setLoading] = useState(false);

  const startEdit = (slide: HeroSlide) => {
    setIsEditing(slide.id);
    setFormData(slide);
  };

  const startNew = () => {
    setIsEditing('new');
    setFormData({
      title: '',
      subtitle: '',
      tagline: '',
      image: '',
      buttonText: '',
      link: '',
      order: slides.length,
      isActive: true,
    });
  };

  const cancelEdit = () => {
    setIsEditing(null);
    setFormData({});
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/hero-slider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.refresh();
        const savedSlide = await res.json();
        if (isEditing === 'new') {
          setSlides([...slides, savedSlide]);
        } else {
          setSlides(slides.map(s => s.id === savedSlide.id ? savedSlide : s));
        }
        setIsEditing(null);
      }
    } catch (error) {
      console.error('Failed to save slide:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот слайд?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/hero-slider?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSlides(slides.filter(s => s.id !== id));
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to delete slide:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (slide: HeroSlide) => {
    setLoading(true);
    const updated = { ...slide, isActive: !slide.isActive };
    try {
      const res = await fetch('/api/admin/hero-slider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        setSlides(slides.map(s => s.id === slide.id ? updated : s));
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={startNew}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
      >
        <Plus size={16} />
        Добавить слайд
      </button>

      <div className="grid gap-4">
        {slides.map((slide) => (
          <div
            key={slide.id}
            className={`bg-gray-900 border ${
              isEditing === slide.id ? 'border-blue-500' : 'border-gray-800'
            } rounded-xl overflow-hidden transition-all`}
          >
            {isEditing === slide.id ? (
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Надпись (Tagline)</label>
                    <input
                      type="text"
                      value={formData.tagline || ''}
                      onChange={e => setFormData({ ...formData, tagline: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Порядок</label>
                    <input
                      type="number"
                      value={formData.order || 0}
                      onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Заголовок</label>
                    <input
                      type="text"
                      value={formData.title || ''}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Подзаголовок</label>
                    <input
                      type="text"
                      value={formData.subtitle || ''}
                      onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">URL изображения</label>
                  <input
                    type="text"
                    value={formData.image || ''}
                    onChange={e => setFormData({ ...formData, image: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Текст кнопки</label>
                    <input
                      type="text"
                      value={formData.buttonText || ''}
                      onChange={e => setFormData({ ...formData, buttonText: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Ссылка кнопки</label>
                    <input
                      type="text"
                      value={formData.link || ''}
                      onChange={e => setFormData({ ...formData, link: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={cancelEdit}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    <Check size={14} />
                    Сохранить
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center p-4 gap-6">
                <div className="w-40 h-24 rounded-lg bg-gray-800 overflow-hidden flex-shrink-0 relative">
                  {slide.image && (
                    <img src={slide.image} alt="" className="w-full h-full object-cover opacity-60" />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-[8px] uppercase tracking-widest font-bold bg-black/50 px-2 py-1 rounded">Превью</span>
                  </div>
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[9px] uppercase tracking-widest font-bold text-accent">{slide.tagline}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${slide.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  </div>
                  <h3 className="text-sm font-bold text-white truncate">{slide.title} {slide.subtitle}</h3>
                  <p className="text-xs text-gray-500 mt-1 truncate">{slide.link}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleActive(slide)}
                    title={slide.isActive ? 'Деактивировать' : 'Активировать'}
                    className={`p-2 rounded-lg transition-colors ${
                      slide.isActive ? 'bg-green-950/40 text-green-400 hover:bg-green-900/40' : 'bg-red-950/40 text-red-400 hover:bg-red-900/40'
                    }`}
                  >
                    <Power size={18} />
                  </button>
                  <button
                    onClick={() => startEdit(slide)}
                    className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(slide.id)}
                    className="p-2 rounded-lg bg-red-950/40 text-red-400 hover:text-red-300 hover:bg-red-900/40 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {isEditing === 'new' && (
          <div className="bg-gray-900 border border-blue-500 rounded-xl overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Надпись (Tagline)</label>
                  <input
                    type="text"
                    value={formData.tagline || ''}
                    onChange={e => setFormData({ ...formData, tagline: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Порядок</label>
                  <input
                    type="number"
                    value={formData.order || 0}
                    onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Заголовок</label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Подзаголовок</label>
                  <input
                    type="text"
                    value={formData.subtitle || ''}
                    onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">URL изображения</label>
                <input
                  type="text"
                  value={formData.image || ''}
                  onChange={e => setFormData({ ...formData, image: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Текст кнопки</label>
                  <input
                    type="text"
                    value={formData.buttonText || ''}
                    onChange={e => setFormData({ ...formData, buttonText: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Ссылка кнопки</label>
                  <input
                    type="text"
                    value={formData.link || ''}
                    onChange={e => setFormData({ ...formData, link: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={cancelEdit}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                >
                  <Check size={14} />
                  Создать
                </button>
              </div>
            </div>
          </div>
        )}

        {slides.length === 0 && !isEditing && (
          <div className="text-center py-20 bg-gray-900 border border-dashed border-gray-800 rounded-2xl">
            <p className="text-gray-500 text-sm italic font-serif">Слайды пока не добавлены</p>
          </div>
        )}
      </div>
    </div>
  );
}
