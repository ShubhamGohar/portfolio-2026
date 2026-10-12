export const MOTION_EVENT = 'portfolio:motion-on';
export const MOTION_CLASS = 'motion-on';
export const DESKTOP_MQ = '(min-width: 901px)';

export function isMotionOn(): boolean {
    return typeof document !== 'undefined'
        && document.documentElement.classList.contains(MOTION_CLASS);
}

export function enableMotion(): void {
    if (isMotionOn()) return;
    document.documentElement.classList.add(MOTION_CLASS);
    window.dispatchEvent(new Event(MOTION_EVENT));
}

export function onMotionReady(callback: () => void): () => void {
    if (isMotionOn()) {
        callback();
        return () => {};
    }
    window.addEventListener(MOTION_EVENT, callback, { once: true });
    return () => window.removeEventListener(MOTION_EVENT, callback);
}
