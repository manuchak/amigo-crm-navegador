// Determine the mapping between the file headers and the database columns
export function determineHeaderMapping(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  
  // Normalize headers for comparison
  const normalizeHeader = (header: string): string => {
    return header.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
      .replace(/\s+/g, '_'); // Replace spaces with underscores
  };
  
  // Define expected columns with variations
  const expectedColumns: Record<string, string[]> = {
    // Core fields
    'id_servicio': ['id_servicio', 'id', 'folio', 'servicio_id'],
    'nombre_cliente': ['nombre_cliente', 'cliente', 'customer', 'empresa'],
    'folio_cliente': ['folio_cliente', 'referencia_cliente', 'customer_reference'],
    'tipo_servicio': ['tipo_servicio', 'tipo', 'type', 'service_type'],
    'estado': ['estado', 'status', 'estatus'],
    'fecha_hora_cita': ['fecha_hora_cita', 'fecha', 'date', 'appointment', 'cita'],
    'origen': ['origen', 'origin', 'from', 'source'],
    'destino': ['destino', 'destination', 'to', 'target'],
    'nombre_custodio': ['nombre_custodio', 'custodio', 'custodian', 'guardian'],
    'telefono': ['telefono', 'phone', 'contact', 'contacto'],
    'nombre_operador_transporte': ['nombre_operador_transporte', 'operador', 'driver', 'conductor'],
    'telefono_operador': ['telefono_operador', 'telefono_conductor', 'driver_phone'],
    'placa_carga': ['placa_carga', 'placa', 'plate', 'vehiculo'],
    'tipo_unidad': ['tipo_unidad', 'tipo_vehiculo', 'vehicle_type'],
    'comentarios_adicionales': ['comentarios_adicionales', 'comentarios', 'comments', 'notas']
  };
  
  // Map the headers to the expected columns
  headers.forEach(header => {
    const normalizedHeader = normalizeHeader(header);
    
    // Try to find a match in expected columns
    for (const [dbColumn, variations] of Object.entries(expectedColumns)) {
      const normalizedVariations = variations.map(v => normalizeHeader(v));
      
      if (normalizedVariations.includes(normalizedHeader)) {
        mapping[normalizedHeader] = dbColumn;
        break;
      }
    }
    
    // If no match was found, keep the original (normalized)
    if (!mapping[normalizedHeader]) {
      mapping[normalizedHeader] = normalizedHeader;
    }
  });
  
  return mapping;
}

// Exportar también los tipos de columnas para su uso en la transformación de datos
export const knownNumericColumns = [
  'km_recorridos', 'km_teorico', 'km_extras',
  'cobro_cliente', 'costo_custodio', 'casetas'
];

export const knownBooleanColumns = [
  'armado', 'es_armado', 'esmilitar', 'tienevehiculo', 'esarmado'
];
