
export function validateFile(file: File): { isValid: boolean; message?: string } {
  // Validar tamaño de archivo (reducido a 10MB para evitar problemas de recursos)
  if (file.size > 10 * 1024 * 1024) {
    return {
      isValid: false,
      message: "El archivo excede el tamaño máximo permitido de 10 MB. Por favor divida el archivo en partes más pequeñas."
    };
  }
  
  // Validar tipo de archivo (debe ser Excel o CSV)
  const validExcelTypes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel.sheet.macroEnabled.12'
  ];
  
  // También verificar por extensión por si el tipo MIME no es confiable
  const fileName = file.name.toLowerCase();
  const hasValidExtension = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
  const isCSV = fileName.endsWith('.csv') || file.type === 'text/csv' || file.type === 'application/csv';
  
  if (!isCSV && !validExcelTypes.includes(file.type) && !hasValidExtension) {
    return {
      isValid: false,
      message: "El formato de archivo no es válido. Solo se permiten archivos Excel (.xls, .xlsx) o CSV (.csv)"
    };
  }
  
  // Verificar que el nombre del archivo no contenga caracteres problemáticos
  const illegalChars = /[<>:"/\\|?*\x00-\x1F]/g;
  if (illegalChars.test(file.name)) {
    return {
      isValid: false,
      message: "El nombre del archivo contiene caracteres no permitidos"
    };
  }
  
  return { isValid: true };
}
