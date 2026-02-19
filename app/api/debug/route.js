import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()

  // Test 1: simple query
  const { data: simple, error: e1 } = await supabase
    .from('builds')
    .select('id, slug, status')
    .eq('status', 'published')
    .limit(3)

  // Test 2: getBuildBySlug query
  const { data: full, error: e2 } = await supabase
    .from('builds')
    .select('id, title, slug, status, profile:profiles!user_id (username), build_photos (id), mods (*)')
    .eq('slug', '2023-bmw-m3-g80-max')
    .eq('status', 'published')
    .single()

  return Response.json({
    env: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 30) + '...',
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
    simpleQuery: { count: simple?.length ?? 0, error: e1?.message ?? null },
    fullQuery: { title: full?.title ?? null, error: e2?.message ?? null, code: e2?.code ?? null },
  })
}
