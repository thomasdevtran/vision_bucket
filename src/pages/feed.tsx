import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/header/header';
import Footer from '../components/footer/footer';
import { useAuth } from '../context/AuthContext';
import { getFeed, getErrorMessage, FeedItem } from '../functions/firebase_backend';
import '../styles/feed.css';

const PAGE_SIZE = 20;

const formatTime = (timestamp: string | null) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
};

const describeAction = (item: FeedItem) => {
  if (item.type === 'review') return 'reviewed a movie';
  if (item.type === 'watch') {
    const status = item.status ? item.status.replace(/_/g, ' ').toLowerCase() : 'updated';
    return `marked a movie as ${status}`;
  }
  return 'posted an update';
};

function Feed() {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<FeedItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (nextCursor: string | null) => {
    const page = await getFeed({ cursor: nextCursor, limit: PAGE_SIZE });
    setItems((prev) => (nextCursor ? [...prev, ...page.items] : page.items));
    setCursor(page.nextCursor);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setError('Please sign in to see your activity feed.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    load(null)
      .catch((err) => setError(getErrorMessage(err, 'Unable to load your feed.')))
      .finally(() => setLoading(false));
  }, [user, authLoading, load]);

  const handleLoadMore = async () => {
    if (!cursor) return;
    setLoadingMore(true);
    try {
      await load(cursor);
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to load more activity.'));
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="App">
      <Header />
      <main className="feed-main">
        <h1 className="feed-title">Activity Feed</h1>
        <p className="feed-subtitle">Recent activity from the people you follow.</p>

        {loading ? (
          <p className="feed-loading">Loading your feed...</p>
        ) : error ? (
          <p className="feed-error">{error}</p>
        ) : items.length === 0 ? (
          <p className="feed-empty">
            No activity yet. Follow some users to see what they are watching and reviewing.
          </p>
        ) : (
          <>
            <div className="feed-list">
              {items.map((item) => (
                <article className="feed-item" key={item.id}>
                  <div className="feed-item-header">
                    <span className="feed-actor">{item.actorName || 'A user you follow'}</span>
                    <span className="feed-action">{describeAction(item)}</span>
                    <span className="feed-time">{formatTime(item.timestamp)}</span>
                  </div>
                  {item.type === 'review' && (
                    <p className="feed-item-body">
                      {typeof item.rating === 'number' && (
                        <span className="feed-rating">{item.rating}/5 </span>
                      )}
                      {item.content}
                    </p>
                  )}
                  <p className="feed-item-body">
                    <Link className="feed-movie-link" to={`/show/${item.movieId}`}>
                      View movie #{item.movieId}
                    </Link>
                  </p>
                </article>
              ))}
            </div>
            {cursor && (
              <button
                type="button"
                className="feed-load-more"
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? 'Loading...' : 'Load more'}
              </button>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default Feed;
