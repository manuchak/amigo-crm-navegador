
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function useFormatDate() {
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return format(date, 'd MMM', { locale: es });
    } catch (e) {
      return dateStr;
    }
  };

  return { formatDate };
}
