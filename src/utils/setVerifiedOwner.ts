
import { findUserByEmail, setAsVerifiedOwner, createUser } from './localAuthStorage';
import { toast } from 'sonner';

// This function can be called to set a specific user as verified owner
export const setSpecificUserAsVerifiedOwner = (email: string) => {
  try {
    let user = findUserByEmail(email);
    
    // If user doesn't exist, create it first
    if (!user) {
      console.log(`User with email ${email} not found, creating account...`);
      const password = 'Custodios2024'; 
      user = createUser(email, password, `Admin ${email.split('@')[0]}`);
      console.log(`User account created for ${email}`);
    }
    
    setAsVerifiedOwner(user.uid);
    console.log(`User ${email} has been set as verified owner successfully`);
    return true;
  } catch (error) {
    console.error('Error setting user as verified owner:', error);
    return false;
  }
};

// Set Manuel Chacon as a verified owner
setSpecificUserAsVerifiedOwner('manuel.chacon@detectasecurity.io');
