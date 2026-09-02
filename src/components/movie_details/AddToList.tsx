import React, { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import {
  addListItem,
  getErrorMessage,
  getUserLists,
  MovieList,
} from '../../functions/firebase_backend';
import '../../styles/lists.css';

interface AddToListProps {
  movieId: number;
  user: User | null;
}

function AddToList({ movieId, user }: AddToListProps) {
  const [lists, setLists] = useState<MovieList[]>([]);
  const [selected, setSelected] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) {
      setLists([]);
      return;
    }
    let active = true;
    getUserLists(user.uid)
      .then((data) => { if (active) setLists(data); })
      .catch(() => { if (active) setLists([]); });
    return () => { active = false; };
  }, [user]);

  if (!user) return null;

  const handleAdd = async () => {
    if (!selected) {
      setMessage('Choose a list first.');
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const updated = await addListItem(selected, movieId);
      setLists((prev) => prev.map((list) => (list.id === updated.id ? updated : list)));
      setMessage('Added to list.');
    } catch (err) {
      setMessage(getErrorMessage(err, 'Unable to add this movie to the list.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="movie-add-to-list">
      <select value={selected} onChange={(event) => setSelected(event.target.value)}>
        <option value="">Add to a list…</option>
        {lists.map((list) => (
          <option key={list.id} value={list.id}>{list.title}</option>
        ))}
      </select>
      <button className="list-button" onClick={handleAdd} disabled={busy || !selected}>
        Add
      </button>
      {lists.length === 0 && <span className="list-empty">Create a list on your profile first.</span>}
      {message && <p className="list-message" role="status">{message}</p>}
    </div>
  );
}

export default AddToList;
