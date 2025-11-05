/**
 * Main CRUD generator orchestrator
 */

import * as fs from 'fs';
import * as path from 'path';
import { introspectModel, ModelInfo } from './introspect';
import { toCamelCase, toPascalCase, pluralize, toKebabCase, formatCode } from './utils';
import { generateTypes } from './templates/types';
import { generateValidations } from './templates/validations';
import { generateApiClient } from './templates/api-client';
import { generatePageBasedFormComponent } from './templates/components/form-page-based';
import { generatePageBasedListComponent } from './templates/components/list-page-based';
import { generateMainPage } from './templates/pages/main-page';
import { generateCreatePage } from './templates/pages/create-page';
import { generateEditPage } from './templates/pages/edit-page';
import { generateTsConfig } from './templates/tsconfig';
import { generateImplementationGuide } from './templates/snippets';

export interface GeneratorOptions {
  modelName: string;
  databaseUrl: string;
  outputDir: string;
}

export interface GeneratedFiles {
  path: string;
  content: string;
}

/**
 * Generate all CRUD files for a model
 */
export async function generateCRUD(
  options: GeneratorOptions
): Promise<GeneratedFiles[]> {
  const { modelName, databaseUrl, outputDir } = options;

  console.log(`🔍 Introspecting model "${modelName}" from database...`);

  // Introspect the model
  const modelInfo = await introspectModel(databaseUrl, modelName);

  console.log(`✅ Found model with ${modelInfo.fields.length} fields`);
  console.log(`📝 Generating CRUD files...`);

  const modelNamePascal = toPascalCase(modelInfo.name);
  const modelNameCamel = toCamelCase(modelInfo.name);
  const modelPlural = pluralize(modelNameCamel);
  const modelNameKebab = toKebabCase(modelInfo.name);

  // Calculate paths
  const modulePath = path.join(outputDir, 'app', '(protected)', modelPlural);
  const componentsPath = path.join(modulePath, '_components');
  const libPath = path.join(modulePath, '_lib');
  const typesPath = path.join(modulePath, '_types');
  const validationsPath = path.join(modulePath, '_validations');

  const files: GeneratedFiles[] = [];

  // 1. Generate types
  files.push({
    path: path.join(typesPath, 'index.ts'),
    content: formatCode(generateTypes(modelInfo)),
  });

  // 2. Generate validations
  files.push({
    path: path.join(validationsPath, `${modelNameKebab}.ts`),
    content: formatCode(generateValidations(modelInfo)),
  });

  // 3. Generate API client
  files.push({
    path: path.join(libPath, 'api-client.ts'),
    content: formatCode(generateApiClient(modelInfo)),
  });

  // 4. Generate components
  files.push({
    path: path.join(componentsPath, `${modelNameKebab}-form.tsx`),
    content: formatCode(generatePageBasedFormComponent(modelInfo)),
  });

  files.push({
    path: path.join(componentsPath, `${modelNameKebab}-list.tsx`),
    content: formatCode(generatePageBasedListComponent(modelInfo)),
  });

  // 5. Generate main page.tsx
  files.push({
    path: path.join(modulePath, 'page.tsx'),
    content: formatCode(generateMainPage(modelInfo)),
  });

  // 6. Generate create page
  files.push({
    path: path.join(modulePath, 'create', 'page.tsx'),
    content: formatCode(generateCreatePage(modelInfo)),
  });

  // 7. Generate edit page
  files.push({
    path: path.join(modulePath, '[id]', 'edit', 'page.tsx'),
    content: formatCode(generateEditPage(modelInfo)),
  });

  // 8. Generate tsconfig.json
  files.push({
    path: path.join(modulePath, 'tsconfig.json'),
    content: generateTsConfig(modelInfo),
  });

  return files;
}

/**
 * Write generated files to disk
 */
export async function writeFiles(
  files: GeneratedFiles[],
  dryRun: boolean = false
): Promise<void> {
  for (const file of files) {
    if (dryRun) {
      console.log(`📄 Would create: ${file.path}`);
      continue;
    }

    // Create directory if it doesn't exist
    const dir = path.dirname(file.path);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Check if file exists
    if (fs.existsSync(file.path)) {
      console.log(`⚠️  File exists: ${file.path} (skipping)`);
      continue;
    }

    // Write file
    fs.writeFileSync(file.path, file.content, 'utf-8');
    console.log(`✅ Created: ${file.path}`);
  }
}

/**
 * Update root tsconfig.json with path alias
 */
async function updateRootTsConfig(
  modelPlural: string,
  outputDir: string
): Promise<void> {
  const tsconfigPath = path.join(outputDir, 'tsconfig.json');

  if (!fs.existsSync(tsconfigPath)) {
    console.warn('⚠️  Root tsconfig.json not found, skipping path alias update');
    return;
  }

  try {
    const content = fs.readFileSync(tsconfigPath, 'utf-8');
    const tsconfig = JSON.parse(content);

    // Ensure paths object exists
    if (!tsconfig.compilerOptions) {
      tsconfig.compilerOptions = {};
    }
    if (!tsconfig.compilerOptions.paths) {
      tsconfig.compilerOptions.paths = {};
    }

    // Add path alias for the module
    const pathKey = `@/${modelPlural}/*`;
    const pathValue = `./app/(protected)/${modelPlural}/*`;

    if (tsconfig.compilerOptions.paths[pathKey]) {
      console.log(`ℹ️  Path alias ${pathKey} already exists in tsconfig.json`);
      return;
    }

    tsconfig.compilerOptions.paths[pathKey] = [pathValue];

    // Write back with formatting
    fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2) + '\n', 'utf-8');
    console.log(`✅ Added path alias: ${pathKey} → ${pathValue}`);
  } catch (error) {
    console.error('❌ Failed to update tsconfig.json:', error);
  }
}

/**
 * Get relative path for display
 */
function getRelativePath(filePath: string, baseDir: string): string {
  return path.relative(baseDir, filePath);
}

/**
 * Generate CRUD and write files
 */
export async function generateAndWrite(
  options: GeneratorOptions,
  dryRun: boolean = false
): Promise<void> {
  try {
    const files = await generateCRUD(options);

    console.log(`\n📦 Generated ${files.length} files:\n`);

    // Group files by directory
    const filesByDir = files.reduce((acc, file) => {
      const dir = path.dirname(file.path);
      if (!acc[dir]) acc[dir] = [];
      acc[dir].push(file);
      return acc;
    }, {} as Record<string, GeneratedFiles[]>);

    // Display grouped files
    Object.entries(filesByDir).forEach(([dir, dirFiles]) => {
      const relativeDir = getRelativePath(dir, options.outputDir);
      console.log(`  📁 ${relativeDir}/`);
      dirFiles.forEach((file) => {
        const fileName = path.basename(file.path);
        console.log(`     - ${fileName}`);
      });
      console.log();
    });

    if (dryRun) {
      console.log('🔍 Dry run mode - no files were created');
      return;
    }

    // Write files
    console.log('✍️  Writing files...\n');
    await writeFiles(files, dryRun);

    const modelPlural = pluralize(toCamelCase(options.modelName));

    // Update root tsconfig.json with path alias
    if (!dryRun) {
      await updateRootTsConfig(modelPlural, options.outputDir);
    }

    console.log('\n✨ CRUD generation complete!\n');

    // Generate and save implementation guide
    const guideContent = generateImplementationGuide(await introspectModel(options.databaseUrl, options.modelName));
    const guidePath = path.join(options.outputDir, 'app', '(protected)', modelPlural, 'IMPLEMENTATION.txt');

    if (!dryRun) {
      fs.writeFileSync(guidePath, guideContent, 'utf-8');
      console.log(`📝 Implementation guide saved to:`);
      console.log(`   app/(protected)/${modelPlural}/IMPLEMENTATION.txt\n`);
    }

    // Show quick summary
    console.log('📋 Next steps:');
    console.log(`   1. Read IMPLEMENTATION.txt in the ${modelPlural} directory`);
    console.log(`   2. Copy and paste the provided code snippets`);
    console.log(`   3. Run \`npm run dev\` to test your new CRUD module\n`);
  } catch (error) {
    console.error('❌ Error generating CRUD:', error);
    throw error;
  }
}
