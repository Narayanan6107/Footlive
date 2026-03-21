import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import News from './pages/News'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Profile from './pages/Profile'
import Standings from './pages/Standings'
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
      </Routes>
    </Router>
  )
}

export default App
