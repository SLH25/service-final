// src/components/ServicePage/ServicesSection.tsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, type Variants } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Stethoscope,
  BookOpen,
  Car,
  Scissors,
  UtensilsCrossed,
  Code,
  ShieldCheck,
  Calculator,
  Home,
  Bike,
  Music,
  Camera,
  Wrench,
  ArrowRight,
  WifiOff,
} from "lucide-react";
import { fetchPublicServices, type PublicService } from "../publicApi";

// Icônes disponibles pour mapper les services
const serviceIcons: LucideIcon[] = [
  Wrench,
  Stethoscope,
  BookOpen,
  Car,
  Scissors,
  UtensilsCrossed,
  Code,
  ShieldCheck,
  Calculator,
  Home,
  Bike,
  Music,
  Camera,
];

// Type de catégorie affichée (issue de l'API)
type Category = {
  name: string;
  icon: LucideIcon;
  providers: number;
};

// Durée du polling de synchronisation avec le backend (en ms)
const SYNC_INTERVAL_MS = 30000;

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
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

function formatProviders(count: number): string {
  const formatted = new Intl.NumberFormat("fr-FR").format(count);
  return `${formatted}+ prestataires`;
}

// Couleurs dégradées pour les icônes (cycle à travers différents gradients)
const iconGradients = [
  "bg-gradient-to-br from-blue-500 to-purple-600",
  "bg-gradient-to-br from-emerald-500 to-teal-600",
  "bg-gradient-to-br from-orange-500 to-red-500",
  "bg-gradient-to-br from-purple-500 to-pink-600",
  "bg-gradient-to-br from-teal-500 to-cyan-600",
  "bg-gradient-to-br from-rose-500 to-orange-500",
  "bg-gradient-to-br from-indigo-500 to-blue-600",
  "bg-gradient-to-br from-green-500 to-emerald-600",
];

const ServiceSection: React.FC = () => {
  const [services, setServices] = useState<PublicService[]>([]);
  const [loading, setLoading] = useState(true);
  // `offline` passe à true quand l'API échoue → on affiche un état explicite
  // au lieu de données fictives qui masqueraient la désynchronisation.
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadServices(showSpinner = false) {
      if (showSpinner) setLoading(true);
      try {
        const data = await fetchPublicServices();
        if (!cancelled) {
          setServices(data);
          setOffline(false);
        }
      } catch {
        if (!cancelled) setOffline(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadServices(true);

    // Polling : resynchronise avec les modifications de l'admin toutes les 30s
    const interval = setInterval(() => loadServices(false), SYNC_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Afficher les données API (aucun fallback fictif)
  const displayItems: Category[] = services.map((s, idx) => ({
    name: s.name,
    icon: serviceIcons[idx % serviceIcons.length],
    providers: s.prestataires_count,
  }));

  return (
    <section
      aria-label="Catégories de services"
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
            Parcourez les services par catégorie
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
          >
            Trouvez facilement le service qu'il vous faut parmi nos catégories populaires
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
              Impossible de joindre le serveur. Les services seront actualisés automatiquement dès que la connexion sera rétablie.
            </p>
          </div>
        ) : displayItems.length === 0 ? (
          <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-800/40">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
              <Stethoscope className="h-7 w-7 text-slate-400" />
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
              Aucun service disponible
            </p>
            <p className="mt-1 max-w-md text-xs text-slate-500 dark:text-slate-400">
              Aucun service n'est publié pour le moment. Revenez bientôt.
            </p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="mt-12 sm:mt-16 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
          >
            {displayItems.map(({ name, icon: Icon, providers }, idx) => (
              <motion.div key={name} variants={itemVariants}>
                <motion.article
                  whileHover={{
                    y: -8,
                    transition: { type: "spring", stiffness: 400, damping: 25 },
                  }}
                  className="group relative h-full"
                >
                  {/* Glow effect on hover */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></div>

                  <button
                    type="button"
                    aria-label={`Voir la catégorie ${name}`}
                    className="relative w-full h-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900 rounded-2xl"
                  >
                    <div className="relative h-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                      <div className="p-5 sm:p-6 h-full flex flex-col items-center text-center">
                        {/* Icon avec gradient et effet glow */}
                        <div className="relative mb-4">
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.95 }}
                            className={`relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl ${iconGradients[idx % iconGradients.length]} shadow-lg flex items-center justify-center group-hover:shadow-xl transition-shadow duration-300`}
                          >
                            <Icon
                              className="w-8 h-8 sm:w-9 sm:h-9 text-white drop-shadow-lg"
                              aria-hidden="true"
                            />

                            {/* Effet de lueur */}
                            <div className={`absolute inset-0 rounded-2xl ${iconGradients[idx % iconGradients.length]} opacity-0 group-hover:opacity-40 blur-xl transition-opacity duration-300`}></div>
                          </motion.div>

                          {/* Pulse effect */}
                          <div className={`absolute inset-0 rounded-2xl ${iconGradients[idx % iconGradients.length]} animate-pulse opacity-20`}></div>
                        </div>

                        {/* Category name */}
                        <div className="flex-1 flex flex-col justify-center">
                          <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                            {name}
                          </h3>

                          {/* Providers count avec design amélioré */}
                          <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                            <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                              {formatProviders(providers)}
                            </span>
                          </div>
                        </div>

                        {/* Decorative bottom border */}
                        <div className="mt-4 w-full">
                          <div className={`h-1 w-full rounded-full ${iconGradients[idx % iconGradients.length]} opacity-20 group-hover:opacity-40 transition-opacity duration-300`} />
                        </div>
                      </div>
                    </div>
                  </button>
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
          <Link to="/services">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              aria-label="Voir plus"
              className="group inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-2xl"
            >
              Voir plus
              <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ServiceSection;