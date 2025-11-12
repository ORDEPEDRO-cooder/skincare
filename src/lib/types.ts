// Database types
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      skin_profiles: {
        Row: {
          id: string
          user_id: string
          skin_type: 'oily' | 'dry' | 'combination' | 'sensitive'
          age: number | null
          concerns: string[]
          budget_monthly: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          skin_type: 'oily' | 'dry' | 'combination' | 'sensitive'
          age?: number | null
          concerns?: string[]
          budget_monthly?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          skin_type?: 'oily' | 'dry' | 'combination' | 'sensitive'
          age?: number | null
          concerns?: string[]
          budget_monthly?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          user_id: string
          name: string
          brand: string | null
          category: 'cleanser' | 'toner' | 'serum' | 'moisturizer' | 'sunscreen' | 'treatment' | 'other'
          key_actives: string[]
          notes: string | null
          suitability: 'good' | 'neutral' | 'avoid' | null
          price_opt: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          brand?: string | null
          category: 'cleanser' | 'toner' | 'serum' | 'moisturizer' | 'sunscreen' | 'treatment' | 'other'
          key_actives?: string[]
          notes?: string | null
          suitability?: 'good' | 'neutral' | 'avoid' | null
          price_opt?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          brand?: string | null
          category?: 'cleanser' | 'toner' | 'serum' | 'moisturizer' | 'sunscreen' | 'treatment' | 'other'
          key_actives?: string[]
          notes?: string | null
          suitability?: 'good' | 'neutral' | 'avoid' | null
          price_opt?: number | null
          created_at?: string
        }
      }
      routines: {
        Row: {
          id: string
          user_id: string
          day_of_week: number
          period: 'morning' | 'night'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          day_of_week: number
          period: 'morning' | 'night'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          day_of_week?: number
          period?: 'morning' | 'night'
          created_at?: string
          updated_at?: string
        }
      }
      routine_items: {
        Row: {
          id: string
          routine_id: string
          product_id: string | null
          step_order: number
          step_type: 'cleanse' | 'treat' | 'hydrate' | 'spf' | 'other'
          ai_notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          routine_id: string
          product_id?: string | null
          step_order: number
          step_type: 'cleanse' | 'treat' | 'hydrate' | 'spf' | 'other'
          ai_notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          routine_id?: string
          product_id?: string | null
          step_order?: number
          step_type?: 'cleanse' | 'treat' | 'hydrate' | 'spf' | 'other'
          ai_notes?: string | null
          created_at?: string
        }
      }
      usage_logs: {
        Row: {
          id: string
          user_id: string
          routine_item_id: string
          used_at: string
        }
        Insert: {
          id?: string
          user_id: string
          routine_item_id: string
          used_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          routine_item_id?: string
          used_at?: string
        }
      }
      ai_analyses: {
        Row: {
          id: string
          user_id: string
          image_url: string | null
          raw_extracted_text: string | null
          parsed_product: string | null
          purpose: string | null
          when_to_use: string | null
          compatibility: string | null
          alt_suggestion: string | null
          full_ai_response: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          image_url?: string | null
          raw_extracted_text?: string | null
          parsed_product?: string | null
          purpose?: string | null
          when_to_use?: string | null
          compatibility?: string | null
          alt_suggestion?: string | null
          full_ai_response?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          image_url?: string | null
          raw_extracted_text?: string | null
          parsed_product?: string | null
          purpose?: string | null
          when_to_use?: string | null
          compatibility?: string | null
          alt_suggestion?: string | null
          full_ai_response?: Json | null
          created_at?: string
        }
      }
      photos: {
        Row: {
          id: string
          user_id: string
          kind: 'before' | 'after' | 'progress'
          image_url: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          kind: 'before' | 'after' | 'progress'
          image_url: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          kind?: 'before' | 'after' | 'progress'
          image_url?: string
          created_at?: string
        }
      }
    }
  }
}

// App types
export type SkinType = 'oily' | 'dry' | 'combination' | 'sensitive'
export type ProductCategory = 'cleanser' | 'toner' | 'serum' | 'moisturizer' | 'sunscreen' | 'treatment' | 'other'
export type StepType = 'cleanse' | 'treat' | 'hydrate' | 'spf' | 'other'
export type Period = 'morning' | 'night'
export type PhotoKind = 'before' | 'after' | 'progress'
export type Suitability = 'good' | 'neutral' | 'avoid'

export interface SkinProfile {
  id: string
  user_id: string
  skin_type: SkinType
  age: number | null
  concerns: string[]
  budget_monthly: number | null
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  user_id: string
  name: string
  brand: string | null
  category: ProductCategory
  key_actives: string[]
  notes: string | null
  suitability: Suitability | null
  price_opt: number | null
  created_at: string
}

export interface Routine {
  id: string
  user_id: string
  day_of_week: number
  period: Period
  created_at: string
  updated_at: string
}

export interface RoutineItem {
  id: string
  routine_id: string
  product_id: string | null
  step_order: number
  step_type: StepType
  ai_notes: string | null
  created_at: string
  product?: Product
}

export interface AIProductAnalysis {
  product_name: string
  product_type: string
  key_actives: string[]
  purpose: string
  when_to_use: 'morning' | 'night' | 'both'
  instructions: string
  compatibility: 'good' | 'neutral' | 'avoid'
  reason: string
  recommended_alternative?: {
    type: string
    why: string
    price_hint: string
  }
  routine_step_type: StepType
}
