import React from "react";
import SignupFormShell from "./SignupFormShell";
import SharedFormFields from "./SignupFormShared";
import type { FormData, FormErrors } from "./SignupContainer";

interface SignupFormProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  errors: FormErrors;
  isSubmitting: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  setStep: React.Dispatch<React.SetStateAction<number>>;
}

/**
 * Formulaire d'inscription CLIENT.
 * Utilise les mêmes composants, le même style et la même mise en page
 * que le formulaire Prestataire (voir SignupFormShell + SharedFormFields).
 */
const SignupForm: React.FC<SignupFormProps> = ({
  formData,
  errors,
  isSubmitting,
  handleSubmit,
  handleInputChange,
  setStep,
}) => {
  // Champs requis du client
  const isFormValid =
    formData.firstName.trim() !== "" &&
    formData.lastName.trim() !== "" &&
    formData.username.trim() !== "" &&
    formData.email.trim() !== "" &&
    formData.telephone.trim() !== "" &&
    formData.password !== "" &&
    formData.passwordConfirm !== "" &&
    formData.acceptTerms === true;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(errors).some((k) => !!errors[k as keyof FormData])) return;
    if (!isFormValid) return;
    void handleSubmit(e);
  };

  return (
    <SignupFormShell
      title="Créer votre compte Client"
      subtitle="Rejoignez Hello Service et trouvez des professionnels qualifiés"
      isSubmitting={isSubmitting}
      onSubmit={handleFormSubmit}
      onBack={() => setStep(1)}
    >
      <SharedFormFields
        formData={formData}
        errors={errors}
        handleInputChange={handleInputChange}
      />
    </SignupFormShell>
  );
};

export default SignupForm;
