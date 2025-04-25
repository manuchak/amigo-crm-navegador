
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
  console.log("Encabezados detectados:", JSON.stringify(headerRow));
  
  // Iterar sobre los encabezados encontrados y mapearlos
  Object.entries(headerRow).forEach(([excelCol, headerValue]) => {
    // Ignorar columnas vacías o sin valor
    if (headerValue === null || headerValue === undefined || headerValue === '') {
      console.log(`Ignorando columna ${excelCol} por no tener nombre de encabezado`);
      return;
    }
    
    // Si el valor del encabezado es una cadena de texto
    if (typeof headerValue === 'string') {
      const headerText = headerValue.trim();
      console.log(`Procesando encabezado: "${headerText}"`);
      
      // Ignorar columnas problemáticas explícitamente
      if (invalidColumns.includes(headerText.toLowerCase())) {
        console.log(`Ignorando columna problemática: ${headerText}`);
        return;
      }
      
      // Buscar en mapeos comunes
      if (commonMappings[headerText]) {
        mapping[excelCol] = commonMappings[headerText];
        console.log(`Mapeo encontrado: ${headerText} -> ${commonMappings[headerText]}`);
      } else {
        // Si no encuentra mapeo, usar una versión normalizada del nombre de la columna
        // Convertir "Nombre de Columna" a "nombre_de_columna"
        let dbColumnName = headerText
          .toLowerCase()
          .replace(/\s+/g, '_')
          .replace(/[^a-z0-9_]/g, '');
        
        // Verificar si el nombre de columna generado es válido
        if (dbColumnName && !invalidColumns.includes(dbColumnName)) {
          mapping[excelCol] = dbColumnName;
          console.log(`Mapeo generado: ${headerText} -> ${dbColumnName}`);
        } else {
          console.log(`Ignorando columna con nombre inválido: ${headerText}`);
        }
      }
    } else if (headerValue !== null && headerValue !== undefined) {
      // Si el valor no es una cadena pero es algo, convertirlo a cadena
      const headerText = String(headerValue).trim();
      
      // Ignorar columnas problemáticas explícitamente
      if (invalidColumns.includes(headerText.toLowerCase())) {
        console.log(`Ignorando columna problemática (no string): ${headerText}`);
        return;
      }
      
      if (commonMappings[headerText]) {
        mapping[excelCol] = commonMappings[headerText];
        console.log(`Mapeo encontrado (no string): ${headerText} -> ${commonMappings[headerText]}`);
      } else {
        // Convertir a nombre de columna normalizado
        let dbColumnName = headerText
          .toLowerCase()
          .replace(/\s+/g, '_')
          .replace(/[^a-z0-9_]/g, '');
          
        if (dbColumnName && !invalidColumns.includes(dbColumnName)) {
          mapping[excelCol] = dbColumnName;
          console.log(`Mapeo generado (no string): ${headerText} -> ${dbColumnName}`);
        } else {
          console.log(`Ignorando columna con nombre inválido (no string): ${headerText}`);
        }
      }
    }
  });
  
  // Verificación final de mapeos
  console.log(`Mapeo final de columnas: ${JSON.stringify(mapping)}`);
  
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
