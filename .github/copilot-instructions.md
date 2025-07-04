# GitHub Copilot Instructions

## Communication
- Respond in Japanese
- Write code explanations in English
- Write code comments in English

## Test Environment
- Unit tests: `pnpm test:unit`
- Compatibility tests: `pnpm test:compatibility`

## Development Tools
- Use `npx tsx -e` when executing code snippets
- Create debug code in `tmp/` directory

## Workflow

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
