import React, { useEffect, useState } from 'react';
import { getUserStats, getErrorMessage, UserStats } from '../../../functions/firebase_backend';
import './StatsDashboard.css';

interface StatsDashboardProps {
  // The profile being viewed. When absent, nothing is fetched.
  uid?: string;
}

// A lightweight analytics dashboard rendered from GET /profile/stats/:uid.
// Charts are plain CSS bars (no charting dependency); every value is also shown
// as text for accessibility.
const StatsDashboard: React.FC<StatsDashboardProps> = ({ uid }) => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      setStats(null);
      return;
    }
    let active = true;
    setLoading(true);
    setError(null);
    getUserStats(uid)
      .then((data) => {
        if (active) setStats(data);
      })
      .catch((err) => {
        if (active) setError(getErrorMessage(err, 'Unable to load statistics.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [uid]);

  if (!uid) return null;

  if (loading) {
    return <section className="stats-dashboard"><p className="stats-loading">Loading statistics…</p></section>;
  }
  if (error) {
    return <section className="stats-dashboard"><p className="stats-error">{error}</p></section>;
  }
  if (!stats) return null;

  const { totals, ratingsDistribution, topGenres, watchesPerYear, genresAvailable } = stats;
  const maxRating = Math.max(1, ...ratingsDistribution.map((r) => r.count));
  const maxGenre = Math.max(1, ...topGenres.map((g) => g.count));
  const maxYear = Math.max(1, ...watchesPerYear.map((y) => y.count));

  return (
    <section className="stats-dashboard" aria-label="Your statistics">
      <h2 className="stats-heading">Statistics</h2>

      <div className="stats-tiles">
        <div className="stat-tile">
          <span className="stat-value">{totals.moviesWatched}</span>
          <span className="stat-label">Movies watched</span>
        </div>
        <div className="stat-tile">
          <span className="stat-value">{totals.diaryEntries}</span>
          <span className="stat-label">Diary entries</span>
        </div>
        <div className="stat-tile">
          <span className="stat-value">{totals.reviews}</span>
          <span className="stat-label">Reviews</span>
        </div>
        <div className="stat-tile">
          <span className="stat-value">{totals.averageRating === null ? '—' : totals.averageRating.toFixed(1)}</span>
          <span className="stat-label">Avg rating</span>
        </div>
      </div>

      <div className="stats-charts">
        <div className="stats-chart">
          <h3 className="stats-chart-title">Ratings</h3>
          <div className="stats-bars vertical">
            {ratingsDistribution.map(({ rating, count }) => (
              <div key={rating} className="stats-bar-col">
                <div className="stats-bar-track">
                  <div
                    className="stats-bar-fill"
                    style={{ height: `${(count / maxRating) * 100}%` }}
                    aria-hidden="true"
                  />
                </div>
                <span className="stats-bar-count">{count}</span>
                <span className="stats-bar-axis">{rating}★</span>
              </div>
            ))}
          </div>
        </div>

        <div className="stats-chart">
          <h3 className="stats-chart-title">Top genres</h3>
          {!genresAvailable ? (
            <p className="stats-empty">Genre data is unavailable right now.</p>
          ) : topGenres.length === 0 ? (
            <p className="stats-empty">No genre data yet.</p>
          ) : (
            <ul className="stats-hbars">
              {topGenres.slice(0, 6).map(({ genre, count }) => (
                <li key={genre} className="stats-hbar-row">
                  <span className="stats-hbar-label">{genre}</span>
                  <span className="stats-hbar-track">
                    <span className="stats-hbar-fill" style={{ width: `${(count / maxGenre) * 100}%` }} />
                  </span>
                  <span className="stats-hbar-count">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="stats-chart">
          <h3 className="stats-chart-title">Watches by year</h3>
          {watchesPerYear.length === 0 ? (
            <p className="stats-empty">No diary activity yet.</p>
          ) : (
            <div className="stats-bars vertical">
              {watchesPerYear.map(({ year, count }) => (
                <div key={year} className="stats-bar-col">
                  <div className="stats-bar-track">
                    <div
                      className="stats-bar-fill"
                      style={{ height: `${(count / maxYear) * 100}%` }}
                      aria-hidden="true"
                    />
                  </div>
                  <span className="stats-bar-count">{count}</span>
                  <span className="stats-bar-axis">{year}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default StatsDashboard;
