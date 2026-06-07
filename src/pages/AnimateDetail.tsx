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
        <button onClick={() => navigate(ROUTES.animate)} className="text-slate-400 text-lg">←</button>
        <span className="text-3xl">{meta.icon}</span>
        <div>
          <h1 className="text-xl font-bold text-slate-800">{meta.title}</h1>
          <p className="text-sm text-slate-500">{meta.description}</p>
        </div>
      </div>
      <Component />
    </div>
  )
}
