import { motion } from "framer-motion";
import {
  Users,
  Briefcase,
  Wrench,
  Activity,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  Shield,
  BarChart3,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { useAdminStore } from "./AdminStore";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const activityColors: Record<string, string> = {
  prestataire: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
  service: "bg-violet-500/10 text-violet-600 dark:text-violet-300",
  utilisateur: "bg-blue-500/10 text-blue-600 dark:text-blue-300",
  system: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
};

const activityIcons: Record<string, typeof Users> = {
  prestataire: Briefcase,
  service: Wrench,
  utilisateur: UserPlus,
  system: Shield,
};

export default function AdminDashboard() {
  const { prestataires, services, clients, activities, stats: apiStats, loading, error, refresh } = useAdminStore();

  const statCards = [
    {
      icon: Users,
      label: "Clients",
      value: apiStats?.totalClients ?? clients.length,
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-300",
      detail: `${clients.length} sur la plateforme`,
      page: "clients" as const,
    },
    {
      icon: Briefcase,
      label: "Prestataires",
      value: apiStats?.totalPrestataires ?? prestataires.length,
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
      detail: `${prestataires.filter((p) => p.statut === "VERIFIED" || p.statut === "AFFICHE").length} visibles`,
      page: "prestataires" as const,
    },
    {
      icon: Wrench,
      label: "Services",
      value: apiStats?.totalServices ?? services.length,
      color: "bg-violet-500/10 text-violet-600 dark:text-violet-300",
      detail: `${services.filter((s) => s.statut === "Actif").length} actifs`,
      page: "services" as const,
    },
    {
      icon: Activity,
      label: "Activités",
      value: activities.length,
      color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
      detail: "événements récents",
      page: "dashboard" as const,
    },
  ];

  const recentClients = clients.slice(0, 4);
  const latestActivities = activities.slice(0, 5);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-7xl space-y-6"
    >
      {/* Error banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/50"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <div>
              <p className="text-sm font-semibold text-red-700 dark:text-red-300">Erreur de chargement</p>
              <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
          <button
            onClick={() => refresh()}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-700"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Réessayer
          </button>
        </motion.div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
      )}

      {!loading && (
        <>
      {/* Hero */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-gradient-to-br from-white via-white to-blue-50/50 p-8 shadow-sm dark:border-slate-700/80 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/30"
      >
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl dark:bg-blue-500/10" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-violet-500/5 blur-3xl dark:bg-violet-500/10" />

        <div className="relative">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500/10 to-violet-500/10 px-4 py-1.5 text-sm font-semibold text-blue-700 ring-1 ring-blue-500/20 dark:from-blue-500/20 dark:to-violet-500/20 dark:text-blue-200 dark:ring-blue-400/20">
                <Shield className="h-4 w-4" />
                Administration
                <span className="ml-1 rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-300">
                  En ligne
                </span>
              </span>

              <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
                Centre de contrôle
                <span className="block bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-violet-400">
                  administrateur
                </span>
              </h1>

              <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300">
                Gérez les indicateurs importants, suivez les utilisateurs et accédez rapidement aux actions critiques depuis un seul emplacement.
              </p>
            </div>

            {/* Stats grid */}
            <div className="grid w-full grid-cols-2 gap-3 sm:w-auto sm:grid-cols-2 xl:grid-cols-4">
              {statCards.map((stat) => (
                <div
                  key={stat.label}
                  className="group relative rounded-2xl border border-slate-200/60 bg-white/60 p-4 backdrop-blur-sm transition-all hover:border-slate-300 hover:shadow-md dark:border-slate-700/60 dark:bg-slate-900/60 dark:hover:border-slate-600"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <p className="mt-3 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">
                    {stat.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Overview grid */}
      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        {/* Left: Recent clients */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/90"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Derniers clients
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {clients.length} clients sur la plateforme
              </p>
            </div>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-xs font-bold text-blue-600 dark:bg-blue-500/15 dark:text-blue-300">
              {clients.length}
            </span>
          </div>

          <div className="mt-5 overflow-hidden rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200/60 bg-slate-50/80 dark:border-slate-700/60 dark:bg-slate-950/50">
                  <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Nom</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Username</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Inscription</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-slate-700/60">
                {recentClients.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-sm text-slate-400">
                      Aucun client
                    </td>
                  </tr>
                ) : (
                  recentClients.map((c) => (
                    <tr key={c.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-[10px] font-bold text-white">
                            {c.prenom[0]}{c.nom[0]}
                          </div>
                          <span className="font-medium text-slate-900 dark:text-white">{c.prenom} {c.nom}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {c.username}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-slate-500 dark:text-slate-400">{c.dateAjout}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Right: Activity feed */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/90"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Activité récente
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Derniers événements importants.
              </p>
            </div>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-xs font-bold text-blue-600 dark:bg-blue-500/15 dark:text-blue-300">
              {activities.length}
            </span>
          </div>

          <div className="relative mt-6">
            <div className="absolute left-[17px] top-2 h-[calc(100%-16px)] w-0.5 bg-slate-200 dark:bg-slate-700" />

            <div className="space-y-5">
              {latestActivities.length === 0 ? (
                <p className="text-center text-sm text-slate-400 py-8">Aucune activité</p>
              ) : (
                latestActivities.map((item, index) => {
                  const Icon = activityIcons[item.type] || Activity;
                  const colors = activityColors[item.type] || activityColors.system;
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative flex gap-4 pl-10"
                    >
                      <div
                        className={`absolute left-0 flex h-9 w-9 items-center justify-center rounded-xl ${colors} ring-4 ring-white dark:ring-slate-900`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 rounded-xl border border-slate-200/60 bg-slate-50/50 p-3.5 transition-all hover:border-slate-300 hover:bg-white hover:shadow-sm dark:border-slate-700/60 dark:bg-slate-950/30 dark:hover:border-slate-600 dark:hover:bg-slate-900/50">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                              {item.title}
                            </h4>
                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                              {item.details}
                            </p>
                          </div>
                          <span className="whitespace-nowrap text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            {item.time}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>

          <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200/60 bg-slate-50/50 px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-white hover:shadow-sm dark:border-slate-700/60 dark:bg-slate-950/30 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-900/50">
            Voir toute l'activité
            <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>
      </div>

      {/* Quick stats cards */}
      <motion.div
        variants={itemVariants}
        className="grid gap-4 md:grid-cols-3"
      >
        <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-5 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Prestataires vérifiés</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {prestataires.filter((p) => p.statut === "VERIFIED").length}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-5 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Prestataires en attente</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {prestataires.filter((p) => p.statut === "PENDING").length}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-5 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Services actifs</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {services.filter((s) => s.statut === "Actif").length}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
        </>
      )}
    </motion.div>
  );
}
