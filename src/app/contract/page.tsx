'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ContractPage() {
  const [loaded, setLoaded] = useState(false)

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

      {/* PDF Viewer */}
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

        {/* Fallback download link */}
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
    </main>
  )
}
