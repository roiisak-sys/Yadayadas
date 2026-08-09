import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from './reduced-motion';

gsap.registerPlugin(ScrollTrigger);

if (!prefersReducedMotion()) {
  const lenis = new Lenis({ duration: 1.1, smoothWheel: true });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);
}
