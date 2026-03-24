'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ContractPage() {
  const [loaded, setLoaded] = useState(false)
  const [password, setPassword] = useState('')
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [error, setError] = useState('')

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === '7241') {
      setIsUnlocked(true)
      setError('')
    } else {
      setError('Contrasenya incorrecta')
    }
  }

  return (
    <main className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <header className="px-4 py-4 flex items-center gap-3" style={{
        background: 'white',
        borderBottom: '1px solid var(--border)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      }}>
        <Link
          href="/quiz"
          className="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-xl"
          style={{ color: 'var(--primary)', background: '#fff0f5', textDecoration: 'none' }}
        >
          ← Enrere
        </Link>
        <div>
          <h1 className="text-base font-bold" style={{ color: 'var(--text)' }}>Contracte Secret</h1>
          <p className="text-xs" style={{ color: '#9ca3af' }}>Document confidencial 🤫</p>
        </div>
      </header>

      {/* Password Protection */}
      {!isUnlocked ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="max-w-sm w-full">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">🔒</div>
              <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>
                Accés restringit
              </h2>
              <p className="text-sm" style={{ color: '#9ca3af' }}>
                Introdueix la contrasenya per accedir al contracte
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contrasenya"
                className="input-field w-full text-center"
                autoFocus
                maxLength={4}
              />
              {error && (
                <p className="text-sm text-center" style={{ color: 'var(--error)' }}>
                  {error}
                </p>
              )}
              <button
                type="submit"
                className="btn-primary w-full"
                style={{ borderRadius: 14 }}
              >
                Desbloquejar
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* PDF Viewer */
        <div className="flex-1 flex flex-col p-4">
          {!loaded && (
            <div className="flex flex-col items-center justify-center flex-1 py-16 gap-4">
              <div className="text-5xl">📄</div>
              <p className="text-sm font-medium" style={{ color: '#9ca3af' }}>
                Carregant el document...
              </p>
            </div>
          )}

          <div className="flex-1 rounded-2xl overflow-hidden shadow-lg" style={{
            border: '1px solid var(--border)',
            display: loaded ? 'block' : 'none',
            minHeight: 'calc(100vh - 120px)',
          }}>
            <iframe
              src="/contract.pdf"
              title="Contracte Secret"
              width="100%"
              height="100%"
              style={{ minHeight: 'calc(100vh - 120px)', border: 'none', display: 'block' }}
              onLoad={() => setLoaded(true)}
            />
          </div>

          {/* Download button */}
          <div className="mt-4 text-center">
            <a
              href="/contract.pdf"
              download
              className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl"
              style={{
                background: 'white',
                color: 'var(--primary)',
                border: '1px solid var(--border)',
                textDecoration: 'none',
              }}
            >
              ⬇️ Descarregar PDF
            </a>
          </div>
        </div>
      )}
    </main>
  )
}
