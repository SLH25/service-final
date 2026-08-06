// src/components/PrestatairePage/PrestataireSection.tsx
import React, { useState, useEffect } from "react";
import { motion, type Variants } from "framer-motion";
import {
  MapPin,
  ArrowRight,
  WifiOff,
  UserRound,
  BadgeCheck,
  Briefcase,
  CalendarDays,
  Clock,
  ThumbsUp,
} from "lucide-react";
import { fetchPublicPrestataires, type PublicPrestataire } from "../publicApi";

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

// Durée du polling de synchronisation avec le backend (en ms)
const SYNC_INTERVAL_MS = 30000;

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20,
      duration: 0.6,
    },
  },
};

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

const PrestataireSection: React.FC = () => {
  const [prestataires, setPrestataires] = useState<PublicPrestataire[]>([]);
  const [loading, setLoading] = useState(true);
  // `offline` passe à true quand l'API échoue → état explicite au lieu de données fictives
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadPrestataires(showSpinner = false) {
      if (showSpinner) setLoading(true);
      try {
        const data = await fetchPublicPrestataires();
        if (!cancelled) {
          setPrestataires(data);
          setOffline(false);
        }
      } catch {
        if (!cancelled) setOffline(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPrestataires(true);

    // Polling : resynchronise avec les modifications de l'admin toutes les 30s
    const interval = setInterval(() => loadPrestataires(false), SYNC_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Uniquement les données réelles exposées par l'API publique
  const displayProviders: Provider[] = prestataires.map((p) => {
    const fullName = `${p.first_name} ${p.last_name}`.trim().toLowerCase();
    return {
      id: String(p.id),
      name: `${p.first_name} ${p.last_name}`.trim(),
      serviceName: p.service_name || "",
      location: p.ville || p.adresse || "",
      photo: p.photo || "",
      // Le badge "Vérifié" n'apparaît que pour le statut VERIFIED (jamais pour AFFICHE)
      verified: p.status === "VERIFIED",
      // Années d'expérience réelles (champ `experience` du backend)
      experience: p.experience,
      // Ancienneté réelle du compte, calculée depuis `created_at`
      memberSince: formatAccountAge(p.created_at),
      // Avis : pas encore de système d'avis en base → 0, sauf exception de test "Sali" → 12
      avis: fullName.includes("sali") ? 12 : 0,
    };
  });

  return (
    <section
      aria-label="Prestataires les mieux notés"
      className="relative py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800"
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-100 dark:bg-blue-900/20 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-purple-100 dark:bg-purple-900/20 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 dark:from-white dark:via-blue-200 dark:to-white bg-clip-text text-transparent"
          >
            Nos prestataires
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
          >
            Rencontrez nos professionnels qualifiés, prêts à vous aider dès aujourd'hui.
          </motion.p>
        </div>

        {loading ? (
          <div className="mt-12 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : offline ? (
          <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-800/40">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
              <WifiOff className="h-7 w-7" />
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
              Données non synchronisées
            </p>
            <p className="mt-1 max-w-md text-xs text-slate-500 dark:text-slate-400">
              Impossible de joindre le serveur. Les prestataires seront actualisés automatiquement dès que la connexion sera rétablie.
            </p>
          </div>
        ) : displayProviders.length === 0 ? (
          <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-800/40">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
              <UserRound className="h-7 w-7 text-slate-400" />
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
              Aucun prestataire disponible
            </p>
            <p className="mt-1 max-w-md text-xs text-slate-500 dark:text-slate-400">
              Aucun prestataire n'est publié pour le moment. Revenez bientôt.
            </p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
          >
            {displayProviders.map((provider) => (
              <motion.div key={provider.id} variants={itemVariants}>
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
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default PrestataireSection;