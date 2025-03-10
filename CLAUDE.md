# html2thermal Project Guidelines

## Commands
- Run all tests: `npm test`
- Run specific test: `npx mocha -g "test pattern"`

## Code Style
- **Modules**: CommonJS (`require`/`module.exports`)
- **Variables**: Prefer `const`, use `let` when needed
- **Functions**: Use arrow functions for simple cases
- **Naming**: camelCase for variables/functions/files
- **Indentation**: 2 spaces
- **Strings**: Single quotes
- **File Organization**:
  - Tag handlers in `src/convert/[tagName]TagHandler.js`
  - Utility functions in `src/utils/`

## Patterns
- Functional approach with minimal state
- Handler pattern for different HTML tags
- Central processing in `src/convert/index.js`
- Return `null` for special conditions instead of throwing errors
- Tests use Mocha with describe/it blocks and assert.deepStrictEqual

## Dependencies
- Core: cheerio, sanitize-html, jimp, lodash, node-thermal-printer
- Test: mocha, probe-image-size