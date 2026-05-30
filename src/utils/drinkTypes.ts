export const DRINK_TYPES = [
  { value: 'espresso',        label: 'Espresso' },
  { value: 'cappuccino',      label: 'Cappuccino' },
  { value: 'latte_macchiato', label: 'Latte Macchiato' },
  { value: 'flat_white',      label: 'Flat White' },
  { value: 'cortado',         label: 'Cortado' },
  { value: 'macchiato',       label: 'Macchiato' },
] as const

export const MILK_TYPES = [
  { value: 'vollmilch_38', label: 'Vollmilch 3,8%' },
  { value: 'vollmilch_35', label: 'Vollmilch 3,5%' },
  { value: 'fettarm_15',   label: 'Fettarme Milch 1,5%' },
  { value: 'hafer',        label: 'Hafermilch' },
  { value: 'mandel',       label: 'Mandelmilch' },
  { value: 'kokos',        label: 'Kokosmilch' },
  { value: 'soja',         label: 'Sojamilch' },
] as const

export function drinkTypeLabel(value: string): string {
  return DRINK_TYPES.find(d => d.value === value)?.label ?? value
}

export function milkTypeLabel(value: string): string {
  return MILK_TYPES.find(m => m.value === value)?.label ?? value
}
