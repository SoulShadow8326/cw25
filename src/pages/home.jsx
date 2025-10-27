import Squares from '../components/Squares';
import Shuffle from '../components/shuffle';
import './home.css';

export default function Home() {
  return (
    <div className="home-root">
      <Squares className="home-squares" />
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
