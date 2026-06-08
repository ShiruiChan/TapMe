export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      orgs: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          department: string | null
          org_id: string | null
          onboarded: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          department?: string | null
          org_id?: string | null
          onboarded?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          department?: string | null
          org_id?: string | null
          onboarded?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      cards: {
        Row: {
          id: string
          user_id: string
          slug: string
          name: string | null
          role: string | null
          company: string | null
          tagline: string | null
          bio: string | null
          location: string | null
          skills: string | null
          email: string | null
          phone: string | null
          website: string | null
          telegram: string | null
          vk: string | null
          instagram: string | null
          linkedin: string | null
          github: string | null
          behance: string | null
          color_hex: string
          avatar_url: string | null
          is_public: boolean
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          slug?: string
          name?: string | null
          role?: string | null
          company?: string | null
          tagline?: string | null
          bio?: string | null
          location?: string | null
          skills?: string | null
          email?: string | null
          phone?: string | null
          website?: string | null
          telegram?: string | null
          vk?: string | null
          instagram?: string | null
          linkedin?: string | null
          github?: string | null
          behance?: string | null
          color_hex?: string
          avatar_url?: string | null
          is_public?: boolean
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          slug?: string
          name?: string | null
          role?: string | null
          company?: string | null
          tagline?: string | null
          bio?: string | null
          location?: string | null
          skills?: string | null
          email?: string | null
          phone?: string | null
          website?: string | null
          telegram?: string | null
          vk?: string | null
          instagram?: string | null
          linkedin?: string | null
          github?: string | null
          behance?: string | null
          color_hex?: string
          avatar_url?: string | null
          is_public?: boolean
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: number
          card_id: string
          type: 'view' | 'save' | 'share'
          source: 'qr' | 'link' | 'nfc' | 'directory' | 'direct' | null
          visitor_id: string | null
          created_at: string
        }
        Insert: {
          id?: number
          card_id: string
          type: 'view' | 'save' | 'share'
          source?: 'qr' | 'link' | 'nfc' | 'directory' | 'direct' | null
          visitor_id?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          card_id?: string
          type?: 'view' | 'save' | 'share'
          source?: 'qr' | 'link' | 'nfc' | 'directory' | 'direct' | null
          visitor_id?: string | null
          created_at?: string
        }
      }
      tabs: {
        Row: {
          id: string
          org_id: string | null
          key: string
          title: string
          icon: string | null
          position: number
          scope: 'mobile' | 'desktop' | 'both'
          enabled: boolean
          config: Json
        }
        Insert: {
          id?: string
          org_id?: string | null
          key: string
          title: string
          icon?: string | null
          position?: number
          scope?: 'mobile' | 'desktop' | 'both'
          enabled?: boolean
          config?: Json
        }
        Update: {
          id?: string
          org_id?: string | null
          key?: string
          title?: string
          icon?: string | null
          position?: number
          scope?: 'mobile' | 'desktop' | 'both'
          enabled?: boolean
          config?: Json
        }
      }
    }
    Views: {
      card_stats: {
        Row: {
          card_id: string
          views: number
          saves: number
          shares: number
          views_week: number
        }
      }
    }
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Card = Database['public']['Tables']['cards']['Row']
export type Event = Database['public']['Tables']['events']['Row']
export type TabConfig = Database['public']['Tables']['tabs']['Row']
export type CardStats = Database['public']['Views']['card_stats']['Row']
