/**
 * Generate implementation code snippets
 */

import { ModelInfo } from '../introspect';
import { toCamelCase, toPascalCase, pluralize } from '../utils';

export function generateImplementationGuide(model: ModelInfo): string {
  const modelName = toPascalCase(model.name);
  const modelNameLower = toCamelCase(model.name);
  const modelPlural = pluralize(modelNameLower);

  return `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                      Implementation Guide for ${modelName}
╚═══════════════════════════════════════════════════════════════════════════════╝

📋 Follow these steps to complete the implementation:

${generateServerFunctionsSnippet(model)}

${generateApiRouteSnippet(model)}

${generatePageUpdateSnippet(model)}

${generateNavigationSnippet(model)}

${generatePrismaSchemaSnippet(model)}

═══════════════════════════════════════════════════════════════════════════════

🎉 After completing these steps, run: npm run dev
   Then visit: http://localhost:3000/${modelPlural}

═══════════════════════════════════════════════════════════════════════════════
`;
}

function generateServerFunctionsSnippet(model: ModelInfo): string {
  const modelName = toPascalCase(model.name);
  const modelNameLower = toCamelCase(model.name);
  const modelPlural = pluralize(modelNameLower);

  return `
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 1: Create Server Functions                                            │
│ File: lib/server/${modelPlural}.ts                                         │
└─────────────────────────────────────────────────────────────────────────────┘

"use server";

import db from "@/lib/db";
import type { ${modelName} } from "@/${modelPlural}/_types";

export async function get${modelName}s(options: {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
}) {
  const { page, pageSize, search, status } = options;
  const skip = (page - 1) * pageSize;

  const where = {
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        // Add more searchable fields here
      ],
    }),
    ...(status && { status }),
  };

  const [data, total] = await Promise.all([
    db.${modelNameLower}.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { created_at: "desc" },
    }),
    db.${modelNameLower}.count({ where }),
  ]);

  return {
    data,
    metadata: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}
`;
}

function generateApiRouteSnippet(model: ModelInfo): string {
  const modelName = toPascalCase(model.name);
  const modelNameLower = toCamelCase(model.name);
  const modelPlural = pluralize(modelNameLower);

  return `
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 2: Create API Route                                                   │
│ File: app/api/${modelPlural}/route.ts                                      │
└─────────────────────────────────────────────────────────────────────────────┘

import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { get${modelName}s } from "@/lib/server/${modelPlural}";
import { ${modelNameLower}ApiSchema } from "@/${modelPlural}/_validations/${toKebabCase(modelNameLower)}";
import { z } from "zod";

// GET - List or Get Single
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (id) {
      // Get single ${modelNameLower}
      const ${modelNameLower} = await db.${modelNameLower}.findUnique({
        where: { id },
      });

      if (!${modelNameLower}) {
        return NextResponse.json(
          { error: "${modelName} not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ data: ${modelNameLower} });
    }

    // List ${modelPlural}
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const data = await get${modelName}s({ page, pageSize, search, status });

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /${modelPlural} error:", error);
    return NextResponse.json(
      { error: "Failed to fetch ${modelPlural}" },
      { status: 500 }
    );
  }
}

// POST - Create
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = ${modelNameLower}ApiSchema.parse(body);

    const ${modelNameLower} = await db.${modelNameLower}.create({
      data: validated as any,
    });

    return NextResponse.json(${modelNameLower}, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    console.error("POST /${modelPlural} error:", error);
    return NextResponse.json(
      { message: "Failed to create ${modelNameLower}" },
      { status: 500 }
    );
  }
}

// PUT - Update
export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validated = ${modelNameLower}ApiSchema.parse(body);

    const ${modelNameLower} = await db.${modelNameLower}.update({
      where: { id },
      data: validated as any,
    });

    return NextResponse.json(${modelNameLower});
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    console.error("PUT /${modelPlural} error:", error);
    return NextResponse.json(
      { message: "Failed to update ${modelNameLower}" },
      { status: 500 }
    );
  }
}

// DELETE - Delete
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "ID is required" },
        { status: 400 }
      );
    }

    await db.${modelNameLower}.delete({
      where: { id },
    });

    return NextResponse.json({ message: "${modelName} deleted successfully" });
  } catch (error) {
    console.error("DELETE /${modelPlural} error:", error);
    return NextResponse.json(
      { message: "Failed to delete ${modelNameLower}" },
      { status: 500 }
    );
  }
}
`;
}

function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

function generatePageUpdateSnippet(model: ModelInfo): string {
  const modelName = toPascalCase(model.name);
  const modelNameLower = toCamelCase(model.name);
  const modelPlural = pluralize(modelNameLower);

  return `
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 3: Update Page Component                                              │
│ File: app/(protected)/${modelPlural}/page.tsx                              │
│                                                                             │
│ REPLACE the existing content with:                                         │
└─────────────────────────────────────────────────────────────────────────────┘

import { get${modelName}s } from "@/lib/server/${modelPlural}";
import { ${modelName}ClientPage } from "./_components/${toKebabCase(modelNameLower)}-client-page";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
  }>;
}

export default async function ${modelName}Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.search || "";
  const status = params.status || "";

  const data = await get${modelName}s({
    page,
    pageSize: 10,
    search,
    status,
  });

  return <${modelName}ClientPage initialData={data} />;
}
`;
}

function generateNavigationSnippet(model: ModelInfo): string {
  const modelName = toPascalCase(model.name);
  const modelPlural = pluralize(toCamelCase(model.name));
  const displayName = modelName.replace(/([A-Z])/g, ' $1').trim();

  return `
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 4: Add Navigation Link                                                │
│ File: app/(protected)/layout.tsx                                           │
│                                                                             │
│ ADD this import at the top (if not already present):                       │
└─────────────────────────────────────────────────────────────────────────────┘

import { Users } from "lucide-react";  // Or any appropriate icon

┌─────────────────────────────────────────────────────────────────────────────┐
│ ADD this link in the navigation section:                                   │
└─────────────────────────────────────────────────────────────────────────────┘

<Link
  href="/${modelPlural}"
  className={cn(
    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
    pathname === "/${modelPlural}" && "bg-muted text-primary"
  )}
>
  <Users className="h-4 w-4" />
  ${displayName}
</Link>
`;
}

function generatePrismaSchemaSnippet(model: ModelInfo): string {
  const modelName = toPascalCase(model.name);
  const modelNameLower = toCamelCase(model.name);

  // Generate Prisma model fields
  const fields = model.fields
    .map((field) => {
      let prismaType = '';
      let attributes = '';

      switch (field.type) {
        case 'String':
          prismaType = 'String';
          break;
        case 'Int':
          prismaType = 'Int';
          break;
        case 'Decimal':
          prismaType = 'Decimal';
          attributes = '@db.Decimal(10, 2)';
          break;
        case 'Boolean':
          prismaType = 'Boolean';
          break;
        case 'DateTime':
          prismaType = 'DateTime';
          break;
        default:
          prismaType = 'String';
      }

      if (field.isPrimaryKey) {
        prismaType += ' @id @default(dbgenerated("gen_random_uuid()"))';
      }

      if (field.isOptional && !field.isPrimaryKey) {
        prismaType += '?';
      }

      if (field.isUnique && !field.isPrimaryKey) {
        attributes += ' @unique';
      }

      if (field.isEnum) {
        prismaType = toPascalCase(field.name.replace('_', ' '));
      }

      return `  ${field.name.padEnd(20)} ${prismaType}${attributes ? ' ' + attributes : ''}`;
    })
    .join('\n');

  // Generate enum definitions
  const enums = model.fields
    .filter((f) => f.isEnum)
    .map((field) => {
      const enumName = toPascalCase(field.name.replace('_', ' '));
      const values = field.enumValues!.map((v) => `  ${v}`).join('\n');
      return `enum ${enumName} {\n${values}\n}`;
    })
    .join('\n\n');

  return `
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 5: Add to Prisma Schema (OPTIONAL - if not already present)          │
│ File: prisma/schema.prisma                                                 │
│                                                                             │
│ ADD this model definition:                                                 │
└─────────────────────────────────────────────────────────────────────────────┘

model ${modelName} {
${fields}

  @@map("${model.tableName}")
}
${enums ? '\n' + enums : ''}

┌─────────────────────────────────────────────────────────────────────────────┐
│ After adding the model, run:                                               │
└─────────────────────────────────────────────────────────────────────────────┘

npx prisma generate
`;
}
