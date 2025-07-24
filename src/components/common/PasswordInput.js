import React, { useState, useCallback } from 'react';
import { LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const PasswordInput = React.memo(function PasswordInput({
  id,
  name,
  value,
  onChange,
  className = '',
  placeholder = '',
  autoComplete = 'current-password',
  required = false,
  'aria-label': ariaLabel,
  'aria-required': ariaRequired,
  label = 'Password',
  showLabel = true,
  iconClassName = 'w-4 h-4 text-accent',
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const baseClassName = "appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-accent focus:border-accent pr-20";
  const combinedClassName = className ? `${baseClassName} ${className}` : baseClassName;

  return (
    <div>
      {showLabel && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700 flex items-center gap-1">
          <LockClosedIcon className={iconClassName} /> {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          name={name}
          type={showPassword ? "text" : "password"}
          autoComplete={autoComplete}
          required={required}
          value={value}
          onChange={onChange}
          className={combinedClassName}
          placeholder={placeholder}
          aria-required={ariaRequired || required}
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
    </div>
  );
});

export default PasswordInput;
