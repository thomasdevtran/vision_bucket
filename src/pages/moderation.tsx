import React, { useCallback, useEffect, useState } from 'react';
import Header from '../components/header/header';
import Footer from '../components/footer/footer';
import { useAuth } from '../context/AuthContext';
import {
  getReports,
  resolveReport,
  getErrorMessage,
  Report,
} from '../functions/firebase_backend';
import '../styles/moderation.css';

type Access = 'loading' | 'granted' | 'denied' | 'signed-out';

// The UI gate is a convenience only; the backend enforces the real check on
// every /reports call regardless of what the token claims say here.
const hasModeratorClaim = (claims: Record<string, unknown>): boolean => {
  const role = claims.role;
  const roles = Array.isArray(claims.roles) ? (claims.roles as unknown[]) : [];
  const allowed = ['admin', 'moderator'];
  return allowed.includes(String(role)) || roles.some((entry) => allowed.includes(String(entry)));
};

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

function Moderation() {
  const { user, loading } = useAuth();
  const [access, setAccess] = useState<Access>('loading');
  const [reports, setReports] = useState<Report[]>([]);
  const [listState, setListState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  // Resolve the caller's role from their ID token claims.
  useEffect(() => {
    if (loading) return;
    if (!user) {
      setAccess('signed-out');
      return;
    }
    let active = true;
    user
      .getIdTokenResult()
      .then((result) => {
        if (active) setAccess(hasModeratorClaim(result.claims) ? 'granted' : 'denied');
      })
      .catch(() => {
        if (active) setAccess('denied');
      });
    return () => {
      active = false;
    };
  }, [user, loading]);

  const loadReports = useCallback(async () => {
    setListState('loading');
    setError('');
    try {
      const data = await getReports('open');
      setReports(data.reports);
      setListState('idle');
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load the moderation queue.'));
      setListState('error');
    }
  }, []);

  useEffect(() => {
    if (access === 'granted') loadReports();
  }, [access, loadReports]);

  const handleResolve = async (
    report: Report,
    status: 'resolved' | 'dismissed',
    removeTarget = false
  ) => {
    setBusyId(report.id);
    setError('');
    try {
      await resolveReport(report.id, { status, removeTarget });
      // Drop the report from the open queue once it is handled.
      setReports((current) => current.filter((item) => item.id !== report.id));
    } catch (err) {
      setError(getErrorMessage(err, 'Could not update the report.'));
    } finally {
      setBusyId(null);
    }
  };

  const renderBody = () => {
    if (access === 'loading' || loading) {
      return <p className="moderation-note">Checking your access…</p>;
    }
    if (access === 'signed-out') {
      return <p className="moderation-note">Please sign in to access the moderation queue.</p>;
    }
    if (access === 'denied') {
      return (
        <p className="moderation-note moderation-denied">
          You are not authorized to view the moderation queue.
        </p>
      );
    }

    return (
      <>
        <div className="moderation-toolbar">
          <span className="moderation-count">{reports.length} open report{reports.length === 1 ? '' : 's'}</span>
          <button type="button" className="moderation-refresh" onClick={loadReports} disabled={listState === 'loading'}>
            {listState === 'loading' ? 'Loading…' : 'Refresh'}
          </button>
        </div>

        {error && <p className="moderation-note moderation-denied">{error}</p>}

        {listState === 'idle' && reports.length === 0 && (
          <p className="moderation-note">The queue is clear. Nothing to review right now.</p>
        )}

        <ul className="moderation-list">
          {reports.map((report) => (
            <li className="moderation-card" key={report.id}>
              <div className="moderation-card-head">
                <span className={`moderation-tag moderation-tag-${report.targetType}`}>{report.targetType}</span>
                <span className="moderation-target">#{report.targetId}</span>
                <span className="moderation-date">{formatDate(report.createdAt)}</span>
              </div>
              <p className="moderation-reason">{report.reason}</p>
              <p className="moderation-reporter">Reported by {report.reporterUid}</p>
              <div className="moderation-actions">
                <button
                  type="button"
                  className="moderation-btn moderation-resolve"
                  disabled={busyId === report.id}
                  onClick={() => handleResolve(report, 'resolved')}
                >
                  Resolve
                </button>
                <button
                  type="button"
                  className="moderation-btn moderation-dismiss"
                  disabled={busyId === report.id}
                  onClick={() => handleResolve(report, 'dismissed')}
                >
                  Dismiss
                </button>
                <button
                  type="button"
                  className="moderation-btn moderation-remove"
                  disabled={busyId === report.id}
                  onClick={() => handleResolve(report, 'resolved', true)}
                >
                  Resolve &amp; remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      </>
    );
  };

  return (
    <div className="App">
      <Header />
      <main className="moderation-main">
        <h1 className="moderation-title">Moderation queue</h1>
        <p className="moderation-subtitle">Review reported reviews, threads, and comments.</p>
        {renderBody()}
      </main>
      <Footer />
    </div>
  );
}

export default Moderation;
