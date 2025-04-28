
/**
 * Utility functions for file validation before import
 */

export const MAX_FILE_SIZE_MB = 5;
export const MAX_ALLOWED_FILE_SIZE_MB = 15;

export interface FileValidationResult {
  isValid: boolean;
  message?: string;
  isCSV?: boolean;
  isExcel?: boolean;
}

/**
 * Validates file size and type for import
 */
export function validateImportFile(file: File): FileValidationResult {
  // Check file size
  if (file.size > MAX_ALLOWED_FILE_SIZE_MB * 1024 * 1024) {
    return { 
      isValid: false, 
      message: `El archivo excede el tamaño máximo permitido de ${MAX_ALLOWED_FILE_SIZE_MB} MB` 
    };
  }
  
  const fileName = file.name.toLowerCase();
  
  // Check for CSV format
  const isCSV = fileName.endsWith('.csv') || file.type === 'text/csv' || file.type === 'application/csv';
  
  // Check for Excel format
  const validExcelTypes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel.sheet.macroEnabled.12'
  ];
  const hasValidExcelExtension = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
  const isExcel = validExcelTypes.includes(file.type) || hasValidExcelExtension;
  
  // Check if file type is valid
  if (!isCSV && !isExcel) {
    return {
      isValid: false,
      message: "El formato de archivo no es válido. Solo se permiten archivos Excel (.xls, .xlsx) o CSV (.csv)"
    };
  }
  
  return {
    isValid: true,
    isCSV,
    isExcel
  };
}

/**
 * Checks if file is large enough to warrant a warning
 */
export function isLargeFile(file: File): boolean {
  return file.size > MAX_FILE_SIZE_MB * 1024 * 1024;
}
