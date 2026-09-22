import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { resetDemo } from '../demo/store';
import '../styles/demo.css';

export default function DemoBanner() {
  const [confirmReset, setConfirmReset] = useState(false);
  const [error, setError] = useState('');
  const reset = () => {
    try { resetDemo(); window.location.hash = '/'; window.location.reload(); }
    catch { setError('Your browser blocked storage access. Enable site storage to reset.'); }
  };
  return <aside className="demo-banner" aria-label="Portfolio demo">
    <span><strong>PORTFOLIO DEMO</strong> Live movies from TMDB. Your changes stay in this browser.</span>
    <div><Link to="/about">About this project</Link>
      {confirmReset ? <><span>Clear your demo changes?</span><button onClick={reset}>Yes, reset</button><button onClick={() => setConfirmReset(false)}>Cancel</button></>
        : <button onClick={() => setConfirmReset(true)}>Reset demo</button>}
    </div>
    {error && <p role="alert">{error}</p>}
  </aside>;
}
