// All mod-related database queries.

export async function getModById(supabase, id) {
  const { data: mod, error } = await supabase
    .from('mods')
    .select(`
      *,
      build:builds!build_id(
        id, slug, title, year, make, model, chassis_code, user_id, status,
        profile:profiles!user_id(username, display_name, avatar_url)
      )
    `)
    .eq('id', id)
    .single()

  if (error || !mod) return null

  // Fetch related mods: same name (case-insensitive), different id, from published builds
  const { data: related } = await supabase
    .from('mods')
    .select(`
      id, name, brand, install_status, would_install_again, install_notes,
      build:builds!build_id(id, slug, title, year, make, model, chassis_code, status)
    `)
    .ilike('name', mod.name)
    .neq('id', id)
    .limit(10)

  return { ...mod, related: (related || []).filter(r => r.build?.status === 'published') }
}

export async function getModsByBuildId(supabase, buildId) {
  const { data, error } = await supabase
    .from('mods')
    .select('*')
    .eq('build_id', buildId)
    .order('position')

  if (error) return []
  return data || []
}

// Used on the Shop page — all mods across all published builds
export async function getShopMods(supabase, { category, chassis, sort = 'newest', limit = 48, offset = 0 } = {}) {
  let query = supabase
    .from('mods')
    .select(`
      id, name, brand, category, image_url, shop_url, url,
      would_install_again, install_status, created_at,
      build:builds!build_id (id, slug, title, year, make, model, chassis_code, status)
    `)
    .eq('build.status', 'published')

  if (category) {
    query = query.eq('category', category)
  }

  if (chassis) {
    query = query.eq('build.chassis_code', chassis)
  }

  query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1)

  const { data, error } = await query
  if (error) return []
  return (data || []).filter(mod => mod.build)
}
