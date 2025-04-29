
import { utils, writeFile } from "xlsx";
import { templateColumns } from './columnDefinitions';

/**
 * Generate a template CSV file for data imports
 * @param templateType Type of template to generate ('servicios', 'driver-behavior', etc.)
 */
export const generateTemplateCSV = (templateType: string) => {
  let headers: string[] = [];
  let sampleData: any[] = [];

  // Define headers and sample data based on template type
  if (templateType === 'servicios') {
    headers = [
      'id_servicio',
      'nombre_cliente',
      'folio_cliente',
      'tipo_servicio',
      'estado',
      'fecha_hora_cita',
      'origen',
      'destino',
      'nombre_custodio',
      'telefono',
      'nombre_operador_transporte',
      'telefono_operador',
      'placa_carga',
      'tipo_unidad',
      'comentarios_adicionales'
    ];

    // Add some sample rows
    sampleData = [
      {
        id_servicio: 'SERV-001',
        nombre_cliente: 'Empresa Ejemplo',
        folio_cliente: 'CL-12345',
        tipo_servicio: 'Custodia',
        estado: 'Programado',
        fecha_hora_cita: '2025-05-10 08:00:00',
        origen: 'Ciudad de México',
        destino: 'Querétaro',
        nombre_custodio: 'Juan Pérez',
        telefono: '5551234567',
        nombre_operador_transporte: 'Carlos Rodríguez',
        telefono_operador: '5559876543',
        placa_carga: 'ABC-123',
        tipo_unidad: 'Sedán',
        comentarios_adicionales: 'Cliente preferente'
      },
      {
        id_servicio: 'SERV-002',
        nombre_cliente: 'Corporativo XYZ',
        folio_cliente: 'CL-67890',
        tipo_servicio: 'Instalación',
        estado: 'Completado',
        fecha_hora_cita: '2025-05-12 14:30:00',
        origen: 'Guadalajara',
        destino: 'Guadalajara',
        nombre_custodio: 'Ana López',
        telefono: '5551112233',
        nombre_operador_transporte: '',
        telefono_operador: '',
        placa_carga: '',
        tipo_unidad: '',
        comentarios_adicionales: 'Instalación de GPS'
      }
    ];
  } else if (templateType === 'driver-behavior') {
    headers = [
      'Agrupación',
      'Valoración',
      'Multa',
      'Cantidad',
      'Kilometraje',
      'Duración',
      'Cliente',
      'Comienzo',
      'Fin'
    ];

    // Add some sample rows
    sampleData = [
      {
        'Agrupación': 'Juan Pérez',
        'Valoración': 8.5,
        'Multa': 1,
        'Cantidad': 28,
        'Kilometraje': '450 km',
        'Duración': '5h 30m',
        'Cliente': 'Empresa A',
        'Comienzo': '2025-05-01',
        'Fin': '2025-05-31'
      },
      {
        'Agrupación': 'María González',
        'Valoración': 9.2,
        'Multa': 0,
        'Cantidad': 35,
        'Kilometraje': '620 km',
        'Duración': '8h 45m',
        'Cliente': 'Empresa B',
        'Comienzo': '2025-05-01',
        'Fin': '2025-05-31'
      }
    ];
  } else {
    // Generic template
    headers = ['Column1', 'Column2', 'Column3'];
    sampleData = [
      { 'Column1': 'Value 1', 'Column2': 'Value 2', 'Column3': 'Value 3' },
      { 'Column1': 'Another 1', 'Column2': 'Another 2', 'Column3': 'Another 3' }
    ];
  }

  // Create workbook and worksheet
  const workbook = utils.book_new();
  const worksheet = utils.json_to_sheet(sampleData, { header: headers });

  // Add worksheet to workbook
  utils.book_append_sheet(workbook, worksheet, 'Template');

  // Generate filename
  const filename = `template_${templateType}_${new Date().toISOString().split('T')[0]}.xlsx`;

  // Create download
  writeFile(workbook, filename);
};

/**
 * Creates the header row for CSV templates
 */
export const createHeaderRow = (): string => {
  return templateColumns.map(col => col.displayName).join(',');
};

/**
 * Creates the description row with column details
 */
export const createDescriptionRow = (): string => {
  return templateColumns.map(col => {
    const requiredText = col.required ? '[Requerido]' : '[Opcional]';
    return `"${requiredText} ${col.description.replace(/"/g, '""')}"`;
  }).join(',');
};

/**
 * Creates an example data row
 */
export const createExampleRow = (): string => {
  return templateColumns.map(col => {
    if (col.type === 'text' || col.type === 'date') {
      return `"${col.example}"`;
    }
    return col.example;
  }).join(',');
};

/**
 * Creates instruction rows for the CSV
 */
export const createInstructionsRows = (): string => {
  return [
    '"# PLANTILLA PARA IMPORTACIÓN DE SERVICIOS"',
    '"# Instrucciones:"',
    '"# 1. No modifique la estructura de columnas"',
    '"# 2. Las columnas marcadas como [Requerido] son obligatorias"',
    '"# 3. Respete el formato de los campos numéricos y fechas"',
    '"# 4. Para fechas use el formato YYYY-MM-DD HH:MM:SS"',
    '"# 5. Elimine estas líneas de instrucciones antes de importar"',
    '"# --------------------------------------------------------------------------"'
  ].join('\n');
};
