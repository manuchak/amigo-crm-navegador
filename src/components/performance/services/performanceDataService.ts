
import * as XLSX from 'xlsx';
import { toast } from "sonner";

export async function fetchExcelData() {
  try {
    const response = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vRvhX-tD4plowwSiAPKu0rhd5VKgsuwWFNDFrGsG5BkBhcK0N3HEI-5_tOJKPxdfvlSo9FguDgPArjF/pub?output=xlsx');
    
    if (!response.ok) {
      throw new Error('Failed to fetch Google Sheets data');
    }

    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer);
    
    if (!workbook.SheetNames.length) {
      throw new Error('No sheets found in the Excel file');
    }

    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json(worksheet);

  } catch (error) {
    console.error("Error fetching Excel data:", error);
    toast.error("Error loading performance data");
    throw error;
  }
}
