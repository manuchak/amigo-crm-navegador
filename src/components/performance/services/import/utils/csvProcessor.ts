
export async function processCsvFile(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(header => header.trim());
        
        const data = lines.slice(1).filter(line => line.trim()).map(line => {
          const values = line.split(',').map(value => value.trim());
          const row: Record<string, any> = {};
          
          headers.forEach((header, index) => {
            row[header] = values[index];
          });
          
          return row;
        });
        
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
