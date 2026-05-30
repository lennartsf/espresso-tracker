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
    description: 'Extraktion · Troubleshooting',
    quickProblems: [
      { label: 'Zu sauer?', targetId: 'zu-sauer' },
      { label: 'Zu bitter?', targetId: 'zu-bitter' },
      { label: 'Channeling?', targetId: 'channeling' },
      { label: 'Zu schnell?', targetId: 'zu-schnell' },
      { label: 'Zu wässrig?', targetId: 'zu-waessrig' },
      { label: 'Kein Crema?', targetId: 'kein-crema' },
    ],
    steps: [
      { title: 'Mühle vorbereiten', detail: 'Leermahlgang machen, Mahlgrad auf letzte erfolgreiche Einstellung prüfen.' },
      { title: 'Dosieren', detail: 'Kaffeemehl abwiegen — typisch 16–18 g je nach Sieb.' },
      { title: 'Verteilen & Tampen', detail: 'WDT falls vorhanden, Leveler einsetzen, dann gleichmäßig tampen (~15 kg Druck).' },
      { title: 'Einspannen & starten', detail: 'Siebträger sofort nach dem Einspannen starten, um Verbrennen zu vermeiden.' },
      { title: 'Brühzeit beobachten', detail: 'Ziel: 25–35 Sekunden für ~32–36 g Yield (Verhältnis 1:2).' },
      { title: 'Bewerten & notieren', detail: 'Geschmack, Crema-Farbe und Fluss im Tracker festhalten.' },
    ],
    troubleshooting: [
      {
        id: 'zu-sauer',
        problem: 'Espresso zu sauer / adstringierend',
        cause: 'Unterextraktion — Wasser fließt zu schnell durch das Kaffeemehl.',
        solutions: [
          'Mahlgrad feiner stellen (kleine Schritte)',
          'Brühtemperatur erhöhen (90–96°C)',
          'Dose leicht erhöhen',
          'Brew-Ratio prüfen — mehr Kaffee, weniger Yield',
        ],
      },
      {
        id: 'zu-bitter',
        problem: 'Espresso zu bitter / verbrannt',
        cause: 'Überextraktion — Wasser zieht zu lange durch das Kaffeemehl.',
        solutions: [
          'Mahlgrad gröber stellen',
          'Brühtemperatur senken (88–92°C)',
          'Yield erhöhen — weniger Kaffee im Verhältnis zum Wasser',
          'Brühzeit prüfen — über 35 s ist oft zu lang',
        ],
      },
      {
        id: 'channeling',
        problem: 'Channeling (ungleichmäßige Extraktion)',
        cause: 'Wasser bricht durch einen Kanal im Puck und extrahiert ungleichmäßig.',
        solutions: [
          'WDT verwenden um Klumpen aufzulösen',
          'Leveler für gleichmäßige Oberfläche einsetzen',
          'Tampen mit gleichmäßigem Druck und gerader Ausrichtung',
          'Dose prüfen — zu wenig Kaffee begünstigt Channeling',
        ],
      },
      {
        id: 'zu-schnell',
        problem: 'Shot läuft zu schnell durch (unter 20 s)',
        cause: 'Mahlgrad zu grob, Dosis zu niedrig oder Channeling.',
        solutions: [
          'Mahlgrad feiner stellen',
          'Dose erhöhen',
          'Auf Channeling prüfen',
          'Tampen-Druck erhöhen',
        ],
      },
      {
        id: 'zu-waessrig',
        problem: 'Espresso wässrig / dünner Körper',
        cause: 'Zu hoher Yield oder zu kurze Extraktionszeit.',
        solutions: [
          'Yield reduzieren (weniger Wasser → stärker)',
          'Brew-Ratio prüfen: Ziel ~1:2 (Dose:Yield)',
          'Brühzeit verlängern via feinerem Mahlgrad',
        ],
      },
      {
        id: 'kein-crema',
        problem: 'Keine oder wenig Crema',
        cause: 'Kaffee zu alt, Maschine nicht auf Temperatur oder falscher Mahlgrad.',
        solutions: [
          'Frischeres Röstdatum wählen (ideal 5–30 Tage nach Röstung)',
          'Maschine länger vorheizen lassen',
          'Mahlgrad feiner stellen',
          'Kaffee mit höherem Robusta-Anteil enthält mehr Crema',
        ],
      },
    ],
  },
  {
    id: 'french-press',
    title: 'French Press',
    icon: '🫖',
    description: 'Anleitung · Troubleshooting',
    quickProblems: [
      { label: 'Zu trüb?', targetId: 'zu-trueb' },
      { label: 'Zu bitter?', targetId: 'fp-zu-bitter' },
      { label: 'Zu schwach?', targetId: 'zu-schwach' },
      { label: 'Satz im Glas?', targetId: 'satz-im-glas' },
    ],
    steps: [
      { title: 'Wasser erhitzen', detail: 'Auf 90–95°C — kurz nach dem Kochen etwas warten.' },
      { title: 'Kaffee mahlen', detail: 'Grob gemahlen (wie grobes Meersalz), ca. 60 g pro Liter Wasser.' },
      { title: 'Einschütten & Bloom', detail: 'Kaffee einschütten, etwas Wasser aufgießen, 30 s Bloom abwarten.' },
      { title: 'Aufgießen & ziehen lassen', detail: 'Restliches Wasser aufgießen, Deckel auflegen (Stempel oben), 4 Minuten ziehen lassen.' },
      { title: 'Stempel drücken & einschenken', detail: 'Langsam und gleichmäßig drücken, sofort einschenken um Überextraktion zu verhindern.' },
    ],
    troubleshooting: [
      {
        id: 'zu-trueb',
        problem: 'Kaffee zu trüb / viele Schwebstoffe',
        cause: 'Mahlgrad zu fein oder Stempel zu langsam gedrückt.',
        solutions: [
          'Mahlgrad gröber stellen',
          'Stempel gleichmäßig und zügig drücken',
          'Kaffee nach dem Drücken noch 1 min setzen lassen',
          'Qualitativ besseres Sieb im Stempel verwenden',
        ],
      },
      {
        id: 'fp-zu-bitter',
        problem: 'Kaffee zu bitter',
        cause: 'Überextraktion durch zu langen Ziehvorgang oder zu feinen Mahlgrad.',
        solutions: [
          'Ziehzeit auf 3–4 Minuten reduzieren',
          'Mahlgrad gröber stellen',
          'Wassertemperatur senken (88–93°C)',
          'Sofort nach dem Drücken einschenken',
        ],
      },
      {
        id: 'zu-schwach',
        problem: 'Kaffee zu schwach / wässrig',
        cause: 'Zu wenig Kaffee, zu kurze Ziehzeit oder zu grober Mahlgrad.',
        solutions: [
          'Kaffeemenge erhöhen (60–70 g/L)',
          'Ziehzeit auf 4–5 Minuten verlängern',
          'Mahlgrad leicht feiner stellen',
        ],
      },
      {
        id: 'satz-im-glas',
        problem: 'Kaffeesatz im Glas',
        cause: 'Stempel nicht vollständig gedrückt oder Sieb beschädigt.',
        solutions: [
          'Stempel bis zum Boden drücken',
          'Sieb auf Beschädigung prüfen',
          'Mahlgrad etwas gröber stellen',
          'Kaffee durch Papierfilter nachfiltern',
        ],
      },
    ],
  },
  {
    id: 'v60',
    title: 'V60',
    icon: '🌊',
    description: 'Pour Over · Anleitung',
    quickProblems: [
      { label: 'Zu langsam?', targetId: 'v60-zu-langsam' },
      { label: 'Zu schnell?', targetId: 'v60-zu-schnell' },
      { label: 'Zu sauer?', targetId: 'v60-zu-sauer' },
      { label: 'Zu bitter?', targetId: 'v60-zu-bitter' },
    ],
    steps: [
      { title: 'Filter einlegen & vorspülen', detail: 'Papierfilter mit heißem Wasser durchspülen, Wasser abgießen.' },
      { title: 'Kaffee mahlen', detail: 'Mittel-fein gemahlen (wie feines Meersalz), 15 g Kaffee auf 250 ml Wasser.' },
      { title: 'Bloom', detail: '30–45 ml Wasser aufgießen, 30–45 s warten bis CO₂ entweicht.' },
      { title: 'Hauptguss', detail: 'In kreisenden Bewegungen gießen, 3–4 Güsse je ~60 ml, Gesamtbrühzeit 2:30–3:30 min.' },
      { title: 'Ablaufen lassen', detail: 'Kaffee vollständig ablaufen lassen — Bett sollte flach und gleichmäßig aussehen.' },
    ],
    troubleshooting: [
      {
        id: 'v60-zu-langsam',
        problem: 'Kaffee läuft zu langsam durch (über 4 min)',
        cause: 'Mahlgrad zu fein, Filter verstopft oder zu viel Kaffee.',
        solutions: [
          'Mahlgrad gröber stellen',
          'Filter korrekt einlegen ohne Luftspalte',
          'Kaffeemenge leicht reduzieren',
          'Spiralförmig gießen für gleichmäßiges Bett',
        ],
      },
      {
        id: 'v60-zu-schnell',
        problem: 'Kaffee läuft zu schnell durch (unter 2 min)',
        cause: 'Mahlgrad zu grob oder zu wenig Kaffee.',
        solutions: [
          'Mahlgrad feiner stellen',
          'Kaffeemenge leicht erhöhen',
          'Gießgeschwindigkeit verringern',
        ],
      },
      {
        id: 'v60-zu-sauer',
        problem: 'Kaffee zu sauer / flach',
        cause: 'Unterextraktion — zu kurze Brühzeit oder zu kaltes Wasser.',
        solutions: [
          'Wassertemperatur erhöhen (92–96°C)',
          'Mahlgrad feiner für längere Brühzeit',
          'Bloom-Zeit verlängern',
        ],
      },
      {
        id: 'v60-zu-bitter',
        problem: 'Kaffee zu bitter',
        cause: 'Überextraktion — zu lange Brühzeit oder zu heißes Wasser.',
        solutions: [
          'Mahlgrad gröber stellen',
          'Wassertemperatur senken (88–93°C)',
          'Gesamtbrühzeit unter 3:30 min halten',
        ],
      },
    ],
  },
  {
    id: 'aeropress',
    title: 'AeroPress',
    icon: '🧪',
    description: 'Anleitung · Varianten',
    quickProblems: [
      { label: 'Zu bitter?', targetId: 'ap-zu-bitter' },
      { label: 'Kolben drückt schwer?', targetId: 'kolben-schwer' },
      { label: 'Zu wässrig?', targetId: 'ap-zu-waessrig' },
    ],
    steps: [
      { title: 'Papierfilter einlegen & vorspülen', detail: 'Filter in den Deckel legen, mit heißem Wasser vorspülen.' },
      { title: 'Kaffee dosieren', detail: '15–18 g mittelfein gemahlen — etwas gröber als Espresso.' },
      { title: 'Wasser aufgießen', detail: '200–220 ml bei 80–90°C aufgießen, 10–20 s rühren.' },
      { title: 'Ziehen lassen', detail: '1:00–1:30 min, Deckel aufschrauben.' },
      { title: 'Pressen', detail: 'Langsam über 20–30 s gleichmäßig drücken — bei leisem Zischen aufhören.' },
    ],
    troubleshooting: [
      {
        id: 'ap-zu-bitter',
        problem: 'Kaffee zu bitter',
        cause: 'Überextraktion durch zu langen Ziehvorgang, zu heißes Wasser oder zu feinen Mahlgrad.',
        solutions: [
          'Wassertemperatur senken (80–85°C)',
          'Ziehzeit auf 1 Minute reduzieren',
          'Mahlgrad etwas gröber stellen',
        ],
      },
      {
        id: 'kolben-schwer',
        problem: 'Kolben lässt sich schwer drücken',
        cause: 'Mahlgrad zu fein oder Kaffee zu fest dosiert.',
        solutions: [
          'Mahlgrad gröber stellen',
          'Kaffeemenge leicht reduzieren',
          'Gleichmäßiger und langsamer drücken',
        ],
      },
      {
        id: 'ap-zu-waessrig',
        problem: 'Kaffee zu wässrig / schwach',
        cause: 'Zu wenig Kaffee, zu kurze Ziehzeit oder zu grober Mahlgrad.',
        solutions: [
          'Kaffeemenge erhöhen (bis 18 g)',
          'Ziehzeit verlängern (bis 2 min)',
          'Mahlgrad leicht feiner stellen',
        ],
      },
    ],
  },
  {
    id: 'moka-pot',
    title: 'Moka Pot',
    icon: '🔥',
    description: 'Herd · Anleitung',
    quickProblems: [
      { label: 'Spritzt?', targetId: 'spritzt' },
      { label: 'Verbrannt?', targetId: 'verbrannt' },
      { label: 'Zu schwach?', targetId: 'mp-zu-schwach' },
      { label: 'Stockt?', targetId: 'stockt' },
    ],
    steps: [
      { title: 'Wasser einfüllen', detail: 'Kaltes Wasser bis zur Sicherheitsventil-Markierung — nicht darüber.' },
      { title: 'Sieb befüllen', detail: 'Kaffee locker einfüllen (nicht tampen!), Überschuss abstreichen.' },
      { title: 'Zusammenbauen & auf Herd', detail: 'Fest zusammenschrauben, auf mittelstarke Hitze stellen, Deckel offenlassen.' },
      { title: 'Fluss beobachten', detail: 'Sobald Kaffee goldbraun und gleichmäßig fließt: Hitze auf niedrig reduzieren.' },
      { title: 'Vom Herd nehmen', detail: 'Wenn Sprudeln beginnt sofort vom Herd — Unterseite kurz unter kaltes Wasser halten.' },
    ],
    troubleshooting: [
      {
        id: 'spritzt',
        problem: 'Kaffee spritzt / kocht über',
        cause: 'Zu hohe Hitze oder Wasser war bereits zu heiß beim Einfüllen.',
        solutions: [
          'Hitze auf mittel bis niedrig reduzieren',
          'Kaltes Wasser einfüllen (kein vorgeheiztes)',
          'Kanne nie unbeaufsichtigt lassen',
        ],
      },
      {
        id: 'verbrannt',
        problem: 'Kaffee schmeckt verbrannt / bitter',
        cause: 'Zu lange auf dem Herd gelassen oder zu hohe Hitze.',
        solutions: [
          'Sobald Sprudeln beginnt sofort vom Herd',
          'Hitze von Anfang an niedriger einstellen',
          'Deckel offen lassen um Fließen zu beobachten',
        ],
      },
      {
        id: 'mp-zu-schwach',
        problem: 'Kaffee zu schwach / wässrig',
        cause: 'Zu wenig Kaffee oder Mahlgrad zu grob.',
        solutions: [
          'Sieb vollständig befüllen (ohne zu tampen)',
          'Mahlgrad leicht feiner stellen',
          'Moka-spezifischen Mahlgrad verwenden (feiner als Filter, gröber als Espresso)',
        ],
      },
      {
        id: 'stockt',
        problem: 'Kaffee fließt nicht / stockt',
        cause: 'Ventil verstopft, Mahlgrad zu fein oder Hitze zu niedrig.',
        solutions: [
          'Ventil auf Verstopfung prüfen und reinigen',
          'Mahlgrad gröber stellen',
          'Hitze erhöhen',
          'Dichtung auf Verschleiß prüfen',
        ],
      },
    ],
  },
  {
    id: 'milch',
    title: 'Milch',
    icon: '🥛',
    description: 'Aufschäumen · Latte Art',
    quickProblems: [
      { label: 'Zu viel Schaum?', targetId: 'zu-viel-schaum' },
      { label: 'Kein Mikroschaum?', targetId: 'kein-mikroschaum' },
      { label: 'Milch verbrennt?', targetId: 'verbrennt-milch' },
      { label: 'Trennt sich?', targetId: 'trennt-sich' },
    ],
    steps: [
      { title: 'Milch vorbereiten', detail: 'Kalte Vollmilch (3,5% Fett), Kanne zu 1/3–1/2 befüllen.' },
      { title: 'Dampflanze positionieren', detail: 'Düse knapp unter der Oberfläche (5 mm), leicht seitlich zur Mitte.' },
      { title: 'Luft einarbeiten (Stretching)', detail: 'Dampf öffnen: Lanze an der Oberfläche halten bis Zischen — Volumen um ~50% erhöht.' },
      { title: 'Aufheizen (Texturing)', detail: 'Düse tiefer setzen, Milch kreisen lassen bis handwarm von außen (~65°C).' },
    ],
    troubleshooting: [
      {
        id: 'zu-viel-schaum',
        problem: 'Zu viel / grober Schaum (große Blasen)',
        cause: 'Zu lange Luft eingearbeitet oder Lanze zu weit oben.',
        solutions: [
          'Stretching-Phase kürzen',
          'Düse nur leicht unter die Oberfläche tauchen',
          'Milch auf Tischplatte klopfen und kreisen lassen zum Glätten',
        ],
      },
      {
        id: 'kein-mikroschaum',
        problem: 'Kein Mikroschaum / Blasen bleiben grob',
        cause: 'Lanze nicht korrekt positioniert oder Dampfdruck zu gering.',
        solutions: [
          'Düse leicht an die Oberfläche heben bis Zischen hörbar',
          'Maschine länger vorheizen für vollen Dampfdruck',
          'Kalte Milch verwenden — wärmer aufschaumen dauert länger',
        ],
      },
      {
        id: 'verbrennt-milch',
        problem: 'Milch verbrennt / riecht verbrannt',
        cause: 'Milch über 70°C erhitzt.',
        solutions: [
          'Hand an Kanne halten — bei Schmerz sofort aufhören',
          'Thermometer verwenden — Ziel 60–65°C',
          'Stretching-Phase früher beenden',
        ],
      },
      {
        id: 'trennt-sich',
        problem: 'Milch und Schaum trennen sich',
        cause: 'Milch zu heiß aufgeschäumt oder falsche Milchsorte.',
        solutions: [
          'Temperatur unter 65°C halten',
          'Vollmilch mit höherem Fettgehalt verwenden',
          'Milch direkt nach dem Aufschäumen verwenden',
        ],
      },
    ],
  },
]
