
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { knownNumericColumns, knownBooleanColumns } from "../import/lib/columnMapping";
import { createHeaderRow, createDescriptionRow, createExampleRow, createInstructionsRows } from "./templateUtils";

// Generate the complete CSV template content
export function generateCsvTemplate(): string {
  const headerRow = createHeaderRow();
  const descriptionRow = createDescriptionRow();
  const exampleRow = createExampleRow();
  const instructions = createInstructionsRows();
  
  // Combine all parts of the CSV
  return `${instructions}\n${headerRow}\n${descriptionRow}\n${exampleRow}`;
}

// Generate an Excel-compatible CSV file with BOM to ensure proper character encoding
export function generateCsvTemplateWithBOM(): string {
  const BOM = '\uFEFF'; // Byte Order Mark for Excel compatibility
  return BOM + generateCsvTemplate();
}

// Helper function to download the CSV template
export function downloadCsvTemplate(): void {
  const csvContent = generateCsvTemplateWithBOM();
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  // Set download attributes
  const date = format(new Date(), 'yyyyMMdd', { locale: es });
  link.download = `plantilla_servicios_custodia_${date}.csv`;
  link.href = url;
  link.style.display = 'none';
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}

// Re-export columns arrays for backward compatibility and template validation
export { knownNumericColumns, knownBooleanColumns };
export { templateColumns } from './columnDefinitions';
