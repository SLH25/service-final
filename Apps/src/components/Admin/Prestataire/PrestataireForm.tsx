import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Briefcase, User, Mail, Phone, FileText, MapPin, Building, Image as ImageIcon, Star, CheckCircle } from "lucide-react";
import type { PrestataireData, PrestataireStatus } from "../types";
import { refreshServiceIdMap } from "../adminApi";

interface FormErrors {
  nom?: string;
  prenom?: string;
  service?: string;
  email?: string;
  telephone?: string;
}

// Formulaire d'ÉDITION d'un prestataire existant.
// Pas de création ici : les prestataires s'inscrivent via le site public.
export default function PrestataireForm({
  open,
  onClose,
  onSave,
  editData,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<PrestataireData, "id" | "dateAjout">) => void;
  editData?: PrestataireData | null;
}) {
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [service, setService] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState("");
  const [adresse, setAdresse] = useState("");
  const [ville, setVille] = useState("");
  const [experience, setExperience] = useState("");
  const [statut, setStatut] = useState<PrestataireStatus>("PENDING");
  const [errors, setErrors] = useState<FormErrors>({});
  const [notification, setNotification] = useState<string | null>(null);
  const [services, setServices] = useState<{ id: string; name: string }[]>([]);

  const isEditing = !!editData;

  // Charger TOUS les services (actifs + inactifs) depuis le backend
  useEffect(() => {
    if (!open) return;
    refreshServiceIdMap()
      .then((map) => {
        setServices(Object.entries(map).map(([name, id]) => ({ id: String(id), name })));
      })
      .catch(() => {
        setServices([]);
      });
  }, [open]);

  // Reset form when modal opens
  useEffect(() => {
    if (!open) return;
    if (editData) {
      setNom(editData.nom);
      setPrenom(editData.prenom);
      setService(editData.service);
      setEmail(editData.email);
      setTelephone(editData.telephone);
      setDescription(editData.description);
      setPhoto(editData.photo);
      setAdresse(editData.adresse);
      setVille(editData.ville);
      setExperience(editData.experience != null ? String(editData.experience) : "");
      setStatut(editData.statut);
    } else {
      setNom("");
      setPrenom("");
      setService("");
      setEmail("");
      setTelephone("");
      setDescription("");
      setPhoto("");
      setAdresse("");
      setVille("");
      setExperience("");
      setStatut("PENDING");
    }
    setErrors({});
    setNotification(null);
  }, [open, editData]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!nom.trim()) newErrors.nom = "Le nom est requis";
    if (!prenom.trim()) newErrors.prenom = "Le prénom est requis";
    if (!service.trim()) newErrors.service = "Le service est requis";
    if (!email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Email invalide";
    }
    if (!telephone.trim()) {
      newErrors.telephone = "Le téléphone est requis";
    } else if (!/^[0-9+\-\s]{8,15}$/.test(telephone.trim())) {
      newErrors.telephone = "Numéro invalide (8-15 chiffres)";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      nom: nom.trim(),
      prenom: prenom.trim(),
      service: service.trim(),
      email: email.trim(),
      telephone: telephone.trim(),
      description: description.trim(),
      photo: photo.trim(),
      adresse: adresse.trim(),
      ville: ville.trim(),
      experience: experience.trim() !== "" ? Number(experience.trim()) : null,
      statut,
    });

    setNotification("Prestataire modifié avec succès !");

    setTimeout(() => {
      setNotification(null);
      onClose();
    }, 1200);
  };

  const inputClass = (field: keyof FormErrors) =>
    `w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:ring-2 dark:text-white dark:placeholder-slate-500 ${
      errors[field]
        ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-500/20 dark:border-red-700 dark:bg-red-900/20"
        : "border-slate-200 bg-slate-50 focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-800/50 dark:focus:border-amber-500 dark:focus:bg-slate-800"
    }`;

  const plainInputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder-slate-500 dark:focus:border-amber-500 dark:focus:bg-slate-800";

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
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      {isEditing ? "Modifier le prestataire" : "Nouveau prestataire"}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {isEditing
                        ? "Modifiez les informations ci-dessous"
                        : "Les prestataires s'inscrivent via le site public"}
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Prénom</label>
                    <div className="relative mt-1.5">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={prenom}
                        onChange={(e) => setPrenom(e.target.value)}
                        placeholder="Ex: Jean"
                        className={inputClass("prenom")}
                      />
                    </div>
                    {errors.prenom && <p className="mt-1 text-xs text-red-500">{errors.prenom}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nom</label>
                    <div className="relative mt-1.5">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={nom}
                        onChange={(e) => setNom(e.target.value)}
                        placeholder="Ex: Dupont"
                        className={inputClass("nom")}
                      />
                    </div>
                    {errors.nom && <p className="mt-1 text-xs text-red-500">{errors.nom}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                    <div className="relative mt-1.5">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Ex: jean.dupont@email.com"
                        className={inputClass("email")}
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
                        placeholder="Ex: 06 12 34 56 78"
                        className={inputClass("telephone")}
                      />
                    </div>
                    {errors.telephone && <p className="mt-1 text-xs text-red-500">{errors.telephone}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Service</label>
                  <div className="relative mt-1.5">
                    <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <select
                      value={service}
                      onChange={(e) => setService(e.target.value)}
                      className={`w-full appearance-none rounded-xl border py-2.5 pl-10 pr-10 text-sm text-slate-900 outline-none transition-all focus:ring-2 dark:text-white ${
                        errors.service
                          ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-500/20 dark:border-red-700 dark:bg-red-900/20"
                          : "border-slate-200 bg-slate-50 focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-800/50 dark:focus:border-amber-500 dark:focus:bg-slate-800"
                      }`}
                    >
                      <option value="">Sélectionner un service</option>
                      {services.map((s) => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                    <svg
                      className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  {errors.service && <p className="mt-1 text-xs text-red-500">{errors.service}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Ville</label>
                    <div className="relative mt-1.5">
                      <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={ville}
                        onChange={(e) => setVille(e.target.value)}
                        placeholder="Ville"
                        className={plainInputClass}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Adresse</label>
                    <div className="relative mt-1.5">
                      <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={adresse}
                        onChange={(e) => setAdresse(e.target.value)}
                        placeholder="Adresse"
                        className={plainInputClass}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Expérience (années)</label>
                    <div className="relative mt-1.5">
                      <Star className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="number"
                        min={0}
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        placeholder="Ex: 5"
                        className={plainInputClass}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Photo (URL)</label>
                    <div className="relative mt-1.5">
                      <ImageIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="url"
                        value={photo}
                        onChange={(e) => setPhoto(e.target.value)}
                        placeholder="https://..."
                        className={plainInputClass}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                  <div className="relative mt-1.5">
                    <FileText className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Description du prestataire..."
                      rows={3}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder-slate-500 dark:focus:border-amber-500 dark:focus:bg-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Statut</label>
                  <div className="relative mt-1.5">
                    <select
                      value={statut}
                      onChange={(e) => setStatut(e.target.value as PrestataireStatus)}
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-4 pr-10 text-sm text-slate-900 outline-none transition-all focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:focus:border-amber-500 dark:focus:bg-slate-800"
                    >
                      <option value="PENDING">En attente</option>
                      <option value="AFFICHE">Affiché</option>
                      <option value="VERIFIED">Vérifié</option>
                      <option value="REJECTED">Refusé</option>
                    </select>
                    <svg
                      className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
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
                    className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition-all hover:shadow-xl active:scale-[0.98]"
                  >
                    Enregistrer
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
