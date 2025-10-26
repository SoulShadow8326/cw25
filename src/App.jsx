import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/home'
import Play from './pages/play'
import Game from './pages/game'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
  <Route path="/play" element={<Play />} />
  <Route path="/game" element={<Game />} />
      </Routes>
    </BrowserRouter>
  )
}
