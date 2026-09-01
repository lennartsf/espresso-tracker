/** Der „i" neben einem Feldlabel.
 *
 *  Vorher trug er `bg-coffee-surface2` — dieselbe Fläche wie die Eingabefelder
 *  daneben. Damit sah er nicht wie eine Schaltfläche aus, sondern wie ein Stück
 *  Feldhintergrund, und wurde übersehen. Jetzt nimmt er die Akzentfarbe der
 *  übrigen Buttons: getönte Fläche, Akzentrand, Akzentschrift — im
 *  geschlossenen Zustand zurückhaltend, im offenen voll gefüllt.
 *
 *  Er ist auch von 16 auf 18 px gewachsen: 16 px liegt unter jeder brauchbaren
 *  Trefferfläche, und am Telefon wird genau dieser Knopf mit dem Daumen
 *  getroffen. */
export function InfoButton({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      className={`flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full border text-[11px] font-bold leading-none transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-coffee-accent ${
        open
          ? 'border-coffee-accent bg-coffee-accent text-coffee-on-accent'
          : 'border-coffee-accent/50 bg-coffee-accent/15 text-coffee-accent-soft hover:border-coffee-accent hover:bg-coffee-accent/25'
      }`}
    >
      i
    </button>
  )
}
