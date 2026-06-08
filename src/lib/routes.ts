// Zentrale Routen-Konstanten — single source of truth.
// App liegt unter /app/* (Route-Split: / = Marketing, /app/* = Tracker-App).
// Interne Links/Navigate IMMER über ROUTES, nicht hartkodiert.

export const ROUTES = {
  // Marketing / öffentlich
  home: '/',
  try: '/try',
  login: '/login',
  signup: '/signup',

  // App (eingeloggter Bereich — Auth folgt Phase 2)
  app: '/app',
  shots: '/app/shots',
  shotNew: '/app/shots/new',
  shot: (id: string) => `/app/shots/${id}`,
  analysis: '/app/analysis',
  coffees: '/app/coffees',
  roasters: '/app/roasters',
  equipment: '/app/equipment',
  brews: '/app/brews',
  brewNew: '/app/brews/new',
  brew: (id: string) => `/app/brews/${id}`,
  guide: '/app/guide',
  guideDetail: (id: string) => `/app/guide/${id}`,
  glossary: '/app/glossary',
  animate: '/app/animate',
  animateDetail: (id: string) => `/app/animate/${id}`,
} as const
