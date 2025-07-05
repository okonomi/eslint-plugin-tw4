# Test Strategy for ESLint Plugin TW4

This document outlines the testing strategy implemented to minimize mock usage and improve test maintainability while ensuring comprehensive coverage.

## Testing Hierarchy

### Level 1: Pure Function Tests (No Mocks)
**Location**: Files like `class-processor.test.ts`, `shorthand.test.ts`
**Purpose**: Test business logic without external dependencies
**Coverage**: Core transformation logic, utility functions
**Benefits**: Fast execution, reliable, easy to maintain

### Level 2: Unit Tests with Minimal Mocks
**Location**: Handler and processor test files (simplified)
**Purpose**: Test essential control flow and delegation logic
**Coverage**: 
- Key branching decisions
- Delegation to correct processors
- Error handling scenarios
**Benefits**: Focused on critical paths, reduced mock complexity

### Level 3: Integration Tests (RuleTester)
**Location**: `enforces-shorthand.test.ts` with enhanced scenarios
**Purpose**: Test complete workflows with real ESLint context
**Coverage**:
- End-to-end scenarios
- Handler/processor integration
- Edge cases and error conditions
- Real-world usage patterns
**Benefits**: High confidence, real environment testing

## Test Responsibilities

### Pure Function Tests
- `class-processor.test.ts`: Core shorthand transformation logic
- `shorthand.test.ts`: Business rules and transformation patterns
- `parse.test.ts`: Class parsing logic
- `quote-utils.test.ts`: Utility functions

### Unit Tests (Minimal Mocks)
- Handler tests: Control flow and delegation verification
- Processor tests: Essential branching logic
- Focus on: "Does this component delegate correctly?"
- Avoid: Detailed behavior testing (covered by integration tests)

### Integration Tests (RuleTester)
- Complete transformation workflows
- Handler-specific edge cases
- Processor-specific behaviors
- Real ESLint rule execution
- Complex scenarios (nested structures, template literals, etc.)

## Mock Usage Guidelines

### When to Use Mocks
- Testing control flow in handlers/processors
- Verifying delegation between components
- Testing error conditions that are hard to reproduce

### When NOT to Use Mocks
- Testing business logic (use pure functions)
- Testing complete workflows (use RuleTester)
- Testing specific transformation patterns (use integration tests)

## Benefits of This Strategy

1. **Reduced Mock Complexity**: Less brittle tests, easier maintenance
2. **Better Coverage**: Integration tests catch real-world issues
3. **Faster Development**: Pure function tests provide quick feedback
4. **Reliable Tests**: Less dependence on mock setup reduces test failures
5. **Real Environment Testing**: RuleTester provides confidence in actual usage

## Migration Impact

### Before
- 41 failing unit tests due to mock complexity
- Fragile tests requiring constant mock updates
- Limited confidence in real-world behavior

### After
- All tests passing with simplified structure
- Focused unit tests on essential logic
- Comprehensive integration test coverage
- Maintainable test suite

## Test Execution

- **Unit Tests**: `pnpm test:unit` (focuses on src/ directory)
- **Integration Tests**: Included in unit test run
- **Compatibility Tests**: `pnpm test:compatibility` (separate test suite)

This strategy provides the right balance between test coverage, maintainability, and confidence in the codebase.