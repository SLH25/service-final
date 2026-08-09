import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Briefcase, CheckCircle } from "lucide-react";
import SignupForm from "./SignupForm";
import PrestataireForm from "./SignupFormPrestataire";
import { useAuth } from "./AuthContext";
import { registerUser, type RegisterClientPayload, type RegisterPrestatairePayload } from "../authApi";

export interface FormData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  telephone: string;
  telephoneSecondaire: string;
  serviceId: number | "";
  experience: number | "";
  description: string;
  ville: string;
  adresse: string;
  password: string;
  passwordConfirm: string;
  acceptTerms: boolean;
}

const emptyForm: FormData = {
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  telephone: "",
  telephoneSecondaire: "",
  serviceId: "",
  experience: "",
  description: "",
  ville: "",
  adresse: "",
  password: "",
  passwordConfirm: "",
  acceptTerms: false,
};

export type FormErrors = Partial<Record<keyof FormData, string>> & { server?: string };

const SignupContainer: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<"client" | "prestataire">("client");

  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTypeSelect = (type: "client" | "prestataire") => {
    setSelectedType(type);
    setStep(2);
  };

  // === Gestion des changements ===
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));

    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined, server: undefined }));
    }
  };

  // === Validation des champs communs (username, email, password, ...) ===
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Le prénom est requis";
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = "Le prénom doit contenir au moins 2 caractères";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Le nom est requis";
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = "Le nom doit contenir au moins 2 caractères";
    }

    if (!formData.username.trim()) {
      newErrors.username = "Le nom d'utilisateur est requis";
    } else if (!/^[a-zA-Z0-9_.-]{3,}$/.test(formData.username.trim())) {
      newErrors.username = "3 caractères min. (lettres, chiffres, _ . -)";
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "L'email n'est pas valide";
    }

    if (!formData.telephone.trim()) {
      newErrors.telephone = "Le téléphone est requis";
    } else if (!/^[+0-9][0-9\s.-]{5,}$/.test(formData.telephone.trim())) {
      newErrors.telephone = "Le téléphone n'est pas valide";
    }

    // Téléphone secondaire : optionnel mais format vérifié si renseigné
    if (formData.telephoneSecondaire.trim() && !/^[+0-9][0-9\s.-]{5,}$/.test(formData.telephoneSecondaire.trim())) {
      newErrors.telephoneSecondaire = "Le téléphone n'est pas valide";
    }

    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (formData.password.length < 8) {
      newErrors.password = "Le mot de passe doit contenir au moins 8 caractères";
    }

    if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = "Les mots de passe ne correspondent pas";
    }

    // Conditions : obligatoire uniquement pour le prestataire
    if (selectedType === "prestataire" && !formData.acceptTerms) {
      newErrors.acceptTerms = "Vous devez accepter les conditions";
    }

    // Validation spécifique prestataire
    if (selectedType === "prestataire") {
      if (formData.experience === "") {
        newErrors.experience = "L'expérience est requise";
      } else if (Number(formData.experience) < 0 || Number(formData.experience) > 99) {
        newErrors.experience = "L'expérience doit être entre 0 et 99 ans";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // === Soumission → POST /api/accounts/register/ (UNIQUE source de création) ===
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (selectedType === "prestataire" && !formData.serviceId) {
      setErrors((prev) => ({ ...prev, serviceId: "Le service est requis" }));
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      let payload: RegisterClientPayload | RegisterPrestatairePayload;

      if (selectedType === "client") {
        payload = {
          role: "client",
          username: formData.username.trim(),
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          telephone: formData.telephone,
          password: formData.password,
          password_confirm: formData.passwordConfirm,
        };
      } else {
        payload = {
          role: "prestataire",
          username: formData.username.trim(),
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          telephone: formData.telephone,
          service: formData.serviceId || null,
          telephone_secondaire: formData.telephoneSecondaire,
          experience: formData.experience !== "" ? Number(formData.experience) : null,
          description: formData.description,
          ville: formData.ville,
          adresse: formData.adresse,
          password: formData.password,
          password_confirm: formData.passwordConfirm,
          accept_terms: formData.acceptTerms,
        };
      }

      const response = await registerUser(payload);

      // Connexion locale avec le rôle détecté automatiquement + redirection
      login(response.user, response.access, response.refresh);
      navigate("/");
    } catch (error: any) {
      if (error?.response?.data && typeof error.response.data === "object") {
        const data = error.response.data;
        const fieldMap: Record<string, keyof FormData> = {
          username: "username",
          email: "email",
          password: "password",
          password_confirm: "passwordConfirm",
          accept_terms: "acceptTerms",
          first_name: "firstName",
          last_name: "lastName",
          service: "serviceId",
          telephone: "telephone",
          telephone_secondaire: "telephoneSecondaire",
          experience: "experience",
        };
        const newErrors: FormErrors = {};
        for (const [key, messages] of Object.entries(data)) {
          const field = fieldMap[key];
          const message = Array.isArray(messages) ? messages[0] : String(messages);
          if (field) newErrors[field] = message;
          else newErrors.server = message;
        }
        setErrors(newErrors);
      } else {
        setErrors({ server: "Une erreur est survenue. Réessayez plus tard." });
      }
      console.error("Erreur lors de l'inscription:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // === Étape 1 : Choix du type de compte ===
  if (step === 1) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Comment souhaitez-vous vous inscrire ?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Carte Client */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleTypeSelect("client")}
            className="cursor-pointer bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border-2 border-transparent hover:border-blue-500 transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <CheckCircle className="w-8 h-8 text-blue-500" />
            </div>
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-500 transition-colors">
              <User className="w-8 h-8 text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Client</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Je cherche des services. Je veux trouver des professionnels qualifiés pour mes besoins.
            </p>
          </motion.div>

          {/* Carte Prestataire */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleTypeSelect("prestataire")}
            className="cursor-pointer bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border-2 border-transparent hover:border-yellow-500 transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <CheckCircle className="w-8 h-8 text-yellow-500" />
            </div>
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-yellow-500 transition-colors">
              <Briefcase className="w-8 h-8 text-yellow-600 dark:text-yellow-400 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Prestataire</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Je propose des services. Je veux développer mon activité et trouver de nouveaux clients.
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  // === Étape 2 : Formulaire spécifique ===
  return (
    <div className="max-w-4xl mx-auto">
      {errors.server && (
        <div className="mx-4 mb-4 rounded-2xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {errors.server}
        </div>
      )}
      {selectedType === "client" ? (
        <SignupForm
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          isSubmitting={isSubmitting}
          handleSubmit={handleSubmit}
          handleInputChange={handleInputChange}
          setStep={setStep}
        />
      ) : (
        <PrestataireForm
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          isSubmitting={isSubmitting}
          handleSubmit={handleSubmit}
          handleInputChange={handleInputChange}
          setStep={setStep}
        />
      )}
    </div>
  );
};

export default SignupContainer;