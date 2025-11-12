export type SkinType = 'oily' | 'dry' | 'combination' | 'sensitive'
export type ProductCategory = 'cleanser' | 'toner' | 'serum' | 'moisturizer' | 'sunscreen' | 'treatment' | 'other'
export type StepType = 'cleanse' | 'treat' | 'hydrate' | 'spf' | 'other'
export type Period = 'morning' | 'night'
export type Suitability = 'good' | 'neutral' | 'avoid'
export type PhotoKind = 'before' | 'after' | 'progress'

export interface SkinProfile {
  id: string
  user_id: string
  skin_type: SkinType
  age?: number
  concerns: string[]
  budget_monthly?: number
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  user_id: string
  name: string
  brand?: string
  category: ProductCategory
  key_actives: string[]
  notes?: string
  suitability?: Suitability
  price_opt?: number
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
  product_id?: string
  step_order: number
  step_type: StepType
  ai_notes?: string
  created_at: string
  product?: Product
}

export interface UsageLog {
  id: string
  user_id: string
  routine_item_id: string
  used_at: string
}

export interface AIAnalysis {
  id: string
  user_id: string
  image_url?: string
  raw_extracted_text?: string
  parsed_product?: string
  purpose?: string
  when_to_use?: string
  compatibility?: string
  alt_suggestion?: string
  full_ai_response?: any
  created_at: string
}

export interface Photo {
  id: string
  user_id: string
  kind: PhotoKind
  image_url: string
  created_at: string
}

export interface ProductAnalysisResult {
  product_name: string
  product_type: ProductCategory
  key_actives: string[]
  purpose: string
  when_to_use: 'morning' | 'night' | 'both'
  instructions: string
  compatibility: Suitability
  reason: string
  recommended_alternative?: {
    type: string
    why: string
    price_hint: string
  }
  routine_step_type: StepType
}
