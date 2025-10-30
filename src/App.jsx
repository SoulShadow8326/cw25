import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/home'
import Play from './pages/play'
import Game from './pages/game'
import Ladder from './pages/ladder'
import Teambuilder from './pages/teambuilder'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
  <Route path="/play" element={<Play />} />
  <Route path="/game" element={<Game />} />
  <Route path="/ladder" element={<Ladder />} />
  <Route path="/teambuilder" element={<Teambuilder />} />
      </Routes>
    </BrowserRouter>
  )
}
