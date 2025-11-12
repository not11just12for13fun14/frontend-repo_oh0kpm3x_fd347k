import { useEffect, useRef, useState } from 'react'

export default function Breathing() {
  const [phase, setPhase] = useState('Inhale')
  const [count, setCount] = useState(4)
  const intervalRef = useRef(null)

  useEffect(() => {
    startCycle()
    return () => stopCycle()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const startCycle = () => {
    let phases = [
      { label: 'Inhale', seconds: 4 },
      { label: 'Hold', seconds: 4 },
      { label: 'Exhale', seconds: 4 },
      { label: 'Hold', seconds: 4 },
    ]

    let idx = 0
    setPhase(phases[idx].label)
    setCount(phases[idx].seconds)

    intervalRef.current = setInterval(() => {
      setCount((c) => {
        if (c > 1) return c - 1
        // move to next phase
        idx = (idx + 1) % phases.length
        setPhase(phases[idx].label)
        return phases[idx].seconds
      })
    }, 1000)
  }

  const stopCycle = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        className={`w-40 h-40 rounded-full bg-gradient-to-br from-blue-200 to-indigo-300 transition-all duration-1000 ease-in-out flex items-center justify-center shadow-inner`}
        style={{ transform: phase === 'Inhale' ? 'scale(1.15)' : phase === 'Exhale' ? 'scale(0.85)' : 'scale(1)' }}
      >
        <div className="text-3xl font-semibold text-indigo-700">{count}</div>
      </div>
      <div className="text-xl text-gray-700">{phase}</div>
      <div className="text-sm text-gray-500">Follow 4-4-4-4 box breathing</div>
    </div>
  )
}
