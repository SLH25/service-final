import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  AtSign,
  AlertCircle,
} from "lucide-react";
import type { FormData, FormErrors } from "./SignupContainer";

interface SharedFormFieldsProps {
  formData: FormData;
  errors: FormErrors;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

export const inputClasses =
  "w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200";

export const errorInputClasses =
  "w-full px-4 py-3 rounded-2xl border border-red-300 dark:border-red-600 bg-red-50/80 dark:bg-red-900/20 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200";

/**
 * Champs COMMUNS aux formulaires Client et Prestataire :
 * Prénom, Nom, Username, Email, Téléphone, Mot de passe, Confirmation, Conditions.
 * Garantit un design identique entre les deux formulaires.
 */
const SharedFormFields: React.FC<SharedFormFieldsProps> = ({
  formData,
  errors,
  handleInputChange,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <>
      {/* Nom & Prénom */}
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

      {/* Username & Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
              placeholder="Choisissez un username unique"
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
      </div>

      {/* Téléphone */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Téléphone *
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="tel"
            name="telephone"
            value={formData.telephone}
            onChange={handleInputChange}
            className={errors.telephone ? errorInputClasses : inputClasses}
            style={{ paddingLeft: "2.75rem" }}
            placeholder="06 12 34 56 78"
          />
        </div>
        {errors.telephone && (
          <div className="flex items-center gap-2 mt-2 text-red-600 dark:text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            {errors.telephone}
          </div>
        )}
      </div>

      {/* Mots de passe */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
              autoComplete="new-password"
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

        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Confirmer le mot de passe *
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="passwordConfirm"
              value={formData.passwordConfirm}
              onChange={handleInputChange}
              className={errors.passwordConfirm ? errorInputClasses : inputClasses}
              style={{ paddingLeft: "2.75rem", paddingRight: "2.75rem" }}
              placeholder="Confirmez votre mot de passe"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.passwordConfirm && (
            <div className="flex items-center gap-2 mt-2 text-red-600 dark:text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              {errors.passwordConfirm}
            </div>
          )}
        </div>
      </div>

      {/* Conditions */}
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          name="acceptTerms"
          checked={formData.acceptTerms}
          onChange={handleInputChange}
          className="mt-1 w-5 h-5 text-yellow-400 bg-gray-100 border-gray-300 rounded focus:ring-yellow-400 focus:ring-2"
        />
        <label className="text-sm text-gray-600 dark:text-gray-300">
          J'accepte les{" "}
          <Link to="/terms" className="text-yellow-500 hover:text-yellow-600 underline">
            conditions d'utilisation
          </Link>{" "}
          et la{" "}
          <Link to="/privacy" className="text-yellow-500 hover:text-yellow-600 underline">
            politique de confidentialité
          </Link>{" "}
          *
        </label>
      </div>
      {errors.acceptTerms && (
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          {errors.acceptTerms}
        </div>
      )}
    </>
  );
};

export default SharedFormFields;
