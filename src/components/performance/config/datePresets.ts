
import { subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

// Fecha actual
const today = new Date();

export const datePresets = [
  {
    label: 'Hoy',
    value: 'today',
    from: today,
    to: today
  },
  {
    label: 'Ayer',
    value: 'yesterday',
    from: subDays(today, 1),
    to: subDays(today, 1)
  },
  {
    label: 'Últimos 7 días',
    value: 'last7days',
    from: subDays(today, 6),
    to: today
  },
  {
    label: 'Últimos 30 días',
    value: 'last30days',
    from: subDays(today, 29),
    to: today
  },
  {
    label: 'Mes actual',
    value: 'thisMonth',
    from: startOfMonth(today),
    to: today
  },
  {
    label: 'Mes anterior',
    value: 'lastMonth',
    from: startOfMonth(subDays(startOfMonth(today), 1)),
    to: endOfMonth(subDays(startOfMonth(today), 1))
  },
  {
    label: 'Año actual',
    value: 'thisYear',
    from: startOfYear(today),
    to: today
  },
  {
    label: 'Año anterior',
    value: 'lastYear',
    from: startOfYear(subDays(startOfYear(today), 1)),
    to: endOfYear(subDays(startOfYear(today), 1))
  }
];
