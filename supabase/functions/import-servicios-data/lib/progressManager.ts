
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

export class ProgressManager {
  private supabase;
  private progressId: string | null;
  private lastUpdateTime: number;
  private updateThrottle: number; // ms mínimo entre actualizaciones

  constructor(supabaseUrl: string, supabaseKey: string, progressId: string | null) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.progressId = progressId;
    this.lastUpdateTime = 0;
    this.updateThrottle = 1000; // 1 segundo entre actualizaciones para evitar sobrecargar la BD
  }

  async updateProgress(
    status: 'validating' | 'importing' | 'completed' | 'completed_with_errors' | 'error',
    processed: number,
    total: number,
    message: string
  ): Promise<boolean> {
    if (!this.progressId) return false;
    
    const now = Date.now();
    // Limitar actualizaciones frecuentes excepto para completado y error
    if (status !== 'completed' && 
        status !== 'completed_with_errors' && 
        status !== 'error' &&
        now - this.lastUpdateTime < this.updateThrottle) {
      return true; // Omitir actualización para evitar sobrecargar la BD
    }
    
    this.lastUpdateTime = now;

    try {
      // IMPORTANTE: Asegurar que processed y total son números enteros positivos
      // Esto estaba causando errores en la inserción
      const processedInt = Math.max(0, Math.floor(Number(processed)));
      const totalInt = Math.max(1, Math.floor(Number(total)));
      
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
        console.error("Detalles:", { status, processed: processedInt, total: totalInt });
        return false;
      }
        
      return true;
    } catch (error) {
      console.error("Error grave actualizando progreso:", error);
      return false;
    }
  }
}
