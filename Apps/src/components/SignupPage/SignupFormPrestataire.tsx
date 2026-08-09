import React from "react";
import { Link } from "react-router-dom";
import {
  Briefcase,
  FileText,
  MapPin,
  Building,
  AlertCircle,
  Clock,
  Phone,
} from "lucide-react";
import SignupFormShell from "./SignupFormShell";
import SharedFormFields, { inputClasses, errorInputClasses } from "./SignupFormShared";
import { useSearchData } from "../../hooks/useSearchData";
import type { FormData, FormErrors } from "./SignupContainer";

interface PrestataireFormProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  errors: FormErrors;
  isSubmitting: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  setStep: React.Dispatch<React.SetStateAction<number>>;
}

/**
 * Formulaire d'inscription PRESTATAIRE.
 * Reprend les champs communs (même design que le Client) puis ajoute les
 * champs spécifiques : Service, Description, Ville, Adresse.
 */
const PrestataireForm: React.FC<PrestataireFormProps> = ({
  formData,
  errors,
  isSubmitting,
  handleInputChange,
  handleSubmit,
  setStep,
}) => {
  // Services partagés via le hook avec cache (même source que la Navbar et la HeroSection)
  const { services, loading: servicesLoading } = useSearchData();

  const hasErrors = Object.keys(errors).some((key) => {
    const errorValue = errors[key as keyof FormData];
    return typeof errorValue === "string" || errorValue === true;
  });

  // Champs requis du prestataire (le statut PENDING est géré par le backend)
  const isFormValid =
    formData.firstName.trim() !== "" &&
    formData.lastName.trim() !== "" &&
    formData.username.trim() !== "" &&
    formData.email.trim() !== "" &&
    formData.telephone.trim() !== "" &&
    formData.serviceId !== "" &&
    formData.experience !== "" &&
    formData.password !== "" &&
    formData.passwordConfirm !== "" &&
    formData.acceptTerms === true;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasErrors) return;
    if (!isFormValid) return;
    void handleSubmit(e);
  };

  return (
    <SignupFormShell
      title="Créer votre compte Prestataire"
      subtitle="Développez votre activité et trouvez de nouveaux clients"
      isSubmitting={isSubmitting}
      onSubmit={handleFormSubmit}
      onBack={() => setStep(1)}
    >
      {/* Champs communs — design identique au formulaire Client */}
      <SharedFormFields
        formData={formData}
        errors={errors}
        handleInputChange={handleInputChange}
      />

      {/* Service (liste administrée, depuis la base de données) */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Service proposé *
        </label>
        <div className="relative">
          <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            name="serviceId"
            value={formData.serviceId}
            onChange={handleInputChange}
            className={errors.serviceId ? errorInputClasses : inputClasses}
            style={{ paddingLeft: "2.75rem" }}
            disabled={servicesLoading}
          >
            <option value="">
              {servicesLoading ? "Chargement des services..." : "Sélectionnez un service"}
            </option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        {errors.serviceId && (
          <div className="flex items-center gap-2 mt-2 text-red-600 dark:text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            {errors.serviceId}
          </div>
        )}
      </div>

      {/* Deuxième téléphone (optionnel) */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Deuxième téléphone (optionnel)
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="tel"
            name="telephoneSecondaire"
            value={formData.telephoneSecondaire}
            onChange={handleInputChange}
            className={errors.telephoneSecondaire ? errorInputClasses : inputClasses}
            style={{ paddingLeft: "2.75rem" }}
            placeholder="06 12 34 56 78 (optionnel)"
          />
        </div>
        {errors.telephoneSecondaire && (
          <div className="flex items-center gap-2 mt-2 text-red-600 dark:text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            {errors.telephoneSecondaire}
          </div>
        )}
      </div>

      {/* Expérience */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Expérience (en années) *
        </label>
        <div className="relative">
          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="number"
            name="experience"
            value={formData.experience}
            onChange={handleInputChange}
            min={0}
            max={99}
            className={errors.experience ? errorInputClasses : inputClasses}
            style={{ paddingLeft: "2.75rem" }}
            placeholder="Ex : 3"
          />
        </div>
        {errors.experience && (
          <div className="flex items-center gap-2 mt-2 text-red-600 dark:text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            {errors.experience}
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Description
        </label>
        <div className="relative">
          <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className={inputClasses}
            style={{ paddingLeft: "2.75rem" }}
            placeholder="Décrivez vos compétences et votre expérience..."
          />
        </div>
      </div>

      {/* Localisation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Ville
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="ville"
              value={formData.ville}
              onChange={handleInputChange}
              className={inputClasses}
              style={{ paddingLeft: "2.75rem" }}
              placeholder="Votre ville"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Adresse
          </label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="adresse"
              value={formData.adresse}
              onChange={handleInputChange}
              className={inputClasses}
              style={{ paddingLeft: "2.75rem" }}
              placeholder="Adresse"
            />
          </div>
        </div>
      </div>

      {/* Conditions d'utilisation (obligatoire pour prestataire) */}
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
          <Link to="/conditions-utilisation" className="text-yellow-500 hover:text-yellow-600 underline">
            conditions d'utilisation
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
    </SignupFormShell>
  );
};

export default PrestataireForm;
