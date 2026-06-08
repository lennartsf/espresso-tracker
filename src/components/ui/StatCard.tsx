import { Card } from './Card'
import { CountUp } from '../CountUp'

export function StatCard({
  value,
  label,
  decimals = 0,
}: {
  value: number
  label: string
  decimals?: number
}) {
  return (
    <Card className="p-4 text-center">
      <p className="font-display text-2xl font-bold text-coffee-accent-soft">
        <CountUp end={value} decimals={decimals} />
      </p>
      <p className="mt-1 text-xs text-coffee-muted">{label}</p>
    </Card>
  )
}
