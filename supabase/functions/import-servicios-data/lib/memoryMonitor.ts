
// Función para monitorear el uso de memoria en la función serverless

/**
 * Inicializa el monitoreo de uso de memoria con reportes periódicos
 * en el log del servidor
 */
export function initializeMemoryUsageMonitoring() {
  // Reportar uso inicial de memoria
  reportMemoryUsage("Inicio");
  
  // Configurar monitoreo periódico
  const intervalId = setInterval(() => {
    reportMemoryUsage("Monitoreo periódico");
  }, 10000); // Reportar cada 10 segundos
  
  // Limpieza al finalizar
  addEventListener('beforeunload', () => {
    clearInterval(intervalId);
    reportMemoryUsage("Finalización");
  });
}

/**
 * Obtiene y reporta el uso actual de memoria
 * @param context Contexto del reporte para identificarlo en los logs
 */
export function reportMemoryUsage(context: string) {
  try {
    // En Deno podemos acceder a las estadísticas de memoria
    const memoryUsage = Deno.memoryUsage();
    
    const usedMemoryMB = Math.round(memoryUsage.rss / (1024 * 1024));
    const heapTotalMB = Math.round(memoryUsage.heapTotal / (1024 * 1024));
    const heapUsedMB = Math.round(memoryUsage.heapUsed / (1024 * 1024));
    const externalMB = Math.round(memoryUsage.external / (1024 * 1024));
    
    console.log(
      `[Memoria ${context}] ` +
      `RSS: ${usedMemoryMB} MB | ` +
      `Heap Total: ${heapTotalMB} MB | ` + 
      `Heap Usado: ${heapUsedMB} MB | ` +
      `Externo: ${externalMB} MB`
    );
    
    return {
      rss: memoryUsage.rss,
      heapTotal: memoryUsage.heapTotal,
      heapUsed: memoryUsage.heapUsed,
      external: memoryUsage.external,
    };
  } catch (error) {
    console.error("Error al reportar memoria:", error);
    return null;
  }
}

/**
 * Comprueba si el uso de memoria ha superado el umbral especificado
 * @param threshold Umbral de uso (0.0 a 1.0, donde 1.0 es 100%)
 * @returns true si el uso de memoria está por encima del umbral
 */
export function isMemoryUsageAboveThreshold(threshold: number = 0.85): boolean {
  try {
    const memoryUsage = Deno.memoryUsage();
    // En Deno, no hay un límite claro como en Node.js, pero podemos usar heapUsed/heapTotal
    const ratio = memoryUsage.heapUsed / memoryUsage.heapTotal;
    
    if (ratio > threshold) {
      console.warn(`[Alerta de Memoria] Uso de memoria por encima del umbral: ${Math.round(ratio * 100)}%`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error al verificar umbral de memoria:", error);
    return false; // Por defecto, asumimos que estamos bien
  }
}

/**
 * Fuerza la ejecución del recolector de basura si está disponible
 * y reporta el uso de memoria antes y después
 */
export async function forceGarbageCollection(): Promise<void> {
  const beforeGC = reportMemoryUsage("Antes de GC");
  
  // Intentar forzar la recolección de basura
  // En Deno esto no es directamente accesible como en Node.js
  // Pero podemos ayudar al GC liberando referencias
  
  // Esperar un poco para dar tiempo al GC
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const afterGC = reportMemoryUsage("Después de GC");
  
  if (beforeGC && afterGC) {
    const diffMB = Math.round((beforeGC.heapUsed - afterGC.heapUsed) / (1024 * 1024));
    console.log(`Memoria potencialmente liberada: ${diffMB} MB`);
  }
}
