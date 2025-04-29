
import { utils, writeFile } from "xlsx";
import { templateColumns } from './columnDefinitions';
import { knownNumericColumns, knownTimeColumns, knownIntervalColumns, knownBooleanColumns } from '../import/lib/columnTypes';

/**
 * Generate a template CSV file for data imports
 * @param templateType Type of template to generate ('servicios', 'driver-behavior', etc.)
 */
export const generateTemplateCSV = (templateType: string) => {
  let headers: string[] = [];
  let descriptions: string[] = [];
  let formats: string[] = [];
  let sampleData: any[] = [];

  // Define headers and sample data based on template type
  if (templateType === 'servicios') {
    // Use template columns for headers
    headers = templateColumns.map(col => col.name);
    descriptions = templateColumns.map(col => {
      const requiredText = col.required ? '[Requerido] ' : '[Opcional] ';
      return requiredText + (col.description || '');
    });
    
    // Add format information for different column types
    formats = templateColumns.map(col => {
      if (knownNumericColumns.includes(col.name)) {
        return "Número (ej: 123.45)";
      } else if (knownBooleanColumns.includes(col.name)) {
        return "Booleano (Sí/No, True/False)";
      } else if (knownTimeColumns.includes(col.name)) {
        return "Hora (HH:MM:SS o HH:MM)";
      } else if (knownIntervalColumns.includes(col.name)) {
        return "Intervalo (HH:MM:SS)";
      } else {
        return "";
      }
    });
    
    // Prepare example data row from the template definitions
    const exampleRow: Record<string, any> = {};
    templateColumns.forEach(col => {
      exampleRow[col.name] = col.example || "";
    });
    
    sampleData = [exampleRow];
  } else if (templateType === 'driver-behavior') {
    // Driver behavior headers and sample data
    headers = [
      'Agrupación', 'Valoración', 'Multa', 'Cantidad', 
      'Kilometraje', 'Duración', 'Cliente', 'Comienzo', 'Fin'
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
  const worksheet = utils.json_to_sheet([]);
  
  // Add headers
  utils.sheet_add_aoa(worksheet, [headers], { origin: 'A1' });
  
  // Add descriptions if available
  if (descriptions.length > 0) {
    utils.sheet_add_aoa(worksheet, [descriptions], { origin: 'A2' });
  }
  
  // Add format information if available
  if (formats.length > 0) {
    utils.sheet_add_aoa(worksheet, [formats], { origin: 'A3' });
  }
  
  // Add sample data with appropriate offset
  const dataOffset = 1 + (descriptions.length > 0 ? 1 : 0) + (formats.length > 0 ? 1 : 0);
  
  if (sampleData.length > 0) {
    for (let i = 0; i < sampleData.length; i++) {
      const rowData = headers.map(header => sampleData[i][header] || "");
      utils.sheet_add_aoa(worksheet, [rowData], { origin: `A${dataOffset + i + 1}` });
    }
  }

  // Add worksheet to workbook
  utils.book_append_sheet(workbook, worksheet, "Template");

  // Add instructions worksheet
  const instructionsWs = utils.aoa_to_sheet([
    ['INSTRUCCIONES PARA LA IMPORTACIÓN DE DATOS'],
    [''],
    ['1. No modifique la estructura de columnas del archivo.'],
    ['2. Las columnas marcadas como [Requerido] son obligatorias.'],
    ['3. Los campos de tiempo (hora_presentacion, hora_inicio_custodia, hora_arribo, hora_finalizacion) pueden dejarse vacíos si no tiene la información.'],
    ['4. Los campos de intervalo (tiempo_retraso, tiempo_punto_origen, duracion_servicio, tiempo_estimado) también pueden dejarse vacíos.'],
    ['5. Formatos recomendados:'],
    ['   - Fechas y horas: YYYY-MM-DD HH:MM:SS o DD/MM/YYYY HH:MM:SS'],
    ['   - Horas: HH:MM:SS o HH:MM'],
    ['   - Intervalos: HH:MM:SS'],
    ['   - Valores booleanos: Sí/No, True/False, 1/0'],
    ['   - Números: Utilice punto como separador decimal (123.45)'],
    [''],
    ['6. Si un campo no tiene valor, puede dejarlo vacío o escribir NULL.'],
    ['7. Para campos de tiempo o intervalo vacíos, el sistema utilizará valores predeterminados (NULL o 00:00:00).']
  ]);
  utils.book_append_sheet(workbook, instructionsWs, "Instrucciones");

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
    return `"${requiredText} ${col.description ? col.description.replace(/"/g, '""') : ''}"`;
  }).join(',');
};

/**
 * Creates an example data row
 */
export const createExampleRow = (): string => {
  return templateColumns.map(col => {
    if (col.type === 'text' || col.type === 'date' || col.type === 'time' || col.type === 'datetime' || col.type === 'interval') {
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
    '"# 5. Para intervalos de tiempo use el formato HH:MM:SS"',
    '"# 6. Para campos booleanos use Sí/No o Verdadero/Falso"',
    '"# 7. Los campos de tiempo e intervalos pueden dejarse vacíos"',
    '"# 8. Elimine estas líneas de instrucciones antes de importar"',
    '"# --------------------------------------------------------------------------"'
  ].join('\n');
};
