'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type BlowState = 'idle' | 'listening' | 'blown' | 'redirecting'

// ─── CANDLE DATA ─────────────────────────────────────────────
const CANDLES = [
  { x: 93,  col: '#FF6B6B', hi: '#FFAAAA', delay: 0.00 },
  { x: 117, col: '#FFD93D', hi: '#FFE878', delay: 0.13 },
  { x: 150, col: '#6BCB77', hi: '#A0DFA8', delay: 0.07 },
  { x: 183, col: '#4D96FF', hi: '#90BAFF', delay: 0.19 },
  { x: 207, col: '#FF9F43', hi: '#FFBE80', delay: 0.05 },
]

// ─── CAKE SVG ────────────────────────────────────────────────
function Cake({ candlesOut, showSmoke }: { candlesOut: boolean; showSmoke: boolean }) {
  // Candle geometry
  const CB = 167  // candle base y (top-tier surface)
  const CH = 34   // candle height
  const CW = 9    // candle width

  return (
    <svg
      viewBox="0 0 300 385"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', maxWidth: 310, display: 'block', margin: '0 auto', overflow: 'visible' }}
      aria-label="Pastís de gelat de coco amb espelmes"
    >
      <defs>
        {/* ── Frosting side gradient (dark at edges, bright centre) ── */}
        <linearGradient id="fg1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#D8CCBA" />
          <stop offset="9%"   stopColor="#FFFDF8" />
          <stop offset="91%"  stopColor="#FFFDF8" />
          <stop offset="100%" stopColor="#D0C4B0" />
        </linearGradient>
        <linearGradient id="fg2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#D4C8B8" />
          <stop offset="9%"   stopColor="#FFF8F2" />
          <stop offset="91%"  stopColor="#FFF8F2" />
          <stop offset="100%" stopColor="#CCBEAD" />
        </linearGradient>

        {/* ── Layer gradients (visible through frosting) ── */}
        <linearGradient id="vanL" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#CDB880" />
          <stop offset="9%"   stopColor="#FFF8E4" />
          <stop offset="91%"  stopColor="#FFF8E4" />
          <stop offset="100%" stopColor="#C5B078" />
        </linearGradient>
        <linearGradient id="cocL" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#C0AE90" />
          <stop offset="9%"   stopColor="#F5ECD8" />
          <stop offset="91%"  stopColor="#F5ECD8" />
          <stop offset="100%" stopColor="#B8A688" />
        </linearGradient>
        <linearGradient id="crustL" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#7A5520" />
          <stop offset="9%"   stopColor="#BF8D42" />
          <stop offset="91%"  stopColor="#BF8D42" />
          <stop offset="100%" stopColor="#724E18" />
        </linearGradient>

        {/* ── Top surface (round top of each tier) ── */}
        <radialGradient id="topS" cx="42%" cy="38%" r="72%">
          <stop offset="0%"   stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#EDE3D0" />
        </radialGradient>

        {/* ── Ice cream scoop gradients ── */}
        <radialGradient id="sc1" cx="34%" cy="28%" r="65%">
          <stop offset="0%"   stopColor="#FFFFFE" />
          <stop offset="42%"  stopColor="#FFF5E0" />
          <stop offset="100%" stopColor="#E2CFA8" />
        </radialGradient>
        <radialGradient id="sc2" cx="36%" cy="30%" r="65%">
          <stop offset="0%"   stopColor="#FFFDF8" />
          <stop offset="48%"  stopColor="#FFF0D8" />
          <stop offset="100%" stopColor="#DCCBA4" />
        </radialGradient>

        {/* ── Plate ── */}
        <radialGradient id="plateG" cx="44%" cy="33%" r="76%">
          <stop offset="0%"   stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#D8D0C0" />
        </radialGradient>

        {/* ── White-choc drip ── */}
        <linearGradient id="drip" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.98" />
          <stop offset="100%" stopColor="#F8F2E8" stopOpacity="0.5"  />
        </linearGradient>

        {/* ── Flame ── */}
        <radialGradient id="flO" cx="50%" cy="72%" r="60%">
          <stop offset="0%"   stopColor="#FFCA28" />
          <stop offset="55%"  stopColor="#FF8F00" />
          <stop offset="100%" stopColor="#FF6D00" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="flI" cx="50%" cy="80%" r="50%">
          <stop offset="0%"   stopColor="#FFFFFF" />
          <stop offset="32%"  stopColor="#FFF59D" />
          <stop offset="100%" stopColor="#FFCA28" stopOpacity="0" />
        </radialGradient>

        {/* ── Filters ── */}
        <filter id="sh" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="6" stdDeviation="9" floodColor="#7A6040" floodOpacity="0.18" />
        </filter>
        <filter id="csh" x="-60%" y="-60%" width="220%" height="220%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.14" />
        </filter>
        <filter id="flGlow" x="-120%" y="-120%" width="340%" height="340%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="scoopSh" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="4" stdDeviation="6" floodColor="#8B7050" floodOpacity="0.22" />
        </filter>

        {/* ── Coconut flake texture pattern ── */}
        <pattern id="ct" x="0" y="0" width="24" height="14" patternUnits="userSpaceOnUse">
          <path d="M2 7 Q7 3.5 13 7"    fill="none" stroke="rgba(190,168,128,0.58)" strokeWidth="1.9" strokeLinecap="round" />
          <path d="M13 2 Q18 -1 23 2"   fill="none" stroke="rgba(190,168,128,0.42)" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M-1 12 Q5 8.5 10 12" fill="none" stroke="rgba(190,168,128,0.52)" strokeWidth="1.7" strokeLinecap="round" />
          <path d="M13 11 Q19 7.5 24 11" fill="none" stroke="rgba(180,158,118,0.38)" strokeWidth="1.4" strokeLinecap="round" />
        </pattern>

        {/* ── Toasted coconut shaving pattern (on scoops) ── */}
        <pattern id="toastedCt" x="0" y="0" width="20" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(-15)">
          <path d="M1 6 Q6 2 12 6"   fill="none" stroke="rgba(180,138,72,0.65)" strokeWidth="2" strokeLinecap="round" />
          <path d="M11 1 Q16 -2 20 1" fill="none" stroke="rgba(165,125,60,0.5)"  strokeWidth="1.6" strokeLinecap="round" />
          <path d="M0 11 Q5 8 10 11"  fill="none" stroke="rgba(170,132,68,0.55)" strokeWidth="1.8" strokeLinecap="round" />
        </pattern>
      </defs>

      {/* ═══════════════ PLATE ═══════════════════════ */}
      <ellipse cx="150" cy="371" rx="132" ry="20" fill="#C0B8A8" filter="url(#sh)" />
      <ellipse cx="150" cy="369" rx="130" ry="19" fill="url(#plateG)" />
      <ellipse cx="150" cy="368" rx="126" ry="16" fill="none" stroke="#C8C0B0" strokeWidth="1.5" />
      <ellipse cx="150" cy="368" rx="110" ry="13" fill="none" stroke="#E0D8C8" strokeWidth="0.7" />

      {/* ═══════════════ BOTTOM TIER ═════════════════ */}
      {/* --- Ice-cream layer stack (visible cross-section) --- */}
      <rect x="27" y="260" width="246" height="104" rx="13" fill="#B89060" />
      {/* Vanilla layer 1 */}
      <rect x="27" y="260" width="246" height="27" rx="13" fill="url(#vanL)" />
      {/* Coconut layer */}
      <rect x="27" y="286" width="246" height="27" fill="url(#cocL)" />
      {/* Vanilla layer 2 */}
      <rect x="27" y="312" width="246" height="27" fill="url(#vanL)" />
      {/* Cookie/biscuit base */}
      <rect x="27" y="338" width="246" height="26" rx="13" fill="url(#crustL)" />
      {/* Thin separator lines */}
      <line x1="27" y1="287" x2="273" y2="287" stroke="#B09060" strokeWidth="0.9" opacity="0.45" />
      <line x1="27" y1="313" x2="273" y2="313" stroke="#B09060" strokeWidth="0.9" opacity="0.45" />
      <line x1="27" y1="338" x2="273" y2="338" stroke="#8B6820" strokeWidth="1.1" opacity="0.55" />

      {/* Coconut specks inside coconut layer */}
      {Array.from({ length: 22 }).map((_, i) => (
        <ellipse
          key={i}
          cx={36 + i * 11}
          cy={300}
          rx={3.5} ry={1.4}
          fill="rgba(210,190,148,0.78)"
          transform={`rotate(${-28 + i * 8} ${36 + i * 11} 300)`}
        />
      ))}

      {/* --- Frosting overlay (semi-transparent so layers show through) --- */}
      <rect x="27" y="260" width="246" height="104" rx="13" fill="url(#fg1)" opacity="0.82" />
      <rect x="27" y="260" width="246" height="104" rx="13" fill="url(#ct)" opacity="0.88" />

      {/* --- Top ellipse (round surface of tier) --- */}
      <ellipse cx="150" cy="262" rx="123" ry="16.5" fill="#FFFEF8" />
      <ellipse cx="150" cy="261" rx="121" ry="15"   fill="url(#topS)" />
      <ellipse cx="150" cy="261" rx="121" ry="15"   fill="url(#ct)" opacity="0.75" />
      <ellipse cx="150" cy="261" rx="121" ry="15"   fill="none" stroke="#E4D8C4" strokeWidth="1.2" />

      {/* --- White-chocolate drips along top rim --- */}
      {[40,58,76,98,118,140,156,174,196,216,234,252].map((dx, i) => (
        <ellipse
          key={i}
          cx={dx}
          cy={264 + (i % 4) * 1.2}
          rx={3.5 + (i % 2) * 0.8}
          ry={7.5 + (i % 3) * 2.5}
          fill="url(#drip)"
        />
      ))}
      {/* White cap covering drip bases */}
      <ellipse cx="150" cy="260" rx="123" ry="16.5" fill="white" opacity="0.38" />

      {/* --- Pearl border along frosting line --- */}
      {Array.from({ length: 16 }).map((_, i) => (
        <circle
          key={i}
          cx={37 + i * 15}
          cy={261}
          r={5}
          fill="white"
          stroke="#E0D0BE"
          strokeWidth="0.9"
          filter="url(#csh)"
        />
      ))}

      {/* ═══════════════ TOP TIER ════════════════════ */}
      {/* --- Ice-cream layers --- */}
      <rect x="66" y="174" width="168" height="90"  rx="11" fill="#B89060" />
      <rect x="66" y="174" width="168" height="24"  rx="11" fill="url(#vanL)" />
      <rect x="66" y="197" width="168" height="24"          fill="url(#cocL)" />
      <rect x="66" y="220" width="168" height="22"          fill="url(#vanL)" />
      <rect x="66" y="241" width="168" height="23"  rx="11" fill="url(#crustL)" />
      <line x1="66" y1="198" x2="234" y2="198" stroke="#B09060" strokeWidth="0.7" opacity="0.45" />
      <line x1="66" y1="221" x2="234" y2="221" stroke="#B09060" strokeWidth="0.7" opacity="0.45" />
      <line x1="66" y1="241" x2="234" y2="241" stroke="#8B6820" strokeWidth="0.9" opacity="0.55" />

      {/* Coconut specks in top-tier coconut layer */}
      {Array.from({ length: 15 }).map((_, i) => (
        <ellipse
          key={i}
          cx={74 + i * 11}
          cy={209}
          rx={3} ry={1.2}
          fill="rgba(210,190,148,0.75)"
          transform={`rotate(${-28 + i * 9} ${74 + i * 11} 209)`}
        />
      ))}

      {/* --- Frosting overlay --- */}
      <rect x="66" y="174" width="168" height="90" rx="11" fill="url(#fg2)" opacity="0.83" />
      <rect x="66" y="174" width="168" height="90" rx="11" fill="url(#ct)" opacity="0.88" />

      {/* --- Top ellipse surface --- */}
      <ellipse cx="150" cy="176" rx="84"  ry="11.5" fill="#FFFEF8" />
      <ellipse cx="150" cy="175" rx="82"  ry="10"   fill="url(#topS)" />
      <ellipse cx="150" cy="175" rx="82"  ry="10"   fill="url(#ct)" opacity="0.75" />
      <ellipse cx="150" cy="175" rx="82"  ry="10"   fill="none" stroke="#E4D8C4" strokeWidth="1" />

      {/* --- Drips top tier --- */}
      {[76,94,112,132,148,164,184,202,220].map((dx, i) => (
        <ellipse
          key={i}
          cx={dx}
          cy={177 + (i % 3) * 1.1}
          rx={3.2 + (i % 2) * 0.7}
          ry={7 + (i % 4) * 2}
          fill="url(#drip)"
        />
      ))}
      <ellipse cx="150" cy="174" rx="84" ry="11.5" fill="white" opacity="0.35" />

      {/* --- Pearl border top tier --- */}
      {Array.from({ length: 11 }).map((_, i) => (
        <circle
          key={i}
          cx={74 + i * 16}
          cy={174}
          r={4.2}
          fill="white"
          stroke="#E0D0BE"
          strokeWidth="0.8"
          filter="url(#csh)"
        />
      ))}

      {/* ═══════════════ CANDLES (drawn BEFORE scoops) ════════ */}
      {CANDLES.map((c, i) => {
        const tipY = CB - CH
        const flBase = tipY
        return (
          <g key={i} filter="url(#csh)">
            {/* Wax pool at base */}
            <ellipse cx={c.x} cy={CB + 1} rx={CW / 2 + 3} ry={3.8} fill={c.col} opacity="0.55" />
            {/* Candle body */}
            <rect x={c.x - CW / 2} y={tipY} width={CW} height={CH} rx={3} fill={c.col} />
            {/* Left highlight */}
            <rect x={c.x - CW / 2 + 1} y={tipY + 3} width={2.5} height={CH - 6} rx={1} fill="rgba(255,255,255,0.38)" />
            {/* Right shadow */}
            <rect x={c.x + CW / 2 - 3} y={tipY + 2} width={2}   height={CH - 5} rx={1} fill="rgba(0,0,0,0.08)" />
            {/* Spiral stripe lines */}
            {[8, 17, 26].map(off => (
              <path
                key={off}
                d={`M${c.x - CW / 2} ${tipY + off} Q${c.x} ${tipY + off - 3.5} ${c.x + CW / 2} ${tipY + off}`}
                fill="none"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="1.6"
              />
            ))}
            {/* Top wax cap */}
            <ellipse cx={c.x} cy={tipY} rx={CW / 2 + 0.5} ry={3.2} fill={c.hi} />
            {/* Wick */}
            <line
              x1={c.x} y1={tipY - 1}
              x2={c.x} y2={tipY - 7}
              stroke="#2A1608"
              strokeWidth="1.5"
              strokeLinecap="round"
            />

            {/* ── Flame or smoke ── */}
            {!candlesOut ? (
              <g
                style={{
                  transformBox: 'fill-box' as const,
                  transformOrigin: 'bottom center',
                  animation: `flickerSvg ${0.65 + i * 0.07}s ease-in-out infinite`,
                  animationDelay: `${c.delay}s`,
                }}
                filter="url(#flGlow)"
              >
                {/* Ambient glow halo */}
                <ellipse
                  cx={c.x} cy={flBase - 15}
                  rx={10} ry={14}
                  fill={i % 2 === 0 ? '#FF8C00' : '#FF6A00'}
                  opacity="0.22"
                />
                {/* Outer flame shape */}
                <path
                  d={
                    `M${c.x} ${flBase - 31}` +
                    ` C${c.x - 6.5} ${flBase - 22} ${c.x - 7.5} ${flBase - 12} ${c.x - 5} ${flBase - 4}` +
                    ` C${c.x - 2.5} ${flBase + 1.5} ${c.x + 2.5} ${flBase + 1.5} ${c.x + 5} ${flBase - 4}` +
                    ` C${c.x + 7.5} ${flBase - 12} ${c.x + 6.5} ${flBase - 22} ${c.x} ${flBase - 31} Z`
                  }
                  fill="url(#flO)"
                />
                {/* Bright inner core */}
                <path
                  d={
                    `M${c.x} ${flBase - 25}` +
                    ` C${c.x - 3.8} ${flBase - 18} ${c.x - 4.2} ${flBase - 11} ${c.x - 2.8} ${flBase - 5}` +
                    ` C${c.x - 1.2} ${flBase - 1} ${c.x + 1.2} ${flBase - 1} ${c.x + 2.8} ${flBase - 5}` +
                    ` C${c.x + 4.2} ${flBase - 11} ${c.x + 3.8} ${flBase - 18} ${c.x} ${flBase - 25} Z`
                  }
                  fill="url(#flI)"
                />
              </g>
            ) : showSmoke ? (
              <path
                d={`M${c.x} ${flBase - 2} Q${c.x + 5} ${flBase - 18} ${c.x - 3} ${flBase - 33} Q${c.x - 7} ${flBase - 48} ${c.x + 4} ${flBase - 62}`}
                fill="none"
                stroke="rgba(148,148,148,0.5)"
                strokeWidth="2.8"
                strokeLinecap="round"
                style={{ animation: 'smokeFadeSvg 2s ease-out forwards' }}
              />
            ) : null}
          </g>
        )
      })}

      {/* ═══════════════ ICE CREAM SCOOPS (drawn OVER candle bodies) ══ */}
      {/* Left scoop */}
      <circle cx="107" cy="344" r="31" fill="url(#sc2)" filter="url(#scoopSh)" />
      <circle cx="107" cy="344" r="31" fill="url(#toastedCt)" opacity="0.6" />
      <ellipse cx="98"  cy="331" rx="13" ry="9" fill="rgba(255,255,255,0.52)" />
      <ellipse cx="107" cy="344" rx="31" ry="31" fill="none" stroke="rgba(200,175,130,0.25)" strokeWidth="1.5" />

      {/* Right scoop */}
      <circle cx="193" cy="344" r="31" fill="url(#sc2)" filter="url(#scoopSh)" />
      <circle cx="193" cy="344" r="31" fill="url(#toastedCt)" opacity="0.6" />
      <ellipse cx="184" cy="331" rx="13" ry="9" fill="rgba(255,255,255,0.52)" />
      <ellipse cx="193" cy="344" rx="31" ry="31" fill="none" stroke="rgba(200,175,130,0.25)" strokeWidth="1.5" />

      {/* Center scoop (largest, front) */}
      <circle cx="150" cy="331" r="38" fill="url(#sc1)" filter="url(#scoopSh)" />
      <circle cx="150" cy="331" r="38" fill="url(#toastedCt)" opacity="0.65" />
      <ellipse cx="139" cy="328" rx="15" ry="10.5" fill="rgba(255,255,255,0.58)" />
      <ellipse cx="150" cy="331" rx="38" ry="38" fill="none" stroke="rgba(200,175,130,0.2)" strokeWidth="1.5" />

    </svg>
  )
}

// ─── PAGE ────────────────────────────────────────────────────
export default function BirthdayPage() {
  const router = useRouter()
  const [blowState, setBlowState] = useState<BlowState>('idle')
  const [volumeLevel, setVolumeLevel] = useState(0)
  const [showSmoke, setShowSmoke] = useState(false)

  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef     = useRef<AnalyserNode  | null>(null)
  const streamRef       = useRef<MediaStream   | null>(null)
  const animFrameRef    = useRef<number        | null>(null)
  const blowCounterRef  = useRef(0)

  const triggerConfetti = useCallback(async () => {
    const confetti = (await import('canvas-confetti')).default
    const end = Date.now() + 3000
    const colors = ['#ff6b9d', '#ffd700', '#6bcb77', '#4d96ff']
    const frame = () => {
      confetti({ particleCount: 3, angle: 60,  spread: 55, origin: { x: 0 }, colors })
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors })
      if (Date.now() < end) requestAnimationFrame(frame)
    }
    frame()
  }, [])

  const stopMic = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    if (audioContextRef.current) audioContextRef.current.close()
    audioContextRef.current = null
    analyserRef.current     = null
    streamRef.current       = null
  }, [])

  const handleBlow = useCallback(async () => {
    stopMic()
    setBlowState('blown')
    setShowSmoke(true)
    setVolumeLevel(0)
    await triggerConfetti()
    setTimeout(() => {
      setBlowState('redirecting')
      setTimeout(() => router.push('/quiz'), 800)
    }, 2200)
  }, [stopMic, triggerConfetti, router])

  const startListening = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      streamRef.current = stream

      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      audioContextRef.current = ctx

      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      analyserRef.current = analyser

      const source = ctx.createMediaStreamSource(stream)
      source.connect(analyser)

      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      const BLOW_THRESHOLD = 50
      const BLOW_SUSTAIN   = 15

      setBlowState('listening')

      const checkVolume = () => {
        if (!analyserRef.current) return
        analyserRef.current.getByteFrequencyData(dataArray)
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length
        setVolumeLevel(Math.min(100, (avg / BLOW_THRESHOLD) * 100))

        if (avg > BLOW_THRESHOLD) {
          blowCounterRef.current++
          if (blowCounterRef.current >= BLOW_SUSTAIN) { handleBlow(); return }
        } else {
          blowCounterRef.current = Math.max(0, blowCounterRef.current - 1)
        }
        animFrameRef.current = requestAnimationFrame(checkVolume)
      }
      animFrameRef.current = requestAnimationFrame(checkVolume)
    } catch {
      alert("No s'ha pogut accedir al micròfon. Comprova els permisos del navegador.")
    }
  }, [handleBlow])

  useEffect(() => () => stopMic(), [stopMic])

  const candlesOut = blowState === 'blown' || blowState === 'redirecting'

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-5 py-10"
      style={{ background: 'linear-gradient(160deg, #fff0f8 0%, #fff8f0 40%, #f0f8ff 100%)' }}
    >
      <div className="w-full max-w-sm animate-fade-in">
        {/* Title */}
        <div className="text-center mb-4">
          <h1
            className="text-4xl font-black mb-1"
            style={{ color: 'var(--primary)', textShadow: '0 2px 10px rgba(232,121,160,0.3)', letterSpacing: '-0.5px' }}
          >
            Moltes Felicitaaaats!!!
          </h1>
          <p>(No es veu bé, però és un pastís de gelat de coco!!)</p>
          <p className="text-base" style={{ color: '#9ca3af' }}>
            {candlesOut ? '🎊 Bravo!' : '🎂 Apaga les espelmes!'}
          </p>
        </div>

        {/* Cake */}
        <Cake candlesOut={candlesOut} showSmoke={showSmoke} />

        {/* Controls */}
        <div className="mt-2 space-y-4">
          {blowState === 'idle' && (
            <button
              onClick={startListening}
              className="btn-primary pulse-glow text-lg py-5"
              style={{ borderRadius: 16 }}
            >
              🎤 Toca per començar
            </button>
          )}

          {blowState === 'listening' && (
            <div className="space-y-3 animate-fade-in">
              <p className="text-center font-bold text-lg" style={{ color: 'var(--primary)' }}>
                💨 Bufa les espelmes!
              </p>
              <div className="volume-bar-wrap">
                <div className="volume-bar-fill" style={{ width: `${volumeLevel}%` }} />
              </div>
              <p className="text-center text-sm" style={{ color: '#9ca3af' }}>Bufa fort al micròfon...</p>
            </div>
          )}

          {blowState === 'blown' && (
            <div className="text-center animate-bounce-in space-y-2">
              <p className="text-3xl">🎉🎊🎉</p>
              <p className="font-bold text-xl" style={{ color: 'var(--primary)' }}>Ho has aconseguit!</p>
              <p className="text-sm" style={{ color: '#9ca3af' }}>T&apos;esperem al quiz...</p>
            </div>
          )}

          {blowState === 'redirecting' && (
            <div className="text-center">
              <svg className="animate-spin h-6 w-6 mx-auto" fill="none" viewBox="0 0 24 24" style={{ color: 'var(--primary)' }}>
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          )}
        </div>

        {blowState === 'idle' && (
          <div className="text-center mt-6">
            <button
              onClick={() => router.push('/quiz')}
              style={{ color: '#d1d5db', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}
            >
              Saltar al quiz
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
