import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  helperText,
  error,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || React.useId();

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`form-input ${error ? 'border-danger' : ''} ${className}`}
        {...props}
      />
      {error && <span className="form-error">{error}</span>}
      {!error && helperText && <span className="form-helper">{helperText}</span>}
    </div>
  );
};
