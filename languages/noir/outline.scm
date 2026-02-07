; Functions
(function_definition
  name: (identifier) @name) @item

; Structs
(struct_definition
  name: (type_identifier) @name) @item

; Traits
(trait_definition
  name: (type_identifier) @name) @item

; Impl blocks
(impl_block
  type: (type_identifier) @name) @item

(impl_block
  type: (generic_type
    (type_identifier) @name)) @item

; Type aliases
(type_alias
  name: (type_identifier) @name) @item

; Modules
(module_declaration
  name: (identifier) @name) @item

; Globals
(global_declaration
  name: (identifier) @name) @item
