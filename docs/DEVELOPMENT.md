# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an ESLint plugin for TailwindCSS v4 that focuses on formatting and optimizing class lists by enforcing shorthand utilities. The plugin is experimental and specifically designed for TailwindCSS v4.

## Commands

### Development Commands
- `pnpm build` - Build the plugin using tsup (outputs to `dist/`)
- `pnpm lint` - Run Biome linting
- `pnpm lint-fix` - Run Biome linting with auto-fix
- `pnpm test` - Run all tests using Vitest
- `pnpm test:unit` - Run unit tests in `src/`
- `pnpm test:compatibility` - Run compatibility tests in `tests/compatibility/`

### Package Manager
- Uses `pnpm` as the package manager (version 10.12.4)
- Workspace configuration via `pnpm-workspace.yaml`

## Architecture

### Core Structure
- **Entry point**: `src/index.ts` - Exports the ESLint plugin with rules
- **Main rule**: `src/rules/enforces-shorthand/` - The primary rule implementation
- **Shorthand engine**: `src/shorthand.ts` - Core logic for TailwindCSS shorthand transformations

### Rule Architecture (enforces-shorthand)
The main rule follows a handler-based architecture:

- **Handlers** (`src/rules/enforces-shorthand/handlers/`):
  - `call-expression-handler.ts` - Handles function calls (e.g., `clsx()`, `cn()`)
  - `jsx-attribute-handler.ts` - Handles JSX class attributes
  - `tagged-template-handler.ts` - Handles tagged template literals

- **Processors** (`src/rules/enforces-shorthand/processors/`):
  - `class-processor.ts` - Processes class strings
  - `jsx-processor.ts` - Processes JSX expressions
  - `template-processor.ts` - Processes template literals
  - `nested-structure-processor.ts` - Handles nested structures

- **Utilities** (`src/rules/enforces-shorthand/utils/`):
  - `error-reporter.ts` - Handles ESLint error reporting
  - `node-matching.ts` - AST node matching utilities
  - `quote-utils.ts` - Quote handling utilities

### Shorthand Engine
The shorthand transformation engine (`src/shorthand.ts`) includes:
- Pattern-based matching for TailwindCSS utilities
- Support for spacing, borders, border-radius, layout, and other utility categories
- Redundancy detection and removal
- Prefix and important modifier handling

### Class Info System
The `src/tw-shorthand/class-info/` directory contains:
- `parse.ts` - Parses TailwindCSS classes into structured data
- `emit.ts` - Emits formatted class names from structured data
- `type.ts` - Type definitions for class information

## Testing

### Test Structure
- Unit tests are co-located with source files (`.test.ts` files)
- Compatibility tests in `tests/compatibility/` test against `eslint-plugin-tailwindcss`
- Uses Vitest with custom setup (`vitest.setup.ts`)

### Test Utilities
- Uses `@typescript-eslint/rule-tester` for ESLint rule testing
- Uses `eslint-vitest-rule-tester` for Vitest integration
- Test cases include Vue.js support via `vue-eslint-parser`

## Configuration

### Build Configuration
- **TypeScript**: Basic config targeting `esnext` with `preserve` module resolution
- **Biome**: Handles formatting and linting with strict rules
- **tsup**: Builds both CJS and ESM outputs with TypeScript declarations

### ESLint Rule Options
The `enforces-shorthand` rule accepts:
- `callees`: Array of function names to check
- `config`: TailwindCSS configuration object or path
- `skipClassAttribute`: Skip checking class attributes
- `tags`: Array of tag names to check

## Development Workflow

### Branch Management
- Create working branch at start of work
- Use clear branch names that describe the feature or fix
- Examples: `feature/add-new-rule`, `fix/parsing-issue`, `refactor/shorthand-logic`

### Commit Management
- Make git commits for each work unit
- Keep commit granularity to one work unit per commit
- Run tests before committing and ensure they pass

### Standard Workflow
1. Create working branch
2. Make code changes/additions
3. Run tests (`pnpm test:unit` → `pnpm test:compatibility`)
4. Verify tests pass
5. Git commit
6. Repeat steps 2-5 as needed

### Development Tools
- Use `npx tsx -e` when executing code snippets
- Create debug code in `tmp/` directory

## Current Project Status

### Recent Improvements
- **Testing Strategy**: Implemented 3-tier testing approach reducing mock complexity from 116 to 20 unit tests while maintaining coverage through enhanced integration tests
- **Test Performance**: All unit tests pass (359 passed, 2 skipped)
- **TailwindCSS Prefix Support**: Basic prefix processing implementation completed for custom prefixes (`pfx-`, `sfc-`, etc.)

### Working Features
- **Basic Prefix Transformations**: `pfx-h-5 pfx-w-5 → pfx-size-5`
- **Standard Shorthand**: All existing TailwindCSS shorthand patterns
- **Responsive Variants**: Working for standard utilities
- **Important Modifiers**: Both leading (`!`) and trailing important modifiers

### Known Issues (11 failing compatibility tests)
1. **Responsive Prefix Combinations**: `sm:pfx-h-10 sm:pfx-w-10` only partially transforms
2. **Custom Value Support**: `h-custom w-custom` not transforming to `size-custom`
3. **Vue Template Parsing**: Some Vue.js template syntax causing parsing errors
4. **Complex Prefix Scenarios**: Advanced prefix + responsive combinations need refinement

### Current Test Status
- **Unit Tests**: 359 passed, 2 skipped ✅
- **Compatibility Tests**: 11 failed (prefix-related edge cases)
- **Overall**: Focus needed on prefix processing edge cases

## Development Notes

### Pattern Matching
The shorthand engine works with predefined patterns for:
- Spacing utilities (margin, padding)
- Border utilities
- Border radius utilities
- Layout utilities (inset, scroll-margin, scroll-padding)
- Grid/Flexbox utilities
- Overflow utilities
- Special patterns (like `truncate` shorthand)
- **NEW**: Custom prefix support for all utility categories

### Important Modifier Handling
The system handles both leading (`!`) and trailing (`!`) important modifiers, ensuring consistency within transformation groups.

### Redundancy Detection
After shorthand transformations, the system removes redundant classes (e.g., if `p-4` exists, removes `px-4` and `py-4`).

### Prefix Processing Architecture
- **Type System**: Extended `TailwindConfig` interface with `prefix` and `separator` support
- **Parser Enhancement**: Config-aware class parsing with custom prefix handling
- **Transformation Engine**: Prefix-aware shorthand generation and emission