import './play.css';
import Squares from '../components/Squares';

export default function Play() {
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
          <div className="chat-room">
            <div className="room-title">Lobby</div>
            <div className="room-count">516 users</div>
            <div className="room-desc">Still haven't decided on a room for you? Relax here amidst the chaos.</div>
          </div>

          <div className="chat-room">
            <div className="room-title">Tournaments</div>
            <div className="room-count">228 users</div>
            <div className="room-desc">24/7 room tournaments! Join and ascend the leaderboard :P</div>
          </div>

          <div className="chat-room">
            <div className="room-title">Help</div>
            <div className="room-count">175 users</div>
            <div className="room-desc">Have a question about Showdown? We'd be glad to help you out!</div>
          </div>
        </aside>
      </div>
    </div>
  );
}
