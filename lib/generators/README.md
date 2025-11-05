# CRUD Generator

Automatically generate complete CRUD UI pages by introspecting models from an external database.

## Features

✨ **Database Introspection** - Connects to external PostgreSQL database and reads table schemas
🎨 **Complete UI Generation** - Generates all necessary components, forms, and pages
🔒 **Type-Safe** - Full TypeScript support with Zod validation
📦 **Modular Structure** - Follows the existing project architecture pattern
🎯 **Smart Field Mapping** - Automatically maps database types to appropriate UI components

## Quick Start

### 1. Set Up External Database URL

Add the external database URL to your `.env` file:

```bash
# .env
EXTERNAL_DB_URL="postgresql://user:password@host:port/database"
```

### 2. Run the Generator

```bash
npm run generate:crud
```

The interactive CLI will guide you through:
1. Connecting to the external database
2. Viewing available tables
3. Selecting a model/table to generate
4. Confirming generation

### 3. Complete the Implementation

After generation, you'll need to:
1. Implement server functions in `lib/server/{module}.ts`
2. Create API routes in `app/api/{module}/route.ts`
3. Add navigation link in `app/(protected)/layout.tsx`
4. Update `page.tsx` to use actual server functions

## Usage

### Interactive Mode (Recommended)

```bash
npm run generate:crud
```

Prompts you step-by-step through the generation process.

### Preview Mode (Dry Run)

```bash
npm run generate:crud -- --dry-run
```

Shows what files would be generated without creating them.

### Help

```bash
npm run generate:crud -- --help
```

## Generated Files Structure

For a model named "Order", the generator creates:

```
app/(protected)/orders/
├── _components/
│   ├── order-client-page.tsx    # Main client component with state management
│   ├── order-list.tsx            # Data table with actions
│   ├── order-form.tsx            # Form with validation
│   └── order-form-dialog.tsx     # Modal dialog wrapper
├── _lib/
│   └── api-client.ts             # Client-side API functions
├── _types/
│   └── index.ts                  # TypeScript type definitions
├── _validations/
│   └── order.ts                  # Zod validation schemas
├── page.tsx                      # Server component entry point
└── tsconfig.json                 # Module-specific TypeScript config
```

## Field Type Mapping

The generator automatically maps database types to UI components:

| Database Type | UI Component | Notes |
|--------------|--------------|-------|
| `String`, `Text`, `VarChar` | Text Input | Email/phone patterns auto-detected |
| `Int`, `BigInt`, `Decimal`, `Float` | Number Input | Step size based on type |
| `Boolean` | Switch | Toggle component |
| `DateTime`, `Timestamp`, `Date` | Date Input | HTML5 date picker |
| `Enum` | Select Dropdown | Options from enum values |
| **Relations** | *Ignored* | Foreign keys are skipped |

## Special Field Handling

### Status Field (Enum)

If your model has a `status` field with enum values, the generator creates two schemas:

1. **Form Schema** - Uses `boolean` (for UI switch)
2. **API Schema** - Uses `enum` values (for database)

The form automatically transforms between these formats.

### Created/Updated Timestamps

Fields named `created_at` and `updated_at` are:
- ✅ Displayed in the list view
- ❌ Excluded from create/edit forms

### Primary Keys

Primary key fields (typically `id`) are:
- ❌ Excluded from forms
- ✅ Used internally for edit/delete operations

## Validation Rules

The generator creates sensible default validations:

- **Required Fields**: Non-optional fields get `.min(1)` validation
- **Email Fields**: Fields with "email" in name get email validation
- **Phone Fields**: Fields with "phone" in name get regex validation
- **Price Fields**: Decimal fields with "price" in name get `.multipleOf(0.01)`
- **Numbers**: Int/Decimal fields get `.min(0)` for non-negative values
- **Strings**: Name fields limited to 255 characters

You can customize these after generation.

## Example Workflow

### 1. You Have an External Database

```sql
-- External database: analytics_db
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  report_type VARCHAR(50),
  status report_status DEFAULT 'DRAFT',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TYPE report_status AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
```

### 2. Run the Generator

```bash
$ npm run generate:crud

╔═══════════════════════════════════════════════════════════╗
║           Next.js CRUD Generator v1.0                     ║
║           Generate CRUD UI from Database Models           ║
╚═══════════════════════════════════════════════════════════╝

🔗 Database URL: postgresql://user:pass@host:5432/analytics_db

✅ Connected to database

🔍 Fetching available tables...

📋 Available tables:
   1. reports
   2. users
   3. analytics

📦 Enter model/table name: reports

📋 Generation Summary:
   Model: reports
   Mode: Generate Files

✅ Generate CRUD files? (Y/n): y

🔍 Introspecting model "reports" from database...
✅ Found model with 5 fields
📝 Generating CRUD files...

📦 Generated 9 files:

  📁 app/(protected)/reports/
     - page.tsx
     - tsconfig.json

  📁 app/(protected)/reports/_components/
     - report-client-page.tsx
     - report-list.tsx
     - report-form.tsx
     - report-form-dialog.tsx

  📁 app/(protected)/reports/_lib/
     - api-client.ts

  📁 app/(protected)/reports/_types/
     - index.ts

  📁 app/(protected)/reports/_validations/
     - report.ts

✍️  Writing files...

✅ Created: app/(protected)/reports/page.tsx
✅ Created: app/(protected)/reports/tsconfig.json
...

✨ CRUD generation complete!

📋 Next steps:
   1. Implement server functions in lib/server/reports.ts
   2. Create API routes in app/api/reports/route.ts
   3. Add navigation link in app/(protected)/layout.tsx
   4. Update the page.tsx to use actual server functions
   5. Run `npm run dev` to test your new CRUD module

🎉 Done!
```

### 3. Implement Server Functions

Create `lib/server/reports.ts`:

```typescript
"use server";

import db from "@/lib/db";
import type { Report } from "@/reports/_types";

export async function getReports(options: {
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
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ],
    }),
    ...(status && { status }),
  };

  const [data, total] = await Promise.all([
    db.report.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { created_at: "desc" },
    }),
    db.report.count({ where }),
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
```

### 4. Create API Routes

Create `app/api/reports/route.ts` (follow the pattern from `customers` or `products`).

### 5. Add to Navigation

Update `app/(protected)/layout.tsx`:

```tsx
<Link href="/reports">
  <FileText className="mr-2 h-4 w-4" />
  Reports
</Link>
```

### 6. Test Your Module

```bash
npm run dev
```

Visit `http://localhost:3000/reports` to see your generated CRUD UI!

## Troubleshooting

### "Table not found in database"

- Check your `EXTERNAL_DB_URL` is correct
- Ensure the table name matches exactly (case-sensitive)
- Verify you have read permissions on the table

### "Failed to connect to database"

- Verify database credentials
- Check network connectivity
- Ensure PostgreSQL is running
- Check firewall rules

### TypeScript Errors After Generation

- Run `npm run build` to verify TypeScript compilation
- Check that imported components exist in `components/ui/`
- Ensure all path aliases are correctly configured

### Missing UI Components

If you get errors about missing components like `Select` or `Switch`:

```bash
npx shadcn@latest add select
npx shadcn@latest add switch
```

## Customization

After generation, you can customize:

1. **Validation Rules** - Edit `_validations/{model}.ts`
2. **Form Layout** - Modify `_components/{model}-form.tsx`
3. **Table Columns** - Update `_components/{model}-list.tsx`
4. **Filtering Logic** - Enhance `_components/{model}-client-page.tsx`

## Architecture

The generator follows your project's modular architecture:

- **Dual API Pattern**: Separate client API layer and server functions
- **Type Safety**: Full TypeScript with Zod validation
- **Component Isolation**: Module-scoped imports with custom tsconfig
- **Consistent Structure**: Matches existing customers/products modules

## Limitations

- **PostgreSQL Only**: Currently supports PostgreSQL databases
- **No Relations**: Foreign key relationships are not generated
- **Basic UI**: Generates standard form inputs (no rich text, file uploads, etc.)
- **No Auth**: Does not generate authentication/authorization logic

## Future Enhancements

Planned features:

- [ ] Support for MySQL and other databases
- [ ] Relation field handling (select from related models)
- [ ] Custom field component mapping
- [ ] Batch generation (multiple models at once)
- [ ] API route generation
- [ ] Server function generation
- [ ] Automatic navigation link insertion

## Support

For issues, questions, or contributions, please refer to the main project documentation.

---

**Generated with ❤️ by Next.js CRUD Generator**
