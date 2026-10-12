'use client';

import { useRef, useState } from 'react';
import { questCheckpoints, questProgress, toggleFilter } from './behavior';
import styles from './systems.module.css';

export function QuestPatterns() {
  const [completed, setCompleted] = useState<string[]>([]);
  const [entered, setEntered] = useState(false);
  const progress = questProgress(completed);
  return <div className={styles.directionPatterns} aria-label="Quest progression specimens">
    <div className={styles.specimen}><p className={styles.eyebrow}>QUEST / EXPLORE SHIBUYA</p><h3>A night of discoveries</h3><p>Three small missions. Complete the route to unlock the listening-room bonus.</p>
      <fieldset className={styles.radioGroup}><legend>Quest checkpoints</legend>{questCheckpoints.map(checkpoint => <label className={styles.check} key={checkpoint.id}><input type="checkbox" checked={completed.includes(checkpoint.id)} onChange={() => { setCompleted(toggleFilter(completed, checkpoint.id)); setEntered(false); }} /><span>{checkpoint.label}<small>+{checkpoint.reward} XP · {completed.includes(checkpoint.id) ? 'Completed' : 'Available'}</small></span></label>)}</fieldset>
      <label htmlFor="arcade-quest-xp">EXPLORER XP / {progress.xp} OF 1,000</label><progress id="arcade-quest-xp" value={progress.xp} max={1000}>{progress.xp / 10}%</progress>
      <p role="status">{progress.completed} of 3 checkpoints · {progress.unlocked ? 'Level 05 unlocked' : `${1000 - progress.xp} XP to Level 05`}</p>
      <button type="button" className={`${styles.button} ${styles.secondary}`} onClick={() => { setCompleted([]); setEntered(false); }}>Reset quest</button>
    </div>
    <div className={styles.specimen}><p className={styles.eyebrow}>ACHIEVEMENT / BONUS EXPERIENCE</p><h3>{progress.unlocked ? 'Night listener earned' : 'Night listener locked'}</h3><p>{progress.unlocked ? 'All three discoveries are complete. Your listening-room invitation is ready.' : 'Earn 280 XP across this route. A clear requirement comes before a reward.'}</p><span className={`${styles.badge} ${progress.unlocked ? styles.successBadge : ''}`}>{progress.unlocked ? 'Achievement earned' : '3 checkpoints required'}</span>
      <button type="button" className={styles.button} disabled={!progress.unlocked || entered} onClick={() => setEntered(true)}>Enter bonus experience</button>
      <p role="status">{entered ? 'Bonus experience entered' : progress.unlocked ? 'Available to enter' : 'Locked until the route is complete'}</p>
      <p className={styles.annotation}>A local progression specimen. No location tracking, real admission, or account is involved.</p>
    </div>
  </div>;
}

const essays = [
  { title: 'The harbor at first light', page: '18', author: 'M. Laurent', chapters: [
    'Before the shops open, the quay belongs to people carrying crates. Follow the harbor edge: the working waterfront is a better introduction than the souvenir stalls.',
    'At the steps, pause for the boats. Their wakes turn the painted houses into stripes of color. Leave enough space in the itinerary to watch them settle.',
    'Walk uphill as the town wakes. Look back from the terrace; the same harbor now reads as a map of arrivals and departures.',
  ] },
  { title: 'A notebook for the coast', page: '34', author: 'L. Chen', chapters: [
    'Start with one observation: the sound of the harbor, the shade of a wall, or the hour the bakery opens. A useful notebook begins with something specific.',
    'Keep practical notes beside the impressions. Mark the ferry departure and leave a margin for the walk back. Facts make room for exploration.',
    'Before leaving, read the page again. Add one detail you missed and one place you would return to. The notebook becomes a route for another visit.',
  ] },
];

export function EditorialPatterns() {
  const [essay, setEssay] = useState(0);
  const [chapter, setChapter] = useState(0);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const title = useRef<HTMLHeadingElement>(null);
  const current = essays[essay];
  return <div className={styles.directionPatterns} aria-label="Publication reading specimens">
    <nav className={styles.specimen} aria-label="Issue contents"><p className={styles.eyebrow}>ELSEWHERE / ISSUE 08</p><h3>Contents</h3><ol className={styles.contentsList}>{essays.map((item, index) => <li key={item.title}><button className={styles.contentsAction} aria-label={`Read ${item.title}`} aria-current={essay === index ? 'true' : undefined} onClick={() => { setEssay(index); setChapter(0); title.current?.focus(); }}><span>{String(index + 1).padStart(2, '0')}</span><strong>{item.title}</strong><span>{item.page}</span></button></li>)}</ol><p className={styles.annotation}>A numbered index gives way to a focused reading column. Bookmarks last for this visit.</p></nav>
    <article className={`${styles.specimen} ${styles.readingColumn}`} aria-labelledby="editorial-essay-title"><p className={styles.eyebrow}>FIELD ESSAY / LIGURIA, ITALY</p><h3 id="editorial-essay-title" ref={title} tabIndex={-1}>{current.title}</h3><p className={styles.byline}>Words by {current.author} · 3 short chapters</p><p className={styles.essayBody}>{current.chapters[chapter]}</p><p id="editorial-reading-position" role="status">Chapter {chapter + 1} of 3 · {Math.round((chapter + 1) / 3 * 100)}% read</p><progress value={chapter + 1} max={3} aria-label="Essay reading progress" />
      <div className={styles.buttonRow}><button className={`${styles.button} ${styles.secondary}`} disabled={chapter === 0} onClick={() => setChapter(chapter - 1)}>Previous chapter</button><button className={styles.button} disabled={chapter === 2} onClick={() => setChapter(chapter + 1)}>Next chapter</button><button className={`${styles.button} ${styles.secondary}`} aria-pressed={bookmarks.includes(essay)} onClick={() => setBookmarks(bookmarks.includes(essay) ? bookmarks.filter(index => index !== essay) : [...bookmarks, essay])}>Bookmark essay</button></div>
      <p role="status">{bookmarks.includes(essay) ? 'Bookmarked for this visit' : 'Not bookmarked'}</p>
    </article>
  </div>;
}
