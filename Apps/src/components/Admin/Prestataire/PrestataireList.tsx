import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Mail,
  Calendar,
  X,
  Edit3,
  Trash2,
  ChevronDown,
} from "lucide-react";
import type { PrestataireData } from "../types";

const serviceColors: Record<string, string> = {
  Plomberie: "bg-blue-500/10 text-blue-600 dark:text-blue-300",
  Électricité: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-300",
  Jardinage: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
  Ménage: "bg-pink-500/10 text-pink-600 dark:text-pink-300",
  Déménagement: "bg-orange-500/10 text-orange-600 dark:text-orange-300",
  Informatique: "bg-violet-500/10 text-violet-600 dark:text-violet-300",
};

const statutColors: Record<string, string> = {
  Actif: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Inactif: "bg-red-500/10 text-red-600 dark:text-red-400",
  "En attente": "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

const ALL_SERVICES = ["Plomberie", "Électricité", "Jardinage", "Ménage", "Déménagement", "Informatique"];

export default function PrestataireList({
  prestataires,
  searchQuery,
  onSearchChange,
  filterService,
  onFilterChange,
  filterStatut,
  onFilterStatutChange,
  loading = false,
  onEdit,
  onDelete,
}: {
  prestataires: PrestataireData[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  filterService: string;
  onFilterChange: (s: string) => void;
  filterStatut: string;
  onFilterStatutChange: (s: string) => void;
  loading?: boolean;
  onEdit: (p: PrestataireData) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/90">
      {/* Search & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Rechercher un prestataire..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder-slate-500 dark:focus:border-amber-500 dark:focus:bg-slate-800"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <select
            value={filterService}
            onChange={(e) => onFilterChange(e.target.value)}
            className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm font-medium text-slate-600 outline-none transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:focus:border-amber-500 sm:w-44"
          >
            <option value="">Tous les services</option>
            {ALL_SERVICES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
        <div className="relative">
          <select
            value={filterStatut}
            onChange={(e) => onFilterStatutChange(e.target.value)}
            className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-4 pr-10 text-sm font-medium text-slate-600 outline-none transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:focus:border-amber-500 sm:w-40"
          >
            <option value="">Tous les statuts</option>
            <option value="Actif">Actif</option>
            <option value="Inactif">Inactif</option>
            <option value="En attente">En attente</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      {/* Active filters */}
      {(searchQuery || filterService || filterStatut) && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400">Filtres actifs:</span>
          {searchQuery && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-medium text-amber-600 dark:text-amber-400">
              Recherche: "{searchQuery}"
              <button onClick={() => onSearchChange("")}>
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {filterService && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-medium text-amber-600 dark:text-amber-400">
              Service: {filterService}
              <button onClick={() => onFilterChange("")}>
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {filterStatut && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-medium text-amber-600 dark:text-amber-400">
              Statut: {filterStatut}
              <button onClick={() => onFilterStatutChange("")}>
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          <button
            onClick={() => { onSearchChange(""); onFilterChange(""); onFilterStatutChange(""); }}
            className="text-[10px] font-medium text-slate-400 underline hover:text-slate-600 dark:hover:text-slate-300"
          >
            Tout effacer
          </button>
        </div>
      )}

      {/* Table */}
      <div className="mt-5 overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
          </div>
        ) : prestataires.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
              <Search className="h-6 w-6 text-slate-400" />
            </div>
            <p className="mt-4 text-sm font-medium text-slate-600 dark:text-slate-300">
              Aucun prestataire trouvé
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Essayez de modifier vos filtres de recherche.
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200/60 dark:border-slate-700/60">
                <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Prestataire</th>
                <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Service</th>
                <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Statut</th>
                <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Date d'ajout</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-700/60">
              {prestataires.map((p) => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-[10px] font-bold text-white">
                        {p.prenom[0]}{p.nom[0]}
                      </div>
                      <div>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {p.prenom} {p.nom}
                        </span>
                        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                          <Mail className="h-3 w-3" />
                          <span className="text-xs">{p.email}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${serviceColors[p.service] || "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>
                      {p.service}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium ${statutColors[p.statut] || "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        p.statut === "Actif" ? "bg-emerald-500" :
                        p.statut === "Inactif" ? "bg-red-500" : "bg-amber-500"
                      }`} />
                      {p.statut}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <Calendar className="h-3.5 w-3.5" />
                      <span className="text-xs">{p.dateAjout}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onEdit(p)}
                        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(p.id)}
                        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {prestataires.length > 0 && (
        <div className="mt-4 flex items-center justify-between border-t border-slate-200/60 pt-4 dark:border-slate-700/60">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {prestataires.length} prestataire{prestataires.length > 1 ? "s" : ""} trouvé{prestataires.length > 1 ? "s" : ""}
          </p>
        </div>
      )}
    </div>
  );
}