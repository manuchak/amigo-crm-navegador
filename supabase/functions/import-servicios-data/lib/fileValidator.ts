
export function validateFile(file: File): { isValid: boolean; message: string } {
  // Check file extension
  const allowedExtensions = ['.csv', '.xlsx', '.xls'];
  let validExtension = false;
  for (const ext of allowedExtensions) {
    if (file.name.toLowerCase().endsWith(ext)) {
      validExtension = true;
      break;
    }
  }

  if (!validExtension) {
    return {
      isValid: false,
      message: `Formato de archivo no válido. Solo se permiten archivos ${allowedExtensions.join(', ')}`
    };
  }

  // Check file size (max 15MB)
  const MAX_SIZE = 15 * 1024 * 1024; // 15MB in bytes
  if (file.size > MAX_SIZE) {
    return {
      isValid: false,
      message: `El archivo es demasiado grande. El tamaño máximo permitido es ${MAX_SIZE / (1024 * 1024)}MB`
    };
  }

  return { isValid: true, message: 'Archivo válido' };
}
