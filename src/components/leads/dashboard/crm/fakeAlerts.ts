
/**
 * Typed static fake alerts for CRM dashboard, ready for future modularity.
 */
export interface Alert {
  title: string;
  text: string;
  action: string;
  severity: "high" | "medium";
}

export const fakeAlerts: Alert[] = [
  {
    title: "Muchos leads pendientes",
    text: "Hay un alto número de leads en etapa 'Nuevo' sin contacto inicial.",
    action: "Contactar",
    severity: "high",
  },
  {
    title: "Baja conversión",
    text: "La tasa de conversión hacia 'Calificado' es menor al 20%.",
    action: "Ver detalles",
    severity: "medium",
  },
  {
    title: "Aprobaciones pendientes",
    text: "Hay 5 custodios en espera de aprobación.",
    action: "Aprobar",
    severity: "medium",
  },
];
