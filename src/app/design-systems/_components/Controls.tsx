'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import type { Direction } from './systems';
import { systems } from './systems';
import { nextTab, toggleFilter, validateDestination } from './behavior';
import styles from './systems.module.css';

export function Controls({ direction }: { direction: Direction }) {
  const system = systems[direction];
  const [destination, setDestination] = useState('');
  const [notes, setNotes] = useState('');
  const [season, setSeason] = useState('Autumn');
  const [pace, setPace] = useState('Unhurried');
  const [flexible, setFlexible] = useState(true);
  const [notifications, setNotifications] = useState(false);
  const [tab, setTab] = useState(0);
  const [filters, setFilters] = useState<string[]>(['Nature']);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [removed, setRemoved] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const tabs = ['Overview', 'Itinerary', 'Notes'];
  const id = (name: string) => `${direction}-${name}`;
  const actionLabel = direction === 'arcade' ? 'Start quest' : direction === 'editorial' ? 'Save to journal' : 'Save a little plan';

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const problem = validateDestination(destination);
    setError(problem);
    if (problem) { setMessage(''); document.getElementById(id('destination'))?.focus(); return; }
    setRemoved(false);
    setMessage(`Plan saved for ${destination.trim()}. ${season}, ${pace.toLowerCase()}. ${flexible ? 'Dates are flexible.' : 'Dates are fixed.'}`);
  }
  function tabKey(event: KeyboardEvent<HTMLButtonElement>) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const target = nextTab(tab, event.key, tabs.length);
    setTab(target);
    document.getElementById(id(`tab-${target}`))?.focus();
  }

  return (
    <>
      <section className={styles.section} id="actions" aria-labelledby={id('actions-title')}>
        <div className={styles.sectionHeader}><span className={styles.sectionNumber}>04</span><div><p className={styles.eyebrow}>COMPONENTS / ACTIONS</p><h2 id={id('actions-title')}>{direction === 'arcade' ? 'Press start.' : direction === 'editorial' ? 'Make a mark.' : 'A gentle next step.'}</h2></div></div>
        <div className={styles.actionLayout}>
          <div className={styles.specimen}><h3>Buttons &amp; links</h3><p className={styles.annotation}>Live controls. Actions report their result below.</p><div className={styles.buttonRow}>
            <button className={styles.button} onClick={() => { setMessage('A new plan is ready. Add a destination in the form below.'); document.getElementById(id('destination'))?.focus(); }}>{actionLabel}</button>
            <button className={`${styles.button} ${styles.secondary}`} onClick={() => { setDestination(''); setNotes(''); setSeason('Autumn'); setError(null); setMessage('Form reset. Your next journey starts with a blank page.'); }}>Reset form</button>
            <button className={`${styles.button} ${styles.destructive}`} disabled={removed} onClick={() => { setRemoved(true); setMessage('Example trip removed. Use Restore trip to bring it back.'); }}>Remove trip</button>
          </div><a className={styles.textLink} href={`/${'mood-boards'}/${direction}`}>Explore the approved mood board <span aria-hidden="true">↗</span></a><p className={styles.annotation}>Primary: next step. Secondary: supporting action. Destructive: explicit removal.</p></div>
          <div className={styles.specimen}><h3>Control state atlas</h3><p className={styles.annotation}>Static visual specimens. Live buttons also use :hover, :focus-visible, :active and :disabled.</p><div className={styles.stateMatrix}>
            {['Default', 'Hover', 'Focus', 'Pressed', 'Selected', 'Disabled'].map(state => <div key={state}><span className={styles.stateLabel}>{state}</span><span className={`${styles.button} ${styles.stateSample}`} data-state={state.toLowerCase()}>Explore{state === 'Selected' ? ' ✓' : ''}</span></div>)}
          </div></div>
        </div>
        <p className={styles.liveMessage} role="status" aria-live="polite">{message || 'Try an action, or save a destination below. Changes last for this visit.'}</p>
      </section>

      <section className={styles.section} id="forms" aria-labelledby={id('forms-title')}>
        <div className={styles.sectionHeader}><span className={styles.sectionNumber}>05</span><div><p className={styles.eyebrow}>COMPONENTS / INPUT &amp; CHOICE</p><h2 id={id('forms-title')}>{direction === 'arcade' ? 'Configure your run.' : direction === 'editorial' ? 'The details matter.' : 'Make room for your plans.'}</h2></div></div>
        <div className={styles.formLayout}>
          <form className={styles.specimen} onSubmit={submit} noValidate>
            <h3>Trip notes</h3><p className={styles.annotation}>A working form with validation and a local confirmation.</p>
            <label className={styles.field} htmlFor={id('destination')}><span>Destination <small>Required</small></span><input id={id('destination')} value={destination} onChange={event => { setDestination(event.target.value); if (error) setError(null); }} placeholder={`Try ${system.destination}`} required aria-invalid={!!error} aria-describedby={id('destination-help')} /></label>
            <p id={id('destination-help')} className={error ? styles.fieldError : styles.annotation}>{error || 'Enter a place with at least two characters.'}</p>
            <label className={styles.field} htmlFor={id('notes')}><span>Travel notes</span><textarea id={id('notes')} value={notes} onChange={event => setNotes(event.target.value)} placeholder="What would you like to discover?" rows={3} /></label>
            <label className={styles.field} htmlFor={id('season')}><span>Season</span><select id={id('season')} value={season} onChange={event => setSeason(event.target.value)}>{['Spring', 'Summer', 'Autumn', 'Winter'].map(value => <option key={value}>{value}</option>)}</select></label>
            <button type="submit" className={styles.button}>{actionLabel}</button>
          </form>
          <div className={styles.choiceStack}>
            <div className={styles.specimen}><h3>Set your rhythm</h3>
              <label className={styles.check}><input type="checkbox" checked={flexible} onChange={event => setFlexible(event.target.checked)} /><span>Keep my dates flexible</span></label>
              <label className={styles.check}><input type="checkbox" disabled /><span>Shared trip access <small>Unavailable in this demo</small></span></label>
              <fieldset className={styles.radioGroup}><legend>Travel pace</legend>{['Unhurried', 'Balanced', 'Full days'].map(value => <label className={styles.check} key={value}><input type="radio" name={id('pace')} value={value} checked={pace === value} onChange={() => setPace(value)} /><span>{value}</span></label>)}</fieldset>
              <button type="button" role="switch" aria-checked={notifications} className={styles.switch} onClick={() => setNotifications(!notifications)}><span className={styles.switchTrack} aria-hidden="true"><span /></span><span>Trip reminders <strong>{notifications ? 'On' : 'Off'}</strong></span></button>
              <p className={styles.annotation}>Preference only; this demo does not send notifications.</p>
            </div>
            <div className={styles.specimen}><h3>Field states</h3><label className={styles.field} htmlFor={id('invalid')}><span>Error specimen</span><input id={id('invalid')} aria-invalid="true" aria-describedby={id('invalid-help')} readOnly value="" placeholder="Destination missing" /></label><p className={styles.fieldError} id={id('invalid-help')}>Error: enter a destination.</p><label className={styles.field} htmlFor={id('disabled')}><span>Disabled specimen</span><input id={id('disabled')} disabled value="Booking reference unavailable" readOnly /></label><p className={styles.annotation}>Readonly error specimen; use the trip form to test validation.</p></div>
          </div>
        </div>
      </section>

      <section className={styles.section} id="travel" aria-labelledby={id('travel-title')}>
        <div className={styles.sectionHeader}><span className={styles.sectionNumber}>06</span><div><p className={styles.eyebrow}>COMPONENTS / TRAVEL PATTERNS</p><h2 id={id('travel-title')}>{direction === 'arcade' ? 'Your quest inventory.' : direction === 'editorial' ? 'Stories, indexed.' : 'A day worth keeping.'}</h2></div></div>
        <div className={styles.travelLayout}>
          <div className={styles.destinationCard}>
            <div className={styles.cardImage}><Image src={system.image} alt={system.imageAlt} fill sizes="(max-width: 640px) 100vw, 45vw" /><span className={styles.imageLabel}>{direction === 'arcade' ? 'WORLD 03 / UNLOCKED' : direction === 'editorial' ? 'DESTINATION ESSAY / 08' : 'A PLACE TO PAUSE'}</span></div>
            <div className={styles.cardBody}><span className={styles.badge}>{removed ? 'Removed' : direction === 'arcade' ? 'Quest unlocked' : 'Saved place'}</span><h3>{system.trip}</h3><p>{direction === 'arcade' ? 'Three neighborhoods. Four street-food stops. One city full of side quests.' : direction === 'editorial' ? 'A city in the margins: tiled streets, late ferries, and the stories between them.' : 'A lake, a quiet path, and an afternoon with nothing on the agenda.'}</p><button className={styles.button} onClick={() => { if (removed) { setRemoved(false); setMessage('Example trip restored.'); } else dialog.current?.showModal(); }}>{removed ? 'Restore trip' : 'Open trip details'}</button></div>
          </div>
          <div className={styles.specimen}>
            <h3>Tabs &amp; filter chips</h3><div className={styles.tabs} role="tablist" aria-label="Trip information">{tabs.map((label, index) => <button key={label} id={id(`tab-${index}`)} role="tab" aria-selected={tab === index} aria-controls={id('tab-panel')} tabIndex={tab === index ? 0 : -1} onClick={() => setTab(index)} onKeyDown={tabKey}>{label}</button>)}</div>
            <div id={id('tab-panel')} role="tabpanel" aria-labelledby={id(`tab-${tab}`)} tabIndex={0} className={styles.tabPanel}>
              {tab === 0 ? <><p>{system.destination} · 3 days · {season}</p><p>{flexible ? 'Flexible dates' : 'Fixed dates'} / {pace} pace</p></> : tab === 1 ? <ol className={styles.list}><li><time>09:00</time><span>Explore the old town</span><span className={styles.badge}>Planned</span></li><li><time>12:30</time><span>Local lunch stop</span><span className={`${styles.badge} ${styles.successBadge}`}>Confirmed</span></li><li><time>16:00</time><span>A little room to wander</span><span className={`${styles.badge} ${styles.warningBadge}`}>Flexible</span></li></ol> : <p>{notes || 'No notes yet. Add your ideas in the travel notes field.'}</p>}
            </div>
            <p className={styles.annotation}>Tabs: use ← / →, Home and End to move and select.</p>
            <fieldset className={styles.filterGroup}><legend>Filter interests</legend><div className={styles.chips}>{['Nature', 'Culture', 'Food', 'Nightlife'].map(value => <button key={value} type="button" aria-pressed={filters.includes(value)} className={styles.chip} onClick={() => setFilters(toggleFilter(filters, value))}>{filters.includes(value) && <span aria-hidden="true">✓ </span>}{value}</button>)}</div><p role="status" className={styles.annotation}>{filters.length ? `Showing: ${filters.join(', ')}` : 'No interests selected. Select a chip to refine the trip.'}</p><ul className={styles.filteredList}>{filters.map(value => <li key={value}>{value}: {({ Nature: 'Coastal path', Culture: 'Neighborhood gallery', Food: 'Local market', Nightlife: 'Evening music' })[value]}</li>)}</ul></fieldset>
          </div>
          <div className={`${styles.specimen} ${styles.listSpecimen}`}><h3>List rows &amp; status badges</h3><ul className={styles.list}><li><span className={styles.rowIndex}>01</span><span>Arrival &amp; a first look<small>Day one · 09:00</small></span><span className={`${styles.badge} ${styles.successBadge}`}>Confirmed</span></li><li><span className={styles.rowIndex}>02</span><span>Take the scenic route<small>Day two · open afternoon</small></span><span className={`${styles.badge} ${styles.warningBadge}`}>Flexible</span></li><li><span className={styles.rowIndex}>03</span><span>Return journey<small>Day three · review timing</small></span><span className={`${styles.badge} ${styles.errorBadge}`}>Needs review</span></li></ul>
            {direction === 'arcade' ? <div className={styles.progressBlock}><label htmlFor={id('xp')}>EXPLORER XP / 720 OF 1000</label><progress id={id('xp')} value={720} max={1000}>72%</progress><span className={`${styles.badge} ${styles.successBadge}`}>Level 03 unlocked</span></div> : <p className={styles.pullQuote}>{direction === 'editorial' ? '“A place becomes a story when you stop to look.”' : 'Leave room for the unexpected.'}</p>}
          </div>
          <aside className={`${styles.specimen} ${styles.detailSpecimen}`} aria-labelledby={id('detail-title')}><p className={styles.eyebrow}>DETAIL PANEL / STATIC SPECIMEN</p><h3 id={id('detail-title')}>{system.destination}, at a glance</h3><dl className={styles.details}><div><dt>Duration</dt><dd>3 days / 2 nights</dd></div><div><dt>Season</dt><dd>{season}</dd></div><div><dt>Rhythm</dt><dd>{pace}</dd></div></dl><p className={styles.annotation}>Use Open trip details on the destination card to try the modal.</p></aside>
        </div>
      </section>

      <section className={styles.section} id="feedback" aria-labelledby={id('feedback-title')}>
        <div className={styles.sectionHeader}><span className={styles.sectionNumber}>07</span><div><p className={styles.eyebrow}>SYSTEM FEEDBACK</p><h2 id={id('feedback-title')}>{direction === 'arcade' ? 'Every state, unlocked.' : direction === 'editorial' ? 'Clear signals.' : 'Here when you need it.'}</h2></div></div>
        <div className={styles.feedbackGrid}>
          <div className={styles.feedback}><span className={styles.stateLabel}>Empty</span><h3>A blank itinerary</h3><p>No stops yet. Start with one place you’d like to see.</p><button className={`${styles.button} ${styles.secondary}`} onClick={() => document.getElementById(id('destination'))?.focus()}>Add a destination</button></div>
          <div className={styles.feedback} aria-busy="true"><span className={styles.stateLabel}>Loading specimen</span><h3>Gathering your places…</h3><div className={styles.skeleton} aria-hidden="true" /><div className={`${styles.skeleton} ${styles.skeletonShort}`} aria-hidden="true" /><p>Keep the layout stable while content arrives. Static loading demonstration.</p></div>
          <div className={`${styles.feedback} ${styles.errorFeedback}`}><span className={styles.stateLabel}>Error</span><h3>That place needs a name</h3><p>Error: enter a destination before saving your plan.</p><button className={`${styles.button} ${styles.secondary}`} onClick={() => document.getElementById(id('destination'))?.focus()}>Review destination</button></div>
          <div className={`${styles.feedback} ${styles.successFeedback}`}><span className={styles.stateLabel}>Success</span><h3>Your plan is saved</h3><p>Success: all three days are ready to explore. You can still change your mind.</p><span className={`${styles.badge} ${styles.successBadge}`}>Saved for this visit</span></div>
        </div><p className={styles.annotation}>Feedback always pairs color with a heading and explanation. Live form confirmations use a polite status announcement.</p>
      </section>
      <dialog ref={dialog} className={styles.dialog} aria-labelledby={id('modal-title')} aria-describedby={id('modal-description')} onClick={event => {
          if (event.target !== event.currentTarget) return;
          const bounds = event.currentTarget.getBoundingClientRect();
          if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.current?.close();
        }}>
        <div className={styles.modalHeader}><span className={styles.eyebrow}>TRIP DETAILS / {system.number}</span><button className={`${styles.button} ${styles.secondary}`} autoFocus onClick={() => dialog.current?.close()}>Close</button></div>
        <h2 id={id('modal-title')}>{system.trip}</h2><p id={id('modal-description')}>A three-day trip to {system.destination}. This dialog keeps keyboard focus inside while open. Press Escape or Close to return to the card.</p><dl className={styles.details}><div><dt>Season</dt><dd>{season}</dd></div><div><dt>Pace</dt><dd>{pace}</dd></div><div><dt>Interests</dt><dd>{filters.join(', ') || 'Open to anything'}</dd></div></dl><p>{notes || 'Leave a little room for the unexpected.'}</p>
      </dialog>
    </>
  );
}
