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

          <button className="big-btn">Battle!</button>

          <div className="links">
            <button className="soft-btn">Teambuilder</button>
            <button className="soft-btn">Ladder</button>
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
        <button className="join-btn">Join chat</button>
      </div>
    </div>
  );
}
