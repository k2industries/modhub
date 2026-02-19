import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BuildForm from '@/components/forms/BuildForm'

export async function generateMetadata({ searchParams }) {
  return { title: searchParams.id ? 'Edit Build' : 'Add a Car' }
}

export default async function CreatePage({ searchParams }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()

  let build = null
  if (searchParams.id) {
    const { data } = await supabase
      .from('builds')
      .select('*, build_photos(*), mods(*)')
      .eq('id', searchParams.id)
      .eq('user_id', user.id) // Security: only owner can edit
      .single()

    if (!data) redirect('/my-builds') // Doesn't belong to this user
    build = data
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {build ? `Edit: ${build.title}` : 'Add a Car'}
        </h1>
        {!build && (
          <p className="text-sm text-gray-400 mt-1">
            Start by entering your car details. You can add photos and mods after saving.
          </p>
        )}
      </div>

      <BuildForm
        build={build}
        userId={user.id}
        username={profile?.username}
      />
    </div>
  )
}
