
/**
 * Extracts information from transcript data
 * This function processes the transcript data or direct webhook payload 
 * to extract relevant lead information
 */
export function extractInfoFromTranscript(data: any): Record<string, any> {
  // If data is null or undefined, return an empty object
  if (!data) {
    console.log("No transcript or data provided to extract information from");
    return {};
  }

  console.log("Processing data for extraction:", JSON.stringify(data, null, 2));
  
  // If the data is already in the format we need (direct webhook JSON payload)
  if (typeof data === 'object' && !Array.isArray(data)) {
    // Check if it has the expected fields directly
    if (data.car_brand || data.car_model || data.car_year || data.lead_name) {
      console.log("Data appears to be a direct webhook payload, using as-is");
      return {
        car_brand: data.car_brand || null,
        car_model: data.car_model || null,
        car_year: data.car_year ? data.car_year : null,
        custodio_name: data.lead_name || null,
        security_exp: data.security_exp || null,
        sedena_id: data.sedena_id || null
      };
    }
  }
  
  // If we're dealing with a transcript object with conversation data
  try {
    // Handle case where data is the transcript array
    if (Array.isArray(data)) {
      console.log("Processing transcript array data");
      return extractFromTranscriptArray(data);
    }
    
    // Handle case where data.transcript exists and is an array
    if (data.transcript && Array.isArray(data.transcript)) {
      console.log("Processing data with transcript array property");
      return extractFromTranscriptArray(data.transcript);
    }
    
    // If it's a string (possibly JSON)
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          return extractFromTranscriptArray(parsed);
        } else if (parsed.transcript && Array.isArray(parsed.transcript)) {
          return extractFromTranscriptArray(parsed.transcript);
        } else {
          // It might be a direct JSON object with the fields we need
          return {
            car_brand: parsed.car_brand || null,
            car_model: parsed.car_model || null,
            car_year: parsed.car_year ? parsed.car_year : null,
            custodio_name: parsed.lead_name || null,
            security_exp: parsed.security_exp || null,
            sedena_id: parsed.sedena_id || null
          };
        }
      } catch (e) {
        console.error("Error parsing string data as JSON:", e);
      }
    }
  } catch (error) {
    console.error("Error extracting information from transcript:", error);
  }
  
  console.log("Could not extract information from provided data format");
  return {};
}

/**
 * Extract information from a transcript array
 */
function extractFromTranscriptArray(transcript: any[]): Record<string, any> {
  let extractedInfo: Record<string, any> = {};
  let conversationText = '';
  
  // Concatenate all messages into a single text for analysis
  transcript.forEach((item) => {
    if (item.content) {
      conversationText += ' ' + item.content;
    } else if (item.text) {
      conversationText += ' ' + item.text;
    } else if (typeof item === 'string') {
      conversationText += ' ' + item;
    }
  });
  
  // Try to extract car brand
  const carBrandMatch = conversationText.match(/(?:driving|have|own|car|vehicle|automobile).*?(Toyota|Honda|Ford|Chevrolet|Nissan|BMW|Mercedes|Audi|Volkswagen|Hyundai|Kia|Mazda|Subaru|Lexus)/i);
  if (carBrandMatch) {
    extractedInfo.car_brand = carBrandMatch[1];
  }
  
  // Try to extract car model
  const carModelMatch = conversationText.match(/(?:model|driving|have).*?(Corolla|Civic|Camry|Accord|F-150|Silverado|Altima|Sentra|3 Series|C-Class|A4|Golf|Elantra|Sonata|Soul|Optima|CX-5|Forester|RX|ES)/i);
  if (carModelMatch) {
    extractedInfo.car_model = carModelMatch[1];
  }
  
  // Try to extract car year
  const carYearMatch = conversationText.match(/(?:year|from|model).*?(20\d\d|19\d\d)/i);
  if (carYearMatch) {
    extractedInfo.car_year = carYearMatch[1];
  }
  
  // Try to extract name
  const nameMatch = conversationText.match(/(?:name is|call me|I am) ([A-Z][a-z]+ [A-Z][a-z]+)/i);
  if (nameMatch) {
    extractedInfo.custodio_name = nameMatch[1];
  }
  
  // Try to extract security experience
  const securityExpMatch = conversationText.match(/(?:security experience|worked in security|security background|security job|security role)/i);
  if (securityExpMatch) {
    extractedInfo.security_exp = 'true';
  }
  
  // Try to extract SEDENA ID
  const sedenaIdMatch = conversationText.match(/(?:sedena|sedena id|military id|credential)/i);
  if (sedenaIdMatch) {
    extractedInfo.sedena_id = 'true';
  }
  
  return extractedInfo;
}
