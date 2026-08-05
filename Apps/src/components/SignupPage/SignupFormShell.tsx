import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface SignupFormShellProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onBack?: () => void;
  submitLabel?: string;
}

/**
 * Enveloppe commune des formulaires Client et Prestataire :
 * carte, header dégradé, corps et footer (Retour + bouton soumettre).
 * Garantit un design identique entre les deux formulaires.
 */
const SignupFormShell: React.FC<SignupFormShellProps> = ({
  title = "Créer votre compte",
  subtitle = "Remplissez les informations ci-dessous",
  children,
  isSubmitting,
  onSubmit,
  onBack,
  submitLabel = "Créer mon compte",
}) => {
  return (
    <section className="relative py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 px-8 py-6">
            <h2 className="text-2xl font-bold text-white text-center">{title}</h2>
            <p className="text-white/90 text-center mt-2">{subtitle}</p>
          </div>

          <form onSubmit={onSubmit} className="p-8 space-y-6">
            {children}

            {/* Footer */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="py-3 px-6 border border-gray-300 text-gray-700 dark:text-gray-200 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Retour
                </button>
              )}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                className={`py-3 px-6 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
                  onBack ? "" : "w-full col-span-2"
                } ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed text-gray-200"
                    : "bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Création du compte...
                  </>
                ) : (
                  <>
                    {submitLabel}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </div>

            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-300">
                Vous avez déjà un compte ?{" "}
                <Link to="/login" className="text-yellow-500 hover:text-yellow-600 font-semibold underline">
                  Se connecter
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default SignupFormShell;
