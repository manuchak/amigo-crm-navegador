
import { format } from "date-fns";
import { es } from "date-fns/locale";

// Define column types for better template generation
export type ColumnType = 'text' | 'numeric' | 'boolean' | 'date' | 'time' | 'datetime' | 'interval';

export interface ColumnDefinition {
  name: string;
  displayName: string;
  type: ColumnType;
  required: boolean;
  example: string;
  description?: string;
}

// Define the main columns for the servicios_custodia template
export const templateColumns: ColumnDefinition[] = [
  // Cliente y servicio - datos esenciales
  {
    name: 'nombre_cliente',
    displayName: 'Nombre del Cliente',
    type: 'text',
    required: true,
    example: 'Empresa ABC',
    description: 'Nombre completo del cliente o empresa'
  },
  {
    name: 'fecha_hora_cita',
    displayName: 'Fecha y Hora de Cita',
    type: 'datetime',
    required: true,
    example: format(new Date(), 'yyyy-MM-dd HH:mm:ss', { locale: es }),
    description: 'Fecha y hora en formato AAAA-MM-DD HH:MM:SS'
  },
  {
    name: 'tipo_servicio',
    displayName: 'Tipo de Servicio',
    type: 'text',
    required: true,
    example: 'Escolta',
    description: 'Tipo de servicio (Escolta, Validación, etc.)'
  },
  {
    name: 'nombre_custodio',
    displayName: 'Nombre del Custodio',
    type: 'text',
    required: true,
    example: 'Juan Pérez',
    description: 'Nombre completo del custodio'
  },
  {
    name: 'origen',
    displayName: 'Origen',
    type: 'text',
    required: true,
    example: 'Ciudad de México',
    description: 'Ciudad de origen'
  },
  {
    name: 'destino',
    displayName: 'Destino',
    type: 'text',
    required: true,
    example: 'Guadalajara',
    description: 'Ciudad de destino'
  },
  // Información básica
  {
    name: 'id_servicio',
    displayName: 'ID Servicio',
    type: 'text',
    required: false,
    example: 'SRV-2023-001',
    description: 'Identificador único del servicio'
  },
  {
    name: 'estado',
    displayName: 'Estado',
    type: 'text',
    required: false,
    example: 'Completado',
    description: 'Estado del servicio (Completado, Pendiente, Cancelado, etc.)'
  },
  {
    name: 'folio_cliente',
    displayName: 'Folio Cliente',
    type: 'text',
    required: false,
    example: 'FC-001',
    description: 'Folio asignado por el cliente'
  },
  {
    name: 'numero_manifiesto',
    displayName: 'Número de Manifiesto',
    type: 'text',
    required: false,
    example: 'MNF-2023-001',
    description: 'Número o folio del manifiesto'
  },
  {
    name: 'comentarios_adicionales',
    displayName: 'Comentarios',
    type: 'text',
    required: false,
    example: 'Servicio con escolta adicional',
    description: 'Comentarios u observaciones adicionales'
  },
  // Datos numéricos
  {
    name: 'km_recorridos',
    displayName: 'KM Recorridos',
    type: 'numeric',
    required: false,
    example: '450',
    description: 'Kilómetros recorridos en número'
  },
  {
    name: 'km_teorico',
    displayName: 'KM Teórico',
    type: 'numeric',
    required: false,
    example: '420',
    description: 'Kilómetros teóricos estimados'
  },
  {
    name: 'km_extras',
    displayName: 'KM Extras',
    type: 'numeric',
    required: false,
    example: '30',
    description: 'Kilómetros extras realizados'
  },
  {
    name: 'cobro_cliente',
    displayName: 'Cobro al Cliente',
    type: 'numeric',
    required: false,
    example: '5000',
    description: 'Monto cobrado al cliente (sin símbolos)'
  },
  {
    name: 'costo_custodio',
    displayName: 'Costo del Custodio',
    type: 'numeric',
    required: false,
    example: '3000',
    description: 'Costo pagado al custodio (sin símbolos)'
  },
  {
    name: 'casetas',
    displayName: 'Casetas',
    type: 'numeric',
    required: false,
    example: '500',
    description: 'Costo de casetas (sin símbolos)'
  },
  {
    name: 'cantidad_transportes',
    displayName: 'Cantidad de Transportes',
    type: 'numeric',
    required: false,
    example: '1',
    description: 'Número de transportes utilizados'
  },
  // Datos de timing
  {
    name: 'fecha_hora_asignacion',
    displayName: 'Fecha Hora Asignación',
    type: 'datetime',
    required: false,
    example: format(new Date(), 'yyyy-MM-dd HH:mm:ss', { locale: es }),
    description: 'Fecha y hora de asignación'
  },
  {
    name: 'hora_presentacion',
    displayName: 'Hora de Presentación',
    type: 'time',
    required: false,
    example: '09:00:00',
    description: 'Hora de presentación en formato HH:MM:SS'
  },
  {
    name: 'hora_inicio_custodia',
    displayName: 'Hora Inicio Custodia',
    type: 'time',
    required: false,
    example: '10:00:00',
    description: 'Hora de inicio de custodia en formato HH:MM:SS'
  },
  {
    name: 'hora_arribo',
    displayName: 'Hora de Arribo',
    type: 'time',
    required: false,
    example: '12:30:00',
    description: 'Hora de arribo en formato HH:MM:SS'
  },
  {
    name: 'hora_finalizacion',
    displayName: 'Hora de Finalización',
    type: 'time',
    required: false,
    example: '14:45:00',
    description: 'Hora de finalización en formato HH:MM:SS'
  },
  // Fechas adicionales
  {
    name: 'fecha_contratacion',
    displayName: 'Fecha Contratación',
    type: 'date',
    required: false,
    example: format(new Date(), 'yyyy-MM-dd', { locale: es }),
    description: 'Fecha de contratación del servicio (AAAA-MM-DD)'
  },
  {
    name: 'fecha_primer_servicio',
    displayName: 'Fecha Primer Servicio',
    type: 'date',
    required: false,
    example: format(new Date(), 'yyyy-MM-dd', { locale: es }),
    description: 'Fecha del primer servicio (AAAA-MM-DD)'
  },
  // Datos del vehículo
  {
    name: 'auto',
    displayName: 'Auto',
    type: 'text',
    required: false,
    example: 'Toyota Hilux',
    description: 'Vehículo utilizado'
  },
  {
    name: 'placa',
    displayName: 'Placa',
    type: 'text',
    required: false,
    example: 'ABC-1234',
    description: 'Placa del vehículo'
  },
  {
    name: 'tipo_unidad',
    displayName: 'Tipo de Unidad',
    type: 'text',
    required: false,
    example: 'Pickup',
    description: 'Tipo de vehículo'
  },
  // Datos de custodia
  {
    name: 'armado',
    displayName: 'Es Armado',
    type: 'boolean',
    required: false,
    example: 'si',
    description: 'Indica si el servicio incluye custodio armado (si/no)'
  },
  {
    name: 'nombre_armado',
    displayName: 'Nombre del Armado',
    type: 'text',
    required: false,
    example: 'Pedro González',
    description: 'Nombre del custodio armado'
  },
  {
    name: 'telefono_armado',
    displayName: 'Teléfono del Armado',
    type: 'text',
    required: false,
    example: '5512345678',
    description: 'Teléfono del custodio armado'
  },
  {
    name: 'id_custodio',
    displayName: 'ID del Custodio',
    type: 'text',
    required: false,
    example: 'CUST-001',
    description: 'Identificador del custodio'
  },
  {
    name: 'telefono',
    displayName: 'Teléfono',
    type: 'text',
    required: false,
    example: '5598765432',
    description: 'Teléfono de contacto principal'
  },
  // Información adicional
  {
    name: 'local_foraneo',
    displayName: 'Local/Foráneo',
    type: 'text',
    required: false,
    example: 'Local',
    description: 'Indica si el servicio es local o foráneo'
  },
  {
    name: 'ruta',
    displayName: 'Ruta',
    type: 'text',
    required: false,
    example: 'CDMX-GDL',
    description: 'Ruta del servicio'
  },
  {
    name: 'proveedor',
    displayName: 'Proveedor',
    type: 'text',
    required: false,
    example: 'Transportes SA',
    description: 'Proveedor del servicio'
  },
  // Tiempo estimado y duraciones
  {
    name: 'tiempo_estimado',
    displayName: 'Tiempo Estimado',
    type: 'interval',
    required: false,
    example: '02:30:00',
    description: 'Tiempo estimado del servicio (HH:MM:SS)'
  },
  {
    name: 'duracion_servicio',
    displayName: 'Duración Servicio',
    type: 'interval',
    required: false,
    example: '03:15:00',
    description: 'Duración real del servicio (HH:MM:SS)'
  },
  {
    name: 'tiempo_retraso',
    displayName: 'Tiempo Retraso',
    type: 'interval',
    required: false,
    example: '00:45:00',
    description: 'Tiempo de retraso (HH:MM:SS)'
  },
  {
    name: 'tiempo_punto_origen',
    displayName: 'Tiempo en Origen',
    type: 'interval',
    required: false,
    example: '00:30:00',
    description: 'Tiempo en el punto de origen (HH:MM:SS)'
  },
  // Operadores de transporte
  {
    name: 'nombre_operador_transporte',
    displayName: 'Nombre Operador',
    type: 'text',
    required: false,
    example: 'Roberto Sánchez',
    description: 'Nombre del operador de transporte'
  },
  {
    name: 'telefono_operador',
    displayName: 'Teléfono Operador',
    type: 'text',
    required: false,
    example: '5587654321',
    description: 'Teléfono del operador'
  },
  {
    name: 'placa_carga',
    displayName: 'Placa de Carga',
    type: 'text',
    required: false,
    example: 'XYZ-9876',
    description: 'Placa del vehículo de carga'
  },
  {
    name: 'tipo_carga',
    displayName: 'Tipo de Carga',
    type: 'text',
    required: false,
    example: 'Contenedor',
    description: 'Tipo de carga transportada'
  },
  // Operador adicional
  {
    name: 'nombre_operador_adicional',
    displayName: 'Nombre Operador Adicional',
    type: 'text',
    required: false,
    example: 'Carlos López',
    description: 'Nombre del operador adicional'
  },
  {
    name: 'telefono_operador_adicional',
    displayName: 'Teléfono Operador Adicional',
    type: 'text',
    required: false,
    example: '5532109876',
    description: 'Teléfono del operador adicional'
  },
  {
    name: 'placa_carga_adicional',
    displayName: 'Placa Carga Adicional',
    type: 'text',
    required: false,
    example: 'ABC-5432',
    description: 'Placa del vehículo de carga adicional'
  },
  {
    name: 'tipo_unidad_adicional',
    displayName: 'Tipo Unidad Adicional',
    type: 'text',
    required: false,
    example: 'Tractocamión',
    description: 'Tipo de unidad adicional'
  },
  {
    name: 'tipo_carga_adicional',
    displayName: 'Tipo Carga Adicional',
    type: 'text',
    required: false,
    example: 'Granel',
    description: 'Tipo de carga adicional'
  },
  // Contactos de emergencia
  {
    name: 'contacto_emergencia',
    displayName: 'Contacto Emergencia',
    type: 'text',
    required: false,
    example: 'María Rodríguez',
    description: 'Nombre del contacto en caso de emergencia'
  },
  {
    name: 'telefono_emergencia',
    displayName: 'Teléfono Emergencia',
    type: 'text',
    required: false,
    example: '5545678901',
    description: 'Teléfono del contacto de emergencia'
  },
  // Gadgets y equipo
  {
    name: 'gadget_solicitado',
    displayName: 'Gadget Solicitado',
    type: 'text',
    required: false,
    example: 'GPS',
    description: 'Gadget o equipo solicitado'
  },
  {
    name: 'gadget',
    displayName: 'Gadget',
    type: 'text',
    required: false,
    example: 'GPS-001',
    description: 'Identificador del gadget o equipo'
  },
  {
    name: 'tipo_gadget',
    displayName: 'Tipo Gadget',
    type: 'text',
    required: false,
    example: 'Rastreador',
    description: 'Tipo de gadget o equipo'
  },
  // Información administrativa
  {
    name: 'creado_por',
    displayName: 'Creado Por',
    type: 'text',
    required: false,
    example: 'Admin',
    description: 'Usuario que creó el registro'
  },
  {
    name: 'creado_via',
    displayName: 'Creado Vía',
    type: 'text',
    required: false,
    example: 'Web',
    description: 'Medio por el cual se creó el registro'
  },
  {
    name: 'id_cotizacion',
    displayName: 'ID Cotización',
    type: 'text',
    required: false,
    example: 'COT-2023-001',
    description: 'Identificador de la cotización'
  },
  {
    name: 'gm_transport_id',
    displayName: 'ID GM Transport',
    type: 'text',
    required: false,
    example: 'GMT-001',
    description: 'ID de transporte GM'
  },
  {
    name: 'presentacion',
    displayName: 'Presentación',
    type: 'text',
    required: false,
    example: 'Formal',
    description: 'Tipo de presentación requerida'
  },
];
