import { Link } from 'react-router-dom'
import { ROUTES } from '../../lib/routes'

/**
 * Optik-Stub für Login/Signup. KEINE Funktion — echtes Supabase-Auth folgt Phase 2.
 * Formular ist absichtlich deaktiviert (onSubmit verhindert), kein DB-Call.
 */
export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const isSignup = mode === 'signup'
  return (
    <section className="mx-auto max-w-md px-6 py-24">
      <div className="rounded-3xl border border-coffee-line bg-coffee-surface p-8">
        <h1 className="font-display text-3xl font-semibold text-coffee-cream">
          {isSignup ? 'Account erstellen' : 'Willkommen zurück'}
        </h1>
        <p className="mt-2 text-sm text-coffee-muted">
          Auth folgt in Phase&nbsp;2 — dieses Formular ist nur ein Optik-Vorschau, noch ohne Funktion.
        </p>

        <form className="mt-7 space-y-4" onSubmit={(e) => e.preventDefault()}>
          {isSignup && <Field label="Name" type="text" placeholder="Dein Name" />}
          <Field label="E-Mail" type="email" placeholder="du@example.com" />
          <Field label="Passwort" type="password" placeholder="••••••••" />
          <button
            type="submit"
            disabled
            className="w-full cursor-not-allowed rounded-xl bg-coffee-accent/60 px-4 py-3 font-semibold text-coffee-bg"
          >
            {isSignup ? 'Registrieren' : 'Einloggen'} (bald)
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-coffee-muted">
          {isSignup ? 'Schon dabei?' : 'Noch kein Account?'}{' '}
          <Link
            to={isSignup ? ROUTES.login : ROUTES.signup}
            className="font-semibold text-coffee-accent hover:text-coffee-accent-soft"
          >
            {isSignup ? 'Login' : 'Sign up'}
          </Link>
        </p>
      </div>
    </section>
  )
}

function Field({ label, type, placeholder }: { label: string; type: string; placeholder: string }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-coffee-text">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-xl border border-coffee-line bg-coffee-bg px-4 py-3 text-coffee-text placeholder:text-coffee-muted/60 focus:border-coffee-accent focus:outline-none"
      />
    </label>
  )
}
