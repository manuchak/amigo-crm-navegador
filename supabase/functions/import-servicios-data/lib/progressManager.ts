
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
      // IMPORTANTE: Asegurar que processed y total son números enteros positivos válidos
      let processedInt = 0;
      let totalInt = 1;
      
      try {
        processedInt = Math.max(0, Math.floor(Number(processed)));
        totalInt = Math.max(1, Math.floor(Number(total)));
      } catch (parseError) {
        console.error("Error convirtiendo processed/total a enteros:", parseError);
        processedInt = 0;
        totalInt = 1;
      }
      
      if (isNaN(processedInt) || isNaN(totalInt)) {
        console.error("Valores inválidos detectados:", { processed, total });
        processedInt = 0;
        totalInt = 1;
      }
      
      console.log(`Actualizando progreso: ${this.progressId} - ${status} - ${processedInt}/${totalInt} - ${message}`);
      
      try {
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
          
          // Intentar insertar si es que el registro no existe
          if (error.code === "23505") { // Código de violación de restricción única
            try {
              const { error: insertError } = await this.supabase
                .from('import_progress')
                .insert({
                  id: this.progressId,
                  status,
                  processed: processedInt,
                  total: totalInt,
                  message,
                  updated_at: new Date().toISOString()
                });
                
              if (insertError) {
                console.error("Error en inserción de progreso tras fallo de upsert:", insertError);
                return false;
              }
              return true;
            } catch (innerError) {
              console.error("Error en segundo intento de actualización:", innerError);
              return false;
            }
          }
          
          return false;
        }
          
        return true;
      } catch (dbError) {
        console.error("Error en operación de base de datos:", dbError);
        return false;
      }
    } catch (error) {
      console.error("Error grave actualizando progreso:", error);
      return false;
    }
  }
}
