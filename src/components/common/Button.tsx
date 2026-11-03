import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-hidden focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-3.5 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5'
  }[size];

  const variantClasses = {
    primary: 'bg-[#354F52] text-white hover:bg-[#283c3e] focus:ring-[#354F52] dark:bg-[#6B8E6B] dark:hover:bg-[#587758] shadow-xs',
    secondary: 'bg-[#EAF0EC] text-[#354F52] hover:bg-[#dbe6df] focus:ring-[#6B8E6B] dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700',
    outline: 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/60 focus:ring-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-xs',
    ghost: 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-gray-300'
  }[variant];

  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
};

