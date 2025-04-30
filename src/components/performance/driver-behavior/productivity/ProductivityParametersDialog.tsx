
import React from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useProductivityParameters } from './hooks/useProductivityParameters';
import { 
  ClientSelection, 
  DriverGroupSelection, 
  ProductivityMetricsFields 
} from './components';

interface ProductivityParametersDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
  selectedClient?: string;
  availableGroups?: string[];
  clientList?: string[];
}

export function ProductivityParametersDialog({ 
  open, 
  onClose, 
  onSaved,
  selectedClient,
  availableGroups = [],
  clientList = []
}: ProductivityParametersDialogProps) {
  
  const {
    form,
    clientGroups,
    isLoadingGroups,
    onSubmit,
    fetchLatestFuelPrice
  } = useProductivityParameters({
    selectedClient,
    onSaved,
    onClose
  });
  
  // Get active groups - use clientGroups from query if available, otherwise fall back to props
  const activeGroups = clientGroups.length > 0 ? clientGroups : availableGroups;
  const currentClient = form.watch('client');
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] p-6 bg-white">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-center text-xl font-semibold">
            Configurar Parámetros de Productividad
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6">
              <div className="grid grid-cols-1 gap-4">
                <ClientSelection form={form} clientList={clientList} />
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <DriverGroupSelection 
                  form={form} 
                  groups={activeGroups} 
                  isLoading={isLoadingGroups} 
                  currentClient={currentClient} 
                />
              </div>
              
              <ProductivityMetricsFields 
                form={form} 
                onFetchFuelPrice={fetchLatestFuelPrice} 
              />
            </div>
            
            <DialogFooter className="flex justify-end gap-2 pt-2 mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="bg-white"
              >
                Cancelar
              </Button>
              <Button type="submit">
                Guardar Parámetros
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
