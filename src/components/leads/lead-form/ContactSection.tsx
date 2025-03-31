
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Mail, Phone } from 'lucide-react';

const ContactSection = () => {
  const { control } = useFormContext();
  
  return (
    <div className="space-y-4 md:col-span-2">
      <h3 className="text-lg font-medium">Información de contacto</h3>
      
      <FormField
        control={control}
        name="nombre"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre completo</FormLabel>
            <FormControl>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input className="pl-9" placeholder="Nombre y apellidos" {...field} />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Correo electrónico</FormLabel>
            <FormControl>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input className="pl-9" type="email" placeholder="correo@ejemplo.com" {...field} />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="grid grid-cols-4 gap-4">
        <FormField
          control={control}
          name="prefijo"
          render={({ field }) => (
            <FormItem className="col-span-1">
              <FormLabel>Prefijo</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Prefijo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="+52">+52 (México)</SelectItem>
                  <SelectItem value="+1">+1 (USA/Canadá)</SelectItem>
                  <SelectItem value="+34">+34 (España)</SelectItem>
                  <SelectItem value="+57">+57 (Colombia)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="telefono"
          render={({ field }) => (
            <FormItem className="col-span-3">
              <FormLabel>Número telefónico</FormLabel>
              <FormControl>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input className="pl-9" placeholder="10 dígitos" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default ContactSection;
