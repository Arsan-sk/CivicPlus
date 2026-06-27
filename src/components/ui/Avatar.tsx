import React from 'react';

interface AvatarProps {
  src?: string;
  name: string;
  size?: number;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 40,
  className = '',
}) => {
  const getInitials = (n: string) => {
    const parts = n.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return n.substring(0, 2).toUpperCase();
  };

  const style = {
    width: `${size}px`,
    height: `${size}px`,
    fontSize: `${size * 0.4}px`,
  };

  return (
    <div className={`avatar ${className}`} style={style}>
      {src ? (
        <img
          src={src}
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
};
