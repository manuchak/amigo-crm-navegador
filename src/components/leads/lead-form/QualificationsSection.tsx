
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import VehicleSection from './VehicleSection';

const QualificationsSection = () => {
  const { control, watch } = useFormContext();
  const tieneVehiculo = watch('tieneVehiculo');
  
  const renderYesNoOption = (name: string, label: string) => (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-1">
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="SI" id={`${name}-si`} />
                <label htmlFor={`${name}-si`} className="text-sm cursor-pointer">Sí</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="NO" id={`${name}-no`} />
                <label htmlFor={`${name}-no`} className="text-sm cursor-pointer">No</label>
              </div>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Calificaciones</h3>
      
      <div className="space-y-4">
        {renderYesNoOption('experienciaSeguridad', '¿Tiene experiencia en seguridad?')}
        {renderYesNoOption('credencialSedena', '¿Tiene credencial SEDENA?')}
        {renderYesNoOption('esArmado', '¿Está armado?')}
        {renderYesNoOption('tieneVehiculo', '¿Cuenta con vehículo propio?')}
        
        <VehicleSection showVehicleDetails={tieneVehiculo === 'SI'} />
      </div>
    </div>
  );
};

export default QualificationsSection;
