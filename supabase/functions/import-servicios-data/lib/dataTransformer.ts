
// Función para transformar los datos de una fila del Excel a un objeto compatible con la base de datos
export function transformRowData(row: any, headerMapping: Record<string, string>): Record<string, any> {
  // Crear un objeto para almacenar los datos transformados
  const transformedData: Record<string, any> = {};
  
  // Recorrer cada campo en el mapeo de encabezados
  for (const [excelColumn, dbColumn] of Object.entries(headerMapping)) {
    // Si el mapeo existe, transformar el dato
    if (excelColumn && dbColumn && dbColumn !== 'cantidad_de_transportes') {
      // Obtener el valor de la columna del Excel
      const value = row[excelColumn];
      
      // Transformar según el tipo de dato esperado (simplificado)
      if (value !== undefined && value !== null) {
        transformedData[dbColumn] = value;
      }
    }
  }
  
  // Añadir campos de control y auditoría
  transformedData.created_at = new Date().toISOString();
  transformedData.updated_at = new Date().toISOString();
  
  return transformedData;
}

// Función para transformar los nombres de las columnas del Excel a nombres de columnas en la BD
export function mapColumnNames(excelColumns: string[]): Record<string, string> {
  const columnMapping: Record<string, string> = {};
  
  const commonMappings: Record<string, string> = {
    'Fecha': 'fecha_servicio',
    'Número de Manifiesto': 'numero_manifiesto',
    'Cliente': 'cliente_nombre',
    'Custodio': 'custodio_nombre',
    'Unidad': 'unidad',
    'KM': 'kilometraje',
    'Destino': 'destino',
    'Origen': 'origen',
    'Servicios': 'tipo_servicio',
    // No incluimos 'cantidad_de_transportes' ya que no existe en el esquema
    'Importe': 'importe',
    'Estatus': 'estatus'
  };
  
  excelColumns.forEach(column => {
    // Normalizar el nombre de la columna (quitar espacios extras, convertir a minúsculas)
    const normalizedColumn = column.trim();
    
    // Buscar en mapeos comunes
    if (commonMappings[normalizedColumn]) {
      columnMapping[column] = commonMappings[normalizedColumn];
    } 
    // Si no está en los mapeos comunes, intentar generar un nombre de columna basado en convenciones
    else {
      // Convertir "Nombre de Columna" a "nombre_de_columna"
      const dbColumnName = normalizedColumn
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');
        
      if (dbColumnName && dbColumnName !== 'cantidad_de_transportes') {
        columnMapping[column] = dbColumnName;
      }
    }
  });
  
  return columnMapping;
}
