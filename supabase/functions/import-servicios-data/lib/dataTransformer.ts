
// Función para transformar los datos de una fila del Excel a un objeto compatible con la base de datos
export function transformRowData(row: any, headerMapping: Record<string, string>): Record<string, any> {
  // Crear un objeto para almacenar los datos transformados
  const transformedData: Record<string, any> = {};
  
  // Variable para contar cuántos campos útiles se han encontrado
  let fieldCount = 0;
  
  // Mapa de correcciones para nombres de columnas que no coinciden con la BD
  const columnCorrections: Record<string, string> = {
    'cobro_al_cliente': 'cobro_cliente',
  };
  
  // Para debugging
  console.log(`Transformando fila con datos iniciales:`, JSON.stringify(row).substring(0, 300));
  
  // Recorrer cada entrada en el objeto row (cada columna del Excel)
  for (const [excelColumn, value] of Object.entries(row)) {
    // Buscar el nombre de columna correspondiente en la base de datos
    let dbColumn = headerMapping[excelColumn];
    
    // Si existe un mapeo válido
    if (dbColumn) {
      // Verificar si el nombre de columna necesita corrección
      if (dbColumn in columnCorrections) {
        const originalColumn = dbColumn;
        dbColumn = columnCorrections[dbColumn];
        console.log(`Corrigiendo nombre de columna: ${originalColumn} -> ${dbColumn}`);
      }
      
      // Ignorar explícitamente columnas problemáticas conocidas
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
    // Fecha y manifiestos
    'Fecha': 'fecha_servicio',
    'Fecha de Servicio': 'fecha_servicio', 
    'Número de Manifiesto': 'numero_manifiesto',
    'Manifiesto': 'numero_manifiesto',
    'No. de Manifiesto': 'numero_manifiesto',
    'Nro. Manifiesto': 'numero_manifiesto',
    
    // Cliente y custodio
    'Cliente': 'nombre_cliente',
    'Nombre del Cliente': 'nombre_cliente',
    'Custodio': 'nombre_custodio',
    'Nombre del Custodio': 'nombre_custodio',
    
    // Unidad y kilometraje
    'Unidad': 'unidad',
    'Vehículo': 'unidad',
    'ID Unidad': 'unidad',
    'No. Unidad': 'unidad',
    'Kilometraje': 'km_recorridos',
    'KM': 'km_recorridos',
    'KM Recorrido': 'km_recorridos',
    'Km': 'km_recorridos',
    
    // Origen y destino
    'Origen': 'origen',
    'Ciudad Origen': 'origen',
    'Destino': 'destino',
    'Ciudad Destino': 'destino',
    
    // Tipo de servicio
    'Servicio': 'tipo_servicio',
    'Servicios': 'tipo_servicio',
    'Tipo de Servicio': 'tipo_servicio',
    'Tipo Servicio': 'tipo_servicio',
    
    // Importe y estatus
    'Importe': 'cobro_cliente',
    'Monto': 'cobro_cliente',
    'Costo': 'cobro_cliente',
    'Precio': 'cobro_cliente',
    'Cobro al cliente': 'cobro_cliente', // Corregido para coincidir con la columna en la BD
    'Estatus': 'estado',
    'Estado': 'estado',
    
    // Campos adicionales que pueden estar presentes
    'Fecha Inicio': 'fecha_hora_asignacion',
    'Hora Inicio': 'hora_inicio_custodia',
    'Hora Fin': 'hora_finalizacion',
    'Observaciones': 'comentarios_adicionales',
    'Comentarios': 'comentarios_adicionales',
    'Notas': 'comentarios_adicionales'
  };
  
  // Lista de columnas inválidas o problemáticas que deben ser ignoradas
  const invalidColumns = ['cantidad_de_transportes', 'null', 'undefined', ''];
  
  // Mostrar encabezados para debugging
  console.log("Encabezados detectados:", JSON.stringify(excelColumns));
  
  // Iterar sobre los encabezados encontrados y mapearlos
  excelColumns.forEach(column => {
    // Ignorar columnas vacías o sin valor
    if (column === null || column === undefined || column === '') {
      console.log(`Ignorando columna por no tener nombre de encabezado`);
      return;
    }
    
    // Normalizar el nombre de la columna 
    const normalizedColumn = column.trim();
    console.log(`Procesando encabezado: "${normalizedColumn}"`);
    
    // Ignorar columnas problemáticas explícitamente
    if (invalidColumns.includes(normalizedColumn.toLowerCase())) {
      console.log(`Ignorando columna problemática: ${normalizedColumn}`);
      return;
    }
    
    // Casos especiales de mapeo que requieren corrección
    if (normalizedColumn === 'Cobro al cliente' || normalizedColumn === 'Cobro al Cliente') {
      columnMapping[column] = 'cobro_cliente'; // Usar el nombre correcto de la columna
      console.log(`Mapeo especial: ${normalizedColumn} -> cobro_cliente`);
      return;
    }
    
    // Buscar en mapeos comunes
    if (commonMappings[normalizedColumn]) {
      columnMapping[column] = commonMappings[normalizedColumn];
      console.log(`Mapeo encontrado: ${normalizedColumn} -> ${commonMappings[normalizedColumn]}`);
    } else {
      // Si no encuentra mapeo, usar una versión normalizada del nombre de la columna
      // Convertir "Nombre de Columna" a "nombre_de_columna"
      let dbColumnName = normalizedColumn
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');
      
      // Verificar si el nombre de columna generado es válido
      if (dbColumnName && !invalidColumns.includes(dbColumnName)) {
        columnMapping[column] = dbColumnName;
        console.log(`Mapeo generado: ${normalizedColumn} -> ${dbColumnName}`);
      } else {
        console.log(`Ignorando columna con nombre inválido: ${normalizedColumn}`);
      }
    }
  });
  
  // Verificación final de mapeos
  console.log(`Mapeo final de columnas: ${JSON.stringify(columnMapping)}`);
  
  // Verificar si tenemos al menos las columnas mínimas necesarias
  const requiredColumns = ['nombre_cliente', 'fecha_servicio', 'tipo_servicio'];
  const foundRequiredColumns = requiredColumns.filter(col => Object.values(columnMapping).includes(col));
  
  if (foundRequiredColumns.length === 0) {
    console.warn('ADVERTENCIA: No se encontraron columnas esenciales en el mapeo. Esto puede causar datos NULL.');
    console.warn('Columnas requeridas:', requiredColumns);
    console.warn('Columnas encontradas:', Object.values(columnMapping));
  } else {
    console.log(`Se encontraron ${foundRequiredColumns.length}/${requiredColumns.length} columnas requeridas`);
  }
  
  return columnMapping;
}
