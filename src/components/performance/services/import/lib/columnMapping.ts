// Función para determinar el mapeo de columnas según los encabezados detectados
export function determineHeaderMapping(headerRow: Record<string, any>): Record<string, string> {
  const mapping: Record<string, string> = {};
  
  // Mapear columnas comunes en Excel a nombres de columnas en base de datos
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
    'Cobro al cliente': 'cobro_cliente', // Corregido para coincidir con la BD
    'Cobro al Cliente': 'cobro_cliente', // Variante con mayúscula
    'Cobro Cliente': 'cobro_cliente',    // Variante sin "al"
    'Cobro': 'cobro_cliente',            // Variante corta
    
    // Estado y armado
    'Estatus': 'estado',
    'Estado': 'estado',
    'Armado': 'armado', // Campo booleano
    'Es Armado': 'armado',
    'Es armado': 'armado',
    
    // Campos adicionales que pueden estar presentes
    'Fecha Inicio': 'fecha_hora_asignacion',
    'Hora Inicio': 'hora_inicio_custodia',
    'Hora Fin': 'hora_finalizacion',
    'Observaciones': 'comentarios_adicionales',
    'Comentarios': 'comentarios_adicionales',
    'Notas': 'comentarios_adicionales',
    
    // Campos numéricos específicos
    'Casetas': 'casetas',
    'Cobro casetas': 'casetas',
    'Costo casetas': 'casetas',
    'Costo Custodio': 'costo_custodio',
    'Costo del Custodio': 'costo_custodio'
  };
  
  // Lista de columnas conocidas como numéricas
  const numericColumns = [
    'km_recorridos', 'km_teorico', 'km_extras',
    'cobro_cliente', 'costo_custodio', 'casetas'
  ];
  
  // Lista de columnas conocidas como booleanas
  const booleanColumns = ['armado', 'es_armado'];
  
  // Lista de columnas inválidas o problemáticas que deben ser ignoradas
  const invalidColumns = ['cantidad_de_transportes', 'null', 'undefined', ''];
  
  // Correcciones para nombres de columnas conocidos como problemáticos
  const columnCorrections: Record<string, string> = {
    'cobro_al_cliente': 'cobro_cliente',
  };
  
  // Debug para ver las columnas de Excel entrantes
  console.log("Encabezados detectados:", JSON.stringify(headerRow));
  
  Object.entries(headerRow).forEach(([excelColumn, headerValue]) => {
    // Ignorar columnas vacías o sin valor
    if (headerValue === null || headerValue === undefined || headerValue === '') {
      console.log(`Ignorando columna ${excelColumn} por no tener nombre de encabezado`);
      return;
    }
    
    // Si el valor del encabezado es una cadena de texto
    if (typeof headerValue === 'string') {
      const headerText = headerValue.trim();
      console.log(`Procesando encabezado: "${headerText}"`);
      
      // Casos especiales de mapeo que requieren corrección
      if (headerText === 'Cobro al cliente' || headerText === 'Cobro al Cliente') {
        mapping[excelColumn] = 'cobro_cliente'; // Usar el nombre correcto de la columna
        console.log(`Mapeo especial: ${headerText} -> cobro_cliente`);
        return;
      }
      
      if (headerText === 'Armado' || headerText === 'Es armado' || headerText === 'Es Armado') {
        mapping[excelColumn] = 'armado'; // Mapeado como campo booleano
        console.log(`Mapeo booleano: ${headerText} -> armado`);
        return;
      }
      
      if (headerText === 'Casetas' || headerText === 'Cobro casetas' || headerText === 'Costo casetas') {
        mapping[excelColumn] = 'casetas';
        console.log(`Mapeo numérico: ${headerText} -> casetas`);
        return;
      }
      
      // Ignorar columnas problemáticas explícitamente
      if (invalidColumns.includes(headerText.toLowerCase())) {
        console.log(`Ignorando columna problemática: ${headerText}`);
        return;
      }
      
      // Buscar en mapeos comunes
      if (commonMappings[headerText]) {
        mapping[excelColumn] = commonMappings[headerText];
        console.log(`Mapeo encontrado: ${headerText} -> ${commonMappings[headerText]}`);
      } else {
        // Si no encuentra mapeo, usar una versión normalizada del nombre de la columna
        // Convertir "Nombre de Columna" a "nombre_de_columna"
        let dbColumnName = headerText
          .toLowerCase()
          .replace(/\s+/g, '_')
          .replace(/[^a-z0-9_]/g, '');
        
        // Verificar si el nombre de columna necesita corrección
        if (dbColumnName in columnCorrections) {
          const originalColumn = dbColumnName;
          dbColumnName = columnCorrections[dbColumnName];
          console.log(`Corrigiendo nombre de columna: ${originalColumn} -> ${dbColumnName}`);
        }
        
        // Verificar que el nombre de columna generado es válido y no está en la lista de inválidos
        if (dbColumnName && !invalidColumns.includes(dbColumnName)) {
          mapping[excelColumn] = dbColumnName;
          console.log(`Mapeo generado: ${headerText} -> ${dbColumnName}`);
        } else {
          console.log(`Ignorando columna con nombre inválido: ${headerText}`);
        }
      }
    } else if (headerValue !== null && headerValue !== undefined) {
      // Si el valor no es una cadena pero es algo, convertirlo a cadena
      const headerText = String(headerValue).trim();
      
      // Casos especiales de mapeo que requieren corrección
      if (headerText === 'Cobro al cliente' || headerText === 'Cobro al Cliente') {
        mapping[excelColumn] = 'cobro_cliente';
        console.log(`Mapeo especial (no string): ${headerText} -> cobro_cliente`);
        return;
      }
      
      if (headerText === 'Armado' || headerText === 'Es armado' || headerText === 'Es Armado') {
        mapping[excelColumn] = 'armado'; // Mapeado como campo booleano
        console.log(`Mapeo booleano (no string): ${headerText} -> armado`);
        return;
      }
      
      if (headerText === 'Casetas' || headerText === 'Cobro casetas' || headerText === 'Costo casetas') {
        mapping[excelColumn] = 'casetas';
        console.log(`Mapeo numérico (no string): ${headerText} -> casetas`);
        return;
      }
      
      // Ignorar columnas problemáticas explícitamente
      if (invalidColumns.includes(headerText.toLowerCase())) {
        console.log(`Ignorando columna problemática (no string): ${headerText}`);
        return;
      }
      
      if (commonMappings[headerText]) {
        mapping[excelColumn] = commonMappings[headerText];
        console.log(`Mapeo encontrado (no string): ${headerText} -> ${commonMappings[headerText]}`);
      } else {
        // Convertir a nombre de columna normalizado
        let dbColumnName = headerText
          .toLowerCase()
          .replace(/\s+/g, '_')
          .replace(/[^a-z0-9_]/g, '');
        
        // Verificar si el nombre de columna necesita corrección
        if (dbColumnName in columnCorrections) {
          const originalColumn = dbColumnName;
          dbColumnName = columnCorrections[dbColumnName];
          console.log(`Corrigiendo nombre de columna (no string): ${originalColumn} -> ${dbColumnName}`);
        }
          
        if (dbColumnName && !invalidColumns.includes(dbColumnName)) {
          mapping[excelColumn] = dbColumnName;
          console.log(`Mapeo generado (no string): ${headerText} -> ${dbColumnName}`);
        } else {
          console.log(`Ignorando columna con nombre inválido (no string): ${headerText}`);
        }
      }
    }
  });
  
  // Verificación final de mapeos
  console.log(`Mapeo final de columnas: ${JSON.stringify(mapping)}`);
  
  // Añadir información sobre tipos de datos para columnas críticas
  const columnTypes: Record<string, string> = {};
  for (const [excelCol, dbCol] of Object.entries(mapping)) {
    if (numericColumns.includes(dbCol)) {
      columnTypes[dbCol] = 'numeric';
    } else if (booleanColumns.includes(dbCol)) {
      columnTypes[dbCol] = 'boolean';
    }
  }
  console.log(`Tipos de columnas detectados: ${JSON.stringify(columnTypes)}`);
  
  // Verificar si tenemos al menos las columnas mínimas necesarias
  const requiredColumns = ['nombre_cliente', 'fecha_servicio', 'tipo_servicio'];
  const foundRequiredColumns = requiredColumns.filter(col => Object.values(mapping).includes(col));
  
  if (foundRequiredColumns.length === 0) {
    console.warn('ADVERTENCIA: No se encontraron columnas esenciales en el mapeo. Esto puede causar datos NULL.');
    console.warn('Columnas requeridas:', requiredColumns);
    console.warn('Columnas encontradas:', Object.values(mapping));
  } else {
    console.log(`Se encontraron ${foundRequiredColumns.length}/${requiredColumns.length} columnas requeridas`);
  }
  
  return mapping;
}

// Export these arrays for use in template validation
export const knownNumericColumns = [
  'km_recorridos', 'km_teorico', 'km_extras',
  'cobro_cliente', 'costo_custodio', 'casetas'
];

export const knownBooleanColumns = [
  'armado', 'es_armado', 'esmilitar', 'tienevehiculo', 'esarmado'
];
