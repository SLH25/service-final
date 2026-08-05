import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import type { ClientData, PrestataireData, ServiceData, ActivityItem } from "./types";
import {
  fetchClients,
  updateClient,
  deleteClient,
  fetchServices,
  createService,
  updateService as apiUpdateService,
  deleteService as apiDeleteService,
  fetchPrestataires,
  updatePrestataire as apiUpdatePrestataire,
  deletePrestataire as apiDeletePrestataire,
  setPrestataireStatus,
  fetchStats,
  fetchActivities,
} from "./adminApi";

// ── Context interface ────────────────────────────────────

interface AdminStoreContextValue {
  prestataires: PrestataireData[];
  services: ServiceData[];
  clients: ClientData[];
  activities: ActivityItem[];
  stats: {
    totalUsers: number;
    newUsersWeek: number;
    activePrestataires: number;
    affichePrestataires: number;
    pendingPrestataires: number;
    totalPrestataires: number;
    totalClients: number;
    totalServices: number;
    activeServices: number;
  } | null;
  loading: boolean;
  error: string | null;
  actionError: string | null;
  actionLoading: boolean;
  clearActionError: () => void;

  // Pagination & filtres
  clientsPage: number;
  clientsCount: number;
  clientsHasNext: boolean;
  clientsHasPrevious: boolean;
  clientsLoading: boolean;
  setClientsPage: (page: number) => void;
  searchClients: (query: string) => void;

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

  // Pas de création : l'inscription publique est l'unique source
  updateClient: (id: string, data: Partial<ClientData>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;

  updatePrestataire: (id: string, data: Partial<PrestataireData>) => Promise<void>;
  deletePrestataire: (id: string) => Promise<void>;
  verifyPrestataire: (id: string) => Promise<void>;
  affichePrestataire: (id: string) => Promise<void>;
  rejectPrestataire: (id: string) => Promise<void>;

  addService: (data: Omit<ServiceData, "id" | "dateAjout">) => Promise<void>;
  updateService: (id: string, data: Partial<ServiceData>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;

  refresh: () => Promise<void>;
}

const AdminStoreContext = createContext<AdminStoreContextValue | null>(null);

// ── Provider ─────────────────────────────────────────────

export function AdminStoreProvider({ children }: { children: React.ReactNode }) {
  const [prestataires, setPrestataires] = useState<PrestataireData[]>([]);
  const [services, setServices] = useState<ServiceData[]>([]);
  const [clients, setClients] = useState<ClientData[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [stats, setStats] = useState<AdminStoreContextValue["stats"]>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Pagination state
  const [clientsPage, setClientsPage] = useState(1);
  const [clientsCount, setClientsCount] = useState(0);
  const [clientsHasNext, setClientsHasNext] = useState(false);
  const [clientsHasPrevious, setClientsHasPrevious] = useState(false);
  const [clientsLoading, setClientsLoading] = useState(false);
  const clientsFilterRef = useRef<{ search: string; page: number }>({ search: "", page: 1 });

  const [servicesPage, setServicesPage] = useState(1);
  const [servicesCount, setServicesCount] = useState(0);
  const [servicesHasNext, setServicesHasNext] = useState(false);
  const [servicesHasPrevious, setServicesHasPrevious] = useState(false);
  const [servicesLoading, setServicesLoading] = useState(false);
  const servicesFilterRef = useRef<{ search: string; page: number; filters: { active?: boolean } }>({ search: "", page: 1, filters: {} });

  const [prestatairesPage, setPrestatairesPage] = useState(1);
  const [prestatairesCount, setPrestatairesCount] = useState(0);
  const [prestatairesHasNext, setPrestatairesHasNext] = useState(false);
  const [prestatairesHasPrevious, setPrestatairesHasPrevious] = useState(false);
  const [prestatairesLoading, setPrestatairesLoading] = useState(false);
  const prestatairesFilterRef = useRef<{ search: string; page: number; filters: { status?: string; service?: number } }>({ search: "", page: 1, filters: {} });

  // ── Chargement depuis l'API ──
  const loadFromApi = useCallback(async () => {
    try {
      setError(null);
      const { search: cSearch, page: cPage } = clientsFilterRef.current;
      const { search: sSearch, page: sPage, filters: sFilters } = servicesFilterRef.current;
      const { search: pSearch, page: pPage, filters: pFilters } = prestatairesFilterRef.current;
      const [clientsRes, servsRes, prestsRes, acts, sts] = await Promise.all([
        fetchClients(cSearch, cPage),
        fetchServices(sSearch, sPage, sFilters),
        fetchPrestataires(pSearch, pPage, pFilters),
        fetchActivities(),
        fetchStats(),
      ]);

      setClients(clientsRes.data);
      setClientsCount(clientsRes.count);
      setClientsHasNext(!!clientsRes.next);
      setClientsHasPrevious(!!clientsRes.previous);

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
        affichePrestataires: sts.affiche_prestataires,
        pendingPrestataires: sts.pending_prestataires,
        totalPrestataires: sts.total_prestataires,
        totalClients: sts.total_clients,
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

  const searchClients = useCallback(async (query: string) => {
    setClientsLoading(true);
    try {
      const res = await fetchClients(query, 1);
      setClients(res.data);
      setClientsCount(res.count);
      setClientsHasNext(!!res.next);
      setClientsHasPrevious(!!res.previous);
      setClientsPage(1);
      clientsFilterRef.current = { search: query, page: 1 };
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || "Erreur lors de la recherche.");
    } finally {
      setClientsLoading(false);
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
      servicesFilterRef.current = { search: query, page: 1, filters };
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
      prestatairesFilterRef.current = { search: query, page: 1, filters };
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || "Erreur lors de la recherche.");
    } finally {
      setPrestatairesLoading(false);
    }
  }, []);

  // ── Pagination serveur ──

  const loadClientsPage = useCallback(async (page: number) => {
    setClientsLoading(true);
    try {
      const { search } = clientsFilterRef.current;
      const res = await fetchClients(search, page);
      setClients(res.data);
      setClientsCount(res.count);
      setClientsHasNext(!!res.next);
      setClientsHasPrevious(!!res.previous);
      setClientsPage(page);
      clientsFilterRef.current = { ...clientsFilterRef.current, page };
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || "Erreur lors du chargement.");
    } finally {
      setClientsLoading(false);
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
      servicesFilterRef.current = { ...servicesFilterRef.current, page };
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
      prestatairesFilterRef.current = { ...prestatairesFilterRef.current, page };
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || "Erreur lors du chargement.");
    } finally {
      setPrestatairesLoading(false);
    }
  }, []);

  // ── Synchronisation serveur après CRUD ──

  const refreshStats = useCallback(async () => {
    try {
      const sts = await fetchStats();
      setStats({
        totalUsers: sts.total_users,
        newUsersWeek: sts.new_users_week,
        activePrestataires: sts.active_prestataires,
        affichePrestataires: sts.affiche_prestataires,
        pendingPrestataires: sts.pending_prestataires,
        totalPrestataires: sts.total_prestataires,
        totalClients: sts.total_clients,
        totalServices: sts.total_services,
        activeServices: sts.active_services,
      });
    } catch {
      // silencieux
    }
  }, []);

  const refreshActivities = useCallback(async () => {
    try {
      const acts = await fetchActivities();
      setActivities(acts);
    } catch {
      // silencieux
    }
  }, []);

  // ── Clients ──
  // Pas de création ici : les clients sont créés UNIQUEMENT via l'inscription publique.

  const handleUpdateClient = useCallback(async (id: string, data: Partial<ClientData>) => {
    setActionLoading(true);
    setActionError(null);
    try {
      const updated = await updateClient(id, data);
      setClients((prev) => prev.map((c) => (c.id === id ? updated : c)));
      await Promise.all([refreshStats(), refreshActivities()]);
    } catch (err: any) {
      setActionError(err?.response?.data?.detail || err?.message || "Erreur lors de la mise à jour.");
    } finally {
      setActionLoading(false);
    }
  }, [refreshStats, refreshActivities]);

  const handleDeleteClient = useCallback(async (id: string) => {
    setActionLoading(true);
    setActionError(null);
    try {
      await deleteClient(id);
      setClients((prev) => prev.filter((c) => c.id !== id));
      setClientsCount((c) => Math.max(0, c - 1));
      await Promise.all([refreshStats(), refreshActivities()]);
    } catch (err: any) {
      setActionError(err?.response?.data?.detail || err?.message || "Erreur lors de la suppression.");
    } finally {
      setActionLoading(false);
    }
  }, [refreshStats, refreshActivities]);

  // ── Prestataires ──
  // Pas de création ici : les prestataires sont créés UNIQUEMENT via l'inscription publique.

  const applyPrestataireStatus = useCallback(async (id: string, action: "verify" | "affiche" | "reject") => {
    setActionLoading(true);
    setActionError(null);
    try {
      const updated = await setPrestataireStatus(id, action);
      setPrestataires((prev) => prev.map((p) => (p.id === id ? updated : p)));
      await Promise.all([refreshStats(), refreshActivities()]);
    } catch (err: any) {
      setActionError(err?.response?.data?.detail || err?.message || "Erreur lors du changement de statut.");
    } finally {
      setActionLoading(false);
    }
  }, [refreshStats, refreshActivities]);

  const verifyPrestataire = useCallback((id: string) => applyPrestataireStatus(id, "verify"), [applyPrestataireStatus]);
  const affichePrestataire = useCallback((id: string) => applyPrestataireStatus(id, "affiche"), [applyPrestataireStatus]);
  const rejectPrestataire = useCallback((id: string) => applyPrestataireStatus(id, "reject"), [applyPrestataireStatus]);

  const handleUpdatePrestataire = useCallback(async (id: string, data: Partial<PrestataireData>) => {
    setActionLoading(true);
    setActionError(null);
    try {
      const updated = await apiUpdatePrestataire(id, data);
      setPrestataires((prev) => prev.map((p) => (p.id === id ? updated : p)));
      await Promise.all([refreshStats(), refreshActivities()]);
    } catch (err: any) {
      setActionError(err?.response?.data?.detail || err?.message || "Erreur lors de la mise à jour.");
    } finally {
      setActionLoading(false);
    }
  }, [refreshStats, refreshActivities]);

  const handleDeletePrestataire = useCallback(async (id: string) => {
    setActionLoading(true);
    setActionError(null);
    try {
      await apiDeletePrestataire(id);
      setPrestataires((prev) => prev.filter((p) => p.id !== id));
      setPrestatairesCount((c) => Math.max(0, c - 1));
      await Promise.all([refreshStats(), refreshActivities()]);
    } catch (err: any) {
      setActionError(err?.response?.data?.detail || err?.message || "Erreur lors de la suppression.");
    } finally {
      setActionLoading(false);
    }
  }, [refreshStats, refreshActivities]);

  // ── Services (création admin autorisée) ──

  const handleAddService = useCallback(async (data: Omit<ServiceData, "id" | "dateAjout">) => {
    setActionLoading(true);
    setActionError(null);
    try {
      const created = await createService(data);
      setServices((prev) => [created, ...prev]);
      setServicesCount((c) => c + 1);
      await Promise.all([refreshStats(), refreshActivities()]);
    } catch (err: any) {
      setActionError(err?.response?.data?.detail || err?.message || "Erreur lors de la création.");
    } finally {
      setActionLoading(false);
    }
  }, [refreshStats, refreshActivities]);

  const handleUpdateService = useCallback(async (id: string, data: Partial<ServiceData>) => {
    setActionLoading(true);
    setActionError(null);
    try {
      const updated = await apiUpdateService(id, data);
      setServices((prev) => prev.map((s) => (s.id === id ? updated : s)));
      await Promise.all([refreshStats(), refreshActivities()]);
    } catch (err: any) {
      setActionError(err?.response?.data?.detail || err?.message || "Erreur lors de la mise à jour.");
    } finally {
      setActionLoading(false);
    }
  }, [refreshStats, refreshActivities]);

  const handleDeleteService = useCallback(async (id: string) => {
    setActionLoading(true);
    setActionError(null);
    try {
      await apiDeleteService(id);
      setServices((prev) => prev.filter((s) => s.id !== id));
      setServicesCount((c) => Math.max(0, c - 1));
      await Promise.all([refreshStats(), refreshActivities()]);
    } catch (err: any) {
      setActionError(err?.response?.data?.detail || err?.message || "Erreur lors de la suppression.");
    } finally {
      setActionLoading(false);
    }
  }, [refreshStats, refreshActivities]);

  // ── Refresh global ──

  const refresh = useCallback(async () => {
    setLoading(true);
    await loadFromApi();
  }, [loadFromApi]);

  return (
    <AdminStoreContext.Provider
      value={{
        prestataires,
        services,
        clients,
        activities,
        stats,
        loading,
        error,
        actionError,
        actionLoading,
        clearActionError: () => setActionError(null),

        clientsPage,
        clientsCount,
        clientsHasNext,
        clientsHasPrevious,
        clientsLoading,
        setClientsPage: loadClientsPage,
        searchClients,

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

        updateClient: handleUpdateClient,
        deleteClient: handleDeleteClient,

        updatePrestataire: handleUpdatePrestataire,
        deletePrestataire: handleDeletePrestataire,
        verifyPrestataire,
        affichePrestataire,
        rejectPrestataire,

        addService: handleAddService,
        updateService: handleUpdateService,
        deleteService: handleDeleteService,

        refresh,
      }}
    >
      {children}
    </AdminStoreContext.Provider>
  );
}

// Hook pratique pour consommer le store
export function useAdminStore() {
  const context = useContext(AdminStoreContext);
  if (!context) {
    throw new Error("useAdminStore must be used within an AdminStoreProvider");
  }
  return context;
}
