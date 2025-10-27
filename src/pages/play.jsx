import './play.css';
import Squares from '../components/Squares';
import bgMusic from '../assets/UNDERTALE - Dating Start!.mp3';
import { useState, useRef, useEffect } from 'react';

export default function Play() {
  const [activeChat, setActiveChat] = useState(null);
  const audioRef = useRef(null);
  useEffect(() => {
    audioRef.current = new Audio(bgMusic);
    audioRef.current.loop = true;
    const p = audioRef.current.play();
    if (p && p.catch) p.catch(() => {});
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  function ChatRoom({ name, users, desc }) {
    const open = activeChat === name;
    if (open) {
      return (
        <div className="chat-expanded">
          <div className="chat-expanded-header" onClick={() => setActiveChat(null)}>
            <div className="room-title">{name}</div>
            <div className="room-count">{users} users</div>
          </div>
          <div className="chat-messages">
            <div className="msg"><span className="who">Mod:</span> Welcome to {name}.</div>
            <div className="msg"><span className="who">User123:</span> hello!</div>
            <div className="msg"><span className="who">You:</span> test message</div>
          </div>
          <div className="chat-input-box">
            <input className="chat-input" placeholder={`Type to speak in ${name}`} />
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
      <Squares className="play-squares" />

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
