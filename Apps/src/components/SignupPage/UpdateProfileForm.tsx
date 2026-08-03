import React from "react";
import { motion } from "framer-motion";
import { User, Mail, AlertCircle } from "lucide-react";

export interface UpdateFormData {
  firstName: string;
  lastName: string;
  email: string;
}

export interface UpdateFormProps {
  formData: UpdateFormData;
  errors: { firstName?: string; lastName?: string; email?: string; form?: string };
  isSubmitting: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

const UpdateForm: React.FC<UpdateFormProps> = ({
  formData,
  errors,
  isSubmitting,
  handleInputChange,
  handleSubmit
}) => {
  const inputClasses = "w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200";
  const errorInputClasses = "w-full px-4 py-3 rounded-2xl border border-red-300 dark:border-red-600 bg-red-50/80 dark:bg-red-900/20 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200";

  const isFormValid = 
    formData.firstName.trim() !== "" &&
    formData.lastName.trim() !== "" &&
    formData.email.trim() !== "";

  const hasErrors = Object.keys(errors).some(
    key => typeof errors[key as keyof typeof errors] === 'string' && (errors[key as keyof typeof errors] as string).trim() !== ''
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Prénom</label>
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
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Nom</label>
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

      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Email</label>
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
      
      {errors.form && (
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          {errors.form}
        </div>
      )}

      <motion.button
        type="submit"
        disabled={isSubmitting || hasErrors || !isFormValid}
        whileHover={{ scale: isSubmitting || hasErrors || !isFormValid ? 1 : 1.02 }}
        whileTap={{ scale: isSubmitting || hasErrors || !isFormValid ? 1 : 0.98 }}
        className={`w-full font-semibold py-3 px-6 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 ${
            isSubmitting || hasErrors || !isFormValid
              ? "bg-gray-400 cursor-not-allowed text-gray-200"
              : "bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white"
          }`}
      >
        {isSubmitting ? (
           <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : "Enregistrer les modifications"}
      </motion.button>
    </form>
  );
};

export default UpdateForm;
