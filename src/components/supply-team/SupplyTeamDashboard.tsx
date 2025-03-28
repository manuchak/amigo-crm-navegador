
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, FileCheck, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Lead } from '@/context/LeadsContext';
import ValidationDialog from './ValidationDialog';
import { executeWebhook } from '../call-center/utils/webhook';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface SheetData {
  id: string;
  nombre: string;
  empresa: string;
  telefono: string;
  email: string;
  estado: string;
  fechaCreacion: string;
  validado: string;
  validadoPor?: string;
  fechaValidacion?: string;
}

// Sample data to use as fallback when API fails
const sampleData: SheetData[] = [
  {
    id: "1",
    nombre: "Juan Pérez",
    empresa: "ABC Company",
    telefono: "555-1234",
    email: "juan@example.com",
    estado: "nuevo",
    fechaCreacion: "2023-05-15",
    validado: "no"
  },
  {
    id: "2",
    nombre: "María López",
    empresa: "XYZ Industries",
    telefono: "555-5678",
    email: "maria@example.com",
    estado: "pendiente",
    fechaCreacion: "2023-05-16",
    validado: "no"
  },
  {
    id: "3",
    nombre: "Carlos Gómez",
    empresa: "Tech Solutions",
    telefono: "555-9012",
    email: "carlos@example.com",
    estado: "validado",
    fechaCreacion: "2023-05-14",
    validado: "si",
    validadoPor: "Ana",
    fechaValidacion: "2023-05-17"
  }
];

const SupplyTeamDashboard: React.FC = () => {
  const [data, setData] = useState<SheetData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<SheetData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [operatorName, setOperatorName] = useState(() => {
    return localStorage.getItem('supplyOperatorName') || '';
  });

  // Alternative Google Sheets URLs to try
  const sheetUrls = [
    // Original URL
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vQGlBVy3s8JH7QNsnf9vRs8urGbuGT0CtPzw4tmJV5O0wW5DkI3adBxUr_HK-ON3WfUPZHTOhuv_qUT/pub?output=csv',
    // Simplified URL format (in case the original one is too complex for proxies)
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vQGlBVy3s8JH7QNsnf9vRs8urGbuGT0CtPzw4tmJV5O0wW5DkI3adBxUr_HK-ON3WfUPZHTOhuv_qUT/pub?gid=0&single=true&output=csv'
  ];
  
  // CORS proxies to try
  const corsProxies = [
    'https://corsproxy.io/?',
    'https://api.allorigins.win/raw?url='
  ];

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    let success = false;
    
    // Try different combinations of URLs and proxies
    for (const sheetUrl of sheetUrls) {
      for (const proxyUrl of corsProxies) {
        if (success) continue; // Skip if we already have data
        
        const fullUrl = `${proxyUrl}${encodeURIComponent(sheetUrl)}`;
        
        try {
          console.log("Fetching data from:", fullUrl);
          const response = await fetch(fullUrl, {
            headers: {
              'Accept': 'text/csv,text/plain,*/*'
            }
          });
          
          if (!response.ok) {
            console.log(`HTTP error with ${proxyUrl}: Status: ${response.status}`);
            continue; // Try next proxy
          }
          
          const csvText = await response.text();
          console.log("CSV data received length:", csvText.length);
          
          if (csvText.includes('No se pudo abrir el archivo') || csvText.length < 50) {
            console.log("Invalid CSV response, trying next URL/proxy");
            continue;
          }
          
          const rows = csvText.split('\n');
          if (rows.length <= 1) {
            console.log("No data rows found in CSV");
            continue;
          }
          
          const headers = rows[0].split(',');
          console.log("CSV headers:", headers);
          
          const parsedData = rows.slice(1).map((row, index) => {
            const values = row.split(',');
            const item: any = {};
            
            headers.forEach((header, idx) => {
              const cleanHeader = header.trim().toLowerCase().replace(/\s+/g, '');
              item[cleanHeader] = values[idx]?.trim() || '';
            });
            
            item.id = item.id || String(index + 1);
            return item as SheetData;
          });
          
          setData(parsedData);
          success = true;
          break; // Exit loop if successful
        } catch (error) {
          console.error(`Error fetching CSV data with ${proxyUrl}:`, error);
          // Continue to next proxy
        }
      }
      
      if (success) break; // Exit outer loop if successful
    }
    
    if (!success) {
      // All attempts failed, use sample data as fallback
      console.log("All fetch attempts failed, using sample data");
      setData(sampleData);
      setError('No se pudo acceder a Google Sheets. Verifica que la hoja esté publicada y compartida con acceso público. Usando datos de ejemplo.');
      toast.error('Error al cargar datos. Usando datos de ejemplo.');
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Save operator name to localStorage
    if (operatorName) {
      localStorage.setItem('supplyOperatorName', operatorName);
    }
  }, [operatorName]);

  const handleValidationCall = (item: SheetData) => {
    if (!operatorName) {
      toast.error('Por favor, ingresa tu nombre como operador antes de validar');
      return;
    }
    
    setSelectedItem(item);
    setDialogOpen(true);
  };

  const handleConfirmValidation = async (validatedData: any) => {
    if (!selectedItem) return;
    
    try {
      // Create a new Lead entry from the validated data
      const newLead: Lead = {
        id: parseInt(selectedItem.id) || Date.now(),
        nombre: validatedData.nombre || selectedItem.nombre,
        empresa: validatedData.empresa || selectedItem.empresa,
        contacto: `${validatedData.email || selectedItem.email} | ${validatedData.telefono || selectedItem.telefono}`,
        estado: 'Validado por Suministros',
        fechaCreacion: new Date().toISOString().split('T')[0],
      };
      
      // Call webhook with validation data
      await executeWebhook({
        telefono: validatedData.telefono || selectedItem.telefono,
        leadId: newLead.id,
        nombre: newLead.nombre,
        empresa: newLead.empresa,
        action: "supply_team_validation",
        timestamp: new Date().toISOString(),
        validadoPor: operatorName,
        datosOriginales: { ...selectedItem },
        datosValidados: { ...validatedData }
      });
      
      // Update local state
      setData(prev => prev.map(item => 
        item.id === selectedItem.id 
          ? { 
              ...item, 
              validado: 'SI', 
              validadoPor: operatorName,
              fechaValidacion: new Date().toISOString().split('T')[0] 
            } 
          : item
      ));
      
      toast.success(`Lead ${selectedItem.nombre} validado correctamente`);
      setDialogOpen(false);
    } catch (error) {
      console.error('Error validating lead:', error);
      toast.error('Error al validar el lead');
    }
  };

  const getStatusBadge = (status: string | undefined) => {
    if (!status) {
      return <Badge variant="secondary">Pendiente</Badge>;
    }
    
    switch (status.toLowerCase()) {
      case 'nuevo':
        return <Badge variant="default">Nuevo</Badge>;
      case 'validado':
      case 'si':
        return <Badge variant="success" className="bg-green-500">Validado</Badge>;
      case 'pendiente':
        return <Badge variant="outline">Pendiente</Badge>;
      case 'rechazado':
      case 'no':
        return <Badge variant="destructive">Rechazado</Badge>;
      default:
        return <Badge variant="secondary">Pendiente</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <CardTitle>Dashboard de Suministros</CardTitle>
              <CardDescription>Validación de leads generados por formulario</CardDescription>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Tu nombre (Operador)"
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  className="px-3 py-1 border rounded text-sm"
                />
                <Button 
                  onClick={() => toast.success('Nombre guardado')} 
                  variant="outline" 
                  size="sm"
                  disabled={!operatorName}
                >
                  Guardar
                </Button>
              </div>
              <Button 
                onClick={fetchData} 
                size="sm"
                variant="outline"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Actualizar
              </Button>
            </div>
          </div>
        </CardHeader>
        {error && (
          <div className="px-6 mb-4">
            <Alert variant="warning">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Advertencia</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-100">
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha Registro</TableHead>
                  <TableHead>Validado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-400">
                      No hay datos disponibles
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((item) => (
                    <TableRow key={item.id} className="hover:bg-gray-50">
                      <TableCell>{item.id}</TableCell>
                      <TableCell className="font-medium">{item.nombre}</TableCell>
                      <TableCell>{item.empresa}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span>{item.email}</span>
                          <span>{item.telefono}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(item.estado)}</TableCell>
                      <TableCell>{item.fechaCreacion}</TableCell>
                      <TableCell>
                        {item.validado && item.validado.toLowerCase() === 'si' 
                          ? <div className="flex flex-col gap-1">
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <FileCheck className="h-3 w-3 mr-1" /> 
                                Validado
                              </Badge>
                              <span className="text-xs text-gray-500">Por: {item.validadoPor}</span>
                              {item.fechaValidacion && <span className="text-xs text-gray-500">{item.fechaValidacion}</span>}
                            </div>
                          : <Badge variant="outline">Pendiente</Badge>
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          disabled={item.validado && item.validado.toLowerCase() === 'si'}
                          onClick={() => handleValidationCall(item)}
                        >
                          <Phone className="h-4 w-4 mr-1" />
                          Validar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {dialogOpen && selectedItem && (
        <ValidationDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          data={selectedItem}
          operatorName={operatorName}
          onConfirm={handleConfirmValidation}
        />
      )}
    </div>
  );
};

export default SupplyTeamDashboard;
