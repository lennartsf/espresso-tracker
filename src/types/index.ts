export interface Coffee {
  id: string
  name: string
  roaster: string | null
  origin: string | null
  roast_date: string | null
  notes: string | null
  created_at: string
}

export interface Shot {
  id: string
  coffee_id: string
  grind_setting: number
  dose_g: number | null
  yield_g: number | null
  brew_time_s: number | null
  temp_c: number | null
  rating: number
  tasting_notes: string | null
  pulled_at: string
  created_at: string
}

export type NewCoffee = Omit<Coffee, 'id' | 'created_at'>
export type NewShot = Omit<Shot, 'id' | 'created_at'>
