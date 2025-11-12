import ZenBubbles from './components/ZenBubbles'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-sky-50 to-violet-50 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl">
        <header className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">Take a Breath</h1>
          <p className="text-slate-600 mt-2">A tiny tap-to-pop game to ease your mind for 30 seconds.</p>
        </header>
        <ZenBubbles />
        <div className="mt-6 text-center text-slate-500">
          <a href="/test" className="underline hover:text-slate-700">Backend & Database test page</a>
        </div>
      </div>
    </div>
  )
}

export default App
