import Squares from '../components/Squares';
import { useRef, useState } from 'react';
import battleScene from '../assets/battle.png';
import fight1 from '../assets/fight_1.png';
import fight2 from '../assets/fight_2.png';
import explodeSound from '../assets/explode.wav';
import './game.css';

export default function Game() {
  const explodeRef = useRef(new Audio(explodeSound));
  const [oppHp, setOppHp] = useState(100);
  const [log, setLog] = useState([]);

  const handleMove = (move) => {
    explodeRef.current.currentTime = 0;
    explodeRef.current.play();
    setOppHp((h) => Math.max(0, h - 25));
    setLog((l) => [...l, `Hawlucha used ${move}!`]);
  };
  return (
    <div className="game-root">
      <Squares className="game-squares" />

      <div className="game-main">
        <div className="battle-area">
          <div className="team-column">
            <div className="team">
              <button className="team-slot">Hawlucha</button>
              <button className="team-slot">Gastrodon</button>
              <button className="team-slot">Clefable</button>
              <button className="team-slot">Alomomola</button>
              <button className="team-slot">Mothim</button>
              <button className="team-slot">Bisharp</button>
            </div>
          </div>

          <div className="battle-box">
            <div className="battle-arena">
              <div className="arena-scene">
                <img src={battleScene} alt="scene" className="arena-bg" />

                <div className="hud opponent-hud">
                  <div className="poke-name">Volbeat</div>
                  <div className="hp-bar"><div className={`hp-fill ${oppHp <= 25 ? 'low' : ''}`} style={{ width: `${oppHp}%` }} /></div>
                </div>

                <div className="hud player-hud">
                  <div className="poke-name">Hawlucha</div>
                  <div className="hp-bar"><div className="hp-fill" style={{ width: '100%' }} /></div>
                </div>

                <img src={fight1} alt="opponent" className="sprite player" />
                <img src={fight2} alt="player" className="sprite opponent" />
              </div>
            </div>

            <div className="moves">
              <button className="move" onClick={() => handleMove('Stone Edge')}>Stone Edge</button>
              <button className="move" onClick={() => handleMove('High Jump Kick')}>High Jump Kick</button>
              <button className="move" onClick={() => handleMove('Acrobatics')}>Acrobatics</button>
              <button className="move" onClick={() => handleMove('Swords Dance')}>Swords Dance</button>
            </div>

            
          </div>

          <div className="game_controls" />
        </div>

        <aside className="game-sidebar">
          <div className="log-panel">
            <h4>Battle</h4>
            {log.map((entry, i) => (
              <div key={i} className="log-entry">{entry}</div>
            ))}
          </div>

          <div className="chat-panel">
            <div className="chat-messages"></div>
            <input className="chat-input" placeholder="Message" />
          </div>
        </aside>
      </div>
    </div>
  );
}
