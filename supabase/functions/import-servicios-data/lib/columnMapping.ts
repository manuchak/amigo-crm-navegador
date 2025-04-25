
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
    
    // Cliente y custodio
    'Cliente': 'nombre_cliente',
    'Nombre del Cliente': 'nombre_cliente',
    'Custodio': 'nombre_custodio',
    'Nombre del Custodio': 'nombre_custodio',
    
    // Unidad y kilometraje
    'Unidad': 'unidad',
    'Vehículo': 'unidad',
    'ID Unidad': 'unidad',
    'Kilometraje': 'km_recorridos',
    'KM': 'km_recorridos',
    'KM Recorrido': 'km_recorridos',
    
    // Origen y destino
    'Origen': 'origen',
    'Ciudad Origen': 'origen',
    'Destino': 'destino',
    'Ciudad Destino': 'destino',
    
    // Tipo de servicio
    'Servicio': 'tipo_servicio',
    'Servicios': 'tipo_servicio',
    'Tipo de Servicio': 'tipo_servicio',
    
    // Importe y estatus
    'Importe': 'cobro_cliente',
    'Monto': 'cobro_cliente',
    'Costo': 'cobro_cliente',
    'Estatus': 'estado',
    
    // Campos adicionales que pueden estar presentes
    'Fecha Inicio': 'fecha_hora_asignacion',
    'Hora Inicio': 'hora_inicio_custodia',
    'Hora Fin': 'hora_finalizacion',
    'Observaciones': 'comentarios_adicionales'
  };
  
  // Iterar sobre los encabezados encontrados y mapearlos
  Object.entries(headerRow).forEach(([excelCol, headerValue]) => {
    // Si el valor del encabezado es una cadena de texto
    if (typeof headerValue === 'string') {
      const headerText = headerValue.trim();
      console.log(`Procesando encabezado: "${headerText}"`);
      
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
        
        // Verificar columnas problemáticas conocidas
        if (dbColumnName === 'cantidad_de_transportes') {
          console.log(`Ignorando columna problemática: ${headerText}`);
          return; // Skip this column
        }
        
        if (dbColumnName) {
          mapping[excelCol] = dbColumnName;
          console.log(`Mapeo generado: ${headerText} -> ${dbColumnName}`);
        }
      }
    } else if (headerValue !== null && headerValue !== undefined) {
      // Si el valor no es una cadena pero es algo, convertirlo a cadena
      const headerText = String(headerValue).trim();
      if (commonMappings[headerText]) {
        mapping[excelCol] = commonMappings[headerText];
        console.log(`Mapeo encontrado (no string): ${headerText} -> ${commonMappings[headerText]}`);
      }
    }
  });
  
  console.log(`Mapeo final de columnas: ${JSON.stringify(mapping)}`);
  return mapping;
}
