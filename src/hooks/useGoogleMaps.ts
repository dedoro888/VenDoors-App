import { useEffect, useState } from "react";

declare global {
  interface Window {
    google?: any;
    __vendoorMapsLoading?: Promise<void>;
  }
}

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

/**
 * Lazy-loads the Google Maps JS API (with Places library) once per page.
 * Returns { ready, available } — `available` is false when the env var is missing,
 * so callers can render a text-only fallback.
 */
export function useGoogleMaps() {
  const [ready, setReady] = useState<boolean>(() => Boolean(window.google?.maps?.places));
  const available = Boolean(API_KEY);

  useEffect(() => {
    if (!API_KEY) return;
    if (window.google?.maps?.places) {
      setReady(true);
      return;
    }
    if (!window.__vendoorMapsLoading) {
      window.__vendoorMapsLoading = new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places&v=weekly`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Google Maps"));
        document.head.appendChild(script);
      });
    }
    window.__vendoorMapsLoading.then(() => setReady(true)).catch(() => setReady(false));
  }, []);

  return { ready, available };
}
