
import React from 'react';
import { UserData } from '@/types/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';

interface UserAvatarProps {
  user: UserData;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ 
  user, 
  size = 'md' 
}) => {
  // Size classes
  const sizeMap = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };
  
  const iconSizeMap = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-8 w-8'
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };
  
  return (
    <Avatar className={`${sizeMap[size]}`}>
      {user.photoURL ? (
        <AvatarImage src={user.photoURL} alt={user.displayName} />
      ) : (
        <AvatarFallback className="bg-primary/10">
          {user.displayName ? 
            getInitials(user.displayName) : 
            <User className={`${iconSizeMap[size]} text-primary`} />
          }
        </AvatarFallback>
      )}
    </Avatar>
  );
};
