import axios from "axios";

// Base URL configurable (comme l'admin) : VITE_API_BASE en production (Render, Vercel, etc.).
// Sinon localhost en développement. Le "/" final est retiré pour éviter les "//".
const API_BASE_URL = (import.meta.env.VITE_API_BASE || "https://service-final.onrender.com/api/accounts").replace(/\/+$/, "");

// Instance axios publique (sans authentification)
const PublicApi = axios.create({
  baseURL: `${API_BASE_URL}/public`,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Types ────────────────────────────────────────────────

export interface PublicService {
  id: number;
  name: string;
  description: string;
  prestataires_count: number;
}

export interface PublicPrestataire {
  id: number;
  first_name: string;
  last_name: string;
  service_name: string;
  email: string;
  telephone: string;
  description: string;
  photo: string;
  adresse: string;
  ville: string;
  experience: number | null;
  status: string;
  created_at: string;
}

export interface PublicServiceDetail {
  id: number;
  name: string;
  description: string;
  prestataires_count: number;
  prestataires: PublicPrestataire[];
}

// ── API Functions ────────────────────────────────────────

export async function fetchPublicServices(): Promise<PublicService[]> {
  const res = await PublicApi.get<PublicService[]>("/services/");
  return res.data;
}

export async function fetchPublicPrestataires(): Promise<PublicPrestataire[]> {
  const res = await PublicApi.get<PublicPrestataire[]>("/prestataires/");
  return res.data;
}

export async function fetchPublicPrestataireById(id: string | number): Promise<PublicPrestataire> {
  const res = await PublicApi.get<PublicPrestataire>(`/prestataires/${id}/`);
  return res.data;
}

export async function fetchPublicServiceById(id: string | number): Promise<PublicServiceDetail> {
  const res = await PublicApi.get<PublicServiceDetail>(`/services/${id}/`);
  return res.data;
}
