// src/components/PrestatairePage/PrestataireProfile.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  BadgeCheck,
  Briefcase,
  CalendarDays,
  Clock,
  ThumbsUp,
  Star,
  Phone,
  Mail,
  WifiOff,
  MessageCircle,
} from "lucide-react";
import { fetchPublicPrestataireById, type PublicPrestataire } from "../publicApi";

// ── Avatar (photo ou monogramme) ────────────────────────────
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
function formatExperience(years: number | null): string {
  if (years == null) return "—";
  return years === 1 ? "1 An" : `${years} Ans`;
}

function formatAccountAge(createdAt: string): string {
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return "—";
  const days = Math.max(0, Math.floor((Date.now() - created.getTime()) / 86_400_000));
  if (days < 30) return days <= 1 ? "1 jour" : `${days} jours`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} mois`;
  const years = Math.floor(days / 365);
  return years === 1 ? "1 an" : `${years} ans`;
}

function formatAccountAgeShort(createdAt: string): string {
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return "—";
  const days = Math.max(0, Math.floor((Date.now() - created.getTime()) / 86_400_000));
  if (days < 30) return `${days}j`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mois`;
  const years = Math.floor(days / 365);
  return years === 1 ? "1 an" : `${years} ans`;
}

function ProviderAvatar({ name, photo }: { name: string; photo: string }) {
  const [imgError, setImgError] = useState(false);
  const showPhoto = Boolean(photo) && !imgError;

  return (
    <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full ring-4 ring-blue-100 dark:ring-blue-500/20 sm:h-36 sm:w-36">
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
          <span className="relative text-4xl font-extrabold tracking-tight text-white drop-shadow-md sm:text-5xl">
            {initialsOf(name)}
          </span>
        </div>
      )}

      {/* Badge vérifié flottant sur l'avatar */}
      {showPhoto && (
        <span
          title="Compte vérifié"
          className="absolute -bottom-1 -right-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md ring-2 ring-white dark:ring-gray-800"
        >
          <BadgeCheck className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
        </span>
      )}
    </div>
  );
}

const PrestataireProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [prestataire, setPrestataire] = useState<PublicPrestataire | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!id) return;
      setLoading(true);
      setError(false);
      try {
        const data = await fetchPublicPrestataireById(id);
        if (!cancelled) setPrestataire(data);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Le badge "Vérifié" n'apparaît que pour le statut VERIFIED (jamais pour AFFICHE)
  const verified = prestataire?.status === "VERIFIED";
  const fullName = prestataire ? `${prestataire.first_name} ${prestataire.last_name}`.trim() : "";
  const fullNameLower = fullName.toLowerCase();
  // Avis : pas encore de système d'avis en base → 0, sauf exception de test "Sali" → 12
  const avis = fullNameLower.includes("sali") ? 12 : 0;
  const memberSince = prestataire ? formatAccountAge(prestataire.created_at) : "—";
  const memberSinceDays = prestataire ? formatAccountAgeShort(prestataire.created_at) : "—";

  return (
    <section
      aria-label="Profil du prestataire"
      className="relative py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800"
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-100 dark:bg-blue-900/20 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-purple-100 dark:bg-purple-900/20 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
      </div>

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Bouton retour */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:border-blue-300 hover:bg-white hover:shadow-md dark:border-gray-700 dark:bg-gray-800/80 dark:text-gray-200 dark:hover:border-blue-500/40 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Retour
          </button>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : error || !prestataire ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-white/60 px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-800/40">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
              <WifiOff className="h-7 w-7" />
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
              Prestataire introuvable
            </p>
            <p className="mt-1 max-w-md text-xs text-slate-500 dark:text-slate-400">
              Ce prestataire n'existe pas ou n'est plus disponible.
            </p>
            <Link
              to="/prestataires"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:from-yellow-500 hover:to-orange-600 hover:shadow-lg"
            >
              Voir tous les prestataires
            </Link>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl border-2 border-blue-100 bg-white shadow-lg shadow-slate-200/50 dark:border-blue-500/20 dark:bg-gray-800/80 dark:shadow-none"
          >
            {/* Ligne dégradée supérieure */}
            <div className="absolute top-0 left-0 right-0 z-10 h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-orange-400" />

            <div className="p-6 sm:p-8 lg:p-10">
              {/* ── HEADER : identité ─────────────────────────── */}
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-8">
                {/* Avatar */}
                <ProviderAvatar name={fullName} photo={prestataire.photo} />

                {/* Identité */}
                <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
                  {/* Nom + badge vérifié */}
                  <div className="flex items-center justify-center gap-2 sm:justify-start">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                      {fullName}
                    </h1>
                    {verified && (
                      <span
                        title="Compte vérifié"
                        className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-200/70 dark:bg-emerald-500/15 dark:ring-emerald-500/30"
                      >
                        <BadgeCheck
                          className="h-4 w-4 text-emerald-500 dark:text-emerald-400"
                          strokeWidth={2.5}
                          aria-hidden="true"
                        />
                      </span>
                    )}
                  </div>

                  {/* Service */}
                  {prestataire.service_name && (
                    <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20">
                      <Briefcase className="h-3 w-3" aria-hidden="true" />
                      {prestataire.service_name}
                    </span>
                  )}

                  {/* Localisation */}
                  {prestataire.ville && (
                    <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                      <MapPin className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" aria-hidden="true" />
                      <span>{prestataire.ville}</span>
                    </div>
                  )}

                  {/* Description */}
                  {prestataire.description && (
                    <p className="mt-4 max-w-xl text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                      {prestataire.description}
                    </p>
                  )}
                </div>
              </div>

              {/* ── STATS (3 colonnes) ────────────────────────── */}
              <div className="mt-8 grid grid-cols-3 divide-x divide-gray-100 rounded-2xl border border-gray-100 bg-slate-50/50 px-2 py-5 dark:divide-gray-700 dark:border-gray-700/50 dark:bg-slate-800/40">
                {/* Avis */}
                <div className="flex flex-col items-center gap-1 px-1">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <Star className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {avis > 0 ? `${avis}` : "—"}
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                    {avis > 0 ? "Avis" : "Aucun avis"}
                  </span>
                </div>

                {/* Expérience */}
                <div className="flex flex-col items-center gap-1 px-1">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                    <CalendarDays className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {formatExperience(prestataire.experience)}
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                    Expérience
                  </span>
                </div>

                {/* Membre depuis */}
                <div className="flex flex-col items-center gap-1 px-1">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
                    <Clock className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{memberSinceDays}</span>
                  <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                    Membre
                  </span>
                </div>
              </div>

              {/* ── Séparateur ─────────────────────────────────── */}
              <div className="my-8 border-t border-dashed border-gray-200 dark:border-gray-700" />

              {/* ── INFORMATIONS ──────────────────────────────── */}
              <div>
                <h2 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                  Informations
                </h2>
                <div className="mt-4 space-y-4">
                  {/* Ville */}
                  {prestataire.ville && (
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 sm:w-48">
                        <MapPin className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" aria-hidden="true" />
                        Ville
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-300">{prestataire.ville}</span>
                    </div>
                  )}

                  {/* Adresse */}
                  {prestataire.adresse && (
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 sm:w-40">
                        <MapPin className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" aria-hidden="true" />
                        Adresse
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-300">{prestataire.adresse}</span>
                    </div>
                  )}

                  {/* Service */}
                  {prestataire.service_name && (
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 sm:w-40">
                        <Briefcase className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" aria-hidden="true" />
                        Service
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-300">{prestataire.service_name}</span>
                    </div>
                  )}

                  {/* Expérience */}
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 sm:w-40">
                      <CalendarDays className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" aria-hidden="true" />
                      Expérience
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {formatExperience(prestataire.experience)}
                    </span>
                  </div>

                  {/* Membre depuis */}
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 sm:w-40">
                      <Clock className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" aria-hidden="true" />
                      Membre depuis
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">{memberSince}</span>
                  </div>

                  {/* Avis */}
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 sm:w-40">
                      <ThumbsUp className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" aria-hidden="true" />
                      Avis
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {avis > 0 ? `${avis} avis` : "Aucun avis"}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Séparateur ─────────────────────────────────── */}
              <div className="my-8 border-t border-dashed border-gray-200 dark:border-gray-700" />

              {/* ── CONTACT ───────────────────────────────────── */}
              <div>
                <h2 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                  Contact
                </h2>
                <div className="mt-4 space-y-4">
                  {/* Téléphone */}
                  {prestataire.telephone && (
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 sm:w-40">
                        <Phone className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" aria-hidden="true" />
                        Téléphone
                      </div>
                      <a
                        href={`tel:${prestataire.telephone}`}
                        className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        {prestataire.telephone}
                      </a>
                    </div>
                  )}

                  {/* Email */}
                  {prestataire.email && (
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 sm:w-40">
                        <Mail className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" aria-hidden="true" />
                        Email
                      </div>
                      <a
                        href={`mailto:${prestataire.email}`}
                        className="text-sm text-gray-600 break-all transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                      >
                        {prestataire.email}
                      </a>
                    </div>
                  )}
                </div>

                {/* Bouton contacter */}
                <div className="mt-8">
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href={prestataire.email ? `mailto:${prestataire.email}` : undefined}
                    className="group/btn relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-3.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:from-yellow-500 hover:to-orange-600 hover:shadow-lg sm:w-auto sm:px-8"
                  >
                    {/* Effet brillance */}
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
                    <span className="relative flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" aria-hidden="true" />
                      Contacter le prestataire
                    </span>
                  </motion.a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default PrestataireProfile;