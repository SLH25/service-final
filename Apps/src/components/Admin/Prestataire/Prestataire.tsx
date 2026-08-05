import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Briefcase, ChevronLeft, ChevronRight } from "lucide-react";
import { useAdminStore } from "../AdminStore";
import type { PrestataireData } from "../types";
import { getServiceIdMap, refreshServiceIdMap } from "../adminApi";
import PrestataireList from "./PrestataireList";
import PrestataireForm from "./PrestataireForm";

type DeleteModalProps = {
  target: PrestataireData | null;
  title: string;
  onClose: () => void;
  onConfirm: () => void;
};

function DeleteModal({ target, title, onClose, onConfirm }: DeleteModalProps) {
  if (!target) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          Cette action est irréversible.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Prestataire() {
  const {
    prestataires,
    updatePrestataire,
    deletePrestataire,
    verifyPrestataire,
    affichePrestataire,
    prestatairesCount,
    prestatairesPage,
    prestatairesHasNext,
    prestatairesHasPrevious,
    prestatairesLoading,
    setPrestatairesPage,
    searchPrestataires,
  } = useAdminStore();

  const [formOpen, setFormOpen] = useState(false);
  const [editData, setEditData] = useState<PrestataireData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PrestataireData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterService, setFilterService] = useState("");
  const [filterStatut, setFilterStatut] = useState("");
  const [availableServices, setAvailableServices] = useState<string[]>([]);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Charger TOUS les services (actifs + inactifs) pour le filtre et la map nom → ID.
  useEffect(() => {
    refreshServiceIdMap()
      .then((map) => {
        setAvailableServices(Object.keys(map));
      })
      .catch(() => {
        setAvailableServices([]);
      });
  }, []);

  // Recherche serveur avec debounce
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      const filters: { status?: string; service?: number } = {};
      if (filterStatut) filters.status = filterStatut;
      if (filterService) {
        const serviceId = getServiceIdMap()[filterService];
        if (serviceId) filters.service = serviceId;
      }
      searchPrestataires(searchQuery, filters);
    }, 400);
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [searchQuery, filterService, filterStatut, searchPrestataires]);

  const handleFormClose = () => {
    setFormOpen(false);
    setEditData(null);
  };

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(prestatairesCount / pageSize));

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
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300">
                <Briefcase className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Gestion des prestataires
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {prestatairesCount} prestataire{prestatairesCount > 1 ? "s" : ""} — les inscriptions proviennent du site public
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* List with search & filter */}
      <PrestataireList
        prestataires={prestataires}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterService={filterService}
        onFilterChange={setFilterService}
        filterStatut={filterStatut}
        onFilterStatutChange={setFilterStatut}
        loading={prestatairesLoading}
        availableServices={availableServices}
        onEdit={(p) => { setEditData(p); setFormOpen(true); }}
        onDelete={(id) => {
          const target = prestataires.find((p) => p.id === id);
          if (target) setDeleteTarget(target);
        }}
        onVerify={(id) => verifyPrestataire(id)}
        onAffiche={(id) => affichePrestataire(id)}
      />

      {/* Pagination */}
      {prestatairesCount > 0 && (
        <div className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white/90 px-6 py-4 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/90">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Page {prestatairesPage} sur {totalPages} — {prestatairesCount} prestataire{prestatairesCount > 1 ? "s" : ""} au total
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPrestatairesPage(prestatairesPage - 1)}
              disabled={!prestatairesHasPrevious}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-all hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
              {prestatairesPage} / {totalPages}
            </span>
            <button
              onClick={() => setPrestatairesPage(prestatairesPage + 1)}
              disabled={!prestatairesHasNext}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-all hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Edit form modal (pas de création : inscription publique uniquement) */}
      <PrestataireForm
        open={formOpen}
        onClose={handleFormClose}
        editData={editData}
        onSave={(data) => {
          if (editData) {
            updatePrestataire(editData.id, data);
          }
        }}
      />

      {/* Delete confirmation */}
      <DeleteModal
        target={deleteTarget}
        title={deleteTarget ? `Supprimer le prestataire "${deleteTarget.prenom} ${deleteTarget.nom}" ?` : ""}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deletePrestataire(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </motion.div>
  );
}
