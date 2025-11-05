#!/usr/bin/env node

/**
 * Interactive CLI for CRUD generator
 */

import * as readline from 'readline';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { generateAndWrite } from './generator';
import { listTables } from './introspect';

// Load environment variables
dotenv.config();

// ANSI escape codes for terminal control
const CURSOR_UP = '\x1b[1A';
const CURSOR_DOWN = '\x1b[1B';
const CLEAR_LINE = '\x1b[2K';
const HIDE_CURSOR = '\x1b[?25l';
const SHOW_CURSOR = '\x1b[?25h';

interface CliOptions {
  modelName?: string;
  databaseUrl?: string;
  dryRun?: boolean;
}

/**
 * Create readline interface
 */
function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

/**
 * Prompt user for input
 */
function prompt(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

/**
 * Interactive checkbox selection
 */
function checkboxSelect(options: string[], message: string): Promise<string[]> {
  return new Promise((resolve) => {
    let currentIndex = 0;
    const selected = new Set<number>();
    let isFirstRender = true;

    // Setup raw mode for key detection
    if (process.stdin.isTTY) {
      readline.emitKeypressEvents(process.stdin);
      process.stdin.setRawMode(true);
    }

    // Render the list
    const render = () => {
      // Clear previous render (skip on first render)
      if (!isFirstRender) {
        for (let i = 0; i <= options.length + 2; i++) {
          process.stdout.write(CURSOR_UP + CLEAR_LINE);
        }
        process.stdout.write('\r');
      }
      isFirstRender = false;

      console.log(HIDE_CURSOR);
      console.log(`\n${message}`);
      console.log('(Use arrow keys to navigate, space to select, enter to confirm)\n');

      options.forEach((option, index) => {
        const isSelected = selected.has(index);
        const isCurrent = index === currentIndex;
        const checkbox = isSelected ? '[✓]' : '[ ]';
        const cursor = isCurrent ? '❯' : ' ';
        const color = isCurrent ? '\x1b[36m' : ''; // Cyan for current
        const reset = '\x1b[0m';

        console.log(`${cursor} ${color}${checkbox} ${option}${reset}`);
      });
    };

    // Initial render
    render();

    // Handle keypress
    const onKeypress = (str: string, key: any) => {
      if (key.name === 'up' && currentIndex > 0) {
        currentIndex--;
        render();
      } else if (key.name === 'down' && currentIndex < options.length - 1) {
        currentIndex++;
        render();
      } else if (key.name === 'space') {
        if (selected.has(currentIndex)) {
          selected.delete(currentIndex);
        } else {
          selected.add(currentIndex);
        }
        render();
      } else if (key.name === 'return') {
        // Cleanup
        process.stdin.removeListener('keypress', onKeypress);
        if (process.stdin.isTTY) {
          process.stdin.setRawMode(false);
        }
        console.log(SHOW_CURSOR);

        // Return selected options
        const selectedOptions = Array.from(selected)
          .sort((a, b) => a - b)
          .map((i) => options[i]);

        resolve(selectedOptions);
      } else if (key.ctrl && key.name === 'c') {
        // Handle Ctrl+C
        process.stdin.removeListener('keypress', onKeypress);
        if (process.stdin.isTTY) {
          process.stdin.setRawMode(false);
        }
        console.log(SHOW_CURSOR);
        console.log('\n❌ Aborted');
        process.exit(0);
      }
    };

    process.stdin.on('keypress', onKeypress);
  });
}

/**
 * Parse command line arguments
 */
function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  const options: CliOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--model' && args[i + 1]) {
      options.modelName = args[i + 1];
      i++;
    } else if (arg === '--db-url' && args[i + 1]) {
      options.databaseUrl = args[i + 1];
      i++;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--help' || arg === '-h') {
      showHelp();
      process.exit(0);
    }
  }

  return options;
}

/**
 * Show help message
 */
function showHelp() {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║           Next.js CRUD Generator - Help                   ║
╚═══════════════════════════════════════════════════════════╝

Generate complete CRUD UI pages from external database models.

USAGE:
  npm run generate:crud              # Interactive mode
  npm run generate:crud -- --help    # Show this help

OPTIONS:
  --model <name>       Model name to generate (non-interactive)
  --db-url <url>       Database connection URL (non-interactive)
  --dry-run            Preview files without creating them
  -h, --help           Show this help message

INTERACTIVE MODE:
  Simply run without arguments for interactive checkbox selection.
  Use arrow keys to navigate, space to select, enter to confirm.

ENVIRONMENT:
  EXTERNAL_DB_URL      Database URL for introspection (optional)
                       Can be specified in .env file

EXAMPLES:
  npm run generate:crud
  npm run generate:crud -- --dry-run

For more information, visit the documentation.
  `);
}

/**
 * Display banner
 */
function showBanner() {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║           Next.js CRUD Generator v1.0                     ║
║           Generate CRUD UI from Database Models           ║
╚═══════════════════════════════════════════════════════════╝
  `);
}

/**
 * Validate database URL
 */
function validateDatabaseUrl(url: string): boolean {
  try {
    // Basic validation - check if it's a PostgreSQL URL
    return url.startsWith('postgresql://') || url.startsWith('postgres://');
  } catch {
    return false;
  }
}

/**
 * Main CLI function
 */
async function main() {
  showBanner();

  const cliOptions = parseArgs();
  const rl = createInterface();

  try {
    // 1. Get database URL
    let databaseUrl = cliOptions.databaseUrl || process.env.EXTERNAL_DB_URL;

    if (!databaseUrl) {
      console.log('📝 Please provide the external database connection URL');
      console.log('   (or set EXTERNAL_DB_URL in your .env file)\n');

      databaseUrl = await prompt(
        rl,
        '🔗 Database URL: '
      );

      if (!databaseUrl) {
        console.error('❌ Database URL is required');
        process.exit(1);
      }
    }

    if (!validateDatabaseUrl(databaseUrl)) {
      console.error('❌ Invalid database URL. Must start with postgresql:// or postgres://');
      process.exit(1);
    }

    console.log('\n✅ Connected to database');

    // 2. List available tables
    console.log('\n🔍 Fetching available tables...\n');

    let tables: string[] = [];
    try {
      tables = await listTables(databaseUrl);

      if (tables.length === 0) {
        console.error('❌ No tables found in the database');
        process.exit(1);
      }

      console.log('📋 Available tables:');
      tables.forEach((table, index) => {
        console.log(`   ${index + 1}. ${table}`);
      });
      console.log();
    } catch (error) {
      console.error('❌ Failed to connect to database:', error);
      process.exit(1);
    }

    // 3. Get model names using interactive checkbox
    let modelNames: string[] = [];

    if (cliOptions.modelName) {
      modelNames = [cliOptions.modelName];
    } else {
      modelNames = await checkboxSelect(
        tables,
        '📦 Select tables to generate CRUD modules:'
      );

      if (modelNames.length === 0) {
        console.error('\n❌ No tables selected');
        process.exit(1);
      }

      console.log(`\n✅ Selected ${modelNames.length} table(s): ${modelNames.join(', ')}\n`);
    }

    // 4. Confirm generation
    const dryRun = cliOptions.dryRun || false;

    console.log('\n📋 Generation Summary:');
    console.log(`   Tables: ${modelNames.join(', ')}`);
    console.log(`   Count: ${modelNames.length}`);
    console.log(`   Mode: ${dryRun ? 'Dry Run (preview)' : 'Generate Files'}`);
    console.log();

    const confirm = await prompt(
      rl,
      dryRun ? '🔍 Preview generation? (Y/n): ' : '✅ Generate CRUD files? (Y/n): '
    );

    if (confirm.toLowerCase() === 'n' || confirm.toLowerCase() === 'no') {
      console.log('❌ Aborted');
      process.exit(0);
    }

    // 5. Generate CRUD for all selected tables
    console.log();
    const outputDir = path.resolve(process.cwd());

    for (let i = 0; i < modelNames.length; i++) {
      const modelName = modelNames[i];
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📦 Generating ${i + 1}/${modelNames.length}: ${modelName}`);
      console.log('='.repeat(60));

      try {
        await generateAndWrite(
          {
            modelName,
            databaseUrl,
            outputDir,
          },
          dryRun
        );
      } catch (error) {
        console.error(`\n❌ Failed to generate ${modelName}:`, error);
        const continueGen = await prompt(rl, '\nContinue with remaining tables? (Y/n): ');
        if (continueGen.toLowerCase() === 'n' || continueGen.toLowerCase() === 'no') {
          break;
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`🎉 Completed! Generated ${modelNames.length} module(s)\n`);
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run CLI
main();
