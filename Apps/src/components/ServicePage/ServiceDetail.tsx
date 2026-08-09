// src/components/ServicePage/ServiceDetail.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, type Variants } from "framer-motion";
import {
  ArrowLeft,
  WifiOff,
  UserRound,
  Briefcase,
  Users,
} from "lucide-react";
import { fetchPublicServiceById, type PublicServiceDetail } from "../publicApi";
import PrestataireCard, { type Provider } from "../PrestataireCard";

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

// ── Formatage de l'ancienneté du compte ─────────────────────
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

const ServiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<PublicServiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!id) return;
      setLoading(true);
      setError(false);
      try {
        const data = await fetchPublicServiceById(id);
        if (!cancelled) setService(data);
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

  // Convertir les prestataires du service en format Provider pour PrestataireCard
  const displayProviders: Provider[] = (service?.prestataires ?? []).map((p) => {
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
      aria-label="Détail du service"
      className="relative py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800"
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-100 dark:bg-blue-900/20 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-purple-100 dark:bg-purple-900/20 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
        ) : error || !service ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-white/60 px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-800/40">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
              <WifiOff className="h-7 w-7" />
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
              Service introuvable
            </p>
            <p className="mt-1 max-w-md text-xs text-slate-500 dark:text-slate-400">
              Ce service n'existe pas ou n'est plus disponible.
            </p>
            <Link
              to="/services"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:from-yellow-500 hover:to-orange-600 hover:shadow-lg"
            >
              Voir tous les services
            </Link>
          </div>
        ) : (
          <>
            {/* ── HEADER : informations du service ─────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative overflow-hidden rounded-3xl border-2 border-blue-100 bg-white shadow-lg shadow-slate-200/50 dark:border-blue-500/20 dark:bg-gray-800/80 dark:shadow-none"
            >
              {/* Ligne dégradée supérieure */}
              <div className="absolute top-0 left-0 right-0 z-10 h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-orange-400" />

              <div className="p-6 sm:p-8 lg:p-10">
                <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:gap-6 sm:text-left">
                  {/* Icône du service */}
                  <div className="relative shrink-0">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                      <Briefcase className="h-8 w-8 text-white" aria-hidden="true" />
                    </div>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 opacity-40 blur-xl"></div>
                  </div>

                  {/* Nom + description */}
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                      {service.name}
                    </h1>
                    {service.description && (
                      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                        {service.description}
                      </p>
                    )}
                    <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20">
                      <Users className="h-3 w-3" aria-hidden="true" />
                      {service.prestataires_count} prestataire{service.prestataires_count > 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ── PRESTATAIRES LIÉS ───────────────────────────── */}
            <div className="mt-12 sm:mt-16">
              <div className="mx-auto max-w-3xl text-center">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 dark:from-white dark:via-blue-200 dark:to-white bg-clip-text text-transparent"
                >
                  Prestataires pour {service.name}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
                >
                  Découvrez les professionnels qualifiés pour ce service.
                </motion.p>
              </div>

              {displayProviders.length === 0 ? (
                <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-800/40">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                    <UserRound className="h-7 w-7 text-slate-400" />
                  </div>
                  <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Aucun prestataire disponible
                  </p>
                  <p className="mt-1 max-w-md text-xs text-slate-500 dark:text-slate-400">
                    Aucun prestataire n'est disponible pour ce service pour le moment.
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
                      <PrestataireCard provider={provider} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default ServiceDetail;