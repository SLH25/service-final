import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Phone, 
  Calendar,
  ArrowRight,
  AlertCircle,
  Building,
  Briefcase,
  FileText,
  Star,
  AtSign
} from "lucide-react";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  specialties: string[];
  acceptTerms: boolean;
  
}

interface PrestataireFormProps {
  formData: FormData;
  errors: Partial<FormData>;
  isSubmitting: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

const PrestataireForm: React.FC<PrestataireFormProps> = ({
  formData,
  errors,
  isSubmitting,
  handleInputChange,
  handleSubmit,
  setStep,
  setFormData
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentSpecialty, setCurrentSpecialty] = useState("");

  const inputClasses = "w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200";
  const errorInputClasses = "w-full px-4 py-3 rounded-2xl border border-red-300 dark:border-red-600 bg-red-50/80 dark:bg-red-900/20 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200";

  // Vérifier si le formulaire a des erreurs
  // errors peut contenir des valeurs string (messages d'erreur) ou true (pour les checkboxes)
  const hasErrors = Object.keys(errors).some(key => {
    const errorValue = errors[key as keyof typeof errors];
    // Si c'est une string (message d'erreur) ou true (checkbox non coché), c'est une erreur
    // Pour les tableaux (specialties), on vérifie si c'est un tableau non vide
    if (Array.isArray(errorValue)) {
      return errorValue.length > 0;
    }
    return typeof errorValue === 'string' || errorValue === true;
  });
  
  // Vérifier si tous les champs requis sont remplis (pour prestataire)
  const isFormValid = 
    formData.firstName.trim() !== "" &&
    formData.lastName.trim() !== "" &&
    formData.username.trim() !== "" &&
    formData.email.trim() !== "" &&
    formData.password !== "" &&
    formData.specialties.length > 0 &&
    formData.acceptTerms === true;
    

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

  const addSpecialty = () => {
    if (currentSpecialty.trim() && !formData.specialties.includes(currentSpecialty.trim())) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, currentSpecialty.trim()]
      }));
      setCurrentSpecialty("");
    }
  };

  const removeSpecialty = (specialtyToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter(specialty => specialty !== specialtyToRemove)
    }));
  };

  return (
    <form onSubmit={handleFormSubmit} className="p-8 space-y-6">
      {/* Personal Information */}
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

      {/* Username */}
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

      {/* Contact Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
      </div>
 {/* Specialties */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Spécialités *
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={currentSpecialty}
            onChange={(e) => setCurrentSpecialty(e.target.value)}
            className={errors.specialties ? errorInputClasses : inputClasses}
            placeholder="Ajouter une spécialité"
          />
          <button
            type="button"
            onClick={addSpecialty}
            className="px-4 py-3 bg-yellow-400 text-white rounded-2xl hover:bg-yellow-500 transition-colors"
          >
            Ajouter
          </button>
        </div>
        {errors.specialties && (
          <div className="flex items-center gap-2 mt-2 text-red-600 dark:text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            Au moins une spécialité est requise
          </div>
        )}
        
        {/* Liste des spécialités */}
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.specialties.map((specialty, index) => (
            <span key={index} className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
              <Star className="w-3 h-3" />
              {specialty}
              <button
                type="button"
                onClick={() => removeSpecialty(specialty)}
                className="text-yellow-600 hover:text-yellow-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

     

      {/* Terms and Conditions */}
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
          </Link>
          *
        </label>
      </div>
      {errors.acceptTerms && (
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          Vous devez accepter les conditions
        </div>
      )}

      {/* Navigation */}
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="py-3 px-6 border border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition-colors"
        >
          Retour
        </button>
        
        <motion.button
          type="submit"
          disabled={isSubmitting || hasErrors || !isFormValid}
          whileHover={{ scale: isSubmitting || hasErrors || !isFormValid ? 1 : 1.02 }}
          whileTap={{ scale: isSubmitting || hasErrors || !isFormValid ? 1 : 0.98 }}
          className={`bg-gradient-to-r font-semibold py-3 px-6 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 ${
            isSubmitting || hasErrors || !isFormValid
              ? "from-gray-400 to-gray-500 cursor-not-allowed text-gray-200"
              : "from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white"
          }`}
          title={hasErrors ? "Veuillez corriger les erreurs avant de soumettre" : !isFormValid ? "Veuillez remplir tous les champs requis" : ""}
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Création du compte...
            </>
          ) : hasErrors ? (
            <>
              <AlertCircle className="w-5 h-5" />
              Corriger les erreurs
            </>
          ) : (
            <>
              Créer mon compte
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </motion.button>
      </div>
    </form>
  );
};

export default PrestataireForm;