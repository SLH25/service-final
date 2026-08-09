// src/components/PrestataireCard.tsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  ArrowRight,
  BadgeCheck,
  Briefcase,
  CalendarDays,
  Clock,
  ThumbsUp,
} from "lucide-react";

// Données réellement exposées par l'API publique — aucune donnée fictive
export interface Provider {
  id: string;
  name: string;
  serviceName: string;
  location: string;
  photo: string;
  verified: boolean;
  experience: number | null;
  memberSince: string;
  avis: number;
}

// ── Avatar (photo ou monogramme) ────────────────────────────
// Palette de dégradés pour le monogramme (couleur dérivée du nom)
const AVATAR_GRADIENTS = [
  "from-blue-600 via-indigo-500 to-purple-600",
  "from-violet-600 via-purple-500 to-fuchsia-500",
  "from-emerald-500 via-teal-500 to-cyan-500",
  "from-orange-500 via-amber-500 to-yellow-400",
  "from-rose-500 via-pink-500 to-fuchsia-500",
  "from-sky-500 via-blue-500 to-indigo-600",
  "from-cyan-500 via-teal-500 to-emerald-500",
];

function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function gradientFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
}

// ── Formatage des valeurs dynamiques ────────────────────────
function formatExperience(years: number): string {
  return years === 1 ? "1 An" : `${years} Ans`;
}

function ProviderAvatar({ name, photo }: { name: string; photo: string }) {
  const [imgError, setImgError] = useState(false);
  const showPhoto = Boolean(photo) && !imgError;

  return (
    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full ring-4 ring-blue-100 dark:ring-blue-500/20 sm:h-24 sm:w-24">
      {showPhoto ? (
        <img
          src={photo}
          alt={name}
          loading="lazy"
          onError={() => setImgError(true)}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
        />
      ) : (
        <div
          className={`relative flex h-full w-full items-center justify-center bg-gradient-to-br ${gradientFor(name)}`}
        >
          {/* Motif décoratif */}
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                "radial-gradient(circle at 22% 28%, rgba(255,255,255,0.7) 0, transparent 42%), radial-gradient(circle at 82% 72%, rgba(255,255,255,0.5) 0, transparent 38%)",
            }}
            aria-hidden="true"
          />
          <span className="relative text-2xl font-extrabold tracking-tight text-white drop-shadow-md sm:text-3xl">
            {initialsOf(name)}
          </span>
        </div>
      )}

      {/* Badge vérifié flottant sur l'avatar */}
      {showPhoto && (
        <span
          title="Compte vérifié"
          className="absolute -bottom-1 -right-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md ring-2 ring-white dark:ring-gray-800"
        >
          <BadgeCheck className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
        </span>
      )}
    </div>
  );
}

interface PrestataireCardProps {
  provider: Provider;
}

const PrestataireCard: React.FC<PrestataireCardProps> = ({ provider }) => {
  return (
    <motion.article
      whileHover={{
        y: -8,
        transition: { type: "spring", stiffness: 400, damping: 25 },
      }}
      className="group relative h-full"
    >
      {/* Lueur au survol */}
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-500 via-purple-600 to-orange-500 opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-25"></div>

      {/* ── BORDURE / CADRE ─────────────────────────── */}
      <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border-2 border-blue-100 bg-white shadow-lg shadow-slate-200/50 transition-all duration-300 hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-500/10 dark:border-blue-500/20 dark:bg-gray-800/80 dark:shadow-none dark:hover:border-blue-500/40">
        {/* Ligne dégradée supérieure */}
        <div className="absolute top-0 left-0 right-0 z-10 h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-orange-400" />

        {/* ── ZONE 1 : HEADER (Layout vertical) ─────── */}
        <div className="flex flex-col items-center px-6 pt-10 pb-6 text-center">
          {/* Avatar rond */}
          <ProviderAvatar name={provider.name} photo={provider.photo} />

          {/* Domaine */}
          {provider.serviceName && (
            <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20">
              <Briefcase className="h-3 w-3" aria-hidden="true" />
              {provider.serviceName}
            </span>
          )}

          {/* Nom + badge vérifié */}
          <div className="mt-3 flex items-center justify-center gap-1.5">
            <h3 className="min-w-0 truncate text-lg font-bold tracking-tight text-gray-900 dark:text-white">
              {provider.name}
            </h3>
            {provider.verified && (
              <span
                title="Compte vérifié"
                className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-200/70 dark:bg-emerald-500/15 dark:ring-emerald-500/30"
              >
                <BadgeCheck
                  className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400"
                  strokeWidth={2.5}
                  aria-hidden="true"
                />
              </span>
            )}
          </div>

          {/* Localisation */}
          {provider.location && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-slate-500" aria-hidden="true" />
              <span className="truncate">{provider.location}</span>
            </div>
          )}
        </div>

        {/* ── Séparateur ─────────────────────────────── */}
        <div className="mx-6 border-t border-dashed border-gray-200 dark:border-gray-700" />

        {/* ── ZONE 2 : STATS (3 colonnes) ───────────── */}
        <div className="grid grid-cols-3 divide-x divide-gray-100 px-2 py-5 dark:divide-gray-700">
          {/* Expérience */}
          <div className="flex flex-col items-center gap-1 px-1">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {provider.experience != null ? formatExperience(provider.experience) : "—"}
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
              Expérience
            </span>
          </div>

          {/* Ancienneté du compte */}
          <div className="flex flex-col items-center gap-1 px-1">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
              <Clock className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">{provider.memberSince}</span>
            <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
              Membre
            </span>
          </div>

          {/* Avis */}
          <div className="flex flex-col items-center gap-1 px-1">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <ThumbsUp className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">{provider.avis}</span>
            <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
              Avis
            </span>
          </div>
        </div>

        {/* ── Séparateur ─────────────────────────────── */}
        <div className="mx-6 border-t border-dashed border-gray-200 dark:border-gray-700" />

        {/* ── ZONE 3 : BOUTON ────────────────────────── */}
        <div className="p-6 pt-5">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group/btn relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:from-yellow-500 hover:to-orange-600 hover:shadow-lg"
          >
            {/* Effet brillance */}
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
            <span className="relative flex items-center gap-2">
              Voir le profil
              <ArrowRight
                className="h-4 w-4 transform transition-transform group-hover/btn:translate-x-0.5"
                aria-hidden="true"
              />
            </span>
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
};

export default PrestataireCard;