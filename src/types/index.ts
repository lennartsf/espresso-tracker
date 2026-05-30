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
  bitterness_score: number | null
  brew_ratio: number | null
  pressure_bar: number | null
  tasting_notes: string | null
  used_rdt: boolean
  used_wdt: boolean
  used_leveler: boolean
  grinder_id: string | null
  machine_id: string | null
  basket_id: string | null
  drink_type: string
  milk_type: string | null
  milk_ml: number | null
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
  grinder_type: string | null
  burr_size_mm: number | null
  motor_watt: number | null
  stepless: boolean
  has_hopper: boolean
  is_favorite: boolean
  created_at: string
}

export interface Machine {
  id: string
  name: string
  brand: string | null
  notes: string | null
  funktionsweise: string | null
  brew_group_type: string | null
  brew_group_size_mm: number | null
  is_favorite: boolean
  created_at: string
}

export interface Basket {
  id: string
  name: string
  brand: string | null
  diameter_mm: number | null
  size_g: number | null
  notes: string | null
  is_favorite: boolean
  created_at: string
}

export type NewGrinder = Omit<Grinder, 'id' | 'created_at'>
export type NewMachine = Omit<Machine, 'id' | 'created_at'>
export type NewBasket = Omit<Basket, 'id' | 'created_at'>

export interface Brew {
  id: string
  coffee_id: string
  grinder_id: string | null
  brew_method: string
  grind_setting: number | null
  dose_g: number | null
  water_ml: number | null
  temp_c: number | null
  brew_time_s: number | null
  rating: number
  acidity_score: number | null
  bitterness_score: number | null
  tasting_notes: string | null
  bloom_ml: number | null
  bloom_time_s: number | null
  inverted: boolean
  first_stir_s: number | null
  brewed_at: string
  created_at: string
}

export type NewBrew = Omit<Brew, 'id' | 'created_at'>
