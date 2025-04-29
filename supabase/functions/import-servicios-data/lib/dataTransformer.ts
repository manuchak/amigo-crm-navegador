
// Maps CSV column names to database column names
export function mapColumnNames(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  
  // Normalized header matching (case-insensitive, ignoring accents and spaces)
  const normalizeHeader = (header: string): string => {
    return header.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
      .replace(/\s+/g, '_'); // Replace spaces with underscores
  };
  
  // Define common mappings
  const commonMappings: Record<string, string[]> = {
    'id_servicio': ['id_servicio', 'id', 'folio', 'servicio_id', 'service_id'],
    'nombre_cliente': ['nombre_cliente', 'cliente', 'customer', 'empresa', 'company'],
    'folio_cliente': ['folio_cliente', 'referencia_cliente', 'customer_reference'],
    'tipo_servicio': ['tipo_servicio', 'tipo', 'type', 'service_type'],
    'estado': ['estado', 'status', 'estatus'],
    'fecha_hora_cita': ['fecha_hora_cita', 'fecha', 'date', 'appointment', 'cita', 'scheduled_date'],
    'fecha_hora_asignacion': ['fecha_hora_asignacion', 'asignacion', 'assigned_date'],
    'origen': ['origen', 'origin', 'from', 'source'],
    'destino': ['destino', 'destination', 'to', 'target'],
    'nombre_custodio': ['nombre_custodio', 'custodio', 'custodian', 'guardian'],
    'telefono': ['telefono', 'phone', 'contact', 'contacto'],
    'nombre_operador_transporte': ['nombre_operador_transporte', 'operador', 'driver', 'conductor'],
    'telefono_operador': ['telefono_operador', 'telefono_conductor', 'driver_phone'],
    'placa_carga': ['placa_carga', 'placa', 'plate', 'vehiculo'],
    'tipo_unidad': ['tipo_unidad', 'tipo_vehiculo', 'vehicle_type'],
    'comentarios_adicionales': ['comentarios_adicionales', 'comentarios', 'comments', 'notas', 'observaciones']
  };
  
  // Map headers to database columns
  headers.forEach(header => {
    const normalizedHeader = normalizeHeader(header);
    
    // Check if this header matches any of the common mappings
    for (const [dbColumn, possibleHeaders] of Object.entries(commonMappings)) {
      const normalizedPossibleHeaders = possibleHeaders.map(h => normalizeHeader(h));
      
      if (normalizedPossibleHeaders.includes(normalizedHeader)) {
        mapping[header] = dbColumn;
        break;
      }
    }
    
    // If not found in common mappings, use the header as is (cleaned up)
    if (!mapping[header]) {
      // Convert camelCase or snake_case to snake_case
      const snakeCase = normalizedHeader
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .toLowerCase();
      
      mapping[header] = snakeCase;
    }
  });
  
  console.log('Column mapping:', mapping);
  return mapping;
}

// Transform a row of data using the column mapping
export function transformRowData(row: Record<string, any>, columnMapping: Record<string, string>): Record<string, any> {
  const transformedRow: Record<string, any> = {};
  
  for (const [header, value] of Object.entries(row)) {
    if (columnMapping[header]) {
      const dbColumn = columnMapping[header];
      
      // Skip empty values
      if (value === '' || value === null || value === undefined) {
        continue;
      }
      
      // Handle specific data type conversions
      switch (dbColumn) {
        case 'fecha_hora_cita':
        case 'fecha_hora_asignacion':
          try {
            // Try to parse as date if it's a string
            if (typeof value === 'string') {
              // If it looks like a date string
              if (value.match(/^\d{4}-\d{2}-\d{2}/) || value.match(/^\d{1,2}\/\d{1,2}\/\d{4}/)) {
                transformedRow[dbColumn] = value; // The database function will handle conversion
              } else {
                transformedRow[dbColumn] = value;
              }
            } else if (value instanceof Date) {
              transformedRow[dbColumn] = value.toISOString();
            } else {
              transformedRow[dbColumn] = value;
            }
          } catch (e) {
            console.warn(`Error parsing date for ${dbColumn}:`, e);
            transformedRow[dbColumn] = value;
          }
          break;
          
        case 'cantidad_transportes':
        case 'km_teorico':
        case 'km_recorridos':
        case 'km_extras':
        case 'costo_custodio':
        case 'casetas':
        case 'cobro_cliente':
          // Convert to number if possible
          if (typeof value === 'string') {
            const cleanValue = value.replace(/[$,]/g, '').trim();
            if (/^-?\d*\.?\d+$/.test(cleanValue)) {
              transformedRow[dbColumn] = parseFloat(cleanValue);
            } else {
              transformedRow[dbColumn] = value;
            }
          } else {
            transformedRow[dbColumn] = value;
          }
          break;
          
        case 'armado':
          // Convert to boolean
          if (typeof value === 'string') {
            const lowerValue = value.toLowerCase().trim();
            if (['true', 'si', 'sí', 'yes', '1', 't', 'y'].includes(lowerValue)) {
              transformedRow[dbColumn] = true;
            } else if (['false', 'no', '0', 'f', 'n'].includes(lowerValue)) {
              transformedRow[dbColumn] = false;
            } else {
              transformedRow[dbColumn] = value;
            }
          } else {
            transformedRow[dbColumn] = value;
          }
          break;
          
        default:
          transformedRow[dbColumn] = value;
      }
    }
  }
  
  return transformedRow;
}
