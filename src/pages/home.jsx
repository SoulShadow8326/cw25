import Squares from '../components/Squares';
import Shuffle from '../components/shuffle';
import './home.css';
import { useState, useEffect } from 'react';

export default function Home() {
  const [isGod, setIsGod] = useState(false);
  const [squaresColor, setSquaresColor] = useState(null);

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
  return (
    <div className="home-root">
      <Squares className="play-squares" colorA={document.cookie && document.cookie.indexOf('GodGamer=1') !== -1 ? '#d03131' : squaresColor} />
      <main className="home-content">
        <Shuffle
          text="bulC thgiF"
          shuffleDirection="right"
          duration={0.50}
          animationMode="evenodd"
          shuffleTimes={1}
          ease="power3.out"
          stagger={0.5}
          threshold={0.1}
          triggerOnce={true}
          triggerOnHover={false}
          respectReducedMotion={true}
        />
          <div className="home-actions">
            <button className="pixel-btn" onClick={() => (window.location.href = '/play')}>Enter</button>
          </div>
      </main>
    </div>
  );
}
