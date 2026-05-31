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
    description: 'Top + side view: pour spiral and water level',
    tags: ['Bloom', 'Pour 1', 'Pour 2', 'Pour 3', 'Drain'],
  },
  {
    id: 'milk',
    title: 'Milk Steaming',
    icon: '🥛',
    description: 'Stretch vs roll — wand depth and foam',
    tags: ['Stretch', 'Roll', 'Microfoam'],
  },
  {
    id: 'latte-heart',
    title: 'Latte Art Heart',
    icon: '❤️',
    description: 'Pitcher height + the heart forming',
    tags: ['Mix in', 'Float', 'Pull through'],
  },
]
