/**
 * schema.js — validate env keys against a schema definition
 *
 * Schema format:
 *   {
 *     KEY_NAME: { required: true, type: 'string' | 'number' | 'boolean', pattern: /regex/ }
 *   }
 */

/**
 * Validate a single value against a field schema.
 * Returns an array of error strings (empty if valid).
 */
function validateField(key, value, fieldSchema) {
  const errors = [];

  if (value === undefined || value === '') {
    if (fieldSchema.required) {
      errors.push(`"${key}" is required but missing or empty`);
    }
    return errors; // no further checks if value absent
  }

  if (fieldSchema.type === 'number') {
    if (isNaN(Number(value))) {
      errors.push(`"${key}" must be a number, got "${value}"`);
    }
  }

  if (fieldSchema.type === 'boolean') {
    if (!['true', 'false', '1', '0'].includes(value.toLowerCase())) {
      errors.push(`"${key}" must be a boolean (true/false), got "${value}"`);
    }
  }

  if (fieldSchema.pattern instanceof RegExp) {
    if (!fieldSchema.pattern.test(value)) {
      errors.push(`"${key}" does not match required pattern ${fieldSchema.pattern}`);
    }
  }

  return errors;
}

/**
 * Validate an env object against a full schema.
 * Returns { valid: boolean, errors: string[], warnings: string[] }
 */
function validateSchema(env, schema) {
  const errors = [];
  const warnings = [];

  for (const [key, fieldSchema] of Object.entries(schema)) {
    const fieldErrors = validateField(key, env[key], fieldSchema);
    errors.push(...fieldErrors);
  }

  // warn about keys present in env but not in schema
  for (const key of Object.keys(env)) {
    if (!schema[key]) {
      warnings.push(`"${key}" is not defined in schema`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

module.exports = { validateField, validateSchema };
