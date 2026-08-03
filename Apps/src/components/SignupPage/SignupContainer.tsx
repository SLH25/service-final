import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { User, Briefcase, CheckCircle } from "lucide-react";
import SignupForm from "./SignupForm";
import PrestataireForm from "./SigunpFormPrestataire";
import { useAuth } from "./AuthContext";

interface FormData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  specialties: string[];
  acceptTerms: boolean;
 
 
}

const SignupContainer: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<"client" | "prestataire">("client");

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    acceptTerms: false,
    specialties:[],
    
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTypeSelect = (type: "client" | "prestataire") => {
    setSelectedType(type);
    setFormData((prev) => ({ ...prev, userType: type }));
    setStep(2);
  };

  // === Fonction pour gérer les changements ===
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));

    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // === Fonction pour valider ===
  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};
    
    // Si c'est un prestataire, on laisse le composant PrestataireForm gérer sa validation interne
    if (selectedType === "prestataire") {
        return true; 
    }

    // Validation du prénom
    if (!formData.firstName.trim()) {
      newErrors.firstName = "Le prénom est requis";
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = "Le prénom doit contenir au moins 2 caractères";
    } else if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(formData.firstName.trim())) {
      newErrors.firstName = "Le prénom ne doit contenir que des lettres";
    }
    
    // Validation du nom
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Le nom est requis";
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = "Le nom doit contenir au moins 2 caractères";
    } else if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(formData.lastName.trim())) {
      newErrors.lastName = "Le nom ne doit contenir que des lettres";
    }
    
    // Validation du username
    if (!formData.username.trim()) {
      newErrors.username = "Le nom d'utilisateur est requis";
    } else if (formData.username.trim().length < 3) {
      newErrors.username = "Le nom d'utilisateur doit contenir au moins 3 caractères";
    }

    // Validation de l'email
    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = "L'email n'est pas valide";
      }
    }
    
    // Validation du mot de passe
    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (formData.password.length < 8) {
      newErrors.password = "Le mot de passe doit contenir au moins 8 caractères";
    } else if (!/(?=.*[a-z])/.test(formData.password)) {
      newErrors.password = "Le mot de passe doit contenir au moins une minuscule";
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = "Le mot de passe doit contenir au moins une majuscule";
    } else if (!/(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Le mot de passe doit contenir au moins un chiffre";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // === Soumission du formulaire ===
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation stricte : validateForm() vérifie tous les champs et retourne false s'il y a des erreurs
    // Si validateForm() retourne false, on bloque immédiatement la soumission
    const isValid = validateForm();
    if (!isValid) {
      console.warn("❌ Validation échouée : le formulaire contient des erreurs. Soumission bloquée.");
      // Les erreurs sont déjà affichées à l'utilisateur via setErrors dans validateForm
      return;
    }
    
    // Si validateForm() retourne true, cela signifie :
    // - Tous les champs requis sont remplis
    // - Tous les formats sont valides
    // - Aucune erreur n'existe (newErrors est vide)
    // On peut donc procéder à la soumission en toute sécurité
    
    console.log("✅ Validation réussie : soumission du formulaire...");
    setIsSubmitting(true);
    
    try {
      // Préparation des données pour le backend (mapping camelCase -> snake_case)
      let payload;
      if (selectedType === "client") {
        payload = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          first_name: formData.firstName,
          last_name: formData.lastName,
          user_type: "client"
        };
      } else {
        // Payload pour prestataire
        payload = {
          ...formData,
          first_name: formData.firstName,
          last_name: formData.lastName,
          user_type: "prestataire"
        };
      }
      
      const response = await axios.post("http://127.0.0.1:8000/app/auth/register/", payload);
      
      console.log("✅ Inscription réussie:", response.data);
      
      // Stocker les données du profil utilisateur et rediriger vers l'accueil
      login(response.data);
      navigate("/");
    } catch (error) {
      console.error("❌ Erreur lors de l'inscription:", error);
      if (axios.isAxiosError(error) && error.response) {
        console.error("Détails de l'erreur:", error.response.data);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // === Rendu de l'étape 1 : Choix du type de compte ===
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

  // === Rendu de l'étape 2 : Formulaire spécifique ===
  return (
    <div className="max-w-4xl mx-auto">
      {selectedType === "client" ? (
        <SignupForm
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          isSubmitting={isSubmitting}
          handleSubmit={handleSubmit}
          handleInputChange={handleInputChange}
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
