
// Determinar mapeo de cabeceras según el primer registro
export function determineHeaderMapping(firstRow: Record<string, any>) {
  const mapping: Record<string, string> = {};
  const columnNames = Object.keys(firstRow);
  
  // Mapeo de nombres de columnas Excel a nombres de columnas en DB
  const possibleMappings: Record<string, string> = {
    'ID_SERVICIO': 'id_servicio',
    'FOLIO': 'id_servicio',
    'ID': 'id_servicio',
    'NOMBRE_CLIENTE': 'nombre_cliente',
    'CLIENTE': 'nombre_cliente',
    'FOLIO_CLIENTE': 'folio_cliente',
    'ESTADO': 'estado',
    'STATUS': 'estado',
    'ESTATUS': 'estado',
    'FECHA_HORA_CITA': 'fecha_hora_cita',
    'FECHA_CITA': 'fecha_hora_cita',
    'ORIGEN': 'origen',
    'DESTINO': 'destino',
    'NOMBRE_CUSTODIO': 'nombre_custodio',
    'CUSTODIO': 'nombre_custodio',
    'TIPO_SERVICIO': 'tipo_servicio',
    'SERVICIO': 'tipo_servicio',
    'KM_TEORICO': 'km_teorico',
    'KM': 'km_teorico',
    'KM_RECORRIDOS': 'km_recorridos',
  };
  
  for (const column of columnNames) {
    const columnUpper = column.toUpperCase();
    for (const [excelName, dbColumn] of Object.entries(possibleMappings)) {
      if (columnUpper === excelName || columnUpper.includes(excelName)) {
        mapping[column] = dbColumn;
        break;
      }
    }
    
    if (!mapping[column]) {
      mapping[column] = column.toLowerCase().replace(/\s+/g, '_');
    }
  }
  
  return mapping;
}
