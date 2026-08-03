import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  Shield,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAdminStore } from "../AdminStore";
import type { UtilisateurData } from "../types";
import UserForm from "./UserForm.tsx";
import DeleteModal from "./DeleteModal.tsx";

export default function Utilisateur() {
  const {
    utilisateurs,
    addUtilisateur,
    updateUtilisateur,
    deleteUtilisateur,
    usersCount,
    usersPage,
    usersHasNext,
    usersHasPrevious,
    usersLoading,
    setUsersPage,
    searchUsers,
  } = useAdminStore();

  const [formOpen, setFormOpen] = useState(false);
  const [editData, setEditData] = useState<UtilisateurData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UtilisateurData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatut, setFilterStatut] = useState("");
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Recherche serveur avec debounce
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      const filters: { is_active?: boolean; is_staff?: boolean } = {};
      if (filterStatut === "Actif") filters.is_active = true;
      else if (filterStatut === "Inactif") filters.is_active = false;
      if (filterRole === "Admin") filters.is_staff = true;
      else if (filterRole === "Client") filters.is_staff = false;
      searchUsers(searchQuery, filters);
    }, 400);
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [searchQuery, filterRole, filterStatut, searchUsers]);

  const handleFormClose = () => {
    setFormOpen(false);
    setEditData(null);
  };

  const statutColors: Record<string, string> = {
    Actif: "text-emerald-600 dark:text-emerald-400",
    Inactif: "text-red-500 dark:text-red-400",
    "En attente": "text-amber-600 dark:text-amber-400",
  };

  const statutDots: Record<string, string> = {
    Actif: "bg-emerald-500",
    Inactif: "bg-red-500",
    "En attente": "bg-amber-500",
  };

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(usersCount / pageSize));

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
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Gestion des utilisateurs</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {usersCount} utilisateur{usersCount > 1 ? "s" : ""} sur la plateforme
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setFormOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl active:scale-[0.98]"
          >
            <UserPlus className="h-4 w-4" />
            Ajouter un utilisateur
          </button>
        </div>

        {/* Search & Filters */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un utilisateur..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-800"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-4 pr-10 text-sm font-medium text-slate-600 outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 sm:w-40"
          >
            <option value="">Tous les rôles</option>
            <option value="Client">Client</option>
            <option value="Prestataire">Prestataire</option>
            <option value="Admin">Admin</option>
          </select>
          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-4 pr-10 text-sm font-medium text-slate-600 outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 sm:w-40"
          >
            <option value="">Tous les statuts</option>
            <option value="Actif">Actif</option>
            <option value="Inactif">Inactif</option>
            <option value="En attente">En attente</option>
          </select>
        </div>
      </div>

      {/* Users table */}
      <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/90">
        <div className="overflow-x-auto">
          {usersLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            </div>
          ) : utilisateurs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                <Users className="h-6 w-6 text-slate-400" />
              </div>
              <p className="mt-4 text-sm font-medium text-slate-600 dark:text-slate-300">Aucun utilisateur trouvé</p>
              <p className="mt-1 text-xs text-slate-400">Ajoutez un utilisateur ou modifiez vos filtres.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200/60 dark:border-slate-700/60">
                  <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Utilisateur</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Contact</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Rôle</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Statut</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Inscription</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-slate-700/60">
                {utilisateurs.map((user) => (
                  <tr key={user.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-[10px] font-bold text-white">
                          {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <span className="font-medium text-slate-900 dark:text-white">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                          <Mail className="h-3.5 w-3.5" />
                          <span className="text-xs">{user.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                          <Phone className="h-3.5 w-3.5" />
                          <span className="text-xs">{user.telephone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {user.role === "Admin" && <Shield className="h-3 w-3" />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${statutColors[user.statut]}`}>
                        <span className={`h-2 w-2 rounded-full ${statutDots[user.statut]}`} />
                        {user.statut}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <Calendar className="h-3.5 w-3.5" />
                        <span className="text-xs">{user.dateAjout}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setEditData(user); setFormOpen(true); }}
                          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(user)}
                          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {usersCount > 0 && (
          <div className="mt-4 flex items-center justify-between border-t border-slate-200/60 pt-4 dark:border-slate-700/60">
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Page {usersPage} sur {totalPages} — {usersCount} utilisateur{usersCount > 1 ? "s" : ""} au total
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setUsersPage(usersPage - 1)}
                disabled={!usersHasPrevious}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-all hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                {usersPage} / {totalPages}
              </span>
              <button
                onClick={() => setUsersPage(usersPage + 1)}
                disabled={!usersHasNext}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-all hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit modal */}
      <UserForm
        open={formOpen}
        onClose={handleFormClose}
        editData={editData}
        onSave={(data: Omit<UtilisateurData, "id" | "dateAjout">) => {
          if (editData) {
            updateUtilisateur(editData.id, data);
          } else {
            addUtilisateur(data);
          }
        }}
      />

      {/* Delete confirmation */}
      <DeleteModal
        target={deleteTarget}
        title={deleteTarget ? `Supprimer l'utilisateur "${deleteTarget.name}" ?` : ""}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteUtilisateur(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </motion.div>
  );
}