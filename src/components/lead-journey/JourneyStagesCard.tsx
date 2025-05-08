
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Stage {
  name: string;
  description: string;
  path: string;
}

interface JourneyStagesCardProps {
  stages: Stage[];
}

export const JourneyStagesCard: React.FC<JourneyStagesCardProps> = ({ stages }) => {
  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Etapas del Proceso</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {stages.map((stage, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium">{stage.name}</h3>
              <p className="text-sm text-gray-500">{stage.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
