
// Direct re-export from AuthContext
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { AuthContextProps } from '@/types/auth';

// Re-export with consistent naming 
export { AuthProvider, useAuth };
export type { AuthContextProps };
