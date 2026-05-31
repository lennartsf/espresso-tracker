export interface AnimationMeta {
  id: string
  title: string
  icon: string
  description: string
  tags: string[]
}

export const ANIMATIONS: AnimationMeta[] = [
  {
    id: 'boiler',
    title: 'Boiler Types',
    icon: '🔧',
    description: 'How your machine heats water',
    tags: ['Single Boiler', 'Heat Exchanger', 'Dual Boiler', 'Thermoblock'],
  },
  {
    id: 'v60',
    title: 'V60 Pour Pattern',
    icon: '🌊',
    description: 'Bloom + 3 pours with timing',
    tags: ['Bloom', 'Pour 1', 'Pour 2', 'Pour 3'],
  },
  {
    id: 'milk',
    title: 'Milk Steaming',
    icon: '🥛',
    description: 'Foam volume by drink type',
    tags: ['Cappuccino', 'Latte Macchiato', 'Flat White', 'Cortado'],
  },
  {
    id: 'latte-heart',
    title: 'Latte Art Heart',
    icon: '❤️',
    description: 'Classic heart pour technique',
    tags: ['Base pour', 'Heart shape', 'Finish'],
  },
]
