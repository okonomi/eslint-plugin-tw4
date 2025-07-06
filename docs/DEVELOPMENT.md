# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an ESLint plugin for TailwindCSS v4 that focuses on formatting and optimizing class lists by enforcing shorthand utilities. The plugin is experimental and specifically designed for TailwindCSS v4.

## Commands

### Development Commands
- `pnpm build` - Build the plugin using tsup (outputs to `dist/`)
- `pnpm lint` - Run all linting (Biome and TypeScript)
- `pnpm lint:biome` - Run Biome linting
- `pnpm lint:tsc` - Run TypeScript type checking
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
- **Vue.js Support**: Complete Vue template parsing implementation with dynamic object/array syntax support
- **Responsive Prefix Processing**: Fixed responsive prefix combinations like `sm:pfx-h-10 sm:pfx-w-10`
- **Complex Modifier Support**: Enhanced handling of custom prefixes with complex modifier combinations
- **Quote Preservation**: Improved quote handling in Vue templates and dynamic expressions
- **Pre-commit Hooks**: Added simple-git-hooks for automated linting on commit

### Working Features
- **All Shorthand Patterns**: Complete TailwindCSS shorthand support including size, spacing, borders, etc.
- **Vue.js Templates**: Full support for Vue template syntax including dynamic bindings
- **Custom Prefixes**: Complete prefix support (`pfx-`, `sfc-`, etc.) with responsive variants
- **Important Modifiers**: Both leading (`!`) and trailing important modifiers
- **Tagged Templates**: Support for styled-components and similar tagged template literals

### Test Status
- **Unit Tests**: ✅ (all passing)
- **Compatibility Tests**: ✅ (all passing)
- **Lint Status**: 4 warnings (type annotations for Vue AST handling)
- **Overall**: All functional tests passing, minor type safety improvements needed

### Recent Fixes (Latest Commits)
1. **Vue Dynamic Object Syntax**: Fixed processing of `:class="{'class': condition}"` patterns
2. **Vue Dynamic Array Syntax**: Fixed processing of `:class="['class1', 'class2']"` patterns
3. **Vue Static Attributes**: Enhanced autofix support for static `class` attributes
4. **Template Parsing**: Improved Vue template parsing and code formatting
5. **Prefix Combinations**: Fixed complex modifier combinations with custom prefixes

### Known Issues
1. **Type Safety**: 4 lint warnings for Vue AST node handling (requires `any` type for dynamic Vue parsing)
2. **Minor Code Quality**: Some biome suppressions need cleanup

### Next Steps
1. **Type Safety Improvements**: Enhance Vue AST type definitions
2. **Code Quality**: Clean up lint suppressions and improve type annotations
3. **Performance Optimization**: Continue optimizing transformation performance
4. **Documentation**: Update examples and usage documentation

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