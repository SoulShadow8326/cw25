import Squares from '../components/Squares';
import './teambuilder.css';
import { useState, useEffect } from 'react';

export default function Teambuilder() {
  const [isGod, setIsGod] = useState(false);
  const [squaresColor, setSquaresColor] = useState(null);

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
  const baseLoadouts = [
    { id: 'striker', name: 'Striker', attrs: { hp: 80, atk: 90, def: 60 } },
    { id: 'tank', name: 'Tank', attrs: { hp: 140, atk: 55, def: 110 } },
    { id: 'speedster', name: 'Speedster', attrs: { hp: 70, atk: 65, def: 50 } },
    { id: 'balanced', name: 'Balanced', attrs: { hp: 100, atk: 80, def: 80 } },
    { id: 'techie', name: 'Techie', attrs: { hp: 85, atk: 75, def: 65 } },
    { id: 'support', name: 'Support', attrs: { hp: 95, atk: 60, def: 75 } },
  ];
  const godLoadout = { id: 'truefighter', name: 'True Fighter', attrs: { hp: 150, atk: 150, def: 150 } };
  const loadouts = isGod ? [godLoadout, ...baseLoadouts] : baseLoadouts;
  const [selected, setSelected] = useState(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem('cw25-loadout') || localStorage.getItem('cw25-team');
      if (raw) setSelected(JSON.parse(raw));
    } catch (e) {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem('cw25-loadout', JSON.stringify(selected));
    } catch (e) {}
  }, [selected]);
  function toggle(id) {
    if (selected === id) {
      setSelected(null);
      return;
    }
    setSelected(id);
  }
  function enter() {
    try {
      localStorage.setItem('cw25-loadout', JSON.stringify(selected));
    } catch (e) {}
    window.location.href = '/play';
  }
  return (
    <div className="teambuilder-root">
      <Squares className="play-squares" colorA={document.cookie && document.cookie.indexOf('GodGamer=1') !== -1 ? '#5F0C15' : squaresColor} />
      <main className="teambuilder-content">
        <div className="teambuilder-grid">
          <div className="loadouts">
            {loadouts.map((l) => (
              <div key={l.id} className={`loadout-card ${selected === l.id ? 'selected' : ''}`} onClick={() => toggle(l.id)}>
                <div className="loadout-name">{l.name}</div>
                <div className="loadout-attrs">
                  <div>HP: {l.attrs.hp}</div>
                  <div>ATK: {l.attrs.atk}</div>
                  <div>DEF: {l.attrs.def}</div>
                </div>
                <div className="loadout-toggle">{selected === l.id ? 'Selected' : 'Select'}</div>
              </div>
            ))}
          </div>
          <aside className="team-summary">
            <h3>Selected Loadout</h3>
            <div className="summary-list">
              {selected ? (() => {
                const info = loadouts.find((x) => x.id === selected);
                if (!info) return <div className="summary-item">None</div>;
                return (
                  <div key={info.id} className="summary-item">
                    <div className="s-name">{info.name}</div>
              <div className="s-attrs">HP {info.attrs.hp} • ATK {info.attrs.atk} • DEF {info.attrs.def}</div>
                  </div>
                );
              })() : <div className="summary-item">None selected</div>}
            </div>
            <div className="teambuilder-actions">
              <button className="pixel-btn" onClick={enter} disabled={!selected}>Enter</button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
