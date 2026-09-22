import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/header/header';
import Footer from '../components/footer/footer';
import { AppThread, getThreads } from '../functions/firebase_backend';
import '../styles/discussion.css';
import '../styles/post_preview.css';

export default function Discussion() {
  const [threads, setThreads] = useState<AppThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    getThreads('Discussions').then(items => { if (active) setThreads(items); })
      .catch(() => { if (active) setError('Conversations could not be loaded. Open general discussion to try again.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  return <div className="discussion-page"><Header /><main className="discussion-container">
    <div className="page-heading"><div><h1>Conversations after the credits.</h1><p>Recommendations, second opinions, and films you cannot stop thinking about.</p></div></div>
    <nav className="board-navigation" aria-label="Discussion boards">
      <Link to="/discussion/general"><strong>General discussion</strong><span>Find your next conversation <span aria-hidden="true">→</span></span></Link>
      <Link to="/discussion/news"><strong>News & announcements</strong><span>Updates from Vision Bucket <span aria-hidden="true">→</span></span></Link>
    </nav>
    <div className="section-heading"><h2>Latest conversations</h2><Link to="/discussion/general">View all →</Link></div>
    {loading ? <p role="status">Loading conversations…</p> : error ? <p role="alert">{error}</p> :
      threads.length ? <div className="discussion-preview_background">{threads.slice(0, 6).map(thread =>
        <Link className="discussion-preview" to={'/threads/' + thread.id} key={thread.id}>
          <div className="thread-row-main"><h3>{thread.Title}</h3><p className="thread-description">{thread.Description}</p>
            <div className="author-date"><span>{thread.Author}</span><time dateTime={thread.Date}>{new Date(thread.Date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</time></div></div>
          <span className="reply-count">{thread.Comments.length}<small>{thread.Comments.length === 1 ? 'reply' : 'replies'}</small></span>
        </Link>)}</div> : <p>No conversations yet. Start one in general discussion.</p>}
  </main><Footer /></div>;
}
