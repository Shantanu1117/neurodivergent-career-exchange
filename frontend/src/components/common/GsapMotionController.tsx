import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAccessibility } from '../../context/AccessibilityContext.js';

gsap.registerPlugin(ScrollTrigger);

export const GsapMotionController: React.FC = () => {
  const { settings } = useAccessibility();
  const location = useLocation();

  const progressBarRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);

  const isMotionAllowed =
    !settings.reducedMotion && !settings.disableAnimations && !settings.focusMode;

  // 1. Global Mouse-Move Spotlight, Magnetic Cursor Ring, 3D Card Tilt & Magnetic Buttons
  useEffect(() => {
    if (!isMotionAllowed) {
      // Ensure any tilted elements are reset when motion is disabled
      gsap.set('[data-gsap-tilt], [data-gsap-magnetic]', {
        clearProps: 'transform',
      });
      return;
    }

    const spotlight = spotlightRef.current;
    const cursorDot = cursorDotRef.current;

    const quickSpotX = spotlight
      ? gsap.quickTo(spotlight, 'x', { duration: 0.45, ease: 'power3.out' })
      : null;
    const quickSpotY = spotlight
      ? gsap.quickTo(spotlight, 'y', { duration: 0.45, ease: 'power3.out' })
      : null;

    const quickDotX = cursorDot
      ? gsap.quickTo(cursorDot, 'x', { duration: 0.16, ease: 'power2.out' })
      : null;
    const quickDotY = cursorDot
      ? gsap.quickTo(cursorDot, 'y', { duration: 0.16, ease: 'power2.out' })
      : null;

    let activeTiltEl: HTMLElement | null = null;
    let activeMagneticEl: HTMLElement | null = null;

    const handleWindowMouseMove = (e: MouseEvent) => {
      if (quickSpotX && quickSpotY) {
        quickSpotX(e.clientX - 220);
        quickSpotY(e.clientY - 220);
      }
      if (quickDotX && quickDotY) {
        quickDotX(e.clientX - 14);
        quickDotY(e.clientY - 14);
      }

      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Cursor ring expansion on interactive controls
      const isInteractive = Boolean(
        target.closest('a, button, input, select, textarea, [data-gsap-tilt]')
      );
      if (cursorDot) {
        gsap.to(cursorDot, {
          scale: isInteractive ? 1.45 : 1,
          opacity: isInteractive ? 0.85 : 0.45,
          duration: 0.2,
          overwrite: 'auto',
        });
      }

      // 3D Perspective Tilt on [data-gsap-tilt] cards
      const tiltEl = target.closest('[data-gsap-tilt]') as HTMLElement | null;
      if (activeTiltEl && activeTiltEl !== tiltEl) {
        gsap.to(activeTiltEl, {
          rotateX: 0,
          rotateY: 0,
          y: 0,
          scale: 1,
          duration: 0.55,
          ease: 'power3.out',
          overwrite: 'auto',
        });
        activeTiltEl = null;
      }

      if (tiltEl) {
        activeTiltEl = tiltEl;
        const rect = tiltEl.getBoundingClientRect();
        const relX = e.clientX - rect.left;
        const relY = e.clientY - rect.top;
        const normX = relX / rect.width - 0.5;
        const normY = relY / rect.height - 0.5;
        const intensity = Number(tiltEl.getAttribute('data-gsap-tilt') || '7');

        tiltEl.style.setProperty('--mouse-x', `${relX}px`);
        tiltEl.style.setProperty('--mouse-y', `${relY}px`);

        gsap.to(tiltEl, {
          rotateY: normX * intensity,
          rotateX: -normY * intensity,
          y: -4,
          scale: 1.01,
          transformPerspective: 950,
          transformOrigin: 'center center',
          duration: 0.35,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      }

      // Magnetic pull on [data-gsap-magnetic] buttons/CTAs
      const magneticEl = target.closest('[data-gsap-magnetic]') as HTMLElement | null;
      if (activeMagneticEl && activeMagneticEl !== magneticEl) {
        gsap.to(activeMagneticEl, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: 'elastic.out(1, 0.5)',
          overwrite: 'auto',
        });
        activeMagneticEl = null;
      }

      if (magneticEl) {
        activeMagneticEl = magneticEl;
        const rect = magneticEl.getBoundingClientRect();
        const deltaX = e.clientX - (rect.left + rect.width / 2);
        const deltaY = e.clientY - (rect.top + rect.height / 2);
        gsap.to(magneticEl, {
          x: deltaX * 0.2,
          y: deltaY * 0.2,
          duration: 0.25,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      }
    };

    const handleWindowMouseLeave = () => {
      if (activeTiltEl) {
        gsap.to(activeTiltEl, {
          rotateX: 0,
          rotateY: 0,
          y: 0,
          scale: 1,
          duration: 0.5,
          ease: 'power3.out',
        });
        activeTiltEl = null;
      }
      if (activeMagneticEl) {
        gsap.to(activeMagneticEl, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: 'power3.out',
        });
        activeMagneticEl = null;
      }
    };

    window.addEventListener('mousemove', handleWindowMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleWindowMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      document.removeEventListener('mouseleave', handleWindowMouseLeave);
    };
  }, [isMotionAllowed]);

  // 2. ScrollTrigger Animations on Route Change
  useEffect(() => {
    if (!isMotionAllowed) {
      ScrollTrigger.getAll().forEach((t) => t.kill());
      gsap.set('[data-gsap], [data-gsap-item]', { clearProps: 'all' });
      return;
    }

    const timer = window.setTimeout(() => {
      const ctx = gsap.context(() => {
        // Top Scroll Progress Bar
        if (progressBarRef.current) {
          gsap.fromTo(
            progressBarRef.current,
            { scaleX: 0 },
            {
              scaleX: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: document.documentElement,
                start: 'top top',
                end: 'bottom bottom',
                scrub: 0.15,
              },
            }
          );
        }

        // Fade-up elements
        gsap.utils.toArray<HTMLElement>('[data-gsap="fade-up"]').forEach((el) => {
          gsap.fromTo(
            el,
            { y: 34, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.75,
              ease: 'power3.out',
              clearProps: 'transform,opacity',
              scrollTrigger: {
                trigger: el,
                start: 'top 90%',
                toggleActions: 'play none none none',
              },
            }
          );
        });

        // Scale-in elements
        gsap.utils.toArray<HTMLElement>('[data-gsap="scale-in"]').forEach((el) => {
          gsap.fromTo(
            el,
            { scale: 0.94, opacity: 0 },
            {
              scale: 1,
              opacity: 1,
              duration: 0.7,
              ease: 'power2.out',
              clearProps: 'transform,opacity',
              scrollTrigger: {
                trigger: el,
                start: 'top 90%',
                toggleActions: 'play none none none',
              },
            }
          );
        });

        // Stagger parent containers
        gsap.utils.toArray<HTMLElement>('[data-gsap="stagger-parent"]').forEach((parent) => {
          const items =
            parent.querySelectorAll<HTMLElement>('[data-gsap-item]').length > 0
              ? parent.querySelectorAll<HTMLElement>('[data-gsap-item]')
              : parent.children;

          if (!items || items.length === 0) return;

          gsap.fromTo(
            items,
            { y: 30, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.65,
              stagger: 0.08,
              ease: 'power3.out',
              clearProps: 'transform,opacity',
              scrollTrigger: {
                trigger: parent,
                start: 'top 88%',
                toggleActions: 'play none none none',
              },
            }
          );
        });

        // Scrubbed vertical parallax elements
        gsap.utils.toArray<HTMLElement>('[data-gsap="parallax"]').forEach((el) => {
          const speed = Number(el.getAttribute('data-gsap-speed') || '-18');
          gsap.to(el, {
            y: speed,
            ease: 'none',
            scrollTrigger: {
              trigger: el,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          });
        });

        // Animated Number Counters
        gsap.utils.toArray<HTMLElement>('[data-gsap-counter]').forEach((el) => {
          const targetVal = parseFloat(el.getAttribute('data-gsap-counter') || '0');
          const prefix = el.getAttribute('data-gsap-prefix') || '';
          const suffix = el.getAttribute('data-gsap-suffix') || '';
          const decimals = Number(el.getAttribute('data-gsap-decimals') || '0');

          const counterObj = { val: 0 };
          gsap.to(counterObj, {
            val: targetVal,
            duration: 1.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 92%',
              toggleActions: 'play none none none',
            },
            onUpdate: () => {
              el.textContent = `${prefix}${counterObj.val.toFixed(decimals)}${suffix}`;
            },
          });
        });

        ScrollTrigger.refresh();
      });

      return () => ctx.revert();
    }, 60);

    return () => {
      window.clearTimeout(timer);
    };
  }, [location.pathname, isMotionAllowed]);

  if (!isMotionAllowed) {
    return null;
  }

  return (
    <>
      {/* Top Scroll-Scrubbed Progress Bar */}
      <div
        ref={progressBarRef}
        aria-hidden="true"
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 via-indigo-500 to-teal-400 origin-left z-[70] pointer-events-none"
        style={{ transform: 'scaleX(0)' }}
      />

      {/* Ambient Mouse-Following Spotlight (Desktop) */}
      <div
        ref={spotlightRef}
        aria-hidden="true"
        className="fixed top-0 left-0 w-[440px] h-[440px] rounded-full pointer-events-none z-20 hidden lg:block opacity-60 dark:opacity-45 mix-blend-multiply dark:mix-blend-screen"
        style={{
          background:
            'radial-gradient(circle, rgba(99, 102, 241, 0.10) 0%, rgba(20, 184, 166, 0.05) 45%, transparent 70%)',
        }}
      />

      {/* Precision Magnetic Cursor Ring (Desktop) */}
      <div
        ref={cursorDotRef}
        aria-hidden="true"
        className="fixed top-0 left-0 w-7 h-7 rounded-full border border-brand-500/40 dark:border-indigo-400/50 bg-brand-500/5 dark:bg-indigo-400/10 pointer-events-none z-[65] hidden lg:block opacity-45"
      />
    </>
  );
};
