# eslint-plugin-tw4

> **Experimental Project** - This is currently under development and not recommended for production use.

An ESLint plugin for formatting TailwindCSS v4 class lists.

## Overview

`eslint-plugin-tw4` is an ESLint plugin dedicated to TailwindCSS v4. It properly formats TailwindCSS class names to improve code readability and maintainability.

This plugin is heavily inspired by and aims to be compatible with [eslint-plugin-tailwindcss](https://github.com/francoismassart/eslint-plugin-tailwindcss), but specifically designed for TailwindCSS v4.

## Features

- **TailwindCSS v4 Only**: Supports TailwindCSS v4 exclusively
- **Class List Formatting**: Automatically formats TailwindCSS class names
- **Based on eslint-plugin-tailwindcss**: Built upon the foundation of the excellent [eslint-plugin-tailwindcss](https://github.com/francoismassart/eslint-plugin-tailwindcss)
- **Compatible API**: Maintains similar configuration and usage patterns

## Rules

| Rule | Description | Fixable |
|------|-------------|---------|
| [`enforces-shorthand`](#enforces-shorthand) | Enforces the use of shorthand utilities over their longhand equivalents | ✅ |

### `enforces-shorthand`

Enforces the use of shorthand utilities over their longhand equivalents to keep class lists more concise and readable.

**Examples:**

```jsx
// ❌ Bad
<div className="mt-4 mb-4" />

// ✅ Good  
<div className="my-4" />
```

**Options:**

- `callees`: Array of function names to check (default: `[]`)
- `config`: TailwindCSS configuration object or path (default: `undefined`)
- `skipClassAttribute`: Skip checking class attributes (default: `false`)
- `tags`: Array of tag names to check (default: `[]`)

## Notice

This project is experimental and under active development. API changes and breaking changes may occur.

## Acknowledgments

Some test cases are adapted from [eslint-plugin-tailwindcss](https://github.com/francoismassart/eslint-plugin-tailwindcss) by François Massart (MIT License).
