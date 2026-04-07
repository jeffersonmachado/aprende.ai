import '@testing-library/jest-dom/vitest';
import React from 'react';
import { vi } from 'vitest';

if (typeof window !== 'undefined') {
  window.scrollTo = vi.fn();
}

// Mock framer-motion: animações são imediatas/desativadas em ambiente de testes
vi.mock('framer-motion', () => {
  const MotionComponent = React.forwardRef(({ children, ...props }, ref) => {
    // Remove framer-motion-specific props to avoid React DOM warnings
    const {
      initial, animate, exit, transition, variants, whileHover, whileTap,
      whileFocus, whileInView, layout, layoutId, drag, dragConstraints,
      onAnimationStart, onAnimationComplete, onDragStart, onDragEnd,
      ...rest
    } = props;
    return React.createElement('div', { ...rest, ref }, children);
  });

  const motionProxy = new Proxy({}, {
    get: () => MotionComponent,
  });

  return {
    motion: motionProxy,
    AnimatePresence: ({ children }) => children,
    LayoutGroup: ({ children }) => children,
    LazyMotion: ({ children }) => children,
    m: motionProxy,
    useMotionValue: vi.fn(() => ({ get: () => 0, set: vi.fn(), onChange: vi.fn() })),
    useTransform: vi.fn(() => 0),
    useAnimation: vi.fn(() => ({ start: vi.fn(), stop: vi.fn() })),
    useAnimate: vi.fn(() => [{ current: null }, vi.fn()]),
    useInView: vi.fn(() => false),
    useIsPresent: vi.fn(() => true),
    usePresence: vi.fn(() => [true, () => {}]),
    useSpring: vi.fn(() => ({ get: () => 0, set: vi.fn() })),
    useReducedMotion: vi.fn(() => false),
  };
});
