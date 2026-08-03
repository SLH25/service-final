import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, ArrowLeft, ArrowRight } from "lucide-react";

// Données simulées pour la démonstration
const mockResults = [
  { id: 1, name: "Plomberie", category: "Santé", providers: 1200 },
  { id: 2, name: "Éducation", category: "Éducation", providers: 980 },
  { id: 3, name: "Transport", category: "Transport", providers: 1430 },
  { id: 4, name: "Beauté & Coiffure", category: "Beauté & Coiffure", providers: 2100 },
  { id: 5, name: "Restauration", category: "Restauration", providers: 2600 },
  { id: 6, name: "Développement", category: "Développement", providers: 1540 },
  { id: 7, name: "Sécurité", category: "Sécurité", providers: 640 },
  { id: 8, name: "Comptabilité", category: "Comptabilité", providers: 730 },
  { id: 9, name: "Maison", category: "Maison", providers: 1120 },
  { id: 10, name: "Réparation moto", category: "Réparation moto", providers: 875 },
  { id: 11, name: "Événementiel", category: "Événementiel", providers: 940 },
  { id: 12, name: "Photographie", category: "Photographie", providers: 660 },
];

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [localQuery, setLocalQuery] = useState(query);

  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) {
      setSearchParams({ q: localQuery.trim() });
    }
  };

  // Filtrer les résultats selon la recherche
  const filteredResults = query
    ? mockResults.filter(
        (item) =>
          item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase())
      )
    : [];

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
        {query ? (
          <>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {filteredResults.length} résultat{filteredResults.length > 1 ? "s" : ""} pour "{query}"
            </p>

            {filteredResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredResults.map((result) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all"
                  >
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                      {result.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {result.providers.toLocaleString("fr-FR")}+ prestataires
                    </p>
                    <Link
                      to="/services"
                      className="mt-3 inline-flex items-center gap-1 text-sm text-yellow-500 hover:text-yellow-600 font-semibold"
                    >
                      Voir les services
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