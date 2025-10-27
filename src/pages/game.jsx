import Squares from '../components/Squares';
import { useRef, useState, useEffect } from 'react';
import battleScene from '../assets/battle.png';
import fight1 from '../assets/fight_1.png';
import fight2 from '../assets/fight_2.png';
import explodeSound from '../assets/vine-boom-sound-effect(chosic.com).mp3';
import trackGym from '../assets/bw2-kanto-gym-leader.ogg';
import trackTrainer from '../assets/bw-trainer.ogg';
import trackRival from '../assets/bw-rival.ogg';
import './game.css';

export default function Game() {
  const explodeRef = useRef(new Audio(explodeSound));
  const [oppHp, setOppHp] = useState(100);
  const [playerHp, setPlayerHp] = useState(100);
  const [log, setLog] = useState([]);
  const [opponentAction, setOpponentAction] = useState(null);
  const oppTimerRef = useRef(null);
  const oppVulnRef = useRef(false);
  const oppVulnTimerRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const inputLockRef = useRef(false);
  const [timer, setTimer] = useState(99);
  const [gameOver, setGameOver] = useState(false);
  const countdownRef = useRef(null);
  const musicRef = useRef(null);
  const [isGod, setIsGod] = useState(false);
  const [squaresColor, setSquaresColor] = useState(null);
  useEffect(() => {
    const tracks = [trackGym, trackTrainer, trackRival];
    const choice = tracks[Math.floor(Math.random() * tracks.length)];
    musicRef.current = new Audio(choice);
    musicRef.current.loop = true;
  musicRef.current.volume = 0.18;
    const p = musicRef.current.play();
    if (p && p.catch) p.catch(() => {});
    return () => {
      if (musicRef.current) {
        musicRef.current.pause();
        musicRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    setIsGod(document.cookie && document.cookie.indexOf('GodGamer=1') !== -1);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const computed = getComputedStyle(root).getPropertyValue('--squares-colorA') || getComputedStyle(root).getPropertyValue('--colorA') || '#53cbd6';
    setSquaresColor(computed.trim());
  }, []);

  useEffect(() => {
    if (!isGod) return;
    const envTime = (import.meta && import.meta.env && (import.meta.env.SETTIME || import.meta.env.VITE_SETTIME)) || (typeof process !== 'undefined' && process.env && process.env.SetTime) || '20:00:00';
    function hexToRgb(h) {
      const v = String(h || '').trim();
      if (v.startsWith('rgb')) {
        const nums = v.replace(/rgba?\(|\)/g, '').split(',').map((s) => parseInt(s, 10));
        return [nums[0] || 0, nums[1] || 0, nums[2] || 0];
      }
      const clean = v.replace('#', '').split(' ')[0];
      const bigint = parseInt(clean || '53cbd6', 16);
      return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
    }
    function rgbToHex(r, g, b) {
      const clamp = (n) => Math.max(0, Math.min(255, Math.round(n)));
      return (
        '#' + [clamp(r), clamp(g), clamp(b)].map((n) => n.toString(16).padStart(2, '0')).join('')
      );
    }
    const targetHex = '#d03131';
    const root = document.documentElement;
    const computed = getComputedStyle(root).getPropertyValue('--colorA') || getComputedStyle(root).getPropertyValue('--blue') || '';
    const initialHex = computed.trim() || '#53cbd6';
    const initialRgb = hexToRgb(initialHex.replace(/\s+/g, ''));
    const targetRgb = hexToRgb(targetHex.replace(/\s+/g, ''));

    function computeAndSet() {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      function parseEnvTimeStr(s) {
        const m = String(s || '').trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?([+-]\d{2}:\d{2})?$/);
        if (!m) return null;
        return { hh: parseInt(m[1], 10), mm: parseInt(m[2], 10), ss: parseInt(m[3] || '0', 10), offset: m[4] || null };
      }
      const parsed = parseEnvTimeStr(envTime);
      let target;
      if (parsed && parsed.offset) {
        const sign = parsed.offset[0];
        const [oh, om] = parsed.offset.slice(1).split(':').map((n) => parseInt(n, 10));
        const offsetMinutes = (oh || 0) * 60 + (om || 0);
        const utcMs = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), parsed.hh, parsed.mm, parsed.ss);
        const offsetSign = sign === '+' ? 1 : -1;
        const targetUtcMs = utcMs - offsetSign * offsetMinutes * 60 * 1000;
        target = new Date(targetUtcMs);
      } else if (parsed) {
        target = new Date(today.getFullYear(), today.getMonth(), today.getDate(), parsed.hh, parsed.mm, parsed.ss);
      } else {
        target = new Date(today.getTime());
        target.setHours(1, 0, 0, 0);
      }
      if (now >= target) {
        root.style.setProperty('--squares-colorA', targetHex);
        root.style.setProperty('--colorA', targetHex);
        setSquaresColor(targetHex);
        return;
      }
      const total = target.getTime() - today.getTime();
      const elapsed = now.getTime() - today.getTime();
      const t = Math.max(0, Math.min(1, elapsed / total));
      const r = Math.round(initialRgb[0] + (targetRgb[0] - initialRgb[0]) * t);
      const g = Math.round(initialRgb[1] + (targetRgb[1] - initialRgb[1]) * t);
      const b = Math.round(initialRgb[2] + (targetRgb[2] - initialRgb[2]) * t);
      const out = rgbToHex(r, g, b);
      root.style.setProperty('--squares-colorA', out);
      root.style.setProperty('--colorA', out);
      setSquaresColor(out);
    }

    computeAndSet();
    const iv = setInterval(computeAndSet, 1000);
    return () => clearInterval(iv);
  }, [isGod]);

  const handleMove = (move) => {
    if (gameOver) return;
    if (inputLockRef.current) return;
    inputLockRef.current = true;
    explodeRef.current.currentTime = 0;
    explodeRef.current.play();
    const baseMap = {
      Kick: 20,
      Punch: 15,
      Jump: 10,
      Roll: 12,
    };
  const base = baseMap[move] ?? 25;
  const multiplier = (isGod ? 1.5 : 1) * (oppVulnRef.current ? 1.5 : 1);
  const dmg = Math.max(1, Math.round(base * multiplier));
    setOppHp((h) => Math.max(0, h - dmg));
    setLog((l) => [...l, `You used ${move}!`]);
    setTimeout(() => {
      inputLockRef.current = false;
    }, 800);
  };

  useEffect(() => {
    function pickMove() {
      if (oppTimerRef.current) clearTimeout(oppTimerRef.current);
      if (oppHp <= 0 || playerHp <= 0 || gameOver) return;
      const moves = [
        { name: 'Kick', dmg: 20 },
        { name: 'Punch', dmg: 15 },
        { name: 'Jump', dmg: 10 },
        { name: 'Roll', dmg: 12 },
      ];
      const choice = moves[Math.floor(Math.random() * moves.length)];
      setOpponentAction(choice.name);
      explodeRef.current.currentTime = 0;
      explodeRef.current.play();
      setPlayerHp((p) => Math.max(0, p - choice.dmg));
      setLog((l) => [...l, `Opponent used ${choice.name}!`]);
      if (oppVulnTimerRef.current) clearTimeout(oppVulnTimerRef.current);
      oppVulnRef.current = true;
      oppVulnTimerRef.current = setTimeout(() => {
        oppVulnRef.current = false;
        oppVulnTimerRef.current = null;
      }, 2000);
      const clearDelay = setTimeout(() => setOpponentAction(null), 600);
      oppTimerRef.current = setTimeout(pickMove, 800 + Math.random() * 1200);
      return () => clearTimeout(clearDelay);
    }
    if (!gameOver) oppTimerRef.current = setTimeout(pickMove, 1200 + Math.random() * 800);
    return () => {
      if (oppTimerRef.current) clearTimeout(oppTimerRef.current);
      oppTimerRef.current = null;
      if (oppVulnTimerRef.current) {
        clearTimeout(oppVulnTimerRef.current);
        oppVulnTimerRef.current = null;
      }
      oppVulnRef.current = false;
    };
  }, [oppHp, playerHp]);

  useEffect(() => {
    if (gameOver) {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
      if (oppTimerRef.current) {
        clearTimeout(oppTimerRef.current);
        oppTimerRef.current = null;
      }
      if (oppVulnTimerRef.current) {
        clearTimeout(oppVulnTimerRef.current);
        oppVulnTimerRef.current = null;
      }
      oppVulnRef.current = false;
      return;
    }
    countdownRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
          setGameOver(true);
          setLog((l) => [...l, `Time's up! Game Over`]);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      countdownRef.current = null;
    };
  }, [gameOver]);

  useEffect(() => {
    if (gameOver) return;
    if (playerHp <= 0) {
      setGameOver(true);
      setLog((l) => [...l, `You fainted! Game Over`]);
    } else if (oppHp <= 0) {
      setGameOver(true);
      setLog((l) => [...l, `Opponent fainted! You win!`]);
      const elapsed = Date.now() - startTimeRef.current;
      if (elapsed < 20000) {
        document.cookie = 'GodGamer=1; path=/; max-age=31536000';
      }
    }
  }, [playerHp, oppHp, gameOver]);

  useEffect(() => {
    function onKey(e) {
      const active = document.activeElement && document.activeElement.tagName;
      if (active === 'INPUT' || active === 'TEXTAREA') return;
      const map = {
        ArrowUp: 'Kick',
        ArrowRight: 'Punch',
        ArrowLeft: 'Jump',
        ArrowDown: 'Roll',
      };
      const move = map[e.key];
      if (move) {
        e.preventDefault();
        handleMove(move);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleMove]);

  const hexToRgb = (h) => {
    const v = String(h || '').trim();
    if (v.startsWith('rgb')) {
      const nums = v.replace(/rgba?\(|\)/g, '').split(',').map((s) => parseInt(s, 10));
      return [nums[0] || 0, nums[1] || 0, nums[2] || 0];
    }
    const clean = v.replace('#', '').split(' ')[0];
    const bigint = parseInt(clean || '10B981', 16);
    return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
  };

  const rgbToHex = (r, g, b) => {
    const clamp = (n) => Math.max(0, Math.min(255, Math.round(n)));
    return (
      '#' + [clamp(r), clamp(g), clamp(b)].map((n) => n.toString(16).padStart(2, '0')).join('')
    );
  };

  const hpColor = (hp) => {
    const t = Math.max(0, Math.min(1, 1 - hp / 100));
    const green = hexToRgb('#10B981');
    const red = hexToRgb('#d03131');
    const r = Math.round(green[0] + (red[0] - green[0]) * t);
    const g = Math.round(green[1] + (red[1] - green[1]) * t);
    const b = Math.round(green[2] + (red[2] - green[2]) * t);
    return rgbToHex(r, g, b);
  };
  return (
    <div className="game-root">
      <Squares className="play-squares" colorA={document.cookie && document.cookie.indexOf('GodGamer=1') !== -1 ? '#d03131' : squaresColor} />

      <div className="game-main">
        <div className="battle-area">
          <div className="team-column">
            <div className="team">
              <button className="team-slot">↑ ↓ → ←</button>    
              <button className="team-slot">↑ ↓ → ←</button>
              <button className="team-slot">↑ to Kick</button>
              <button className="team-slot">→ to Punch</button>
              <button className="team-slot">← to Jump</button>
              <button className="team-slot">↓ to Roll</button>
            </div>
          </div>

          <div className="battle-box">
            <div className="mk-hud">
              <div className="mk-left">
                <div className="mk-wins">00 WINS</div>
                <div className="mk-bar">
                  <div className="mk-fill" style={{ width: `${playerHp}%` }} />
                </div>
                <div className="mk-name">You</div>
              </div>

              <div className="mk-timer">{gameOver ? 'GAME OVER' : timer}</div>

              <div className="mk-right">
                <div className="mk-wins">00 WINS</div>
                <div className="mk-bar">
                  <div className="mk-fill" style={{ width: `${oppHp}%` }} />
                </div>
                <div className="mk-name">Opponent</div>
              </div>
            </div>
            <div className="battle-arena">
              <div className="arena-scene">
                <img src={battleScene} alt="scene" className="arena-bg" />

                <div className="hud opponent-hud">
                  <div className="poke-name">Volbeat</div>
                  <div className="hp-bar"><div className={`hp-fill ${oppHp <= 25 ? 'low' : ''}`} style={{ width: `${oppHp}%`, background: oppVulnRef.current ? '#d03131' : hpColor(oppHp) }} /></div>
                </div>

                <div className="hud player-hud">
                  <div className="poke-name">You</div>
                  <div className="hp-bar"><div className={`hp-fill ${playerHp <= 25 ? 'low' : ''}`} style={{ width: `${playerHp}%`, background: hpColor(playerHp) }} /></div>
                </div>

                <img src={fight1} alt="opponent" className="sprite player" />
                <img src={fight2} alt="player" className="sprite opponent" />
              </div>
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
            <input className="chat-input" placeholder="Message" />
          </div>
        </aside>
        <div className="ladder-footer">
				<button className="back-btn" onClick={() => window.history.back()}>Back</button>
			</div>
      </div>
    </div>
    
  );
}
