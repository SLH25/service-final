import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, Mail, Phone, CheckCircle } from "lucide-react";
import type { UtilisateurData, Statut } from "../types";

export default function UserForm({
  open,
  onClose,
  onSave,
  editData,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<UtilisateurData, "id" | "dateAjout">) => void;
  editData?: UtilisateurData | null;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [role, setRole] = useState<"Client" | "Prestataire" | "Admin">("Client");
  const [statut, setStatut] = useState<Statut>("Actif");
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [notification, setNotification] = useState<string | null>(null);

  const isEditing = !!editData;

  // Reset form when modal opens
  useEffect(() => {
    if (!open) return;
    if (editData) {
      setName(editData.name);
      setEmail(editData.email);
      setTelephone(editData.telephone);
      setRole(editData.role);
      setStatut(editData.statut);
    } else {
      setName("");
      setEmail("");
      setTelephone("");
      setRole("Client");
      setStatut("Actif");
    }
    setErrors({});
    setNotification(null);
  }, [open, editData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; email?: string } = {};
    if (!name.trim()) newErrors.name = "Le nom est requis.";
    if (!email.trim()) {
      newErrors.email = "L'email est requis.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Email invalide.";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSave({ name: name.trim(), email: email.trim(), telephone: telephone.trim(), role, statut });
    setNotification(isEditing ? "Utilisateur modifié avec succès !" : "Utilisateur ajouté avec succès !");
    setTimeout(() => {
      setNotification(null);
      onClose();
    }, 1200);
  };

  const inputClass = (field: keyof typeof errors) =>
    `w-full rounded-xl border py-2.5 px-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:ring-2 dark:text-white dark:placeholder-slate-500 ${
      errors[field]
        ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-500/20 dark:border-red-700 dark:bg-red-900/20"
        : "border-slate-200 bg-slate-50 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/50 dark:focus:border-blue-500 dark:focus:bg-slate-800"
    }`;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="w-full max-w-lg rounded-2xl border border-slate-200/70 bg-white p-6 shadow-xl dark:border-slate-700/80 dark:bg-slate-900"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300">
                    <UserPlus className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      {isEditing ? "Modifier l'utilisateur" : "Ajouter un utilisateur"}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {isEditing ? "Modifiez les informations" : "Remplissez les informations"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {notification && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-600 dark:text-emerald-400"
                >
                  <CheckCircle className="h-4 w-4" />
                  {notification}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nom complet</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Sophie Martin"
                    className={`mt-1.5 ${inputClass("name")}`}
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Ex: sophie.m@example.com"
                      className={`${inputClass("email")} pl-10`}
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Téléphone</label>
                  <div className="relative mt-1.5">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      value={telephone}
                      onChange={(e) => setTelephone(e.target.value)}
                      placeholder="Ex: +33 6 12 34 56 78"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Rôle</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as "Client" | "Prestataire" | "Admin")}
                      className="mt-1.5 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm text-slate-900 outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white"
                    >
                      <option value="Client">Client</option>
                      <option value="Prestataire">Prestataire</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Statut</label>
                    <select
                      value={statut}
                      onChange={(e) => setStatut(e.target.value as Statut)}
                      className="mt-1.5 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm text-slate-900 outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white"
                    >
                      <option value="Actif">Actif</option>
                      <option value="Inactif">Inactif</option>
                      <option value="En attente">En attente</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl active:scale-[0.98]"
                  >
                    {isEditing ? "Enregistrer" : "Valider"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}