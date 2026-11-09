export type QualityTier = 'light' | 'mid' | 'full';

type NavWithHints = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean; effectiveType?: string };
};

function param(name: string) {
  try {
    return new URLSearchParams(window.location.search).get(name);
  } catch {
    return null;
  }
}

function gpuRenderer(): string {
  const c = document.createElement('canvas');
  const gl = c.getContext('webgl', { failIfMajorPerformanceCaveat: true }) || c.getContext('webgl');
  if (!gl) return '';
  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  const name = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || '') : '';
  gl.getExtension('WEBGL_lose_context')?.loseContext();
  return name;
}

const SOFTWARE = /swiftshader|llvmpipe|softpipe|microsoft basic render|gdi generic|virtualbox/i;
const LOW_GPU = /intel (hd|uhd) graphics( [1-6]\d{2})?$|mali-4|adreno \(?[3-4]|adreno \(?5[0-3]|powervr/i;

export function isPhone() {
  return window.matchMedia('(max-width: 760px), (pointer: coarse)').matches;
}

/** GPU / memory / DPR gate. `?quality=` overrides. Software GL stays on light. */
export function detectTier(): QualityTier {
  const forced = param('quality');
  if (forced === 'light' || forced === 'mid' || forced === 'full') return forced;
  const hold = param('hold');
  if (hold === 'light' || hold === 'opening') return 'light';
  if (hold === 'full') return 'full';

  const nav = navigator as NavWithHints;
  if (nav.connection?.saveData) return 'light';
  if (nav.connection?.effectiveType === '2g' || nav.connection?.effectiveType === 'slow-2g') return 'light';
  if (nav.deviceMemory && nav.deviceMemory <= 2) return 'light';

  const gpu = gpuRenderer();
  if (!gpu && !document.createElement('canvas').getContext('webgl')) return 'light';
  if (SOFTWARE.test(gpu)) return 'light';

  const phone = isPhone();
  const dpr = window.devicePixelRatio || 1;
  if (phone) return 'mid';
  if (nav.deviceMemory && nav.deviceMemory <= 4) return 'mid';
  if (dpr >= 2.75) return 'mid';
  if (LOW_GPU.test(gpu)) return 'mid';
  return 'full';
}

export function createFpsWatch(onDrop: (fps: number) => void) {
  let armed = false;
  let frames = 0;
  let elapsed = 0;
  let strikes = 0;
  return {
    arm() {
      armed = true;
      frames = 0;
      elapsed = 0;
      strikes = 0;
    },
    disarm() {
      armed = false;
    },
    sample(dt: number) {
      if (!armed) return;
      frames += 1;
      elapsed += dt;
      if (elapsed < 1.5) return;
      const fps = frames / elapsed;
      frames = 0;
      elapsed = 0;
      if (fps < 26) {
        strikes += 1;
        if (strikes >= 2) {
          armed = false;
          onDrop(fps);
        }
      } else {
        strikes = 0;
      }
    },
  };
}
