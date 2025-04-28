
import { ImportResponse, ProgressCallback } from '../types';
import { importServiciosData } from './serviciosImportService';
import { importDriverBehaviorData } from '../../driverBehavior/driverBehaviorService';

type ImportType = 'servicios' | 'driver-behavior';

/**
 * Factory function to handle different types of imports
 */
export function importData(
  file: File,
  type: ImportType = 'servicios',
  onProgress?: ProgressCallback
): Promise<ImportResponse> {
  switch (type) {
    case 'driver-behavior':
      return importDriverBehaviorData(file, onProgress);
    case 'servicios':
    default:
      return importServiciosData(file, onProgress);
  }
}
