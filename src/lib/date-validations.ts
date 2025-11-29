// Date validation utilities
export interface DateValidationResult {
  isValid: boolean;
  error?: string;
}

export interface DateValidationOptions {
  minDate?: Date;
  maxDate?: Date;
  minAge?: number;
  maxAge?: number;
  allowFuture?: boolean;
  allowPast?: boolean;
  customMessage?: string;
}

/**
 * Validates a date string with various options
 */
export function validateDate(
  dateString: string, 
  options: DateValidationOptions = {}
): DateValidationResult {
  // Check if date string is empty
  if (!dateString.trim()) {
    return {
      isValid: false,
      error: options.customMessage || "La fecha es requerida"
    };
  }

  // Parse date
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time for comparison

  // Check if date is valid
  if (isNaN(date.getTime())) {
    return {
      isValid: false,
      error: "Fecha inválida"
    };
  }

  // Check against min/max dates
  if (options.minDate && date < options.minDate) {
    return {
      isValid: false,
      error: `La fecha debe ser después del ${options.minDate.toLocaleDateString('es-ES')}`
    };
  }

  if (options.maxDate && date > options.maxDate) {
    return {
      isValid: false,
      error: `La fecha debe ser antes del ${options.maxDate.toLocaleDateString('es-ES')}`
    };
  }

  // Check future/past restrictions
  if (options.allowFuture === false && date > today) {
    return {
      isValid: false,
      error: "No se permite fechas futuras"
    };
  }

  if (options.allowPast === false && date < today) {
    return {
      isValid: false,
      error: "No se permite fechas pasadas"
    };
  }

  // Check age restrictions (for birth dates)
  if (options.minAge !== undefined || options.maxAge !== undefined) {
    const age = calculateAge(date);
    
    if (options.minAge !== undefined && age < options.minAge) {
      return {
        isValid: false,
        error: `La edad mínima es ${options.minAge} años`
      };
    }
    
    if (options.maxAge !== undefined && age > options.maxAge) {
      return {
        isValid: false,
        error: `La edad máxima es ${options.maxAge} años`
      };
    }
  }

  return { isValid: true };
}

/**
 * Calculates age from birth date
 */
export function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Validates birth date specifically
 */
export function validateBirthDate(dateString: string, isStudent = false): DateValidationResult {
  const options: DateValidationOptions = {
    allowFuture: false,
    minAge: isStudent ? 3 : 18, // Students min 3 years, adults min 18
    maxAge: isStudent ? 25 : 80, // Students max 25 years, adults max 80
  };

  return validateDate(dateString, options);
}

/**
 * Validates hire/enrollment date
 */
export function validateHireDate(dateString: string): DateValidationResult {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

  return validateDate(dateString, {
    minDate: oneYearAgo,
    maxDate: oneYearFromNow,
    customMessage: "La fecha de contrato debe estar dentro del último año o próximo año"
  });
}

/**
 * Validates academic period dates
 */
export function validatePeriodDates(startDate: string, endDate: string): {
  startDateResult: DateValidationResult;
  endDateResult: DateValidationResult;
  rangeFvalid: boolean;
  rangeError?: string;
} {
  const startResult = validateDate(startDate, {
    customMessage: "La fecha de inicio es requerida"
  });

  const endResult = validateDate(endDate, {
    customMessage: "La fecha de fin es requerida"
  });

  // If individual dates are invalid, return early
  if (!startResult.isValid || !endResult.isValid) {
    return {
      startDateResult: startResult,
      endDateResult: endResult,
      rangeFvalid: false
    };
  }

  // Check date range logic
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start >= end) {
    return {
      startDateResult: startResult,
      endDateResult: endResult,
      rangeFvalid: false,
      rangeError: "La fecha de fin debe ser posterior a la fecha de inicio"
    };
  }

  // Check if period is too short (minimum 1 month)
  const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  if (diffMonths < 1) {
    return {
      startDateResult: startResult,
      endDateResult: endResult,
      rangeFvalid: false,
      rangeError: "El período académico debe durar al menos 1 mes"
    };
  }

  // Check if period is too long (maximum 1 year)
  if (diffMonths > 12) {
    return {
      startDateResult: startResult,
      endDateResult: endResult,
      rangeFvalid: false,
      rangeError: "El período académico no puede durar más de 1 año"
    };
  }

  return {
    startDateResult: startResult,
    endDateResult: endResult,
    rangeFvalid: true
  };
}

/**
 * Gets min/max dates for HTML date input
 */
export function getDateInputLimits(options: DateValidationOptions) {
  const formatDate = (date: Date) => date.toISOString().split('T')[0];
  
  return {
    min: options.minDate ? formatDate(options.minDate) : undefined,
    max: options.maxDate ? formatDate(options.maxDate) : undefined
  };
}

/**
 * Common date validation presets
 */
export const dateValidationPresets = {
  studentBirthDate: {
    allowFuture: false,
    minAge: 3,
    maxAge: 25
  },
  teacherBirthDate: {
    allowFuture: false,
    minAge: 18,
    maxAge: 80
  },
  hireDate: {
    minDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
    maxDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
  },
  enrollmentDate: {
    minDate: new Date(2020, 0, 1), // Assuming school started in 2020
    maxDate: new Date()
  },
  academicPeriodStart: {
    minDate: new Date(2020, 0, 1),
    maxDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2))
  },
  academicPeriodEnd: {
    minDate: new Date(2020, 0, 1),
    maxDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2))
  }
};