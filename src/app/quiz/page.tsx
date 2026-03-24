'use client'

import { useState, useRef, useMemo, useCallback, useEffect } from 'react'
import Image from 'next/image'

// ─── CONSTANTS ──────────────────────────────────────────────
const ERASMUS_CORRECT = ['Juliette', 'Theo', 'Cecile', 'Wafa', 'Paul', 'Raffi']
const ERASMUS_FAKE = ['Maria', 'Pierre', 'Sophie', 'Lucas', 'Emma', 'Hugo', 'Léa', 'Tom', 'Camille', 'Maxime']
const CORRECT_ORDER = ['Marcel', 'Marc', 'Eudald', 'Ivan', 'Alejandro', 'Nacho']

type Answers = Record<number, string | string[]>
type QuestionType = 'date' | 'free-text' | 'single' | 'single-image' | 'image-choice' | 'multi-select' | 'drag-order' | 'multi-choice'

interface ImageOption { text: string; image: string }

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function normalizeDate(val: string) {
  return val.replace(/[-.\s]/g, '/').trim()
}

// ─── QUESTION DEFINITIONS ────────────────────────────────────
const QUESTIONS = [
  {
    idx: 0, label: 'Aniversari', type: 'date' as const,
    text: 'Quan és el meu aniversari?',
  },
  {
    idx: 1, label: 'Gats', type: 'single' as const,
    text: 'Com es diuen els meus gats?',
    options: ['Salsa i Tango', 'Jordi i Montserrat', 'Mambo i Samba', 'Kim i Kanye'],
  },
  {
    idx: 2, label: 'Amic', type: 'single-image' as const,
    text: 'Com es diu aquest amic meu?',
    showImage: '/amic.jpeg',
    options: ['Marc', 'Nacho', 'Alejandro', 'Eudald'],
  },
  {
    idx: 3, label: 'Primera quedada', type: 'single' as const,
    text: 'Quin dia vam quedar per primer cop?',
    options: ['31/10/25', '03/01/26', '10/01/26', '11/01/26'],
  },
  {
    idx: 4, label: 'Menjar preferit', type: 'image-choice' as const,
    text: 'Quin és el meu menjar preferit?',
    imageOptions: [
      { text: 'Hamburguesa', image: '/hamburguesa.jpg' },
      { text: 'Pizza', image: '/pizza.jpg' },
      { text: 'Risotto', image: '/risotto.jpg' },
      { text: 'Em fa pal pensar-lo', image: '/food-em-fa-pal.svg' },
    ],
  },
  {
    idx: 5, label: 'Artista Spotify', type: 'image-choice' as const,
    text: "Quin va ser el meu artista més escoltat a Spotify l'any passat?",
    imageOptions: [
      { text: 'Jack Harlow', image: '/jack_harlow.jpg' },
      { text: 'Rels B', image: '/rels_b.jpg' },
      { text: 'Bad Bunny', image: '/bad_bunny.jpg' },
      { text: 'Mushka', image: '/mushkaa.webp' },
    ],
  },
  {
    idx: 6, label: 'Erasmus', type: 'multi-select' as const,
    text: "Clica 4 noms de gent que em vaig fer d'Erasmus (La Laura era massa fàcil així que no la poso, espavila)",
  },
  {
    idx: 7, label: 'Postres', type: 'image-choice' as const,
    text: 'Quin és el meu postres preferit?',
    imageOptions: [
      { text: 'Pastís de formatge', image: '/pastis_de_formatge.webp' },
      { text: 'Gelat', image: '/gelat.webp' },
      { text: 'Pastís Sacher', image: '/Sacher.jpg' },
      { text: 'Coulant de xocolata', image: '/coulant.jpg' },
    ],
  },
  {
    idx: 8, label: 'Graduació', type: 'free-text' as const,
    text: 'Com anava vestit a la graduació?',
  },
  {
    idx: 9, label: 'Ordre amics', type: 'drag-order' as const,
    text: 'Ordena els meus amics per ordre de quan els vaig conèixer:',
  },
  {
    idx: 10, label: 'Carcassonne', type: 'image-choice' as const,
    text: 'Quin d\'aquests jocs és el Carcassonne?',
    imageOptions: [
      { text: '1', image: '/carcassonne.jpg' },
      { text: '2', image: '/d&d.jpg' },
      { text: '3', image: '/risk.webp' },
      { text: '4', image: '/catan.webp' },
    ],
  },
  {
    idx: 11, label: 'Veritat o mentida', type: 'multi-choice' as const,
    text: 'Què creus que és veritat sobre mi?',
    options: [
      'Tinc una colecció de més de 60 cubs de Rubik',
      'Sempre que viatjo m\'emporto un petit peluxe que em va regalar me germana',
      'Em sé més del 80% de les banderes del món',
      'Quan era petit tenia un amic imaginari que es deia Pol',
    ],
  },
  {
    idx: 12, label: 'Segon cognom', type: 'free-text' as const,
    text: 'Com em dic de segon cognom?',
  },
  {
    idx: 13, label: 'Ruta esplai', type: 'single' as const,
    text: 'On vaig anar de ruta amb l\'esplai?',
    options: ['Menorca i Picos d\'Europa', 'Mallorca i Picos d\'Europa', 'Galicia i Costa Brava', 'Menorca i Pirineus'],
  },
  {
    idx: 14, label: 'La raó', type: 'single' as const,
    text: 'Qui té sempre la raó?',
    options: ['Martí', 'Clara'],
  },
]

// ─── PER-STEP VALIDATION (just "is the answer ready to proceed?") ────────────
function validateStep(qIdx: number, answers: Answers, failureCount: Record<number, number>): string | null {
  const q = QUESTIONS[qIdx]
  const answer = answers[qIdx]
  const failures = failureCount[qIdx] || 0
  
  switch (q.type) {
    case 'date':
    case 'free-text':
      if (!(answer as string || '').trim()) return 'Cal respondre aquesta pregunta.'
      return null
    case 'single':
    case 'single-image':
    case 'image-choice':
      if (!answer) return 'Selecciona una opció per continuar.'
      return null
    case 'multi-choice':
      // Question 11: always allow proceeding, no validation errors
      return null
    case 'multi-select':
      if (((answer as string[]) || []).length !== 4) return 'Cal seleccionar exactament 4 noms.'
      return null
    case 'drag-order':
      return null
  }
}

// ─── COMPUTE CORRECTNESS OF ALL ANSWERS ─────────────────────
function computeResults(answers: Answers): Record<number, boolean> {
  const dateNorm = normalizeDate((answers[0] as string) || '')
  const q7 = (answers[6] as string[]) || []
  const q10 = (answers[9] as string[]) || []
  return {
    0: dateNorm === '24/04/2003' || dateNorm === '24/4/2003',
    1: answers[1] === 'Mambo i Samba',
    2: answers[2] === 'Marc',
    3: answers[3] === '10/01/26',
    4: answers[4] === 'Em fa pal pensar-lo',
    5: answers[5] === 'Jack Harlow',
    6: q7.length === 4 && q7.every(n => ERASMUS_CORRECT.includes(n)),
    7: answers[7] === 'Pastís de formatge',
    8: !!(answers[8] as string || '').trim(),    // free text – always correct if non-empty
    9: q10.join(',') === CORRECT_ORDER.join(','),
    10: answers[10] === '1',
    11: (() => {
      const q11 = (answers[11] as string[]) || []
      return q11.length === 2 && q11.includes('Tinc una colecció de més de 60 cubs de Rubik') && q11.includes('Em sé més del 80% de les banderes del món')
    })(),
    12: (answers[12] as string || '').trim().toLowerCase() === 'graells',
    13: answers[13] === 'Menorca i Picos d\'Europa',
    14: answers[14] === 'Martí',
  }
}

// ─── SUB-COMPONENTS ──────────────────────────────────────────

function SingleChoice({ options, value, onChange }: {
  options: string[]; value: string; onChange: (v: string) => void
}) {
  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <button
          key={opt}
          className={`option-btn${value === opt ? ' selected' : ''}`}
          onClick={() => onChange(opt)}
          type="button"
        >
          <span className="flex items-center gap-3">
            <span style={{
              width: 20, height: 20, borderRadius: '50%', border: '2px solid',
              borderColor: value === opt ? 'var(--primary)' : '#e5e7eb',
              background: value === opt ? 'var(--primary)' : 'white',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'all 0.2s',
            }}>
              {value === opt && <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'white' }} />}
            </span>
            {opt}
          </span>
        </button>
      ))}
    </div>
  )
}

function MultiChoice({ options, value, onChange }: {
  options: string[]; value: string[]; onChange: (v: string[]) => void
}) {
  const toggle = (name: string) => {
    if (value.includes(name)) {
      onChange(value.filter(n => n !== name))
    } else {
      onChange([...value, name])
    }
  }
  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <button
          key={opt}
          className={`option-btn${value.includes(opt) ? ' selected' : ''}`}
          onClick={() => toggle(opt)}
          type="button"
        >
          <span className="flex items-center gap-3">
            <span style={{
              width: 20, height: 20, borderRadius: '50%', border: '2px solid',
              borderColor: value.includes(opt) ? 'var(--primary)' : '#e5e7eb',
              background: value.includes(opt) ? 'var(--primary)' : 'white',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'all 0.2s',
            }}>
              {value.includes(opt) && <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'white' }} />}
            </span>
            {opt}
          </span>
        </button>
      ))}
    </div>
  )
}

function ImageChoice({ options, value, onChange }: {
  options: ImageOption[]; value: string; onChange: (v: string) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map((opt) => (
        <button
          key={opt.text}
          className={`image-option${value === opt.text ? ' selected' : ''}`}
          onClick={() => onChange(opt.text)}
          type="button"
        >
          <div style={{ width: '100%', height: 100, position: 'relative', borderRadius: 8, overflow: 'hidden', background: '#f5f5f5' }}>
            <Image src={opt.image} alt={opt.text} fill sizes="(max-width: 640px) 45vw, 180px" style={{ objectFit: 'cover' }} />
          </div>
          <span className="text-sm font-medium text-center leading-tight" style={{ color: 'var(--text)' }}>
            {opt.text}
          </span>
        </button>
      ))}
    </div>
  )
}

function MultiSelect({ options, value, onChange }: {
  options: string[]; value: string[]; onChange: (v: string[]) => void
}) {
  const toggle = (name: string) => {
    if (value.includes(name)) onChange(value.filter(n => n !== name))
    else if (value.length < 4) onChange([...value, name])
  }
  return (
    <div>
      <p className="text-xs mb-3 font-medium" style={{ color: '#9ca3af' }}>
        Seleccionats: <strong style={{ color: value.length === 4 ? 'var(--primary)' : 'var(--text)' }}>{value.length}</strong>/4
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((name) => (
          <button
            key={name}
            className={`multi-btn${value.includes(name) ? ' selected' : ''}`}
            onClick={() => toggle(name)}
            type="button"
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  )
}

function DragOrder({ items, onChange }: { items: string[]; onChange: (v: string[]) => void }) {
  const dragIndexRef = useRef<number | null>(null)
  const [dragOver, setDragOver] = useState<number | null>(null)

  const moveUp = (i: number) => {
    if (i === 0) return
    const next = [...items];
    [next[i - 1], next[i]] = [next[i], next[i - 1]]
    onChange(next)
  }
  const moveDown = (i: number) => {
    if (i === items.length - 1) return
    const next = [...items];
    [next[i], next[i + 1]] = [next[i + 1], next[i]]
    onChange(next)
  }
  const handleDrop = (i: number) => {
    const from = dragIndexRef.current
    if (from === null || from === i) return
    const next = [...items]
    const [removed] = next.splice(from, 1)
    next.splice(i, 0, removed)
    onChange(next)
    dragIndexRef.current = null
    setDragOver(null)
  }

  return (
    <div className="space-y-2">
      {items.map((name, i) => (
        <div
          key={name}
          className={`drag-item${dragOver === i ? ' over' : ''}`}
          draggable
          onDragStart={() => { dragIndexRef.current = i }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(i) }}
          onDragLeave={() => setDragOver(null)}
          onDrop={() => handleDrop(i)}
        >
          <span className="drag-handle">⠿</span>
          <span className="text-sm font-semibold" style={{ color: '#9ca3af', minWidth: 20 }}>{i + 1}.</span>
          <span className="flex-1 font-medium">{name}</span>
          <div className="flex flex-col gap-0.5 ml-auto">
            <button type="button" onClick={() => moveUp(i)} disabled={i === 0}
              className="text-xs px-1.5 py-0.5 rounded disabled:opacity-30 hover:bg-gray-100"
              style={{ lineHeight: 1, color: '#6b7280' }}>↑</button>
            <button type="button" onClick={() => moveDown(i)} disabled={i === items.length - 1}
              className="text-xs px-1.5 py-0.5 rounded disabled:opacity-30 hover:bg-gray-100"
              style={{ lineHeight: 1, color: '#6b7280' }}>↓</button>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── QUESTION RENDERER ───────────────────────────────────────
function QuestionRenderer({
  qIdx, answers, setAnswer, erasmusNames, failureCount,
}: {
  qIdx: number
  answers: Answers
  setAnswer: (idx: number, val: string | string[]) => void
  erasmusNames: string[]
  failureCount: Record<number, number>
}) {
  const q = QUESTIONS[qIdx]
  const val = answers[qIdx]

  switch (q.type) {
    case 'date':
      return (
        <input
          type="text"
          value={(val as string) || ''}
          onChange={e => {
            let input = e.target.value.replace(/\D/g, '')
            if (input.length >= 2) {
              input = input.slice(0, 2) + '/' + input.slice(2)
            }
            if (input.length >= 5) {
              input = input.slice(0, 5) + '/' + input.slice(5, 9)
            }
            setAnswer(qIdx, input)
          }}
          placeholder="DD/MM/AAAA"
          className="input-field"
          autoFocus
          maxLength={10}
        />
      )
    case 'free-text':
      return (
        <input
          type="text"
          value={(val as string) || ''}
          onChange={e => setAnswer(qIdx, e.target.value)}
          placeholder="Escriu la teva resposta..."
          className="input-field"
          autoFocus
        />
      )
    case 'single': {
      const sq = q as typeof QUESTIONS[1]
      return (
        <SingleChoice
          options={sq.options ?? []}
          value={(val as string) || ''}
          onChange={v => setAnswer(qIdx, v)}
        />
      )
    }
    case 'single-image': {
      const sq = q as typeof QUESTIONS[2]
      return (
        <div className="space-y-4">
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', height: 200, position: 'relative' }}>
            <Image src={sq.showImage ?? ''} alt="Amic" fill sizes="100vw" style={{ objectFit: 'cover' }} />
          </div>
          <SingleChoice
            options={sq.options ?? []}
            value={(val as string) || ''}
            onChange={v => setAnswer(qIdx, v)}
          />
        </div>
      )
    }
    case 'image-choice': {
      const iq = q as typeof QUESTIONS[4]
      return (
        <ImageChoice
          options={iq.imageOptions ?? []}
          value={(val as string) || ''}
          onChange={v => setAnswer(qIdx, v)}
        />
      )
    }
    case 'multi-select':
      return (
        <MultiSelect
          options={erasmusNames}
          value={(val as string[]) || []}
          onChange={v => setAnswer(qIdx, v)}
        />
      )
    case 'multi-choice': {
      const mq = q as typeof QUESTIONS[11]
      const isQ11Hint = qIdx === 11 && (failureCount[qIdx] || 0) >= 2
      return (
        <div>
          <MultiChoice
            options={mq.options ?? []}
            value={(val as string[]) || []}
            onChange={v => setAnswer(qIdx, v)}
          />
          {isQ11Hint && (
            <p style={{ color: '#f59e0b', fontSize: '0.875rem', marginTop: '0.75rem' }}>
              💡 Potser has de clicar més d'una resposta...
            </p>
          )}
        </div>
      )
    }
    case 'drag-order':
      return (
        <div>
          <p className="text-xs mb-3" style={{ color: '#9ca3af' }}>
            Arrossega ⠿ o usa les fletxes ↑↓ per ordenar
          </p>
          <DragOrder
            items={(val as string[]) || [...CORRECT_ORDER]}
            onChange={v => setAnswer(qIdx, v)}
          />
        </div>
      )
  }
}

// ─── RESULTS PAGE ────────────────────────────────────────────
function ResultsPage({
  results,
  answers,
  onRetry,
}: {
  results: Record<number, boolean>
  answers: Answers
  onRetry: (wrongIndices: number[]) => void
}) {
  const wrongIndices = Object.entries(results).filter(([, ok]) => !ok).map(([i]) => Number(i))
  const allCorrect = wrongIndices.length === 0
  const videoUrl = allCorrect ? '/content.mp4' : '/trist.mp4'

  const confettiDone = useRef(false)
  useEffect(() => {
    if (allCorrect && !confettiDone.current) {
      confettiDone.current = true
      import('canvas-confetti').then(({ default: confetti }) => {
        const end = Date.now() + 4000
        const colors = ['#ff6b9d', '#ffd700', '#6bcb77', '#4d96ff', '#ff9f43']
        const frame = () => {
          confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors })
          confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors })
          if (Date.now() < end) requestAnimationFrame(frame)
        }
        frame()
      })
    }
  }, [allCorrect])

  return (
    <main className="min-h-screen py-8 px-4" style={{ background: 'linear-gradient(160deg, #fff0f8 0%, #fff8f5 50%, #f0f8ff 100%)' }}>
      <div className="max-w-lg mx-auto" style={{ animation: 'slideResultsIn 0.4s ease-out' }}>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">{allCorrect ? '🏆' : '📋'}</div>
          <h1 className="text-3xl font-black" style={{ color: 'var(--primary)' }}>
            {allCorrect ? 'Perfecte!' : 'Resultats'}
          </h1>
          <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>
            {allCorrect
              ? 'Ho has encertat tot!'
              : `${wrongIndices.length} resposta${wrongIndices.length !== 1 ? 'es' : ''} incorrecta${wrongIndices.length !== 1 ? 'es' : ''}`}
          </p>
        </div>

        {/* VIDEO SECTION */}
        <div className="rounded-3xl p-8 text-center mb-6 animate-bounce-in" style={{
          background: 'linear-gradient(135deg, #fff0f8, #f0fdf4)',
          border: '2px solid var(--primary)',
          boxShadow: '0 8px 40px rgba(232,121,160,0.2)',
        }}>
          <video
            width="100%"
            height="auto"
            controls
            autoPlay
            muted
            loop
            style={{ borderRadius: 12 }}
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* SUCCESS — show password */}
        {allCorrect && (
          <div className="rounded-3xl p-8 text-center mb-6 animate-bounce-in" style={{
            background: 'linear-gradient(135deg, #fff0f8, #f0fdf4)',
            border: '2px solid var(--primary)',
            boxShadow: '0 8px 40px rgba(232,121,160,0.2)',
          }}>
            <p className="text-sm font-semibold mb-3" style={{ color: '#9ca3af' }}>
              Em coneixes molt bé 😊 Aquí tens la teva recompensa:
              (Porfa no em facis mai res semblant que no n'ensertaré una i quedaré fatal)
            </p>
            <div className="rounded-2xl py-6 px-4" style={{ background: 'white', border: '1px solid var(--border)' }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#9ca3af' }}>
                Contrasenya secreta
              </p>
              <div className="text-6xl font-black tracking-[16px]" style={{ color: 'var(--primary)' }}>
                316
              </div>
            </div>
          </div>
        )}

        {/* Question results list */}
        <div className="space-y-2 mb-6">
          {QUESTIONS.map((q, i) => {
            const ok = results[i]
            return (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                style={{
                  background: ok ? '#f0fdf4' : '#fef2f2',
                  border: `1.5px solid ${ok ? '#bbf7d0' : '#fecaca'}`,
                  animation: `slideResultsIn ${0.1 + i * 0.04}s ease-out both`,
                }}
              >
                <span style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: ok ? 'var(--success)' : 'var(--error)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 700, fontSize: 14, flexShrink: 0,
                }}>
                  {ok ? '✓' : '✗'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold leading-tight truncate" style={{ color: 'var(--text)' }}>
                    {i + 1}. {q.label}
                  </p>
                  {!ok && (
                    <p className="text-xs mt-0.5" style={{ color: 'var(--error)' }}>
                      {i === 14 && answers[14] === 'Clara' ? "No t'equivoquis, que saps que tinc raó..." : 'Resposta incorrecta'}
                    </p>
                  )}
                </div>
                <span className="text-xs font-bold" style={{ color: ok ? 'var(--success)' : 'var(--error)', flexShrink: 0 }}>
                  {ok ? 'Correcte' : 'Incorrecte'}
                </span>
              </div>
            )
          })}
        </div>

        {/* Retry button */}
        {!allCorrect && (
          <div className="space-y-3">
            <p className="text-center text-sm" style={{ color: '#6b7280' }}>
              Vols corregir les {wrongIndices.length} respostes incorrectes?
            </p>
            <button
              onClick={() => onRetry(wrongIndices)}
              className="btn-primary text-base py-4"
              style={{ borderRadius: 14 }}
            >
              Tornar a intentar ({wrongIndices.length} pregunta{wrongIndices.length !== 1 ? 'es' : ''})
            </button>
          </div>
        )}
      </div>
    </main>
  )
}

// ─── INTRO SCREEN ───────────────────────────────────────
function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: 'linear-gradient(160deg, #fff0f8 0%, #fff8f5 50%, #f0f8ff 100%)' }}>
      <div className="max-w-lg mx-auto text-center">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-4xl font-black mb-6" style={{ color: 'var(--primary)' }}>
          Anem a comprovar
          <br />
          lo molt que m'escoltes...
        </h1>
        <p className="text-lg mb-8" style={{ color: '#6b7280' }}>
          Si vols el regal te l'hauràs de guanyar
        </p>
        <button
          onClick={onStart}
          className="btn-primary text-base py-4 px-8"
          style={{ borderRadius: 14 }}
        >
          Comença el quiz →
        </button>
      </div>
    </main>
  )
}

// ─── MAIN QUIZ PAGE ──────────────────────────────────────
export default function QuizPage() {
  const erasmusNames = useMemo(() => shuffleArray([...ERASMUS_CORRECT, ...ERASMUS_FAKE]), [])
  const initialQ10 = useMemo(() => shuffleArray([...CORRECT_ORDER]), [])

  // Core state
  const [phase, setPhase] = useState<'intro' | 'quiz' | 'results'>('intro')
  const [queue, setQueue] = useState<number[]>([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14])
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Answers>({ 9: initialQ10 })
  const [results, setResults] = useState<Record<number, boolean> | null>(null)

  // Animation
  const [slideKey, setSlideKey] = useState(0)
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')

  // Per-step inline error
  const [stepError, setStepError] = useState<string | null>(null)

  // Track failures per question for hints
  const [failureCount, setFailureCount] = useState<Record<number, number>>({})

  const currentQIdx = queue[step]
  const isLast = step === queue.length - 1
  const isFirst = step === 0
  const isRetryMode = queue.length < 15

  const setAnswer = useCallback((idx: number, val: string | string[]) => {
    setAnswers(prev => ({ ...prev, [idx]: val }))
    setStepError(null)
  }, [])

  const goNext = () => {
    const err = validateStep(currentQIdx, answers, failureCount)
    if (err) {
      setStepError(err)
      // Track failure for this question
      setFailureCount(prev => ({ ...prev, [currentQIdx]: (prev[currentQIdx] || 0) + 1 }))
      return
    }

    if (isLast) {
      const res = computeResults(answers)
      setResults(res)
      setPhase('results')
    } else {
      setDirection('forward')
      setSlideKey(k => k + 1)
      setStep(s => s + 1)
      setStepError(null)
    }
  }

  const goBack = () => {
    if (isFirst) return
    setDirection('backward')
    setSlideKey(k => k + 1)
    setStep(s => s - 1)
    setStepError(null)
  }

  const handleRetry = useCallback((wrongIndices: number[]) => {
    // Increment failure count for wrong answers
    setFailureCount(prev => {
      const next = { ...prev }
      wrongIndices.forEach(idx => {
        next[idx] = (next[idx] || 0) + 1
      })
      return next
    })
    // Reset wrong answers
    const next = { ...answers }
    wrongIndices.forEach(idx => {
      if (idx === 9) next[9] = shuffleArray([...CORRECT_ORDER])
      else if (idx === 6) next[6] = []
      else next[idx] = ''
    })
    setAnswers(next)
    setQueue(wrongIndices)
    setStep(0)
    setDirection('forward')
    setSlideKey(k => k + 1)
    setResults(null)
    setPhase('quiz')
    setStepError(null)
  }, [answers])

  const handleStartQuiz = () => {
    setPhase('quiz')
  }

  if (phase === 'intro') {
    return <IntroScreen onStart={handleStartQuiz} />
  }

  if (phase === 'results' && results) {
    return <ResultsPage results={results} answers={answers} onRetry={handleRetry} />
  }

  const progress = (step / queue.length) * 100
  const q = QUESTIONS[currentQIdx]

  return (
    <main className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg, #fff0f8 0%, #fff8f5 50%, #f0f8ff 100%)' }}>

      {/* ── Top bar ── */}
      <header className="px-4 pt-5 pb-3 flex-shrink-0">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={goBack}
              disabled={isFirst}
              className="flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-xl disabled:opacity-0 transition-opacity"
              style={{ color: 'var(--primary)', background: '#fff0f5', border: '1px solid #f9d0e0' }}
            >
              ← Enrere
            </button>
            <span className="text-xs font-bold" style={{ color: '#9ca3af' }}>
              {isRetryMode ? `Corregint · ` : ''}{step + 1} / {queue.length}
            </span>
            <div style={{ width: 80 }} /> {/* spacer */}
          </div>

          {/* Progress bar */}
          <div className="h-2 rounded-full overflow-hidden" style={{ background: '#f0d9e0' }}>
            <div
              className="h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress + (1 / queue.length) * 100}%`, background: 'linear-gradient(90deg, var(--primary), var(--accent))' }}
            />
          </div>
        </div>
      </header>

      {/* ── Question area (scrollable) ── */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        <div className="max-w-lg mx-auto">
          <div
            key={slideKey}
            style={{ animation: `${direction === 'forward' ? 'slideFromRight' : 'slideFromLeft'} 0.32s cubic-bezier(0.25,0.46,0.45,0.94) both` }}
          >
            <div className="question-card mb-4">
              {/* Question label + text */}
              <div className="mb-5">
                <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full" style={{
                  background: 'linear-gradient(135deg, #fff0f5, #fce7f0)',
                  color: 'var(--primary)',
                  border: '1px solid #f9d0e0',
                }}>
                  {isRetryMode ? '🔄 ' : ''}{q.label}
                </span>
                <p className="mt-3 text-lg font-bold leading-snug" style={{ color: 'var(--text)' }}>
                  {q.text}
                </p>
              </div>

              {/* Answer input */}
              <QuestionRenderer
                qIdx={currentQIdx}
                answers={answers}
                setAnswer={setAnswer}
                erasmusNames={erasmusNames}
                failureCount={failureCount}
              />

              {/* Inline validation error */}
              {stepError && (
                <p className="error-msg mt-3">✗ {stepError}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom navigation ── */}
      <div className="flex-shrink-0 px-4 pb-6 pt-2" style={{ background: 'transparent' }}>
        <div className="max-w-lg mx-auto">
          <button
            onClick={goNext}
            className="btn-primary text-base py-4"
            style={{ borderRadius: 14 }}
          >
            {isLast ? 'Veure resultats →' : 'Següent →'}
          </button>
        </div>
      </div>

    </main>
  )
}
