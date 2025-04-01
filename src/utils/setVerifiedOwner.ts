
import { findUserByEmail, setAsVerifiedOwner } from './localAuthStorage';

// This function can be called to set a specific user as verified owner
export const setSpecificUserAsVerifiedOwner = (email: string) => {
  try {
    const user = findUserByEmail(email);
    if (!user) {
      console.error(`User with email ${email} not found`);
      return false;
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
