import { useState } from 'react'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-400">AI Security Dashboard</h1>
          {isLoggedIn && (
            <button onClick={() => setIsLoggedIn(false)} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm">Sign Out</button>
          )}
        </div>
      </header>
      <main className="max-w-7xl mx-auto p-6">
        {!isLoggedIn ? <LoginPage onLogin={() => setIsLoggedIn(true)} /> : <Dashboard />}
      </main>
    </div>
  )
}

function LoginPage({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="bg-gray-800 p-8 rounded-lg border border-gray-700 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>
        <input type="email" placeholder="Email" className="w-full bg-gray-700 border border-gray-600 rounded p-3 mb-4 text-white" />
        <input type="password" placeholder="Password" className="w-full bg-gray-700 border border-gray-600 rounded p-3 mb-6 text-white" />
        <button onClick={onLogin} className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded font-semibold">Sign In</button>
      </div>
    </div>
  )
}

function Dashboard() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Security Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg border border-green-700">
          <h3 className="text-green-400 font-semibold mb-2">WAF Status</h3>
          <p className="text-3xl font-bold">Active</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg border border-blue-700">
          <h3 className="text-blue-400 font-semibold mb-2">Threats Blocked</h3>
          <p className="text-3xl font-bold">247</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg border border-yellow-700">
          <h3 className="text-yellow-400 font-semibold mb-2">API Calls</h3>
          <p className="text-3xl font-bold">1893</p>
        </div>
      </div>
    </div>
  )
}

export default App