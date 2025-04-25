
export function validateFile(file: File): { isValid: boolean; message?: string } {
  // Validar tamaño de archivo (aumentado a 30MB para archivos grandes)
  if (file.size > 30 * 1024 * 1024) {
    return {
      isValid: false,
      message: "El archivo excede el tamaño máximo permitido de 30 MB"
    };
  }
  
  // Validar tipo de archivo (debe ser Excel)
  const validExcelTypes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel.sheet.macroEnabled.12'
  ];
  
  // También verificar por extensión por si el tipo MIME no es confiable
  const fileName = file.name.toLowerCase();
  const hasValidExtension = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
  
  if (!validExcelTypes.includes(file.type) && !hasValidExtension) {
    return {
      isValid: false,
      message: "El formato de archivo no es válido. Solo se permiten archivos Excel (.xls, .xlsx)"
    };
  }
  
  return { isValid: true };
}
