
import { ImportResponse, ProgressCallback } from '../types';
import { importServiceData } from './serviciosImportService';
import { importDriverBehaviorData } from '../../driverBehavior/driverBehaviorService';

export const importData = async (
  file: File,
  importType: 'servicios' | 'driver-behavior',
  onProgress?: ProgressCallback
): Promise<ImportResponse> => {
  console.log(`Import requested for type: ${importType}`);
  
  if (importType === 'servicios') {
    return importServiceData(file, onProgress);
  } else if (importType === 'driver-behavior') {
    return importDriverBehaviorData(file, onProgress);
  } else {
    return {
      success: false,
      message: `Tipo de importación no soportado: ${importType}`,
      insertedCount: 0,
      totalCount: 0,
      errors: [{
        row: 0,
        message: `Tipo de importación no soportado: ${importType}`
      }]
    };
  }
};
