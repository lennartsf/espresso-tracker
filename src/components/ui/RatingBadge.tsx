import { ratingBadgeClasses } from '../../utils/ratingColor'

export function RatingBadge({ value }: { value: number }) {
  return (
    <span
      className={`inline-flex min-w-[2.25rem] items-center justify-center rounded-lg px-2 py-1.5 font-display text-base font-bold ${ratingBadgeClasses(value)}`}
    >
      {value}
    </span>
  )
}
