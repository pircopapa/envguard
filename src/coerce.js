/**
 * coerce.js — Force-cast env values to specified types with strict error reporting
 */

'use strict';

const SUPPORTED_TYPES = ['string', 'number', 'boolean', 'integer', 'json'];

/**
 * Coerce a single value to the given type.
 * Returns { value, original, type, ok, error }
 */
function coerceValue(raw, type) {
  const original = raw;
  try {
    switch (type) {
      case 'string':
        return { value: String(raw), original, type, ok: true };

      case 'number': {
        const n = Number(raw);
        if (isNaN(n)) throw new Error(`Cannot coerce "${raw}" to number`);
        return { value: n, original, type, ok: true };
      }

      case 'integer': {
        const i = parseInt(raw, 10);
        if (isNaN(i)) throw new Error(`Cannot coerce "${raw}" to integer`);
        return { value: i, original, type, ok: true };
      }

      case 'boolean': {
        const lower = String(raw).toLowerCase().trim();
        if (['true', '1', 'yes', 'on'].includes(lower)) return { value: true, original, type, ok: true };
        if (['false', '0', 'no', 'off'].includes(lower)) return { value: false, original, type, ok: true };
        throw new Error(`Cannot coerce "${raw}" to boolean`);
      }

      case 'json': {
        const parsed = JSON.parse(raw);
        return { value: parsed, original, type, ok: true };
      }

      default:
        throw new Error(`Unsupported coerce type "${type}"`);
    }
  } catch (err) {
    return { value: null, original, type, ok: false, error: err.message };
  }
}

/**
 * Coerce all keys in an env object using a type map { KEY: 'type' }.
 * Returns { coerced, errors }
 */
function coerceEnv(env, typeMap) {
  const coerced = {};
  const errors = [];

  for (const [key, value] of Object.entries(env)) {
    const type = typeMap[key];
    if (!type) {
      coerced[key] = value;
      continue;
    }
    const result = coerceValue(value, type);
    if (result.ok) {
      coerced[key] = result.value;
    } else {
      coerced[key] = value;
      errors.push({ key, ...result });
    }
  }

  return { coerced, errors };
}

/**
 * Returns true if all coercions succeeded.
 */
function isCleanCoerce(errors) {
  return errors.length === 0;
}

/**
 * Summary of a coerce operation.
 */
function coerceSummary(env, typeMap, errors) {
  const attempted = Object.keys(typeMap).filter(k => k in env).length;
  return {
    total: Object.keys(env).length,
    attempted,
    succeeded: attempted - errors.length,
    failed: errors.length,
  };
}

module.exports = { coerceValue, coerceEnv, isCleanCoerce, coerceSummary, SUPPORTED_TYPES };
