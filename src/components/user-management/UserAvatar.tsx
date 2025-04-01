
import React from 'react';

interface UserAvatarProps {
  photoURL?: string;
  displayName?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ photoURL, displayName }) => {
  return (
    <div className="flex items-center gap-2">
      {photoURL ? (
        <img
          src={photoURL}
          alt={displayName || 'Usuario'}
          className="w-8 h-8 rounded-full"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-xs font-semibold">
            {displayName?.substring(0, 2).toUpperCase() || 'U'}
          </span>
        </div>
      )}
      <span>{displayName || 'Usuario sin nombre'}</span>
    </div>
  );
};

export default UserAvatar;
