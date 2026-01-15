import React from 'react';

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading: boolean;
  text: string;
  loadingText: string;
}

export default function SubmitButton({
  isLoading,
  text,
  loadingText,
  className = "",
  ...props
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      className={`w-full bg-lodge-gold text-lodge-navy py-3.5 rounded-lg hover:bg-yellow-500 active:bg-yellow-600 transition-all duration-200 disabled:bg-lodge-gray-border disabled:cursor-not-allowed font-sans font-semibold text-lg shadow-lg hover:shadow-xl ${className}`}
      disabled={isLoading}
      aria-label={isLoading ? loadingText : text}
      {...props}
    >
      {isLoading ? loadingText : text}
    </button>
  );
}
