
import { createContext } from 'react';
import { AuthContextProps } from '@/types/auth';
import { AuthProvider, useAuth } from './auth';

// Create the context with default undefined value
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Export everything needed
export { AuthProvider, useAuth };
export default AuthContext;
