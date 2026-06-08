export function InfoButton({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-colors ${
        open ? 'bg-coffee-accent text-coffee-bg' : 'bg-coffee-surface2 text-coffee-muted hover:bg-coffee-surface'
      }`}
    >
      i
    </button>
  )
}
