import { useEffect, useRef, useState } from 'react'

const sounds = [
  { key: 'Rain', url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_323b3b1080.mp3?filename=light-rain-ambient-ambient-atmosphere-ambient-sound-10467.mp3' },
  { key: 'Waves', url: 'https://cdn.pixabay.com/download/audio/2021/09/01/audio_4b6bcb29fd.mp3?filename=ocean-waves-ambient-9360.mp3' },
  { key: 'Forest', url: 'https://cdn.pixabay.com/download/audio/2021/10/14/audio_2a2a16edbb.mp3?filename=forest-lullaby-110624.mp3' },
]

export default function SoothingSounds() {
  const [current, setCurrent] = useState(null)
  const audioRef = useRef(new Audio())

  useEffect(() => {
    const a = audioRef.current
    a.loop = true
    return () => {
      a.pause()
    }
  }, [])

  const toggle = (s) => {
    const a = audioRef.current
    if (current?.key === s.key) {
      a.pause()
      setCurrent(null)
      return
    }
    a.src = s.url
    a.play()
    setCurrent(s)
  }

  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-600">Ambient sounds</div>
      <div className="flex gap-2">
        {sounds.map((s) => (
          <button
            key={s.key}
            onClick={() => toggle(s)}
            className={`px-3 py-2 rounded border transition-colors ${current?.key === s.key ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
          >
            {current?.key === s.key ? `Pause ${s.key}` : s.key}
          </button>
        ))}
      </div>
    </div>
  )
}
