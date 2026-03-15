'use client'

import { useState } from 'react'
import { updateSettings } from './actions'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

interface SettingsFormProps {
  initialSettings: {
    headerPhone: string | null
    footerAbout: string | null
    footerEmail: string | null
    footerAddress: string | null
  }
}

export default function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(formData: FormData) {
    setStatus('loading')
    setMessage('')

    const result = await updateSettings(formData)

    if (result.success) {
      setStatus('success')
      setMessage('Изменения успешно сохранены')
      setTimeout(() => setStatus('idle'), 3000)
    } else {
      setStatus('error')
      setMessage(result.error || 'Произошла ошибка')
    }
  }

  return (
    <form action={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-8 shadow-xl relative">
      {/* Status Notifications */}
      {status === 'success' && (
        <div className="absolute top-4 right-8 flex items-center gap-2 text-emerald-400 bg-emerald-400/10 px-4 py-2 rounded-lg animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={16} />
          <span className="text-xs font-bold uppercase tracking-wider">{message}</span>
        </div>
      )}
      
      {status === 'error' && (
        <div className="absolute top-4 right-8 flex items-center gap-2 text-red-400 bg-red-400/10 px-4 py-2 rounded-lg animate-in fade-in slide-in-from-top-2">
          <AlertCircle size={16} />
          <span className="text-xs font-bold uppercase tracking-wider">{message}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="space-y-4">
        <h2 className="text-accent text-xs uppercase tracking-widest font-bold flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
          Настройки шапки (Header)
        </h2>
        <div className="grid gap-2">
          <label className="text-gray-400 text-[10px] uppercase font-bold tracking-tight">Номер телефона</label>
          <input 
            name="headerPhone" 
            defaultValue={initialSettings.headerPhone || ''} 
            placeholder="+7 (707) 123-45-67"
            className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-accent transition-colors outline-none"
          />
        </div>
      </div>

      {/* Footer Section */}
      <div className="space-y-6 pt-6 border-t border-gray-800">
        <h2 className="text-accent text-xs uppercase tracking-widest font-bold flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
          Настройки подвала (Footer)
        </h2>
        
        <div className="grid gap-2">
          <label className="text-gray-400 text-[10px] uppercase font-bold tracking-tight">О компании (Текст в подвале)</label>
          <textarea 
            name="footerAbout" 
            defaultValue={initialSettings.footerAbout || ''} 
            rows={4}
            placeholder="Accurate.kz — это эксклюзивная сантехника..."
            className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-accent transition-colors resize-none outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="grid gap-2">
            <label className="text-gray-400 text-[10px] uppercase font-bold tracking-tight">Email</label>
            <input 
              name="footerEmail" 
              defaultValue={initialSettings.footerEmail || ''} 
              className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-accent transition-colors outline-none"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-gray-400 text-[10px] uppercase font-bold tracking-tight">Адрес</label>
            <input 
              name="footerAddress" 
              defaultValue={initialSettings.footerAddress || ''} 
              className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-accent transition-colors outline-none"
            />
          </div>
        </div>
      </div>

      <button 
        type="submit"
        disabled={status === 'loading'}
        className="w-full bg-accent text-white py-4 rounded-xl text-xs uppercase tracking-widest font-bold hover:bg-accent/80 transition-all shadow-lg shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {status === 'loading' ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Сохранение...
          </>
        ) : (
          'Сохранить изменения'
        )}
      </button>
    </form>
  )
}
