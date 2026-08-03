// src/components/ServicePage/ServiceHero.tsx
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function PrestataireHero() {
  return (
    <section className="relative bg-white dark:bg-gray-900 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10 dark:from-blue-600/20 dark:via-purple-600/20 dark:to-pink-600/20 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6 py-24 text-center">
        {/* Titre principal */}
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white"
        >
          Des professionnels fiables à portée de main
        </motion.h1>

        {/* Sous-texte */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300"
        >
         Parcourez nos prestataires qualifiés et trouvez celui qui répond parfaitement à vos besoins.
        </motion.p>

        {/* Boutons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 flex flex-wrap justify-center gap-4"
        >
          <Link
            to="/services"
            className="px-6 py-3 rounded-2xl font-semibold text-white bg-gradient-to-br from-yellow-400 to-orange-500 hover:scale-[1.02] hover:shadow-xl transition"
          >
            Explorer les services
          </Link>

          <Link
            to="/contact"
            className="px-6 py-3 rounded-2xl font-semibold text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:hover:bg-gray-700 shadow-md transition"
          >
            Contactez-nous
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
