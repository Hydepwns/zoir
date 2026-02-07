# Zoir

Noir zero-knowledge language support for [Zed](https://zed.dev).

## Features

- **Syntax highlighting** - Full highlighting for Noir keywords, types, operators, and ZK-specific constructs
- **Language server integration** - Powered by `nargo lsp` for diagnostics, hover, go-to-definition, and completions
- **Document outline** - Navigate functions, structs, traits, and modules
- **Bracket matching** - Including generic angle brackets
- **Auto-indentation** - Smart indentation for blocks and expressions
- **Vim text objects** - Function, class, parameter, and block selections

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
2. **Automatic download** - Downloads from GitHub releases if not found

Install nargo manually with noirup:

```bash
curl -L https://raw.githubusercontent.com/noir-lang/noirup/refs/heads/main/install | bash
noirup
```

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
