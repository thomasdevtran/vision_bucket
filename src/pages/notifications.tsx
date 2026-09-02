import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/header/header';
import Footer from '../components/footer/footer';
import { useAuth } from '../context/AuthContext';
import {
  AppNotification,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  getErrorMessage,
} from '../functions/firebase_backend';
import { formatRelativeTime } from '../components/notifications/NotificationBell';
import '../styles/notifications.css';

const TYPE_ICON: Record<AppNotification['type'], string> = {
  follow: '👤',
  reaction: '👍',
  comment: '💬',
};

function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const loadPage = useCallback(
    async (nextCursor: string | null, append: boolean) => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const page = await getNotifications(nextCursor ?? undefined);
        setItems((current) => (append ? [...current, ...page.notifications] : page.notifications));
        setUnreadCount(page.unreadCount);
        setCursor(page.nextCursor);
        setLoaded(true);
      } catch (err) {
        setError(getErrorMessage(err, 'Could not load your notifications.'));
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  useEffect(() => {
    if (authLoading || !user) return;
    void loadPage(null, false);
  }, [authLoading, user, loadPage]);

  const handleMarkRead = async (notification: AppNotification) => {
    if (notification.read) return;
    setItems((current) =>
      current.map((item) => (item.id === notification.id ? { ...item, read: true } : item))
    );
    setUnreadCount((count) => Math.max(0, count - 1));
    try {
      await markNotificationRead(notification.id);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not update the notification.'));
      void loadPage(null, false);
    }
  };

  const handleMarkAll = async () => {
    setItems((current) => current.map((item) => ({ ...item, read: true })));
    setUnreadCount(0);
    try {
      await markAllNotificationsRead();
    } catch (err) {
      setError(getErrorMessage(err, 'Could not mark all as read.'));
      void loadPage(null, false);
    }
  };

  return (
    <div className="App">
      <Header />

      <main className="notif-page">
        <section className="notif-page-card">
          <div className="notif-page-head">
            <div>
              <h1 className="notif-page-title">Notifications</h1>
              <p className="notif-page-sub">
                {unreadCount > 0 ? `${unreadCount} unread` : 'You are all caught up'}
              </p>
            </div>
            {unreadCount > 0 && (
              <button type="button" className="notif-primary-btn" onClick={handleMarkAll}>
                Mark all as read
              </button>
            )}
          </div>

          {!authLoading && !user && (
            <p className="notif-msg">
              Please <Link to="/auth" className="notif-inline-link">sign in</Link> to see your notifications.
            </p>
          )}

          {error && <p className="notif-msg notif-msg-error">{error}</p>}

          {user && loading && !loaded && <p className="notif-msg">Loading…</p>}

          {user && loaded && items.length === 0 && !loading && (
            <p className="notif-msg">No notifications yet.</p>
          )}

          <ul className="notif-page-list">
            {items.map((notification) => (
              <li
                key={notification.id}
                className={`notif-row${notification.read ? '' : ' notif-row-unread'}`}
              >
                <span className="notif-row-icon" aria-hidden="true">
                  {TYPE_ICON[notification.type] ?? '🔔'}
                </span>
                <div className="notif-row-body">
                  <p className="notif-row-message">{notification.message}</p>
                  <span className="notif-row-time">{formatRelativeTime(notification.createdAt)}</span>
                </div>
                {!notification.read && (
                  <button
                    type="button"
                    className="notif-row-action"
                    onClick={() => handleMarkRead(notification)}
                  >
                    Mark read
                  </button>
                )}
              </li>
            ))}
          </ul>

          {cursor && (
            <button
              type="button"
              className="notif-loadmore"
              onClick={() => loadPage(cursor, true)}
              disabled={loading}
            >
              {loading ? 'Loading…' : 'Load more'}
            </button>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default NotificationsPage;
