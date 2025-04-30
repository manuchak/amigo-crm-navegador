
import { z } from 'zod';

// Define the form schema for productivity parameters
export const productivityFormSchema = z.object({
  client: z.string().min(1, 'Cliente es requerido'),
  driver_group: z.string().optional(),
  expected_daily_distance: z.coerce.number().positive('Debe ser un número positivo'),
  expected_daily_time_minutes: z.coerce.number().int().positive('Debe ser un número entero positivo'),
  fuel_cost_per_liter: z.coerce.number().positive('Debe ser un número positivo'),
  expected_fuel_efficiency: z.coerce.number().positive('Debe ser un número positivo'),
});

export type ProductivityFormValues = z.infer<typeof productivityFormSchema>;

// Default values for the form
export const defaultFormValues: ProductivityFormValues = {
  client: '',
  driver_group: '',
  expected_daily_distance: 150,
  expected_daily_time_minutes: 480, // 8 hours
  fuel_cost_per_liter: 22.5,
  expected_fuel_efficiency: 10, // km per liter
};
