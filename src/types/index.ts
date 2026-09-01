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
  /** Feiner Röstgrad 1.00–10.00 (Paket D). `roast_level` bleibt daneben als
   *  gerundeter Wert bestehen, damit Badges und Filter weiterlaufen. */
  roast_level_fine: number | null
  origin_country: string | null
  origin_region: string | null
  altitude_m: number | null
  photo_url: string | null
  // Roaster's recommended recipe (single, as printed on the bag) — all optional
  rec_dose_g: number | null
  rec_yield_g: number | null
  rec_temp_c: number | null
  rec_time_s: number | null
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
  preinfusion_s: number | null
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

export interface BrewDevice {
  id: string
  name: string
  brand: string | null
  device_type: string | null
  notes: string | null
  is_favorite: boolean
  created_at: string
}

export type NewBrewDevice = Omit<BrewDevice, 'id' | 'created_at'>

export interface EquipmentDefault {
  method: string
  grinder_id: string | null
  machine_id: string | null
  basket_id: string | null
  brew_device_id: string | null
}

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
  brew_device_id: string | null
  tasting_notes: string | null
  bloom_ml: number | null
  bloom_time_s: number | null
  inverted: boolean
  first_stir_s: number | null
  brewed_at: string
  created_at: string
}

export type NewBrew = Omit<Brew, 'id' | 'created_at'>

/** Eine Zeile je User; `layout` ist die serialisierte Widget-Reihenfolge.
 *  Siehe `src/utils/dashboardWidgets.ts` fuer die Bedeutung der IDs. */
export interface DashboardLayout {
  user_id: string
  layout: DashboardLayoutEntry[]
  updated_at: string
}

/** Ein Eintrag = ein Widget plus Sichtbarkeit. Die Reihenfolge im Array IST
 *  die Reihenfolge auf dem Dashboard. */
export interface DashboardLayoutEntry {
  id: string
  visible: boolean
}

/** Ein eigenes Rezept fuer eine Bohne.
 *  Das ROESTER-Rezept ist keine Zeile hier — es steht in `coffees.rec_*` und
 *  bleibt als Referenz unveraendert. `matches_roaster` markiert ein eigenes
 *  Rezept als deckungsgleich damit. */
export interface CoffeeRecipe {
  id: string
  coffee_id: string
  user_id: string
  name: string
  dose_g: number | null
  yield_g: number | null
  temp_c: number | null
  time_s: number | null
  /** Mühle, auf die sich `grind_setting` bezieht. Ohne sie ist die Zahl
   *  bedeutungslos — Mahlgradskalen sind zwischen Mühlen nicht vergleichbar. */
  grinder_id: string | null
  grind_setting: number | null
  /** Freie Notiz zum Rezept. Hieß bis 2026-09-01 „Grind hint" und trug den
   *  Mahlgrad als Text; der steckt jetzt in `grinder_id` + `grind_setting`. */
  grind_hint: string | null
  is_default: boolean
  matches_roaster: boolean
  created_at: string
}

export type NewCoffeeRecipe = Omit<CoffeeRecipe, 'id' | 'user_id' | 'created_at'>
