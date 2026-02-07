# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

Zoir is a Zed editor extension providing Noir zero-knowledge language support. It includes a custom tree-sitter grammar and LSP integration with nargo.

## Key Commands

```bash
# Build extension for Zed
cargo build --release --target wasm32-wasip1

# Generate tree-sitter parser
cd grammars/noir && npm install && npx tree-sitter generate

# Test parser against a file
cd grammars/noir && npx tree-sitter parse <file.nr>

# Check Rust compilation
cargo check --target wasm32-wasip1
```

## Architecture

### Extension Structure

| Path | Purpose |
|------|---------|
| `extension.toml` | Zed extension manifest |
| `src/lib.rs` | LSP binary management (nargo discovery/download) |
| `grammars/noir/grammar.js` | Tree-sitter grammar definition |
| `grammars/noir/queries/` | Grammar queries (highlights, locals) |
| `languages/noir/` | Zed-specific language config and queries |

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

### Tree-sitter Grammar (grammars/noir/)

The grammar supports:
- Keywords: `fn`, `struct`, `impl`, `mod`, `use`, `let`, `mut`, `pub`, `for`, `if`, `else`, `match`, `return`, `global`, `comptime`, `unconstrained`
- Types: `Field`, `bool`, `u8`-`u128`, `i8`-`i128`, `str`, arrays, tuples, generics
- ZK-specific: `assert`, `assert_eq`, `constrain`, `#[recursive]`, visibility on parameters (`pub`)
- Operators, comments, attributes, closures, ranges

### Query Files

**grammars/noir/queries/** - Used by tree-sitter:
- `highlights.scm` - Syntax highlighting rules
- `locals.scm` - Scope and definition tracking
- `injections.scm` - Language injections (minimal)

**languages/noir/** - Used by Zed:
- `config.toml` - File associations, comments, brackets
- `highlights.scm` - Zed-specific highlighting
- `brackets.scm` - Bracket matching pairs
- `outline.scm` - Document symbols (functions, structs, etc.)
- `indents.scm` - Auto-indentation rules
- `textobjects.scm` - Vim-style text object selections

## Development Notes

### Adding New Syntax

1. Update `grammars/noir/grammar.js` with new rules
2. Run `npx tree-sitter generate` to regenerate parser
3. Test with `npx tree-sitter parse <file.nr>`
4. Update query files if new node types need highlighting

### Grammar Conflicts

Conflicts are declared in `grammar.js` conflicts array. Current conflicts handle:
- Type vs expression ambiguity in generics
- `mut` pattern vs let statement
- `self` as expression vs keyword
- Unary operators (`&`, `*`) vs reference/dereference expressions

### Testing

Test the parser against real Noir code:
```bash
cd grammars/noir
npx tree-sitter parse /path/to/noir/project/src/main.nr
```

Check for ERROR nodes in output - these indicate parsing failures.

## References

- Noir language docs: https://noir-lang.org/docs/
- Noir compiler: https://github.com/noir-lang/noir
- Zed extension API: https://github.com/zed-industries/zed/tree/main/crates/zed_extension_api
- Tree-sitter docs: https://tree-sitter.github.io/tree-sitter/

## License

MIT OR Apache-2.0
