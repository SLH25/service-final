export type Statut = "Actif" | "Inactif" | "En attente";

/** Statuts métier d'un prestataire (définis côté backend). */
export type PrestataireStatus = "PENDING" | "AFFICHE" | "VERIFIED" | "REJECTED";

export interface PrestataireData {
  id: string;
  prenom: string;
  nom: string;
  service: string;
  email: string;
  telephone: string;
  description: string;
  photo: string;
  adresse: string;
  ville: string;
  experience: number | null;
  statut: PrestataireStatus;
  dateAjout: string;
}

export interface ClientData {
  id: string;
  prenom: string;
  nom: string;
  username: string;
  email: string;
  telephone: string;
  dateAjout: string;
}

export interface ServiceData {
  id: string;
  name: string;
  description: string;
  statut: Statut;
  dateAjout: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  details: string;
  time: string;
  type: "prestataire" | "service" | "utilisateur" | "system";
}
