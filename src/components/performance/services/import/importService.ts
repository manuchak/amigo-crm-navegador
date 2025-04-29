
/**
 * @deprecated This file is kept for backward compatibility.
 * Please import from the specific service files directly.
 */

import { importServiciosData } from './services/serviciosImportService';
import { importData } from './services/importFactory';
import { validateFile, isLargeFile } from './api/fileValidation';

// Re-export for backward compatibility
export { importServiciosData, importData, validateFile, isLargeFile };

