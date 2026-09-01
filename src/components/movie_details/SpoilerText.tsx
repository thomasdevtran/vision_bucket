import React, { useState } from 'react';
import '../../styles/MovieDetails.css';

interface SpoilerTextProps {
  isSpoiler?: boolean;
  className?: string;
  children: React.ReactNode;
}

// Hides review content flagged as a spoiler behind a "Show spoiler" reveal.
// Non-spoiler content renders normally.
const SpoilerText: React.FC<SpoilerTextProps> = ({ isSpoiler = false, className, children }) => {
  const [revealed, setRevealed] = useState(false);

  if (isSpoiler && !revealed) {
    return (
      <div className="spoiler-block">
        <span className="spoiler-warning">This review contains spoilers.</span>
        <button type="button" className="review-action spoiler-reveal" onClick={() => setRevealed(true)}>
          Show spoiler
        </button>
      </div>
    );
  }

  return <div className={className}>{children}</div>;
};

export default SpoilerText;
