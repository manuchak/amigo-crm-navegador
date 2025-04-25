
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
      // Asegurar que processed y total son números enteros positivos
      const processedInt = Math.max(0, Math.floor(processed));
      const totalInt = Math.max(1, Math.floor(total));
      
      console.log(`Actualizando progreso: ${this.progressId} - ${status} - ${processedInt}/${totalInt} - ${message}`);
      
      const { error } = await this.supabase
        .from('import_progress')
        .upsert({
          id: this.progressId,
          status,
          processed: processedInt,
          total: totalInt,
          message,
          updated_at: new Date().toISOString()
        });
        
      if (error) {
        console.error("Error en actualización de progreso:", error);
        return false;
      }
        
      return true;
    } catch (error) {
      console.error("Error grave actualizando progreso:", error);
      return false;
    }
  }
}
