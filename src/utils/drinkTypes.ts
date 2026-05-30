export const DRINK_TYPES = [
  { value: 'espresso',        label: 'Espresso' },
  { value: 'cappuccino',      label: 'Cappuccino' },
  { value: 'latte_macchiato', label: 'Latte Macchiato' },
  { value: 'flat_white',      label: 'Flat White' },
  { value: 'cortado',         label: 'Cortado' },
  { value: 'macchiato',       label: 'Macchiato' },
] as const

export const MILK_TYPES = [
  { value: 'vollmilch_38', label: 'Whole Milk 3.8%' },
  { value: 'vollmilch_35', label: 'Whole Milk 3.5%' },
  { value: 'fettarm_15',   label: 'Semi-Skimmed 1.5%' },
  { value: 'hafer',        label: 'Oat Milk' },
  { value: 'mandel',       label: 'Almond Milk' },
  { value: 'kokos',        label: 'Coconut Milk' },
  { value: 'soja',         label: 'Soy Milk' },
] as const

export function drinkTypeLabel(value: string): string {
  return DRINK_TYPES.find(d => d.value === value)?.label ?? value
}

export function milkTypeLabel(value: string): string {
  return MILK_TYPES.find(m => m.value === value)?.label ?? value
}
