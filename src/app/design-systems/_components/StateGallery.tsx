'use client';

import { useState } from 'react';
import { systems } from './systems';
import type { Direction } from './systems';
import styles from './systems.module.css';

type Kind = 'primary' | 'secondary' | 'link' | 'input' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'switch' | 'tab' | 'chip';
const actionStates = ['Rest', 'Hover', 'Focus', 'Pressed', 'Disabled'];
const choiceStates = [...actionStates.slice(0, 4), 'Selected', 'Disabled'];
export const controlSpecimens: { kind: Kind; title: string; states: string[]; note: string }[] = [
  { kind: 'primary', title: 'Primary button', states: actionStates, note: 'Runs an action. Selection belongs to choice controls, not action buttons.' },
  { kind: 'secondary', title: 'Secondary button', states: actionStates, note: 'Supporting action; the outline remains visible in every available state.' },
  { kind: 'link', title: 'Link', states: actionStates, note: 'Navigates to the itinerary. Unavailable links have no destination and are excluded from the tab order.' },
  { kind: 'input', title: 'Text input', states: ['Rest', 'Hover', 'Focus', 'Disabled'], note: 'Editable destination. Pressing places the caret; text selection is native, not a persistent selected state.' },
  { kind: 'select', title: 'Select', states: ['Rest', 'Hover', 'Focus', 'Selected', 'Disabled'], note: 'Selected means a chosen option. Opening and pressing the native menu use the browser’s accessible interaction.' },
  { kind: 'textarea', title: 'Textarea', states: ['Rest', 'Hover', 'Focus', 'Disabled'], note: 'Editable travel notes. Caret and text selection follow native input behavior.' },
  { kind: 'checkbox', title: 'Checkbox', states: choiceStates, note: 'An independent preference; click or press Space to check and uncheck.' },
  { kind: 'radio', title: 'Radio', states: choiceStates, note: 'One pace per group. Each specimen has a second option; use arrow keys to change it.' },
  { kind: 'switch', title: 'Toggle', states: choiceStates, note: 'On/off preference. Disabled controls never change value.' },
  { kind: 'tab', title: 'Tabs', states: choiceStates, note: 'Selected identifies the displayed panel; use Left/Right, Home and End to switch.' },
  { kind: 'chip', title: 'Filter chip', states: choiceStates, note: 'Selected is a reversible filter choice, communicated by a checkmark and aria-pressed.' },
];

function Choice({ kind, selected, disabled, id }: { kind: Kind; selected: boolean; disabled: boolean; id: string }) {
  const [on, setOn] = useState(selected);
  if (kind === 'switch') return <button type="button" role="switch" aria-checked={on} disabled={disabled} className={styles.switch} onClick={() => setOn(!on)}><span className={styles.switchTrack} aria-hidden="true"><span /></span><span>Reminders {on ? 'On' : 'Off'}</span></button>;
  if (kind === 'chip') return <button type="button" className={styles.chip} aria-pressed={on} disabled={disabled} onClick={() => setOn(!on)}>{on && <span aria-hidden="true">✓ </span>}Nature</button>;
  if (kind === 'tab') return <><div className={styles.tabs} role="tablist" aria-label="Preview itinerary" onKeyDown={event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key) || disabled) return;
    event.preventDefault(); const next = event.key === 'Home' ? false : event.key === 'End' ? true : !on; setOn(next);
    document.getElementById(`${id}-tab-${Number(next)}`)?.focus();
  }}>{['Overview', 'Itinerary'].map((label, index) => <button key={label} type="button" id={`${id}-tab-${index}`} role="tab" aria-selected={on === !!index} aria-controls={`${id}-panel`} tabIndex={on === !!index ? 0 : -1} disabled={disabled} onClick={() => setOn(!!index)}>{label}</button>)}</div><p id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${Number(on)}`} className={styles.annotation}>{on ? '09:00 · Lakeside walk' : 'Three days · Unhurried'}</p></>;
  if (kind === 'radio') return <fieldset className={styles.previewRadio}><legend className={styles.annotation}>Travel pace</legend>{['Unhurried', 'Balanced'].map((label, index) => <label className={styles.check} key={label}><input type="radio" name={id} checked={on === !index} disabled={disabled} onChange={() => setOn(!index)} /><span>{label}</span></label>)}</fieldset>;
  return <label className={styles.check}><input type="checkbox" checked={on} disabled={disabled} onChange={e => setOn(e.target.checked)} /><span>Flexible dates</span></label>;
}

export function StateGallery({ direction }: { direction: Direction }) {
  const system = systems[direction];
  const [result, setResult] = useState('Try an enabled action specimen.');
  return <section id="control-states" className={styles.section} aria-labelledby={`${direction}-states-title`}>
    <div className={styles.sectionHeader}><span className={styles.sectionNumber}>05</span><div><p className={styles.eyebrow}>CONTROL STATES / BY COMPONENT</p><h2 id={`${direction}-states-title`}>A state has a purpose.</h2></div></div>
    <p className={styles.sectionIntro}>Each row uses its actual component. Hover, focus and pressed columns are visual references, marked by their captions; all enabled controls remain usable. Real pointer and keyboard interactions use the same treatments. A reference focus ring does not move keyboard focus.</p>
    <p role="status" className={styles.liveMessage}>{result}</p>
    <div className={styles.controlGallery}>{controlSpecimens.map(({kind, title, states, note}) => <section key={kind} className={styles.specimen} data-control={kind} aria-labelledby={`${direction}-${kind}-gallery-title`}><h3 id={`${direction}-${kind}-gallery-title`}>{title}</h3><p className={styles.annotation}>{note}</p><div className={styles.controlExamples}>{states.map(state => {
      const disabled = state === 'Disabled'; const selected = state === 'Selected'; const id = `${direction}-gallery-${kind}-${state.toLowerCase()}`;
      return <div key={state} className={styles.controlExample} data-preview={state.toLowerCase()}><p className={styles.stateLabel}>{state}</p><div className={styles.previewControl}>
        {kind === 'primary' || kind === 'secondary' ? <button type="button" className={`${styles.button} ${kind === 'secondary' ? styles.secondary : ''}`} disabled={disabled} onClick={() => setResult(`${title}: ${state} specimen activated. This preview does not save data.`)}>{kind === 'primary' ? 'Plan a day' : 'Review plan'}</button>
        : kind === 'link' ? disabled ? <span className={styles.textLink} aria-disabled="true">View itinerary</span> : <a href="#travel" className={styles.textLink}>View itinerary</a>
        : ['input','select','textarea'].includes(kind) ? <label className={styles.field} htmlFor={id}><span>{kind === 'input' ? 'Destination' : kind === 'select' ? 'Season' : 'Travel notes'}</span>{kind === 'input' ? <input id={id} defaultValue={system.destination} disabled={disabled} /> : kind === 'select' ? <select id={id} defaultValue={selected ? 'Autumn' : ''} disabled={disabled}><option value="">Choose a season</option><option>Autumn</option><option>Spring</option></select> : <textarea id={id} defaultValue={direction === 'arcade' ? 'Find the lantern lane before sunset.' : direction === 'editorial' ? 'Record a harbor detail in the notebook.' : 'Leave an afternoon open.'} rows={2} disabled={disabled} />}</label>
        : <Choice kind={kind} selected={selected} disabled={disabled} id={id} />}
      </div></div>;
    })}</div></section>)}</div>
    <p className={styles.annotation}>Cards, list rows and badges are content containers, not buttons: see Travel patterns for actual content and status. The card’s action has button states. A modal has open/closed states, focus containment and a return to its trigger; try Open trip details. Success describes an outcome, not a selected control.</p>
  </section>;
}
