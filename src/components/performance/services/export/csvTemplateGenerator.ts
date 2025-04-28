
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
    name: 'estado',
    displayName: 'Estado',
    type: 'text',
    required: false,
    example: 'Completado',
    description: 'Estado del servicio (Completado, Pendiente, Cancelado, etc.)'
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
    name: 'unidad',
    displayName: 'Unidad',
    type: 'text',
    required: false,
    example: 'Toyota Hilux',
    description: 'Vehículo utilizado'
  },
  {
    name: 'armado',
    displayName: 'Es Armado',
    type: 'boolean',
    required: false,
    example: 'si',
    description: 'Indica si el servicio incluye custodio armado (si/no)'
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
    name: 'comentarios_adicionales',
    displayName: 'Comentarios',
    type: 'text',
    required: false,
    example: 'Servicio con escolta adicional',
    description: 'Comentarios u observaciones adicionales'
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
