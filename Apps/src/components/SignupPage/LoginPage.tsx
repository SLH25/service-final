import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "./LoginForm";
import { useAuth } from "./AuthContext";
import { loginUser } from "../authApi";

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

    if (!formData.username.trim()) {
      newErrors.username = "Le nom d'utilisateur est requis";
    }

    if (!formData.password || formData.password.trim().length === 0) {
      newErrors.password = "Le mot de passe est requis";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = validate();
    if (!isValid) return;

    if (!formData.username.trim() || !formData.password) return;

    setIsSubmitting(true);
    setErrors((prev) => ({ ...prev, form: undefined }));

    try {
      // Connexion avec username + mot de passe.
      // Le rôle est détecté automatiquement par le backend.
      const response = await loginUser(formData.username.trim(), formData.password);

      // Stocke la session (user + tokens) via le contexte
      login(response.user, response.access, response.refresh);

      // Redirection automatique selon le rôle
      if (response.user.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err: unknown) {
      console.error("❌ Erreur lors de la connexion:", err);
      setErrors((prev) => ({
        ...prev,
        form: "Identifiants invalides. Vérifiez votre nom d'utilisateur et votre mot de passe.",
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
