interface Props {
  value: number | null
  onChange: (value: number) => void
}

export function RatingInput({ value, onChange }: Props) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`flex-1 py-2 rounded text-sm font-semibold transition-colors ${
            value === n
              ? 'bg-orange-500 text-white'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  )
}
