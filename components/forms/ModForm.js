'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MOD_CATEGORIES } from '@/lib/constants/categories'

export default function ModForm({ buildId, mod, modCount, onSave, onCancel }) {
  const [name, setName] = useState(mod?.name || '')
  const [brand, setBrand] = useState(mod?.brand || '')
  const [category, setCategory] = useState(mod?.category || MOD_CATEGORIES[0])
  const [url, setUrl] = useState(mod?.url || '')
  const [imageUrl, setImageUrl] = useState(mod?.image_url || '')
  const [installStatus, setInstallStatus] = useState(mod?.install_status || 'installed')
  const [wouldInstallAgain, setWouldInstallAgain] = useState(mod?.would_install_again ?? null)
  const [notes, setNotes] = useState(mod?.install_notes || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    if (!name.trim()) { setError('Name is required.'); return }
    setSaving(true)
    setError('')

    const supabase = createClient()
    const payload = {
      name: name.trim(),
      brand: brand.trim() || null,
      category,
      url: url.trim() || null,
      image_url: imageUrl.trim() || null,
      install_status: installStatus,
      would_install_again: wouldInstallAgain,
      install_notes: notes.trim() || null,
    }

    if (mod?.id) {
      const { data, error: err } = await supabase
        .from('mods')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', mod.id)
        .select()
        .single()

      if (err) { setError(err.message); setSaving(false); return }
      onSave(data)
    } else {
      const { data, error: err } = await supabase
        .from('mods')
        .insert({ ...payload, build_id: buildId, position: modCount })
        .select()
        .single()

      if (err) { setError(err.message); setSaving(false); return }
      onSave(data)
    }

    setSaving(false)
  }

  const inputClass = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent'

  return (
    <div className="border border-gray-200 rounded-xl p-5 bg-gray-50">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">
        {mod ? 'Edit Mod' : 'Add Mod'}
      </h3>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">Part Name *</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Eventuri Carbon Fiber Intake"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Brand</label>
          <input
            value={brand}
            onChange={e => setBrand(e.target.value)}
            placeholder="e.g. Eventuri"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Category *</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className={inputClass}
          >
            {MOD_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">Product URL</label>
          <input
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://..."
            type="url"
            className={inputClass}
          />
        </div>

        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">Image URL</label>
          <input
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
            placeholder="https://..."
            type="url"
            className={inputClass}
          />
        </div>
      </div>

      {/* Install status */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-600 mb-1.5">Install Status</label>
        <div className="flex gap-2">
          {['installed', 'planned', 'removed'].map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setInstallStatus(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors ${
                installStatus === s
                  ? 'bg-gray-900 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Would install again */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-600 mb-1.5">Would install again?</label>
        <div className="flex gap-2">
          {[
            { value: true, label: '👍 Yes' },
            { value: false, label: '👎 No' },
            { value: null, label: 'Skip' },
          ].map(opt => (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => setWouldInstallAgain(opt.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                wouldInstallAgain === opt.value
                  ? 'bg-gray-900 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-600 mb-1">Install Notes</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="How was the install? Any tips for others?"
          rows={3}
          className={`${inputClass} resize-none`}
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 mb-3">{error}</p>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-brand-red text-white text-sm font-semibold rounded-lg hover:bg-brand-red-dark transition-colors disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save Mod'}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
