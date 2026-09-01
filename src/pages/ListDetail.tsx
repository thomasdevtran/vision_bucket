import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import Header from '../components/header/header';
import Footer from '../components/footer/footer';
import { getMovieDetails } from '../functions/api_service';
import {
  addCollaborator,
  addListItem,
  deleteList,
  getErrorMessage,
  getList,
  MovieList,
  removeCollaborator,
  removeListItem,
  reorderListItems,
  updateList,
} from '../functions/firebase_backend';
import '../styles/lists.css';

function ListDetail() {
  const { id } = useParams<{ id: string }>();
  const [list, setList] = useState<MovieList | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [titles, setTitles] = useState<Record<number, string>>({});

  const [newMovieId, setNewMovieId] = useState('');
  const [newNote, setNewNote] = useState('');
  const [collaboratorUid, setCollaboratorUid] = useState('');
  const [busy, setBusy] = useState(false);

  const loadList = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      setList(await getList(id));
    } catch (err) {
      setError(getErrorMessage(err, 'This list is unavailable.'));
      setList(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), (firebaseUser) => setUser(firebaseUser));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList, user]);

  // Best-effort enrichment of item titles for a friendlier display.
  useEffect(() => {
    if (!list) return;
    const missing = list.items.map((item) => item.movieId).filter((movieId) => !(movieId in titles));
    if (missing.length === 0) return;
    let active = true;
    Promise.all(missing.map(async (movieId) => {
      try {
        const movie = await getMovieDetails(movieId);
        return [movieId, movie.title] as const;
      } catch {
        return [movieId, ''] as const;
      }
    })).then((entries) => {
      if (!active) return;
      setTitles((prev) => {
        const next = { ...prev };
        for (const [movieId, title] of entries) next[movieId] = title;
        return next;
      });
    });
    return () => { active = false; };
  }, [list, titles]);

  const isOwner = !!user && !!list && list.ownerId === user.uid;
  const canEdit = !!user && !!list && (isOwner || list.collaboratorIds.includes(user.uid));

  const runAction = async (action: () => Promise<MovieList>, successMessage?: string) => {
    setBusy(true);
    setMessage(null);
    try {
      const updated = await action();
      setList(updated);
      if (successMessage) setMessage(successMessage);
    } catch (err) {
      setMessage(getErrorMessage(err, 'That action could not be completed.'));
    } finally {
      setBusy(false);
    }
  };

  const handleAddItem = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!id) return;
    const movieId = Number(newMovieId);
    if (!Number.isInteger(movieId) || movieId < 1) {
      setMessage('Enter a valid movie id.');
      return;
    }
    await runAction(() => addListItem(id, movieId, newNote.trim() || undefined), 'Movie added.');
    setNewMovieId('');
    setNewNote('');
  };

  const handleMove = (index: number, direction: -1 | 1) => {
    if (!id || !list) return;
    const target = index + direction;
    if (target < 0 || target >= list.items.length) return;
    const order = list.items.map((item) => item.movieId);
    [order[index], order[target]] = [order[target], order[index]];
    runAction(() => reorderListItems(id, order));
  };

  const handleRemoveItem = (movieId: number) => {
    if (!id) return;
    runAction(() => removeListItem(id, movieId), 'Movie removed.');
  };

  const handleToggleVisibility = () => {
    if (!id || !list) return;
    runAction(() => updateList(id, { isPublic: !list.isPublic }));
  };

  const handleAddCollaborator = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!id || !collaboratorUid.trim()) return;
    await runAction(() => addCollaborator(id, collaboratorUid.trim()), 'Collaborator added.');
    setCollaboratorUid('');
  };

  const handleRemoveCollaborator = (uid: string) => {
    if (!id) return;
    runAction(() => removeCollaborator(id, uid), 'Collaborator removed.');
  };

  const handleDeleteList = async () => {
    if (!id) return;
    if (!window.confirm('Delete this list permanently?')) return;
    setBusy(true);
    try {
      await deleteList(id);
      window.location.href = '/profile';
    } catch (err) {
      setMessage(getErrorMessage(err, 'Unable to delete this list.'));
      setBusy(false);
    }
  };

  return (
    <div className="App list-detail-page">
      <Header />
      <main className="list-detail-main">
        {loading ? (
          <p className="list-loading">Loading…</p>
        ) : error ? (
          <p className="list-error">{error}</p>
        ) : list ? (
          <>
            <section className="list-detail-header">
              <div className="list-detail-heading">
                <span className={`list-badge ${list.isPublic ? 'is-public' : 'is-private'}`}>
                  {list.isPublic ? 'Public' : 'Private'}
                </span>
                <h1>{list.title}</h1>
                {list.description && <p className="list-description">{list.description}</p>}
                <p className="list-meta">{list.items.length} {list.items.length === 1 ? 'movie' : 'movies'}</p>
              </div>

              {isOwner && (
                <div className="list-owner-controls">
                  <button className="list-button" onClick={handleToggleVisibility} disabled={busy}>
                    Make {list.isPublic ? 'private' : 'public'}
                  </button>
                  <button className="list-button danger" onClick={handleDeleteList} disabled={busy}>
                    Delete list
                  </button>
                </div>
              )}
            </section>

            {message && <p className="list-message" role="status">{message}</p>}

            <section className="list-items-card">
              <h2>Movies</h2>
              {list.items.length === 0 ? (
                <p className="list-empty">No movies yet.</p>
              ) : (
                <ol className="list-items">
                  {list.items.map((item, index) => (
                    <li key={item.movieId} className="list-item">
                      <span className="list-item-position">{item.position}</span>
                      <div className="list-item-body">
                        <Link to={`/show/${item.movieId}`} className="list-item-title">
                          {titles[item.movieId] || `Movie #${item.movieId}`}
                        </Link>
                        {item.note && <p className="list-item-note">{item.note}</p>}
                      </div>
                      {canEdit && (
                        <div className="list-item-actions">
                          <button
                            className="list-move"
                            onClick={() => handleMove(index, -1)}
                            disabled={busy || index === 0}
                            aria-label="Move up"
                          >
                            ↑
                          </button>
                          <button
                            className="list-move"
                            onClick={() => handleMove(index, 1)}
                            disabled={busy || index === list.items.length - 1}
                            aria-label="Move down"
                          >
                            ↓
                          </button>
                          <button
                            className="list-remove"
                            onClick={() => handleRemoveItem(item.movieId)}
                            disabled={busy}
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </li>
                  ))}
                </ol>
              )}

              {canEdit && (
                <form className="list-add-form" onSubmit={handleAddItem}>
                  <input
                    type="number"
                    min="1"
                    placeholder="Movie id"
                    value={newMovieId}
                    onChange={(event) => setNewMovieId(event.target.value)}
                  />
                  <input
                    type="text"
                    maxLength={300}
                    placeholder="Note (optional)"
                    value={newNote}
                    onChange={(event) => setNewNote(event.target.value)}
                  />
                  <button type="submit" className="list-button" disabled={busy}>Add movie</button>
                </form>
              )}
            </section>

            {isOwner && (
              <section className="list-collaborators-card">
                <h2>Collaborators</h2>
                {list.collaboratorIds.length === 0 ? (
                  <p className="list-empty">No collaborators yet.</p>
                ) : (
                  <ul className="list-collaborators">
                    {list.collaboratorIds.map((uid) => (
                      <li key={uid}>
                        <span className="collaborator-uid">{uid}</span>
                        <button
                          className="list-remove"
                          onClick={() => handleRemoveCollaborator(uid)}
                          disabled={busy}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <form className="list-add-form" onSubmit={handleAddCollaborator}>
                  <input
                    type="text"
                    placeholder="Collaborator user id"
                    value={collaboratorUid}
                    onChange={(event) => setCollaboratorUid(event.target.value)}
                  />
                  <button type="submit" className="list-button" disabled={busy}>Add collaborator</button>
                </form>
              </section>
            )}
          </>
        ) : (
          <p className="list-error">List not found.</p>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default ListDetail;
