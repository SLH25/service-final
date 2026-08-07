import React, { useState } from "react";
import { motion, type Variants } from "framer-motion";
import { Link } from "react-router-dom";
import { MapPin, ArrowRight, WifiOff, UserRound, BadgeCheck } from "lucide-react";
import { useSearchData } from "../../hooks/useSearchData";

// Données réellement exposées par l'API publique — aucune donnée fictive
export interface Provider {
  id: string;
  name: string;
  serviceName: string;
  location: string;
  photo: string;
  verified: boolean;
}

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

// ── Couverture de carte (photo ou monogramme) ───────────────
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

function ProviderCover({ name, photo }: { name: string; photo: string }) {
  const [imgError, setImgError] = useState(false);
  const showPhoto = Boolean(photo) && !imgError;

  return (
    <div className="relative h-32 w-full shrink-0 overflow-hidden sm:h-36">
      {showPhoto ? (
        <>
          <img
            src={photo}
            alt={name}
            loading="lazy"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/25 via-transparent to-transparent" />
        </>
      ) : (
        <div
          className={`relative flex h-full w-full items-center justify-center bg-gradient-to-br ${gradientFor(name)}`}
        >
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 22% 28%, rgba(255,255,255,0.7) 0, transparent 42%), radial-gradient(circle at 82% 72%, rgba(255,255,255,0.5) 0, transparent 38%), radial-gradient(circle at 55% 90%, rgba(255,255,255,0.3) 0, transparent 30%)",
            }}
            aria-hidden="true"
          />
          <span className="relative text-4xl font-bold tracking-tight text-white drop-shadow-md sm:text-5xl">
            {initialsOf(name)}
          </span>
        </div>
      )}
    </div>
  );
}

const TopRatedProviders: React.FC = () => {
  // Prestataires partagés via le hook avec cache (même source que la Navbar et la HeroSection)
  const { prestataires, loading, error } = useSearchData();

  // Uniquement les données réelles exposées par l'API publique
  const displayProviders: Provider[] = prestataires.map((p) => ({
    id: String(p.id),
    name: `${p.first_name} ${p.last_name}`.trim(),
    serviceName: p.service_name || "",
    location: p.ville || p.adresse || "",
    photo: p.photo || "",
    // Le badge "Vérifié" n'apparaît que pour le statut VERIFIED (jamais pour AFFICHE)
    verified: p.status === "VERIFIED",
  }));

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
        ) : error ? (
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
                    y: -6,
                    transition: { type: "spring", stiffness: 400, damping: 25 },
                  }}
                  className="group relative h-full"
                >
                  {/* Lueur au survol */}
                  <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 blur transition-opacity duration-300 group-hover:opacity-20"></div>

                  <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:border-blue-200 hover:shadow-xl dark:border-gray-700/50 dark:bg-gray-800/80 dark:hover:border-blue-500/40">
                    {/* Couverture : photo ou monogramme */}
                    <ProviderCover name={provider.name} photo={provider.photo} />

                    {/* Contenu */}
                    <div className="flex flex-1 flex-col p-5">
                      {/* Nom complet + badge Vérifié */}
                      <div className="flex items-center gap-1.5">
                        <h3 className="min-w-0 truncate text-base font-bold tracking-tight text-gray-900 dark:text-white sm:text-lg">
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

                      {/* Service principal (étiquette) */}
                      {provider.serviceName && (
                        <span className="mt-2.5 inline-flex w-fit items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                          {provider.serviceName}
                        </span>
                      )}

                      {/* Ville / Localisation */}
                      {provider.location && (
                        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-slate-500" aria-hidden="true" />
                          <span className="truncate">{provider.location}</span>
                        </div>
                      )}

                      {/* CTA */}
                      <div className="mt-auto pt-5">
                        <div className="border-t border-gray-100 pt-4 dark:border-gray-700/50">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="group/btn inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:from-yellow-500 hover:to-orange-600 hover:shadow-lg"
                          >
                            Voir le profil
                            <ArrowRight
                              className="h-4 w-4 transform transition-transform group-hover/btn:translate-x-0.5"
                              aria-hidden="true"
                            />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.article>
              </motion.div>
            ))}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 sm:mt-16 flex justify-center"
        >
          <Link
            to="/prestataires"
            className="group inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-2xl"
          >
            Voir tous les prestataires
            <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default TopRatedProviders;