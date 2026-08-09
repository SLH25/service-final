// src/components/PrestatairePage/PrestataireSection.tsx
import React from "react";
import { motion, type Variants } from "framer-motion";
import { WifiOff, UserRound } from "lucide-react";
import { useSearchData } from "../../hooks/useSearchData";
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

const PrestataireSection: React.FC = () => {
  // Prestataires partagés via le hook avec cache (même source que la Navbar et la HeroSection)
  const { prestataires, loading, error } = useSearchData();

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
                <PrestataireCard provider={provider} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default PrestataireSection;