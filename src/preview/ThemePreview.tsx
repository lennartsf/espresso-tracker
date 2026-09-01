import { MemoryRouter } from 'react-router-dom'
import {
  cardClasses, Button, Badge, RatingBadge, StatCard, PageHeader,
  Input, Select, Textarea, FieldLabel, InfoBox, EmptyState, buttonClasses,
} from '../components/ui'
import { ShotCard } from '../components/ShotCard'
import { DialGauge } from '../components/dashboard/DialGauge'
import { LiquidBar } from '../components/dashboard/LiquidBar'
import { EmbossedTile } from '../components/dashboard/EmbossedTile'
import { ThemeToggle } from '../components/ThemeToggle'
import { LayoutEditor } from '../components/dashboard/LayoutEditor'
import { DEFAULT_LAYOUT } from '../utils/dashboardWidgets'
import { ratingHex, intensityBadge, type ThemeName } from '../utils/ratingColor'
import { chartColors } from '../utils/chartTheme'
import type { ShotWithCoffee } from '../hooks/useShots'

/**
 * Entwickler-Vorschau der ECHTEN Bauteile — kein Supabase, kein Login.
 *
 * Grund: Light liess sich sonst nirgends ansehen. Die App haengt hinter
 * ProtectedRoute, und der Screenshot-Runner kommt ohne Zugangsdaten nicht an
 * `/app/*`. Diese Seite mountet dieselben Komponenten mit statischen Daten,
 * damit `npm run theme:shoot` beide Themes fotografieren kann.
 *
 * Nur im Dev-Build erreichbar (eigener Vite-Einstieg `preview.html`), nicht
 * Teil der ausgelieferten App.
 */

const SHOT = (over: Partial<ShotWithCoffee> = {}): ShotWithCoffee => ({
  id: 'p1',
  coffee_id: 'c1',
  roast_date_id: null,
  grind_setting: 14.5,
  dose_g: 18,
  yield_g: 38,
  brew_ratio: 2.11,
  brew_time_s: 29,
  temp_c: 93,
  pressure_bar: 9,
  preinfusion_s: null,
  rating: 9,
  body_score: 7,
  acidity_score: 5,
  bitterness_score: 3,
  tasting_notes: null,
  used_rdt: false,
  used_wdt: true,
  used_leveler: false,
  grinder_id: null,
  machine_id: null,
  basket_id: null,
  drink_type: 'espresso',
  milk_type: null,
  milk_ml: null,
  pulled_at: '2026-08-26T09:00:00.000Z',
  created_at: '2026-08-26T09:00:00.000Z',
  coffees: { name: 'Kenya Kirinyaga AA' },
  roast_dates: { roast_date: '2026-08-18' },
  grinders: { name: 'Niche Zero' },
  machines: null,
  baskets: null,
  ...over,
} as ShotWithCoffee)

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-coffee-accent">{title}</h2>
      {children}
    </section>
  )
}

export function ThemePreview({ theme }: { theme: ThemeName }) {
  const c = chartColors(theme)
  const steps = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

  return (
    <MemoryRouter>
      <div className="min-h-screen bg-coffee-bg px-6 py-8 font-grotesk text-coffee-text">
        <div className="mx-auto max-w-3xl">
          <PageHeader
            eyebrow="Theme preview"
            title="Espresso"
            subtitle={`Rendered in ${theme}`}
            action={<span className={buttonClasses('glow')}>+ New Shot</span>}
          />

          <Section title="Buttons">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="glow">+ New Shot</Button>
              <Button variant="primary">Save</Button>
              <Button variant="secondary">Cancel</Button>
              <Badge>Roast 7</Badge>
              <RatingBadge value={9} />
              <RatingBadge value={5} />
              <RatingBadge value={2} />
            </div>
          </Section>

          <Section title="Theme switch">
            <div className="max-w-xs"><ThemeToggle /></div>
          </Section>

          <Section title="Cards and stats">
            <div className="grid grid-cols-3 gap-3">
              <StatCard value={128} label="Shots total" />
              <StatCard value={8.4} label="Ø Flavor" decimals={1} />
              <StatCard value={2.1} label="Ø Ratio" decimals={1} />
            </div>
          </Section>

          <Section title="Dashboard tiles">
            <div className="grid gap-3 md:grid-cols-2">
              <EmbossedTile className="flex items-center justify-center">
                <DialGauge value={8.4} max={10} label="Ø Flavor · week" />
              </EmbossedTile>
              <EmbossedTile>
                <LiquidBar doseG={18} yieldG={38} />
                <div className="mt-3 flex gap-4 text-xs text-coffee-muted">
                  <span>13 shots this week</span>
                  <span>7 top (≥8)</span>
                </div>
                <div className="mt-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-coffee-muted">Shots per day</p>
                  <svg width="100%" height="70" viewBox="0 0 280 70" role="img" aria-label="Balken pro Wochentag">
                    {[2, 0, 3, 1, 4, 2, 1].map((n, i) => (
                      <rect
                        key={i} x={i * 40 + 6} y={70 - Math.max(3, n * 15)}
                        width="28" height={Math.max(3, n * 15)} rx="3"
                        fill={n > 0 ? c.bar : c.emptyBar}
                      />
                    ))}
                  </svg>
                </div>
              </EmbossedTile>
            </div>
          </Section>

          <Section title="Rating scale — one ramp, both themes">
            <div className={`${cardClasses} p-4`}>
              <div className="flex gap-1">
                {steps.map(n => (
                  <div key={n} className="flex-1 text-center">
                    <div className="h-9 rounded-md" style={{ background: ratingHex(n) }} />
                    <span className="mt-1 block text-[10px] text-coffee-muted">{n}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-wide text-coffee-muted">
                Intensity — body / acidity / bitterness
              </p>
              <div className="flex gap-2">
                {[1, 3, 5, 7, 9, 10].map(n => (
                  <span key={n} className="rounded-md px-3 py-1.5 text-sm font-bold" style={intensityBadge(n, theme)}>
                    {n}
                  </span>
                ))}
              </div>
            </div>
          </Section>

          <Section title="Dashboard arrange (C3)">
            <LayoutEditor
              layout={DEFAULT_LAYOUT.map((e, i) => (i === 1 ? { ...e, visible: false } : e))}
              onChange={() => {}}
              onDone={() => {}}
            />
          </Section>

          <Section title="Shot cards">
            <div className="grid gap-2">
              <ShotCard shot={SHOT()} />
              <ShotCard shot={SHOT({ id: 'p2', rating: 6, drink_type: 'cappuccino', milk_type: 'hafer', milk_ml: 120, coffees: { name: 'Brazil Fazenda Rainha' } })} />
              <ShotCard shot={SHOT({ id: 'p3', rating: 3, coffees: { name: 'Ein sehr langer Kaffeename der die Breite sprengen würde' } })} />
            </div>
          </Section>

          <Section title="Form fields">
            <div className={`${cardClasses} grid gap-3 p-4`}>
              <div>
                <FieldLabel required>Grind setting</FieldLabel>
                <Input type="number" defaultValue="14.5" placeholder="12" />
              </div>
              <div>
                <FieldLabel>Coffee</FieldLabel>
                <Select defaultValue="a">
                  <option value="a">Kenya Kirinyaga AA / Five Elephant</option>
                </Select>
              </div>
              <div>
                <FieldLabel>Notes</FieldLabel>
                <Textarea rows={2} defaultValue="Fein mahlen, blüht stark auf." />
              </div>
              <InfoBox>
                <p className="text-coffee-cream/80">How good does the shot taste overall?</p>
              </InfoBox>
            </div>
          </Section>

          <Section title="Empty state">
            <EmptyState
              headline="Your first pull awaits."
              description="Log a shot and the week comes alive."
              ctaLabel="+ New Shot"
              ctaTo="/app/shots/new"
            />
          </Section>
        </div>
      </div>
    </MemoryRouter>
  )
}
