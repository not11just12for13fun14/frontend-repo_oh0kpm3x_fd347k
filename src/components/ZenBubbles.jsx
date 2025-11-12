import { useEffect, useMemo, useRef, useState } from 'react'

function random(min, max) {
  return Math.random() * (max - min) + min
}

export default function ZenBubbles() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const [score, setScore] = useState(0)
  const [bubbles, setBubbles] = useState([])
  const [best, setBest] = useState(() => Number(localStorage.getItem('zen_best') || 0))

  const spawnRef = useRef(null)
  const timerRef = useRef(null)
  const idRef = useRef(0)

  const start = () => {
    setScore(0)
    setTimeLeft(30)
    setBubbles([])
    setIsPlaying(true)
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

  // Spawn bubbles while playing
  useEffect(() => {
    if (!isPlaying) return
    spawnRef.current && clearInterval(spawnRef.current)
    spawnRef.current = setInterval(() => {
      const id = idRef.current++
      const size = random(40, 100)
      const duration = random(4, 9) // seconds to float up
      const x = random(0, 100) // vw percent for left position
      const hue = Math.floor(random(180, 260)) // calming blue/purple
      setBubbles((prev) => [
        ...prev,
        { id, x, size, duration, hue }
      ])
    }, 400)
    return () => spawnRef.current && clearInterval(spawnRef.current)
  }, [isPlaying])

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

  const pop = (id) => {
    setScore((s) => s + 1)
    setBubbles((prev) => prev.map((b) => (b.id === id ? { ...b, popped: true, _expires: Date.now() + 250 } : b)))
  }

  // Gentle background motion values
  const gradientStyle = useMemo(() => ({
    background: 'radial-gradient(1200px 600px at 20% 20%, rgba(99, 102, 241, 0.20), transparent), radial-gradient(1000px 500px at 80% 70%, rgba(56, 189, 248, 0.18), transparent), linear-gradient(135deg, #faf5ff 0%, #eff6ff 100%)'
  }), [])

  return (
    <div className="relative w-full max-w-4xl h-[70vh] sm:h-[75vh] md:h-[80vh] overflow-hidden rounded-3xl shadow-2xl border border-white/40 backdrop-blur-sm bg-white/60" style={gradientStyle}>
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-3 w-3 rounded-full bg-emerald-400 animate-pulse"/>
          <span className="text-sm sm:text-base text-slate-700">Time: <span className="font-semibold">{timeLeft}s</span></span>
        </div>
        <div className="text-slate-700 text-sm sm:text-base">Score: <span className="font-bold">{score}</span></div>
        <div className="text-slate-600 text-xs sm:text-sm">Best: <span className="font-semibold">{best}</span></div>
      </div>

      {/* Call to action when not playing */}
      {!isPlaying && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="text-center p-6 bg-white/60 backdrop-blur-md rounded-2xl border border-white/50 shadow-lg">
            <h2 className="text-2xl sm:text-3xl font-semibold text-slate-800 mb-2">Zen Bubbles</h2>
            <p className="text-slate-600 mb-4 max-w-sm">Tap the floating bubbles to pop them. Short, soothing 30-second rounds to reset your mind.</p>
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
          return (
            <button
              key={b.id}
              onClick={() => pop(b.id)}
              className={`absolute bottom-[-120px] -translate-x-1/2 rounded-full bg-gradient-to-br from-cyan-300/60 to-indigo-300/60 border border-white/50 shadow-lg shadow-indigo-200/40 backdrop-blur hover:scale-110 transition-transform focus:outline-none ${b.popped ? 'scale-0 opacity-0 transition-all duration-200' : ''}`}
              style={style}
            >
              <span className="absolute inset-0 rounded-full bg-white/20" />
              <span className="absolute top-1/4 left-1/4 h-1/3 w-1/3 rounded-full bg-white/40 blur-md" />
            </button>
          )
        })}
      </div>

      {/* Decorative floating particles */}
      <DecorativeMist />

      <style>{`
        /* Float up animation */
        @keyframes floatUp {
          0% { transform: translate(-50%, 40vh) scale(1); opacity: 0.85; }
          100% { transform: translate(-50%, -100vh) scale(1.1); opacity: 0.9; }
        }
        .absolute[style*='animation-duration'] {
          animation-name: floatUp;
          animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
          animation-iteration-count: 1;
          animation-fill-mode: forwards;
        }
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
