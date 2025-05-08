
import React from 'react';

interface JourneyWorkflowProps {
  currentStage?: string;
}

export const JourneyWorkflow: React.FC<JourneyWorkflowProps> = ({ currentStage = 'interviews' }) => {
  const stages = [
    { id: 'interviews', name: 'Entrevistas Iniciales', color: 'blue' },
    { id: 'validation', name: 'Validación', color: 'indigo' },
    { id: 'documents', name: 'Documentación', color: 'purple' },
    { id: 'tests', name: 'Exámenes Psicométricos', color: 'pink' },
    { id: 'fieldtests', name: 'Pruebas de Campo', color: 'amber' },
    { id: 'hiring', name: 'Contratación', color: 'emerald' }
  ];
  
  const currentIndex = stages.findIndex(stage => stage.id === currentStage);
  
  return (
    <div className="w-full py-4">
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-1 bg-slate-200 z-0"></div>
        <div 
          className="absolute top-1/2 left-0 -translate-y-1/2 h-1 bg-blue-500 z-10 transition-all duration-500"
          style={{ 
            width: `${Math.max((currentIndex / (stages.length - 1)) * 100, 5)}%`,
            background: 'linear-gradient(to right, #3B82F6, #6366F1, #8B5CF6, #EC4899, #F59E0B, #10B981)'
          }}
        ></div>
        
        {/* Stage Indicators */}
        <div className="flex justify-between relative z-20">
          {stages.map((stage, index) => {
            const isPassed = index <= currentIndex;
            const isCurrent = index === currentIndex;
            
            let bgColor = 'bg-slate-200';
            let textColor = 'text-slate-500';
            let borderColor = 'border-slate-200';
            
            if (isPassed) {
              switch (stage.color) {
                case 'blue':
                  bgColor = 'bg-blue-500';
                  borderColor = 'border-blue-500';
                  textColor = 'text-blue-700';
                  break;
                case 'indigo':
                  bgColor = 'bg-indigo-500';
                  borderColor = 'border-indigo-500';
                  textColor = 'text-indigo-700';
                  break;
                case 'purple':
                  bgColor = 'bg-purple-500';
                  borderColor = 'border-purple-500';
                  textColor = 'text-purple-700';
                  break;
                case 'pink':
                  bgColor = 'bg-pink-500';
                  borderColor = 'border-pink-500';
                  textColor = 'text-pink-700';
                  break;
                case 'amber':
                  bgColor = 'bg-amber-500';
                  borderColor = 'border-amber-500';
                  textColor = 'text-amber-700';
                  break;
                case 'emerald':
                  bgColor = 'bg-emerald-500';
                  borderColor = 'border-emerald-500';
                  textColor = 'text-emerald-700';
                  break;
                default:
                  bgColor = 'bg-blue-500';
                  borderColor = 'border-blue-500';
                  textColor = 'text-blue-700';
              }
            }
            
            return (
              <div key={stage.id} className="flex flex-col items-center">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${bgColor} border-4 ${isPassed ? borderColor : 'border-slate-100'} shadow-sm ${isCurrent ? 'ring-4 ring-offset-2 ring-slate-100' : ''}`}
                >
                  <span className="text-xs font-bold text-white">
                    {index + 1}
                  </span>
                </div>
                <span className={`text-xs font-medium mt-2 ${isPassed ? textColor : 'text-slate-400'} max-w-[70px] text-center`}>
                  {stage.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
