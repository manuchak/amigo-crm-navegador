
// Define the columns that should be handled as numeric values
export const knownNumericColumns = [
  'cantidad_transportes',
  'km_teorico',
  'km_recorridos',
  'km_extras',
  'costo_custodio',
  'casetas',
  'cobro_cliente'
];

// Define the columns that should be handled as boolean values
export const knownBooleanColumns = [
  'armado'
];

// Define the columns that should be handled as timestamp values
export const knownTimestampColumns = [
  'fecha_hora_cita', 
  'fecha_hora_asignacion'
];

// Define the columns that should be handled as date values
export const knownDateColumns = [
  'fecha_contratacion',
  'fecha_primer_servicio'
];

// Define the columns that should be handled as time values
export const knownTimeColumns = [
  'hora_presentacion',
  'hora_inicio_custodia',
  'hora_arribo',
  'hora_finalizacion'
];

// Define the columns that should be handled as interval values
export const knownIntervalColumns = [
  'tiempo_retraso',
  'tiempo_punto_origen',
  'duracion_servicio',
  'tiempo_estimado'
];
