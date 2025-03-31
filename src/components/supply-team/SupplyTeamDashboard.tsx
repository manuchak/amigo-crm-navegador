
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, FileCheck, Loader2, AlertCircle, RefreshCw, WebhookIcon, Database, Key } from 'lucide-react';
import { toast } from 'sonner';
import { Lead } from '@/context/LeadsContext';
import ValidationDialog from './ValidationDialog';
import { 
  executeWebhook, 
  fetchLeadsFromExternalDatabase,
  LEADS_WEBHOOK_URL,
  LEADS_WEBHOOK_NAME,
  LEADS_WEBHOOK_API_KEY
} from '../call-center/utils/webhook';
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
  const [webhookStatus, setWebhookStatus] = useState<string>('idle');
  const [showApiKey, setShowApiKey] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    setWebhookStatus('fetching');
    
    try {
      const responseData = await fetchLeadsFromExternalDatabase();
      console.log("Leads webhook data received:", responseData);
      
      if (typeof responseData === 'object' && responseData.message) {
        console.log("Received message from webhook:", responseData.message);
        toast.success(`Webhook status: ${responseData.message}`);
        
        setData(sampleData);
        setWebhookStatus('accepted');
      } else if (Array.isArray(responseData)) {
        const formattedData = responseData.map((item, index) => ({
          id: item.id || String(index + 1),
          nombre: item.nombre || item.name || "Sin nombre",
          empresa: item.empresa || item.company || "Sin empresa",
          telefono: item.telefono || item.phone || "Sin teléfono",
          email: item.email || "Sin email",
          estado: item.estado || item.status || "nuevo",
          fechaCreacion: item.fechaCreacion || item.createdAt || new Date().toISOString().split('T')[0],
          validado: item.validado || item.validated || "no",
          validadoPor: item.validadoPor || item.validatedBy,
          fechaValidacion: item.fechaValidacion || item.validationDate
        }));
        
        setData(formattedData);
        setError(null);
        setWebhookStatus('success');
        toast.success('Datos cargados correctamente desde webhook de Leads');
      } else {
        throw new Error("La respuesta del webhook no es un arreglo de datos");
      }
    } catch (error) {
      console.error("Error fetching data from leads webhook:", error);
      setData(sampleData);
      setError('Error al conectar con el webhook de Leads. Usando datos de ejemplo. Error: ' + (error instanceof Error ? error.message : 'Desconocido'));
      setWebhookStatus('error');
      toast.error('Error al cargar datos. Usando datos de ejemplo.');
    } finally {
      setIsLoading(false);
    }
  };

  const pingWebhook = async () => {
    setIsLoading(true);
    setWebhookStatus('pinging');
    
    try {
      const response = await fetch(LEADS_WEBHOOK_URL, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${LEADS_WEBHOOK_API_KEY}`
        },
        mode: 'no-cors',
        body: JSON.stringify({ 
          action: "ping", 
          source: "supply_dashboard",
          timestamp: new Date().toISOString(),
          api_key: LEADS_WEBHOOK_API_KEY
        })
      });
      
      toast.success('Ping enviado al webhook de Leads');
      setWebhookStatus('pinged');
      
      setTimeout(fetchData, 1500);
    } catch (error) {
      console.error("Error pinging webhook:", error);
      setError('Error al hacer ping al webhook: ' + (error instanceof Error ? error.message : 'Desconocido'));
      setWebhookStatus('error');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
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
      const newLead: Lead = {
        id: parseInt(selectedItem.id) || Date.now(),
        nombre: validatedData.nombre || selectedItem.nombre,
        empresa: validatedData.empresa || selectedItem.empresa,
        contacto: `${validatedData.email || selectedItem.email} | ${validatedData.telefono || selectedItem.telefono}`,
        estado: 'Validado por Suministros',
        fechaCreacion: new Date().toISOString().split('T')[0],
      };
      
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
        <p className="mt-4 text-muted-foreground">Cargando datos del webhook de Leads...</p>
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
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={fetchData} 
                  size="sm"
                  variant="outline"
                  disabled={webhookStatus === 'fetching'}
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${webhookStatus === 'fetching' ? 'animate-spin' : ''}`} />
                  Actualizar
                </Button>
                <Button 
                  onClick={pingWebhook} 
                  size="sm"
                  variant="outline"
                  disabled={webhookStatus === 'pinging'}
                >
                  <WebhookIcon className="h-4 w-4 mr-1" />
                  Ping Webhook
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        <div className="px-6 mb-4">
          <Alert variant="info">
            <Database className="h-4 w-4" />
            <AlertTitle>Webhook de Datos: {LEADS_WEBHOOK_NAME}</AlertTitle>
            <AlertDescription className="flex flex-col sm:flex-row items-start gap-2">
              <code className="text-xs bg-gray-100 p-2 rounded flex-1 overflow-auto">{LEADS_WEBHOOK_URL}</code>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(LEADS_WEBHOOK_URL);
                    toast.success("URL copiada al portapapeles");
                  }}
                >
                  Copiar URL
                </Button>
              </div>
            </AlertDescription>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">API Key:</span>
              </div>
              
              {showApiKey ? (
                <code className="text-xs bg-gray-100 p-2 rounded">{LEADS_WEBHOOK_API_KEY}</code>
              ) : (
                <code className="text-xs bg-gray-100 p-2 rounded">•••••••••••••••••••</code>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? "Ocultar" : "Mostrar"}
              </Button>
            </div>
          </Alert>
          
          {error && (
            <Alert variant="warning" className="mt-3">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Advertencia</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

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
