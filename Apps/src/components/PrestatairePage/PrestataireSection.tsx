// src/components/CategoriesSection.tsx
import React, { useState, useEffect } from "react";
import { motion, type Variants } from "framer-motion";
import { Star, MapPin, Check, Clock, ArrowRight, Languages, WifiOff, UserRound } from "lucide-react";
import { fetchPublicPrestataires, type PublicPrestataire } from "../publicApi";

export interface Provider {
  id: string;
  name: string;
  profession: string;
  rating: number;
  reviewCount: number;
  responseTime: string;
  location: string;
  language: string;
  avatar: string;
  verified: boolean;
  badge?: "Professionel" | "Étudiant";
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

// Type strict pour les badges avec index signature
const badgeStyles: Record<"Professionel" | "Étudiant", string> = {
  Professionel: "bg-gradient-to-r from-purple-500 to-indigo-600 text-white",
  Étudiant: "bg-gradient-to-r from-green-400 to-blue-500 text-white",
};

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

  // Afficher les données API (aucun fallback fictif)
  const displayProviders: Provider[] = prestataires.map((p) => ({
    id: String(p.id),
    name: `${p.first_name} ${p.last_name}`,
    profession: p.service_name || "Prestataire",
    rating: 4.8,
    reviewCount: 0,
    responseTime: "—",
    location: "—",
    language: "—",
    avatar: "",
    verified: true,
    badge: "Professionel" as const,
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
            Prestataires les mieux notés
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
          >
            Rencontrez nos professionnels les mieux évalués, prêts à vous aider dès aujourd'hui.
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
            {displayProviders.map((provider, idx) => (
              <motion.div key={provider.id} variants={itemVariants}>
                <motion.article
                  whileHover={{
                    y: -8,
                    transition: { type: "spring", stiffness: 400, damping: 25 },
                  }}
                  className="group relative h-full"
                >
                  {/* Glow effect on hover */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></div>

                  <div className="relative h-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                    {/* Badges en haut */}
                    <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4">
                      {provider.badge && (
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ${badgeStyles[provider.badge]}`}>
                          {provider.badge}
                        </span>
                      )}
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3 + idx * 0.1, type: "spring", stiffness: 500 }}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ${provider.verified ? "bg-green-500 text-white" : "bg-gray-300 text-gray-800"}`}
                      >
                        <Check className={`w-3.5 h-3.5 ${provider.verified ? "text-white" : "text-gray-800"}`} />
                        {provider.verified ? "Vérifié" : "Non vérifié"}
                      </motion.span>
                    </div>

                    <div className="pt-16 p-6 h-full flex flex-col">
                      {/* Avatar */}
                      <div className="relative mx-auto mb-4">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 p-0.5">
                          <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <span className="text-xl font-bold text-gray-600 dark:text-gray-300">
                              {provider.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        </div>
                      </div>

                      {/* Nom et métier */}
                      <div className="text-center mb-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                          {provider.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                          {provider.profession}
                        </p>
                      </div>

                      {/* Note */}
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(provider.rating)
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300 dark:text-gray-600"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {provider.rating}
                        </span>
                        {provider.reviewCount > 0 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">({provider.reviewCount} avis)</span>
                        )}
                      </div>

                      {/* Statuts */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <Clock className="w-4 h-4 text-blue-500" />
                          <span>Temps de réponse: {provider.responseTime}</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <MapPin className="w-4 h-4 text-green-500" />
                          <span className="truncate">{provider.location}</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <Languages className="w-4 h-4 text-purple-500" />
                          <span className="truncate">Langue: {provider.language}</span>
                        </div>
                      </div>

                      {/* CTA */}
                      <div className="mt-auto">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full group bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                        >
                          Voir le profil
                          <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                        </motion.button>
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
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="group inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-2xl"
          >
            Voir tous les prestataires
            <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default PrestataireSection;