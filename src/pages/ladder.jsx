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
		{ id: 1, name: 'Fangurl', rating: 2120 },
		{ id: 2, name: 'Link', rating: 2055 },
		{ id: 3, name: 'wOw', rating: 1988 },
		{ id: 4, name: 'UwU', rating: 1942 },
		{ id: 5, name: 'tra', rating: 1890 },
		{ id: 1, name: 'Fanboi', rating: 2120 },
		{ id: 2, name: 'melike', rating: 2055 },
		{ id: 3, name: 'lotto', rating: 1988 },
	]);

	const [now, setNow] = useState(() => new Date());

	useEffect(() => {
		const t = setInterval(() => setNow(new Date()), 1000);
		return () => clearInterval(t);
	}, []);

	const nextReset = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
	const msLeft = nextReset.getTime() - now.getTime();
	const timeString = formatTime(msLeft);

	return (
		<div className="ladder-root">
			<Squares className="ladder-squares" />

			<main className="ladder-container">
				<h2 className="ladder-title">Leaderboard</h2>

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

