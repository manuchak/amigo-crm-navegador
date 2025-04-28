// Transforma datos del Excel a formato compatible con la base de datos
export function transformRowData(row: any, columnMapping: Record<string, string>): Record<string, any> {
  const transformedRow: Record<string, any> = {};
  const problematicColumns = [
    'tiempo_estimado', 'hora_de_finalizacion', 'duracion_del_servicio_hh_mm',
    'fecha_y_hora_de_asignacion', 'comentarios_adicional'
  ];

  // Recorrer cada campo del mapeo de columnas
  Object.entries(columnMapping).forEach(([excelColumn, dbColumn]) => {
    // Skip remaining problematic columns that are causing server errors
    if (problematicColumns.includes(dbColumn)) {
      return;
    }

    if (row[excelColumn] !== undefined && row[excelColumn] !== null) {
      let value = row[excelColumn];

      // Limpieza y normalización de valores
      if (typeof value === 'string') {
        // Eliminar espacios en blanco extras
        value = value.trim();
        
        // Si es una cadena vacía después del trim, no incluir
        if (value === '') {
          return;
        }
        
        // Si es un encabezado de columna, no incluir
        if (value.includes('Fecha') || value.includes('fecha') || 
            value.includes('Hora') || value.includes('hora') || 
            value.includes('Nombre') || value.includes('nombre') ||
            value.includes('ID') || value.includes('Id')) {
          return;
        }
      }

      // Conversión de tipos específicos según el nombre de columna
      if (dbColumn === 'fecha_contratacion' && typeof value === 'string') {
        try {
          // Special handling for fecha_contratacion - improved date parsing
          let dateValue;
          
          // Remove any non-date characters that might cause issues
          value = value.replace(/[^0-9\/\-\.]/g, '');
          
          if (value.includes('/')) {
            // Format DD/MM/YYYY or MM/DD/YYYY
            const parts = value.split('/');
            if (parts.length === 3) {
              // Assuming DD/MM/YYYY format is more common in Spanish locales
              let day = parseInt(parts[0], 10);
              let month = parseInt(parts[1], 10);
              let year = parseInt(parts[2], 10);
              
              // If year is in 2-digit format, add 2000
              if (year < 100) {
                year += year < 50 ? 2000 : 1900;
              }
              
              // Ensure valid date components
              if (day > 0 && day <= 31 && month > 0 && month <= 12 && year >= 1900) {
                dateValue = new Date(year, month - 1, day);
              }
            }
          } else if (value.includes('-')) {
            // Format YYYY-MM-DD
            const parts = value.split('-');
            if (parts.length === 3) {
              dateValue = new Date(value);
            }
          } else {
            // Try native parsing
            dateValue = new Date(value);
          }
          
          if (dateValue && !isNaN(dateValue.getTime())) {
            // Format as ISO string date portion only
            transformedRow[dbColumn] = dateValue.toISOString().split('T')[0];
            console.log(`Successfully parsed date for ${dbColumn}: ${value} -> ${transformedRow[dbColumn]}`);
          } else {
            console.log(`Failed to parse date for ${dbColumn}: ${value}`);
          }
        } catch (e) {
          // If date parsing fails, log it
          console.log(`Error parsing date for ${dbColumn}: ${value} - ${e}`);
        }
      }
      else if (dbColumn.includes('fecha') && typeof value === 'string' && dbColumn !== 'fecha_contratacion') {
        try {
          // Standard date handling for other date fields
          let dateValue;
          if (value.includes('/')) {
            // Formato DD/MM/YYYY
            const parts = value.split('/');
            if (parts.length === 3) {
              // Asegurarse de que el año tenga 4 dígitos
              const year = parts[2].length === 2 ? '20' + parts[2] : parts[2];
              dateValue = new Date(`${year}-${parts[1]}-${parts[0]}`);
            }
          } else {
            // Intentar con formato ISO o nativo
            dateValue = new Date(value);
          }
          
          if (dateValue && !isNaN(dateValue.getTime())) {
            transformedRow[dbColumn] = dateValue.toISOString();
          }
        } catch (e) {
          // Si falla la conversión, no incluir el campo
          console.log(`Error al convertir fecha: ${value} para columna ${dbColumn}`);
        }
      }
      else if (dbColumn.includes('hora') && typeof value === 'string') {
        // No procesar si parece ser un encabezado
        if (value.toLowerCase().includes('hora')) {
          return;
        }
        // Limpiar el formato de hora (eliminar caracteres no válidos)
        value = value.replace(/[^0-9:APMapm\s.-]/g, '').trim();
        transformedRow[dbColumn] = value;
      }
      // Enhanced numeric field handling specifically for cobro_cliente
      else if (dbColumn === 'cobro_cliente') {
        try {
          // Special handling for cobro_cliente
          if (typeof value === 'string') {
            // Clean the string to get a proper numeric value
            const cleanValue = value
              .replace(/[$€£¥]/g, '') // Remove currency symbols
              .replace(/\s/g, '')     // Remove spaces
              .replace(/,/g, '.')     // Replace comma with dot for decimal
              .replace(/[^\d.-]/g, ''); // Remove any remaining non-numeric chars except dots and minus
          
            // Handle empty string case
            if (cleanValue === '' || cleanValue === '.') {
              console.log(`Empty value for ${dbColumn} after cleaning: "${value}"`);
              return; // Skip this field
            }

            // Parse as float and validate
            const numValue = parseFloat(cleanValue);
            
            if (!isNaN(numValue)) {
              // Format to 2 decimal places and ensure it's within a reasonable range
              const formattedValue = Number(numValue.toFixed(2));
              if (formattedValue >= 0 && formattedValue <= 1000000) { // Reasonable upper limit
                transformedRow[dbColumn] = formattedValue;
                console.log(`Converted cobro_cliente value: ${value} -> ${formattedValue}`);
              } else {
                console.log(`Rejected unreasonable cobro_cliente value: ${numValue}`);
              }
            } else {
              console.log(`Couldn't convert numeric value for ${dbColumn}: ${value}`);
            }
          } else if (typeof value === 'number') {
            // For direct number inputs, also ensure it's properly formatted
            const formattedValue = Number(value.toFixed(2));
            if (formattedValue >= 0 && formattedValue <= 1000000) {
              transformedRow[dbColumn] = formattedValue;
              console.log(`Using numeric value for ${dbColumn}: ${formattedValue}`);
            } else {
              console.log(`Rejected unreasonable numeric value for ${dbColumn}: ${value}`);
            }
          }
        } catch (e) {
          console.error(`Error processing cobro_cliente field:`, e);
        }
      }
      // Other numeric fields handling
      else if (
        dbColumn.includes('km') || 
        dbColumn.includes('costo') || 
        dbColumn.includes('casetas') ||
        dbColumn === 'cantidad_transportes'
      ) {
        // Improved numeric value processing
        try {
          if (typeof value === 'string') {
            // First, normalize the string by removing currency symbols, spaces, and replacing commas with dots
            const cleanValue = value
              .replace(/[$€£¥]/g, '') // Remove currency symbols
              .replace(/\s/g, '') // Remove spaces
              .replace(/,/g, '.') // Replace comma with dot for decimal
              .replace(/[^\d.-]/g, ''); // Remove any remaining non-numeric chars except dots and minus
          
            // Handle empty string case
            if (cleanValue === '' || cleanValue === '.') {
              console.log(`Empty value for ${dbColumn} after cleaning: "${value}"`);
              return; // Skip this field
            }

            // Parse as float and validate
            const numValue = parseFloat(cleanValue);
            
            if (!isNaN(numValue)) {
              transformedRow[dbColumn] = numValue;
              console.log(`Converted numeric value for ${dbColumn}: ${value} -> ${numValue}`);
            } else {
              console.log(`Couldn't convert numeric value for ${dbColumn}: ${value}`);
            }
          } else if (typeof value === 'number') {
            transformedRow[dbColumn] = value;
          }
        } catch (e) {
          console.error(`Error processing numeric field ${dbColumn}:`, e);
        }
      }
      // Campos booleanos
      else if (dbColumn.includes('armado')) {
        if (typeof value === 'string') {
          transformedRow[dbColumn] = 
            value.toLowerCase() === 'si' || 
            value.toLowerCase() === 'sí' || 
            value.toLowerCase() === 'true' || 
            value.toLowerCase() === 'y' ||
            value.toLowerCase() === 'yes' ||
            value === '1';
        } else if (typeof value === 'boolean') {
          transformedRow[dbColumn] = value;
        } else if (typeof value === 'number') {
          transformedRow[dbColumn] = value === 1;
        }
      }
      // Greatly improved handling for interval type fields
      else if (
        dbColumn.includes('tiempo_') || 
        dbColumn.includes('duracion_') || 
        dbColumn === 'tiempo_retraso' ||
        dbColumn === 'tiempo_punto_origen' ||
        dbColumn === 'tiempo_estimado' ||
        dbColumn === 'duracion_servicio'
      ) {
        // CRITICAL FIX: Never allow empty strings for interval fields
        if (value === '' || value === null || value === undefined) {
          console.log(`Skipping empty value for interval field ${dbColumn}`);
          return; // Skip this field completely rather than adding an empty string
        }
        
        // Try to format as a valid interval
        if (typeof value === 'string') {
          // Clean the string - only allow numbers, colons, spaces, and certain words
          const cleanValue = value.trim()
            .replace(/[^0-9:. hmdaysminute\-]/gi, '')
            .toLowerCase();
            
          if (cleanValue === '') {
            console.log(`Skipping cleaned-to-empty interval field ${dbColumn}`);
            return; // Skip empty values
          }
          
          // Try to format as a valid interval string
          try {
            let formattedInterval = null;
            
            // If it's just numbers, assume it's minutes
            if (/^\d+$/.test(cleanValue)) {
              formattedInterval = `${cleanValue} minutes`;
            }
            // If it has a colon, format as HH:MM:SS
            else if (cleanValue.includes(':')) {
              const parts = cleanValue.split(':');
              if (parts.length === 2) {
                const hours = parseInt(parts[0], 10);
                const minutes = parseInt(parts[1], 10);
                formattedInterval = `${hours} hours ${minutes} minutes`;
              } else if (parts.length === 3) {
                const hours = parseInt(parts[0], 10);
                const minutes = parseInt(parts[1], 10);
                const seconds = parseInt(parts[2], 10);
                formattedInterval = `${hours} hours ${minutes} minutes ${seconds} seconds`;
              }
            }
            // If it already has 'h', 'm', etc. format more cleverly
            else if (cleanValue.includes('h') || cleanValue.includes('m') || cleanValue.includes('min')) {
              formattedInterval = cleanValue
                .replace('h', ' hours ')
                .replace('m', ' minutes ')
                .replace('min', ' minutes ')
                .trim();
            }
            // Default fallback if it's a non-empty string
            else if (cleanValue && cleanValue.length > 0 && /\d/.test(cleanValue)) {
              // Contains at least one digit, assume minutes
              formattedInterval = `${cleanValue} minutes`;
            }
            
            // Only include the field if we have a valid non-empty value
            if (formattedInterval && formattedInterval.trim() !== '') {
              transformedRow[dbColumn] = formattedInterval;
              console.log(`Formatted interval field ${dbColumn}: ${value} -> ${formattedInterval}`);
            } else {
              console.log(`Could not format interval field ${dbColumn}: ${value} - skipping`);
            }
          } catch (e) {
            console.error(`Error formatting interval for ${dbColumn}:`, e);
            return; // Skip this field on error
          }
        }
      }
      // Otros campos (texto, etc.)
      else {
        // Garantizar que todos los valores de texto sean cadenas
        if (value !== null && value !== undefined) {
          if (typeof value !== 'string') {
            value = String(value);
          }
          // Limitar la longitud de textos largos para evitar sobrecarga
          if (value.length > 1000) {
            value = value.substring(0, 1000) + '...';
          }
          transformedRow[dbColumn] = value;
        }
      }
    }
  });

  return transformedRow;
}

// Mapea nombres de columnas del Excel a columnas de la base de datos
export function mapColumnNames(headerNames: string[]): Record<string, string> {
  const columnMapping: Record<string, string> = {};
  
  // Mapa de normalización de acentos y caracteres especiales
  const normalizeMap: Record<string, string> = {
    'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
    'ü': 'u', 'ñ': 'n', 'Á': 'A', 'É': 'E', 'Í': 'I',
    'Ó': 'O', 'Ú': 'U', 'Ü': 'U', 'Ñ': 'N'
  };
  
  // Función para normalizar texto (eliminar acentos)
  const normalizeText = (text: string): string => {
    return text.split('').map(char => normalizeMap[char] || char).join('');
  };

  // Mapeo manual de columnas comunes del Excel a la base de datos
  const knownMappings: Record<string, string> = {
    // Mapeos exactos (añadido más variaciones)
    'id': 'id',
    'id del servicio': 'id_servicio',
    'id servicio': 'id_servicio',
    'id cotización': 'id_cotizacion',
    'id cotizacion': 'id_cotizacion',
    'gm transport id': 'gm_transport_id',
    'estado': 'estado',
    'nombre cliente': 'nombre_cliente',
    'nombre del cliente': 'nombre_cliente',
    'folio cliente': 'folio_cliente',
    'folio del cliente': 'folio_cliente',
    'comentarios adicionales': 'comentarios',  // Cambiado para evitar el problema
    'comentarios': 'comentarios',
    'local/foráneo': 'local_foraneo',
    'local/foraneo': 'local_foraneo',
    'ruta': 'ruta',
    'tipo de servicio': 'tipo_servicio',
    'tipo servicio': 'tipo_servicio',
    'nombre custodio': 'nombre_custodio',
    'nombre de custodio': 'nombre_custodio',
    'origen': 'origen',
    'destino': 'destino',
    'teléfono': 'telefono',
    'telefono': 'telefono',
    'contacto emergencia': 'contacto_emergencia',
    'contacto de emergencia': 'contacto_emergencia',
    'creado por': 'creado_por',
    'teléfono emergencia': 'telefono_emergencia',
    'telefono emergencia': 'telefono_emergencia',
    'auto': 'auto',
    'placa': 'placa',
    'nombre armado': 'nombre_armado',
    'teléfono armado': 'telefono_armado',
    'telefono armado': 'telefono_armado',
    'fecha y hora de cita': 'fecha_hora_cita',
    'fecha hora cita': 'fecha_hora_cita',
    'fecha_hora_cita': 'fecha_hora_cita',
    'km teórico': 'km_teorico',
    'km teorico': 'km_teorico',
    'cantidad transportes': 'cantidad_transportes',
    'fecha y hora asignación': 'fecha_hora_asignacion',
    'fecha hora asignación': 'fecha_hora_asignacion',
    'fecha_hora_asignacion': 'fecha_hora_asignacion',
    'armado': 'armado',
    'hora presentación': 'hora_presentacion',
    'hora presentacion': 'hora_presentacion',
    'tiempo retraso': 'tiempo_retraso',
    'hora inicio custodia': 'hora_inicio_custodia',
    'tiempo punto origen': 'tiempo_punto_origen',
    'hora arribo': 'hora_arribo',
    'hora finalización': 'hora_finalizacion',
    'hora finalizacion': 'hora_finalizacion',
    'duración servicio': 'duracion_servicio',
    'duracion servicio': 'duracion_servicio',
    'tiempo estimado': 'tiempo_estimado',
    'km recorridos': 'km_recorridos',
    'km extras': 'km_extras',
    'costo custodio': 'costo_custodio',
    'casetas': 'casetas',
    'cobro cliente': 'cobro_cliente',
    'fecha contratación': 'fecha_contratacion',
    'fecha contratacion': 'fecha_contratacion',
    'fecha primer servicio': 'fecha_primer_servicio',
    'id custodio': 'id_custodio'
  };
  
  // Iterar por cada nombre de columna en el Excel
  headerNames.forEach(originalHeader => {
    if (originalHeader === null || originalHeader === undefined) return;
    
    // Normalizar el encabezado (todo minúsculas, sin acentos)
    let header = typeof originalHeader === 'string' ? 
                 normalizeText(originalHeader.toLowerCase().trim()) : 
                 String(originalHeader).toLowerCase().trim();
    
    // Verificar si existe un mapeo conocido
    let dbColumn = knownMappings[header];
    
    // Si no hay mapeo directo, intentar con el encabezado original por si tiene acentos
    if (!dbColumn && typeof originalHeader === 'string') {
      dbColumn = knownMappings[originalHeader.toLowerCase().trim()];
    }
    
    // Si encontramos un mapeo, agregarlo
    if (dbColumn) {
      columnMapping[originalHeader] = dbColumn;
      return;
    }
    
    // Intentar generar un nombre de columna basado en el encabezado
    let generatedColumn = header
      .replace(/[^a-z0-9_]/g, '_') // Reemplazar caracteres no alfanuméricos por guiones bajos
      .replace(/_+/g, '_')         // Reemplazar múltiples guiones bajos consecutivos por uno solo
      .replace(/^_|_$/g, '')       // Eliminar guiones bajos al inicio y al final
      .toLowerCase();
    
    // Si después de la limpieza tenemos una columna vacía, usar un nombre genérico
    if (!generatedColumn) {
      generatedColumn = `campo_${headerNames.indexOf(originalHeader)}`;
    }
    
    // Asignar columna generada
    columnMapping[originalHeader] = generatedColumn;
  });
  
  return columnMapping;
}
