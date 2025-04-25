
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
    'Cliente': 'cliente_nombre',
    'Nombre del Cliente': 'cliente_nombre',
    'Custodio': 'custodio_nombre',
    'Nombre del Custodio': 'custodio_nombre',
    
    // Unidad y kilometraje
    'Unidad': 'unidad',
    'Vehículo': 'unidad',
    'ID Unidad': 'unidad',
    'Kilometraje': 'kilometraje',
    'KM': 'kilometraje',
    'KM Recorrido': 'kilometraje',
    
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
    'Importe': 'importe',
    'Monto': 'importe',
    'Costo': 'importe',
    'Estatus': 'estatus',
    'Estado': 'estatus',
    
    // Campos adicionales que pueden estar presentes
    'Fecha Inicio': 'fecha_inicio',
    'Fecha Fin': 'fecha_fin',
    'Hora Inicio': 'hora_inicio',
    'Hora Fin': 'hora_fin',
    'Observaciones': 'observaciones'
  };
  
  // Iterar sobre los encabezados encontrados y mapearlos
  Object.entries(headerRow).forEach(([excelCol, headerValue]) => {
    // Si el valor del encabezado es una cadena de texto
    if (typeof headerValue === 'string') {
      const headerText = headerValue.trim();
      
      // Buscar en mapeos comunes
      if (commonMappings[headerText]) {
        mapping[excelCol] = commonMappings[headerText];
      } else {
        // Si no encuentra mapeo, usar una versión normalizada del nombre de la columna
        // Convertir "Nombre de Columna" a "nombre_de_columna"
        let dbColumnName = headerText
          .toLowerCase()
          .replace(/\s+/g, '_')
          .replace(/[^a-z0-9_]/g, '');
        
        // No usamos 'cantidad_de_transportes' ya que no existe en el esquema
        if (dbColumnName === 'cantidad_de_transportes') {
          dbColumnName = 'observaciones'; // Lo mapeamos a un campo existente como alternativa
        }
        
        if (dbColumnName) {
          mapping[excelCol] = dbColumnName;
        }
      }
    } else if (headerValue !== null && headerValue !== undefined) {
      // Si el valor no es una cadena pero es algo, convertirlo a cadena
      const headerText = String(headerValue).trim();
      if (commonMappings[headerText]) {
        mapping[excelCol] = commonMappings[headerText];
      }
    }
  });
  
  return mapping;
}
