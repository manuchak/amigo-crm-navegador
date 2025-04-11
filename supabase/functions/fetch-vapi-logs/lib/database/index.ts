
import { processAndStoreLogs } from './processLogs.ts';

/**
 * Database Operations
 */
export class DatabaseManager {
  /**
   * Process and store logs in the database
   */
  static async processAndStoreLogs(supabase, logs) {
    return processAndStoreLogs(supabase, logs);
  }
}
