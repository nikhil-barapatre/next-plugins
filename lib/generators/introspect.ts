/**
 * Database introspection module
 * Connects to external database and retrieves schema information
 */

import { PrismaClient } from '@prisma/client';

export interface FieldInfo {
  name: string;
  type: string;
  isOptional: boolean;
  isUnique: boolean;
  isPrimaryKey: boolean;
  isEnum: boolean;
  enumValues?: string[];
  defaultValue?: any;
}

export interface ModelInfo {
  name: string;
  fields: FieldInfo[];
  tableName: string;
}

/**
 * Introspect a model from external database
 */
export async function introspectModel(
  databaseUrl: string,
  modelName: string
): Promise<ModelInfo> {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });

  try {
    // Convert model name to table name (pluralized, lowercase)
    const tableName = modelName.toLowerCase();

    // Query PostgreSQL information schema
    const columns: any[] = await prisma.$queryRawUnsafe(`
      SELECT
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length,
        numeric_precision,
        numeric_scale,
        udt_name
      FROM information_schema.columns
      WHERE table_name = '${tableName}'
      ORDER BY ordinal_position;
    `);

    if (columns.length === 0) {
      throw new Error(`Table "${tableName}" not found in database`);
    }

    // Get primary key information
    const primaryKeys: any[] = await prisma.$queryRawUnsafe(`
      SELECT a.attname
      FROM pg_index i
      JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
      WHERE i.indrelid = '${tableName}'::regclass AND i.indisprimary;
    `);

    const pkColumns = primaryKeys.map(pk => pk.attname);

    // Get unique constraints
    const uniqueConstraints: any[] = await prisma.$queryRawUnsafe(`
      SELECT a.attname
      FROM pg_index i
      JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
      WHERE i.indrelid = '${tableName}'::regclass AND i.indisunique AND NOT i.indisprimary;
    `);

    const uniqueColumns = uniqueConstraints.map(uc => uc.attname);

    // Get enum types
    const enumTypes: any[] = await prisma.$queryRawUnsafe(`
      SELECT
        t.typname as enum_name,
        e.enumlabel as enum_value
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public'
      ORDER BY t.typname, e.enumsortorder;
    `);

    // Group enum values by type
    const enumMap: Record<string, string[]> = {};
    enumTypes.forEach((et) => {
      if (!enumMap[et.enum_name]) {
        enumMap[et.enum_name] = [];
      }
      enumMap[et.enum_name].push(et.enum_value);
    });

    // Map columns to FieldInfo
    const fields: FieldInfo[] = columns
      .filter((col) => {
        // Exclude timestamp and audit fields from form fields
        return !['created_at', 'updated_at', 'createdBy', 'updatedBy', 'created_by', 'updated_by'].includes(col.column_name);
      })
      .map((col) => {
        const isEnum = enumMap.hasOwnProperty(col.udt_name);
        const type = isEnum ? 'Enum' : mapPostgresType(col.data_type, col.udt_name);

        return {
          name: col.column_name,
          type,
          isOptional: col.is_nullable === 'YES',
          isUnique: uniqueColumns.includes(col.column_name),
          isPrimaryKey: pkColumns.includes(col.column_name),
          isEnum,
          enumValues: isEnum ? enumMap[col.udt_name] : undefined,
          defaultValue: col.column_default,
        };
      });

    return {
      name: modelName,
      fields,
      tableName,
    };
  } catch (error) {
    throw new Error(`Failed to introspect model: ${error}`);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Map PostgreSQL data types to simplified types
 */
function mapPostgresType(dataType: string, udtName: string): string {
  const typeMap: Record<string, string> = {
    'character varying': 'String',
    'varchar': 'String',
    'text': 'String',
    'character': 'String',
    'char': 'String',
    'integer': 'Int',
    'int': 'Int',
    'int4': 'Int',
    'bigint': 'Int',
    'int8': 'Int',
    'smallint': 'Int',
    'int2': 'Int',
    'numeric': 'Decimal',
    'decimal': 'Decimal',
    'real': 'Decimal',
    'float4': 'Decimal',
    'double precision': 'Decimal',
    'float8': 'Decimal',
    'boolean': 'Boolean',
    'bool': 'Boolean',
    'timestamp without time zone': 'DateTime',
    'timestamp with time zone': 'DateTime',
    'timestamp': 'DateTime',
    'date': 'DateTime',
    'time': 'DateTime',
    'uuid': 'String',
  };

  return typeMap[dataType.toLowerCase()] || typeMap[udtName.toLowerCase()] || 'String';
}

/**
 * List all tables in the database
 */
export async function listTables(databaseUrl: string): Promise<string[]> {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });

  try {
    const tables: any[] = await prisma.$queryRawUnsafe(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    return tables.map((t) => t.table_name);
  } finally {
    await prisma.$disconnect();
  }
}
