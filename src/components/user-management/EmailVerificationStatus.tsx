
import React from 'react';
import { UserCheck, UserX } from 'lucide-react';

interface EmailVerificationStatusProps {
  isVerified: boolean;
}

const EmailVerificationStatus: React.FC<EmailVerificationStatusProps> = ({ isVerified }) => {
  if (isVerified) {
    return (
      <div className="flex items-center">
        <UserCheck className="h-5 w-5 text-green-500 mr-1" />
        <span>Sí</span>
      </div>
    );
  }
  
  return (
    <div className="flex items-center">
      <UserX className="h-5 w-5 text-red-500 mr-1" />
      <span>No</span>
    </div>
  );
};

export default EmailVerificationStatus;
