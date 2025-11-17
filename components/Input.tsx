import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  id: string;
  error?: string;
  icon?: React.ReactNode; // New prop for icon
}

const Input: React.FC<InputProps> = ({ label, id, error, className, icon, ...props }) => {
  const baseStyles = 'mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm';
  const errorStyles = 'border-red-500 focus:ring-red-500 focus:border-red-500';

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative mt-1"> {/* Added relative positioning for icon */}
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          id={id}
          className={`${baseStyles} ${error ? errorStyles : ''} ${icon ? 'pl-10' : ''} ${className || ''}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Input;