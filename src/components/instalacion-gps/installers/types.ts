
export interface InstallerWorkshopFeatures {
  area_techada?: boolean;
  agua_energia?: boolean;
  iluminacion_ventilacion?: boolean;
  herramientas_equipo?: boolean;
  zona_recepcion?: boolean;
  limpieza_senalizacion?: boolean;
  infraestructura_electrica?: boolean;
  documentacion_visible?: boolean;
}

export interface Address {
  state: string;
  city: string;
  colonia?: string;
  street: string;
  number: string;
  postalCode: string;
  references?: string;
}

export interface Installer {
  id: number;
  nombre: string;
  telefono?: string;
  email?: string;
  direccion_personal?: string;
  direccion_personal_state?: string;
  direccion_personal_city?: string;
  rfc?: string;
  taller: boolean;
  taller_direccion?: string;
  taller_features: string[];
  taller_images: string[];
  certificaciones?: string;
  comentarios?: string;
  foto_instalador?: string;
  created_at: string;
  updated_at: string;
}

export interface InstallerStats {
  totalInstallers: number;
  totalInstallations: number;
  workshopCount: number;
  states: Record<string, number>;
}
