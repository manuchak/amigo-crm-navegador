
/**
 * Extract information from transcript data
 */
export function extractInfoFromTranscript(transcript: any): {
  car_brand: string | null;
  car_model: string | null;
  car_year: number | null;
  custodio_name: string | null;
  security_exp: string | null;
  sedena_id: string | null;
} {
  // Default extracted information
  let extractedInfo = {
    car_brand: null,
    car_model: null,
    car_year: null,
    custodio_name: null,
    security_exp: null,
    sedena_id: null
  };

  // Process transcript if available
  if (!transcript) return extractedInfo;
  
  try {
    // Handle various transcript formats
    const transcriptData = typeof transcript === 'string' 
      ? JSON.parse(transcript) 
      : transcript;
    
    if (transcriptData) {
      // Convert to string for pattern matching - handles both array and object formats
      const transcriptText = JSON.stringify(transcriptData).toLowerCase();
      
      // Extract car information
      if (transcriptText.includes("marca") || transcriptText.includes("modelo") || 
          transcriptText.includes("vehículo") || transcriptText.includes("coche") || 
          transcriptText.includes("carro")) {
        
        // Extract car brand
        const brandMatch = transcriptText.match(/marca.*?(\w+)/i) || 
                        transcriptText.match(/tengo un (\w+)/i) ||
                        transcriptText.match(/mi (\w+)/i);
        if (brandMatch && brandMatch[1]) {
          extractedInfo.car_brand = brandMatch[1].charAt(0).toUpperCase() + brandMatch[1].slice(1);
        }
        
        // Extract car model
        const modelMatch = transcriptText.match(/modelo.*?(\w+)/i) ||
                        transcriptText.match(/un (\w+) del/i);
        if (modelMatch && modelMatch[1]) {
          extractedInfo.car_model = modelMatch[1].charAt(0).toUpperCase() + modelMatch[1].slice(1);
        }
        
        // Extract car year
        const yearMatch = transcriptText.match(/año.*?(\d{4})/i) ||
                       transcriptText.match(/del (\d{4})/i);
        if (yearMatch && yearMatch[1]) {
          extractedInfo.car_year = parseInt(yearMatch[1]);
        }
      }
      
      // Extract security experience
      if (transcriptText.includes("experiencia") || transcriptText.includes("seguridad")) {
        extractedInfo.security_exp = 
          transcriptText.includes("tengo experiencia") ? "SI" : "NO";
      }
      
      // Extract name
      const nameMatch = transcriptText.match(/me llamo (\w+ \w+)/i) ||
                     transcriptText.match(/nombre es (\w+ \w+)/i);
      if (nameMatch && nameMatch[1]) {
        extractedInfo.custodio_name = nameMatch[1];
      }
    }
  } catch (transcriptError) {
    console.error("Error processing transcript:", transcriptError);
  }
  
  return extractedInfo;
}
