import { useEffect, useRef } from 'react';

// Default Konami sequence: up up down down left right left right b a
const DEFAULT_SEQ = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];

// If you pass toggleCookieName, the hook will automatically toggle that cookie
// (set to toggleCookieValue when enabling, delete when disabling) on each success.
// After toggling, onTrigger will be called with { enabled }.
export default function useKonami(onTrigger, {
  sequence = DEFAULT_SEQ,
  cooldownMs = 30000,
  storageKey = 'cw25-konami-last',
  toggleCookieName,
  toggleCookieValue = '1',
} = {}) {
  const idxRef = useRef(0);
  const lastRef = useRef(0);

  useEffect(() => {
    try {
      const v = parseInt(localStorage.getItem(storageKey) || '0', 10);
      if (!Number.isNaN(v)) lastRef.current = v;
    } catch {}

    function onKeyDown(e) {
      const key = e.key;
      const expect = sequence[idxRef.current];
      if (key.toLowerCase() === expect.toLowerCase()) {
        idxRef.current += 1;
        if (idxRef.current >= sequence.length) {
          idxRef.current = 0;
          const now = Date.now();
          if (now - lastRef.current >= cooldownMs) {
            lastRef.current = now;
            try { localStorage.setItem(storageKey, String(now)); } catch {}
            let enabled;
            if (toggleCookieName) {
              // Toggle cookie
              const has = typeof document !== 'undefined' && document.cookie && document.cookie.indexOf(`${toggleCookieName}=${toggleCookieValue}`) !== -1;
              if (has) {
                // delete cookie
                try { document.cookie = `${toggleCookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`; } catch {}
                enabled = false;
              } else {
                try { document.cookie = `${toggleCookieName}=${toggleCookieValue}; path=/; max-age=31536000`; } catch {}
                enabled = true;
              }
            }
            if (typeof onTrigger === 'function') onTrigger({ enabled });
          }
        }
      } else {
        idxRef.current = (key.toLowerCase() === sequence[0].toLowerCase()) ? 1 : 0;
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onTrigger, sequence, cooldownMs, storageKey]);
}
