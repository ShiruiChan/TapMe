/// <reference types="vite/client" />
import type { ComponentType } from 'react'
import type { LucideProps } from 'lucide-react'
import type { Card, Profile, CardStats } from '@/lib/database.types'

export interface TabContext {
  card: Card | null
  profile: Profile | null
  stats: CardStats | null
}

export interface TabModule {
  key: string
  title: string
  Icon: ComponentType<LucideProps>
  position: number
  scope?: 'mobile' | 'desktop' | 'both'
  requiresCard?: boolean
  Component: ComponentType<{ ctx: TabContext }>
}

const modules = import.meta.glob('./*.tab.tsx', { eager: true })

export const TAB_REGISTRY: TabModule[] = (
  Object.values(modules) as Array<{ default?: TabModule }>
)
  .map(m => m.default)
  .filter((m): m is TabModule => Boolean(m))
  .sort((a, b) => a.position - b.position)
