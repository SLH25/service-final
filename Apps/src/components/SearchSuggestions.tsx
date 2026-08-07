// src/components/SearchSuggestions.tsx
// Composant partagé de suggestions pour la recherche (Navbar + HeroSection).
// Utilise la même logique de recherche (useSearchData) et la même source de données.
import React from "react";
import { useNavigate } from "react-router-dom";
import { Search, Briefcase, UserRound } from "lucide-react";
import type { SearchResult } from "../hooks/useSearchData";

interface SearchSuggestionsProps {
  query: string;
  results: SearchResult[];
  onSelect: () => void;
}

const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  query,
  results,
  onSelect,
}) => {
  const navigate = useNavigate();

  if (!query.trim() || results.length === 0) return null;

  const handleSelect = (result: SearchResult) => {
    onSelect();
    navigate(`/search?q=${encodeURIComponent(result.name)}`);
  };

  return (
    <div className="absolute left-0 right-0 top-full mt-2 z-50 overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-800/95 backdrop-blur shadow-xl">
      <ul className="max-h-72 overflow-y-auto py-1">
        {results.map((result) => (
          <li key={`${result.type}-${result.id}`}>
            <button
              type="button"
              onClick={() => handleSelect(result)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 text-white">
                {result.type === "service" ? (
                  <Briefcase className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <UserRound className="h-4 w-4" aria-hidden="true" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-gray-900 dark:text-white">
                  {result.name}
                </span>
                <span className="block truncate text-xs text-gray-500 dark:text-gray-400">
                  {result.subtitle}
                </span>
              </span>
              <Search className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchSuggestions;