import { v4 as uuidv4 } from 'https://esm.sh/uuid@9.0.1';

// Map column names from CSV/Excel to database fields
export function mapColumnNames(headers: string[]): Record<string, string> {
  const columnMapping: Record<string, string> = {};
  
  // Normalize headers by removing spaces, special characters and lowercasing
  const normalizeHeader = (header: string) => {
    return header.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '_')
      .replace(/[^\w]/g, '');
  };

  headers.forEach(header => {
    // Normalize and map the headers to database columns
    const normalizedHeader = normalizeHeader(header);
    
    // Default mapping is the same name
    columnMapping[header] = header;
    
    // Define specific mappings based on your CSV column names to database fields
    switch (normalizedHeader) {
      // Client information
      case 'cliente':
      case 'nombre_cliente':
        columnMapping[header] = 'nombre_cliente';
        break;
      case 'folio_cliente':
      case 'folio':
        columnMapping[header] = 'folio_cliente';
        break;
        
      // Service information
      case 'id_servicio':
      case 'folio_servicio':
      case 'id':
        columnMapping[header] = 'id_servicio';
        break;
      case 'tipo_servicio':
      case 'tipo':
        columnMapping[header] = 'tipo_servicio';
        break;
      case 'estado':
      case 'estatus':
      case 'status':
        columnMapping[header] = 'estado';
        break;
      case 'comentarios':
      case 'comentarios_adicionales':
      case 'notas':
        columnMapping[header] = 'comentarios_adicionales';
        break;
        
      // Custodio information
      case 'custodio':
      case 'nombre_custodio':
        columnMapping[header] = 'nombre_custodio';
        break;
      case 'telefono_custodio':
      case 'telefono':
        columnMapping[header] = 'telefono';
        break;
        
      // Transport information
      case 'nombre_operador':
      case 'operador':
      case 'nombre_operador_transporte':
        columnMapping[header] = 'nombre_operador_transporte';
        break;
      case 'telefono_operador':
        columnMapping[header] = 'telefono_operador';
        break;
      case 'placa':
      case 'placa_carga':
        columnMapping[header] = 'placa_carga';
        break;
        
      // Dates and locations
      case 'fecha':
      case 'fecha_servicio':
      case 'fecha_hora_cita':
        columnMapping[header] = 'fecha_hora_cita';
        break;
      case 'origen':
      case 'lugar_origen':
        columnMapping[header] = 'origen';
        break;
      case 'destino':
      case 'lugar_destino':
        columnMapping[header] = 'destino';
        break;
        
      // Vehicle information
      case 'tipo_unidad':
      case 'unidad':
      case 'vehiculo':
        columnMapping[header] = 'tipo_unidad';
        break;
        
      // Default case - keep original
      default:
        break;
    }
  });
  
  return columnMapping;
}

// Transform the row data from CSV/Excel format to database format
export function transformRowData(
  row: Record<string, any>, 
  columnMapping: Record<string, string>
): Record<string, any> {
  const transformedRow: Record<string, any> = {};
  
  // Generate a unique id_servicio if none exists to avoid primary key conflicts
  const hasIdServicio = Object.entries(row).some(([header, value]) => {
    const dbField = columnMapping[header];
    return dbField === 'id_servicio' && value && value !== '' && value !== 'NULL' && value !== null;
  });
  
  if (!hasIdServicio) {
    const uniqueId = `IMP-${uuidv4().substring(0, 8).toUpperCase()}`;
    transformedRow['id_servicio'] = uniqueId;
  }
  
  // Process each field according to mapping
  for (const [header, value] of Object.entries(row)) {
    const dbField = columnMapping[header];
    
    // Skip if no mapping found
    if (!dbField) continue;
    
    // Convert NULLs and empty strings appropriately
    if (value === 'NULL' || value === '' || value === null || value === undefined) {
      transformedRow[dbField] = null;
      continue;
    }
    
    // Data type conversions based on field
    switch (dbField) {
      // Date and time fields
      case 'fecha_hora_cita':
      case 'fecha_hora_asignacion':
        try {
          // Try to parse as a date
          if (typeof value === 'string') {
            if (value.includes('/')) {
              // Handle DD/MM/YYYY format
              const parts = value.split('/');
              if (parts.length === 3) {
                const date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                if (!isNaN(date.getTime())) {
                  transformedRow[dbField] = date.toISOString();
                  continue;
                }
              }
            }
            
            // Try standard date parsing
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
              transformedRow[dbField] = date.toISOString();
              continue;
            }
          } else if (value instanceof Date) {
            transformedRow[dbField] = value.toISOString();
            continue;
          }
          
          // If not parsed, keep as is
          transformedRow[dbField] = value;
        } catch (err) {
          console.error(`Error parsing date for ${dbField}:`, err);
          transformedRow[dbField] = value;
        }
        break;
        
      // Numeric fields
      case 'cantidad_transportes':
      case 'km_teorico':
      case 'km_recorridos':
      case 'km_extras':
      case 'costo_custodio':
      case 'casetas':
      case 'cobro_cliente':
        if (typeof value === 'string') {
          // Remove currency symbols or commas
          const cleanValue = value
            .replace(/[$,]/g, '')
            .trim();
          
          const numberValue = parseFloat(cleanValue);
          transformedRow[dbField] = isNaN(numberValue) ? null : numberValue;
        } else if (typeof value === 'number') {
          transformedRow[dbField] = value;
        } else {
          transformedRow[dbField] = null;
        }
        break;
        
      // Boolean fields
      case 'armado':
        if (typeof value === 'boolean') {
          transformedRow[dbField] = value;
        } else if (typeof value === 'string') {
          const normalizedValue = value.toLowerCase().trim();
          transformedRow[dbField] = 
            normalizedValue === 'true' || 
            normalizedValue === 'si' || 
            normalizedValue === 'sí' || 
            normalizedValue === '1' || 
            normalizedValue === 'yes';
        } else if (typeof value === 'number') {
          transformedRow[dbField] = value !== 0;
        }
        break;
        
      // Default: keep value as is
      default:
        transformedRow[dbField] = value;
    }
  }
  
  // Ensure created_at is set
  if (!transformedRow['created_at']) {
    transformedRow['created_at'] = new Date().toISOString();
  }
  
  // Ensure updated_time is set
  if (!transformedRow['updated_time']) {
    transformedRow['updated_time'] = new Date().toISOString();
  }
  
  return transformedRow;
}
