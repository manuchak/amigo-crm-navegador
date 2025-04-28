
import { knownNumericColumns, knownBooleanColumns } from "../import/lib/columnMapping";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// Define column types for better template generation
type ColumnType = 'text' | 'numeric' | 'boolean' | 'date' | 'time' | 'interval';

interface ColumnDefinition {
  name: string;
  displayName: string;
  type: ColumnType;
  required: boolean;
  example: string;
  description?: string;
}

// Define the main columns for the servicios_custodia template
const templateColumns: ColumnDefinition[] = [
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
    name: 'fecha_servicio',
    displayName: 'Fecha de Servicio',
    type: 'date',
    required: true,
    example: format(new Date(), 'yyyy-MM-dd', { locale: es }),
    description: 'Fecha en formato AAAA-MM-DD'
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
  // Información básica (requerida)
  {
    name: 'id_servicio',
    displayName: 'ID Servicio',
    type: 'text',
    required: false,
    example: 'SRV-2023-001',
    description: 'Identificador único del servicio'
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
    name: 'estado',
    displayName: 'Estado',
    type: 'text',
    required: false,
    example: 'Completado',
    description: 'Estado del servicio (Completado, Pendiente, Cancelado, etc.)'
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
  // Datos del vehículo
  {
    name: 'unidad',
    displayName: 'Unidad',
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
    name: 'comentarios_adicionales',
    displayName: 'Comentarios',
    type: 'text',
    required: false,
    example: 'Servicio con escolta adicional',
    description: 'Comentarios u observaciones adicionales'
  },
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
  // Campos de presentación y programación
  {
    name: 'presentacion',
    displayName: 'Presentación',
    type: 'text',
    required: false,
    example: 'Formal',
    description: 'Tipo de presentación requerida'
  },
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
  }
];

// Create CSV header row with names and descriptions
const createHeaderRow = (): string => {
  return templateColumns.map(col => col.displayName).join(',');
};

// Create description row to help users understand each field
const createDescriptionRow = (): string => {
  return templateColumns.map(col => {
    const requiredText = col.required ? '[Requerido]' : '[Opcional]';
    return `"${requiredText} ${col.description?.replace(/"/g, '""') || ''}"`;
  }).join(',');
};

// Create example data row
const createExampleRow = (): string => {
  return templateColumns.map(col => {
    // Add quotes around text values to handle commas properly
    if (col.type === 'text' || col.type === 'date' || col.type === 'time') {
      return `"${col.example}"`;
    }
    return col.example;
  }).join(',');
};

// Generate the complete CSV template content
export function generateCsvTemplate(): string {
  const headerRow = createHeaderRow();
  const descriptionRow = createDescriptionRow();
  const exampleRow = createExampleRow();
  
  // Instructions at the top of the CSV
  const instructions = [
    '"# PLANTILLA PARA IMPORTACIÓN DE SERVICIOS DE CUSTODIA"',
    '"# Instrucciones:"',
    '"# 1. No modifique la estructura de columnas"',
    '"# 2. Las columnas marcadas como [Requerido] son obligatorias"',
    '"# 3. Respete el formato de los campos numéricos (sin símbolos $ o separadores de miles)"',
    '"# 4. Para fechas use el formato AAAA-MM-DD"',
    '"# 5. Para campos booleanos use si/no"',
    '"# 6. Elimine estas líneas de instrucciones antes de importar"',
    '"# --------------------------------------------------------------------------"'
  ].join('\n');
  
  // Combine all parts of the CSV
  return `${instructions}\n${headerRow}\n${descriptionRow}\n${exampleRow}`;
}

// Generate an Excel-compatible CSV file with BOM to ensure proper character encoding
export function generateCsvTemplateWithBOM(): string {
  const BOM = '\uFEFF'; // Byte Order Mark for Excel compatibility
  return BOM + generateCsvTemplate();
}

// Helper function to download the CSV template
export function downloadCsvTemplate(): void {
  const csvContent = generateCsvTemplateWithBOM();
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  // Set download attributes
  const date = format(new Date(), 'yyyyMMdd', { locale: es });
  link.download = `plantilla_servicios_custodia_${date}.csv`;
  link.href = url;
  link.style.display = 'none';
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}
