; Functions (including nested in impl/trait)
(function_definition
  (visibility_modifier)? @context
  "fn" @context
  name: (identifier) @name) @item

; Trait function declarations
(trait_function_declaration
  "fn" @context
  name: (identifier) @name) @item

; Structs
(struct_definition
  (visibility_modifier)? @context
  "struct" @context
  name: (type_identifier) @name) @item

; Struct fields
(struct_field
  (visibility_modifier)? @context
  name: (identifier) @name) @item

; Enums
(enum_definition
  (visibility_modifier)? @context
  "enum" @context
  name: (type_identifier) @name) @item

; Enum variants
(enum_variant
  name: (identifier) @name) @item

; Traits
(trait_definition
  (visibility_modifier)? @context
  "trait" @context
  name: (type_identifier) @name) @item

; Impl blocks (simple type)
(impl_block
  "impl" @context
  type: (type_identifier) @name) @item

; Impl blocks (generic type)
(impl_block
  "impl" @context
  type: (generic_type
    (type_identifier) @name)) @item

; Impl blocks (trait for type)
(impl_block
  "impl" @context
  trait: (type_identifier) @context
  "for" @context
  type: (type_identifier) @name) @item

; Type aliases
(type_alias
  (visibility_modifier)? @context
  "type" @context
  name: (type_identifier) @name) @item

; Modules
(module_declaration
  (visibility_modifier)? @context
  "mod" @context
  name: (identifier) @name) @item

; Globals
(global_declaration
  (visibility_modifier)? @context
  "global" @context
  name: (identifier) @name) @item
