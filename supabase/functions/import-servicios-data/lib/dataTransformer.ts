
// Función para transformar los datos de una fila del Excel a un objeto compatible con la base de datos
export function transformRowData(row: any, headerMapping: Record<string, string>): Record<string, any> {
  // Crear un objeto para almacenar los datos transformados
  const transformedData: Record<string, any> = {};
  
  // Recorrer cada entrada en el objeto row (cada columna del Excel)
  for (const [excelColumn, value] of Object.entries(row)) {
    // Buscar el nombre de columna correspondiente en la base de datos
    const dbColumn = headerMapping[excelColumn];
    
    // Si existe un mapeo y no es la columna problemática
    if (dbColumn && dbColumn !== 'cantidad_de_transportes') {
      // Convertir los valores según el tipo de dato esperado
      if (value !== undefined && value !== null) {
        // Determinar el tipo de dato y transformar apropiadamente
        if (typeof value === 'string') {
          transformedData[dbColumn] = value.trim();
        } else if (value instanceof Date) {
          transformedData[dbColumn] = value.toISOString();
        } else {
          transformedData[dbColumn] = value;
        }
      }
    }
  }
  
  // Añadir campos de control y auditoría
  transformedData.created_at = new Date().toISOString();
  transformedData.updated_at = new Date().toISOString();
  
  // Logging para depurar
  console.log(`Transformed row: ${JSON.stringify(transformedData)}`);
  
  return transformedData;
}

// Función para transformar los nombres de las columnas del Excel a nombres de columnas en la BD
export function mapColumnNames(excelColumns: string[]): Record<string, string> {
  const columnMapping: Record<string, string> = {};
  
  const commonMappings: Record<string, string> = {
    'Fecha': 'fecha_servicio',
    'Fecha de Servicio': 'fecha_servicio', 
    'Número de Manifiesto': 'numero_manifiesto',
    'Manifiesto': 'numero_manifiesto',
    'No. de Manifiesto': 'numero_manifiesto',
    'Cliente': 'nombre_cliente',
    'Nombre del Cliente': 'nombre_cliente',
    'Custodio': 'nombre_custodio',
    'Nombre del Custodio': 'nombre_custodio',
    'Unidad': 'unidad',
    'Vehículo': 'unidad',
    'ID Unidad': 'unidad',
    'Kilometraje': 'km_recorridos',
    'KM': 'km_recorridos',
    'KM Recorrido': 'km_recorridos',
    'Origen': 'origen',
    'Ciudad Origen': 'origen',
    'Destino': 'destino',
    'Ciudad Destino': 'destino',
    'Servicio': 'tipo_servicio',
    'Servicios': 'tipo_servicio',
    'Tipo de Servicio': 'tipo_servicio',
    'Importe': 'cobro_cliente',
    'Monto': 'cobro_cliente',
    'Costo': 'cobro_cliente',
    'Estatus': 'estado'
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
        
      // Verificar que la columna generada no sea la problemática
      if (dbColumnName && dbColumnName !== 'cantidad_de_transportes') {
        columnMapping[column] = dbColumnName;
      }
    }
  });
  
  return columnMapping;
}
