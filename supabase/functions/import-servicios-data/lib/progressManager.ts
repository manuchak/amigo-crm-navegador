
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

export class ProgressManager {
  private supabase;
  private progressId: string | null;

  constructor(supabaseUrl: string, supabaseKey: string, progressId: string | null) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.progressId = progressId;
  }

  async updateProgress(
    status: 'validating' | 'importing' | 'completed' | 'completed_with_errors' | 'error',
    processed: number,
    total: number,
    message: string
  ): Promise<boolean> {
    if (!this.progressId) return false;

    try {
      console.log(`Actualizando progreso: ${this.progressId} - ${status} - ${processed}/${total} - ${message}`);
      
      await this.supabase
        .from('import_progress')
        .upsert({
          id: this.progressId,
          status,
          processed,
          total,
          message,
          updated_at: new Date().toISOString()
        });
        
      return true;
    } catch (error) {
      console.error("Error actualizando progreso:", error);
      return false;
    }
  }
}
