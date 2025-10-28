import Squares from '../components/Squares';
import { useState, useEffect } from 'react';
import './ladder.css';

function formatTime(ms) {
	const total = Math.max(0, Math.floor(ms / 1000));
	const hrs = String(Math.floor(total / 3600)).padStart(2, '0');
	const mins = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
	const secs = String(total % 60).padStart(2, '0');
	return `${hrs}:${mins}:${secs}`;
}

export default function Ladder() {
	const [players] = useState([
		{ id: 1, name: 'Vibhor', rating: 2120 },
		{ id: 2, name: 'Link', rating: 2055 },
		{ id: 3, name: 'wOw', rating: 1988 },
		{ id: 4, name: 'UwU', rating: 1942 },
		{ id: 5, name: 'tra', rating: 1890 },
		{ id: 1, name: 'Fanboi', rating: 2120 },
		{ id: 2, name: 'melike', rating: 2055 },
		{ id: 3, name: 'proc0mm4', rating: 0 },
	]);

	const [now, setNow] = useState(() => new Date());
	const [isGod, setIsGod] = useState(false);
	const [squaresColor, setSquaresColor] = useState(null);

	useEffect(() => {
		const t = setInterval(() => setNow(new Date()), 1000);
		return () => clearInterval(t);
	}, []);

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

	const nextReset = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
	const msLeft = nextReset.getTime() - now.getTime();
	const timeString = formatTime(msLeft);

	return (
		<div className="ladder-root">
			<Squares className="play-squares" colorA={document.cookie && document.cookie.indexOf('GodGamer=1') !== -1 ? '#5F0C15' : squaresColor} />

			<main className="ladder-container">
				<h2 className="ladder-title">Ladder</h2>

				<ol className="ladder-list">
					{players.map((p, i) => (
						<li key={p.id} className="ladder-item">
							<div className="rank">#{i + 1}</div>
							<div className="meta">
								<div className="name">{p.name}</div>
								<div className="rating">{p.rating}</div>
							</div>
						</li>
					))}
				</ol>
			</main>

			<aside className="ladder-side">
				<div className="timer-box">
					<div className="digital-timer">{timeString}</div>
					<div className="reset-hours">till the ladder resets</div>
				</div>
			</aside>

			<div className="ladder-footer">
				<button className="back-btn" onClick={() => window.history.back()}>Back</button>
			</div>
		</div>
	);
}

