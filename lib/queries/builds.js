// All build-related database queries.
// Pass the supabase client from the calling page/component.

export async function getBuildBySlug(supabase, slug) {
  const { data, error } = await supabase
    .from('builds')
    .select(`
      *,
      profile:profiles!user_id (username, display_name, avatar_url, instagram, website),
      build_photos (id, url, position, is_primary),
      mods (*)
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error || !data) return null

  // Sort photos by position, mods by position
  if (data.build_photos) {
    data.build_photos.sort((a, b) => a.position - b.position)
  }
  if (data.mods) {
    data.mods.sort((a, b) => a.position - b.position)
  }

  return data
}

export async function getPublishedBuilds(supabase, {
  chassis,
  q,
  sort = 'newest',
  limit = 24,
  offset = 0,
} = {}) {
  let query = supabase
    .from('builds')
    .select(`
      id, title, slug, year, make, model, chassis_code, mod_count, view_count, created_at,
      profile:profiles!user_id (username, display_name),
      build_photos (url, is_primary)
    `, { count: 'exact' })
    .eq('status', 'published')

  if (chassis) {
    query = query.eq('chassis_code', chassis)
  }

  if (q) {
    query = query.or(`make.ilike.%${q}%,model.ilike.%${q}%,title.ilike.%${q}%`)
  }

  if (sort === 'most_mods') {
    query = query.order('mod_count', { ascending: false })
  } else if (sort === 'most_viewed') {
    query = query.order('view_count', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  query = query.range(offset, offset + limit - 1)

  const { data, error, count } = await query
  if (error) return { builds: [], total: 0 }
  return { builds: data || [], total: count || 0 }
}

export async function getFeaturedBuilds(supabase, limit = 6) {
  const { builds } = await getPublishedBuilds(supabase, { limit, sort: 'newest' })
  return builds
}
