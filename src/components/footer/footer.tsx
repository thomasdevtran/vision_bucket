import { Link } from 'react-router-dom';
import VisionBucket from '../../assets/VisionBucket.png';
import '../../styles/footer.css';
export default function Footer() {
  return <footer className="footer"><div className="footer-content">
    <div className="footer-logo"><img src={VisionBucket} alt="Vision Bucket" /><p>Track what you watch, rate what matters, and talk about it with other movie fans.</p></div>
    <nav className="footer-links" aria-label="Footer"><Link to="/about">About the project</Link><Link to="/">Discover films</Link><Link to="/discussion">Discussions</Link></nav>
  </div><div className="footer-bottom"><p>© {new Date().getFullYear()} Vision Bucket · Film tracking & community</p></div></footer>;
}
