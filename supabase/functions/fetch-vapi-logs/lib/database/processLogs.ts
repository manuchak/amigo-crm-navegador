
import { normalizeLogData } from './normalizeLogData.ts';

/**
 * Process and store logs in the database
 */
export async function processAndStoreLogs(supabase, logs) {
  let insertedCount = 0
  let updatedCount = 0
  let errorCount = 0

  if (!logs || logs.length === 0) {
    return { insertedCount, updatedCount, errorCount }
  }

  console.log(`Processing ${logs.length} logs from VAPI API`)

  for (const log of logs) {
    try {
      // Skip if log doesn't have an ID
      if (!log.id) {
        console.log('Skipping log without ID:', log)
        errorCount++
        continue
      }
      
      // Check if log already exists in the database
      const { data: existingLog, error: checkError } = await supabase
        .from('vapi_call_logs')
        .select('id')
        .eq('log_id', log.id)
        .maybeSingle()

      if (checkError) {
        console.error(`Error checking if log ${log.id} exists:`, checkError)
        errorCount++
        continue
      }

      // Prepare the log data with fallbacks for missing fields
      const logData = normalizeLogData(log)
      
      // Enhanced debug info for phone number and duration
      console.log(`Log ${log.id} - Phone data:`)
      console.log(`  - customer=${logData.customer_number}, type=${typeof logData.customer_number}`)
      console.log(`  - caller=${logData.caller_phone_number}, type=${typeof logData.caller_phone_number}`)
      console.log(`  - phone=${logData.phone_number}, type=${typeof logData.phone_number}`)
      console.log(`Log ${log.id} - Duration: ${logData.duration}, type=${typeof logData.duration}`)

      // Insert or update the log
      if (!existingLog) {
        // Insert new log
        const { error: insertError } = await supabase
          .from('vapi_call_logs')
          .insert([logData])

        if (insertError) {
          console.error(`Error inserting log ${log.id}:`, insertError)
          errorCount++
        } else {
          insertedCount++
        }
      } else {
        // Update existing log
        const { error: updateError } = await supabase
          .from('vapi_call_logs')
          .update(logData)
          .eq('log_id', log.id)

        if (updateError) {
          console.error(`Error updating log ${log.id}:`, updateError)
          errorCount++
        } else {
          updatedCount++
        }
      }
    } catch (err) {
      console.error(`Error processing log ${log?.id || 'unknown'}:`, err)
      errorCount++
    }
  }

  return { insertedCount, updatedCount, errorCount }
}
