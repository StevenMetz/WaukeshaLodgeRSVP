import React from 'react';

interface TextAreaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  description?: string;
  fieldId: string;
}

export default function TextAreaField({
  label,
  error,
  description,
  fieldId,
  className = "",
  ...props
}: TextAreaFieldProps) {
  return (
    <div>
      <label htmlFor={fieldId} className="block text-lodge-navy font-sans font-semibold mb-2">
        {label}
      </label>
      <textarea
        id={fieldId}
        className={`w-full border-2 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-lodge-gold text-lodge-navy disabled:opacity-50 font-sans resize-none ${
          error ? "border-lodge-error" : "border-lodge-gray-border"
        } ${className}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : description ? `${fieldId}-description` : undefined}
        {...props}
      />
      {description && !error && (
        <span id={`${fieldId}-description`} className="text-lodge-navy text-sm font-sans block mt-1">
          {description}
        </span>
      )}
      {error && (
        <p id={`${fieldId}-error`} className="text-lodge-error text-sm mt-1.5 font-sans" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
