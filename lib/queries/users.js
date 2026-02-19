export async function getUserProfile(supabase, userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) return null
  return data
}

export async function getUserBuilds(supabase, userId) {
  const { data, error } = await supabase
    .from('builds')
    .select(`
      id, title, slug, year, make, model, chassis_code,
      status, mod_count, created_at, updated_at,
      build_photos (url, is_primary)
    `)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) return []
  return data || []
}
