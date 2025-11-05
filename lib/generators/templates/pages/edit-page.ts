/**
 * Generate edit page component
 */

import { ModelInfo } from '../../introspect';
import { toCamelCase, toPascalCase, pluralize, toKebabCase } from '../../utils';

export function generateEditPage(model: ModelInfo): string {
  const modelName = toPascalCase(model.name);
  const modelNameLower = toCamelCase(model.name);
  const modelNameKebab = toKebabCase(model.name);
  const modelPlural = pluralize(modelNameLower);
  const modelPluralPascal = toPascalCase(modelPlural);
  const modelPluralDisplay = toPascalCase(pluralize(model.name));

  return `import ${modelName}Form from '../../_components/${modelNameKebab}-form'
import { get${modelName}ById } from '@/${modelPlural}/_lib/api-client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'

export default async function Edit${modelName}Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const ${modelNameLower} = await get${modelName}ById(id)

  if (!${modelNameLower}) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold">${modelName} not found</h1>
        <Link href="/${modelPlural}">
          <Button variant="outline" className="mt-4">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to ${modelPluralDisplay}
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold">Edit ${modelName}</h1>
        <Link href="/${modelPlural}">
          <Button variant="outline">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to ${modelPluralDisplay}
          </Button>
        </Link>
      </div>
      <${modelName}Form ${modelNameLower}={${modelNameLower}} />
    </div>
  )
}
`;
}
