import { supabase } from '@/lib/supabase'
import type { CardStats, Event } from '@/lib/database.types'
import { useQuery } from '@tanstack/react-query'
import { generateVisitorId } from '@/lib/utils'

export async function trackEvent(
  cardId: string,
  type: Event['type'],
  source: Event['source'] = 'direct'
): Promise<void> {
  await supabase.from('events').insert({
    card_id: cardId,
    type,
    source,
    visitor_id: generateVisitorId(),
  } as never)
}

export async function getCardStats(cardId: string): Promise<CardStats | null> {
  const { data } = await supabase
    .from('card_stats')
    .select('*')
    .eq('card_id', cardId)
    .maybeSingle()
  return (data as CardStats | null)
}

export async function getRecentEvents(cardId: string, limit = 20): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('card_id', cardId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data || []) as Event[]
}

export function useCardStats(cardId: string | undefined) {
  return useQuery({
    queryKey: ['stats', cardId],
    queryFn: () => getCardStats(cardId!),
    enabled: !!cardId,
    refetchInterval: 60_000,
  })
}

export function useRecentEvents(cardId: string | undefined) {
  return useQuery({
    queryKey: ['events', cardId],
    queryFn: () => getRecentEvents(cardId!),
    enabled: !!cardId,
    staleTime: 30_000,
  })
}
