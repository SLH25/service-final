import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, User, Mail, Lock, Eye, EyeOff, AlertCircle, AtSign } from "lucide-react";


const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000/";
interface FormData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  acceptTerms: boolean;
  specialties: string[];

}

interface SignupFormProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  errors: Partial<FormData>;
  isSubmitting: boolean;
  // validateForm kept in container; not used directly here
  // validateForm: () => boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

const SignupForm: React.FC<SignupFormProps> = ({
  formData,
  setFormData,
  errors,
  isSubmitting,
  handleSubmit,
  handleInputChange
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const inputClasses = "w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200";
  const errorInputClasses = "w-full px-4 py-3 rounded-2xl border border-red-300 dark:border-red-600 bg-red-50/80 dark:bg-red-900/20 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200";

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
            <h2 className="text-2xl font-bold text-white text-center">
              Créer votre compte
            </h2>
            <p className="text-white/90 text-center mt-2">
              Remplissez les informations ci-dessous
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Prénom *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={errors.firstName ? errorInputClasses : inputClasses}
                    style={{ paddingLeft: "2.75rem" }}
                    placeholder="Votre prénom"
                  />
                </div>
                {errors.firstName && (
                  <div className="flex items-center gap-2 mt-2 text-red-600 dark:text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.firstName}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Nom *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={errors.lastName ? errorInputClasses : inputClasses}
                    style={{ paddingLeft: "2.75rem" }}
                    placeholder="Votre nom"
                  />
                </div>
                {errors.lastName && (
                  <div className="flex items-center gap-2 mt-2 text-red-600 dark:text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.lastName}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Nom d'utilisateur *
              </label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={errors.username ? errorInputClasses : inputClasses}
                  style={{ paddingLeft: "2.75rem" }}
                  placeholder="pseudo123"
                />
              </div>
              {errors.username && (
                <div className="flex items-center gap-2 mt-2 text-red-600 dark:text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {errors.username}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? errorInputClasses : inputClasses}
                  style={{ paddingLeft: "2.75rem" }}
                  placeholder="votre@email.com"
                />
              </div>
              {errors.email && (
                <div className="flex items-center gap-2 mt-2 text-red-600 dark:text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {errors.email}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Mot de passe *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={errors.password ? errorInputClasses : inputClasses}
                  style={{ paddingLeft: "2.75rem", paddingRight: "2.75rem" }}
                  placeholder="Minimum 8 caractères"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <div className="flex items-center gap-2 mt-2 text-red-600 dark:text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {errors.password}
                </div>
              )}
            </div>

            <div className="pt-4">
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                className={`w-full bg-gradient-to-r font-semibold py-3 px-6 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 ${
                  isSubmitting
                    ? "from-gray-400 to-gray-500 cursor-not-allowed text-gray-200"
                    : "from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Création du compte...
                  </>
                ) : (
                  <>
                    Créer mon compte
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

export default SignupForm;