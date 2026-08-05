import Api from "./Axio";
import type {
  ClientData,
  PrestataireData,
  ServiceData,
  ActivityItem,
  PrestataireStatus,
} from "./types";

// ── Types API ─────────────────────────────────────────────

interface ApiService {
  id: number;
  name: string;
  description: string;
  active: boolean;
  created_at: string;
  prestataires_count: number;
}

interface ApiPrestataire {
  id: number;
  user: number;
  username: string;
  first_name: string;
  last_name: string;
  service: number | null;
  service_name: string | null;
  email: string;
  telephone: string;
  description: string;
  photo: string;
  adresse: string;
  ville: string;
  experience: number | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ApiClient {
  id: number;
  user: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  telephone: string;
  created_at: string;
  updated_at: string;
}

interface ApiActivity {
  type: string;
  action: string;
  label: string;
  date: string;
}

interface ApiStats {
  total_users: number;
  new_users_week: number;
  active_prestataires: number;
  affiche_prestataires: number;
  pending_prestataires: number;
  total_prestataires: number;
  total_clients: number;
  total_services: number;
  active_services: number;
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface PaginatedResult<T> {
  data: T[];
  count: number;
  next: string | null;
  previous: string | null;
}

// ── Helpers de formatage ─────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso);
  const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"];
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${d.getDate()} ${months[d.getMonth()]} à ${h}:${m}`;
}

// ── Mapping API → Frontend ───────────────────────────────

function mapService(s: ApiService): ServiceData {
  return {
    id: String(s.id),
    name: s.name,
    description: s.description,
    statut: s.active ? "Actif" : "Inactif",
    dateAjout: formatDate(s.created_at),
  };
}

function mapPrestataire(p: ApiPrestataire): PrestataireData {
  return {
    id: String(p.id),
    nom: p.last_name,
    prenom: p.first_name,
    service: p.service_name ?? "",
    email: p.email,
    telephone: p.telephone ?? "",
    description: p.description ?? "",
    photo: p.photo ?? "",
    adresse: p.adresse ?? "",
    ville: p.ville ?? "",
    experience: p.experience ?? null,
    statut: (p.status as PrestataireStatus) || "PENDING",
    dateAjout: formatDate(p.created_at),
  };
}

function mapClient(c: ApiClient): ClientData {
  return {
    id: String(c.id),
    prenom: c.first_name,
    nom: c.last_name,
    username: c.username,
    email: c.email,
    telephone: c.telephone ?? "",
    dateAjout: formatDate(c.created_at),
  };
}

function mapActivity(a: ApiActivity): ActivityItem {
  const typeMap: Record<string, ActivityItem["type"]> = {
    user: "utilisateur",
    client: "utilisateur",
    prestataire: "prestataire",
    service: "service",
    system: "system",
  };
  return {
    id: `${a.type}-${a.date}`,
    title: a.action,
    details: a.label,
    time: formatTime(a.date),
    type: typeMap[a.type] ?? "system",
  };
}

// ── Mapping Frontend → API ───────────────────────────────

interface ServicePayload {
  name: string;
  description: string;
  active: boolean;
}

interface ClientUpdatePayload {
  first_name?: string;
  last_name?: string;
  telephone?: string;
  email?: string;
}

interface PrestataireUpdatePayload {
  first_name?: string;
  last_name?: string;
  service?: number | null;
  email?: string;
  telephone?: string;
  description?: string;
  photo?: string;
  adresse?: string;
  ville?: string;
  experience?: number | null;
  status?: string;
}

// Map des noms de services vers leurs IDs (chargés depuis l'API)
let serviceIdMap: Record<string, number> = {};

export function setServiceIdMap(map: Record<string, number>) {
  serviceIdMap = map;
}

export function getServiceIdMap(): Record<string, number> {
  return serviceIdMap;
}

// ── Synchronisation de la map nom → ID ───────────────────

/**
 * Charge TOUS les services (toutes les pages, y compris les inactifs)
 * pour construire la map nom → ID. Évite de perdre la relation service
 * quand un prestataire est lié à un service inactif.
 */
export async function fetchAllServices(): Promise<ServiceData[]> {
  const all: ServiceData[] = [];
  let page = 1;
  for (;;) {
    const res = await fetchServices("", page);
    all.push(...res.data);
    if (!res.next) break;
    page += 1;
  }
  return all;
}

/** Recharge la map nom → ID à partir de tous les services. */
export async function refreshServiceIdMap(): Promise<Record<string, number>> {
  const services = await fetchAllServices();
  const map: Record<string, number> = {};
  services.forEach((s) => {
    map[s.name] = Number(s.id);
  });
  setServiceIdMap(map);
  return map;
}

// ── API Functions ────────────────────────────────────────

export async function fetchServices(search = "", page = 1, filters: { active?: boolean } = {}): Promise<PaginatedResult<ServiceData>> {
  const params: Record<string, string | number | boolean> = { page };
  if (search) params.search = search;
  if (filters.active !== undefined) params.active = filters.active;
  const res = await Api.get<PaginatedResponse<ApiService>>("/services/", { params });
  return {
    data: res.data.results.map(mapService),
    count: res.data.count,
    next: res.data.next,
    previous: res.data.previous,
  };
}

export async function createService(data: Omit<ServiceData, "id" | "dateAjout">): Promise<ServiceData> {
  const payload: ServicePayload = {
    name: data.name,
    description: data.description,
    active: data.statut === "Actif",
  };
  const res = await Api.post<ApiService>("/services/", payload);
  return mapService(res.data);
}

export async function updateService(id: string, data: Partial<ServiceData>): Promise<ServiceData> {
  const payload: Partial<ServicePayload> = {};
  if (data.name) payload.name = data.name;
  if (data.description !== undefined) payload.description = data.description;
  if (data.statut) payload.active = data.statut === "Actif";
  const res = await Api.patch<ApiService>(`/services/${id}/`, payload);
  return mapService(res.data);
}

export async function deleteService(id: string): Promise<void> {
  await Api.delete(`/services/${id}/`);
}

// ── Clients (pas de création : inscription publique uniquement) ──

export async function fetchClients(search = "", page = 1): Promise<PaginatedResult<ClientData>> {
  const params: Record<string, string | number> = { page };
  if (search) params.search = search;
  const res = await Api.get<PaginatedResponse<ApiClient>>("/clients/", { params });
  return {
    data: res.data.results.map(mapClient),
    count: res.data.count,
    next: res.data.next,
    previous: res.data.previous,
  };
}

export async function updateClient(id: string, data: Partial<ClientData>): Promise<ClientData> {
  const payload: ClientUpdatePayload = {};
  if (data.prenom !== undefined) payload.first_name = data.prenom;
  if (data.nom !== undefined) payload.last_name = data.nom;
  if (data.email !== undefined) payload.email = data.email;
  if (data.telephone !== undefined) payload.telephone = data.telephone;
  const res = await Api.patch<ApiClient>(`/clients/${id}/`, payload);
  return mapClient(res.data);
}

export async function deleteClient(id: string): Promise<void> {
  await Api.delete(`/clients/${id}/`);
}

// ── Prestataires (pas de création : inscription publique uniquement) ──

export async function fetchPrestataires(search = "", page = 1, filters: { status?: string; service?: number } = {}): Promise<PaginatedResult<PrestataireData>> {
  const params: Record<string, string | number> = { page };
  if (search) params.search = search;
  if (filters.status) params.status = filters.status;
  if (filters.service !== undefined) params.service = filters.service;
  const res = await Api.get<PaginatedResponse<ApiPrestataire>>("/prestataires/", { params });
  return {
    data: res.data.results.map(mapPrestataire),
    count: res.data.count,
    next: res.data.next,
    previous: res.data.previous,
  };
}

export async function updatePrestataire(id: string, data: Partial<PrestataireData>): Promise<PrestataireData> {
  const payload: PrestataireUpdatePayload = {};
  if (data.prenom !== undefined) payload.first_name = data.prenom;
  if (data.nom !== undefined) payload.last_name = data.nom;
  if (data.email !== undefined) payload.email = data.email;
  if (data.telephone !== undefined) payload.telephone = data.telephone;
  if (data.description !== undefined) payload.description = data.description;
  if (data.photo !== undefined) payload.photo = data.photo;
  if (data.adresse !== undefined) payload.adresse = data.adresse;
  if (data.ville !== undefined) payload.ville = data.ville;
  if (data.experience !== undefined) payload.experience = data.experience;
  if (data.statut !== undefined) payload.status = data.statut;
  if (data.service) payload.service = serviceIdMap[data.service] ?? null;
  const res = await Api.patch<ApiPrestataire>(`/prestataires/${id}/`, payload);
  return mapPrestataire(res.data);
}

export type PrestataireStatusAction = "verify" | "affiche" | "reject";

/** Change le statut d'un prestataire (verify → VERIFIED, affiche → AFFICHE, reject → REJECTED). */
export async function setPrestataireStatus(id: string, action: PrestataireStatusAction): Promise<PrestataireData> {
  const res = await Api.patch<ApiPrestataire>(`/prestataires/${id}/${action}/`);
  return mapPrestataire(res.data);
}

export async function deletePrestataire(id: string): Promise<void> {
  await Api.delete(`/prestataires/${id}/`);
}

// ── Stats & activité ─────────────────────────────────────

export async function fetchStats(): Promise<ApiStats> {
  const res = await Api.get<ApiStats>("/stats/");
  return res.data;
}

export async function fetchActivities(): Promise<ActivityItem[]> {
  const res = await Api.get<ApiActivity[]>("/activity/");
  return res.data.map(mapActivity);
}
