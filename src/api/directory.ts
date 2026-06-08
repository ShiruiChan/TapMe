import { supabase } from '@/lib/supabase'
import type { Card, Profile } from '@/lib/database.types'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/store/auth'

export interface TeamMember {
  profile: Profile
  card: Card
}

export async function getTeamMembers(orgId: string | null | undefined): Promise<TeamMember[]> {
  if (!orgId) {
    const { data: cards, error } = await supabase
      .from('cards')
      .select('*, profiles!inner(*)')
      .eq('is_public', true)
      .not('name', 'is', null)
      .order('updated_at', { ascending: false })
    if (error) throw error
    return ((cards || []) as Array<Card & { profiles: Profile }>).map(c => ({
      profile: c.profiles,
      card: c,
    }))
  }

  const { data: profiles, error: pErr } = await supabase
    .from('profiles')
    .select('*, cards(*)')
    .eq('org_id', orgId)
  if (pErr) throw pErr

  return ((profiles || []) as Array<Profile & { cards: Card[] }>)
    .filter(p => p.cards && p.cards.length > 0)
    .map(p => ({
      profile: p,
      card: p.cards[0],
    }))
}

export function useTeamMembers() {
  const { profile } = useAuth()
  return useQuery({
    queryKey: ['team', profile?.org_id],
    queryFn: () => getTeamMembers(profile?.org_id),
    enabled: true,
    staleTime: 30_000,
  })
}
