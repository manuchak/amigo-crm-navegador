
import React, { useState } from 'react';
import { useLeads } from '@/context/LeadsContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Check, X, Search, UserCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';

const QualifiedLeadsApproval = () => {
  const { leads, updateLeadStatus } = useLeads();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter only qualified leads
  const qualifiedLeads = leads.filter(lead => lead.estado === 'Calificado');
  
  // Apply search filter if any
  const filteredLeads = qualifiedLeads.filter(lead => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      lead.nombre.toLowerCase().includes(searchLower) || 
      lead.empresa.toLowerCase().includes(searchLower) ||
      lead.contacto.toLowerCase().includes(searchLower)
    );
  });

  const handleApprove = (leadId: number) => {
    updateLeadStatus(leadId, 'Aprobado');
    toast.success('Lead aprobado correctamente');
  };

  const handleReject = (leadId: number) => {
    updateLeadStatus(leadId, 'Rechazado');
    toast.error('Lead rechazado');
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <CardTitle className="flex items-center">
                <UserCheck className="mr-2 h-5 w-5 text-blue-600" />
                Aprobación de Custodios Calificados
              </CardTitle>
              <CardDescription>
                Revisión final y aprobación de custodios calificados
              </CardDescription>
            </div>
            
            <div className="relative mt-4 md:mt-0 w-full md:w-64">
              <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar custodios..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredLeads.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <UserCheck className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-4 text-lg">No hay custodios calificados pendientes de aprobación</p>
              <p className="text-sm text-muted-foreground">
                Los custodios calificados aparecerán aquí para su revisión final
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Nombre</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Fecha Calificación</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow key={lead.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{lead.nombre}</TableCell>
                    <TableCell>
                      {lead.empresa}
                      {lead.empresa.includes("armado") && (
                        <Badge variant="destructive" className="ml-2">Armado</Badge>
                      )}
                      {lead.empresa.includes("vehículo") && (
                        <Badge variant="secondary" className="ml-2">Vehículo</Badge>
                      )}
                    </TableCell>
                    <TableCell>{lead.contacto}</TableCell>
                    <TableCell>{lead.fechaCreacion}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          onClick={() => handleApprove(lead.id)} 
                          variant="outline" 
                          size="sm"
                          className="bg-green-50 text-green-600 hover:bg-green-100 border-green-200"
                        >
                          <Check className="mr-1 h-4 w-4" />
                          Aprobar
                        </Button>
                        <Button 
                          onClick={() => handleReject(lead.id)} 
                          variant="outline" 
                          size="sm"
                          className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                        >
                          <X className="mr-1 h-4 w-4" />
                          Rechazar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QualifiedLeadsApproval;
