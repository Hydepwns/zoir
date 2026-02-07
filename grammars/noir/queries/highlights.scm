; Keywords
[
  "as"
  "break"
  "comptime"
  "constrain"
  "continue"
  "crate"
  "else"
  "fn"
  "for"
  "global"
  "if"
  "impl"
  "in"
  "let"
  "loop"
  "match"
  "mod"
  "mut"
  "pub"
  "return"
  "self"
  "Self"
  "struct"
  "super"
  "trait"
  "type"
  "unconstrained"
  "unsafe"
  "use"
  "where"
  "while"
] @keyword

[
  "assert"
  "assert_eq"
] @keyword.control

"quote" @keyword.special

; Operators
[
  "+"
  "-"
  "*"
  "/"
  "%"
  "!"
  "&&"
  "||"
  "&"
  "|"
  "^"
  "<<"
  ">>"
  "="
  "+="
  "-="
  "*="
  "/="
  "%="
  "&="
  "|="
  "^="
  "<<="
  ">>="
  "=="
  "!="
  "<"
  ">"
  "<="
  ">="
  ".."
] @operator

[
  ";"
  ":"
  "::"
  ","
  "."
  "->"
  "=>"
  "#"
] @punctuation.delimiter

[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
  "<"
  ">"
] @punctuation.bracket

; Types
(primitive_type) @type.builtin

(type_identifier) @type

(scoped_type_identifier
  name: (type_identifier) @type)

(generic_type
  (type_identifier) @type)

; Functions
(function_definition
  name: (identifier) @function)

(trait_function_declaration
  name: (identifier) @function)

(call_expression
  function: (identifier) @function.call)

(call_expression
  function: (scoped_identifier
    name: (identifier) @function.call))

(method_call_expression
  method: (identifier) @function.method)

(generic_function
  (identifier) @function.call)

(generic_function
  (scoped_identifier
    name: (identifier) @function.call))

; Variables and parameters
(parameter
  (pattern
    (identifier) @variable.parameter))

(self_parameter) @variable.builtin
(self_expression) @variable.builtin

(let_statement
  pattern: (pattern
    (identifier) @variable))

(for_statement
  pattern: (pattern
    (identifier) @variable))

(closure_parameter
  (pattern
    (identifier) @variable.parameter))

; Fields
(field_expression
  field: (identifier) @property)

(struct_field
  name: (identifier) @property)

(field_initializer
  (identifier) @property)

(field_pattern
  (identifier) @property)

; Struct and trait definitions
(struct_definition
  name: (type_identifier) @type.definition)

(trait_definition
  name: (type_identifier) @type.definition)

(impl_block
  type: (type_identifier) @type)

(type_alias
  name: (type_identifier) @type.definition)

; Module and use
(module_declaration
  name: (identifier) @module)

(use_tree
  (identifier) @module)

(use_tree
  (scoped_identifier
    name: (identifier) @type)
  "as"
  (identifier) @type)

; Attributes
(attribute) @attribute

(attribute_item
  (identifier) @attribute)

; Literals
(integer_literal) @number

(string_literal) @string

(format_string_literal) @string.special

(escape_sequence) @string.escape

(interpolation
  "{" @punctuation.special
  "}" @punctuation.special)

(boolean_literal) @boolean

; Comments
(line_comment) @comment

(block_comment) @comment

; Global
(global_declaration
  name: (identifier) @variable.global)

; Type parameters
(type_parameter
  name: (type_identifier) @type.parameter)

(const_parameter
  (identifier) @variable.parameter)

; Wildcards
(wildcard_pattern) @variable.builtin

; Error
(ERROR) @error
