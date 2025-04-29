
import { SupabaseClient, createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { ProgressManager } from './progressManager.ts';
import { forceGarbageCollection } from './memoryMonitor.ts';

export class BatchProcessor {
  private supabaseUrl: string;
  private supabaseKey: string;
  private supabaseClient: SupabaseClient;
  private progressManager: ProgressManager;
  private config: any;

  constructor(supabaseUrl: string, supabaseKey: string, progressManager: ProgressManager, config: any) {
    this.supabaseUrl = supabaseUrl;
    this.supabaseKey = supabaseKey;
    this.progressManager = progressManager;
    this.config = config;

    this.supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });
  }

  async processBatch(batch: any[]): Promise<{ insertedCount: number; errors: any[] }> {
    if (batch.length === 0) {
      return { insertedCount: 0, errors: [] };
    }

    const errors: any[] = [];
    let insertedCount = 0;
    let retries = 0;
    const maxRetries = this.config.maxRetries || 3;
    const batchSize = this.config.batchSize || 10;
    const tableName = 'servicios_custodia';

    try {
      // Split the batch into smaller micro-batches to reduce memory consumption
      for (let i = 0; i < batch.length; i += batchSize) {
        const microBatch = batch.slice(i, i + batchSize);
        let success = false;
        retries = 0;

        while (!success && retries < maxRetries) {
          try {
            // Process each record individually to handle unique constraint errors
            for (const record of microBatch) {
              try {
                // Check if record with same id_servicio already exists
                const { data: existingRecord, error: queryError } = await this.supabaseClient
                  .from(tableName)
                  .select('id')
                  .eq('id_servicio', record.id_servicio)
                  .maybeSingle();

                if (queryError) {
                  console.error(`Error checking for existing record:`, queryError);
                  errors.push({
                    record: record,
                    error: `Error checking for existing record: ${queryError.message}`
                  });
                  continue;
                }

                if (existingRecord) {
                  // Update existing record
                  const { error: updateError } = await this.supabaseClient
                    .from(tableName)
                    .update(record)
                    .eq('id_servicio', record.id_servicio);

                  if (updateError) {
                    console.error(`Error updating record:`, updateError);
                    errors.push({
                      record: record,
                      error: `Error updating record: ${updateError.message}`
                    });
                  } else {
                    insertedCount++;
                  }
                } else {
                  // Insert new record
                  const { error: insertError } = await this.supabaseClient
                    .from(tableName)
                    .insert(record);

                  if (insertError) {
                    console.error(`Error inserting record:`, insertError);
                    errors.push({
                      record: record,
                      error: `Error inserting record: ${insertError.message}`
                    });
                  } else {
                    insertedCount++;
                  }
                }
              } catch (recordError) {
                console.error(`Error processing individual record:`, recordError);
                errors.push({
                  record: record,
                  error: `Error processing individual record: ${recordError.message}`
                });
              }
              
              // Brief pause between operations to avoid rate limiting
              await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            success = true;
          } catch (batchError) {
            retries++;
            console.error(`Batch processing error (retry ${retries}/${maxRetries}):`, batchError);
            
            // Exponential backoff
            if (retries < maxRetries) {
              const backoffTime = this.config.initialBackoff * Math.pow(this.config.backoffFactor, retries - 1);
              console.log(`Retrying in ${backoffTime}ms...`);
              await new Promise(resolve => setTimeout(resolve, backoffTime));
            } else {
              errors.push({
                batch: batch.map(item => item.id_servicio || 'unknown'),
                error: `Failed after ${maxRetries} retries: ${batchError.message}`
              });
            }
          }
        }
        
        // Brief pause between micro-batches
        await new Promise(resolve => setTimeout(resolve, this.config.processingDelay || 500));
        
        // Force garbage collection
        await forceGarbageCollection();
      }

      return { insertedCount, errors };
    } catch (error) {
      console.error('Error in batch processor:', error);
      errors.push({
        batch: batch.map(item => item.id_servicio || 'unknown'),
        error: `Batch processing error: ${error.message}`
      });
      return { insertedCount, errors };
    }
  }
}
