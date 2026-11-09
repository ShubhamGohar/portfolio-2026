type NavWithHints = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean; effectiveType?: string };
};

function lose(gl: WebGLRenderingContext | null) {
  gl?.getExtension('WEBGL_lose_context')?.loseContext();
}

/** True when the 3D engine must not be requested. Safe to call from a click handler. */
export function shouldSkipWebGL(): boolean {
  if (typeof window === 'undefined') return true;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;

  const nav = navigator as NavWithHints;
  if (nav.connection?.saveData) return true;
  if (nav.connection?.effectiveType === '2g' || nav.connection?.effectiveType === 'slow-2g') {
    return true;
  }
  if (typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 2) return true;

  const canvas = document.createElement('canvas');
  const gl =
    canvas.getContext('webgl', { failIfMajorPerformanceCaveat: true }) ||
    canvas.getContext('webgl');
  if (!gl) {
    lose(canvas.getContext('webgl'));
    return true;
  }
  lose(gl);
  return false;
}
