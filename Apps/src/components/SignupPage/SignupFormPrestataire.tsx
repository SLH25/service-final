import React, { useState, useEffect } from "react";
import {
  Briefcase,
  FileText,
  MapPin,
  Building,
  AlertCircle,
} from "lucide-react";
import SignupFormShell from "./SignupFormShell";
import SharedFormFields, { inputClasses, errorInputClasses } from "./SignupFormShared";
import { fetchPublicServices, type PublicService } from "../publicApi";
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
  const [services, setServices] = useState<PublicService[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);

  // Charger les services depuis la base de données (champ administré, pas de création libre)
  useEffect(() => {
    let cancelled = false;
    fetchPublicServices()
      .then((data) => {
        if (!cancelled) setServices(data);
      })
      .catch(() => {
        if (!cancelled) setServices([]);
      })
      .finally(() => {
        if (!cancelled) setServicesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
    </SignupFormShell>
  );
};

export default PrestataireForm;
