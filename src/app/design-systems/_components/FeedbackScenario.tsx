'use client';

import { useEffect, useRef, useState } from 'react';
import type { Direction } from './systems';
import { validateDestination } from './behavior';
import styles from './systems.module.css';

export function FeedbackScenario({ direction }: { direction: Direction }) {
  const [place, setPlace] = useState('');
  const [savedPlace, setSavedPlace] = useState('');
  const [state, setState] = useState<'empty' | 'loading' | 'error' | 'success'>('empty');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const field = useRef<HTMLInputElement>(null);
  const id = `${direction}-feedback-demo`;
  const error = state === 'error' ? validateDestination(place) : null;
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  return <div className={styles.specimen} data-feedback-scenario>
    <h3>Try the full feedback sequence</h3><p className={styles.annotation}>Empty → validate → local loading → success. Submit an empty name to try the error and recovery path. Nothing is sent or stored.</p>
    <form noValidate onSubmit={event => {
      event.preventDefault(); if (state === 'loading') return;
      if (validateDestination(place)) { setState('error'); field.current?.focus(); return; }
      const name = place.trim(); setState('loading');
      timer.current = setTimeout(() => { setSavedPlace(name); setState('success'); }, 700);
    }}>
      <label className={styles.field} htmlFor={id}><span>Preview destination</span><input ref={field} id={id} value={place} disabled={state === 'loading'} aria-invalid={!!error} aria-describedby={`${id}-help`} onChange={event => { setPlace(event.target.value); if (state === 'error') setState('empty'); }} /></label>
      <p id={`${id}-help`} className={error ? styles.fieldError : styles.annotation}>{error || 'Use at least two characters; try Lake Braies.'}</p>
      <div className={styles.buttonRow}><button type="submit" className={styles.button} disabled={state === 'loading'}>{state === 'loading' ? 'Preparing destination…' : state === 'error' ? 'Retry preview' : 'Preview destination'}</button><button type="button" className={`${styles.button} ${styles.secondary}`} disabled={state === 'loading'} onClick={() => { setPlace(''); setSavedPlace(''); setState('empty'); field.current?.focus(); }}>Clear preview</button></div>
    </form>
    <div className={styles.scenarioResult} aria-busy={state === 'loading'} data-result={state}>
      <p className={styles.stateLabel}>{state}</p>
      {state === 'empty' ? <><h4>No destination preview yet</h4><p>Start with a place you would like to explore.</p></>
        : state === 'loading' ? <><h4>Preparing your destination</h4><div className={styles.skeleton} aria-hidden="true" /></>
        : state === 'error' ? <><h4>Destination needs attention</h4><p>Correct the named field, then retry. Your input is preserved.</p></>
        : <><h4>{savedPlace}</h4><p>Preview ready for this visit. Add another place or clear the preview.</p><span className={`${styles.badge} ${styles.successBadge}`}>Ready</span></>}
    </div>
    <p role="status" className={styles.annotation}>{state === 'loading' ? 'Preparing destination preview.' : state === 'success' ? `Preview ready for ${savedPlace}.` : state === 'error' ? 'Preview failed: review the destination field.' : 'No destination preview yet.'}</p>
  </div>;
}
