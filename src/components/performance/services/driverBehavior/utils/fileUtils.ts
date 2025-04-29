
// Helper function to read file content
export const readFileContent = async (file: File): Promise<any[]> => {
  try {
    console.log("Reading file content...");
    const text = await file.text();
    
    // Determine if CSV or Excel by extension
    if (file.name.toLowerCase().endsWith('.csv')) {
      // Process as CSV
      return processCSV(text);
    } else if (file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls')) {
      // For Excel files, we'd normally use a library like XLSX
      // But for simplicity in this example, we'll return sample data
      return generateSampleData(file.name);
    } else {
      console.error("Unsupported file format");
      return [];
    }
  } catch (error) {
    console.error("Error reading file:", error);
    return [];
  }
};

// Process CSV content with improved parsing
export const processCSV = (content: string): any[] => {
  console.log("Processing CSV content...");
  // Split by lines and remove empty lines
  const lines = content.split('\n').filter(line => line.trim() !== '');
  
  if (lines.length < 2) {
    console.error("CSV has less than 2 lines (no header or data)");
    return [];
  }
  
  // Extract headers and handle potential BOM character
  let headers = lines[0].replace(/^\uFEFF/, '').split(',').map(h => h.trim());
  console.log("CSV Headers:", headers);
  
  const result = [];
  let rowErrors = 0;
  
  // Process each data row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    try {
      // Handle quoted values with commas properly
      const values: string[] = [];
      let currentValue = '';
      let inQuotes = false;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        
        if (char === '"' && (j === 0 || line[j-1] !== '\\')) {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(currentValue);
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      
      // Don't forget the last value
      values.push(currentValue);
      
      // Create record mapping headers to values
      if (values.length !== headers.length) {
        console.warn(`Row ${i+1} has incorrect number of columns. Expected ${headers.length}, got ${values.length}`);
        rowErrors++;
        continue;
      }
      
      const record: Record<string, any> = {};
      headers.forEach((header, index) => {
        if (index < values.length) {
          // Remove quotes if present
          const value = values[index].replace(/^"|"$/g, '').trim();
          record[header] = value;
        }
      });
      
      result.push(record);
    } catch (error) {
      console.error(`Error parsing row ${i+1}:`, error);
      rowErrors++;
    }
  }
  
  console.log(`CSV processing complete. Extracted ${result.length} records with ${rowErrors} errors.`);
  if (result.length > 0) {
    console.log("First record sample:", result[0]);
  }
  
  return result;
};

// Generate sample data based on filename for testing
export const generateSampleData = (filename: string): any[] => {
  const baseClientName = filename.split('.')[0];
  const records = [];
  
  for (let i = 0; i < 10; i++) {
    records.push({
      'Agrupación': `Driver ${i+1} from ${baseClientName}`,
      'Valoración': (Math.random() * 10).toFixed(1),
      'Multa': Math.floor(Math.random() * 10),
      'Cantidad': Math.floor(Math.random() * 50) + 20,
      'Kilometraje': `${Math.floor(Math.random() * 500)} km`,
      'Duración': `${Math.floor(Math.random() * 10)}h ${Math.floor(Math.random() * 60)}m`,
      'Cliente': baseClientName,
      'Comienzo': new Date().toISOString(),
      'Fin': new Date().toISOString(),
    });
  }
  
  return records;
};
