import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import {
  createList,
  getErrorMessage,
  getUserLists,
  MovieList,
} from '../../../functions/firebase_backend';
import '../../../styles/lists.css';

function MyLists() {
  const [user, setUser] = useState<User | null>(null);
  const [lists, setLists] = useState<MovieList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), async (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setLists([]);
        setError('Please sign in to see your lists.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        setLists(await getUserLists(firebaseUser.uid));
      } catch (err) {
        setError(getErrorMessage(err, 'Unable to load your lists.'));
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || !title.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const created = await createList({ title: title.trim(), isPublic });
      setLists((prev) => [created, ...prev]);
      setTitle('');
      setIsPublic(false);
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to create the list.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="profile-lists-card">
      <h2 className="profile-section-title">My Lists</h2>

      {loading ? (
        <p className="list-loading">Loading…</p>
      ) : (
        <>
          {error && <p className="list-error">{error}</p>}
          {user && (
            <>
              {lists.length > 0 ? (
                <ul className="profile-lists-grid">
                  {lists.map((list) => (
                    <li key={list.id} className="profile-list-row">
                      <Link to={`/lists/${list.id}`}>{list.title}</Link>
                      <span className="profile-list-meta">
                        {list.isPublic ? 'Public' : 'Private'} · {list.items.length}{' '}
                        {list.items.length === 1 ? 'movie' : 'movies'}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="list-empty">You have not created any lists yet.</p>
              )}

              <form className="profile-create-list-form" onSubmit={handleCreate}>
                <input
                  type="text"
                  maxLength={100}
                  placeholder="New list title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
                <label>
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(event) => setIsPublic(event.target.checked)}
                  />
                  Public
                </label>
                <button type="submit" className="list-button" disabled={busy || !title.trim()}>
                  Create list
                </button>
              </form>
            </>
          )}
        </>
      )}
    </section>
  );
}

export default MyLists;
