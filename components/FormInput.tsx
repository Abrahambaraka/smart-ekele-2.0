import React, { ReactNode } from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  icon?: ReactNode;
  error?: string;
}

const FormInput: React.FC<FormInputProps> = ({ id, label, icon, error, className = '', ...inputProps }) => {
  const hasIcon = Boolean(icon);
  const baseClass = `w-full p-3 border rounded-md bg-gray-50 text-gray-900 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-200 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-brand-secondary dark:focus:border-brand-secondary ${hasIcon ? 'pl-10' : ''}`;
  const borderClass = error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300';

  return (
    <div>
      <label htmlFor={id} className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
        {label}
      </label>
      <div className="relative">
        {hasIcon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
            {icon}
          </div>
        )}
        <input
          id={id}
          name={id}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`${baseClass} ${borderClass} ${className}`}
          {...inputProps}
        />
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormInput;
