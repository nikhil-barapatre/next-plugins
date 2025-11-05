/**
 * Generate module tsconfig.json
 */

import { ModelInfo } from '../introspect';
import { pluralize, toCamelCase } from '../utils';

export function generateTsConfig(model: ModelInfo): string {
  const modelPlural = pluralize(toCamelCase(model.name));

  return `{
  "extends": "../../../tsconfig.json",
  "compilerOptions": {
    "paths": {
      "@/${modelPlural}/*": ["./*"],
      "@/components/*": ["../../../components/*"],
      "@/lib/*": ["../../../lib/*"],
      "@/hooks/*": ["../../../hooks/*"]
    }
  },
  "include": ["./**/*"],
  "exclude": ["node_modules"]
}
`;
}
