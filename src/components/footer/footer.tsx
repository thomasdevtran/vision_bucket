import React from 'react';
import { Link } from 'react-router-dom';
import VisionBucket from '../../assets/VisionBucket.png';
import Facebook from '../../assets/facebook.png';
import Instagram from '../../assets/instagram.png';
import '../../styles/footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-logo">
          <img src={VisionBucket} alt="Vision Bucket" />
          <p>Track what you watch, rate what matters, and talk about it with other movie fans.</p>
        </div>

        <div className="footer-links">
          <Link to="/">Home</Link>
          <Link to="/discussion">Discussions</Link>
          <Link to="/reviews">Reviews</Link>
          <Link to="/profile">Profile</Link>
        </div>
        
        <div className="footer-social">
          <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer"><i className="social-icon"><img src={Facebook} alt="Facebook" /></i></a>
          <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer"><i className="social-icon"><img src={Instagram} alt="Instagram" /></i></a>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Vision Bucket. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
