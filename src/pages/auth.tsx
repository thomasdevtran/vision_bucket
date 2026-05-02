import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { API_BASE_URL } from '../config';
import { useNavigate } from 'react-router-dom';
import '../styles/auth.css';
import visionBucket from '../assets/VisionBucket.png'
import Footer from '../components/footer/footer';

function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const auth = getAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        // Sign in
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Sign up
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Extract username from email (everything before @)
        const username = email.split('@')[0];
        
        // Create current timestamp
        const currentDate = new Date().toISOString();
        
        // Create user profile in database
        const response = await fetch(`${API_BASE_URL}/profile/create/${userCredential.user.uid}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            Username: username,
            Joined: currentDate,
            Last_online: currentDate,
            movie_list: [],
            reviews: [],
            Completed: [],
            Dropped: [],
            On_hold: [],
            Plan_to_watch: [],
            Watching: [],
            Rewatched: []
          })
        });

        if (!response.ok) {
          throw new Error('Failed to create user profile');
        }
      }
      // Redirect to home page on success
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <section className="auth-brand-panel">
          <div className="auth-brand-lockup">
            <img src={visionBucket} alt="Vision Bucket" className="auth-logo" />
            <span className="auth-kicker">Movie tracking, reviews, and community</span>
          </div>

          <div className="auth-hero-copy">
            <h1>Keep every watch, rating, and discussion in one place.</h1>
            <p>
              Vision Bucket brings your watch history, review notes, and community threads into
              one clean space built for film fans.
            </p>
          </div>

          <div className="auth-method-panel">
            <p className="auth-method-heading">Available sign-in method</p>
            <div className="auth-method-pill">Email and password</div>
            <p className="auth-method-note">
              Apple and Twitter sign-in have been removed from the UI.
            </p>
          </div>
        </section>

        <section className="auth-card">
          <div className="auth-card-header">
            <p className="auth-eyebrow">{isLogin ? 'Welcome back' : 'Create your account'}</p>
            <h2>{isLogin ? 'Sign in to Vision Bucket' : 'Start your Vision Bucket profile'}</h2>
            <p className="auth-subtext">
              {isLogin
                ? 'Jump back into your lists, reviews, and discussions.'
                : 'Create an account to save movies, track progress, and join discussions.'}
            </p>
          </div>

          {error && <p className="error">{error}</p>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="primary-button">
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="auth-switch">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              type="button"
              className="link-button"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </section>
      </div>
      <Footer />
    </div>

  );
}

export default Auth;
