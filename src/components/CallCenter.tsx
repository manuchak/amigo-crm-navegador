import { useState } from 'react';
import { Phone, PhoneCall, PhoneForwarded, PhoneOff, User, Calendar, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

// Tipos de datos para el Call Center
export interface CallRecord {
  id: number;
  leadId: number;
  nombreLead: string;
  fechaLlamada: string;
  horaLlamada: string;
  duracion: string;
  resultado: "Contactado" | "No contestó" | "Buzón de voz" | "Número equivocado" | "Programada";
  notas: string;
}

export interface CallCenterProps {
  leads: { id: number; nombre: string; empresa: string; contacto: string; estado: string; fechaCreacion: string }[];
  onUpdateLeadStatus: (leadId: number, newStatus: string) => void;
}

const CallCenter = ({ leads, onUpdateLeadStatus }: CallCenterProps) => {
  const [selectedLead, setSelectedLead] = useState<number | null>(null);
  const [callResult, setCallResult] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [callDuration, setCallDuration] = useState('00:00');
  const [isCallActive, setIsCallActive] = useState(false);
  const [callsForToday, setCallsForToday] = useState<CallRecord[]>([
    { 
      id: 1, 
      leadId: 1, 
      nombreLead: "Carlos Rodríguez", 
      fechaLlamada: "2023-10-15", 
      horaLlamada: "10:30", 
      duracion: "02:45", 
      resultado: "Contactado", 
      notas: "Cliente interesado en el servicio premium" 
    },
    {
      id: 2,
      leadId: 2,
      nombreLead: "María García",
      fechaLlamada: "2023-10-15",
      horaLlamada: "11:15",
      duracion: "01:30",
      resultado: "No contestó",
      notas: "Intentar llamar nuevamente mañana"
    },
  ]);
  
  // Calculamos algunas estadísticas
  const totalLeads = leads.length;
  const contactados = leads.filter(lead => lead.estado === "Contactado").length;
  const porcentajeContactados = totalLeads > 0 ? (contactados / totalLeads) * 100 : 0;
  
  const lead = leads.find(l => l.id === selectedLead);

  const handleStartCall = async () => {
    if (!selectedLead) {
      toast.error("Por favor selecciona un lead para llamar");
      return;
    }
    
    setIsCallActive(true);
    toast.success(`Iniciando llamada a ${lead?.nombre}`);
    
    // Execute webhook
    try {
      const webhookUrl = "https://hook.us2.make.com/nlckmsej5cwmfe93gv4g6xvmavhilujl";
      
      await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify({
          leadName: lead?.nombre,
          leadId: selectedLead,
          timestamp: new Date().toISOString(),
          action: "call_started"
        }),
      });
      
      console.log("Webhook executed successfully");
    } catch (error) {
      console.error("Error executing webhook:", error);
    }
  };

  const handleEndCall = () => {
    if (!callResult) {
      toast.error("Por favor selecciona un resultado para la llamada");
      return;
    }
    
    setIsCallActive(false);
    
    // Actualizar el estado del lead si fue contactado
    if (callResult === "Contactado") {
      onUpdateLeadStatus(selectedLead!, "Contactado");
    }
    
    // Guardar registro de llamada
    const fechaActual = new Date().toISOString().split('T')[0];
    const horaActual = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    
    const newCall: CallRecord = {
      id: callsForToday.length + 1,
      leadId: selectedLead!,
      nombreLead: lead?.nombre || "",
      fechaLlamada: fechaActual,
      horaLlamada: horaActual,
      duracion: callDuration,
      resultado: callResult as CallRecord["resultado"],
      notas: notes
    };
    
    setCallsForToday([...callsForToday, newCall]);
    
    // Resetear campos
    setCallResult('');
    setNotes('');
    setCallDuration('00:00');
    
    toast.success("Llamada registrada con éxito");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Panel de control principal */}
      <div className="lg:col-span-8 space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Control de Llamadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Selección de Lead */}
              <div className="space-y-4">
                <Label htmlFor="lead-selector">Seleccionar Lead</Label>
                <Select 
                  value={selectedLead?.toString() || ""} 
                  onValueChange={(value) => setSelectedLead(Number(value))}
                  disabled={isCallActive}
                >
                  <SelectTrigger id="lead-selector">
                    <SelectValue placeholder="Seleccionar lead para llamar" />
                  </SelectTrigger>
                  <SelectContent>
                    {leads.map(lead => (
                      <SelectItem key={lead.id} value={lead.id.toString()}>
                        {lead.nombre} - {lead.empresa}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {selectedLead && lead && (
                  <div className="mt-4 bg-secondary/50 p-4 rounded-md">
                    <div className="flex items-center gap-3 mb-2">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <span>{lead.nombre}</span>
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                      <PhoneCall className="h-5 w-5 text-muted-foreground" />
                      <span>{lead.contacto}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <span>{lead.fechaCreacion}</span>
                    </div>
                  </div>
                )}
                
                <div className="flex mt-4 space-x-3">
                  {!isCallActive ? (
                    <Button onClick={handleStartCall} disabled={!selectedLead} className="bg-green-500 hover:bg-green-600">
                      <Phone className="mr-2 h-4 w-4" />
                      Iniciar Llamada
                    </Button>
                  ) : (
                    <Button onClick={handleEndCall} variant="destructive">
                      <PhoneOff className="mr-2 h-4 w-4" />
                      Finalizar Llamada
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Resultado de la llamada */}
              <div className="space-y-4">
                <Label>Resultado de la llamada</Label>
                <RadioGroup 
                  disabled={!isCallActive}
                  value={callResult} 
                  onValueChange={setCallResult}
                  className="grid grid-cols-1 gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Contactado" id="contactado" />
                    <Label htmlFor="contactado" className="cursor-pointer">Contactado</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="No contestó" id="no-contesto" />
                    <Label htmlFor="no-contesto" className="cursor-pointer">No contestó</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Buzón de voz" id="buzon" />
                    <Label htmlFor="buzon" className="cursor-pointer">Buzón de voz</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Número equivocado" id="equivocado" />
                    <Label htmlFor="equivocado" className="cursor-pointer">Número equivocado</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Programada" id="programada" />
                    <Label htmlFor="programada" className="cursor-pointer">Programada</Label>
                  </div>
                </RadioGroup>
                
                <div className="mt-4">
                  <Label htmlFor="call-notes">Notas</Label>
                  <Input
                    id="call-notes"
                    placeholder="Agregar notas sobre la llamada"
                    disabled={!isCallActive}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Historial de llamadas */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Historial de Llamadas (Hoy)</CardTitle>
          </CardHeader>
          <CardContent>
            {callsForToday.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay llamadas registradas para hoy
              </div>
            ) : (
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="h-10 px-4 text-left font-medium">Lead</th>
                      <th className="h-10 px-4 text-left font-medium">Hora</th>
                      <th className="h-10 px-4 text-left font-medium">Duración</th>
                      <th className="h-10 px-4 text-left font-medium">Resultado</th>
                      <th className="h-10 px-4 text-left font-medium">Notas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {callsForToday.map((call, i) => (
                      <tr key={call.id} className={i % 2 === 0 ? "bg-white" : "bg-muted/20"}>
                        <td className="p-2 px-4">{call.nombreLead}</td>
                        <td className="p-2 px-4">{call.horaLlamada}</td>
                        <td className="p-2 px-4">{call.duracion}</td>
                        <td className="p-2 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            call.resultado === 'Contactado' ? 'bg-green-100 text-green-700' :
                            call.resultado === 'No contestó' ? 'bg-yellow-100 text-yellow-700' :
                            call.resultado === 'Buzón de voz' ? 'bg-blue-100 text-blue-700' :
                            call.resultado === 'Número equivocado' ? 'bg-red-100 text-red-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>
                            {call.resultado}
                          </span>
                        </td>
                        <td className="p-2 px-4 max-w-[200px] truncate">{call.notas}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Panel lateral de estadísticas */}
      <div className="lg:col-span-4 space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Estadísticas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">Leads contactados</span>
                <span className="text-sm font-medium">{contactados}/{totalLeads}</span>
              </div>
              <Progress value={porcentajeContactados} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">Llamadas de hoy</span>
                <span className="text-sm font-medium">{callsForToday.length}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-muted/30 p-3 rounded-md text-center">
                  <div className="font-medium text-2xl">
                    {callsForToday.filter(c => c.resultado === "Contactado").length}
                  </div>
                  <div className="text-xs text-muted-foreground">Contactados</div>
                </div>
                <div className="bg-muted/30 p-3 rounded-md text-center">
                  <div className="font-medium text-2xl">
                    {callsForToday.filter(c => c.resultado !== "Contactado").length}
                  </div>
                  <div className="text-xs text-muted-foreground">No contactados</div>
                </div>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Próximas llamadas programadas</h4>
              {callsForToday.filter(c => c.resultado === "Programada").length === 0 ? (
                <div className="text-sm text-muted-foreground">No hay llamadas programadas</div>
              ) : (
                <div className="space-y-2">
                  {callsForToday
                    .filter(c => c.resultado === "Programada")
                    .map(call => (
                      <div key={call.id} className="flex items-center justify-between bg-secondary/50 p-2 rounded-md">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-sm">{call.nombreLead}</span>
                        </div>
                        <Button size="sm" variant="ghost">
                          <PhoneForwarded className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CallCenter;
