import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useCoffees } from '../hooks/useCoffees'
import { useDialInShots } from '../hooks/useDialInShots'
import { useGrinders, useBaskets, useEquipmentDefaults } from '../hooks/useEquipment'
import { useCoffeeRecipes } from '../hooks/useCoffeeRecipes'
import { Input, Select, FieldLabel, cardClasses } from './ui'
import { roasterRecipeOf } from '../utils/recipeMatch'
import {
  learnGrinder, learnPerBasket, suggestGrind, compareBaskets,
} from '../utils/dialIn'

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-coffee-line py-2 last:border-0">
      <span className="text-sm text-coffee-muted">{label}</span>
      <span className="text-sm font-semibold text-coffee-text">{value}</span>
    </div>
  )
}

/**
 * „Ich will DIESES Rezept auf DIESER Bohne — wie stelle ich die Mühle ein?"
 *
 * Der Unterschied zum Hinweis in NewShot: dort steckt der Vorschlag im
 * Formular und beantwortet nur den nächsten Schritt. Hier wählt man ein
 * Zielrezept aus und sieht, was dafür einzustellen ist — samt der Rechnung
 * dahinter, denn eine Zahl ohne Herleitung ist nicht überprüfbar.
 *
 * **Das Sieb ist Pflicht, nicht Beiwerk.** Ein anderer Korb hat andere
 * Lochung und Nenndosis und verschiebt die Durchlaufzeit so deutlich wie eine
 * andere Bohne. Es geht deshalb in die Gruppierung des Modells ein, in die
 * Wahl des Ankershots — und wird unten eigens ausgewiesen, damit man sieht,
 * wie viel es bei den eigenen Daten tatsächlich ausmacht.
 */
export function DialInPlanner() {
  const { data: coffees = [] } = useCoffees()
  const { data: grinders = [] } = useGrinders()
  const { data: baskets = [] } = useBaskets()
  // Dieselbe Quelle wie in NewShot. Vorher stand hier ein Espresso-Filter, und
  // beide Seiten gaben bei gleicher Auswahl verschiedene Zahlen aus.
  const dialShots = useDialInShots()
  const { data: defaults = [] } = useEquipmentDefaults()

  // Label und Feld verknuepfen: FieldLabel ist ein echtes <label>, aber ohne
  // htmlFor bleibt es unverbunden — fuer Screenreader und fuer den Klick aufs
  // Label, der sonst den Fokus nicht setzt.
  const ids = {
    coffee: useId(), recipe: useId(), grinder: useId(), basket: useId(), time: useId(),
  }

  const [coffeeId, setCoffeeId] = useState('')
  const [grinderId, setGrinderId] = useState('')
  const [basketId, setBasketId] = useState('')
  const [recipeId, setRecipeId] = useState('')
  /** Die Zielzeit ist die eigentliche Eingabe dieses Tabs, nicht ein Feld des
   *  Rezepts. Sie stand vorher NUR im Rezept — und ein Röster-Rezept trägt
   *  meistens keine: auf der Tüte steht Dosis, Menge und Temperatur, die
   *  Sekunden nicht. Dann war der Tab eine Sackgasse („add a time to the
   *  recipe"), obwohl alles Nötige vorlag. Ein Rezept füllt das Feld jetzt nur
   *  vor; ohne Rezept tippt man es. */
  const [targetTimeInput, setTargetTimeInput] = useState('')
  const [showMath, setShowMath] = useState(false)

  /** Mühle und Sieb aus den Equipment-Standards vorbelegen — dieselbe Regel wie
   *  in NewShot (Methoden-Standard, sonst Favorit). Vorher stand hier „All
   *  grinders" / „Any basket", während NewShot bereits eine konkrete Mühle
   *  gewählt hatte. Damit rechneten die beiden Seiten über verschiedene
   *  Datenmengen und gaben verschiedene Zahlen aus, ohne dass man den
   *  Unterschied sah.
   *
   *  Der Ref-Guard sorgt dafür, dass ein Refetch die eigene Wahl nicht
   *  überschreibt. */
  const defaultsApplied = useRef(false)
  useEffect(() => {
    if (defaultsApplied.current) return
    if (grinders.length === 0 && baskets.length === 0) return
    const d = defaults.find(x => x.method === 'espresso')
    const g = d?.grinder_id ?? grinders.find(x => x.is_favorite)?.id
    const b = d?.basket_id ?? baskets.find(x => x.is_favorite)?.id
    if (g) setGrinderId(g)
    if (b) setBasketId(b)
    defaultsApplied.current = true
  }, [defaults, grinders, baskets])

  const { data: ownRecipes = [] } = useCoffeeRecipes(coffeeId || undefined)
  const coffee = coffees.find(c => c.id === coffeeId)
  const roasterRecipe = roasterRecipeOf(coffee)

  const recipeOptions = [
    ...(roasterRecipe ? [{ id: 'roaster', ...roasterRecipe }] : []),
    ...ownRecipes.map(r => ({
      id: r.id, name: r.name, dose_g: r.dose_g, yield_g: r.yield_g,
      temp_c: r.temp_c, time_s: r.time_s,
    })),
  ]
  const recipe = recipeOptions.find(r => r.id === recipeId)

  // Bohne gewechselt → Rezept und Ziel der alten Bohne gelten nicht mehr.
  useEffect(() => {
    setRecipeId('')
    setTargetTimeInput('')
  }, [coffeeId])

  /** Ein Rezept zu wählen ist eine bewusste Handlung und darf die Zielzeit
   *  überschreiben. Trägt das Rezept keine, bleibt stehen, was da ist — sonst
   *  würde die Auswahl eine schon eingegebene Zeit löschen. */
  function pickRecipe(id: string) {
    setRecipeId(id)
    const r = recipeOptions.find(x => x.id === id)
    if (r?.time_s != null) setTargetTimeInput(String(r.time_s))
  }

  const grinderShots = useMemo(
    () => (grinderId ? dialShots.filter(s => s.grinder_id === grinderId) : dialShots),
    [dialShots, grinderId],
  )
  const model = useMemo(
    () => learnGrinder(grinderShots, basketId || null),
    [grinderShots, basketId],
  )
  /** Was jedes Sieb FÜR SICH gelernt hat. Zwei deutlich verschiedene Steigungen
   *  sind der Beleg dafür, dass die Körbe unterschiedlichen Durchfluss haben. */
  const perBasket = useMemo(() => learnPerBasket(grinderShots), [grinderShots])
  const slopeFor = useMemo(() => {
    const map = new Map(
      perBasket.filter(m => m.basis === 'learned').map(m => [m.basketId!, m.secondsPerStep!]),
    )
    // Ein Sieb ohne eigene Schätzung bekommt die gepoolte — besser als nichts,
    // und `perBasket` weist unten aus, welche das betrifft.
    const pooled = learnGrinder(grinderShots).secondsPerStep
    return (id: string) => map.get(id) ?? pooled
  }, [perBasket, grinderShots])
  const basketEffects = useMemo(
    () => compareBaskets(grinderShots, slopeFor),
    [grinderShots, slopeFor],
  )

  const parsedTarget = Number(targetTimeInput)
  const targetTime =
    targetTimeInput.trim() && Number.isFinite(parsedTarget) && parsedTarget > 0
      ? parsedTarget
      : null
  const result = coffeeId && targetTime != null
    ? suggestGrind({
        shots: dialShots, coffeeId, grinderId: grinderId || null,
        basketId: basketId || null, targetTime,
      })
    : null

  const basketName = (id: string) => baskets.find(b => b.id === id)?.name ?? 'Unknown basket'

  /** „All grinders" ist nur dann harmlos, wenn es faktisch eine ist. Sobald
   *  Shots von mehreren Mühlen zusammenkommen, wird über Skalen gemittelt, die
   *  nichts miteinander zu tun haben — „2.5" auf der einen ist nicht „2.5" auf
   *  der anderen. */
  const grindersInData = new Set(
    dialShots.filter(s => s.grinder_id).map(s => s.grinder_id),
  ).size

  return (
    <div>
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <div>
          <FieldLabel htmlFor={ids.coffee}>Coffee</FieldLabel>
          <Select id={ids.coffee} value={coffeeId} onChange={e => setCoffeeId(e.target.value)}>
            <option value="">Pick a coffee…</option>
            {coffees.map(c => (
              <option key={c.id} value={c.id}>{c.name}{c.roaster ? ` / ${c.roaster}` : ''}</option>
            ))}
          </Select>
        </div>
        <div>
          <FieldLabel htmlFor={ids.recipe}>Target recipe</FieldLabel>
          <Select
            id={ids.recipe}
            value={recipeId}
            onChange={e => pickRecipe(e.target.value)}
            disabled={!coffeeId || recipeOptions.length === 0}
          >
            <option value="">
              {recipeOptions.length === 0 ? 'No recipe for this coffee yet' : 'Pick a recipe…'}
            </option>
            {recipeOptions.map(r => (
              <option key={r.id} value={r.id}>
                {r.name}{r.time_s == null ? ' (no time)' : ''}
              </option>
            ))}
          </Select>
        </div>
        {/* Die Zielzeit steht eigenstaendig, nicht im Rezept versteckt. Ein
            Roester-Rezept traegt meistens keine — vorher war der Tab dann
            unbenutzbar, obwohl der Rest der Angaben vorlag. */}
        <div>
          <FieldLabel htmlFor={ids.time} required>Target time (s)</FieldLabel>
          <Input
            id={ids.time}
            type="number" min="1" step="1" placeholder="28"
            value={targetTimeInput}
            onChange={e => setTargetTimeInput(e.target.value)}
          />
          {recipe && recipe.time_s == null && (
            <p className="mt-1 text-xs text-coffee-muted">
              „{recipe.name}" has no time of its own — set the one you are aiming for.
            </p>
          )}
        </div>
        <div>
          <FieldLabel htmlFor={ids.grinder}>Grinder</FieldLabel>
          <Select id={ids.grinder} value={grinderId} onChange={e => setGrinderId(e.target.value)}>
            <option value="">All grinders</option>
            {grinders.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </Select>
          {!grinderId && grindersInData > 1 && (
            <p className="mt-1 text-xs text-coffee-warn">
              Mixing {grindersInData} grinders — their scales are not comparable.
              Pick one.
            </p>
          )}
        </div>
        <div>
          <FieldLabel htmlFor={ids.basket}>Basket</FieldLabel>
          <Select id={ids.basket} value={basketId} onChange={e => setBasketId(e.target.value)}>
            <option value="">Any basket</option>
            {baskets.map(b => (
              <option key={b.id} value={b.id}>
                {b.name}{b.size_g ? ` · ${b.size_g} g` : ''}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {!coffeeId && (
        <p className="py-10 text-center text-sm text-coffee-muted">
          Pick a coffee and a target time, and this works out where to set the grinder.
        </p>
      )}

      {coffeeId && recipeOptions.length === 0 && (
        <p className="py-6 text-center text-sm text-coffee-muted">
          This coffee has no saved recipe — you can still aim at a time above. To save
          one: add it on the coffee page, or save a good shot as a recipe from its
          detail view.
        </p>
      )}

      {coffeeId && targetTime == null && (
        <p className="py-10 text-center text-sm text-coffee-muted">
          Set a target time to aim at.
        </p>
      )}

      {/* `recipe &&` steht hier nicht nur fuer TypeScript: der Block liest die
          Zielwerte direkt aus dem Rezept, haengt also wirklich an beidem.
          `result` allein zu pruefen war eine Annahme ueber den Zusammenhang
          („result gibt es nur mit Rezept"), die der Code nicht ausdrueckt. */}
      {result && (
        <>
          <div className={`${cardClasses} mb-3 p-4`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-coffee-muted">
              Set the grinder to
            </p>
            {result.grind !== null ? (
              <p className="font-display text-5xl font-bold text-coffee-cream">{result.grind}</p>
            ) : (
              <p className="mt-1 font-display text-2xl font-bold text-coffee-muted">Not enough data</p>
            )}
            <p className="mt-2 text-sm leading-snug text-coffee-text">{result.message}</p>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-coffee-surface2 px-2.5 py-1 text-xs text-coffee-muted">
                Confidence: {result.confidence}
              </span>
              <span className="rounded-full bg-coffee-surface2 px-2.5 py-1 text-xs text-coffee-muted">
                {result.coffeeShots} shot{result.coffeeShots === 1 ? '' : 's'} on this coffee
              </span>
              {basketId && (
                <span className="rounded-full bg-coffee-surface2 px-2.5 py-1 text-xs text-coffee-muted">
                  {result.sameBasket ? 'Same basket as your last shot' : 'Different basket'}
                </span>
              )}
            </div>
          </div>

          {/* Ohne Rezept gibt es nur die Zielzeit — die steht schon oben im
              Ergebnis, eine Karte mit vier Strichen waere nur Fuellsel. */}
          {recipe && (
            <div className={`${cardClasses} mb-3 p-4`}>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-coffee-muted">
                Target · {recipe.name}
              </p>
              <Row label="Dose" value={recipe.dose_g != null ? `${recipe.dose_g} g` : '—'} />
              <Row label="Yield" value={recipe.yield_g != null ? `${recipe.yield_g} g` : '—'} />
              <Row
                label="Time"
                value={
                  recipe.time_s != null
                    ? `${targetTime}s`
                    : `${targetTime}s (your target — the recipe has none)`
                }
              />
              <Row label="Temp" value={recipe.temp_c != null ? `${recipe.temp_c} °C` : '—'} />
            </div>
          )}
        </>
      )}

      {/* Das Sieb ausdruecklich ausgewiesen — sonst bleibt „macht einen grossen
          Unterschied" eine Behauptung statt einer Zahl. */}
      {basketEffects.length > 0 && (
        <div className={`${cardClasses} mb-3 p-4`}>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-coffee-muted">
            What your baskets do
          </p>
          <p className="mb-2 text-xs text-coffee-muted">
            Measured within the same coffee and corrected for grind, so this is the
            basket alone — not the bean you happen to use it for.
          </p>
          {perBasket.length > 1 && (
            <p className="mb-3 rounded-lg bg-coffee-surface2 p-2.5 text-xs leading-snug text-coffee-muted">
              <span className="font-semibold text-coffee-text">Step size per basket. </span>
              A basket with different flow reacts differently to one grind step, so
              each one gets its own slope — pooling them would average two different
              lines into one that fits neither.
              <span className="mt-1.5 block">
                {perBasket.map(m => (
                  <span key={m.basketId} className="mr-3 inline-block">
                    {basketName(m.basketId!)}:{' '}
                    <span className="font-semibold text-coffee-text">
                      {m.basis === 'learned'
                        ? `${m.secondsPerStep!.toFixed(2)} s/step`
                        : 'not enough shots yet'}
                    </span>
                  </span>
                ))}
              </span>
            </p>
          )}
          {basketEffects.map(e => (
            <Row
              key={e.basketId}
              label={`${basketName(e.basketId)} · ${e.shots} shots, ${e.coffees} coffees`}
              value={
                `${e.offsetS >= 0 ? '+' : ''}${e.offsetS.toFixed(1)}s` +
                (e.offsetSteps !== null
                  ? ` (${e.offsetSteps >= 0 ? '+' : ''}${e.offsetSteps.toFixed(1)} steps)`
                  : '')
              }
            />
          ))}
        </div>
      )}

      {/* Die Herleitung. Eine Zahl ohne Rechnung ist nicht ueberpruefbar — und
          genau daran ist die erste Fassung des Algorithmus gescheitert. */}
      <div className={`${cardClasses} p-4`}>
        <button
          type="button"
          onClick={() => setShowMath(v => !v)}
          aria-expanded={showMath}
          className="flex w-full items-center justify-between gap-2 text-left"
        >
          <span className="text-xs font-semibold uppercase tracking-wide text-coffee-muted">
            How this is worked out
          </span>
          <ChevronDown
            size={16}
            className={`flex-shrink-0 text-coffee-muted transition-transform ${showMath ? 'rotate-180' : ''}`}
          />
        </button>

        {showMath && (
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-coffee-text">
            <p>
              Over the small range you dial in, grind and shot time move together in a
              straight line: finer means slower. The <em>slope</em> of that line — seconds
              per grind step — is what makes your grinder yours, and it barely changes
              between beans. What does change with every bag is the <em>offset</em>: the
              same setting gives a different time on a different coffee. Your basket
              shifts that offset too.
            </p>
            <p>
              The basket matters twice over, and the two are separate. It shifts the
              offset — one basket simply runs slower than another. But it also changes
              the <em>slope</em>: a basket with different flow reacts less, or more, to
              the same grind step. So the slope is learned from your shots in this
              basket, and the starting point comes from your last shot of this coffee
              in this basket.
              Crucially, each coffee-and-basket combination is first centred on its own
              average before the slope is fitted. Without that, the fit mostly sees the
              differences <em>between</em> your bags and washes the slope out towards
              zero — which is exactly how an earlier version came up with impossible
              numbers. Fitting across baskets goes wrong the same way: two lines of
              different steepness average into one that describes neither.
            </p>

            <div className="rounded-lg bg-coffee-surface2 p-3">
              <Row
                label="Learned slope"
                value={
                  model.basis === 'learned'
                    ? `${model.secondsPerStep!.toFixed(2)} s per step`
                    : 'not learned — using −1.0 s per step as a rough default'
                }
              />
              <Row label="Points in the fit" value={String(model.points)} />
              <Row
                label="Learned from"
                value={
                  model.scope === 'basket' && model.basketId
                    ? `${basketName(model.basketId)} only`
                    : basketId
                      ? 'all baskets pooled — too few shots in the chosen one'
                      : 'all baskets pooled (no basket chosen)'
                }
              />
              <Row
                label="Grind range you use"
                value={model.range ? `${model.range.min} – ${model.range.max}` : '—'}
              />
              {model.rejected && (
                <Row
                  label="Why it was not learned"
                  value={{
                    'too-few': 'too few usable shots',
                    'no-spread': 'you always grind at nearly the same setting',
                    noisy: 'shot times vary more than the grind explains',
                    'wrong-sign': 'the data says finer is faster, which cannot be right',
                    implausible: 'the implied effect is outside anything plausible',
                  }[model.rejected]}
                />
              )}
            </div>

            <p className="text-xs text-coffee-muted">
              What the model does not know: bean age, dose variation, puck prep and
              temperature. That is why it reports a confidence and why the suggestion is
              capped to the range you actually use — it will nudge you a step at a time,
              not hand you a number you have never ground at.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
