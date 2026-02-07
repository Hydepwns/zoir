; Scopes
(block) @local.scope
(function_definition) @local.scope
(closure_expression) @local.scope
(for_statement) @local.scope
(while_statement) @local.scope
(loop_statement) @local.scope
(if_expression) @local.scope
(match_arm) @local.scope
(impl_block) @local.scope
(trait_definition) @local.scope
(struct_definition) @local.scope
(enum_definition) @local.scope
(module_declaration) @local.scope

; Definitions
(function_definition
  name: (identifier) @local.definition)

(let_statement
  pattern: (pattern
    (identifier) @local.definition))

(for_statement
  pattern: (pattern
    (identifier) @local.definition))

(parameter
  (pattern
    (identifier) @local.definition))

(closure_parameter
  (pattern
    (identifier) @local.definition))

(type_parameter
  name: (type_identifier) @local.definition)

(const_parameter
  (identifier) @local.definition)

(struct_definition
  name: (type_identifier) @local.definition)

(enum_definition
  name: (type_identifier) @local.definition)

(enum_variant
  name: (identifier) @local.definition)

(trait_definition
  name: (type_identifier) @local.definition)

(type_alias
  name: (type_identifier) @local.definition)

(global_declaration
  name: (identifier) @local.definition)

(struct_field
  name: (identifier) @local.definition)

; References
(identifier) @local.reference
(type_identifier) @local.reference
