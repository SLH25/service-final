// src/hooks/useSearchData.ts
// Hook partagé pour les services et prestataires.
// Un cache au niveau module évite les requêtes multiples vers /public/services/ et /public/prestataires/
// entre la Navbar, la HeroSection et la SearchPage.
import { useState, useEffect, useCallback } from "react";
import {
  fetchPublicServices,
  fetchPublicPrestataires,
  type PublicService,
  type PublicPrestataire,
} from "../components/publicApi";

// ── Cache partagé au niveau module ─────────────────────────
let cachedServices: PublicService[] | null = null;
let cachedPrestataires: PublicPrestataire[] | null = null;
let inflightServices: Promise<PublicService[]> | null = null;
let inflightPrestataires: Promise<PublicPrestataire[]> | null = null;
const listeners = new Set<() => void>();

const SYNC_INTERVAL_MS = 30000;

function emit() {
  listeners.forEach((l) => l());
}

async function loadServices(): Promise<PublicService[]> {
  if (inflightServices) return inflightServices;
  inflightServices = fetchPublicServices()
    .then((data) => {
      cachedServices = data;
      emit();
      return data;
    })
    .finally(() => {
      inflightServices = null;
    });
  return inflightServices;
}

async function loadPrestataires(): Promise<PublicPrestataire[]> {
  if (inflightPrestataires) return inflightPrestataires;
  inflightPrestataires = fetchPublicPrestataires()
    .then((data) => {
      cachedPrestataires = data;
      emit();
      return data;
    })
    .finally(() => {
      inflightPrestataires = null;
    });
  return inflightPrestataires;
}

// ── Types ──────────────────────────────────────────────────
export interface SearchResult {
  type: "service" | "prestataire";
  id: number;
  name: string;
  subtitle: string;
}

// ── Hook ───────────────────────────────────────────────────
export function useSearchData() {
  const [services, setServices] = useState<PublicService[]>(cachedServices ?? []);
  const [prestataires, setPrestataires] = useState<PublicPrestataire[]>(
    cachedPrestataires ?? []
  );
  const [loading, setLoading] = useState(
    cachedServices === null || cachedPrestataires === null
  );
  const [error, setError] = useState(false);

  useEffect(() => {
    const listener = () => {
      setServices(cachedServices ?? []);
      setPrestataires(cachedPrestataires ?? []);
    };
    listeners.add(listener);

    let cancelled = false;

    async function load(showSpinner = false) {
      if (showSpinner) setLoading(true);
      try {
        await Promise.all([loadServices(), loadPrestataires()]);
        if (!cancelled) {
          setServices(cachedServices ?? []);
          setPrestataires(cachedPrestataires ?? []);
          setError(false);
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load(true);

    // Polling : resynchronise avec les modifications de l'admin toutes les 30s
    const interval = setInterval(() => load(false), SYNC_INTERVAL_MS);

    return () => {
      cancelled = true;
      listeners.delete(listener);
      clearInterval(interval);
    };
  }, []);

  // Logique de recherche commune (Navbar + HeroSection + SearchPage)
  const search = useCallback(
    (query: string): SearchResult[] => {
      const q = query.trim().toLowerCase();
      if (!q) return [];

      const results: SearchResult[] = [];

      for (const s of services) {
        if (s.name.toLowerCase().includes(q)) {
          results.push({
            type: "service",
            id: s.id,
            name: s.name,
            subtitle: `${s.prestataires_count} prestataire${s.prestataires_count > 1 ? "s" : ""}`,
          });
        }
      }

      for (const p of prestataires) {
        const fullName = `${p.first_name} ${p.last_name}`.trim();
        if (
          fullName.toLowerCase().includes(q) ||
          p.service_name.toLowerCase().includes(q)
        ) {
          results.push({
            type: "prestataire",
            id: p.id,
            name: fullName,
            subtitle: p.service_name || "Prestataire",
          });
        }
      }

      return results.slice(0, 8);
    },
    [services, prestataires]
  );

  return { services, prestataires, loading, error, search };
}