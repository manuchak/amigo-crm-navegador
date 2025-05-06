
import { createContext } from 'react';
import { AuthContextProps } from '@/types/auth';

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export default AuthContext;
