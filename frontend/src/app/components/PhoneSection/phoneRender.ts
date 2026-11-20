// Module-level invalidate registry — lets GSAP (outside Canvas) trigger R3F renders.
let _invalidate: (() => void) | null = null;

export function registerInvalidate(fn: () => void): void {
  _invalidate = fn;
}

export function unregisterInvalidate(): void {
  _invalidate = null;
}

export function requestFrame(): void {
  _invalidate?.();
}
