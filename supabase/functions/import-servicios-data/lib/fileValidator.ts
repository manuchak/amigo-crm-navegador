
export function validateFile(file: File): { isValid: boolean; message?: string } {
  // Validar tamaño de archivo
  if (file.size > 25 * 1024 * 1024) {
    return {
      isValid: false,
      message: "El archivo excede el tamaño máximo permitido de 25 MB"
    };
  }
  
  // Validar tipo de archivo (debe ser Excel)
  const validExcelTypes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel.sheet.macroEnabled.12'
  ];
  
  if (!validExcelTypes.includes(file.type)) {
    return {
      isValid: false,
      message: "El formato de archivo no es válido. Solo se permiten archivos Excel (.xls, .xlsx)"
    };
  }
  
  return { isValid: true };
}
