import Api from "./Axio";
import type {
  PrestataireData,
  ServiceData,
  UtilisateurData,
  ActivityItem,
  Statut,
} from "./types";

// ── Types API ─────────────────────────────────────────────

interface ApiUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_staff: boolean;
  date_joined: string;
}

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
  first_name: string;
  last_name: string;
  service: number | null;
  service_name: string | null;
  email: string;
  phone: string;
  status: string;
  date_joined: string;
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
  total_prestataires: number;
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

function mapUser(u: ApiUser): UtilisateurData {
  const fullName = [u.first_name, u.last_name].filter(Boolean).join(" ") || u.username;
  return {
    id: String(u.id),
    name: fullName,
    email: u.email,
    telephone: "",
    role: u.is_staff ? "Admin" : "Client",
    statut: u.is_active ? "Actif" : "Inactif",
    dateAjout: formatDate(u.date_joined),
  };
}

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
    telephone: p.phone,
    description: "",
    statut: (p.status as Statut) || "En attente",
    dateAjout: formatDate(p.date_joined),
  };
}

function mapActivity(a: ApiActivity): ActivityItem {
  const typeMap: Record<string, ActivityItem["type"]> = {
    user: "utilisateur",
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

interface UserPayload {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password?: string;
  is_active?: boolean;
  is_staff?: boolean;
}

interface ServicePayload {
  name: string;
  description: string;
  active: boolean;
}

interface PrestatairePayload {
  first_name: string;
  last_name: string;
  service: number | null;
  email: string;
  phone: string;
  status: string;
}

// ── API Functions ────────────────────────────────────────

export async function fetchUsers(search = "", page = 1, filters: { is_active?: boolean; is_staff?: boolean } = {}): Promise<PaginatedResult<UtilisateurData>> {
  const params: Record<string, string | number | boolean> = { page };
  if (search) params.search = search;
  if (filters.is_active !== undefined) params.is_active = filters.is_active;
  if (filters.is_staff !== undefined) params.is_staff = filters.is_staff;
  const res = await Api.get<PaginatedResponse<ApiUser>>("/users/", { params });
  return {
    data: res.data.results.map(mapUser),
    count: res.data.count,
    next: res.data.next,
    previous: res.data.previous,
  };
}

export async function createUser(data: Omit<UtilisateurData, "id" | "dateAjout">): Promise<UtilisateurData> {
  const payload: UserPayload = {
    username: data.name.toLowerCase().replace(/\s+/g, "."),
    email: data.email,
    first_name: data.name.split(" ")[0] ?? "",
    last_name: data.name.split(" ").slice(1).join(" ") ?? "",
    password: "ChangeMe123!",
    is_active: data.statut === "Actif",
    is_staff: data.role === "Admin",
  };
  const res = await Api.post<ApiUser>("/users/", payload);
  return mapUser(res.data);
}

export async function updateUser(id: string, data: Partial<UtilisateurData>): Promise<UtilisateurData> {
  const payload: Partial<UserPayload> = {};
  if (data.name) {
    payload.first_name = data.name.split(" ")[0] ?? "";
    payload.last_name = data.name.split(" ").slice(1).join(" ") ?? "";
  }
  if (data.email) payload.email = data.email;
  if (data.statut) payload.is_active = data.statut === "Actif";
  if (data.role) payload.is_staff = data.role === "Admin";
  const res = await Api.patch<ApiUser>(`/users/${id}/`, payload);
  return mapUser(res.data);
}

export async function deleteUser(id: string): Promise<void> {
  await Api.delete(`/users/${id}/`);
}

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

export async function createPrestataire(data: Omit<PrestataireData, "id" | "dateAjout">): Promise<PrestataireData> {
  const payload: PrestatairePayload = {
    first_name: data.prenom,
    last_name: data.nom,
    service: null,
    email: data.email,
    phone: data.telephone,
    status: data.statut,
  };
  const res = await Api.post<ApiPrestataire>("/prestataires/", payload);
  return mapPrestataire(res.data);
}

export async function updatePrestataire(id: string, data: Partial<PrestataireData>): Promise<PrestataireData> {
  const payload: Partial<PrestatairePayload> = {};
  if (data.prenom) payload.first_name = data.prenom;
  if (data.nom) payload.last_name = data.nom;
  if (data.email) payload.email = data.email;
  if (data.telephone !== undefined) payload.phone = data.telephone;
  if (data.statut) payload.status = data.statut;
  const res = await Api.patch<ApiPrestataire>(`/prestataires/${id}/`, payload);
  return mapPrestataire(res.data);
}

export async function deletePrestataire(id: string): Promise<void> {
  await Api.delete(`/prestataires/${id}/`);
}

export async function fetchStats(): Promise<ApiStats> {
  const res = await Api.get<ApiStats>("/stats/");
  return res.data;
}

export async function fetchActivities(): Promise<ActivityItem[]> {
  const res = await Api.get<ApiActivity[]>("/activity/");
  return res.data.map(mapActivity);
}