import { useParams, Navigate, useNavigate } from 'react-router-dom'
import { ANIMATIONS } from '../utils/animationContent'
import { ROUTES } from '../lib/routes'
import { BoilerAnimation } from '../components/animations/BoilerAnimation'
import { V60Animation } from '../components/animations/V60Animation'
import { MilkAnimation } from '../components/animations/MilkAnimation'
import { LatteHeartAnimation } from '../components/animations/LatteHeartAnimation'

const COMPONENTS: Record<string, React.FC> = {
  boiler: BoilerAnimation,
  v60: V60Animation,
  milk: MilkAnimation,
  'latte-heart': LatteHeartAnimation,
}

export function AnimateDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const meta = ANIMATIONS.find(a => a.id === id)
  const Component = id ? COMPONENTS[id] : undefined

  if (!meta || !Component) return <Navigate to={ROUTES.animate} replace />

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate(ROUTES.animate)} className="text-coffee-muted hover:text-coffee-cream text-lg">←</button>
        <div>
          <h1 className="font-display text-2xl font-semibold text-coffee-cream">{meta.title}</h1>
          <p className="text-sm text-coffee-muted">{meta.description}</p>
        </div>
      </div>
      <Component />
    </div>
  )
}
