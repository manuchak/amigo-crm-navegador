
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { CustodioMetrics } from "@/services/custodioKpiService";
import { format } from "date-fns";

// Define form schema for validation
const formSchema = z.object({
  month_year: z.string().optional(),
  staff_cost: z.coerce.number().min(0, "El costo no puede ser negativo"),
  asset_cost: z.coerce.number().min(0, "El costo no puede ser negativo"),
  marketing_cost: z.coerce.number().min(0, "El costo no puede ser negativo"),
  nps_promoters: z.coerce.number().min(0, "El valor no puede ser negativo"),
  nps_neutral: z.coerce.number().min(0, "El valor no puede ser negativo"),
  nps_detractors: z.coerce.number().min(0, "El valor no puede ser negativo"),
  acquisition_cost_manual: z.coerce.number().min(0, "El costo no puede ser negativo"),
  avg_onboarding_days: z.coerce.number().min(0, "El valor no puede ser negativo"),
  campaign_name: z.string().optional(),
  campaign_cost: z.coerce.number().min(0, "El costo no puede ser negativo"),
  campaign_revenue: z.coerce.number().min(0, "El valor no puede ser negativo"),
});

interface MetricsFormProps {
  metrics?: CustodioMetrics;
  onSave: (data: Partial<CustodioMetrics>) => void;
  isLoading: boolean;
}

export const MetricsForm: React.FC<MetricsFormProps> = ({
  metrics,
  onSave,
  isLoading,
}) => {
  // Set current month as default if no metrics passed
  const currentDate = new Date();
  const defaultMonthYear = format(currentDate, 'yyyy-MM-01');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      month_year: metrics?.month_year || defaultMonthYear,
      staff_cost: metrics?.staff_cost || 0,
      asset_cost: metrics?.asset_cost || 0,
      marketing_cost: metrics?.marketing_cost || 0,
      nps_promoters: metrics?.nps_promoters || 0,
      nps_neutral: metrics?.nps_neutral || 0,
      nps_detractors: metrics?.nps_detractors || 0,
      acquisition_cost_manual: metrics?.acquisition_cost_manual || 0,
      avg_onboarding_days: metrics?.avg_onboarding_days || 0,
      campaign_name: metrics?.campaign_name || '',
      campaign_cost: metrics?.campaign_cost || 0,
      campaign_revenue: metrics?.campaign_revenue || 0,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const formData = { ...values };
    if (metrics?.id) {
      formData.id = metrics.id;
    }
    onSave(formData);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="month_year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mes</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="acquisition_cost_manual"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Costo de adquisición (CAC)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="staff_cost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Costo de personal</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="asset_cost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Costo de activos</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="marketing_cost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Costo de marketing</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="avg_onboarding_days"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Promedio días de onboarding</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="border-t pt-4">
          <h3 className="text-lg font-medium mb-3">Métricas NPS</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="nps_promoters"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Promotores</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="nps_neutral"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Neutrales</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="nps_detractors"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detractores</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="border-t pt-4">
          <h3 className="text-lg font-medium mb-3">Campañas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="campaign_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de campaña</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="campaign_cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Costo de campaña</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="campaign_revenue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ingreso de campaña</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            "Guardar métricas"
          )}
        </Button>
      </form>
    </Form>
  );
};
