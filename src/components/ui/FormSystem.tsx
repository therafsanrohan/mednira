import React, { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ButtonHTMLAttributes, forwardRef } from 'react';
import { Search, X, Check, Loader2 } from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*                                    LABEL                                   */
/* -------------------------------------------------------------------------- */

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  hint?: string;
}

export const Label: React.FC<LabelProps> = ({ children, required, hint, className = '', ...props }) => (
  <div className="mb-1.5 flex flex-col">
    <label className={`text-sm font-semibold text-slate-700 flex items-center gap-1 ${className}`} {...props}>
      {children}
      {required && <span className="text-rose-500" aria-hidden="true">*</span>}
    </label>
    {hint && <span className="text-xs text-slate-500 mt-0.5">{hint}</span>}
  </div>
);

/* -------------------------------------------------------------------------- */
/*                                   ERROR                                    */
/* -------------------------------------------------------------------------- */

export const FieldError: React.FC<{ message?: string }> = ({ message }) => {
  if (!message) return null;
  return <p className="text-xs text-rose-500 font-medium mt-1.5">{message}</p>;
};

/* -------------------------------------------------------------------------- */
/*                                   INPUT                                    */
/* -------------------------------------------------------------------------- */

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, disabled, ...props }, ref) => {
    return (
      <div className="relative">
        <input
          ref={ref}
          disabled={disabled}
          className={`w-full h-11 px-3 py-2 bg-white border rounded-lg text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-shadow disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
            ${error ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'} 
            ${className}`}
          {...props}
        />
        <FieldError message={error} />
      </div>
    );
  }
);
Input.displayName = 'Input';

/* -------------------------------------------------------------------------- */
/*                               SEARCH INPUT                                 */
/* -------------------------------------------------------------------------- */

export interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
  isLoading?: boolean;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className = '', onClear, isLoading, value, ...props }, ref) => {
    return (
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        <input
          ref={ref}
          value={value}
          type="text"
          className={`w-full h-11 pl-10 pr-10 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-shadow ${className}`}
          {...props}
        />
        {isLoading ? (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Loader2 className="h-4 w-4 text-slate-400 animate-spin" />
          </div>
        ) : (
          value && onClear && (
            <button
              type="button"
              onClick={onClear}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              <X className="h-4 w-4" />
            </button>
          )
        )}
      </div>
    );
  }
);
SearchInput.displayName = 'SearchInput';

/* -------------------------------------------------------------------------- */
/*                                  TEXTAREA                                  */
/* -------------------------------------------------------------------------- */

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  maxLength?: number;
  currentLength?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', error, maxLength, currentLength, disabled, ...props }, ref) => {
    return (
      <div className="relative">
        <textarea
          ref={ref}
          disabled={disabled}
          maxLength={maxLength}
          className={`w-full min-h-[100px] px-3 py-2 bg-white border rounded-lg text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-shadow resize-y disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
            ${error ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'} 
            ${className}`}
          {...props}
        />
        {maxLength && (
          <div className="text-right text-xs text-slate-500 mt-1">
            {currentLength || 0} / {maxLength} characters
          </div>
        )}
        <FieldError message={error} />
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

/* -------------------------------------------------------------------------- */
/*                                   SELECT                                   */
/* -------------------------------------------------------------------------- */

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', error, disabled, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          disabled={disabled}
          className={`w-full h-11 px-3 py-2 bg-white border rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 transition-shadow appearance-none disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
            ${error ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'} 
            ${className}`}
          {...props}
        >
          {children}
        </select>
        {/* Custom Caret */}
        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
        <FieldError message={error} />
      </div>
    );
  }
);
Select.displayName = 'Select';

/* -------------------------------------------------------------------------- */
/*                                  SWITCH                                    */
/* -------------------------------------------------------------------------- */

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const Switch: React.FC<SwitchProps> = ({ checked, onChange, disabled }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50
        ${checked ? 'bg-indigo-600' : 'bg-slate-200'}`}
    >
      <span
        className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform
          ${checked ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  );
};

/* -------------------------------------------------------------------------- */
/*                                  BUTTON                                    */
/* -------------------------------------------------------------------------- */

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', isLoading, children, disabled, ...props }, ref) => {
    
    const baseStyles = 'inline-flex items-center justify-center h-11 px-6 rounded-lg text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
      secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-slate-500',
      outline: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-slate-500',
      ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 focus:ring-slate-500',
      destructive: 'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variants[variant]} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
