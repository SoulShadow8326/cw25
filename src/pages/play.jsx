import './play.css';
import Squares from '../components/Squares';
import bgMusic from '../assets/UNDERTALE - Dating Start!.mp3';
import lavenderTrack from '../assets/Lavender Town.mp3';
import { useState, useRef, useEffect } from 'react';

export default function Play() {
  const [activeChat, setActiveChat] = useState(null);
  const [isGod, setIsGod] = useState(false);
  const [squaresColor, setSquaresColor] = useState(null);
  const audioRef = useRef(null);
  useEffect(() => {
    const src = isGod ? lavenderTrack : bgMusic;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    audioRef.current = new Audio(src);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.10;
    const p = audioRef.current.play();
    if (p && p.catch) p.catch(() => {});
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [isGod]);

  useEffect(() => {
    setIsGod(document.cookie && document.cookie.indexOf('GodGamer=1') !== -1);
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

  function ChatRoom({ name, users, desc }) {
  const open = activeChat === name;
    const storageKey = `cw25-chat-${name}`;
    const bcRef = useRef(null);
    const inputRef = useRef(null);
    const listRef = useRef(null);
    const [minimized, setMinimized] = useState(false);
    const [messages, setMessages] = useState(() => {
      try {
        const raw = localStorage.getItem(storageKey);
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        return [];
      }
    });
    const usernameRef = useRef(localStorage.getItem('cw25-username') || `User${Math.floor(Math.random() * 9000) + 1000}`);
    useEffect(() => {
      localStorage.setItem('cw25-username', usernameRef.current);
    }, []);
    useEffect(() => {
      try {
        bcRef.current = new BroadcastChannel('cw25-chat');
        bcRef.current.onmessage = (ev) => {
          const m = ev.data;
          if (m && m.room === name) {
            setMessages((s) => {
              const out = s.concat(m.msg);
              try { localStorage.setItem(storageKey, JSON.stringify(out)); } catch (e) {}
              return out;
            });
          }
        };
      } catch (e) {
        bcRef.current = null;
      }
      return () => {
        try { if (bcRef.current) bcRef.current.close(); } catch (e) {}
      };
    }, [name]);
    useEffect(() => {
      if (!open || minimized) return;
      const el = listRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    }, [open, messages, minimized]);
    function sendMessage(text) {
      const t = String(text || '').trim();
      if (!t) return;
      const msg = { id: Date.now() + '-' + Math.random().toString(36).slice(2, 8), user: usernameRef.current, text: t, ts: Date.now() };
      setMessages((s) => {
        const out = s.concat(msg);
        try { localStorage.setItem(storageKey, JSON.stringify(out)); } catch (e) {}
        return out;
      });
      try { if (bcRef.current) bcRef.current.postMessage({ room: name, msg }); } catch (e) {}
      if (inputRef.current) { inputRef.current.value = ''; inputRef.current.focus(); }
    }
    if (open) {
      if (minimized) {
        return (
          <div className="chat-minimized" onClick={() => setMinimized(false)}>
            <div className="room-title">{name}</div>
            <div className="room-count">{users} users</div>
          </div>
        );
      }
      return (
        <div className="chat-expanded">
          <div className="chat-expanded-header">
            <div className="mac-btns">
              <button className="mac-btn mac-close" onClick={() => setActiveChat(null)} />
              <button className="mac-btn mac-min" onClick={() => setMinimized(true)} />
              <button className="mac-btn mac-max" onClick={() => {}} />
            </div>
          </div>
          <div className="chat-messages" ref={listRef}>
            {messages.map((m) => (
              <div key={m.id} className="msg"><span className="who">{m.user}:</span> {m.text}</div>
            ))}
          </div>
          <div className="chat-input-box">
            <input ref={inputRef} className="chat-input" placeholder={`Type to speak in ${name}`} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); sendMessage(e.target.value); } }} />
          </div>
        </div>
      );
    }
    return (
      <div className="chat-room" onClick={() => setActiveChat(name)}>
        <div className="room-title">{name}</div>
        <div className="room-count">{users} users</div>
        <div className="room-desc">{desc}</div>
      </div>
    );
  }

  return (
    <div className="play-root">
  <Squares className="play-squares" colorA={document.cookie && document.cookie.indexOf('GodGamer=1') !== -1 ? '#5F0C15' : squaresColor} />

      <div className="play-left">
        <div className="play-panel controls">
          <label>Format:</label>
          <select>
            <option>Random Battle</option>
            <option>OU</option>
            <option>UU</option>
          </select>

          <label>Team:</label>
          <div className="team-icons">
            <button className="icon">?</button>
            <button className="icon">?</button>
            <button className="icon">?</button>
            <button className="icon">?</button>
            <button className="icon">?</button>
            <button className="icon">?</button>
          </div>

          <label className="checkbox"><input type="checkbox" /> Don't allow spectators</label>

          <button className="big-btn" onClick={() => (window.location.href = '/game')}>Battle!</button>

          <div className="links">
            <button className="soft-btn">Teambuilder</button>
            <button className="soft-btn" onClick={() => (window.location.href = '/ladder')}>Ladder</button>
            <button className="soft-btn">Tournaments</button>
          </div>
        </div>
      </div>

      <div className="play-main">
        <div className="news-panel">
          <h3>News</h3>
          <h4>Club Fan &amp; Fan Club</h4>
          <p>OMG ADITYA DAS BIG FAN SIR. VERY VERY VERY VERY VERY VERY VERY VERY VERY VERY VERY VERY BIG FAN</p>

          <h4>Gen 1 Random Battles Open</h4>
          <p>Lorem Ipsum dolor sit mamen afpiejapfjp idk atp</p>
        </div>
      </div>
      
      <div className="play-right">
        <aside className="play-panel chat-list">
          <h4>Official chat rooms</h4>
          {(() => {
            const rooms = [
              { name: 'Lobby', users: 516, desc: "Still haven't decided on a room for you? Relax here amidst the chaos." },
              { name: 'Tournaments', users: 228, desc: '24/7 room tournaments! Join and ascend the leaderboard :P' },
              { name: 'Help', users: 175, desc: "Have a question about Showdown? We'd be glad to help you out!" },
            ];
            if (isGod) {
              rooms.unshift({ name: '<-redacted->', users: 1, desc: 'Private room for the ***** ****' });
            }

            if (activeChat) {
              const r = rooms.find((x) => x.name === activeChat) || rooms[0];
              return <ChatRoom name={r.name} users={r.users} desc={r.desc} />;
            }

            return rooms.map((r) => (
              <ChatRoom key={r.name} name={r.name} users={r.users} desc={r.desc} />
            ));
          })()}
        </aside>
      </div>
    </div>
  );
}
