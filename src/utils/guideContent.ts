export interface QuickProblem {
  label: string
  targetId: string
}

export interface TroubleshootingItem {
  id: string
  problem: string
  cause: string
  solutions: string[]
}

export interface Step {
  title: string
  detail: string
}

export interface Guide {
  id: string
  title: string
  icon: string
  description: string
  quickProblems: QuickProblem[]
  steps: Step[]
  troubleshooting: TroubleshootingItem[]
}

export const GUIDES: Guide[] = [
  {
    id: 'espresso',
    title: 'Espresso',
    icon: '☕',
    description: 'Extraction · Troubleshooting',
    quickProblems: [
      { label: 'Too sour?',   targetId: 'zu-sauer' },
      { label: 'Too bitter?', targetId: 'zu-bitter' },
      { label: 'Channeling?', targetId: 'channeling' },
      { label: 'Too fast?',   targetId: 'zu-schnell' },
      { label: 'Too watery?', targetId: 'zu-waessrig' },
      { label: 'No crema?',   targetId: 'kein-crema' },
    ],
    steps: [
      { title: 'Prepare grinder', detail: 'Run a purge, check grind setting against your last successful pull.' },
      { title: 'Dose', detail: 'Weigh ground coffee — typically 16–18 g depending on basket size.' },
      { title: 'Distribute & tamp', detail: 'Use WDT if available, level with a leveler, then tamp evenly (~15 kg pressure).' },
      { title: 'Lock in & start', detail: 'Start the shot immediately after locking in the portafilter to avoid scorching.' },
      { title: 'Watch brew time', detail: 'Target: 25–35 seconds for ~32–36 g yield (1:2 ratio).' },
      { title: 'Rate & log', detail: 'Record flavor, crema color, and flow in the tracker.' },
    ],
    troubleshooting: [
      {
        id: 'zu-sauer',
        problem: 'Espresso too sour / astringent',
        cause: 'Under-extraction — water flows too quickly through the grounds.',
        solutions: [
          'Grind finer (small steps)',
          'Increase brew temperature (90–96°C)',
          'Slightly increase dose',
          'Check brew ratio — more coffee, less yield',
        ],
      },
      {
        id: 'zu-bitter',
        problem: 'Espresso too bitter / burnt',
        cause: 'Over-extraction — water pulls too long through the grounds.',
        solutions: [
          'Grind coarser',
          'Lower brew temperature (88–92°C)',
          'Increase yield — less coffee relative to water',
          'Check brew time — over 35 s is often too long',
        ],
      },
      {
        id: 'channeling',
        problem: 'Channeling (uneven extraction)',
        cause: 'Water breaks through a channel in the puck and extracts unevenly.',
        solutions: [
          'Use WDT to break up clumps',
          'Use a leveler for an even surface',
          'Tamp with even pressure and straight alignment',
          'Check dose — too little coffee promotes channeling',
        ],
      },
      {
        id: 'zu-schnell',
        problem: 'Shot runs too fast (under 20 s)',
        cause: 'Grind too coarse, dose too low, or channeling.',
        solutions: [
          'Grind finer',
          'Increase dose',
          'Check for channeling',
          'Apply more tamp pressure',
        ],
      },
      {
        id: 'zu-waessrig',
        problem: 'Espresso watery / thin body',
        cause: 'Yield too high or extraction time too short.',
        solutions: [
          'Reduce yield (less water → stronger)',
          'Check brew ratio: target ~1:2 (dose:yield)',
          'Extend brew time by grinding finer',
        ],
      },
      {
        id: 'kein-crema',
        problem: 'No or very little crema',
        cause: 'Coffee too old, machine not up to temperature, or wrong grind size.',
        solutions: [
          'Use a fresher roast date (ideal 5–30 days after roast)',
          'Allow machine to pre-heat longer',
          'Grind finer',
          'Coffee with higher robusta content produces more crema',
        ],
      },
    ],
  },
  {
    id: 'french-press',
    title: 'French Press',
    icon: '🫖',
    description: 'Guide · Troubleshooting',
    quickProblems: [
      { label: 'Too cloudy?',     targetId: 'zu-trueb' },
      { label: 'Too bitter?',     targetId: 'fp-zu-bitter' },
      { label: 'Too weak?',       targetId: 'zu-schwach' },
      { label: 'Grounds in cup?', targetId: 'satz-im-glas' },
    ],
    steps: [
      { title: 'Heat water', detail: 'Aim for 90–95°C — wait a moment after boiling.' },
      { title: 'Grind coffee', detail: 'Coarse grind (like coarse sea salt), approx. 60 g per litre of water.' },
      { title: 'Add coffee & bloom', detail: 'Add coffee, pour a little water, wait 30 s for bloom.' },
      { title: 'Pour & steep', detail: 'Add remaining water, place lid on top (plunger up), steep for 4 minutes.' },
      { title: 'Press & pour', detail: 'Press slowly and evenly, pour immediately to prevent over-extraction.' },
    ],
    troubleshooting: [
      {
        id: 'zu-trueb',
        problem: 'Coffee too cloudy / lots of sediment',
        cause: 'Grind too fine or plunger pressed too slowly.',
        solutions: [
          'Grind coarser',
          'Press the plunger evenly and steadily',
          'Let coffee settle 1 min after pressing before pouring',
          'Use a higher quality mesh filter',
        ],
      },
      {
        id: 'fp-zu-bitter',
        problem: 'Coffee too bitter',
        cause: 'Over-extraction from too long a steep or too fine a grind.',
        solutions: [
          'Reduce steep time to 3–4 minutes',
          'Grind coarser',
          'Lower water temperature (88–93°C)',
          'Pour immediately after pressing',
        ],
      },
      {
        id: 'zu-schwach',
        problem: 'Coffee too weak / watery',
        cause: 'Too little coffee, too short a steep, or too coarse a grind.',
        solutions: [
          'Increase coffee amount (60–70 g/L)',
          'Extend steep time to 4–5 minutes',
          'Grind slightly finer',
        ],
      },
      {
        id: 'satz-im-glas',
        problem: 'Coffee grounds in the cup',
        cause: 'Plunger not pressed all the way down or mesh damaged.',
        solutions: [
          'Press plunger all the way to the bottom',
          'Inspect mesh for damage',
          'Grind slightly coarser',
          'Pour through a paper filter',
        ],
      },
    ],
  },
  {
    id: 'v60',
    title: 'V60',
    icon: '🌊',
    description: 'Pour Over · Guide',
    quickProblems: [
      { label: 'Too slow?',   targetId: 'v60-zu-langsam' },
      { label: 'Too fast?',   targetId: 'v60-zu-schnell' },
      { label: 'Too sour?',   targetId: 'v60-zu-sauer' },
      { label: 'Too bitter?', targetId: 'v60-zu-bitter' },
    ],
    steps: [
      { title: 'Rinse filter', detail: 'Place paper filter in V60, rinse with hot water, discard rinse water.' },
      { title: 'Grind coffee', detail: 'Medium-fine grind (like fine sea salt), 15 g coffee per 250 ml water.' },
      { title: 'Bloom', detail: 'Pour 30–45 ml water, wait 30–45 s for CO₂ to escape.' },
      { title: 'Main pour', detail: 'Pour in circular motions, 3–4 pours of ~60 ml each, total brew time 2:30–3:30 min.' },
      { title: 'Drain', detail: 'Let coffee drain completely — the bed should look flat and even.' },
    ],
    troubleshooting: [
      {
        id: 'v60-zu-langsam',
        problem: 'Coffee drains too slowly (over 4 min)',
        cause: 'Grind too fine, filter blocked, or too much coffee.',
        solutions: [
          'Grind coarser',
          'Seat filter correctly without air gaps',
          'Slightly reduce coffee amount',
          'Pour in spirals for an even bed',
        ],
      },
      {
        id: 'v60-zu-schnell',
        problem: 'Coffee drains too quickly (under 2 min)',
        cause: 'Grind too coarse or too little coffee.',
        solutions: [
          'Grind finer',
          'Slightly increase coffee amount',
          'Slow down your pour rate',
        ],
      },
      {
        id: 'v60-zu-sauer',
        problem: 'Coffee too sour / flat',
        cause: 'Under-extraction — brew time too short or water too cold.',
        solutions: [
          'Increase water temperature (92–96°C)',
          'Grind finer for a longer brew time',
          'Extend bloom time',
        ],
      },
      {
        id: 'v60-zu-bitter',
        problem: 'Coffee too bitter',
        cause: 'Over-extraction — brew time too long or water too hot.',
        solutions: [
          'Grind coarser',
          'Lower water temperature (88–93°C)',
          'Keep total brew time under 3:30 min',
        ],
      },
    ],
  },
  {
    id: 'aeropress',
    title: 'AeroPress',
    icon: '🧪',
    description: 'Guide · Variations',
    quickProblems: [
      { label: 'Too bitter?',       targetId: 'ap-zu-bitter' },
      { label: 'Plunger too hard?', targetId: 'kolben-schwer' },
      { label: 'Too watery?',       targetId: 'ap-zu-waessrig' },
    ],
    steps: [
      { title: 'Rinse paper filter', detail: 'Place filter in cap, rinse with hot water.' },
      { title: 'Dose coffee', detail: '15–18 g medium-fine ground — slightly coarser than espresso.' },
      { title: 'Add water', detail: 'Pour 200–220 ml at 80–90°C, stir for 10–20 s.' },
      { title: 'Steep', detail: '1:00–1:30 min, then attach cap.' },
      { title: 'Press', detail: 'Press slowly and evenly over 20–30 s — stop at the first hiss.' },
    ],
    troubleshooting: [
      {
        id: 'ap-zu-bitter',
        problem: 'Coffee too bitter',
        cause: 'Over-extraction from too long a steep, water too hot, or grind too fine.',
        solutions: [
          'Lower water temperature (80–85°C)',
          'Reduce steep time to 1 minute',
          'Grind slightly coarser',
        ],
      },
      {
        id: 'kolben-schwer',
        problem: 'Plunger is hard to press',
        cause: 'Grind too fine or too much coffee.',
        solutions: [
          'Grind coarser',
          'Slightly reduce coffee amount',
          'Press more evenly and slowly',
        ],
      },
      {
        id: 'ap-zu-waessrig',
        problem: 'Coffee too watery / weak',
        cause: 'Too little coffee, too short a steep, or grind too coarse.',
        solutions: [
          'Increase coffee amount (up to 18 g)',
          'Extend steep time (up to 2 min)',
          'Grind slightly finer',
        ],
      },
    ],
  },
  {
    id: 'moka-pot',
    title: 'Moka Pot',
    icon: '🔥',
    description: 'Stovetop · Guide',
    quickProblems: [
      { label: 'Sputtering?',  targetId: 'spritzt' },
      { label: 'Burnt taste?', targetId: 'verbrannt' },
      { label: 'Too weak?',    targetId: 'mp-zu-schwach' },
      { label: 'Stalling?',    targetId: 'stockt' },
    ],
    steps: [
      { title: 'Fill with water', detail: 'Fill with cold water up to the safety valve — not above it.' },
      { title: 'Fill basket', detail: 'Add coffee loosely (do not tamp!), level off the top.' },
      { title: 'Assemble & heat', detail: 'Screw together firmly, place on medium heat, leave lid open.' },
      { title: 'Watch the flow', detail: 'Once coffee flows golden-brown and steady: reduce heat to low.' },
      { title: 'Remove from heat', detail: 'Remove as soon as it starts gurgling — briefly run the base under cold water.' },
    ],
    troubleshooting: [
      {
        id: 'spritzt',
        problem: 'Coffee sputters / overflows',
        cause: 'Heat too high or water was already too hot when filling.',
        solutions: [
          'Reduce heat to medium-low',
          'Fill with cold water (not pre-heated)',
          'Never leave unattended',
        ],
      },
      {
        id: 'verbrannt',
        problem: 'Coffee tastes burnt / bitter',
        cause: 'Left on heat too long or heat too high.',
        solutions: [
          'Remove immediately when gurgling starts',
          'Use lower heat from the start',
          'Keep lid open to watch the flow',
        ],
      },
      {
        id: 'mp-zu-schwach',
        problem: 'Coffee too weak / watery',
        cause: 'Too little coffee or grind too coarse.',
        solutions: [
          'Fill basket completely (without tamping)',
          'Grind slightly finer',
          'Use a moka-specific grind (finer than filter, coarser than espresso)',
        ],
      },
      {
        id: 'stockt',
        problem: 'Coffee stops flowing / stalls',
        cause: 'Valve blocked, grind too fine, or heat too low.',
        solutions: [
          'Check safety valve for blockage and clean',
          'Grind coarser',
          'Increase heat',
          'Check gasket for wear',
        ],
      },
    ],
  },
  {
    id: 'milch',
    title: 'Milk',
    icon: '🥛',
    description: 'Steaming · Latte Art',
    quickProblems: [
      { label: 'Too much foam?',  targetId: 'zu-viel-schaum' },
      { label: 'No microfoam?',   targetId: 'kein-mikroschaum' },
      { label: 'Milk scorching?', targetId: 'verbrennt-milch' },
      { label: 'Separating?',     targetId: 'trennt-sich' },
    ],
    steps: [
      { title: 'Prepare milk', detail: 'Cold whole milk (3.5% fat), fill jug to 1/3–1/2.' },
      { title: 'Position steam wand', detail: 'Tip just below the surface (5 mm), angled slightly toward center.' },
      { title: 'Incorporate air (stretching)', detail: 'Open steam: hold wand at the surface until a hissing sound — volume increases by ~50%.' },
      { title: 'Heat milk (texturing)', detail: 'Submerge wand deeper, swirl milk until warm to the touch on the outside (~65°C).' },
    ],
    troubleshooting: [
      {
        id: 'zu-viel-schaum',
        problem: 'Too much / coarse foam (large bubbles)',
        cause: 'Too much air incorporated or wand held too high.',
        solutions: [
          'Shorten the stretching phase',
          'Submerge the tip only just below the surface',
          'Tap jug on the counter and swirl to smooth out foam',
        ],
      },
      {
        id: 'kein-mikroschaum',
        problem: 'No microfoam / bubbles stay coarse',
        cause: 'Wand not positioned correctly or steam pressure too low.',
        solutions: [
          'Lift tip lightly toward the surface until hissing is audible',
          'Pre-heat machine longer for full steam pressure',
          'Use cold milk — frothing warm milk takes longer',
        ],
      },
      {
        id: 'verbrennt-milch',
        problem: 'Milk scorches / smells burnt',
        cause: 'Milk heated above 70°C.',
        solutions: [
          'Hold hand on jug — stop immediately if it hurts',
          'Use a thermometer — target 60–65°C',
          'End the stretching phase earlier',
        ],
      },
      {
        id: 'trennt-sich',
        problem: 'Milk and foam separate',
        cause: 'Milk frothed too hot or wrong milk type.',
        solutions: [
          'Keep temperature below 65°C',
          'Use whole milk with higher fat content',
          'Use milk immediately after steaming',
        ],
      },
    ],
  },
]
