'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MOD_CATEGORIES } from '@/lib/constants/categories'
import { POPULAR_VEHICLES } from '@/lib/constants/vehicles'

const BUILD_GOALS = ['Daily Driver', 'Track Build', 'Show Car', 'Drift Build', 'Off-Road', 'Time Attack']

const YEARS = Array.from({ length: 40 }, (_, i) => 2024 - i)
const MAKES = [...new Set(POPULAR_VEHICLES.map(v => v.make))].sort()

export default function OnboardingModal({ open }) {
  const router = useRouter()

  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)

  // Step 2
  const [year, setYear] = useState('')
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [chassisCode, setChassisCode] = useState('')

  // Step 3
  const [selectedCategories, setSelectedCategories] = useState([])

  // Step 4
  const [displayName, setDisplayName] = useState('')
  const [location, setLocation] = useState('')
  const [buildGoal, setBuildGoal] = useState('')

  // Step 5
  const [popularBuilds, setPopularBuilds] = useState([])

  if (!open) return null

  function close() {
    router.replace('/')
  }

  function handleMakeChange(newMake) {
    setMake(newMake)
    setModel('')
    setChassisCode('')
  }

  const modelsForMake = POPULAR_VEHICLES.filter(v => v.make === make)
  const uniqueModels = [...new Set(modelsForMake.map(v => v.model))]

  function handleModelChange(newModel) {
    setModel(newModel)
    const matching = modelsForMake.filter(v => v.model === newModel)
    if (matching.length === 1) setChassisCode(matching[0].chassis_code)
    else setChassisCode('')
  }

  function toggleCategory(cat) {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  async function handleFinish() {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const updates = {}
      if (displayName) updates.display_name = displayName
      if (location) updates.location = location
      if (buildGoal) updates.build_goal = buildGoal

      if (Object.keys(updates).length > 0) {
        await supabase.from('profiles').update(updates).eq('id', user.id)
      }
    }

    // Fetch popular builds for their car
    let builds = []
    if (make) {
      let query = supabase
        .from('builds')
        .select('id, slug, title, year, make, model, photos')
        .eq('make', make)
        .eq('status', 'published')
      if (model) query = query.eq('model', model)
      const { data } = await query.order('created_at', { ascending: false }).limit(3)
      builds = data || []
    }

    setPopularBuilds(builds)
    setSaving(false)
    setStep(5)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Step 1: Welcome */}
        {step === 1 && (
          <>
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-8 py-10 text-center">
              <div className="w-14 h-14 bg-brand-red rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 17H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2z"/><path d="M17 17v2a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-2"/><circle cx="7.5" cy="11.5" r="1.5"/><path d="M8.5 11.5h7"/>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Welcome to Mod Hub</h2>
              <p className="text-gray-400 text-sm">Let's set up your garage in 2 minutes.</p>
            </div>
            <div className="px-8 py-6 flex flex-col gap-3">
              <button
                onClick={() => setStep(2)}
                className="w-full py-3 bg-brand-red text-white font-semibold rounded-lg hover:bg-brand-red-dark transition-colors"
              >
                Set Up Your Garage →
              </button>
              <button
                onClick={close}
                className="w-full py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Skip for now
              </button>
            </div>
          </>
        )}

        {/* Step 2: Add Vehicle */}
        {step === 2 && (
          <>
            <div className="px-6 pt-6 pb-2 flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-brand-red mb-1">Step 1 of 3</p>
                <h2 className="text-lg font-bold text-gray-900">Add Your First Vehicle</h2>
                <p className="text-sm text-gray-400 mt-0.5">Tell us what you drive.</p>
              </div>
              <button onClick={close} className="text-gray-300 hover:text-gray-500 text-2xl leading-none mt-1">×</button>
            </div>
            <div className="px-6 py-4 flex flex-col gap-3">
              <select
                value={year}
                onChange={e => setYear(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-red bg-white"
              >
                <option value="">Year</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <select
                value={make}
                onChange={e => handleMakeChange(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-red bg-white"
              >
                <option value="">Make</option>
                {MAKES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              {make && (
                <select
                  value={model}
                  onChange={e => handleModelChange(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-red bg-white"
                >
                  <option value="">Model</option>
                  {uniqueModels.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              )}
              <input
                type="text"
                placeholder="Chassis Code (optional — e.g. E46, ND)"
                value={chassisCode}
                onChange={e => setChassisCode(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
              />
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-medium rounded-lg hover:bg-gray-50 text-sm transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-2.5 bg-brand-red text-white font-semibold rounded-lg hover:bg-brand-red-dark transition-colors text-sm"
              >
                Next →
              </button>
            </div>
          </>
        )}

        {/* Step 3: Categories */}
        {step === 3 && (
          <>
            <div className="px-6 pt-6 pb-2 flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-brand-red mb-1">Step 2 of 3</p>
                <h2 className="text-lg font-bold text-gray-900">What do you mod?</h2>
                <p className="text-sm text-gray-400 mt-0.5">Select all that apply.</p>
              </div>
              <button onClick={close} className="text-gray-300 hover:text-gray-500 text-2xl leading-none mt-1">×</button>
            </div>
            <div className="px-6 py-4 grid grid-cols-3 gap-2">
              {MOD_CATEGORIES.filter(c => c !== 'Other').map(cat => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`px-2 py-3 rounded-xl border text-xs font-medium text-center transition-all ${
                    selectedCategories.includes(cat)
                      ? 'border-brand-red bg-brand-red-light text-brand-red'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-medium rounded-lg hover:bg-gray-50 text-sm transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="flex-1 py-2.5 bg-brand-red text-white font-semibold rounded-lg hover:bg-brand-red-dark transition-colors text-sm"
              >
                Next →
              </button>
            </div>
          </>
        )}

        {/* Step 4: Profile */}
        {step === 4 && (
          <>
            <div className="px-6 pt-6 pb-2 flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-brand-red mb-1">Step 3 of 3</p>
                <h2 className="text-lg font-bold text-gray-900">Complete Your Profile</h2>
                <p className="text-sm text-gray-400 mt-0.5">All fields are optional.</p>
              </div>
              <button onClick={close} className="text-gray-300 hover:text-gray-500 text-2xl leading-none mt-1">×</button>
            </div>
            <div className="px-6 py-4 flex flex-col gap-3">
              <input
                type="text"
                placeholder="Display Name"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
              />
              <input
                type="text"
                placeholder="Location (e.g. Los Angeles, CA)"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
              />
              <div>
                <p className="text-xs text-gray-500 mb-2 font-medium">Build Goal</p>
                <div className="grid grid-cols-3 gap-2">
                  {BUILD_GOALS.map(goal => (
                    <button
                      key={goal}
                      onClick={() => setBuildGoal(buildGoal === goal ? '' : goal)}
                      className={`px-2 py-2 rounded-lg border text-xs font-medium transition-all ${
                        buildGoal === goal
                          ? 'border-brand-red bg-brand-red-light text-brand-red'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-medium rounded-lg hover:bg-gray-50 text-sm transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleFinish}
                disabled={saving}
                className="flex-1 py-2.5 bg-brand-red text-white font-semibold rounded-lg hover:bg-brand-red-dark transition-colors text-sm disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Finish →'}
              </button>
            </div>
          </>
        )}

        {/* Step 5: Success */}
        {step === 5 && (
          <>
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-8 py-8 text-center">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-1">
                {make ? `Your ${make}${model ? ` ${model}` : ''} Garage` : 'Garage Set Up!'}
              </h2>
              <p className="text-gray-400 text-sm">
                {popularBuilds.length > 0 ? 'Check out these builds for inspiration.' : "You're all set. Time to build."}
              </p>
            </div>

            {popularBuilds.length > 0 && (
              <div className="px-6 pt-4 pb-2 flex flex-col gap-2">
                {popularBuilds.map(build => (
                  <a
                    key={build.id}
                    href={`/builds/${build.slug}`}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                  >
                    {build.photos?.[0] ? (
                      <img
                        src={build.photos[0]}
                        alt={build.title}
                        className="w-12 h-10 rounded-lg object-cover flex-none"
                      />
                    ) : (
                      <div className="w-12 h-10 rounded-lg bg-gray-100 flex-none" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{build.title}</p>
                      <p className="text-xs text-gray-400">{build.year} {build.make} {build.model}</p>
                    </div>
                  </a>
                ))}
              </div>
            )}

            <div className="px-6 py-4 flex flex-col gap-2">
              <a
                href="/create"
                className="block text-center py-2.5 bg-brand-red text-white font-semibold rounded-lg hover:bg-brand-red-dark transition-colors text-sm"
              >
                Add My First Build
              </a>
              <button
                onClick={close}
                className="w-full py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Explore Builds
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  )
}
