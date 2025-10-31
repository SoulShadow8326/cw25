import Hyperspeed from '../components/Hyperspeed';
import './teambuilder.css';
import { useState, useEffect } from 'react';
import useKonami from '../components/useKonami';

export default function Teambuilder() {
  const [isGod, setIsGod] = useState(false);
  const [squaresColor, setSquaresColor] = useState(null);

  useEffect(() => {
    setIsGod(document.cookie && document.cookie.indexOf('GodGamer=1') !== -1);
  }, []);

  useKonami(() => {
    const has = document.cookie && document.cookie.indexOf('GodGamer=1') !== -1;
    if (has) {
      document.cookie = 'GodGamer=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
      setIsGod(false);
    } else {
      document.cookie = 'GodGamer=1; path=/; max-age=31536000';
      setIsGod(true);
    }
  }, { cooldownMs: 10000 });

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
      <div className="play-squares">
        <Hyperspeed
          effectOptions={{
            onSpeedUp: () => { },
            onSlowDown: () => { },
            distortion: 'turbulentDistortion',
            length: 400,
            roadWidth: 10,
            islandWidth: 2,
            lanesPerRoad: 4,
            fov: 90,
            fovSpeedUp: 150,
            speedUp: 2,
            carLightsFade: 0.4,
            totalSideLightSticks: 20,
            lightPairsPerRoadWay: 40,
            shoulderLinesWidthPercentage: 0.05,
            brokenLinesWidthPercentage: 0.1,
            brokenLinesLengthPercentage: 0.5,
            lightStickWidth: [0.12, 0.5],
            lightStickHeight: [1.3, 1.7],
            movingAwaySpeed: [60, 80],
            movingCloserSpeed: [-120, -160],
            carLightsLength: [400 * 0.03, 400 * 0.2],
            carLightsRadius: [0.05, 0.14],
            carWidthPercentage: [0.3, 0.5],
            carShiftX: [-0.8, 0.8],
            carFloorSeparation: [0, 5],
            colors: isGod ? {
              roadColor: 0x5F0C15,
              islandColor: 0x290609,
              background: 0x0A0304,
              shoulderLines: 0xC74B4B,
              brokenLines: 0xFF6B6B,
              leftCars: [0xFF4D4D, 0xC1272D, 0x8B0000],
              rightCars: [0xFF7070, 0xD13C3C, 0xA40000],
              sticks: 0xFF2E2E,
            } : {
              roadColor: 0x080808,
              islandColor: 0x0a0a0a,
              background: 0x000000,
              shoulderLines: 0x67C0D2,
              brokenLines: 0x67C0D2,
              leftCars: [0x692CB7, 0x324555],
              rightCars: [0x67C0D2, 0x03B3C3],
              sticks: 0x67C0D2,
            }
          }}
        />
      </div>
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
