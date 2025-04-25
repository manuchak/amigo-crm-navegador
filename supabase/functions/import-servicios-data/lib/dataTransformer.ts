
// Función para transformar los datos de una fila del Excel a un objeto compatible con la base de datos
export function transformRowData(row: any, headerMapping: Record<string, string>): Record<string, any> {
  // Crear un objeto para almacenar los datos transformados
  const transformedData: Record<string, any> = {};
  
  // Variable para contar cuántos campos útiles se han encontrado
  let fieldCount = 0;
  
  // Para debugging
  console.log(`Transformando fila con datos iniciales:`, JSON.stringify(row).substring(0, 300));
  
  // Recorrer cada entrada en el objeto row (cada columna del Excel)
  for (const [excelColumn, value] of Object.entries(row)) {
    // Buscar el nombre de columna correspondiente en la base de datos
    const dbColumn = headerMapping[excelColumn];
    
    // Si existe un mapeo válido
    if (dbColumn) {
      // Ignorar explícitamente la columna problemática
      if (dbColumn === 'cantidad_de_transportes') {
        console.log(`Ignorando columna problemática: ${excelColumn} -> ${dbColumn}`);
        continue;
      }
      
      // Verificar que el valor no sea undefined, null o cadena vacía
      if (value !== undefined && value !== null && value !== '') {
        fieldCount++; // Incrementar contador de campos no vacíos
        
        console.log(`Procesando campo [${excelColumn} -> ${dbColumn}] con valor:`, value, typeof value);
        
        // Determinar el tipo de dato y transformar apropiadamente
        if (typeof value === 'string') {
          transformedData[dbColumn] = value.trim();
        } else if (typeof value === 'number') {
          // Manejar casos especiales para tipos numéricos
          if (dbColumn === 'km_recorridos' || dbColumn.includes('costo') || dbColumn.includes('cobro')) {
            transformedData[dbColumn] = parseFloat(value.toString());
          } else {
            transformedData[dbColumn] = value;
          }
        } else if (value instanceof Date) {
          // Para valores de fecha, convertir a ISO string
          transformedData[dbColumn] = value.toISOString();
        } else if (typeof value === 'boolean') {
          transformedData[dbColumn] = value;
        } else {
          // Para cualquier otro tipo, intentar convertir a string sin perder datos
          try {
            // Si parece ser una fecha en formato de número de Excel
            if (typeof value === 'object' && value !== null && 'getMonth' in value) {
              transformedData[dbColumn] = new Date(value).toISOString();
            } else {
              const stringValue = String(value).trim();
              if (stringValue && stringValue !== 'null' && stringValue !== 'undefined') {
                transformedData[dbColumn] = stringValue;
              }
            }
          } catch (e) {
            console.warn(`No se pudo convertir valor para ${dbColumn}: ${e.message}`);
          }
        }
      } else {
        // Para valores null/undefined, no asignar nada para que el valor predeterminado 
        // de la base de datos se aplique (si existe)
        console.log(`Valor vacío para columna ${dbColumn}, se omitirá`);
      }
    } else {
      console.log(`No se encontró mapeo para columna Excel '${excelColumn}'`);
    }
  }
  
  // Solo añadir campos de control si tenemos datos útiles
  if (fieldCount > 0) {
    // Añadir campos de control y auditoría
    transformedData.created_at = new Date().toISOString();
    transformedData.updated_at = new Date().toISOString();
    
    // Logging para depurar - Mostrar los datos transformados
    console.log(`Transformada fila con ${fieldCount} campos útiles:`, JSON.stringify(transformedData).substring(0, 500));
    
    return transformedData;
  } else {
    console.warn("¡Fila sin datos útiles detectada! No se insertará.");
    return {}; // Devolver objeto vacío para que se filtre después
  }
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
  
  // Debug para ver las columnas de Excel entrantes
  console.log("Columnas Excel recibidas para mapeo:", excelColumns);
  
  excelColumns.forEach(column => {
    // Normalizar el nombre de la columna (quitar espacios extras, convertir a minúsculas)
    const normalizedColumn = column.trim();
    
    // Buscar en mapeos comunes
    if (commonMappings[normalizedColumn]) {
      columnMapping[column] = commonMappings[normalizedColumn];
      console.log(`Mapeado: ${column} -> ${commonMappings[normalizedColumn]}`);
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
        console.log(`Mapeado (generado): ${column} -> ${dbColumnName}`);
      } else {
        console.log(`Ignorando columna: ${column} (generaría '${dbColumnName}')`);
      }
    }
  });
  
  return columnMapping;
}
