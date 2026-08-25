import { useEffect, useRef, useState } from 'react';

/* ── Scroll reveal ── */
export function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.reveal');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  });
}

/* ── Spotlight that follows cursor inside a container ── */
export function useSpotlight() {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${((e.clientX - rect.left) / rect.width) * 100}%`);
      el.style.setProperty('--my', `${((e.clientY - rect.top) / rect.height) * 100}%`);
    };
    el.addEventListener('mousemove', handleMove);
    return () => el.removeEventListener('mousemove', handleMove);
  }, []);
  return ref;
}

/* ── 3D tilt for a card based on cursor position ── */
export function useTilt(max = 6) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fine = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: fine)').matches;
    if (!fine) return;
    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `perspective(1600px) rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * max).toFixed(2)}deg)`;
    };
    const handleLeave = () => {
      el.style.transform = 'perspective(1600px) rotateX(0deg) rotateY(0deg)';
    };
    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', handleLeave);
    return () => {
      el.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseleave', handleLeave);
    };
  }, [max]);
  return ref;
}

/* ── Active nav section ── */
export function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string>('');
  useEffect(() => {
    const handle = () => {
      const scroll = window.scrollY + 140;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (scroll >= el.offsetTop && scroll < el.offsetTop + el.offsetHeight) {
          setActive(id);
          return;
        }
      }
      setActive('');
    };
    window.addEventListener('scroll', handle, { passive: true });
    handle();
    return () => window.removeEventListener('scroll', handle);
  }, [ids]);
  return active;
}

/* ── Sticky scroll progress (0 → 1) for pinned sections ── */
export function useStickyProgress() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const compute = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), Math.max(total, 1));
      const v = total > 0 ? scrolled / total : 0;
      setProgress(Number.isFinite(v) ? Math.min(Math.max(v, 0), 1) : 0);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(compute);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    compute();
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return { ref, progress };
}

/* ── Body scroll lock (for modals) ── */
export function useBodyLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [locked]);
}
