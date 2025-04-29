
export function validateFile(file: File): { isValid: boolean; message: string } {
  // Check file size (limit to 15MB for Edge Functions)
  const MAX_SIZE_MB = 15;
  const maxSizeBytes = MAX_SIZE_MB * 1024 * 1024;
  
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      message: `El archivo es demasiado grande. El tamaño máximo permitido es de ${MAX_SIZE_MB}MB.`
    };
  }
  
  // Check file type
  const validExcelTypes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel.sheet.macroEnabled.12'
  ];
  
  const validCsvTypes = [
    'text/csv',
    'application/csv',
    'text/comma-separated-values'
  ];
  
  const fileName = file.name.toLowerCase();
  const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || validExcelTypes.includes(file.type);
  const isCsv = fileName.endsWith('.csv') || validCsvTypes.includes(file.type);
  
  if (!isExcel && !isCsv) {
    return {
      isValid: false,
      message: 'Formato de archivo no válido. Por favor, suba un archivo Excel (.xlsx, .xls) o CSV (.csv).'
    };
  }
  
  return { isValid: true, message: 'Archivo válido' };
}
