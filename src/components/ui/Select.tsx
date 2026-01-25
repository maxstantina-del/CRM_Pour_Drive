import { forwardRef, SelectHTMLAttributes, useId } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', ...props }, ref) => {
    const generatedId = useId();
    const id = props.id || generatedId;
    const errorId = `${id}-error`;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-2">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={`
            w-full glass rounded-lg px-4 py-2.5 text-gray-100
            focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent
            transition-all duration-200 cursor-pointer
            ${error ? 'ring-2 ring-accent-red' : ''}
            ${className}
          `}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-dark-800">
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p id={errorId} className="mt-1.5 text-sm text-accent-red" role="alert">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
