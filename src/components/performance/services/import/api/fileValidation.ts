
import { validateFile } from "../../../../../../supabase/functions/import-servicios-data/lib/fileValidator";

export { validateFile };

export function isLargeFile(file: File): boolean {
  const LARGE_FILE_SIZE_MB = 5;
  const largeFileSizeBytes = LARGE_FILE_SIZE_MB * 1024 * 1024;
  
  return file.size > largeFileSizeBytes;
}
