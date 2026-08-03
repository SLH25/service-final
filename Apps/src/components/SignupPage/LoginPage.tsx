import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LoginForm from "./LoginForm";
import { useAuth } from "./AuthContext";

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

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const nextValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: nextValue }));
  };

  const validate = (): boolean => {
    const newErrors: LoginFormErrors = {};
    
    // Validation du nom d'utilisateur
    if (!formData.username.trim()) {
      newErrors.username = "Le nom d'utilisateur est requis";
    }
    
    // Validation du mot de passe
    if (!formData.password || formData.password.trim().length === 0) {
      newErrors.password = "Le mot de passe est requis";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation stricte : si validate() retourne false, on bloque la soumission
    const isValid = validate();
    if (!isValid) {
      console.warn("❌ Validation échouée : le formulaire contient des erreurs. Soumission bloquée.");
      // Les erreurs sont déjà affichées à l'utilisateur via setErrors dans validate
      return;
    }
    
    // Vérification supplémentaire : s'assurer que les champs ne sont pas vides
    if (!formData.username.trim() || !formData.password) {
      console.warn("❌ Champs manquants : soumission bloquée.");
      return;
    }
    
    // Si toutes les validations passent, on peut soumettre
    console.log("✅ Validation réussie : connexion en cours...");
    setIsSubmitting(true);
    setErrors((prev) => ({ ...prev, form: undefined }));
    
    try {
      // Appel API de connexion
      // Use dynamic host to allow access from other devices on the network
      const apiHost = window.location.hostname === 'localhost' ? '127.0.0.1' : window.location.hostname;
      const response = await axios.post(`http://${apiHost}:8000/app/auth/login/`, formData);

      // Mise à jour du statut utilisateur via le contexte
      login(response.data);
      
      // Si succès, redirige vers l'accueil (ou un dashboard)
      console.log("✅ Connexion réussie");
      navigate("/");
    } catch (err: unknown) {
      console.error("❌ Erreur lors de la connexion:", err);
      setErrors((prev) => ({
        ...prev,
        form: "Identifiants invalides. Vérifie ton nom d'utilisateur et ton mot de passe.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur border border-gray-200 dark:border-gray-700 rounded-3xl shadow-xl">
        <div className="p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Connexion</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">Ravi de te revoir !</p>
          </div>
          <LoginForm
            formData={formData}
            errors={errors}
            isSubmitting={isSubmitting}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}
