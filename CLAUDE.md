# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Zoir is a Zed editor extension providing Noir zero-knowledge language support. It includes a custom tree-sitter grammar and LSP integration with nargo.

## Key Commands

```bash
# One-time: add WASM target for building
rustup target add wasm32-wasip1

# Build extension for Zed
cargo build --release --target wasm32-wasip1

# Check Rust compilation
cargo check --target wasm32-wasip1

# Generate tree-sitter parser (from grammars/noir/)
npm install && npx tree-sitter generate

# Run grammar tests (from grammars/noir/)
npm test

# Parse a file to verify grammar (from grammars/noir/)
npx tree-sitter parse <file.nr>
```

## Architecture

### LSP Integration (src/lib.rs)

Three-tier nargo binary discovery:
1. PATH lookup via `worktree.which("nargo")` - respects noirup installations
2. Cached binary path from previous download
3. GitHub release download from `noir-lang/noir`

Platform asset mapping:
- macOS ARM64: `nargo-aarch64-apple-darwin.tar.gz`
- macOS x86: `nargo-x86_64-apple-darwin.tar.gz`
- Linux ARM64: `nargo-aarch64-unknown-linux-gnu.tar.gz`
- Linux x86: `nargo-x86_64-unknown-linux-gnu.tar.gz`
- Windows: Not available (noir-lang doesn't provide Windows binaries; users must build from source)

### Tree-sitter Grammar (grammars/noir/)

The grammar supports:
- Keywords: `fn`, `struct`, `enum`, `impl`, `mod`, `use`, `let`, `mut`, `pub`, `for`, `if`, `else`, `match`, `return`, `global`, `comptime`, `unconstrained`
- Types: `Field`, `bool`, `u8`-`u128`, `i8`-`i128`, `str`, arrays, tuples, generics
- ZK-specific: `assert`, `assert_eq`, `constrain`, `#[recursive]`, visibility on parameters (`pub`)
- Operators, comments, attributes, closures, ranges

### Query Files

Two query locations serve different purposes:
- `grammars/noir/queries/` - Used by tree-sitter (highlights, locals, injections)
- `languages/noir/` - Used by Zed editor (config, highlights, brackets, outline, indents, textobjects)

## Development Notes

### Test Corpus

Grammar tests are in `grammars/noir/test/corpus/`. Each file covers a category:
- `functions.txt` - function definitions, attributes, generics
- `structs.txt` - struct definitions and fields
- `enums.txt` - enum definitions with unit, tuple, struct variants
- `traits.txt` - traits, impl blocks
- `types.txt` - primitive, array, tuple, reference types
- `expressions.txt` - binary, unary, call, closure expressions
- `statements.txt` - let, for, if, match statements
- `patterns.txt` - destructuring patterns
- `modules.txt` - mod, use declarations
- `literals.txt` - integers, strings, booleans
- `comments.txt` - line and block comments
- `zk_specific.txt` - assert, constrain, comptime, global

### Adding New Syntax

1. Update `grammars/noir/grammar.js` with new rules
2. Run `npx tree-sitter generate` to regenerate parser
3. Add test cases to appropriate `test/corpus/*.txt` file
4. Run `npm test` to verify grammar tests pass
5. Test with `npx tree-sitter parse <file.nr>` - ERROR nodes indicate parsing failures
6. Update query files if new node types need highlighting

### Grammar Conflicts

Conflicts are declared in `grammar.js` conflicts array. Current conflicts handle:
- Type vs expression ambiguity in generics
- `mut` pattern vs let statement
- `self` as expression vs keyword
- Unary operators (`&`, `*`) vs reference/dereference expressions

### Visibility Modifiers

Two visibility rules exist to avoid parsing conflicts:
- `visibility_modifier` - supports `pub`, `pub(crate)`, `pub(super)` for items
- `parameter_visibility` - just `pub` for function parameters (avoids conflict with tuple types like `pub (Field, Field)`)

### Const Generics and Turbofish

- Const generic parameters use `let` syntax: `<T, let N: u32>`
- Array lengths and repeat counts accept `type_identifier` for const generics: `[T; MaxLen]`
- Binary expression right operands accept `type_identifier` for comparisons: `len < MaxLen`
- Method calls with explicit generics use turbofish syntax: `foo.bar::<T>()` (not `foo.bar<T>()`)
  - This disambiguates `foo.bar < y` (comparison) from generic method calls

### Known Limitations

- `Field` parses as `type_identifier` instead of `primitive_type` because it matches the `type_identifier` regex (`/[A-Z][a-zA-Z0-9_]*/`). This doesn't affect syntax highlighting since both are styled as types.
- Some advanced stdlib patterns may not parse (complex trait bounds, certain nested generics)

### Future: Code Folding

Zed does not yet support `folds.scm` (see [Issue #22703](https://github.com/zed-industries/zed/issues/22703)). When support is added, create `languages/noir/folds.scm` targeting block, struct_body, impl_body, trait_body, and match_expression nodes.

## References

- Noir language docs: https://noir-lang.org/docs/
- Noir compiler: https://github.com/noir-lang/noir
- Zed extension API: https://github.com/zed-industries/zed/tree/main/crates/zed_extension_api
- Tree-sitter docs: https://tree-sitter.github.io/tree-sitter/

## License

MIT OR Apache-2.0
