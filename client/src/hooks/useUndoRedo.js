import { useCallback, useRef, useState } from 'react';

const MAX_HISTORY = 50;

export function useUndoRedo(initialState) {
  const [state, setState] = useState(initialState);
  const pastRef = useRef([]);
  const futureRef = useRef([]);
  const skipSyncRef = useRef(false);

  const syncExternal = useCallback((external) => {
    if (skipSyncRef.current) {
      skipSyncRef.current = false;
      return;
    }
    setState(external);
    pastRef.current = [];
    futureRef.current = [];
  }, []);

  const commit = useCallback((next, { recordHistory = true } = {}) => {
    setState((current) => {
      if (recordHistory && current != null) {
        pastRef.current = [...pastRef.current.slice(-MAX_HISTORY + 1), current];
        futureRef.current = [];
      }
      skipSyncRef.current = true;
      return next;
    });
  }, []);

  const undo = useCallback(() => {
    const past = pastRef.current;
    if (!past.length) return null;
    const previous = past[past.length - 1];
    pastRef.current = past.slice(0, -1);
    let restored = previous;
    setState((current) => {
      futureRef.current = [current, ...futureRef.current];
      skipSyncRef.current = true;
      restored = previous;
      return previous;
    });
    return restored;
  }, []);

  const redo = useCallback(() => {
    const future = futureRef.current;
    if (!future.length) return null;
    const next = future[0];
    futureRef.current = future.slice(1);
    setState((current) => {
      pastRef.current = [...pastRef.current, current];
      skipSyncRef.current = true;
      return next;
    });
    return next;
  }, []);

  const reset = useCallback((next) => {
    pastRef.current = [];
    futureRef.current = [];
    setState(next);
  }, []);

  return {
    state,
    commit,
    undo,
    redo,
    reset,
    syncExternal,
    canUndo: () => pastRef.current.length > 0,
    canRedo: () => futureRef.current.length > 0,
  };
}
