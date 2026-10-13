'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import type { Direction } from './systems';
import { systems } from './systems';
import { nextTab, toggleFilter, validateDestination } from './behavior';
import styles from './systems.module.css';
import { StateGallery } from './StateGallery';
import { FeedbackScenario } from './FeedbackScenario';
import { EditorialPatterns, QuestPatterns } from './DirectionPatterns';

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
  const [remindersDisabled, setRemindersDisabled] = useState(false);
  const [sampleSeason, setSampleSeason] = useState('');
  const [sampleNotes, setSampleNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const loadingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openButton = useRef<HTMLButtonElement>(null);
  const restoreButton = useRef<HTMLButtonElement>(null);
  useEffect(() => () => { if (loadingTimer.current) clearTimeout(loadingTimer.current); }, []);
  const dialog = useRef<HTMLDialogElement>(null);
  const tabs = direction === 'arcade' ? ['World briefing', 'Quest log', 'Notes'] : direction === 'editorial' ? ['Issue overview', 'Field itinerary', 'Notebook'] : ['Overview', 'Itinerary', 'Notes'];
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
          <div className={styles.specimen}><h3>Buttons &amp; links</h3><p className={styles.annotation}>Component library: <a href="#forms" className={styles.textLink}>Inputs &amp; choices</a> · <a href="#travel" className={styles.textLink}>Cards, lists, badges &amp; modal</a> · <a href="#control-states" className={styles.textLink}>Component states</a></p><p className={styles.annotation}>Live controls. Actions report their result below.</p><div className={styles.buttonRow}>
            <button className={styles.button} onClick={() => { setMessage('A new plan is ready. Add a destination in the form below.'); document.getElementById(id('destination'))?.focus(); }}>{actionLabel}</button>
            <button className={`${styles.button} ${styles.secondary}`} onClick={() => { setDestination(''); setNotes(''); setSeason('Autumn'); setError(null); setMessage('Form reset. Your next journey starts with a blank page.'); }}>Reset form</button>
            <button className={`${styles.button} ${styles.destructive}`} disabled={removed} onClick={() => { setRemoved(true); setMessage('Example trip removed. Use Restore trip to bring it back.'); requestAnimationFrame(() => restoreButton.current?.focus()); }}>Remove trip</button>
          </div><a className={styles.textLink} href={`/${'mood-boards'}/${direction}`}>Explore the approved mood board <span aria-hidden="true">↗</span></a><p className={styles.annotation}>Primary: next step. Secondary: supporting action. Destructive: explicit removal.</p></div>
          <div className={styles.specimen}><h3>Control state atlas</h3><p className={styles.annotation}>Action states use Explore. Selection uses a Nature filter chip; completion uses a separate success badge.</p><div className={styles.stateMatrix}>
            {['Rest', 'Hover', 'Focus', 'Pressed', 'Selected', 'Disabled'].map(state => <div key={state}><span className={styles.stateLabel}>{state}</span><span className={`${state === 'Selected' ? styles.chip : styles.button} ${styles.stateSample}`} data-state={state.toLowerCase()}>{state === 'Selected' ? 'Nature ✓' : 'Explore'}</span></div>)}
          </div></div>
        </div>
        <p className={styles.liveMessage} role="status" aria-live="polite">{message || 'Try an action, or save a destination below. Changes last for this visit.'}</p>
      </section>

      <section className={styles.section} id="forms" aria-labelledby={id('forms-title')}>
        <div className={styles.sectionHeader}><span className={styles.sectionNumber}>04B</span><div><p className={styles.eyebrow}>COMPONENTS / INPUT &amp; CHOICE</p><h2 id={id('forms-title')}>{direction === 'arcade' ? 'Configure your run.' : direction === 'editorial' ? 'The details matter.' : 'Make room for your plans.'}</h2></div></div>
        <div className={styles.formLayout}>
          <form className={styles.specimen} onSubmit={submit} noValidate>
            <h3>{direction === 'arcade' ? 'Quest briefing' : direction === 'editorial' ? 'Notebook entry' : 'Trip notes'}</h3><p className={styles.annotation}>A working form with validation and a local confirmation.</p>
            <label className={styles.field} htmlFor={id('destination')}><span>Destination <small>Required</small></span><input id={id('destination')} value={destination} onChange={event => { setDestination(event.target.value); if (error) setError(null); }} placeholder={`Try ${system.destination}`} required aria-invalid={!!error} aria-describedby={id('destination-help')} /></label>
            <p id={id('destination-help')} className={error ? styles.fieldError : styles.annotation}>{error || 'Enter a place with at least two characters.'}</p>
            <label className={styles.field} htmlFor={id('notes')}><span>Travel notes</span><textarea id={id('notes')} value={notes} onChange={event => setNotes(event.target.value)} placeholder={direction === 'arcade' ? 'Describe a checkpoint worth finding' : direction === 'editorial' ? 'Record an observation, not just a slogan' : 'What would you like to discover?'} rows={3} /></label>
            <label className={styles.field} htmlFor={id('season')}><span>Season</span><select id={id('season')} value={season} onChange={event => setSeason(event.target.value)}>{['Spring', 'Summer', 'Autumn', 'Winter'].map(value => <option key={value}>{value}</option>)}</select></label>
            <button type="submit" className={styles.button}>{actionLabel}</button>
          </form>
          <div className={styles.choiceStack}>
            <div className={styles.specimen}><h3>{direction === 'arcade' ? 'Tune the run' : direction === 'editorial' ? 'Field notebook preferences' : 'Set your rhythm'}</h3>
              <label className={styles.check}><input type="checkbox" checked={flexible} onChange={event => setFlexible(event.target.checked)} /><span>Keep my dates flexible</span></label>
              <label className={styles.check}><input type="checkbox" disabled /><span>Shared trip access <small>Unavailable in this demo</small></span></label>
              <fieldset className={styles.radioGroup}><legend>Travel pace</legend>{['Unhurried', 'Balanced', 'Full days'].map(value => <label className={styles.check} key={value}><input type="radio" name={id('pace')} value={value} checked={pace === value} onChange={() => setPace(value)} /><span>{value}</span></label>)}</fieldset>
              <button type="button" role="switch" aria-checked={notifications} className={styles.switch} disabled={remindersDisabled} onClick={() => setNotifications(!notifications)}><span className={styles.switchTrack} aria-hidden="true"><span /></span><span>Trip reminders <strong>{notifications ? 'On' : 'Off'}</strong></span></button>
              <p className={styles.annotation}>Preference only; this demo does not send notifications.</p><label className={styles.check}><input type="checkbox" checked={remindersDisabled} onChange={event => setRemindersDisabled(event.target.checked)} /><span>Disable reminder control</span></label>
            </div>
            <div className={styles.specimen}><h3>Field states</h3><label className={styles.field} htmlFor={id('invalid')}><span>Error specimen</span><input id={id('invalid')} aria-invalid="true" aria-describedby={id('invalid-help')} readOnly value="" placeholder="Destination missing" /></label><p className={styles.fieldError} id={id('invalid-help')}>Error: enter a destination.</p><label className={styles.field} htmlFor={id('disabled')}><span>Disabled specimen</span><input id={id('disabled')} disabled value="Booking reference unavailable" readOnly /></label><label className={styles.field} htmlFor={id('sample-select')}><span>Required season specimen</span><select id={id('sample-select')} value={sampleSeason} onChange={event => setSampleSeason(event.target.value)} aria-invalid={!sampleSeason} aria-describedby={id('sample-select-help')}><option value="">Choose a season</option><option>Autumn</option><option>Spring</option></select></label><p id={id('sample-select-help')} className={!sampleSeason ? styles.fieldError : styles.annotation}>{sampleSeason ? 'Season selected.' : 'Choose a season to continue.'}</p>
              <label className={styles.field} htmlFor={id('sample-notes')}><span>Required note specimen</span><textarea id={id('sample-notes')} value={sampleNotes} onChange={event => setSampleNotes(event.target.value)} aria-invalid={!sampleNotes.trim()} aria-describedby={id('sample-notes-help')} rows={2} /></label><p id={id('sample-notes-help')} className={!sampleNotes.trim() ? styles.fieldError : styles.annotation}>{sampleNotes.trim() ? 'Note ready.' : 'Add a short note to continue.'}</p><p className={styles.annotation}>Editable select and textarea errors clear when corrected. The input above is a readonly error reference; the main form validates on submission.</p></div>
          </div>
        </div>
      </section>

      <StateGallery direction={direction} />
      <section className={styles.section} id="travel" aria-labelledby={id('travel-title')}>
        <div className={styles.sectionHeader}><span className={styles.sectionNumber}>04C</span><div><p className={styles.eyebrow}>COMPONENTS / TRAVEL PATTERNS</p><h2 id={id('travel-title')}>{direction === 'arcade' ? 'Your quest inventory.' : direction === 'editorial' ? 'Stories, indexed.' : 'A day worth keeping.'}</h2></div></div>
        <div className={styles.travelLayout}>
          {removed ? <div className={styles.specimen}><p className={styles.eyebrow}>REMOVED / UNDO AVAILABLE</p><h3>Example trip removed</h3><p>The destination card is no longer in this collection. Restore it to keep the original details.</p><button ref={restoreButton} className={styles.button} onClick={() => { setRemoved(false); setMessage('Example trip restored with its original details.'); requestAnimationFrame(() => openButton.current?.focus()); }}>Restore trip</button></div> : <div className={styles.destinationCard}>
            <div className={styles.cardImage}><Image src={system.image} alt={system.imageAlt} fill sizes="(max-width: 640px) 100vw, 45vw" /><span className={styles.imageLabel}>{direction === 'arcade' ? 'WORLD 03 / AVAILABLE' : direction === 'editorial' ? 'DESTINATION ESSAY / 08' : 'A PLACE TO PAUSE'}</span></div>
            <div className={styles.cardBody}><span className={styles.badge}>{direction === 'arcade' ? 'Quest available' : 'Saved place'}</span><h3>{system.trip}</h3><p>{direction === 'arcade' ? 'Three neighborhoods. Four street-food stops. One city full of side quests.' : direction === 'editorial' ? 'A harbor in three chapters: working boats, painted houses, and the climb above the quay.' : 'A lake, a quiet path, and an afternoon with nothing on the agenda.'}</p><button ref={openButton} className={styles.button} onClick={() => dialog.current?.showModal()}>Open trip details</button></div>
          </div>}
          <div className={styles.specimen}>
            <h3>Tabs &amp; filter chips</h3><div className={styles.tabs} role="tablist" aria-label="Trip information">{tabs.map((label, index) => <button key={label} id={id(`tab-${index}`)} role="tab" aria-selected={tab === index} aria-controls={id('tab-panel')} tabIndex={tab === index ? 0 : -1} onClick={() => setTab(index)} onKeyDown={tabKey}>{label}</button>)}</div>
            <div id={id('tab-panel')} role="tabpanel" aria-labelledby={id(`tab-${tab}`)} tabIndex={0} className={styles.tabPanel}>
              {tab === 0 ? <><p>{system.destination} · 3 days · {season}</p><p>{flexible ? 'Flexible dates' : 'Fixed dates'} / {pace} pace</p></> : tab === 1 ? <ol className={styles.list}><li><time>09:00</time><span>{direction === 'arcade' ? 'Visit the market · +100 XP' : direction === 'editorial' ? 'Observe the working harbor' : 'Explore the lakeside path'}</span><span className={styles.badge}>Planned</span></li><li><time>12:30</time><span>{direction === 'arcade' ? 'Find the lantern lane · +80 XP' : direction === 'editorial' ? 'Record a detail in the notebook' : 'Local lunch stop'}</span><span className={`${styles.badge} ${styles.successBadge}`}>Confirmed</span></li><li><time>16:00</time><span>{direction === 'arcade' ? 'Hear a street performance · +100 XP' : direction === 'editorial' ? 'Return to the quay for the evening light' : 'A little room to wander'}</span><span className={`${styles.badge} ${styles.warningBadge}`}>Flexible</span></li></ol> : <p>{notes || 'No notes yet. Add your ideas in the travel notes field.'}</p>}
            </div>
            <p className={styles.annotation}>Tabs: use ← / →, Home and End to move and select.</p>
            <fieldset className={styles.filterGroup}><legend>Filter interests</legend><div className={styles.chips}>{['Nature', 'Culture', 'Food', 'Nightlife'].map(value => <button key={value} type="button" aria-pressed={filters.includes(value)} className={styles.chip} onClick={() => setFilters(toggleFilter(filters, value))}>{filters.includes(value) && <span aria-hidden="true">✓ </span>}{value}</button>)}</div><p role="status" className={styles.annotation}>{filters.length ? `Showing: ${filters.join(', ')}` : 'No interests selected. Select a chip to refine the trip.'}</p><ul className={styles.filteredList}>{filters.map(value => <li key={value}>{value}: {({ Nature: 'Coastal path', Culture: 'Neighborhood gallery', Food: 'Local market', Nightlife: 'Evening music' })[value]}</li>)}</ul></fieldset>
          </div>
          <div className={`${styles.specimen} ${styles.listSpecimen}`}><h3>List rows &amp; status badges</h3><ul className={styles.list}><li><span className={styles.rowIndex}>01</span><span>Arrival &amp; a first look<small>Day one · 09:00</small></span><span className={`${styles.badge} ${styles.successBadge}`}>Confirmed</span></li><li><span className={styles.rowIndex}>02</span><span>Take the scenic route<small>Day two · open afternoon</small></span><span className={`${styles.badge} ${styles.warningBadge}`}>Flexible</span></li><li><span className={styles.rowIndex}>03</span><span>Return journey<small>Day three · review timing</small></span><span className={`${styles.badge} ${styles.errorBadge}`}>Needs review</span></li></ul>
            <p className={styles.pullQuote}>{direction === 'arcade' ? 'One discovery earns the next invitation.' : direction === 'editorial' ? 'Read the place through details, not headlines alone.' : 'Leave room for the unexpected.'}</p>
          </div>
          <aside className={`${styles.specimen} ${styles.detailSpecimen}`} aria-labelledby={id('detail-title')}><p className={styles.eyebrow}>DETAIL PANEL / STATIC SPECIMEN</p><h3 id={id('detail-title')}>{system.destination}, at a glance</h3><dl className={styles.details}><div><dt>Duration</dt><dd>3 days / 2 nights</dd></div><div><dt>Season</dt><dd>{season}</dd></div><div><dt>Rhythm</dt><dd>{pace}</dd></div></dl><p className={styles.annotation}>Use Open trip details on the destination card to try the modal.</p></aside>
        </div>
        {direction === 'arcade' ? <QuestPatterns /> : direction === 'editorial' ? <EditorialPatterns /> : <p className={styles.annotation}>Reading-first planning: keep the itinerary in one clear column, with budget and essentials grouped beside it. At narrow widths, stack these groups without reducing body copy.</p>}
      </section>

      <section className={styles.section} id="feedback" aria-labelledby={id('feedback-title')}>
        <div className={styles.sectionHeader}><span className={styles.sectionNumber}>06</span><div><p className={styles.eyebrow}>SYSTEM FEEDBACK</p><h2 id={id('feedback-title')}>{direction === 'arcade' ? 'Every state, unlocked.' : direction === 'editorial' ? 'Clear signals.' : 'Here when you need it.'}</h2></div></div>
        <div className={styles.feedbackGrid}>
          <div className={styles.feedback}><span className={styles.stateLabel}>Empty</span><h3>A blank itinerary</h3><p>No stops yet. Start with one place you’d like to see.</p><button className={`${styles.button} ${styles.secondary}`} onClick={() => document.getElementById(id('destination'))?.focus()}>Add a destination</button></div>
          <div className={styles.feedback}><span className={styles.stateLabel}>Loading specimen</span><div className={styles.loadingPreview} aria-busy={loading}>{loading ? <><h3>Preparing a place preview…</h3><div className={styles.skeleton} aria-hidden="true" /><div className={`${styles.skeleton} ${styles.skeletonShort}`} aria-hidden="true" /></> : <><h3>{system.destination}</h3><p>Place preview · 3 days / 2 nights</p></>}</div><button className={`${styles.button} ${styles.secondary}`} disabled={loading} onClick={() => { setLoading(true); setLoaded(false); loadingTimer.current = setTimeout(() => { setLoading(false); setLoaded(true); }, 700); }}>{loading ? 'Preparing preview…' : 'Preview loading'}</button><p role="status">{loaded ? 'Preview ready. No network request was made.' : 'Local loading simulation: reserve space and disable the pending action.'}</p></div>
          <div className={`${styles.feedback} ${styles.errorFeedback}`}><span className={styles.stateLabel}>Error</span><h3>That place needs a name</h3><p>Error: enter a destination before saving your plan.</p><button className={`${styles.button} ${styles.secondary}`} onClick={() => document.getElementById(id('destination'))?.focus()}>Review destination</button></div>
          <div className={`${styles.feedback} ${styles.successFeedback}`}><span className={styles.stateLabel}>Success</span><h3>Your plan is saved</h3><p>Success: all three days are ready to explore. You can still change your mind.</p><span className={`${styles.badge} ${styles.successBadge}`}>Saved for this visit</span></div>
        </div><FeedbackScenario direction={direction} /><p className={styles.annotation}>Feedback always pairs color with a heading and explanation. Live form confirmations use a polite status announcement.</p>
      </section>
      <dialog ref={dialog} onKeyDown={event => {
        if (event.key !== 'Tab') return;
        const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]'));
        const first = controls[0]; const last = controls[controls.length - 1];
        if (!first) { event.preventDefault(); return; }
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }} className={styles.dialog} aria-labelledby={id('modal-title')} aria-describedby={id('modal-description')} onClick={event => {
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
