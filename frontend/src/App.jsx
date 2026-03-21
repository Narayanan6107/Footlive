import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import News from './pages/News'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Profile from './pages/Profile'
import Standings from './pages/Standings'
import Tools from './pages/Tools'
import Lineup from './pages/Lineup'
import Simulator from './pages/Simulator'
import TacticalBoard from './pages/TacticalBoard'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/news" element={<News />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/standings" element={<Standings />} />
        <Route path="/tools" element={<Tools />} />
        <Route path="/tools/lineup" element={<Lineup />} />
        <Route path="/tools/simulator" element={<Simulator />} />
        <Route path="/tools/tboard" element={<TacticalBoard />} />
      </Routes>
    </Router>
  )
}

export default App
