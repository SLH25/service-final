import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wrench, Plus, Search, Edit3, Trash2, X, CheckCircle, AlertTriangle, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useAdminStore } from "../AdminStore";
import type { ServiceData, Statut } from "../types";

export default function Service() {
  const {
    services,
    addService,
    updateService,
    deleteService,
    servicesCount,
    servicesPage,
    servicesHasNext,
    servicesHasPrevious,
    servicesLoading,
    setServicesPage,
    searchServices,
  } = useAdminStore();

  const [formOpen, setFormOpen] = useState(false);
  const [editData, setEditData] = useState<ServiceData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ServiceData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatut, setFilterStatut] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Recherche serveur avec debounce
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      const filters: { active?: boolean } = {};
      if (filterStatut === "Actif") filters.active = true;
      else if (filterStatut === "Inactif") filters.active = false;
      searchServices(searchQuery, filters);
    }, 400);
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [searchQuery, filterStatut, searchServices]);

  const handleFormClose = () => {
    setFormOpen(false);
    setEditData(null);
  };

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(servicesCount / pageSize));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto max-w-7xl space-y-6"
    >
      {/* Header */}
      <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/90">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
                <Wrench className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Gestion des services</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {servicesCount} service{servicesCount > 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setFormOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Ajouter un service
          </button>
        </div>

        {/* Search & Filter */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un service..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-500/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder-slate-500 dark:focus:border-violet-500 dark:focus:bg-slate-800"
            />
          </div>
          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-4 pr-10 text-sm font-medium text-slate-600 outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 sm:w-40"
          >
            <option value="">Tous les statuts</option>
            <option value="Actif">Actif</option>
            <option value="Inactif">Inactif</option>
            <option value="En attente">En attente</option>
          </select>
        </div>
      </div>

      {/* Services grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {servicesLoading ? (
          <div className="col-span-full flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent"></div>
          </div>
        ) : services.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
              <Wrench className="h-6 w-6 text-slate-400" />
            </div>
            <p className="mt-4 text-sm font-medium text-slate-600 dark:text-slate-300">Aucun service trouvé</p>
            <p className="mt-1 text-xs text-slate-400">Ajoutez un service ou modifiez vos filtres.</p>
          </div>
        ) : (
          services.map((service) => (
            <div
              key={service.id}
              className="group rounded-2xl border border-slate-200/70 bg-white/90 p-5 shadow-sm transition-all hover:border-violet-300 hover:shadow-lg dark:border-slate-700/80 dark:bg-slate-900/90 dark:hover:border-violet-600"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
                  <Wrench className="h-5 w-5" />
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                    service.statut === "Actif"
                      ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
                      : service.statut === "Inactif"
                      ? "bg-red-500/10 text-red-600 dark:bg-red-500/15 dark:text-red-400"
                      : "bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      service.statut === "Actif" ? "bg-emerald-500" : service.statut === "Inactif" ? "bg-red-500" : "bg-amber-500"
                    }`}
                  />
                  {service.statut}
                </span>
              </div>

              <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">{service.name}</h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{service.description}</p>

              <div className="mt-4 flex items-center justify-between border-t border-slate-200/60 pt-3 dark:border-slate-700/60">
                <span className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
                  <Calendar className="h-3 w-3" />
                  {service.dateAjout}
                </span>
                <div className="flex gap-1 opacity-0 transition-all group-hover:opacity-100">
                  <button
                    onClick={() => { setEditData(service); setFormOpen(true); }}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-violet-500/10 hover:text-violet-600 dark:hover:text-violet-400"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(service)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {servicesCount > 0 && (
        <div className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white/90 px-6 py-4 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/90">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Page {servicesPage} sur {totalPages} — {servicesCount} service{servicesCount > 1 ? "s" : ""} au total
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setServicesPage(servicesPage - 1)}
              disabled={!servicesHasPrevious}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-all hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
              {servicesPage} / {totalPages}
            </span>
            <button
              onClick={() => setServicesPage(servicesPage + 1)}
              disabled={!servicesHasNext}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-all hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit modal */}
      <ServiceForm
        open={formOpen}
        onClose={handleFormClose}
        editData={editData}
        onSave={async (data) => {
          setActionError(null);
          setActionLoading(true);
          try {
            if (editData) {
              await updateService(editData.id, data);
            } else {
              await addService(data);
            }
          } catch (err: any) {
            setActionError(err?.response?.data?.detail || err?.message || "Erreur lors de l'enregistrement.");
          } finally {
            setActionLoading(false);
          }
        }}
      />

      {/* Delete confirmation */}
      <DeleteModal
        target={deleteTarget}
        title={deleteTarget ? `Supprimer le service "${deleteTarget.name}" ?` : ""}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          setActionError(null);
          setActionLoading(true);
          try {
            await deleteService(deleteTarget.id);
            setDeleteTarget(null);
          } catch (err: any) {
            setActionError(err?.response?.data?.detail || err?.message || "Erreur lors de la suppression.");
          } finally {
            setActionLoading(false);
          }
        }}
      />

      {/* Toast d'erreur */}
      {actionError && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 shadow-lg dark:border-red-800 dark:bg-red-950/80">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
          <p className="text-sm font-medium text-red-700 dark:text-red-300">{actionError}</p>
          <button
            onClick={() => setActionError(null)}
            className="ml-2 text-red-400 hover:text-red-600 dark:hover:text-red-300"
          >
            ✕
          </button>
        </div>
      )}

      {/* Overlay de chargement */}
      {actionLoading && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
      )}
    </motion.div>
  );
}

// ─── ServiceForm ─────────────────────────────────────────

function ServiceForm({
  open,
  onClose,
  onSave,
  editData,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<ServiceData, "id" | "dateAjout">) => void;
  editData?: ServiceData | null;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [statut, setStatut] = useState<Statut>("Actif");
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [notification, setNotification] = useState<string | null>(null);

  const isEditing = !!editData;

  // Reset form when modal opens
  useEffect(() => {
    if (!open) return;
    if (editData) {
      setName(editData.name);
      setDescription(editData.description);
      setStatut(editData.statut);
    } else {
      setName("");
      setDescription("");
      setStatut("Actif");
    }
    setErrors({});
    setNotification(null);
  }, [open, editData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrors({ name: "Le nom du service est requis." });
      return;
    }
    onSave({ name: name.trim(), description: description.trim(), statut });
    setNotification(isEditing ? "Service modifié avec succès !" : "Service ajouté avec succès !");
    setTimeout(() => {
      setNotification(null);
      onClose();
    }, 1200);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="w-full max-w-md rounded-2xl border border-slate-200/70 bg-white p-6 shadow-xl dark:border-slate-700/80 dark:bg-slate-900"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
                    <Wrench className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      {isEditing ? "Modifier le service" : "Ajouter un service"}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {isEditing ? "Modifiez les informations" : "Remplissez les informations"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <AnimatePresence>
                {notification && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-600 dark:text-emerald-400"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {notification}
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nom du service</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Plomberie"
                    className={`mt-1.5 w-full rounded-xl border py-2.5 px-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:ring-2 dark:text-white dark:placeholder-slate-500 ${
                      errors.name
                        ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-500/20 dark:border-red-700 dark:bg-red-900/20"
                        : "border-slate-200 bg-slate-50 focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-500/20 dark:border-slate-700 dark:bg-slate-800/50 dark:focus:border-violet-500 dark:focus:bg-slate-800"
                    }`}
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description du service..."
                    rows={3}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-500/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder-slate-500 dark:focus:border-violet-500 dark:focus:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Statut</label>
                  <select
                    value={statut}
                    onChange={(e) => setStatut(e.target.value as Statut)}
                    className="mt-1.5 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm text-slate-900 outline-none transition-all focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-500/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white"
                  >
                    <option value="Actif">Actif</option>
                    <option value="Inactif">Inactif</option>
                  </select>
                </div>

                <div className="mt-6 flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl active:scale-[0.98]"
                  >
                    {isEditing ? "Enregistrer" : "Valider"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── DeleteModal ─────────────────────────────────────────

function DeleteModal({
  target,
  title,
  onClose,
  onConfirm,
}: {
  target: ServiceData | null;
  title: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <AnimatePresence>
      {target && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="w-full max-w-md rounded-2xl border border-slate-200/70 bg-white p-6 shadow-xl dark:border-slate-700/80 dark:bg-slate-900"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-600 dark:bg-red-500/15 dark:text-red-400">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Confirmer la suppression</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Cette action est irréversible.</p>
                </div>
              </div>

              <div className="mt-6 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
                <p className="text-sm text-slate-600 dark:text-slate-300">{title}</p>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  Annuler
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-500/25 transition-all hover:shadow-xl active:scale-[0.98]"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}