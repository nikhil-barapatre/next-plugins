/**
 * Utility functions for code generation
 */

export function toPascalCase(str: string): string {
  return str
    .split(/[-_\s]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

export function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

export function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

export function pluralize(word: string): string {
  // Handle words that are already plural or should not be pluralized
  const irregularPlurals: Record<string, string> = {
    person: 'people',
    child: 'children',
    man: 'men',
    woman: 'women',
    tooth: 'teeth',
    foot: 'feet',
    mouse: 'mice',
    goose: 'geese',
  };

  const lowerWord = word.toLowerCase();

  // Check irregular plurals
  if (irregularPlurals[lowerWord]) {
    return irregularPlurals[lowerWord];
  }

  // If word already ends in 's', it might already be plural
  // Common plural words that don't need additional 's'
  const alreadyPlural = [
    'users', 'orders', 'customers', 'products', 'items', 'settings',
    'news', 'series', 'species', 'data', 'analytics'
  ];

  if (alreadyPlural.includes(lowerWord)) {
    return word;
  }

  // Simple pluralization rules
  if (word.endsWith('y') && !['a', 'e', 'i', 'o', 'u'].includes(word[word.length - 2])) {
    return word.slice(0, -1) + 'ies';
  }
  if (word.endsWith('s') || word.endsWith('x') || word.endsWith('z') ||
      word.endsWith('ch') || word.endsWith('sh')) {
    return word + 'es';
  }
  return word + 's';
}

export function singularize(word: string): string {
  if (word.endsWith('ies')) {
    return word.slice(0, -3) + 'y';
  }
  if (word.endsWith('ses') || word.endsWith('xes') || word.endsWith('zes')) {
    return word.slice(0, -2);
  }
  if (word.endsWith('ches') || word.endsWith('shes')) {
    return word.slice(0, -2);
  }
  if (word.endsWith('s') && !word.endsWith('ss')) {
    return word.slice(0, -1);
  }
  return word;
}

export function getDisplayLabel(fieldName: string): string {
  return fieldName
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .trim()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function getZodType(dbType: string, isOptional: boolean = false): string {
  let zodType = '';

  switch (dbType.toLowerCase()) {
    case 'string':
    case 'text':
    case 'varchar':
      zodType = 'z.string()';
      break;
    case 'int':
    case 'integer':
    case 'bigint':
      zodType = 'z.number().int()';
      break;
    case 'decimal':
    case 'float':
    case 'double':
      zodType = 'z.number()';
      break;
    case 'boolean':
    case 'bool':
      zodType = 'z.boolean()';
      break;
    case 'datetime':
    case 'timestamp':
    case 'date':
      zodType = 'z.date()';
      break;
    default:
      zodType = 'z.string()';
  }

  if (isOptional) {
    zodType += '.optional()';
  }

  return zodType;
}

export function getTypeScriptType(dbType: string, isOptional: boolean = false): string {
  let tsType = '';

  switch (dbType.toLowerCase()) {
    case 'string':
    case 'text':
    case 'varchar':
      tsType = 'string';
      break;
    case 'int':
    case 'integer':
    case 'bigint':
    case 'decimal':
    case 'float':
    case 'double':
      tsType = 'number';
      break;
    case 'boolean':
    case 'bool':
      tsType = 'boolean';
      break;
    case 'datetime':
    case 'timestamp':
    case 'date':
      tsType = 'Date';
      break;
    default:
      tsType = 'string';
  }

  if (isOptional) {
    tsType += ' | null';
  }

  return tsType;
}

export function getInputComponent(dbType: string): string {
  switch (dbType.toLowerCase()) {
    case 'boolean':
    case 'bool':
      return 'Switch';
    case 'int':
    case 'integer':
    case 'bigint':
    case 'decimal':
    case 'float':
    case 'double':
      return 'Input';
    case 'datetime':
    case 'timestamp':
    case 'date':
      return 'Input'; // Will need date picker component
    default:
      return 'Input';
  }
}

export function formatCode(code: string): string {
  // Basic code formatting
  return code
    .split('\n')
    .map(line => line.trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n') // Max 2 consecutive newlines
    .trim();
}
