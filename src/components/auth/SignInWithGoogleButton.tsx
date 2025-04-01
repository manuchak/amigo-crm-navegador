
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Google } from 'lucide-react';

const SignInWithGoogleButton: React.FC = () => {
  const { signInWithGoogle } = useAuth();
  
  return (
    <Button 
      onClick={signInWithGoogle} 
      variant="outline" 
      className="w-full flex items-center gap-2"
    >
      <Google className="h-5 w-5" />
      <span>Iniciar sesión con Google</span>
    </Button>
  );
};

export default SignInWithGoogleButton;
