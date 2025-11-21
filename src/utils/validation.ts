/**
 * Form validation utilities
 */

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
  message?: string;
}

export interface ValidationRules {
  [key: string]: ValidationRule[];
}

/**
 * Validate a single field
 */
export function validateField(value: any, rules: ValidationRule[]): string | null {
  for (const rule of rules) {
    // Required validation
    if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
      return rule.message || 'This field is required';
    }

    // Skip other validations if field is empty and not required
    if (!value || (typeof value === 'string' && !value.trim())) {
      continue;
    }

    // Min length validation
    if (rule.minLength && value.length < rule.minLength) {
      return rule.message || `Minimum length is ${rule.minLength} characters`;
    }

    // Max length validation
    if (rule.maxLength && value.length > rule.maxLength) {
      return rule.message || `Maximum length is ${rule.maxLength} characters`;
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(value)) {
      return rule.message || 'Invalid format';
    }

    // Custom validation
    if (rule.custom) {
      const customError = rule.custom(value);
      if (customError) {
        return customError;
      }
    }
  }

  return null;
}

/**
 * Validate entire form
 */
export function validateForm<T extends Record<string, any>>(
  data: T,
  rules: ValidationRules
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  for (const [field, fieldRules] of Object.entries(rules)) {
    const error = validateField(data[field], fieldRules);
    if (error) {
      errors[field] = error;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Common validation rules
 */
export const commonRules = {
  required: (message?: string): ValidationRule => ({
    required: true,
    message: message || 'This field is required',
  }),

  email: (message?: string): ValidationRule => ({
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: message || 'Please enter a valid email address',
  }),

  minLength: (length: number, message?: string): ValidationRule => ({
    minLength: length,
    message: message || `Minimum length is ${length} characters`,
  }),

  maxLength: (length: number, message?: string): ValidationRule => ({
    maxLength: length,
    message: message || `Maximum length is ${length} characters`,
  }),

  password: (message?: string): ValidationRule => ({
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]/,
    message: message || 'Password must be at least 8 characters with uppercase, lowercase, and number',
  }),

  confirmPassword: (password: string, message?: string): ValidationRule => ({
    custom: (value: string) => {
      if (value !== password) {
        return message || 'Passwords do not match';
      }
      return null;
    },
  }),

  number: (message?: string): ValidationRule => ({
    pattern: /^\d+$/,
    message: message || 'Please enter a valid number',
  }),

  positiveNumber: (message?: string): ValidationRule => ({
    pattern: /^[1-9]\d*$/,
    message: message || 'Please enter a positive number',
  }),

  percentage: (message?: string): ValidationRule => ({
    custom: (value: number) => {
      const num = Number(value);
      if (isNaN(num) || num < 0 || num > 100) {
        return message || 'Please enter a percentage between 0 and 100';
      }
      return null;
    },
  }),

  username: (message?: string): ValidationRule => ({
    pattern: /^[a-zA-Z0-9_]{3,20}$/,
    message: message || 'Username must be 3-20 characters with letters, numbers, and underscores only',
  }),
};