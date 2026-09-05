export function validatePassword(password: string) {
  const errors: string[] = [];
  if (password.length < 8) errors.push("Use at least 8 characters.");
  if (!/[A-Z]/.test(password)) errors.push("Include at least one uppercase letter.");
  if (!/[a-z]/.test(password)) errors.push("Include at least one lowercase letter.");
  if (!/[0-9]/.test(password)) errors.push("Include at least one number.");
  return errors;
}
