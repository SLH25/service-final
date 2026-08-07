import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, ArrowLeft, ArrowRight, WifiOff } from "lucide-react";
import { useSearchData } from "../../hooks/useSearchData";

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [localQuery, setLocalQuery] = useState(query);
  const { loading, error, search } = useSearchData();

  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) {
      setSearchParams({ q: localQuery.trim() });
    }
  };

  // Résultats réels issus du backend (services + prestataires)
  const filteredResults = query ? search(query) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Bouton retour */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à l'accueil
        </Link>

        {/* Barre de recherche */}
        <form onSubmit={handleSearch} className="relative mb-8">
          <input
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="Rechercher un service..."
            aria-label="Rechercher"
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
          <button type="submit" className="absolute left-4 top-1/2 -translate-y-1/2 cursor-pointer">
            <Search className="w-5 h-5 text-gray-400" />
          </button>
        </form>

        {/* Résultats */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-800/40">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
              <WifiOff className="h-7 w-7" />
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
              Données non synchronisées
            </p>
            <p className="mt-1 max-w-md text-xs text-slate-500 dark:text-slate-400">
              Impossible de joindre le serveur. Les résultats seront actualisés automatiquement dès que la connexion sera rétablie.
            </p>
          </div>
        ) : query ? (
          <>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {filteredResults.length} résultat{filteredResults.length > 1 ? "s" : ""} pour "{query}"
            </p>

            {filteredResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredResults.map((result) => (
                  <motion.div
                    key={`${result.type}-${result.id}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all"
                  >
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                      {result.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {result.subtitle}
                    </p>
                    <Link
                      to={result.type === "service" ? "/services" : "/prestataires"}
                      className="mt-3 inline-flex items-center gap-1 text-sm text-yellow-500 hover:text-yellow-600 font-semibold"
                    >
                      {result.type === "service" ? "Voir les services" : "Voir les prestataires"}
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Search className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Aucun résultat trouvé
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Essayez avec d'autres mots-clés
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Que recherchez-vous ?
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Tapez un mot-clé pour trouver des services
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;