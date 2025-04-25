
// Función para monitorear el uso de memoria en la función serverless

let memoryUsageIntervalId: number | null = null;
let memoryChecks = 0;

/**
 * Inicializa el monitoreo de uso de memoria con reportes periódicos
 * en el log del servidor
 */
export function initializeMemoryUsageMonitoring() {
  // Reportar uso inicial de memoria
  reportMemoryUsage("Inicio");
  memoryChecks = 0;
  
  // Limpiar monitoreo anterior si existe
  if (memoryUsageIntervalId !== null) {
    clearInterval(memoryUsageIntervalId);
    memoryUsageIntervalId = null;
  }
  
  // Configurar monitoreo periódico
  memoryUsageIntervalId = setInterval(() => {
    memoryChecks++;
    // Reducir frecuencia de logs para evitar sobrecarga
    if (memoryChecks % 3 === 0) {
      reportMemoryUsage("Monitoreo periódico");
    }
    
    // Verificar si es necesario forzar una recolección de basura
    if (isMemoryUsageAboveThreshold(0.7)) {
      console.warn("Uso de memoria alto detectado en monitoreo periódico, ejecutando GC forzado");
      forceGarbageCollection();
    }
  }, 15000); // Reportar cada 15 segundos (aumentado de 10 a 15)
  
  // Limpieza al finalizar
  addEventListener('beforeunload', () => {
    if (memoryUsageIntervalId !== null) {
      clearInterval(memoryUsageIntervalId);
      memoryUsageIntervalId = null;
    }
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
    
    // Calcular porcentaje de uso de heap
    const heapUsagePercent = Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100);
    
    console.log(
      `[Memoria ${context}] ` +
      `RSS: ${usedMemoryMB} MB | ` +
      `Heap: ${heapUsedMB}/${heapTotalMB} MB (${heapUsagePercent}%) | ` +
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
export function isMemoryUsageAboveThreshold(threshold: number = 0.80): boolean {
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
  
  try {
    // En Deno no tenemos acceso directo al GC pero podemos ayudar liberando referencias
    
    // 1. Recomendación para el GC
    if (globalThis.gc) {
      console.log("Ejecutando recolección de basura explícita");
      // @ts-ignore: La propiedad gc no está en los tipos de Deno pero puede existir
      globalThis.gc();
    }
    
    // 2. Forzar limpieza de caché interna
    // @ts-ignore: Intentar limpiar caché interna (específico de algunos entornos)
    if (globalThis.__memoryPressure) {
      // @ts-ignore
      globalThis.__memoryPressure();
    }
    
    // 3. Esperar un poco para dar tiempo al GC
    // Se usa un bucle intensivo para forzar que el motor JS considere hacer GC
    const dummy = new Array(10000);
    for (let i = 0; i < 10000; i++) {
      dummy[i] = new Array(100).fill(0);
      if (i % 1000 === 0) {
        await new Promise(r => setTimeout(r, 0));
        dummy.splice(0, 500); // Liberar parte del array
      }
    }
    
    // 4. Esperar un poco más
    await new Promise(resolve => setTimeout(resolve, 300));
  } catch (err) {
    console.error("Error durante la limpieza de memoria:", err);
  }
  
  const afterGC = reportMemoryUsage("Después de GC");
  
  if (beforeGC && afterGC) {
    const diffMB = Math.round((beforeGC.heapUsed - afterGC.heapUsed) / (1024 * 1024));
    if (diffMB > 0) {
      console.log(`Memoria liberada tras GC: ${diffMB} MB`);
    } else {
      console.log(`No se liberó memoria significativa tras GC`);
    }
  }
}
