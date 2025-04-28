
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const driverBehaviorColumns = [
  { 
    name: 'driver_name', 
    displayName: 'Nombre del Conductor', 
    description: 'Nombre completo del conductor', 
    type: 'text', 
    required: true, 
    example: 'Juan Pérez' 
  },
  { 
    name: 'driver_group', 
    displayName: 'Grupo', 
    description: 'Grupo o flota a la que pertenece el conductor', 
    type: 'text', 
    required: true, 
    example: 'Flota Ciudad de México' 
  },
  { 
    name: 'penalty_points', 
    displayName: 'Puntos de Penalización', 
    description: 'Puntos de penalización acumulados', 
    type: 'number', 
    required: true, 
    example: '15' 
  },
  { 
    name: 'trips_count', 
    displayName: 'Número de Viajes', 
    description: 'Cantidad total de viajes realizados en el período', 
    type: 'number', 
    required: true, 
    example: '42' 
  },
  { 
    name: 'duration', 
    displayName: 'Duración Total', 
    description: 'Duración total de manejo en formato HH:MM:SS', 
    type: 'text', 
    required: false, 
    example: '125:30:00' 
  },
  { 
    name: 'distance', 
    displayName: 'Distancia Total (km)', 
    description: 'Distancia total recorrida en kilómetros', 
    type: 'number', 
    required: false, 
    example: '1850.5' 
  },
  { 
    name: 'start_date', 
    displayName: 'Fecha Inicio', 
    description: 'Fecha de inicio del período de evaluación (AAAA-MM-DD)', 
    type: 'date', 
    required: true, 
    example: '2025-04-01' 
  },
  { 
    name: 'end_date', 
    displayName: 'Fecha Fin', 
    description: 'Fecha de fin del período de evaluación (AAAA-MM-DD)', 
    type: 'date', 
    required: true, 
    example: '2025-04-30' 
  },
  { 
    name: 'client', 
    displayName: 'Cliente', 
    description: 'Nombre del cliente o empresa', 
    type: 'text', 
    required: true, 
    example: 'Logística Express SA' 
  }
];

// Create CSV header row with names and descriptions
export const createDriverBehaviorHeaderRow = (): string => {
  return driverBehaviorColumns.map(col => col.displayName).join(',');
};

// Create description row to help users understand each field
export const createDriverBehaviorDescriptionRow = (): string => {
  return driverBehaviorColumns.map(col => {
    const requiredText = col.required ? '[Requerido]' : '[Opcional]';
    return `"${requiredText} ${col.description?.replace(/"/g, '""') || ''}"`;
  }).join(',');
};

// Create example data row
export const createDriverBehaviorExampleRow = (): string => {
  return driverBehaviorColumns.map(col => {
    // Add quotes around text values to handle commas properly
    if (col.type === 'text' || col.type === 'date' || col.type === 'time') {
      return `"${col.example}"`;
    }
    return col.example;
  }).join(',');
};

// Create instruction rows for the CSV
export const createDriverBehaviorInstructionsRows = (): string => {
  // Instructions at the top of the CSV
  return [
    '"# PLANTILLA PARA IMPORTACIÓN DE DATOS DE COMPORTAMIENTO DE CONDUCCIÓN"',
    '"# Instrucciones:"',
    '"# 1. No modifique la estructura de columnas"',
    '"# 2. Las columnas marcadas como [Requerido] son obligatorias"',
    '"# 3. Respete el formato de los campos numéricos (sin símbolos $ o separadores de miles)"',
    '"# 4. Para fechas use el formato AAAA-MM-DD"',
    '"# 5. La puntuación será calculada automáticamente basada en los puntos de penalización"',
    '"# 6. Elimine estas líneas de instrucciones antes de importar"',
    '"# --------------------------------------------------------------------------"'
  ].join('\n');
};

// Generate the complete CSV template content
export function generateDriverBehaviorCsvTemplate(): string {
  const headerRow = createDriverBehaviorHeaderRow();
  const descriptionRow = createDriverBehaviorDescriptionRow();
  const exampleRow = createDriverBehaviorExampleRow();
  const instructions = createDriverBehaviorInstructionsRows();
  
  // Combine all parts of the CSV
  return `${instructions}\n${headerRow}\n${descriptionRow}\n${exampleRow}`;
}

// Generate an Excel-compatible CSV file with BOM to ensure proper character encoding
export function generateDriverBehaviorCsvTemplateWithBOM(): string {
  const BOM = '\uFEFF'; // Byte Order Mark for Excel compatibility
  return BOM + generateDriverBehaviorCsvTemplate();
}

// Helper function to download the CSV template
export function downloadDriverBehaviorCsvTemplate(): void {
  const csvContent = generateDriverBehaviorCsvTemplateWithBOM();
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  // Set download attributes
  const date = format(new Date(), 'yyyyMMdd', { locale: es });
  link.download = `plantilla_comportamiento_conduccion_${date}.csv`;
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
