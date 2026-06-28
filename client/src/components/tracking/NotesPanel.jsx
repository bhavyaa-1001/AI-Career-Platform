import { useState } from 'react';

import { Button, Textarea } from '@/components/ui';
import { useTrackingMutations } from '@/hooks/useApplicationTracking';

export function NotesPanel({ applicationId, notes = [] }) {
  const [text, setText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const { addNote, updateNote, deleteNote } = useTrackingMutations();

  const handleAdd = async () => {
    if (!text.trim()) return;
    await addNote.mutateAsync({ id: applicationId, text: text.trim() });
    setText('');
  };

  const handleSaveEdit = async (noteId) => {
    if (!editText.trim()) return;
    await updateNote.mutateAsync({ id: applicationId, noteId, text: editText.trim() });
    setEditingId(null);
  };

  const sorted = [...notes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a private note…"
          rows={3}
        />
        <Button
          type="button"
          size="sm"
          onClick={handleAdd}
          disabled={addNote.isPending || !text.trim()}
        >
          {addNote.isPending ? 'Saving…' : 'Add note'}
        </Button>
      </div>

      {sorted.length ? (
        <ul className="divide-y divide-border">
          {sorted.map((note) => (
            <li key={note.id} className="py-3">
              {editingId === note.id ? (
                <div className="space-y-2">
                  <Textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={3} />
                  <div className="flex gap-2">
                    <Button type="button" size="sm" onClick={() => handleSaveEdit(note.id)}>Save</Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="whitespace-pre-wrap text-sm">{note.text}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(note.createdAt).toLocaleString()}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => { setEditingId(note.id); setEditText(note.text); }}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteNote.mutateAsync({ id: applicationId, noteId: note.id })}
                    >
                      Delete
                    </Button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">No notes yet.</p>
      )}
    </div>
  );
}
