import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight
} from "lucide-react";

interface LoginFormData {
  username: string;
  password: string;
  rememberMe: boolean;
}

interface LoginFormErrors {
  username?: string;
  password?: string;
  form?: string;
}

interface LoginFormProps {
  formData: LoginFormData;
  errors: LoginFormErrors;
  isSubmitting: boolean;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

const LoginForm: React.FC<LoginFormProps> = ({
  formData,
  errors,
  isSubmitting,
  handleInputChange,
  handleSubmit
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const inputClasses =
    "w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200";
  const errorInputClasses =
    "w-full px-4 py-3 rounded-2xl border border-red-300 dark:border-red-600 bg-red-50/80 dark:bg-red-900/20 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200";

  // Vérifier si le formulaire a des erreurs
  const hasErrors = Object.keys(errors).some(key => {
    const errorValue = errors[key as keyof typeof errors];
    return typeof errorValue === 'string' && errorValue.trim() !== '';
  });
  
  // Vérifier si tous les champs requis sont remplis
  const isFormValid = 
    formData.username.trim() !== "" &&
    formData.password !== "";

  // Handler de soumission avec vérification supplémentaire
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Double vérification avant soumission
    if (hasErrors) {
      console.warn("Le formulaire contient des erreurs. Soumission bloquée.");
      return;
    }
    
    if (!isFormValid) {
      console.warn("Tous les champs requis doivent être remplis. Soumission bloquée.");
      return;
    }
    
    // Si tout est valide, procéder à la soumission
    await handleSubmit(e);
  };

  return (
    <form onSubmit={handleFormSubmit} className="p-8 space-y-6">
      {errors.form && (
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          {errors.form}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Nom d'utilisateur
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            className={errors.username ? errorInputClasses : inputClasses}
            style={{ paddingLeft: "2.75rem" }}
            placeholder="Votre nom d'utilisateur"
            autoComplete="username"
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
          Mot de passe
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
            placeholder="Votre mot de passe"
            autoComplete="current-password"
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

      <div className="flex items-center justify-between">
        <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleInputChange}
            className="w-4 h-4 text-yellow-400 bg-gray-100 border-gray-300 rounded focus:ring-yellow-400 focus:ring-2"
          />
          Se souvenir de moi
        </label>
        <Link to="/forgot-password" className="text-sm text-yellow-500 hover:text-yellow-600 underline">
          Mot de passe oublié ?
        </Link>
      </div>

      <motion.button
        type="submit"
        disabled={isSubmitting || hasErrors || !isFormValid}
        whileHover={{ scale: isSubmitting || hasErrors || !isFormValid ? 1 : 1.02 }}
        whileTap={{ scale: isSubmitting || hasErrors || !isFormValid ? 1 : 0.98 }}
        className={`w-full bg-gradient-to-r font-semibold py-3 px-6 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 ${
          isSubmitting || hasErrors || !isFormValid
            ? "from-gray-400 to-gray-500 cursor-not-allowed text-gray-200"
            : "from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white"
        }`}
        title={hasErrors ? "Veuillez corriger les erreurs avant de soumettre" : !isFormValid ? "Veuillez remplir tous les champs requis" : ""}
      >
        {isSubmitting ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Connexion...
          </>
        ) : hasErrors ? (
          <>
            <AlertCircle className="w-5 h-5" />
            Corriger les erreurs
          </>
        ) : (
          <>
            Se connecter
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </motion.button>

      <div className="text-sm text-gray-700 dark:text-gray-300 text-center">
        Pas encore de compte ?{" "}
        <Link to="/signup" className="text-yellow-500 hover:text-yellow-600 underline">
          Créer un compte
        </Link>
      </div>
    </form>
  );
};

export default LoginForm;


