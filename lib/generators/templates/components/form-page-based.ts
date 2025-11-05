/**
 * Generate form component for page-based navigation (like products)
 */

import { ModelInfo, FieldInfo } from '../../introspect';
import { toCamelCase, toPascalCase, pluralize, getDisplayLabel, toKebabCase } from '../../utils';

export function generatePageBasedFormComponent(model: ModelInfo): string {
  const modelName = toPascalCase(model.name);
  const modelNameLower = toCamelCase(model.name);
  const modelNameKebab = toKebabCase(model.name);
  const modelPlural = pluralize(modelNameLower);

  // Generate default values
  const defaultValues = model.fields
    .filter((f) => !f.isPrimaryKey)
    .map((field) => generateDefaultValue(field, modelNameLower))
    .join('\n');

  // Generate form fields
  const formFields = model.fields
    .filter((f) => !f.isPrimaryKey)
    .map((field) => generateFormField(field, modelNameLower))
    .join('\n\n');

  // Check if we need various components
  const hasSwitch = model.fields.some((f) => f.type === 'Boolean');
  const hasSelect = model.fields.some((f) => f.isEnum);
  const hasTextarea = model.fields.some((f) => f.name.includes('description'));

  return `// app/(protected)/${modelPlural}/_components/${modelNameKebab}-form.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'${hasTextarea ? `
import { Textarea } from '@/components/ui/textarea'` : ''}${hasSelect ? `
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'` : ''}${hasSwitch ? `
import { Switch } from '@/components/ui/switch'` : ''}
import { ${modelNameLower}Schema, ${modelName}FormData } from '../_validations/${modelNameKebab}'
import { create${modelName}, update${modelName}, ${modelName} } from '../_lib/api-client'

interface ${modelName}FormProps {
  ${modelNameLower}?: ${modelName}
}

export default function ${modelName}Form({ ${modelNameLower} }: ${modelName}FormProps) {
  const router = useRouter()
  const form = useForm<${modelName}FormData>({
    resolver: zodResolver(${modelNameLower}Schema),
    defaultValues: {
${defaultValues}
    },
  })

  async function onSubmit(data: ${modelName}FormData) {
    try {
      if (${modelNameLower}) {
        await update${modelName}(${modelNameLower}.id, data as any)
        toast.success('${modelName} updated successfully')
      } else {
        await create${modelName}(data as any)
        toast.success('${modelName} created successfully')
      }
      router.push('/${modelPlural}')
      router.refresh()
    } catch (error) {
      toast.error(\`Failed to \${${modelNameLower} ? 'update' : 'create'} ${modelNameLower}\`)
      console.error(error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
${formFields}

        <div className="flex gap-4">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Saving...' : ${modelNameLower} ? 'Update ${modelName}' : 'Create ${modelName}'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/${modelPlural}')}
            disabled={form.formState.isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}
`;
}

function generateDefaultValue(field: FieldInfo, modelNameLower: string): string {
  const fieldName = field.name;

  if (field.type === 'Boolean') {
    return `      ${fieldName}: ${modelNameLower}?.${fieldName} ?? ${!field.isOptional},`;
  }

  if (field.type === 'Int' || field.type === 'Decimal') {
    if (field.name.includes('price')) {
      return `      ${fieldName}: ${modelNameLower}?.${fieldName} ? String(${modelNameLower}.${fieldName}) : '',`;
    }
    return `      ${fieldName}: ${modelNameLower}?.${fieldName} ? String(${modelNameLower}.${fieldName}) : '0',`;
  }

  if (field.isEnum) {
    const firstValue = field.enumValues![0];
    return `      ${fieldName}: ${modelNameLower}?.${fieldName} || '${firstValue}',`;
  }

  return `      ${fieldName}: ${modelNameLower}?.${fieldName} || '',`;
}

function generateFormField(field: FieldInfo, modelNameLower: string): string {
  const label = getDisplayLabel(field.name);
  const fieldName = field.name;

  // Boolean field with Switch
  if (field.type === 'Boolean') {
    return `        <FormField
          control={form.control}
          name="${fieldName}"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">${label}</FormLabel>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />`;
  }

  // Enum field with Select
  if (field.isEnum) {
    const options = field.enumValues!
      .map((val) => `              <SelectItem value="${val}">${val}</SelectItem>`)
      .join('\n');

    return `        <FormField
          control={form.control}
          name="${fieldName}"
          render={({ field }) => (
            <FormItem>
              <FormLabel>${label}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ${label.toLowerCase()}" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
${options}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />`;
  }

  // Textarea for description fields
  if (fieldName.includes('description')) {
    return `        <FormField
          control={form.control}
          name="${fieldName}"
          render={({ field }) => (
            <FormItem>
              <FormLabel>${label}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter ${label.toLowerCase()}"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />`;
  }

  // Number field
  if (field.type === 'Int' || field.type === 'Decimal') {
    const step = field.type === 'Decimal' ? '0.01' : '1';
    return `        <FormField
          control={form.control}
          name="${fieldName}"
          render={({ field }) => (
            <FormItem>
              <FormLabel>${label}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="${step}"
                  placeholder="Enter ${label.toLowerCase()}"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />`;
  }

  // DateTime field
  if (field.type === 'DateTime') {
    return `        <FormField
          control={form.control}
          name="${fieldName}"
          render={({ field }) => (
            <FormItem>
              <FormLabel>${label}</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />`;
  }

  // Default string field
  return `        <FormField
          control={form.control}
          name="${fieldName}"
          render={({ field }) => (
            <FormItem>
              <FormLabel>${label}</FormLabel>
              <FormControl>
                <Input placeholder="Enter ${label.toLowerCase()}" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />`;
}
