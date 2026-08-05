import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  Mail,
  Phone,
  Calendar,
  AtSign,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  X,
} from "lucide-react";
import { useAdminStore } from "../AdminStore";
import type { ClientData } from "../types";

// ─── ClientForm (édition uniquement, jamais de création) ───

function ClientForm({
  open,
  onClose,
  onSave,
  editData,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<ClientData>) => void;
  editData?: ClientData | null;
}) {
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [errors, setErrors] = useState<{ prenom?: string; nom?: string; email?: string }>({});

  useEffect(() => {
    if (!open) return;
    if (editData) {
      setPrenom(editData.prenom);
      setNom(editData.nom);
      setEmail(editData.email);
      setTelephone(editData.telephone);
    } else {
      setPrenom("");
      setNom("");
      setEmail("");
      setTelephone("");
    }
    setErrors({});
  }, [open, editData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};
    if (!prenom.trim()) newErrors.prenom = "Le prénom est requis.";
    if (!nom.trim()) newErrors.nom = "Le nom est requis.";
    if (!email.trim()) newErrors.email = "L'email est requis.";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSave({ prenom: prenom.trim(), nom: nom.trim(), email: email.trim(), telephone: telephone.trim() });
    onClose();
  };

  const inputClass = (field: keyof typeof errors) =>
    `w-full rounded-xl border py-2.5 px-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:ring-2 dark:text-white dark:placeholder-slate-500 ${
      errors[field]
        ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-500/20 dark:border-red-700 dark:bg-red-900/20"
        : "border-slate-200 bg-slate-50 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/50 dark:focus:border-blue-500 dark:focus:bg-slate-800"
    }`;

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
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Modifier le client</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {editData?.username ?? ""}
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

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Prénom</label>
                    <input
                      type="text"
                      value={prenom}
                      onChange={(e) => setPrenom(e.target.value)}
                      className={`mt-1.5 ${inputClass("prenom")}`}
                    />
                    {errors.prenom && <p className="mt-1 text-xs text-red-500">{errors.prenom}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nom</label>
                    <input
                      type="text"
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                      className={`mt-1.5 ${inputClass("nom")}`}
                    />
                    {errors.nom && <p className="mt-1 text-xs text-red-500">{errors.nom}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`mt-1.5 ${inputClass("email")}`}
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Téléphone</label>
                  <input
                    type="tel"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:focus:border-blue-500 dark:focus:bg-slate-800"
                  />
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
                    className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl active:scale-[0.98]"
                  >
                    Enregistrer
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
  onClose,
  onConfirm,
}: {
  target: ClientData | null;
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
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Supprimer le client « {target.prenom} {target.nom} » ({target.username}) ? Son compte sera aussi supprimé.
                </p>
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

// ─── Page Clients ────────────────────────────────────────

export default function Client() {
  const {
    clients,
    updateClient,
    deleteClient,
    clientsCount,
    clientsPage,
    clientsHasNext,
    clientsHasPrevious,
    clientsLoading,
    setClientsPage,
    searchClients,
  } = useAdminStore();

  const [editData, setEditData] = useState<ClientData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ClientData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Recherche serveur avec debounce
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      searchClients(searchQuery);
    }, 400);
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [searchQuery, searchClients]);

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(clientsCount / pageSize));

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
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Gestion des clients</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {clientsCount} client{clientsCount > 1 ? "s" : ""} — les comptes sont créés par l'inscription publique
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mt-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un client..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Clients table */}
      <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/90">
        <div className="overflow-x-auto">
          {clientsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            </div>
          ) : clients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                <Users className="h-6 w-6 text-slate-400" />
              </div>
              <p className="mt-4 text-sm font-medium text-slate-600 dark:text-slate-300">Aucun client trouvé</p>
              <p className="mt-1 text-xs text-slate-400">Modifiez vos filtres de recherche.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200/60 dark:border-slate-700/60">
                  <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Client</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Contact</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Username</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Inscription</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-slate-700/60">
                {clients.map((client) => (
                  <tr key={client.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-[10px] font-bold text-white">
                          {client.prenom[0]}{client.nom[0]}
                        </div>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {client.prenom} {client.nom}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                          <Mail className="h-3.5 w-3.5" />
                          <span className="text-xs">{client.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                          <Phone className="h-3.5 w-3.5" />
                          <span className="text-xs">{client.telephone || "—"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        <AtSign className="h-3 w-3" />
                        {client.username}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <Calendar className="h-3.5 w-3.5" />
                        <span className="text-xs">{client.dateAjout}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditData(client)}
                          title="Modifier"
                          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(client)}
                          title="Supprimer"
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
        {clientsCount > 0 && (
          <div className="mt-4 flex items-center justify-between border-t border-slate-200/60 pt-4 dark:border-slate-700/60">
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Page {clientsPage} sur {totalPages} — {clientsCount} client{clientsCount > 1 ? "s" : ""} au total
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setClientsPage(clientsPage - 1)}
                disabled={!clientsHasPrevious}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-all hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                {clientsPage} / {totalPages}
              </span>
              <button
                onClick={() => setClientsPage(clientsPage + 1)}
                disabled={!clientsHasNext}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-all hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit modal */}
      <ClientForm
        open={!!editData}
        onClose={() => setEditData(null)}
        editData={editData}
        onSave={(data) => {
          if (editData) updateClient(editData.id, data);
        }}
      />

      {/* Delete modal */}
      <DeleteModal
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteClient(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </motion.div>
  );
}
