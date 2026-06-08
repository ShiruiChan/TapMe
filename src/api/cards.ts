import { supabase } from '@/lib/supabase'
import type { Card } from '@/lib/database.types'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/store/auth'

export async function getMyCard(userId: string): Promise<Card | null> {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return data as Card | null
}

export async function getCardBySlug(slug: string): Promise<Card | null> {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('slug', slug)
    .eq('is_public', true)
    .maybeSingle()
  if (error) throw error
  return data as Card | null
}

export async function upsertCard(userId: string, updates: Partial<Card>): Promise<Card> {
  const { data, error } = await supabase
    .from('cards')
    .upsert({ ...updates, user_id: userId }, { onConflict: 'user_id' })
    .select()
    .single()
  if (error) throw error
  return data as Card
}

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg'
  const path = `${userId}/avatar_${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
  if (error) throw error
  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return data.publicUrl
}

export function useMyCard() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['card', user?.id],
    queryFn: () => getMyCard(user!.id),
    enabled: !!user,
  })
}

export function useUpsertCard() {
  const { user } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (updates: Partial<Card>) => upsertCard(user!.id, updates),
    onSuccess: (data) => {
      qc.setQueryData(['card', user?.id], data)
    },
  })
}
