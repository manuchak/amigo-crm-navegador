
import { toast } from 'sonner';
import { webhookCalls } from './webhook/webhookCalls';
import { Lead } from '@/services/leadService';

const BATCH_SIZE = 20; // Maximum leads per batch
const BATCH_INTERVAL = 60000; // One minute in milliseconds

/**
 * Process leads in batches with controlled throughput
 */
export async function processBatchCalls(
  selectedLeads: number[], 
  leads: Lead[], 
  callType: 'progressive' | 'predictive',
  onProgress?: (current: number, total: number) => void,
  onError?: (error: Error, leadId: number) => void
): Promise<{success: number, failed: number}> {
  if (!selectedLeads.length) return { success: 0, failed: 0 };
  
  // Initialize counters
  let successCount = 0;
  let failedCount = 0;
  let currentIndex = 0;
  
  // Calculate total batches for better progress reporting
  const totalLeads = selectedLeads.length;
  const totalBatches = Math.ceil(totalLeads / BATCH_SIZE);
  
  // Process each batch
  for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
    // Get current batch of leads (max BATCH_SIZE)
    const batchLeadIds = selectedLeads.slice(batchIndex * BATCH_SIZE, (batchIndex + 1) * BATCH_SIZE);
    const batchLeads = batchLeadIds.map(id => leads.find(l => l.id === id)).filter(Boolean) as Lead[];
    
    // Process each lead in the batch (we can process these in parallel)
    const batchPromises = batchLeads.map(async (lead) => {
      try {
        // Get lead phone info
        let phoneNumber = lead.telefono || '';
        if (!phoneNumber && lead.contacto && lead.contacto.includes('|')) {
          const parts = lead.contacto.split('|');
          phoneNumber = parts[1]?.trim();
        }
        
        // Format phone number
        if (!phoneNumber.startsWith('+')) {
          phoneNumber = '+52' + phoneNumber.replace(/^0+/, '');
        }
        phoneNumber = phoneNumber.replace(/\s+/g, '');
        
        // Send webhook for the call
        const result = await webhookCalls.initiateVapiCall(
          phoneNumber, 
          lead.nombre || 'Lead',
          lead.id
        );
        
        if (!result.success) {
          throw new Error(result.error || 'Error desconocido');
        }
        
        successCount++;
        
        // Update progress
        currentIndex++;
        if (onProgress) {
          onProgress(currentIndex, totalLeads);
        }
        
        return { success: true, leadId: lead.id };
      } catch (error) {
        failedCount++;
        
        // Handle errors but don't stop the batch
        console.error(`Error initiating call for lead ${lead.id}:`, error);
        if (onError && error instanceof Error) {
          onError(error, lead.id);
        }
        
        // Update progress even for failures
        currentIndex++;
        if (onProgress) {
          onProgress(currentIndex, totalLeads);
        }
        
        return { success: false, leadId: lead.id, error };
      }
    });
    
    // Wait for all calls in this batch to complete
    await Promise.all(batchPromises);
    
    // If not the last batch, wait before processing the next batch
    if (batchIndex < totalBatches - 1) {
      console.log(`Batch ${batchIndex + 1}/${totalBatches} completed. Waiting for next batch...`);
      
      // Only show this toast on first batch
      if (batchIndex === 0) {
        toast.info(
          `Procesando llamadas por lotes: ${Math.min((batchIndex + 1) * BATCH_SIZE, totalLeads)}/${totalLeads}`, 
          {
            description: `Esperando 60 segundos para el siguiente lote de llamadas...`,
            duration: 5000
          }
        );
      }
      
      // Wait for the interval
      await new Promise(resolve => setTimeout(resolve, BATCH_INTERVAL));
    }
  }
  
  // Return final counts
  return { 
    success: successCount, 
    failed: failedCount 
  };
}
