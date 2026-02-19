// All mod-related database queries.

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
