'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { 
  DateValidationResult, 
  DateValidationOptions,
  validateDate,
  getDateInputLimits 
} from '@/lib/date-validations';
import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

interface ValidatedDateInputProps {
  id?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  validationOptions?: DateValidationOptions;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  onValidationChange?: (isValid: boolean, error?: string) => void;
  showValidation?: boolean;
}

export function ValidatedDateInput({
  id,
  label,
  value,
  onChange,
  validationOptions = {},
  required = false,
  disabled = false,
  className,
  onValidationChange,
  showValidation = true
}: ValidatedDateInputProps) {
  const [validation, setValidation] = useState<DateValidationResult>({ isValid: true });
  const [touched, setTouched] = useState(false);

  // Validate on value change
  useEffect(() => {
    if (touched || value) {
      const result = value ? validateDate(value, validationOptions) : 
        required ? { isValid: false, error: "Este campo es requerido" } : { isValid: true };
      
      setValidation(result);
      onValidationChange?.(result.isValid, result.error);
    }
  }, [value, validationOptions, required, touched, onValidationChange]);

  const handleBlur = () => {
    setTouched(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const limits = getDateInputLimits(validationOptions);
  const hasError = showValidation && touched && !validation.isValid;

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      <div className="relative">
        <Input
          id={id}
          type="date"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          min={limits.min}
          max={limits.max}
          className={cn(
            "h-11",
            hasError && "border-red-500 focus:border-red-500 focus:ring-red-500"
          )}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${id}-error` : undefined}
        />
        
        {hasError && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <AlertCircle className="h-4 w-4 text-red-500" />
          </div>
        )}
      </div>
      
      {hasError && showValidation && (
        <p id={`${id}-error`} className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {validation.error}
        </p>
      )}
    </div>
  );
}