import Squares from '../components/Squares';
import { useRef, useState, useEffect } from 'react';
import battleScene from '../assets/battle.png';
import fight1 from '../assets/fight_1.png';
import fight2 from '../assets/fight_2.png';
import fight1Punch from '../assets/fight_1_punch.png';
import explodeSound from '../assets/vine-boom-sound-effect(chosic.com).mp3';
import trackGym from '../assets/bw2-kanto-gym-leader.ogg';
import trackTrainer from '../assets/bw-trainer.ogg';
import trackRival from '../assets/bw-rival.ogg';
import './game.css';

export default function Game() {
  const explodeRef = useRef(new Audio(explodeSound));
  const [oppHp, setOppHp] = useState(100);
  const [playerHp, setPlayerHp] = useState(100);
  const [playerMax, setPlayerMax] = useState(100);
  const [playerAtk, setPlayerAtk] = useState(100);
  const [playerDef, setPlayerDef] = useState(0);
  const [oppMax, setOppMax] = useState(100);
  const [log, setLog] = useState([]);
  const [opponentAction, setOpponentAction] = useState(null);
  const oppTimerRef = useRef(null);
  const oppHpRef = useRef(oppHp);
  const playerHpRef = useRef(playerHp);
  const oppVulnRef = useRef(false);
  const oppVulnTimerRef = useRef(null);
  const blockingRef = useRef(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const [flash, setFlash] = useState(false);
  const blockHitsRef = useRef(0);
  const blockBrokenRef = useRef(false);
  const [isStunned, setIsStunned] = useState(false);
  const stunTimerRef = useRef(null);
  const [playerSpriteSrc, setPlayerSpriteSrc] = useState(fight1);
  const playerSpriteTimerRef = useRef(null);
  const handleMoveRef = useRef(null);
  const joyPrevDirRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const inputLockRef = useRef(false);
  const [timer, setTimer] = useState(99);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [level, setLevel] = useState(1);
  const [exp, setExp] = useState(0);
  const [expTarget, setExpTarget] = useState(0);
  const [showExpOverlay, setShowExpOverlay] = useState(false);
  const [countdownRestart, setCountdownRestart] = useState(null);
  const expIntervalRef = useRef(null);
  const restartIntervalRef = useRef(null);
  const startExpRef = useRef(null);
  const finalTotalRef = useRef(null);
  const levelRef = useRef(level);
  const countdownRef = useRef(null);
  const [playerWins, setPlayerWins] = useState(0);
  const [oppWins, setOppWins] = useState(0);
  const playerWinsRef = useRef(playerWins);
  const oppWinsRef = useRef(oppWins);
  const musicRef = useRef(null);
  const [isGod, setIsGod] = useState(false);
  const [squaresColor, setSquaresColor] = useState(null);
  useEffect(() => {
    const tracks = [trackGym, trackTrainer, trackRival];
    const choice = tracks[Math.floor(Math.random() * tracks.length)];
    musicRef.current = new Audio(choice);
    musicRef.current.loop = true;
  musicRef.current.volume = 0.10;
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
    try {
      const id = JSON.parse(localStorage.getItem('cw25-loadout') || 'null');
      const mapping = {
        striker: { hp: 80, atk: 90, def: 60 },
        tank: { hp: 140, atk: 55, def: 110 },
        speedster: { hp: 70, atk: 65, def: 50 },
        balanced: { hp: 100, atk: 80, def: 80 },
        techie: { hp: 85, atk: 75, def: 65 },
        support: { hp: 95, atk: 60, def: 75 },
        truefighter: { hp: 150, atk: 150, def: 150 },
      };
      if (id && mapping[id]) {
        const s = mapping[id];
        setPlayerMax(s.hp || 100);
        setPlayerHp(s.hp || 100);
        setPlayerAtk(s.atk || 100);
        setPlayerDef(s.def || 0);
      } else {
        setPlayerMax(100);
        setPlayerHp(100);
        setPlayerAtk(100);
        setPlayerDef(0);
      }
    } catch (e) {
      setPlayerMax(100);
      setPlayerHp(100);
      setPlayerAtk(100);
      setPlayerDef(0);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const computed = getComputedStyle(root).getPropertyValue('--squares-colorA') || getComputedStyle(root).getPropertyValue('--colorA') || '#06193E';
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
    const targetHex = '#5F0C15';
    const root = document.documentElement;
    const computed = getComputedStyle(root).getPropertyValue('--colorA') || getComputedStyle(root).getPropertyValue('--blue') || '';
    const initialHex = computed.trim() || '#06193E';
    const initialRgb = hexToRgb(initialHex.replace(/\s+/g, ''));
  const targetRgb = hexToRgb(targetHex);
        
    function computeAndSet() {
      const now = new Date();
      const today = new Date();
        
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
      Block: 0,
    };
    if (move === 'Block') {
      if (isStunned) {
        inputLockRef.current = false;
        return;
      }
      blockHitsRef.current = 0;
      blockBrokenRef.current = false;
      blockingRef.current = true;
      setIsBlocking(true);
      setTimeout(() => {
        blockingRef.current = false;
        setIsBlocking(false);
        blockHitsRef.current = 0;
        blockBrokenRef.current = false;
      }, 300);
      inputLockRef.current = false;
      return;
    }
    if (playerSpriteTimerRef.current) clearTimeout(playerSpriteTimerRef.current);
    setPlayerSpriteSrc(fight1Punch);
    playerSpriteTimerRef.current = setTimeout(() => {
      setPlayerSpriteSrc(fight1);
      playerSpriteTimerRef.current = null;
    }, 300);
  const base = baseMap[move] ?? 25;
  const multiplier = (isGod ? 1.5 : 1) * (oppVulnRef.current ? 1.5 : 1);
  const dmg = Math.max(1, Math.round(base * (playerAtk / 100) * multiplier));
    setOppHp((h) => Math.max(0, h - dmg));
    setLog((l) => [...l, `You used ${move}!`]);
    setTimeout(() => {
      inputLockRef.current = false;
    }, 800);
  };

  useEffect(() => {
    function pickMove() {
      if (oppTimerRef.current) clearTimeout(oppTimerRef.current);
      if (oppHpRef.current <= 0 || playerHpRef.current <= 0 || gameOver) return;
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
      const actual = Math.max(1, Math.round(choice.dmg * (100 / (100 + playerDef))));
      if (blockingRef.current && !blockBrokenRef.current && !isStunned) {
        blockHitsRef.current = (blockHitsRef.current || 0) + 1;
        if (blockHitsRef.current <= 3) {
          setFlash(true);
          setTimeout(() => setFlash(false), 120);
          setLog((l) => [...l, `Blocked ${choice.name}!`]);
        } else {
          blockBrokenRef.current = true;
          blockingRef.current = false;
          setIsBlocking(false);
          setIsStunned(true);
          inputLockRef.current = true;
          setLog((l) => [...l, `Block shattered! You are stunned`]);
          if (stunTimerRef.current) clearTimeout(stunTimerRef.current);
          stunTimerRef.current = setTimeout(() => {
            setIsStunned(false);
            inputLockRef.current = false;
            blockBrokenRef.current = false;
            blockHitsRef.current = 0;
            stunTimerRef.current = null;
          }, 5000);
        }
      } else {
        setPlayerHp((p) => Math.max(0, p - actual));
        setLog((l) => [...l, `Opponent used ${choice.name}!`]);
      }
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
  }, [gameOver, level]);

  useEffect(() => {
    oppHpRef.current = oppHp;
  }, [oppHp]);

  useEffect(() => {
    playerHpRef.current = playerHp;
  }, [playerHp]);

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
    if (!gameOver) return;
    if (winner === 'player') {
      const gain = 30 + Math.floor(Math.random() * 21);
      setExpTarget(gain);
      setShowExpOverlay(true);
      startExpRef.current = exp;
      finalTotalRef.current = startExpRef.current + gain;
      if (expIntervalRef.current) clearInterval(expIntervalRef.current);
      expIntervalRef.current = setInterval(() => {
        setExp((e) => {
          const remaining = Math.max(0, finalTotalRef.current - e);
          const step = Math.max(1, Math.ceil(remaining / 8));
          const next = e + step;
          if (next >= finalTotalRef.current) {
            clearInterval(expIntervalRef.current);
            expIntervalRef.current = null;
            const total = finalTotalRef.current;
            const threshold = levelRef.current * 100;
            if (total >= threshold) {
              setLevel((lv) => {
                const nv = lv + 1;
                levelRef.current = nv;
                return nv;
              });
              setExp(total - threshold);
            } else {
              setExp(total);
            }
            setTimeout(() => {
              setShowExpOverlay(false);
              setCountdownRestart(5);
            }, 600);
            return Math.min(total, next);
          }
          return next;
        });
      }, 80);
    } else {
      setCountdownRestart(5);
    }
  }, [gameOver, winner]);

  useEffect(() => {
    if (countdownRestart == null) return;
    if (restartIntervalRef.current) clearInterval(restartIntervalRef.current);
    restartIntervalRef.current = setInterval(() => {
      setCountdownRestart((c) => {
        if (c <= 1) {
          clearInterval(restartIntervalRef.current);
          restartIntervalRef.current = null;
          setCountdownRestart(null);
          setGameOver(false);
          setWinner(null);
          setOppHp(oppMax);
          setPlayerHp(playerMax);
          setLog([]);
          setTimer(99);
          startTimeRef.current = Date.now();
          return null;
        }
        return c - 1;
      });
    }, 1000);
    return () => {
      if (restartIntervalRef.current) clearInterval(restartIntervalRef.current);
    };
  }, [countdownRestart]);

  useEffect(() => {
    levelRef.current = level;
  }, [level]);

  useEffect(() => {
    if (gameOver) return;
    if (playerHp <= 0) {
      setGameOver(true);
      setLog((l) => [...l, `You fainted! Game Over`]);
      setWinner('opponent');
      setOppWins((w) => w + 1);
    } else if (oppHp <= 0) {
      setGameOver(true);
      setGameOver(true);
      setLog((l) => [...l, `Opponent fainted! You win!`]);
      setWinner('player');
      setPlayerWins((w) => w + 1);
      const elapsed = Date.now() - startTimeRef.current;
      if (elapsed < 20000) {
        document.cookie = 'GodGamer=1; path=/; max-age=31536000';
      }
    }
  }, [playerHp, oppHp, gameOver]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('cw25-wins') || '{"player":0,"opponent":0}');
      const p = Number(stored.player) || 0;
      const o = Number(stored.opponent) || 0;
      setPlayerWins(p);
      setOppWins(o);
      playerWinsRef.current = p;
      oppWinsRef.current = o;
    } catch (e) {
      setPlayerWins(0);
      setOppWins(0);
      playerWinsRef.current = 0;
      oppWinsRef.current = 0;
    }
  }, []);

  useEffect(() => {
    playerWinsRef.current = playerWins;
    oppWinsRef.current = oppWins;
    try {
      localStorage.setItem('cw25-wins', JSON.stringify({ player: playerWins, opponent: oppWins }));
    } catch (e) {}
  }, [playerWins, oppWins]);

  useEffect(() => {
    function onKeyDown(e) {
      const active = document.activeElement && document.activeElement.tagName;
      if (active === 'INPUT' || active === 'TEXTAREA') return;
      if (e.key === 'ArrowDown') {
        if (isStunned) return;
        if (!blockingRef.current) {
          blockHitsRef.current = 0;
          blockBrokenRef.current = false;
          blockingRef.current = true;
          setIsBlocking(true);
        }
        e.preventDefault();
        return;
      }
      const map = {
        ArrowUp: 'Kick',
        ArrowRight: 'Punch',
        ArrowLeft: 'Jump',
      };
      const move = map[e.key];
      if (move) {
        e.preventDefault();
        if (handleMoveRef.current) handleMoveRef.current(move);
      }
    }
    function onKeyUp(e) {
      if (e.key === 'ArrowDown') {
        blockingRef.current = false;
        setIsBlocking(false);
        blockHitsRef.current = 0;
        blockBrokenRef.current = false;
      }
    }
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      if (playerSpriteTimerRef.current) clearTimeout(playerSpriteTimerRef.current);
    };
  }, []);

  useEffect(() => {
    handleMoveRef.current = handleMove;
  }, [handleMove]);

  useEffect(() => {
    let iv = null;
    let abort = false;
    async function poll() {
      try {
        const res = await fetch('/api/joycon/poll');
        if (!res.ok) return;
        const j = await res.json();
        if (!j || !j.available) return;
        const s = j.state || {};
        const dir = s.direction || (s.status && s.status.gyro && (s.status.gyro.y > 1000 ? 'up' : s.status.gyro.x > 1000 ? 'right' : s.status.gyro.x < -1000 ? 'left' : null));
        if (dir && dir !== joyPrevDirRef.current) {
          joyPrevDirRef.current = dir;
          const map = { up: 'Kick', right: 'Punch', left: 'Jump' };
          const mv = map[dir];
          if (mv && handleMoveRef.current) handleMoveRef.current(mv);
        }
        const aPressed = !!(s.status && s.status.buttons && s.status.buttons.right && s.status.buttons.right.a);
        if (aPressed) {
          if (!blockingRef.current && !isStunned) {
            blockHitsRef.current = 0;
            blockBrokenRef.current = false;
            blockingRef.current = true;
            setIsBlocking(true);
          }
        } else {
          if (blockingRef.current) {
            blockingRef.current = false;
            setIsBlocking(false);
            blockHitsRef.current = 0;
            blockBrokenRef.current = false;
          }
        }
      } catch (e) {}
    }
    iv = setInterval(() => { if (!document.hidden) poll(); }, 120);
    poll();
    return () => { abort = true; if (iv) clearInterval(iv); };
  }, [isStunned]);

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
    const red = hexToRgb('#5F0C15');
    const r = Math.round(green[0] + (red[0] - green[0]) * t);
    const g = Math.round(green[1] + (red[1] - green[1]) * t);
    const b = Math.round(green[2] + (red[2] - green[2]) * t);
    return rgbToHex(r, g, b);
  };
  return (
    <div className="game-root">
      <Squares className="play-squares" colorA={document.cookie && document.cookie.indexOf('GodGamer=1') !== -1 ? '#5F0C15' : squaresColor} />

      <div className="game-main">
        <div className="battle-area">
          <div className="team-column">
            <div className="team">
              <button className="team-slot">↑ ↓ → ←</button>    
              <button className="team-slot">↑ ↓ → ←</button>
              <button className="team-slot">↑ to Kick</button>
              <button className="team-slot">→ to Punch</button>
              <button className="team-slot">← to Jump</button>
              <button className="team-slot">↓ to Block</button>
            </div>
          </div>

          <div className="battle-box">
            <div className="mk-hud">
              <div className="mk-left">
                <div className="mk-wins">{String(playerWins).padStart(2, '0')} WINS</div>
                <div className="mk-bar">
                  <div className="mk-fill" style={{ width: `${Math.round((playerHp / Math.max(1, playerMax)) * 100)}%` }} />
                </div>
                <div className="mk-name">You</div>
              </div>

              <div className="mk-timer">{gameOver ? 'GAME OVER' : timer}</div>

              <div className="mk-right">
                <div className="mk-wins">{String(oppWins).padStart(2, '0')} WINS</div>
                <div className="mk-bar">
                  <div className="mk-fill" style={{ width: `${Math.round((oppHp / Math.max(1, oppMax)) * 100)}%` }} />
                </div>
                <div className="mk-name">Opponent</div>
              </div>
            </div>
            <div className="battle-arena">
              <div className="arena-scene">
                <img src={battleScene} alt="scene" className="arena-bg" />

                <div className="hud opponent-hud">
                  <div className="poke-name">Volbeat</div>
                  <div className="hp-bar"><div className={`hp-fill ${((oppHp / Math.max(1, oppMax)) * 100) <= 25 ? 'low' : ''}`} style={{ width: `${Math.round((oppHp / Math.max(1, oppMax)) * 100)}%`, background: oppVulnRef.current ? '#5F0C15' : hpColor(Math.round((oppHp / Math.max(1, oppMax)) * 100)) }} /></div>
                </div>

                <div className="hud player-hud">
                  <div className="poke-name">You</div>
                  <div className="hp-bar"><div className={`hp-fill ${((playerHp / Math.max(1, playerMax)) * 100) <= 25 ? 'low' : ''}`} style={{ width: `${Math.round((playerHp / Math.max(1, playerMax)) * 100)}%`, background: hpColor(Math.round((playerHp / Math.max(1, playerMax)) * 100)) }} /></div>
                </div>

                <img src={playerSpriteSrc} alt="opponent" className="sprite player" style={{ filter: flash ? 'brightness(2) saturate(1.2)' : undefined, transition: 'filter 0.08s' }} />
                <img src={fight2} alt="player" className="sprite opponent" />
              </div>
            </div>
          </div>

          <div className="game_controls" />
        </div>

            {showExpOverlay || countdownRestart != null ? (
              <div className="exp-overlay">
                <div className="exp-card">
                  <div className="exp-title">Level {level}</div>
                  <div>EXP</div>
                  <div className="exp-bar">
                    <div className="exp-fill" style={{ width: `${Math.round(((exp % (level * 100)) / (level * 100)) * 100)}%` }} />
                  </div>
                  <div className="exp-info"><div>EXP: {exp % (level * 100)}/{level * 100}</div><div>+{expTarget}</div></div>
                  {countdownRestart != null ? (<div className="exp-countdown">Starting in {countdownRestart}</div>) : null}
                </div>
              </div>
            ) : null}

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
