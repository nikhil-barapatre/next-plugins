/**
 * Generate create page component
 */

import { ModelInfo } from '../../introspect';
import { toCamelCase, toPascalCase, pluralize, toKebabCase } from '../../utils';

export function generateCreatePage(model: ModelInfo): string {
  const modelName = toPascalCase(model.name);
  const modelNameKebab = toKebabCase(model.name);
  const modelPlural = pluralize(toCamelCase(model.name));
  const modelPluralDisplay = toPascalCase(pluralize(model.name));

  return `// app/(protected)/${modelPlural}/create/page.tsx
import ${modelName}Form from '../_components/${modelNameKebab}-form'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'

export default function Create${modelName}Page() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold">Create ${modelName}</h1>
        <Link href="/${modelPlural}">
          <Button variant="outline">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to ${modelPluralDisplay}
          </Button>
        </Link>
      </div>
      <${modelName}Form />
    </div>
  )
}
`;
}
