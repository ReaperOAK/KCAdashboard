import React, { useState, useCallback } from 'react';
import { Field, ErrorMessage } from 'formik';
import { LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const FormikPasswordField = React.memo(function FormikPasswordField({
  id,
  name,
  className = '',
  placeholder = '',
  autoComplete = 'current-password',
  'aria-label': ariaLabel,
  'aria-required': ariaRequired,
  label = 'Password',
  showLabel = true,
  iconClassName = 'w-4 h-4 text-accent',
  showErrorMessage = true,
  errorClassName = 'text-red-600 text-sm mt-1',
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const baseClassName = "mt-1 block w-full rounded-md border border-gray-light shadow-sm focus:border-secondary focus:ring-secondary pr-20";
  const combinedClassName = className ? `${baseClassName} ${className}` : baseClassName;

  return (
    <div>
      {showLabel && (
        <label htmlFor={id} className="text-sm font-medium text-gray-dark block flex items-center gap-1">
          <LockClosedIcon className={iconClassName} /> {label}
        </label>
      )}
      <div className="relative">
        <Field
          id={id}
          name={name}
          type={showPassword ? "text" : "password"}
          autoComplete={autoComplete}
          className={combinedClassName}
          placeholder={placeholder}
          aria-required={ariaRequired}
          aria-label={ariaLabel || label}
          {...props}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-10 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeSlashIcon className="w-5 h-5" />
          ) : (
            <EyeIcon className="w-5 h-5" />
          )}
        </button>
        <LockClosedIcon className="w-5 h-5 text-gray-300 absolute right-3 top-2.5 pointer-events-none" />
      </div>
      {showErrorMessage && (
        <ErrorMessage name={name} component="div" className={errorClassName} />
      )}
    </div>
  );
});

export default FormikPasswordField;
