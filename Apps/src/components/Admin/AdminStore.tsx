import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import type { PrestataireData, ServiceData, UtilisateurData, ActivityItem } from "./types";
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  fetchServices,
  createService,
  updateService as apiUpdateService,
  deleteService as apiDeleteService,
  fetchPrestataires,
  createPrestataire,
  updatePrestataire as apiUpdatePrestataire,
  deletePrestataire as apiDeletePrestataire,
  fetchStats,
  fetchActivities,
} from "./adminApi";

// ── Context interface ────────────────────────────────────

interface AdminStoreContextValue {
  prestataires: PrestataireData[];
  services: ServiceData[];
  utilisateurs: UtilisateurData[];
  activities: ActivityItem[];
  stats: {
    totalUsers: number;
    newUsersWeek: number;
    activePrestataires: number;
    totalPrestataires: number;
    totalServices: number;
    activeServices: number;
  } | null;
  loading: boolean;
  error: string | null;
  actionError: string | null;
  actionLoading: boolean;
  clearActionError: () => void;

  // Pagination & filtres
  usersPage: number;
  usersCount: number;
  usersHasNext: boolean;
  usersHasPrevious: boolean;
  usersLoading: boolean;
  setUsersPage: (page: number) => void;
  searchUsers: (query: string, filters?: { is_active?: boolean; is_staff?: boolean }) => void;

  servicesPage: number;
  servicesCount: number;
  servicesHasNext: boolean;
  servicesHasPrevious: boolean;
  servicesLoading: boolean;
  setServicesPage: (page: number) => void;
  searchServices: (query: string, filters?: { active?: boolean }) => void;

  prestatairesPage: number;
  prestatairesCount: number;
  prestatairesHasNext: boolean;
  prestatairesHasPrevious: boolean;
  prestatairesLoading: boolean;
  setPrestatairesPage: (page: number) => void;
  searchPrestataires: (query: string, filters?: { status?: string; service?: number }) => void;

  addPrestataire: (data: Omit<PrestataireData, "id" | "dateAjout">) => Promise<void>;
  updatePrestataire: (id: string, data: Partial<PrestataireData>) => Promise<void>;
  deletePrestataire: (id: string) => Promise<void>;

  addService: (data: Omit<ServiceData, "id" | "dateAjout">) => Promise<void>;
  updateService: (id: string, data: Partial<ServiceData>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;

  addUtilisateur: (data: Omit<UtilisateurData, "id" | "dateAjout">) => Promise<void>;
  updateUtilisateur: (id: string, data: Partial<UtilisateurData>) => Promise<void>;
  deleteUtilisateur: (id: string) => Promise<void>;

  refresh: () => Promise<void>;
}

const AdminStoreContext = createContext<AdminStoreContextValue | null>(null);

// ── Provider ─────────────────────────────────────────────

export function AdminStoreProvider({ children }: { children: React.ReactNode }) {
  const [prestataires, setPrestataires] = useState<PrestataireData[]>([]);
  const [services, setServices] = useState<ServiceData[]>([]);
  const [utilisateurs, setUtilisateurs] = useState<UtilisateurData[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [stats, setStats] = useState<AdminStoreContextValue["stats"]>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Pagination state
  const [usersPage, setUsersPage] = useState(1);
  const [usersCount, setUsersCount] = useState(0);
  const [usersHasNext, setUsersHasNext] = useState(false);
  const [usersHasPrevious, setUsersHasPrevious] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  // Refs pour conserver les filtres actifs lors du changement de page
  const usersFilterRef = useRef<{ search: string; filters: { is_active?: boolean; is_staff?: boolean } }>({ search: "", filters: {} });

  const [servicesPage, setServicesPage] = useState(1);
  const [servicesCount, setServicesCount] = useState(0);
  const [servicesHasNext, setServicesHasNext] = useState(false);
  const [servicesHasPrevious, setServicesHasPrevious] = useState(false);
  const [servicesLoading, setServicesLoading] = useState(false);
  const servicesFilterRef = useRef<{ search: string; filters: { active?: boolean } }>({ search: "", filters: {} });

  const [prestatairesPage, setPrestatairesPage] = useState(1);
  const [prestatairesCount, setPrestatairesCount] = useState(0);
  const [prestatairesHasNext, setPrestatairesHasNext] = useState(false);
  const [prestatairesHasPrevious, setPrestatairesHasPrevious] = useState(false);
  const [prestatairesLoading, setPrestatairesLoading] = useState(false);
  const prestatairesFilterRef = useRef<{ search: string; filters: { status?: string; service?: number } }>({ search: "", filters: {} });

  // ── Chargement depuis l'API ──
  const loadFromApi = useCallback(async () => {
    try {
      setError(null);
      const [usersRes, servsRes, prestsRes, acts, sts] = await Promise.all([
        fetchUsers("", 1),
        fetchServices("", 1),
        fetchPrestataires("", 1),
        fetchActivities(),
        fetchStats(),
      ]);

      setUtilisateurs(usersRes.data);
      setUsersCount(usersRes.count);
      setUsersHasNext(!!usersRes.next);
      setUsersHasPrevious(!!usersRes.previous);

      setServices(servsRes.data);
      setServicesCount(servsRes.count);
      setServicesHasNext(!!servsRes.next);
      setServicesHasPrevious(!!servsRes.previous);

      setPrestataires(prestsRes.data);
      setPrestatairesCount(prestsRes.count);
      setPrestatairesHasNext(!!prestsRes.next);
      setPrestatairesHasPrevious(!!prestsRes.previous);

      setActivities(acts);
      setStats({
        totalUsers: sts.total_users,
        newUsersWeek: sts.new_users_week,
        activePrestataires: sts.active_prestataires,
        totalPrestataires: sts.total_prestataires,
        totalServices: sts.total_services,
        activeServices: sts.active_services,
      });
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        "Impossible de charger les données depuis le serveur.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFromApi();
  }, [loadFromApi]);

  // ── Recherche / filtres serveur ──

  const searchUsers = useCallback(async (query: string, filters: { is_active?: boolean; is_staff?: boolean } = {}) => {
    setUsersLoading(true);
    try {
      const res = await fetchUsers(query, 1, filters);
      setUtilisateurs(res.data);
      setUsersCount(res.count);
      setUsersHasNext(!!res.next);
      setUsersHasPrevious(!!res.previous);
      setUsersPage(1);
      usersFilterRef.current = { search: query, filters };
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || "Erreur lors de la recherche.");
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const searchServices = useCallback(async (query: string, filters: { active?: boolean } = {}) => {
    setServicesLoading(true);
    try {
      const res = await fetchServices(query, 1, filters);
      setServices(res.data);
      setServicesCount(res.count);
      setServicesHasNext(!!res.next);
      setServicesHasPrevious(!!res.previous);
      setServicesPage(1);
      servicesFilterRef.current = { search: query, filters };
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || "Erreur lors de la recherche.");
    } finally {
      setServicesLoading(false);
    }
  }, []);

  const searchPrestataires = useCallback(async (query: string, filters: { status?: string; service?: number } = {}) => {
    setPrestatairesLoading(true);
    try {
      const res = await fetchPrestataires(query, 1, filters);
      setPrestataires(res.data);
      setPrestatairesCount(res.count);
      setPrestatairesHasNext(!!res.next);
      setPrestatairesHasPrevious(!!res.previous);
      setPrestatairesPage(1);
      prestatairesFilterRef.current = { search: query, filters };
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || "Erreur lors de la recherche.");
    } finally {
      setPrestatairesLoading(false);
    }
  }, []);

  // ── Pagination serveur ──

  const loadUsersPage = useCallback(async (page: number) => {
    setUsersLoading(true);
    try {
      const { search, filters } = usersFilterRef.current;
      const res = await fetchUsers(search, page, filters);
      setUtilisateurs(res.data);
      setUsersCount(res.count);
      setUsersHasNext(!!res.next);
      setUsersHasPrevious(!!res.previous);
      setUsersPage(page);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || "Erreur lors du chargement.");
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const loadServicesPage = useCallback(async (page: number) => {
    setServicesLoading(true);
    try {
      const { search, filters } = servicesFilterRef.current;
      const res = await fetchServices(search, page, filters);
      setServices(res.data);
      setServicesCount(res.count);
      setServicesHasNext(!!res.next);
      setServicesHasPrevious(!!res.previous);
      setServicesPage(page);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || "Erreur lors du chargement.");
    } finally {
      setServicesLoading(false);
    }
  }, []);

  const loadPrestatairesPage = useCallback(async (page: number) => {
    setPrestatairesLoading(true);
    try {
      const { search, filters } = prestatairesFilterRef.current;
      const res = await fetchPrestataires(search, page, filters);
      setPrestataires(res.data);
      setPrestatairesCount(res.count);
      setPrestatairesHasNext(!!res.next);
      setPrestatairesHasPrevious(!!res.previous);
      setPrestatairesPage(page);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || "Erreur lors du chargement.");
    } finally {
      setPrestatairesLoading(false);
    }
  }, []);

  const pushActivity = useCallback((title: string, details: string, type: ActivityItem["type"]) => {
    const now = new Date();
    const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"];
    const h = String(now.getHours()).padStart(2, "0");
    const m = String(now.getMinutes()).padStart(2, "0");
    const item: ActivityItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title,
      details,
      time: `${now.getDate()} ${months[now.getMonth()]} à ${h}:${m}`,
      type,
    };
    setActivities((prev) => [item, ...prev].slice(0, 20));
  }, []);

  // ── Prestataires ──

  const addPrestataire = useCallback(async (data: Omit<PrestataireData, "id" | "dateAjout">) => {
    setActionLoading(true);
    setActionError(null);
    try {
      const created = await createPrestataire(data);
      setPrestataires((prev) => [created, ...prev]);
      setPrestatairesCount((c) => c + 1);
      pushActivity(
        "Prestataire ajouté",
        `${created.prenom} ${created.nom} (${created.service}) a été ajouté.`,
        "prestataire"
      );
    } catch (err: any) {
      setActionError(err?.response?.data?.detail || err?.message || "Erreur lors de l'ajout du prestataire.");
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [pushActivity]);

  const updatePrestataire = useCallback(async (id: string, data: Partial<PrestataireData>) => {
    setActionLoading(true);
    setActionError(null);
    try {
      const updated = await apiUpdatePrestataire(id, data);
      setPrestataires((prev) => prev.map((p) => (p.id === id ? updated : p)));
      pushActivity("Prestataire modifié", "Les informations d'un prestataire ont été mises à jour.", "prestataire");
    } catch (err: any) {
      setActionError(err?.response?.data?.detail || err?.message || "Erreur lors de la modification du prestataire.");
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [pushActivity]);

  const deletePrestataire = useCallback(async (id: string) => {
    setActionLoading(true);
    setActionError(null);
    try {
      await apiDeletePrestataire(id);
      const target = prestataires.find((p) => p.id === id);
      if (target) {
        pushActivity("Prestataire supprimé", `${target.prenom} ${target.nom} a été supprimé.`, "prestataire");
      }
      setPrestataires((prev) => prev.filter((p) => p.id !== id));
      setPrestatairesCount((c) => Math.max(0, c - 1));
    } catch (err: any) {
      setActionError(err?.response?.data?.detail || err?.message || "Erreur lors de la suppression du prestataire.");
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [pushActivity, prestataires]);

  // ── Services ──

  const addService = useCallback(async (data: Omit<ServiceData, "id" | "dateAjout">) => {
    setActionLoading(true);
    setActionError(null);
    try {
      const created = await createService(data);
      setServices((prev) => [created, ...prev]);
      setServicesCount((c) => c + 1);
      pushActivity("Service ajouté", `Le service ${created.name} a été créé.`, "service");
    } catch (err: any) {
      setActionError(err?.response?.data?.detail || err?.message || "Erreur lors de l'ajout du service.");
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [pushActivity]);

  const updateService = useCallback(async (id: string, data: Partial<ServiceData>) => {
    setActionLoading(true);
    setActionError(null);
    try {
      const updated = await apiUpdateService(id, data);
      setServices((prev) => prev.map((s) => (s.id === id ? updated : s)));
      pushActivity("Service modifié", "Un service a été mis à jour.", "service");
    } catch (err: any) {
      setActionError(err?.response?.data?.detail || err?.message || "Erreur lors de la modification du service.");
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [pushActivity]);

  const deleteService = useCallback(async (id: string) => {
    setActionLoading(true);
    setActionError(null);
    try {
      await apiDeleteService(id);
      const target = services.find((s) => s.id === id);
      if (target) {
        pushActivity("Service supprimé", `Le service ${target.name} a été supprimé.`, "service");
      }
      setServices((prev) => prev.filter((s) => s.id !== id));
      setServicesCount((c) => Math.max(0, c - 1));
    } catch (err: any) {
      setActionError(err?.response?.data?.detail || err?.message || "Erreur lors de la suppression du service.");
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [pushActivity, services]);

  // ── Utilisateurs ──

  const addUtilisateur = useCallback(async (data: Omit<UtilisateurData, "id" | "dateAjout">) => {
    setActionLoading(true);
    setActionError(null);
    try {
      const created = await createUser(data);
      setUtilisateurs((prev) => [created, ...prev]);
      setUsersCount((c) => c + 1);
      pushActivity("Utilisateur ajouté", `${created.name} a été inscrit.`, "utilisateur");
    } catch (err: any) {
      setActionError(err?.response?.data?.detail || err?.message || "Erreur lors de l'ajout de l'utilisateur.");
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [pushActivity]);

  const updateUtilisateur = useCallback(async (id: string, data: Partial<UtilisateurData>) => {
    setActionLoading(true);
    setActionError(null);
    try {
      const updated = await updateUser(id, data);
      setUtilisateurs((prev) => prev.map((u) => (u.id === id ? updated : u)));
      pushActivity("Utilisateur modifié", "Les informations d'un utilisateur ont été mises à jour.", "utilisateur");
    } catch (err: any) {
      setActionError(err?.response?.data?.detail || err?.message || "Erreur lors de la modification de l'utilisateur.");
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [pushActivity]);

  const deleteUtilisateur = useCallback(async (id: string) => {
    setActionLoading(true);
    setActionError(null);
    try {
      await deleteUser(id);
      const target = utilisateurs.find((u) => u.id === id);
      if (target) {
        pushActivity("Utilisateur supprimé", `${target.name} a été supprimé.`, "utilisateur");
      }
      setUtilisateurs((prev) => prev.filter((u) => u.id !== id));
      setUsersCount((c) => Math.max(0, c - 1));
    } catch (err: any) {
      setActionError(err?.response?.data?.detail || err?.message || "Erreur lors de la suppression de l'utilisateur.");
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [pushActivity, utilisateurs]);

  const clearActionError = useCallback(() => setActionError(null), []);

  const value: AdminStoreContextValue = {
    prestataires,
    services,
    utilisateurs,
    activities,
    stats,
    loading,
    error,
    actionError,
    actionLoading,
    clearActionError,

    usersPage,
    usersCount,
    usersHasNext,
    usersHasPrevious,
    usersLoading,
    setUsersPage: loadUsersPage,
    searchUsers,

    servicesPage,
    servicesCount,
    servicesHasNext,
    servicesHasPrevious,
    servicesLoading,
    setServicesPage: loadServicesPage,
    searchServices,

    prestatairesPage,
    prestatairesCount,
    prestatairesHasNext,
    prestatairesHasPrevious,
    prestatairesLoading,
    setPrestatairesPage: loadPrestatairesPage,
    searchPrestataires,

    addPrestataire,
    updatePrestataire,
    deletePrestataire,
    addService,
    updateService,
    deleteService,
    addUtilisateur,
    updateUtilisateur,
    deleteUtilisateur,
    refresh: loadFromApi,
  };

  return <AdminStoreContext.Provider value={value}>{children}</AdminStoreContext.Provider>;
}

export function useAdminStore(): AdminStoreContextValue {
  const ctx = useContext(AdminStoreContext);
  if (!ctx) {
    throw new Error("useAdminStore must be used within AdminStoreProvider");
  }
  return ctx;
}