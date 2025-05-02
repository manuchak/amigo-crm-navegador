
import React from 'react';
import { Prospect } from '@/services/prospectService';
import { Table, TableBody } from '@/components/ui/table';
import { ProspectsTableHeader, ProspectRow } from './table';
import { Card } from '@/components/ui/card';
import { TooltipProvider } from '@/components/ui/tooltip';

interface ProspectsTableProps {
  prospects: Prospect[];
  onViewDetails?: (prospect: Prospect) => void;
  onCall?: (prospect: Prospect) => void;
  onViewCalls?: (prospect: Prospect) => void;
  onValidate?: (prospect: Prospect) => void;
}

const ProspectsTable: React.FC<ProspectsTableProps> = ({
  prospects,
  onViewDetails,
  onCall,
  onViewCalls,
  onValidate
}) => {
  return (
    <TooltipProvider>
      <Card className="border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <ProspectsTableHeader />
            <TableBody>
              {prospects.map((prospect) => (
                <ProspectRow
                  key={`prospect-${prospect.lead_id}-${prospect.validated_lead_id}`}
                  prospect={prospect}
                  onViewDetails={onViewDetails}
                  onCall={onCall}
                  onViewCalls={onViewCalls}
                  onValidate={onValidate}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </TooltipProvider>
  );
};

export default ProspectsTable;
