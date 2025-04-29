
// Map CSV data to driver behavior records format
export const mapCsvToDriverRecords = (records: any[]): any[] => {
  console.log("Mapping CSV records to driver behavior format...");
  const validRecords = [];
  
  // Define column mappings (based on your CSV structure shown in the image)
  const columnMappings: Record<string, string> = {
    'Agrupación': 'driver_name',
    'Valoración': 'score',
    'Multa': 'penalty_points',
    'Cantidad': 'trips_count',
    'Duración': 'duration_text',
    'Kilometraje': 'distance_text',
    'Comienzo': 'start_date',
    'Fin': 'end_date',
    'Cliente': 'client'
  };
  
  // Log all record keys to help debug
  if (records.length > 0) {
    console.log("Available fields in CSV:", Object.keys(records[0]));
  }
  
  // Convert each record using the mappings
  for (const record of records) {
    try {
      const mappedRecord: Record<string, any> = {
        driver_name: '',
        driver_group: 'Default Group', // Default value
        score: 0,
        penalty_points: 0,
        trips_count: 1,
        distance: 0,
        client: 'Default Client',
        start_date: new Date().toISOString(),
        end_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Map fields based on headers in the CSV
      let hasValidData = false;
      
      // First, map driver_name from Agrupación (which is also driver name according to the user)
      if (record['Agrupación'] !== undefined && record['Agrupación'] !== null) {
        mappedRecord['driver_name'] = String(record['Agrupación']).trim();
        mappedRecord['driver_group'] = String(record['Agrupación']).trim(); // Use the same value for group
        hasValidData = true;
      }
      
      // Map other fields
      for (const [csvField, dbField] of Object.entries(columnMappings)) {
        if (record[csvField] !== undefined && record[csvField] !== null) {
          hasValidData = true;
          
          // Process each field according to its expected type
          switch (dbField) {
            case 'driver_name':
              // Already handled above
              break;
              
            case 'score':
              // Parse decimal number
              const scoreValue = parseFloat(String(record[csvField]).replace(',', '.'));
              mappedRecord[dbField] = isNaN(scoreValue) ? 0 : Math.min(100, Math.max(0, scoreValue * 10)); // Scale 0-10 to 0-100
              break;
              
            case 'penalty_points':
              // Parse integer
              mappedRecord[dbField] = parseInt(String(record[csvField]), 10) || 0;
              break;
              
            case 'trips_count':
              // Parse integer
              mappedRecord[dbField] = parseInt(String(record[csvField]), 10) || 1;
              break;
              
            case 'duration_text':
              // Store as is
              mappedRecord[dbField] = String(record[csvField]);
              break;
              
            case 'distance_text':
              // Store as is
              mappedRecord[dbField] = String(record[csvField]);
              // Try to extract numeric distance if possible
              const distanceMatch = String(record[csvField]).match(/(\d+(?:[.,]\d+)?)/);
              if (distanceMatch) {
                mappedRecord['distance'] = parseFloat(distanceMatch[1].replace(',', '.'));
              }
              break;
              
            case 'start_date':
            case 'end_date':
              // Parse date with flexible format
              try {
                let dateString = String(record[csvField]);
                // Check if date is in format DD.MM.YYYY HH:MM
                let dateParts = dateString.split(' ');
                if (dateParts.length === 2) {
                  let [datePart, timePart] = dateParts;
                  if (datePart.includes('.')) {
                    // Convert DD.MM.YYYY to YYYY-MM-DD
                    let [day, month, year] = datePart.split('.');
                    dateString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${timePart}:00`;
                  }
                }
                const date = new Date(dateString);
                if (!isNaN(date.getTime())) {
                  mappedRecord[dbField] = date.toISOString();
                }
              } catch (e) {
                console.warn(`Could not parse date in field ${csvField}:`, record[csvField]);
              }
              break;
              
            case 'client':
              // Store as is
              mappedRecord[dbField] = String(record[csvField]).trim() || "Cliente sin especificar";
              break;
              
            default:
              // For any other fields, store as is
              mappedRecord[dbField] = record[csvField];
          }
        }
      }
      
      // Only include record if it has a valid driver name and some data
      if (mappedRecord.driver_name && mappedRecord.driver_name.length > 0 && hasValidData) {
        // Fix any missing required fields
        if (!mappedRecord.score || isNaN(mappedRecord.score)) {
          mappedRecord.score = 50; // Default score
        }
        
        // If no client is specified, use a default value
        if (!mappedRecord.client || mappedRecord.client === "Cliente sin especificar") {
          mappedRecord.client = "Cliente Predeterminado";
        }
        
        validRecords.push(mappedRecord);
      } else {
        console.warn("Skipping invalid record due to missing driver_name:", record);
      }
    } catch (error) {
      console.error("Error mapping record:", error, record);
    }
  }
  
  console.log(`Mapping complete. Found ${validRecords.length} valid records.`);
  if (validRecords.length > 0) {
    console.log("First mapped record:", validRecords[0]);
  }
  
  return validRecords;
};
