import React from 'react';

type ButtonProps = {
  variant?: 'link' | 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'primary';
  size?: 'icon' | 'sm' | 'md' | 'lg';
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
};

export const Button: React.FC<ButtonProps> = ({ variant = 'default', size = 'md', className = '', children, onClick }) => {
  const baseStyle = 'py-2 px-4 rounded';
  const variantStyle = {
    link: 'text-blue-500',
    default: 'bg-gray-100 text-gray-800',
    destructive: 'bg-red-500 text-white',
    outline: 'border border-gray-500 text-gray-500',
    secondary: 'bg-gray-200 text-gray-700',
    ghost: 'bg-transparent text-gray-700',
    primary: 'bg-blue-500 text-white'
  };
  const sizeStyle = {
    icon: 'p-2',
    sm: 'text-sm',
    md: 'text-md',
    lg: 'text-lg'
  };

  return (
    <button className={`${baseStyle} ${variantStyle[variant]} ${sizeStyle[size]} ${className}`} onClick={onClick}>
      {children}
    </button>
  );
};
