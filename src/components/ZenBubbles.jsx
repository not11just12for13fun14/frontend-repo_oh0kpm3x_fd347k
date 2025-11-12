import { useEffect, useMemo, useRef, useState } from 'react'

function random(min, max) {
  return Math.random() * (max - min) + min
}

export default function ZenBubbles() {
  const ROUND_SECONDS = 30
  const COMBO_WINDOW = 800 // ms between pops to advance combo
  const COMBO_RESET = 1200 // ms of inactivity to reset combo

  const [isPlaying, setIsPlaying] = useState(false)
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS)
  const [score, setScore] = useState(0)
  const [bubbles, setBubbles] = useState([])
  const [best, setBest] = useState(() => Number(localStorage.getItem('zen_best') || 0))

  const [streak, setStreak] = useState(0)
  const [combo, setCombo] = useState(1)
  const lastPopRef = useRef(0)

  const spawnRef = useRef(null)
  const timerRef = useRef(null)
  const idRef = useRef(0)

  // dynamic spawn rate (ramps difficulty): from 550ms down to 250ms
  const spawnInterval = useMemo(() => {
    const progress = 1 - timeLeft / ROUND_SECONDS // 0 → 1
    const max = 550
    const min = 260
    return Math.max(min, max - progress * 300)
  }, [timeLeft])

  const start = () => {
    setScore(0)
    setTimeLeft(ROUND_SECONDS)
    setBubbles([])
    setIsPlaying(true)
    setStreak(0)
    setCombo(1)
    lastPopRef.current = 0
  }

  const stop = () => {
    setIsPlaying(false)
  }

  // Manage timer
  useEffect(() => {
    if (!isPlaying) return
    timerRef.current && clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          stop()
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => timerRef.current && clearInterval(timerRef.current)
  }, [isPlaying])

  // Spawn bubbles while playing (with ramping interval)
  useEffect(() => {
    if (!isPlaying) return
    spawnRef.current && clearInterval(spawnRef.current)
    spawnRef.current = setInterval(() => {
      const id = idRef.current++
      const size = random(36, 110)
      const duration = random(4, 9) // seconds to float up
      const x = random(5, 95) // vw percent for left position
      const hue = Math.floor(random(180, 260)) // calming blue/purple

      // Rare power-ups
      const roll = Math.random()
      let type = 'normal'
      if (roll > 0.92) type = 'gold' // ~8%
      else if (roll < 0.06) type = 'time' // ~6%

      setBubbles((prev) => [
        ...prev,
        { id, x, size, duration, hue, type, createdAt: Date.now() }
      ])
    }, spawnInterval)
    return () => spawnRef.current && clearInterval(spawnRef.current)
  }, [isPlaying, spawnInterval])

  // Cleanup bubbles that finish floating
  useEffect(() => {
    if (!isPlaying) return
    const cleaner = setInterval(() => {
      const now = Date.now()
      setBubbles((prev) => prev.filter((b) => !b._expires || b._expires > now))
    }, 1000)
    return () => clearInterval(cleaner)
  }, [isPlaying])

  // Update best score when game ends
  useEffect(() => {
    if (!isPlaying && score > 0) {
      if (score > best) {
        setBest(score)
        localStorage.setItem('zen_best', String(score))
      }
    }
  }, [isPlaying])

  // Combo decay if no pops within COMBO_RESET
  useEffect(() => {
    if (!isPlaying) return
    if (!lastPopRef.current) return
    const to = setTimeout(() => {
      setStreak(0)
      setCombo(1)
    }, COMBO_RESET)
    return () => clearTimeout(to)
  }, [isPlaying, score])

  const computePoints = (bubble) => {
    // smaller bubbles are worth more
    const base = bubble.size < 55 ? 3 : bubble.size < 80 ? 2 : 1
    let bonus = 0
    if (bubble.type === 'gold') bonus += 5
    if (bubble.type === 'time') bonus += 0 // time power-up gives time, not points
    return (base + bonus) * combo
  }

  const pop = (id) => {
    setBubbles((prev) => prev.map((b) => (b.id === id ? { ...b, popped: true, _expires: Date.now() + 250 } : b)))

    const b = bubbles.find((x) => x.id === id)
    if (!b) return

    const now = Date.now()
    const delta = now - (lastPopRef.current || 0)

    // advance combo if within window
    if (lastPopRef.current && delta <= COMBO_WINDOW) {
      setStreak((s) => s + 1)
      setCombo((c) => Math.min(5, 1 + Math.floor((streak + 1) / 3)))
    } else {
      setStreak(1)
      setCombo(1)
    }
    lastPopRef.current = now

    const points = computePoints(b)
    setScore((s) => s + points)

    // Power-up effects
    if (b.type === 'time') {
      setTimeLeft((t) => Math.min(ROUND_SECONDS, t + 2))
    }
  }

  // Gentle background motion values
  const gradientStyle = useMemo(() => ({
    background: 'radial-gradient(1200px 600px at 20% 20%, rgba(99, 102, 241, 0.20), transparent), radial-gradient(1000px 500px at 80% 70%, rgba(56, 189, 248, 0.18), transparent), linear-gradient(135deg, #faf5ff 0%, #eff6ff 100%)'
  }), [])

  return (
    <div className="relative w-full max-w-4xl h-[70vh] sm:h-[75vh] md:h-[80vh] overflow-hidden rounded-3xl shadow-2xl border border-white/40 backdrop-blur-sm bg-white/60" style={gradientStyle}>
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 grid grid-cols-3 items-center p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-3 w-3 rounded-full bg-emerald-400 animate-pulse"/>
          <span className="text-sm sm:text-base text-slate-700">Time: <span className="font-semibold">{timeLeft}s</span></span>
        </div>
        <div className="text-center text-slate-700 text-sm sm:text-base">Score: <span className="font-bold">{score}</span></div>
        <div className="flex items-center justify-end gap-3 text-slate-600 text-xs sm:text-sm">
          {combo > 1 && (
            <span className="px-2 py-1 rounded-full bg-amber-100/70 text-amber-700 border border-amber-300/60 shadow-sm animate-[pop_200ms_ease-out]">x{combo}</span>
          )}
          <span>Best: <span className="font-semibold">{best}</span></span>
        </div>
      </div>

      {/* Call to action when not playing */}
      {!isPlaying && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="text-center p-6 bg-white/60 backdrop-blur-md rounded-2xl border border-white/50 shadow-lg">
            <h2 className="text-2xl sm:text-3xl font-semibold text-slate-800 mb-2">Zen Bubbles</h2>
            <p className="text-slate-600 mb-4 max-w-sm">Pop bubbles for points. Smaller bubbles pay more. Chain quick pops to build a combo. Catch gold for bonus, teal for +2s.</p>
            <button onClick={start} className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-medium shadow transition-colors">Start</button>
          </div>
        </div>
      )}

      {/* Bubble field */}
      <div className="absolute inset-0">
        {bubbles.map((b) => {
          const style = {
            left: `${b.x}%`,
            width: `${b.size}px`,
            height: `${b.size}px`,
            filter: `hue-rotate(${b.hue}deg)`,
            animationDuration: `${b.duration}s`,
          }
          const colorClass = b.type === 'gold'
            ? 'from-amber-300/70 to-yellow-300/70 border-amber-200/70 shadow-amber-200/50'
            : b.type === 'time'
            ? 'from-cyan-300/70 to-teal-300/70 border-teal-200/70 shadow-teal-200/50'
            : 'from-cyan-300/60 to-indigo-300/60 border-white/50 shadow-indigo-200/40'
          return (
            <button
              key={b.id}
              onClick={() => pop(b.id)}
              className={`absolute bottom-[-120px] -translate-x-1/2 rounded-full bg-gradient-to-br ${colorClass} border shadow-lg backdrop-blur hover:scale-110 transition-transform focus:outline-none ${b.popped ? 'scale-0 opacity-0 transition-all duration-200' : ''}`}
              style={style}
              aria-label={b.type === 'gold' ? 'Bonus bubble' : b.type === 'time' ? 'Time bubble' : 'Bubble'}
            >
              <span className="absolute inset-0 rounded-full bg-white/20" />
              <span className="absolute top-1/4 left-1/4 h-1/3 w-1/3 rounded-full bg-white/40 blur-md" />
              {b.type !== 'normal' && (
                <span className="absolute -top-2 -right-2 text-[10px] px-2 py-0.5 rounded-full bg-black/20 text-white/90 backdrop-blur-sm border border-white/30">
                  {b.type === 'gold' ? '+5' : '+2s'}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Decorative floating particles */}
      <DecorativeMist />

      {/* End screen overlay */}
      {!isPlaying && timeLeft === 0 && (
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="text-center p-6 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 shadow-xl">
            <div className="text-slate-500 text-sm mb-1">Round complete</div>
            <div className="text-3xl font-bold text-slate-800">{score}</div>
            <div className="text-slate-600 mt-1 mb-4">Best: {Math.max(best, score)}</div>
            <button onClick={start} className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-medium shadow transition-colors">Play again</button>
          </div>
        </div>
      )}

      <style>{`
        /* Float up animation */
        @keyframes floatUp {
          0% { transform: translate(-50%, 40vh) scale(1); opacity: 0.9; }
          100% { transform: translate(-50%, -100vh) scale(1.1); opacity: 0.95; }
        }
        .absolute[style*='animation-duration'] {
          animation-name: floatUp;
          animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
          animation-iteration-count: 1;
          animation-fill-mode: forwards;
        }
        @keyframes pop { from { transform: scale(0.9); } to { transform: scale(1); } }
      `}</style>
    </div>
  )
}

function DecorativeMist() {
  const dots = Array.from({ length: 18 }).map((_, i) => ({
    id: i,
    size: random(6, 14),
    x: random(0, 100),
    y: random(0, 100),
    delay: random(0, 6),
    duration: random(6, 12),
    opacity: random(0.2, 0.5)
  }))
  return (
    <div className="absolute inset-0 pointer-events-none">
      {dots.map((d) => (
        <span
          key={d.id}
          className="absolute rounded-full bg-gradient-to-br from-indigo-200/60 to-cyan-200/60"
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: `${d.size}px`,
            height: `${d.size}px`,
            opacity: d.opacity,
            animation: `drift ${d.duration}s ease-in-out ${d.delay}s infinite alternate`
          }}
        />
      ))}
      <style>{`
        @keyframes drift {
          0% { transform: translateY(0px); filter: blur(0px); }
          100% { transform: translateY(-12px); filter: blur(1px); }
        }
      `}</style>
    </div>
  )
}
