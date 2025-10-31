import Hyperspeed from '../components/Hyperspeed';
import { useState, useEffect } from 'react';
import useKonami from '../components/useKonami';
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
		{ id: 1, name: 'Kevin', rating: 4242 },
		{ id: 2, name: 'pr0coder', rating: 2442 },
		{ id: 3, name: 'w0lfy', rating: 1988 },
		{ id: 4, name: 'cw_fangurl', rating: 1942 },
		{ id: 5, name: 'nuxe', rating: 1890 },
		{ id: 1, name: 'wenaughty', rating: 1889 },
		{ id: 2, name: 'melike', rating: 1888 },
		{ id: 3, name: 'hypernova', rating: 0 },
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

	const nextReset = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
	const msLeft = nextReset.getTime() - now.getTime();
	const timeString = formatTime(msLeft);

	return (
		<div className="ladder-root">
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

