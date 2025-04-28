
/**
 * Utility functions for template-related operations on servicios_custodia imports
 */

import { toast } from "sonner";
import { knownBooleanColumns, knownNumericColumns } from "./columnMapping";

/**
 * Validate if the uploaded file matches the expected template format
 * by checking for required columns
 * @param headers Array of headers from the CSV/Excel file
 * @returns Object with validation result and message
 */
export function validateTemplateStructure(headers: string[]): { 
  isValid: boolean; 
  missingColumns: string[]; 
  message: string 
} {
  // Essential columns that should be present in any import
  const requiredColumns = [
    'nombre_cliente',
    'fecha_servicio',
    'tipo_servicio'
  ];
  
  // Convert headers to lowercase for case-insensitive comparison
  const normalizedHeaders = headers.map(h => h.toLowerCase().trim());
  
  // Check for required columns
  const missingColumns = requiredColumns.filter(
    col => !normalizedHeaders.some(h => 
      h === col || 
      h === col.replace(/_/g, ' ') || 
      h === col.replace(/_/g, '')
    )
  );
  
  if (missingColumns.length > 0) {
    return {
      isValid: false,
      missingColumns,
      message: `Faltan columnas requeridas en el archivo: ${missingColumns.join(', ')}`
    };
  }
  
  return {
    isValid: true,
    missingColumns: [],
    message: "Estructura del archivo válida"
  };
}

/**
 * Process a value according to its column type
 * @param columnName Name of the column
 * @param value Raw value from the CSV/Excel
 * @returns Processed value with correct type
 */
export function processTemplateValue(columnName: string, value: any): any {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  
  // Convert string value to proper type based on column
  if (knownNumericColumns.includes(columnName)) {
    // Handle numeric values - remove currency symbols and separators
    const numericValue = String(value)
      .replace(/[$€¥£]/g, '') // Remove currency symbols
      .replace(/,/g, '')      // Remove thousand separators
      .trim();
      
    const parsedValue = parseFloat(numericValue);
    if (isNaN(parsedValue)) {
      console.warn(`Invalid numeric value in column ${columnName}: ${value}`);
      return null;
    }
    return parsedValue;
  }
  
  if (knownBooleanColumns.includes(columnName)) {
    // Handle boolean values - convert text to boolean
    const boolStr = String(value).toLowerCase().trim();
    
    if (['si', 'sí', 'yes', 'true', '1', 'verdadero'].includes(boolStr)) {
      return true;
    }
    
    if (['no', 'false', '0', 'falso'].includes(boolStr)) {
      return false;
    }
    
    console.warn(`Invalid boolean value in column ${columnName}: ${value}`);
    return null;
  }
  
  // Handle date strings if column name contains fecha
  if (columnName.includes('fecha') && typeof value === 'string') {
    try {
      // Try to parse as a date
      const dateValue = new Date(value);
      if (!isNaN(dateValue.getTime())) {
        return dateValue.toISOString();
      }
    } catch (error) {
      console.warn(`Invalid date in column ${columnName}: ${value}`);
    }
  }
  
  // Return as string for other types
  return String(value);
}

/**
 * Check if the template has any data rows (besides header and description rows)
 * @param rows Array of data rows
 * @returns True if there are data rows, false otherwise
 */
export function hasTemplateData(rows: any[]): boolean {
  // Skip header and description rows
  return rows.length > 2;
}

/**
 * Show helpful notifications based on import statistics
 * @param totalRows Total rows processed
 * @param validRows Valid rows processed successfully
 */
export function showTemplateImportStats(totalRows: number, validRows: number): void {
  const invalidRows = totalRows - validRows;
  
  if (invalidRows > 0) {
    const percentInvalid = Math.round((invalidRows / totalRows) * 100);
    
    if (percentInvalid > 50) {
      toast.warning(`${invalidRows} filas con datos incorrectos`, {
        description: "Revise el formato de la plantilla y los requisitos de datos."
      });
    } else if (invalidRows > 0) {
      toast.info(`${invalidRows} filas omitidas`, {
        description: `Se procesaron ${validRows} de ${totalRows} filas correctamente.`
      });
    }
  } else if (validRows > 0) {
    toast.success(`${validRows} filas importadas correctamente`, {
      description: "Todos los datos fueron procesados sin errores."
    });
  }
}
