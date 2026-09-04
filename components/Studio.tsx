'use client';

import { AdaptiveDpr, PerformanceMonitor, useProgress } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import type { Outfit } from './Avatar';
import StudioScene, { ROOMS } from './StudioScene';

const OUTFITS: { id: Outfit; label: string }[] = [
  { id: 'jeans', label: 'Jeans' },
  { id: 'black', label: 'Black' },
  { id: 'blue', label: 'Blue' },
  { id: 'brown', label: 'Brown' },
];

function Progress() {
  const { active, progress } = useProgress();
  if (!active && progress === 100) return null;
  return <div className="loader" role="status" aria-live="polite"><span>Building Kiki World</span><strong>{Math.round(progress)}%</strong><div><i style={{ width: `${progress}%` }} /></div></div>;
}

export default function Studio() {
  const [active, setActive] = useState(0); const [quality, setQuality] = useState<'high' | 'low'>('high'); const [reducedMotion, setReducedMotion] = useState(false); const [outfit, setOutfit] = useState<Outfit>('jeans');
  const move = useCallback((direction: number) => setActive((current) => Math.max(0, Math.min(ROOMS.length - 1, current + direction))), []);
  const wheelDelta = useRef(0); const lastWheelStep = useRef(0); const touchStart = useRef<number>();
  const onWheel = useCallback((event: React.WheelEvent) => {
    wheelDelta.current += event.deltaY;
    const now = performance.now();
    if (Math.abs(wheelDelta.current) < 45 || now - lastWheelStep.current < 450) return;
    move(wheelDelta.current > 0 ? 1 : -1); wheelDelta.current = 0; lastWheelStep.current = now;
  }, [move]);
  const onTouchStart = useCallback((event: React.TouchEvent) => { touchStart.current = event.touches[0]?.clientY; }, []);
  const onTouchEnd = useCallback((event: React.TouchEvent) => {
    if (touchStart.current === undefined) return;
    const delta = touchStart.current - (event.changedTouches[0]?.clientY ?? touchStart.current);
    if (Math.abs(delta) > 45) move(delta > 0 ? 1 : -1);
    touchStart.current = undefined;
  }, [move]);
  useEffect(() => { const media = window.matchMedia('(prefers-reduced-motion: reduce)'); const sync = () => setReducedMotion(media.matches); sync(); media.addEventListener('change', sync); return () => media.removeEventListener('change', sync); }, []);
  useEffect(() => { if (window.matchMedia('(max-width: 700px), (max-height: 500px)').matches) setQuality('low'); }, []);
  useEffect(() => { const onKeyDown = (event: KeyboardEvent) => { if (['ArrowRight', 'ArrowDown', 'd', 'D'].includes(event.key)) move(1); if (['ArrowLeft', 'ArrowUp', 'a', 'A'].includes(event.key)) move(-1); const room = Number(event.key) - 1; if (room >= 0 && room < ROOMS.length) setActive(room); }; window.addEventListener('keydown', onKeyDown); return () => window.removeEventListener('keydown', onKeyDown); }, [move]);
  return <main className="studio-shell" onWheel={onWheel} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
    <header className="studio-header"><div><img className="studio-logo" src="/logo.svg" alt="Kiki World" /><h1>Move through the rooms.</h1></div><button onClick={() => setQuality((value) => value === 'high' ? 'low' : 'high')} aria-label="Toggle performance quality">{quality === 'high' ? 'High detail' : 'Performance'}</button></header>
    <div className="canvas-wrap"><Canvas shadows={quality === 'high'} dpr={quality === 'high' ? [1, 1.75] : 1} camera={{ position: [-2.6, 1.25, 5.4], fov: 48 }} gl={{ antialias: quality === 'high', powerPreference: 'high-performance' }}>
      <PerformanceMonitor onDecline={() => setQuality('low')} flipflops={2}><Suspense fallback={null}><StudioScene active={active} onSelect={setActive} outfit={outfit} reducedMotion={reducedMotion} /></Suspense><AdaptiveDpr pixelated /></PerformanceMonitor>
    </Canvas><Progress /></div>
    <section className="story-card" aria-live="polite"><span>0{active + 1} / 0{ROOMS.length}</span><h2>{ROOMS[active].title}</h2><p>{ROOMS[active].short}</p></section>
    <fieldset className="outfit-picker"><legend>Outfit</legend>{OUTFITS.map((option) => <button key={option.id} className={`outfit-${option.id} ${outfit === option.id ? 'selected' : ''}`} onClick={() => setOutfit(option.id)} aria-pressed={outfit === option.id}><i aria-hidden /><span>{option.label}</span></button>)}</fieldset>
    <div className="scroll-progress" aria-hidden>{ROOMS.map((room, index) => <i key={room.title} className={index === active ? 'active' : ''} />)}</div>
    <nav className="controls" aria-label="Kiki World rooms"><button onClick={() => move(-1)} disabled={active === 0} aria-label="Previous room">←</button>{ROOMS.map((room, index) => <button key={room.title} className={index === active ? 'selected' : ''} onClick={() => setActive(index)} aria-current={index === active ? 'step' : undefined}>{room.title}</button>)}<button onClick={() => move(1)} disabled={active === ROOMS.length - 1} aria-label="Next room">→</button></nav>
    <footer className="studio-footer">
      <p className="hint">Scroll or swipe · use arrow keys or A / D · tap a room</p>
      <p className="copyright"><span>© {new Date().getFullYear()} Kitty Kio</span><span className="footer-stack">Next.js · React Three Fiber · Three.js</span></p>
    </footer>
  </main>;
}
