# Zoir

Noir zero-knowledge language support for [Zed](https://zed.dev).

## Features

- **Syntax highlighting** - Full highlighting for Noir keywords, types, operators, and ZK-specific constructs
- **Language server integration** - Powered by `nargo lsp` for diagnostics, hover, go-to-definition, and completions
- **Document outline** - Navigate functions, structs, traits, and modules
- **Bracket matching** - Including generic angle brackets
- **Auto-indentation** - Smart indentation for blocks and expressions
- **Vim text objects** - Function, class, parameter, and block selections
- **Runnable detection** - Detect `#[test]` functions and `main` for one-click execution

## Installation

### From Zed Extensions

1. Open Zed
2. Press `Cmd+Shift+X` (or `Ctrl+Shift+X` on Linux)
3. Search for "Zoir"
4. Click Install

### Manual Installation

Clone this repository into your Zed extensions directory:

```bash
git clone https://github.com/Hydepwns/zoir ~/.config/zed/extensions/zoir
```

## Requirements

### Language Server (nargo)

The extension automatically manages the `nargo` LSP binary:

1. **PATH lookup** - Uses `nargo` from PATH if available (respects [noirup](https://noir-lang.org/docs/getting_started/installation/) installations)
2. **Automatic download** - Downloads from GitHub releases if not found (macOS/Linux only)

#### macOS / Linux

Install nargo with noirup:

```bash
curl -L https://raw.githubusercontent.com/noir-lang/noirup/refs/heads/main/install | bash
noirup
```

#### Windows

Noir does not provide pre-built Windows binaries. You must build from source:

1. Install [Rust](https://rustup.rs/)
2. Clone and build nargo:
   ```powershell
   git clone https://github.com/noir-lang/noir
   cd noir
   cargo build --release -p nargo
   ```
3. Add `target\release` to your PATH

## Configuration

Configure the language server in your Zed settings (`~/.config/zed/settings.json`):

```json
{
  "lsp": {
    "nargo": {
      "settings": {
        "args": []
      }
    }
  }
}
```

### Running Tests

To enable one-click test running, add task templates to `~/.config/zed/tasks.json`:

```json
[
  {
    "label": "Noir: Run Test",
    "command": "nargo",
    "args": ["test", "--exact", "$ZED_CUSTOM_run"],
    "tags": ["noir-test"]
  },
  {
    "label": "Noir: Execute",
    "command": "nargo",
    "args": ["execute"],
    "tags": ["noir-main"]
  }
]
```

After adding these, you'll see run indicators next to `#[test]` functions and `main`.

## Noir Language

[Noir](https://noir-lang.org/) is a domain-specific language for zero-knowledge proofs. It enables writing private applications and verifiable computations.

Example:

```noir
fn main(x: Field, y: pub Field) {
    assert(x != y);
}

#[test]
fn test_main() {
    main(1, 2);
}
```

## Development

### Build the extension

```bash
cargo build --release --target wasm32-wasip1
```

### Generate the tree-sitter parser

```bash
cd grammars/noir
npm install
npx tree-sitter generate
```

### Test the grammar

```bash
cd grammars/noir
npx tree-sitter test
```

## License

MIT OR Apache-2.0
