'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { generateBuildSlug } from '@/lib/utils/slugify'
import { CATEGORY_COLORS } from '@/lib/constants/categories'
import ModForm from './ModForm'

export default function BuildForm({ build, userId, username }) {
  const router = useRouter()
  const fileInputRef = useRef(null)
  const isEdit = !!build?.id

  // Build fields
  const [year, setYear] = useState(build?.year || '')
  const [make, setMake] = useState(build?.make || '')
  const [model, setModel] = useState(build?.model || '')
  const [chassis, setChassis] = useState(build?.chassis_code || '')
  const [description, setDescription] = useState(build?.description || '')
  const [status, setStatus] = useState(build?.status || 'draft')
  const [specs, setSpecs] = useState(
    build?.specs ? Object.entries(build.specs) : [['', '']]
  )

  // Photos & mods (edit mode only)
  const [photos, setPhotos] = useState(
    build?.build_photos
      ? [...build.build_photos].sort((a, b) => a.position - b.position)
      : []
  )
  const [uploading, setUploading] = useState(false)
  const [mods, setMods] = useState(
    build?.mods
      ? [...build.mods].sort((a, b) => a.position - b.position)
      : []
  )
  const [showModForm, setShowModForm] = useState(false)
  const [editingMod, setEditingMod] = useState(null)

  // UI state
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  // ── Save build ─────────────────────────────────────────────────────────────

  async function saveBuild(publish = false) {
    if (!year || !make || !model) {
      setError('Year, Make, and Model are required.')
      return
    }
    setSaving(true)
    setError('')

    const supabase = createClient()
    const title = `${year} ${make} ${model}`.trim()
    const newStatus = publish ? 'published' : status
    const specsObj = Object.fromEntries(
      specs.filter(([k, v]) => k.trim() && v.trim())
    )

    if (isEdit) {
      const { error: err } = await supabase
        .from('builds')
        .update({
          year: parseInt(year), make, model, chassis_code: chassis || null,
          title, description, specs: specsObj,
          status: newStatus, updated_at: new Date().toISOString(),
        })
        .eq('id', build.id)

      if (err) { setError(err.message); setSaving(false); return }
      setStatus(newStatus)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)

      if (publish && newStatus === 'published') {
        router.push(`/builds/${build.slug}`)
      }
    } else {
      // Generate unique slug
      let slug = generateBuildSlug(year, make, model, chassis, username)
      const { data: existing } = await supabase
        .from('builds').select('slug').eq('slug', slug).single()
      if (existing) {
        slug = slug + '-' + Math.random().toString(36).slice(2, 6)
      }

      const { data: newBuild, error: err } = await supabase
        .from('builds')
        .insert({
          user_id: userId,
          year: parseInt(year), make, model, chassis_code: chassis || null,
          title, slug, description, specs: specsObj, status: newStatus,
        })
        .select()
        .single()

      if (err) { setError(err.message); setSaving(false); return }
      router.push(`/create?id=${newBuild.id}`)
    }

    setSaving(false)
  }

  // ── Photos ─────────────────────────────────────────────────────────────────

  async function handleFileSelect(files) {
    if (!isEdit || uploading) return
    setUploading(true)
    const supabase = createClient()

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue
      if (file.size > 10 * 1024 * 1024) continue // 10MB max

      const ext = file.name.split('.').pop()
      const path = `${build.id}/${Date.now()}.${ext}`

      const { error: uploadErr } = await supabase.storage
        .from('build-photos')
        .upload(path, file)

      if (uploadErr) continue

      const { data: { publicUrl } } = supabase.storage
        .from('build-photos')
        .getPublicUrl(path)

      const isPrimary = photos.length === 0
      const { data: photo } = await supabase
        .from('build_photos')
        .insert({ build_id: build.id, url: publicUrl, position: photos.length, is_primary: isPrimary })
        .select()
        .single()

      if (photo) setPhotos(prev => [...prev, photo])
    }

    setUploading(false)
  }

  async function setPrimaryPhoto(photoId) {
    const supabase = createClient()
    await supabase.from('build_photos').update({ is_primary: false }).eq('build_id', build.id)
    await supabase.from('build_photos').update({ is_primary: true }).eq('id', photoId)
    setPhotos(prev => prev.map(p => ({ ...p, is_primary: p.id === photoId })))
  }

  async function deletePhoto(photoId) {
    const supabase = createClient()
    await supabase.from('build_photos').delete().eq('id', photoId)
    setPhotos(prev => prev.filter(p => p.id !== photoId))
  }

  // ── Mods ───────────────────────────────────────────────────────────────────

  async function deleteMod(modId) {
    const supabase = createClient()
    await supabase.from('mods').delete().eq('id', modId)
    const updated = mods.filter(m => m.id !== modId)
    setMods(updated)
    await supabase.from('builds').update({ mod_count: updated.length }).eq('id', build.id)
  }

  function handleModSaved(savedMod) {
    if (editingMod) {
      setMods(prev => prev.map(m => m.id === savedMod.id ? savedMod : m))
    } else {
      const updated = [...mods, savedMod]
      setMods(updated)
      const supabase = createClient()
      supabase.from('builds').update({ mod_count: updated.length }).eq('id', build.id)
    }
    setShowModForm(false)
    setEditingMod(null)
  }

  // ── Specs helpers ──────────────────────────────────────────────────────────

  function updateSpec(i, key, value) {
    setSpecs(prev => prev.map((row, idx) => idx === i ? [key, value] : row))
  }
  function addSpec() { setSpecs(prev => [...prev, ['', '']]) }
  function removeSpec(i) { setSpecs(prev => prev.filter((_, idx) => idx !== i)) }

  // Group mods by category for display
  const modsByCategory = mods.reduce((acc, mod) => {
    if (!acc[mod.category]) acc[mod.category] = []
    acc[mod.category].push(mod)
    return acc
  }, {})

  const inputClass = 'w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent'

  return (
    <div className="flex flex-col gap-8">

      {/* ── Car Info ── */}
      <section className="border border-gray-100 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Car</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Year *</label>
            <input
              type="number"
              value={year}
              onChange={e => setYear(e.target.value)}
              placeholder="2023"
              min="1900"
              max="2030"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Make *</label>
            <input
              value={make}
              onChange={e => setMake(e.target.value)}
              placeholder="BMW"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Model *</label>
            <input
              value={model}
              onChange={e => setModel(e.target.value)}
              placeholder="M3"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Chassis Code</label>
            <input
              value={chassis}
              onChange={e => setChassis(e.target.value)}
              placeholder="G80"
              className={inputClass}
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Tell the story of your build…"
              rows={4}
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>
      </section>

      {/* ── Specs ── */}
      <section className="border border-gray-100 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Specs</h2>
        <div className="flex flex-col gap-2 mb-3">
          {specs.map(([key, value], i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                value={key}
                onChange={e => updateSpec(i, e.target.value, value)}
                placeholder="Engine"
                className={`${inputClass} flex-1`}
              />
              <input
                value={value}
                onChange={e => updateSpec(i, key, e.target.value)}
                placeholder="S58 3.0L Twin-Turbo"
                className={`${inputClass} flex-[2]`}
              />
              <button
                onClick={() => removeSpec(i)}
                className="text-gray-300 hover:text-red-400 text-lg leading-none px-1"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addSpec}
          className="text-sm text-brand-red hover:text-brand-red-dark font-medium"
        >
          + Add spec
        </button>
      </section>

      {/* ── Photos (edit mode only) ── */}
      {isEdit && (
        <section className="border border-gray-100 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">
            Photos ({photos.length}/10)
          </h2>

          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-4">
              {photos.map(photo => (
                <div key={photo.id} className="relative group aspect-video rounded-lg overflow-hidden bg-gray-100">
                  <Image src={photo.url} alt="Build photo" fill className="object-cover" sizes="200px" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {!photo.is_primary && (
                      <button
                        onClick={() => setPrimaryPhoto(photo.id)}
                        className="text-xs bg-white text-gray-900 px-2 py-1 rounded font-medium"
                      >
                        Set Primary
                      </button>
                    )}
                    <button
                      onClick={() => deletePhoto(photo.id)}
                      className="text-xs bg-red-500 text-white px-2 py-1 rounded font-medium"
                    >
                      Remove
                    </button>
                  </div>
                  {photo.is_primary && (
                    <div className="absolute top-1 left-1 text-xs bg-brand-red text-white px-1.5 py-0.5 rounded font-medium">
                      Primary
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {photos.length < 10 && (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); handleFileSelect(e.dataTransfer.files) }}
              className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center cursor-pointer hover:border-brand-red hover:bg-brand-red-light transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={e => handleFileSelect(e.target.files)}
              />
              <p className="text-sm text-gray-400">
                {uploading ? 'Uploading…' : 'Drag & drop photos here, or click to select'}
              </p>
              <p className="text-xs text-gray-300 mt-1">Max 10MB per photo · JPG, PNG, WebP</p>
            </div>
          )}
        </section>
      )}

      {/* ── Mods (edit mode only) ── */}
      {isEdit && (
        <section className="border border-gray-100 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">
              Mods ({mods.length})
            </h2>
            {!showModForm && (
              <button
                onClick={() => { setEditingMod(null); setShowModForm(true) }}
                className="text-sm font-semibold text-brand-red hover:text-brand-red-dark"
              >
                + Add Mod
              </button>
            )}
          </div>

          {/* Mod form */}
          {showModForm && (
            <div className="mb-6">
              <ModForm
                buildId={build.id}
                mod={editingMod}
                modCount={mods.length}
                onSave={handleModSaved}
                onCancel={() => { setShowModForm(false); setEditingMod(null) }}
              />
            </div>
          )}

          {/* Mods list */}
          {mods.length === 0 && !showModForm ? (
            <p className="text-sm text-gray-300 py-4 text-center">
              No mods yet. Click &ldquo;+ Add Mod&rdquo; to get started.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {Object.entries(modsByCategory).map(([cat, catMods]) => (
                <div key={cat}>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[cat] || 'bg-gray-100 text-gray-600'}`}>
                    {cat}
                  </span>
                  <div className="mt-2 border border-gray-100 rounded-lg divide-y divide-gray-50">
                    {catMods.map(mod => (
                      <div key={mod.id} className="flex items-center gap-3 px-4 py-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{mod.name}</p>
                          {mod.brand && <p className="text-xs text-gray-400">{mod.brand}</p>}
                        </div>
                        <button
                          onClick={() => { setEditingMod(mod); setShowModForm(true) }}
                          className="text-xs text-gray-400 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteMod(mod.id)}
                          className="text-xs text-gray-400 hover:text-red-500 px-2 py-1 rounded hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── Save bar ── */}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">{error}</p>
      )}

      <div className="flex items-center gap-3 pb-8">
        <button
          onClick={() => saveBuild(false)}
          disabled={saving}
          className="px-5 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60"
        >
          {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Draft'}
        </button>
        <button
          onClick={() => saveBuild(true)}
          disabled={saving}
          className="px-5 py-2.5 bg-brand-red text-white text-sm font-semibold rounded-lg hover:bg-brand-red-dark transition-colors disabled:opacity-60"
        >
          {status === 'published' ? 'Save & View' : 'Publish Build'}
        </button>
        {!isEdit && (
          <p className="text-xs text-gray-400 ml-2">
            Save as draft first, then add photos and mods.
          </p>
        )}
      </div>
    </div>
  )
}
