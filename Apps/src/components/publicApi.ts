import axios from "axios";

// Instance axios publique (sans authentification)
const PublicApi = axios.create({
  baseURL: "http://localhost:8000/api/accounts/public/",
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
  phone: string;
  status: string;
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