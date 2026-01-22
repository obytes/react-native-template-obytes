export function getFieldError(
  field: any,
): string | undefined {
  if (!field.state.meta.isTouched || !field.state.meta.errors.length) {
    return undefined;
  }

  const error = field.state.meta.errors[0];

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Handle object errors with message property (Zod errors)
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }

  // Fallback: convert to string
  return String(error);
}
