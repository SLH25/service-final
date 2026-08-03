export type Statut = "Actif" | "Inactif" | "En attente";

export interface PrestataireData {
  id: string;
  nom: string;
  prenom: string;
  service: string;
  email: string;
  telephone: string;
  description: string;
  statut: Statut;
  dateAjout: string;
}

export interface ServiceData {
  id: string;
  name: string;
  description: string;
  statut: Statut;
  dateAjout: string;
}

export interface UtilisateurData {
  id: string;
  name: string;
  email: string;
  telephone: string;
  role: "Client" | "Prestataire" | "Admin";
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