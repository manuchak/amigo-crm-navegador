
export function transformRowData(row: Record<string, any>, headerMapping: Record<string, string>) {
  const transformedRow: Record<string, any> = {};
  
  for (const [excelColumn, value] of Object.entries(row)) {
    const dbColumn = headerMapping[excelColumn] || excelColumn.toLowerCase().replace(/\s+/g, '_');
    
    if (dbColumn.includes('fecha') || dbColumn.includes('date') || dbColumn.includes('time')) {
      transformedRow[dbColumn] = transformDateValue(value);
    } 
    else if (dbColumn.includes('km') || dbColumn.includes('costo') || dbColumn.includes('cobro')) {
      transformedRow[dbColumn] = transformNumericValue(value);
    } 
    else if (dbColumn.includes('armado')) {
      transformedRow[dbColumn] = transformBooleanValue(value);
    }
    else {
      transformedRow[dbColumn] = value;
    }
  }
  
  return transformedRow;
}

function transformDateValue(value: any): string | null {
  try {
    if (value instanceof Date) {
      return value.toISOString();
    } 
    if (typeof value === 'string') {
      const parsedDate = new Date(value);
      return !isNaN(parsedDate.getTime()) ? parsedDate.toISOString() : value;
    }
    return value;
  } catch {
    return value;
  }
}

function transformNumericValue(value: any): number | null {
  if (typeof value === 'string') {
    const numericValue = value.replace(/[^\d.-]/g, '');
    return numericValue ? parseFloat(numericValue) : null;
  }
  return value;
}

function transformBooleanValue(value: any): boolean {
  if (typeof value === 'string') {
    const upperValue = value.toUpperCase();
    return upperValue === 'SI' || upperValue === 'YES' || upperValue === 'TRUE' || upperValue === '1';
  }
  return !!value;
}
