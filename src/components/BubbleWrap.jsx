import { useMemo, useState } from 'react'

const getRandom = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

export default function BubbleWrap() {
  const [rows] = useState(10)
  const [cols] = useState(12)
  const [popped, setPopped] = useState(() => new Set())
  const [pops, setPops] = useState(0)

  const cells = useMemo(() => Array.from({ length: rows * cols }, (_, i) => i), [rows, cols])

  const pop = (i) => {
    if (popped.has(i)) return
    const newSet = new Set(popped)
    newSet.add(i)
    setPopped(newSet)
    setPops((p) => p + 1)
  }

  const reset = () => {
    setPopped(new Set())
    setPops(0)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">Popped: {pops} / {rows * cols}</div>
        <button onClick={reset} className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded">Reset</button>
      </div>

      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {cells.map((i) => {
          const isPopped = popped.has(i)
          const delay = getRandom(0, 30)
          return (
            <button
              key={i}
              onClick={() => pop(i)}
              className={`relative aspect-square rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 active:scale-95 ${isPopped ? 'bg-gray-200' : 'bg-blue-200 hover:bg-blue-300'} shadow-inner`}
              style={{
                boxShadow: isPopped
                  ? 'inset 4px 4px 8px rgba(0,0,0,0.15)'
                  : 'inset -6px -6px 12px rgba(255,255,255,0.7), inset 6px 6px 12px rgba(0,0,0,0.15)',
                transitionDelay: `${delay}ms`
              }}
              aria-label={isPopped ? 'Popped' : 'Pop bubble'}
            >
              <span
                className={`absolute inset-0 rounded-full ${isPopped ? 'opacity-0' : 'opacity-100'} transition-opacity`}
              />
            </button>
          )
        })}
      </div>

      <p className="text-xs text-gray-500 text-center">Tap the bubbles. Gentle haptic-like visual feedback helps release tension.</p>
    </div>
  )
}
