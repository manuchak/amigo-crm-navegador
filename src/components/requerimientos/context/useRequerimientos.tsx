
import { useContext } from 'react';
import { RequerimientosContext } from './RequerimientosProvider';

// Hook personalizado para usar el contexto
export const useRequerimientos = () => {
  const context = useContext(RequerimientosContext);
  if (context === undefined) {
    throw new Error('useRequerimientos debe ser usado dentro de un RequerimientosProvider');
  }
  return context;
};
