
import { templateColumns } from './columnDefinitions';

// Create CSV header row with names and descriptions
export const createHeaderRow = (): string => {
  return templateColumns.map(col => col.displayName).join(',');
};

// Create description row to help users understand each field
export const createDescriptionRow = (): string => {
  return templateColumns.map(col => {
    const requiredText = col.required ? '[Requerido]' : '[Opcional]';
    return `"${requiredText} ${col.description?.replace(/"/g, '""') || ''}"`;
  }).join(',');
};

// Create example data row
export const createExampleRow = (): string => {
  return templateColumns.map(col => {
    // Add quotes around text values to handle commas properly
    if (col.type === 'text' || col.type === 'date' || col.type === 'time') {
      return `"${col.example}"`;
    }
    return col.example;
  }).join(',');
};

// Create instruction rows for the CSV
export const createInstructionsRows = (): string => {
  // Instructions at the top of the CSV
  return [
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
};
