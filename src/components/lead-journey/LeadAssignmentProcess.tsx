
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  UserCheck, 
  Users, 
  PhoneCall, 
  ClipboardCheck, 
  UserMinus,
  Calendar,
  CheckCircle2,
  Filter
} from 'lucide-react';

export const LeadAssignmentProcess: React.FC = () => {
  return (
    <Card className="border shadow-sm bg-white">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-800">
          Proceso de Asignación de Candidatos
        </CardTitle>
        <CardDescription className="text-gray-500">
          Guía del proceso de asignación y manejo de candidatos en el equipo de Supply
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          <div className="rounded-lg border p-4 bg-slate-50">
            <h3 className="font-medium text-slate-900 flex items-center gap-2 mb-2">
              <UserCheck className="h-5 w-5 text-blue-500" />
              Roles en el Proceso
            </h3>
            <div className="ml-7 space-y-2">
              <p><span className="font-medium">Supply Admin:</span> Puede ver todos los candidatos y asignarlos a miembros del equipo de Supply.</p>
              <p><span className="font-medium">Supply:</span> Solo puede ver los candidatos que le han sido asignados por un Supply Admin.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border p-4">
              <h3 className="font-medium text-slate-900 flex items-center gap-2 mb-3">
                <Users className="h-5 w-5 text-indigo-500" />
                Proceso de Asignación
              </h3>
              <ol className="ml-7 space-y-3 list-decimal">
                <li>El <span className="font-medium">Supply Admin</span> puede ver todos los candidatos en el sistema.</li>
                <li>Selecciona un candidato y hace clic en el botón <span className="font-medium">Asignar</span>.</li>
                <li>Elige un miembro del equipo de Supply al cual asignar el candidato.</li>
                <li>El candidato aparecerá en la lista del miembro de Supply asignado.</li>
                <li>Si es necesario, el Supply Admin puede <span className="font-medium">Desasignar</span> candidatos.</li>
              </ol>
            </div>
            
            <div className="rounded-lg border p-4">
              <h3 className="font-medium text-slate-900 flex items-center gap-2 mb-3">
                <PhoneCall className="h-5 w-5 text-green-500" />
                Proceso de Contacto
              </h3>
              <ol className="ml-7 space-y-3 list-decimal">
                <li>El miembro de Supply ve los candidatos asignados en su lista personal.</li>
                <li>Utiliza el botón <span className="font-medium">Llamar</span> para contactar al candidato.</li>
                <li>Después de la llamada, <span className="font-medium">Clasifica</span> al candidato según sus características.</li>
                <li>Los candidatos clasificados pueden ser <span className="font-medium">Agendados</span> para entrevistas posteriores.</li>
              </ol>
            </div>
          </div>
          
          <div className="rounded-lg border p-4 bg-blue-50">
            <h3 className="font-medium text-blue-900 flex items-center gap-2 mb-3">
              <ClipboardCheck className="h-5 w-5 text-blue-600" />
              Flujo de Trabajo Completo
            </h3>
            <div className="relative">
              <div className="ml-7 border-l-2 border-blue-200 pl-6 pb-2 space-y-6">
                <div>
                  <div className="absolute -left-1 mt-1.5 rounded-full bg-blue-500 p-1">
                    <UserCheck className="h-4 w-4 text-white" />
                  </div>
                  <h4 className="font-medium text-blue-800">1. Asignación Inicial</h4>
                  <p className="text-blue-700 mt-1">Supply Admin asigna candidatos a miembros del equipo de Supply basado en carga de trabajo y especialidad.</p>
                </div>
                
                <div>
                  <div className="absolute -left-1 mt-1.5 rounded-full bg-blue-500 p-1">
                    <PhoneCall className="h-4 w-4 text-white" />
                  </div>
                  <h4 className="font-medium text-blue-800">2. Contacto Inicial</h4>
                  <p className="text-blue-700 mt-1">El miembro de Supply contacta al candidato y hace una evaluación inicial.</p>
                </div>
                
                <div>
                  <div className="absolute -left-1 mt-1.5 rounded-full bg-blue-500 p-1">
                    <Filter className="h-4 w-4 text-white" />
                  </div>
                  <h4 className="font-medium text-blue-800">3. Clasificación</h4>
                  <p className="text-blue-700 mt-1">Se clasifica al candidato como "Custodio Armado" o "Custodio con Vehículo".</p>
                </div>
                
                <div>
                  <div className="absolute -left-1 mt-1.5 rounded-full bg-blue-500 p-1">
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                  <h4 className="font-medium text-blue-800">4. Agendamiento</h4>
                  <p className="text-blue-700 mt-1">Se agenda una entrevista más detallada con el candidato.</p>
                </div>
                
                <div>
                  <div className="absolute -left-1 mt-1.5 rounded-full bg-blue-500 p-1">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  <h4 className="font-medium text-blue-800">5. Seguimiento</h4>
                  <p className="text-blue-700 mt-1">Se realiza seguimiento del proceso hasta la contratación o descarte.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg border border-amber-200 p-4 bg-amber-50">
            <h3 className="font-medium text-amber-900 flex items-center gap-2">
              <UserMinus className="h-5 w-5 text-amber-600" />
              Reasignación de Candidatos
            </h3>
            <p className="ml-7 text-amber-800 mt-2">
              Si un miembro del equipo de Supply no puede manejar todos sus candidatos asignados, o si se requiere una redistribución de carga, el Supply Admin puede desasignar candidatos y reasignarlos a otros miembros del equipo.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeadAssignmentProcess;
