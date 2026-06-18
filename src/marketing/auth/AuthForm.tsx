import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ROUTES } from '../../lib/routes'
import { supabase } from '../../lib/supabase'

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const isSignup = mode === 'signup'
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = isSignup
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) { setError(error.message); return }
    navigate(ROUTES.app)
  }

  return (
    <section className="mx-auto max-w-md px-6 py-24">
      <div className="rounded-3xl border border-coffee-line bg-coffee-surface p-8">
        <h1 className="font-display text-3xl font-semibold text-coffee-cream">
          {isSignup ? 'Create account' : 'Welcome back'}
        </h1>
        <p className="mt-2 text-sm text-coffee-muted">
          {isSignup ? 'Start tracking your shots.' : 'Sign in to your tracker.'}
        </p>

        <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
          <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
          <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full rounded-xl bg-coffee-accent px-4 py-3 font-semibold text-coffee-bg transition hover:bg-coffee-accent-soft disabled:opacity-50"
          >
            {loading ? '…' : isSignup ? 'Sign up' : 'Log in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-coffee-muted">
          {isSignup ? 'Already have an account?' : 'No account yet?'}{' '}
          <Link
            to={isSignup ? ROUTES.login : ROUTES.signup}
            className="font-semibold text-coffee-accent hover:text-coffee-accent-soft"
          >
            {isSignup ? 'Log in' : 'Sign up'}
          </Link>
        </p>
      </div>
    </section>
  )
}

function Field({
  label, type, value, onChange, placeholder,
}: {
  label: string; type: string; value: string; onChange: (v: string) => void; placeholder: string
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-coffee-text">{label}</span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-xl border border-white/15 bg-coffee-surface2 px-4 py-3 text-coffee-text placeholder:text-coffee-muted focus:border-coffee-accent focus:outline-none"
      />
    </label>
  )
}
