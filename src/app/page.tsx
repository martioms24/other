'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      if (password === '28012024') {
        router.push('/birthday')
      } else {
        setError('Contrasenya incorrecta. Torna-ho a intentar!')
        setLoading(false)
        setPassword('')
        inputRef.current?.focus()
      }
    }, 400)
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-5" style={{ background: 'linear-gradient(135deg, #fff0f5 0%, #fff8f5 50%, #fff5e0 100%)' }}>
      <div className="w-full max-w-sm animate-fade-in">
        {/* Icon */}
        <div className="text-center mb-8">
          <div className="text-7xl mb-4" role="img" aria-label="cadenat">
            🔐
          </div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
            Accés Privat
          </h1>
          <p className="text-sm mt-2" style={{ color: '#9ca3af' }}>
            Introdueix la contrasenya per continuar
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-8 shadow-lg" style={{ border: '1px solid var(--border)' }}>
          {/* Hint */}
          <div className="mb-6 p-4 rounded-xl text-center" style={{ background: 'linear-gradient(135deg, #fff0f5, #fff8e0)', border: '1px solid #f9d0e0' }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--primary)' }}>
              Pista
            </p>
            <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
              El dia que ens vam conèixer per primer cop (au, espavila a buscar quan va ser! 😉 - format DDMMYYYY)
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>
                Contrasenya
              </label>
              <input
                ref={inputRef}
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (error) setError('')
                }}
                placeholder="••••••••"
                className={`input-field ${error ? 'error' : ''}`}
                autoComplete="off"
                inputMode="numeric"
                autoFocus
              />
              {error && (
                <p className="error-msg mt-2">
                  ✗ {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="btn-primary mt-2"
              disabled={loading || password.length === 0}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Verificant...
                </span>
              ) : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
