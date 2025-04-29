
import { ImportResponse, ProgressCallback } from "../import/types";
import { supabase } from "@/integrations/supabase/client";
import { readFileContent } from "./utils/fileUtils";
import { mapCsvToDriverRecords } from "./utils/mappingUtils";

// Import driver behavior data
export const importDriverBehaviorData = async (
  file: File,
  onProgress?: ProgressCallback
): Promise<ImportResponse> => {
  console.log("Importing driver behavior data from file:", file.name);

  // Progress reporting function
  const updateProgress = async (status: string, processed: number, total: number) => {
    if (onProgress) {
      onProgress(status, processed, total);
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  };

  try {
    // Start upload process
    await updateProgress("Analizando archivo...", 10, 100);
    
    // Process the file based on its type
    const fileData = await readFileContent(file);
    if (!fileData || !fileData.length) {
      return {
        success: false,
        message: "No se pudieron extraer datos del archivo",
        insertedCount: 0,
        totalCount: 0,
        errors: [{
          row: 0,
          message: "Archivo vacío o formato no válido"
        }]
      };
    }
    
    await updateProgress("Procesando datos...", 30, 100);
    console.log(`Extracted ${fileData.length} records from file`);
    console.log("Sample data:", fileData.slice(0, 2));
    
    // Validate and map data before insertion
    const validRecords = mapCsvToDriverRecords(fileData);
    if (validRecords.length === 0) {
      console.error("No valid records found after mapping");
      return {
        success: false,
        message: "No hay registros válidos para importar",
        insertedCount: 0,
        totalCount: fileData.length,
        errors: [{
          row: 0,
          message: "No se encontraron registros válidos en el archivo. Verifique que el formato coincide con la plantilla."
        }]
      };
    }
    
    console.log(`Validated ${validRecords.length} records, preparing for insertion`);
    await updateProgress("Guardando datos en la base de datos...", 60, 100);
    
    // Insert data into Supabase in batches to prevent timeouts
    const batchSize = 25;
    let insertedCount = 0;
    let errors: any[] = [];
    
    for (let i = 0; i < validRecords.length; i += batchSize) {
      const batch = validRecords.slice(i, i + batchSize);
      console.log(`Inserting batch ${Math.floor(i/batchSize) + 1} with ${batch.length} records`);
      
      try {
        const { data, error } = await supabase
          .from('driver_behavior_scores')
          .insert(batch)
          .select();
        
        if (error) {
          console.error("Error inserting batch:", error);
          errors.push({
            row: i,
            message: `Error en lote: ${error.message}`
          });
        } else {
          insertedCount += data?.length || 0;
          console.log(`Successfully inserted ${data?.length || 0} records in this batch`);
        }
      } catch (batchError: any) {
        console.error("Exception during batch insert:", batchError);
        errors.push({
          row: i,
          message: `Excepción en lote: ${batchError.message}`
        });
      }
      
      // Update progress based on processed batches
      const progressPercent = 60 + Math.floor((i / validRecords.length) * 35);
      await updateProgress(
        `Guardando datos (${i+batch.length} de ${validRecords.length})...`, 
        progressPercent, 
        100
      );
    }
    
    console.log(`Import completed. Inserted ${insertedCount} out of ${validRecords.length} records`);
    await updateProgress("Finalizado", 100, 100);
    
    // Return success response
    return {
      success: true,
      message: `Se importaron ${insertedCount} registros de comportamiento de conductores exitosamente`,
      insertedCount,
      totalCount: validRecords.length,
      errors: errors.length > 0 ? errors : []
    };
  } catch (error: any) {
    console.error("Error in driver behavior data import:", error);
    
    return {
      success: false,
      message: `Error en la importación: ${error.message || "Error desconocido"}`,
      insertedCount: 0,
      totalCount: 0,
      errors: [{
        row: 0,
        message: error.message || "Error desconocido"
      }]
    };
  }
};
