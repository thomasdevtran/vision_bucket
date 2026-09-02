import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  AppNotification,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  getErrorMessage,
} from '../../functions/firebase_backend';
import '../../styles/notifications.css';

const PREVIEW_LIMIT = 6;

const TYPE_ICON: Record<AppNotification['type'], string> = {
  follow: '👤',
  reaction: '👍',
  comment: '💬',
};

export const formatRelativeTime = (iso: string): string => {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const seconds = Math.max(0, Math.round((Date.now() - then) / 1000));
  if (seconds < 60) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
};

// Self-contained notification bell: renders an unread badge and a dropdown
// preview. The integrator drops <NotificationBell /> into the header. It relies
// only on the auth context and the backend API, so it works anywhere.
const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const page = await getNotifications();
      setItems(page.notifications.slice(0, PREVIEW_LIMIT));
      setUnreadCount(page.unreadCount);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load notifications.'));
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch the unread count on mount / whenever the signed-in user changes.
  useEffect(() => {
    if (!user) {
      setItems([]);
      setUnreadCount(0);
      return;
    }
    void load();
  }, [user, load]);

  // Close the dropdown on an outside click.
  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) void load();
  };

  const handleMarkRead = async (notification: AppNotification) => {
    if (notification.read) return;
    // Optimistic update, reconciled by the next load.
    setItems((current) =>
      current.map((item) => (item.id === notification.id ? { ...item, read: true } : item))
    );
    setUnreadCount((count) => Math.max(0, count - 1));
    try {
      await markNotificationRead(notification.id);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not update the notification.'));
      void load();
    }
  };

  const handleMarkAll = async () => {
    setItems((current) => current.map((item) => ({ ...item, read: true })));
    setUnreadCount(0);
    try {
      await markAllNotificationsRead();
    } catch (err) {
      setError(getErrorMessage(err, 'Could not mark all as read.'));
      void load();
    }
  };

  if (!user) return null;

  return (
    <div className="notif-bell" ref={containerRef}>
      <button
        type="button"
        className="notif-bell-button"
        onClick={toggle}
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        aria-expanded={open}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
          <path
            fill="currentColor"
            d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-5-1.6-1.6V10a5.4 5.4 0 0 0-4-5.22V4a1.4 1.4 0 1 0-2.8 0v.78A5.4 5.4 0 0 0 6.6 10v5.4L5 17a.9.9 0 0 0 .64 1.54h12.72A.9.9 0 0 0 19 17Z"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="notif-badge" aria-hidden="true">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="notif-panel" role="dialog" aria-label="Notifications">
          <div className="notif-panel-head">
            <span className="notif-panel-title">Notifications</span>
            {unreadCount > 0 && (
              <button type="button" className="notif-linkbtn" onClick={handleMarkAll}>
                Mark all read
              </button>
            )}
          </div>

          {error && <p className="notif-msg notif-msg-error">{error}</p>}
          {loading && items.length === 0 && <p className="notif-msg">Loading…</p>}
          {!loading && !error && items.length === 0 && (
            <p className="notif-msg">You&apos;re all caught up.</p>
          )}

          <ul className="notif-list">
            {items.map((notification) => (
              <li
                key={notification.id}
                className={`notif-item${notification.read ? '' : ' notif-item-unread'}`}
              >
                <button
                  type="button"
                  className="notif-item-btn"
                  onClick={() => handleMarkRead(notification)}
                >
                  <span className="notif-item-icon" aria-hidden="true">
                    {TYPE_ICON[notification.type] ?? '🔔'}
                  </span>
                  <span className="notif-item-body">
                    <span className="notif-item-message">{notification.message}</span>
                    <span className="notif-item-time">{formatRelativeTime(notification.createdAt)}</span>
                  </span>
                  {!notification.read && <span className="notif-dot" aria-hidden="true" />}
                </button>
              </li>
            ))}
          </ul>

          <Link to="/notifications" className="notif-panel-foot" onClick={() => setOpen(false)}>
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
