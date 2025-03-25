
import React from 'react';
import { CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface CustodioRequirementsHeaderProps {
  title: string;
  description: string;
  onAddNew: () => void;
}

const CustodioRequirementsHeader = React.memo(({
  title,
  description,
  onAddNew
}: CustodioRequirementsHeaderProps) => {
  return (
    <div className="flex flex-row justify-between items-start">
      <div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </div>
      <Button size="sm" onClick={onAddNew}>
        <Plus className="h-4 w-4 mr-2" />
        Nuevo Requisito
      </Button>
    </div>
  );
});

CustodioRequirementsHeader.displayName = 'CustodioRequirementsHeader';

export default CustodioRequirementsHeader;
