
import { toast } from 'sonner';

/**
 * Maps auth error messages to user-friendly Spanish error messages
 */
export const getAuthErrorMessage = (error: Error): string => {
  const message = error.message.toLowerCase();
  
  if (message.includes('invalid login')) {
    return 'Correo o contraseña incorrectos';
  } else if (message.includes('email')) {
    return 'El correo electrónico no es válido';
  } else if (message.includes('password')) {
    return 'La contraseña es incorrecta';
  } else if (message.includes('already')) {
    return 'El correo electrónico ya está en uso';
  }
  
  return 'Error al procesar la solicitud';
};

/**
 * Creates a timeout promise that will reject after the given time
 */
export const createTimeoutPromise = (timeoutMs: number = 30000): Promise<never> => {
  return new Promise((_, reject) => 
    setTimeout(() => reject(new Error('La conexión tardó demasiado tiempo, por favor inténtelo de nuevo')), timeoutMs)
  );
};

/**
 * Handle and log auth errors
 */
export const handleAuthError = (error: any, defaultMessage: string = 'Error en la autenticación'): void => {
  const errorMessage = error?.message || defaultMessage;
  console.error(defaultMessage, error);
  toast.error(errorMessage);
};
