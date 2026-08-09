import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

/**
 * Page Conditions d'utilisation — placeholder.
 * La vraie page sera ajoutée plus tard.
 */
const TermsPage: React.FC = () => {
  return (
    <section
      aria-label="Conditions d'utilisation"
      className="relative py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800"
    >
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Link
          to="/signup"
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:border-blue-300 hover:bg-white hover:shadow-md dark:border-gray-700 dark:bg-gray-800/80 dark:text-gray-200 dark:hover:border-blue-500/40 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Retour
        </Link>

        <div className="mt-8 overflow-hidden rounded-3xl border-2 border-blue-100 bg-white shadow-lg shadow-slate-200/50 dark:border-blue-500/20 dark:bg-gray-800/80 dark:shadow-none">
          <div className="absolute top-0 left-0 right-0 z-10 h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-orange-400" />
          <div className="p-6 sm:p-8 lg:p-10">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Conditions d'utilisation
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              Cette page est en cours de préparation. Les conditions d'utilisation seront
              disponibles prochainement.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TermsPage;