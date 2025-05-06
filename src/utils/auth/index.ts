
// Import underlying implementations
import { loginUser, createUser, resetPassword, signOut } from './userManagement';
import { 
  updateUserRole, 
  verifyUserEmail, 
  setAsVerifiedOwner, 
  getAllUsers, 
  findUserByEmail 
} from './roleManagement';
import { getUsers, saveUsers, getCurrentUser, setCurrentUser } from './storage';

// Re-export all functions for use throughout the app
export {
  // User management functions
  loginUser,
  createUser,
  resetPassword,
  signOut,
  
  // Role management functions
  updateUserRole,
  verifyUserEmail,
  setAsVerifiedOwner,
  getAllUsers,
  findUserByEmail,
  
  // Storage functions
  getUsers,
  saveUsers,
  getCurrentUser,
  setCurrentUser
};
