export interface Roaster {
  id: string
  name: string
  address: string | null
  lat: number | null
  lng: number | null
  website: string | null
  photo_url: string | null
  created_at: string
}

export interface Coffee {
  id: string
  name: string
  roaster: string | null
  roaster_id: string | null
  origin: string | null
  roast_date: string | null
  notes: string | null
  created_at: string
  arabica_pct: number | null
  robusta_pct: number | null
  roast_level: number | null
  origin_country: string | null
  origin_region: string | null
  altitude_m: number | null
  photo_url: string | null
}

export interface RoastDate {
  id: string
  coffee_id: string
  roast_date: string
  created_at: string
}

export interface Shot {
  id: string
  coffee_id: string
  roast_date_id: string | null
  grind_setting: number
  dose_g: number | null
  yield_g: number | null
  brew_time_s: number | null
  temp_c: number | null
  rating: number
  body_score: number | null
  acidity_score: number | null
  brew_ratio: number | null
  pressure_bar: number | null
  tasting_notes: string | null
  used_rdt: boolean
  used_wdt: boolean
  used_leveler: boolean
  grinder_id: string | null
  machine_id: string | null
  basket_id: string | null
  pulled_at: string
  created_at: string
}

export type NewRoaster = Omit<Roaster, 'id' | 'created_at'>
export type NewCoffee = Omit<Coffee, 'id' | 'created_at'>
export type NewRoastDate = Omit<RoastDate, 'id' | 'created_at'>
export type NewShot = Omit<Shot, 'id' | 'created_at'>

export interface Grinder {
  id: string
  name: string
  brand: string | null
  notes: string | null
  is_favorite: boolean
  created_at: string
}

export interface Machine {
  id: string
  name: string
  brand: string | null
  notes: string | null
  is_favorite: boolean
  created_at: string
}

export interface Basket {
  id: string
  name: string
  brand: string | null
  size_g: number | null
  notes: string | null
  is_favorite: boolean
  created_at: string
}

export type NewGrinder = Omit<Grinder, 'id' | 'created_at'>
export type NewMachine = Omit<Machine, 'id' | 'created_at'>
export type NewBasket = Omit<Basket, 'id' | 'created_at'>
