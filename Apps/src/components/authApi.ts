import axios from "axios";

// Base URL configurable : VITE_API_BASE en production (Render, Vercel, etc.).
// Sinon localhost en développement. Le "/" final est retiré pour éviter les "//".
const API_BASE_URL = (import.meta.env.VITE_API_BASE || "https://service-final.onrender.com/api/accounts").replace(/\/+$/, "");

// Instance axios publique pour l'authentification (register, login, me, ...)
const AuthApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Types ────────────────────────────────────────────────

export type Role = "CLIENT" | "PRESTATAIRE" | "ADMIN";

/** Champs communs à toute inscription (client ou prestataire). */
export interface RegisterPayloadBase {
  role: "client" | "prestataire";
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  telephone: string;
  password: string;
  password_confirm: string;
  accept_terms?: boolean;
}

export interface RegisterClientPayload extends RegisterPayloadBase {
  role: "client";
}

export interface RegisterPrestatairePayload extends RegisterPayloadBase {
  role: "prestataire";
  service: number | null;
  telephone_secondaire?: string;
  experience?: number | null;
  description?: string;
  ville?: string;
  adresse?: string;
}

export type RegisterPayload = RegisterClientPayload | RegisterPrestatairePayload;

export interface RegisterResponse {
  user: {
    id: number;
    username: string;
    email: string;
    role: Role;
    is_staff: boolean;
  };
  profile?: {
    id: number;
    status?: string | null;
  };
  access: string;
  refresh: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  username: string;
  user: {
    id: number;
    username: string;
    email: string;
    role: Role;
    is_staff: boolean;
  };
}

export interface MeResponse {
  id: number;
  username: string;
  email: string;
  role: Role;
  is_staff: boolean;
  profile: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    telephone: string;
    status?: string | null;
    service_name?: string | null;
    description?: string;
    ville?: string;
    [key: string]: unknown;
  } | null;
}

// ── API Functions ────────────────────────────────────────

/** Inscription publique — UNIQUE source de création des comptes. */
export async function registerUser(payload: RegisterPayload): Promise<RegisterResponse> {
  const res = await AuthApi.post<RegisterResponse>("/register/", payload);
  return res.data;
}

/** Connexion avec username + mot de passe (le rôle est détecté automatiquement). */
export async function loginUser(username: string, password: string): Promise<LoginResponse> {
  const res = await AuthApi.post<LoginResponse>("/login/", { username, password });
  return res.data;
}

/** Déconnexion (blacklist du refresh token côté serveur). */
export async function logoutUser(refresh: string): Promise<void> {
  await AuthApi.post("/logout/", { refresh });
}

/** Profil de l'utilisateur connecté. */
export async function fetchMe(accessToken: string): Promise<MeResponse> {
  const res = await AuthApi.get<MeResponse>("/me/", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.data;
}

/** Mise à jour du profil (email, first_name, last_name). */
export async function updateMe(
  accessToken: string,
  data: { email?: string; first_name?: string; last_name?: string }
): Promise<MeResponse> {
  const res = await AuthApi.put<MeResponse>("/me/", data, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.data;
}

/** Changement de mot de passe de l'utilisateur connecté. */
export async function changePassword(
  accessToken: string,
  oldPassword: string,
  newPassword: string
): Promise<void> {
  await AuthApi.put(
    "/change-password/",
    { old_password: oldPassword, new_password: newPassword },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
}
