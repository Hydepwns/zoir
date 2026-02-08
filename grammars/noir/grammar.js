/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const PREC = {
  call: 15,
  field: 14,
  unary: 13,
  cast: 12,
  multiplicative: 11,
  additive: 10,
  shift: 9,
  bitand: 8,
  bitxor: 7,
  bitor: 6,
  comparative: 5,
  and: 4,
  or: 3,
  range: 2,
  assign: 1,
  closure: 0,
};

// Comma-separated list helpers with optional trailing comma
/** @param {RuleOrLiteral} item */
const comma_list1 = (item) => seq(item, repeat(seq(",", item)), optional(","));
/** @param {RuleOrLiteral} item */
const comma_list = (item) => optional(comma_list1(item));

module.exports = grammar({
  name: "noir",

  extras: ($) => [/\s/, $.line_comment, $.block_comment],

  word: ($) => $.identifier,

  conflicts: ($) => [
    [$.unit_type, $.unit_expression],
    [$.unary_expression, $.reference_expression],
    [$.unary_expression, $.dereference_expression],
    [$.mut_pattern, $.reference_pattern],
    [$.mut_pattern, $.closure_parameter],
    [$._type, $.generic_type],
    [$.mut_pattern, $.let_statement],
    [$._statement, $._expression],
  ],

  rules: {
    source_file: ($) => repeat($._item),

    _item: ($) =>
      choice(
        $.function_definition,
        $.struct_definition,
        $.enum_definition,
        $.impl_block,
        $.trait_definition,
        $.type_alias,
        $.module_declaration,
        $.use_declaration,
        $.global_declaration,
      ),

    // Attributes
    attribute: ($) => seq("#", "[", comma_list1($.attribute_item), "]"),

    attribute_item: ($) =>
      seq($.identifier, optional(seq("(", optional($.attribute_arguments), ")"))),

    attribute_arguments: ($) => comma_list1(choice($._expression, $.type_identifier)),

    // Function definition
    function_definition: ($) =>
      seq(
        repeat($.attribute),
        optional($.visibility_modifier),
        optional("unconstrained"),
        optional("comptime"),
        "fn",
        field("name", $.identifier),
        optional($.type_parameters),
        $.parameters,
        optional(seq("->", field("return_type", $._type))),
        optional($.where_clause),
        $.block,
      ),

    visibility_modifier: ($) => seq("pub", optional(seq("(", $.visibility_restriction, ")"))),

    visibility_restriction: (_) => choice("crate", "super"),

    // Parameter visibility is just "pub" without restrictions to avoid conflict with tuple types
    parameter_visibility: (_) => "pub",

    parameters: ($) => seq("(", comma_list($.parameter), ")"),

    parameter: ($) =>
      choice(
        $.self_parameter,
        seq($.pattern, optional(seq(":", optional($.parameter_visibility), $._type))),
      ),

    self_parameter: ($) => seq(optional("&"), optional("mut"), "self"),

    // Struct definition
    struct_definition: ($) =>
      seq(
        repeat($.attribute),
        optional($.visibility_modifier),
        "struct",
        field("name", $.type_identifier),
        optional($.type_parameters),
        optional($.where_clause),
        $.struct_body,
      ),

    struct_body: ($) => seq("{", comma_list($.struct_field), "}"),

    struct_field: ($) =>
      seq(
        repeat($.attribute),
        optional($.visibility_modifier),
        field("name", $.identifier),
        ":",
        field("type", $._type),
      ),

    // Enum definition
    enum_definition: ($) =>
      seq(
        repeat($.attribute),
        optional($.visibility_modifier),
        "enum",
        field("name", $.type_identifier),
        optional($.type_parameters),
        optional($.where_clause),
        $.enum_body,
      ),

    enum_body: ($) => seq("{", comma_list($.enum_variant), "}"),

    enum_variant: ($) =>
      seq(
        repeat($.attribute),
        field("name", $.identifier),
        optional(choice($.enum_tuple_fields, $.enum_struct_fields)),
      ),

    enum_tuple_fields: ($) => seq("(", comma_list($._type), ")"),

    enum_struct_fields: ($) => seq("{", comma_list($.struct_field), "}"),

    // Impl block
    impl_block: ($) =>
      seq(
        repeat($.attribute),
        "impl",
        optional($.type_parameters),
        field("trait", optional(seq($._type, "for"))),
        field("type", $._type),
        optional($.where_clause),
        $.impl_body,
      ),

    impl_body: ($) => seq("{", repeat($.function_definition), "}"),

    // Trait definition
    trait_definition: ($) =>
      seq(
        repeat($.attribute),
        optional($.visibility_modifier),
        "trait",
        field("name", $.type_identifier),
        optional($.type_parameters),
        optional($.where_clause),
        $.trait_body,
      ),

    trait_body: ($) =>
      seq("{", repeat(choice($.function_definition, $.trait_function_declaration)), "}"),

    trait_function_declaration: ($) =>
      seq(
        repeat($.attribute),
        "fn",
        field("name", $.identifier),
        optional($.type_parameters),
        $.parameters,
        optional(seq("->", field("return_type", $._type))),
        optional($.where_clause),
        ";",
      ),

    // Type alias
    type_alias: ($) =>
      seq(
        repeat($.attribute),
        optional($.visibility_modifier),
        "type",
        field("name", $.type_identifier),
        optional($.type_parameters),
        "=",
        field("type", $._type),
        ";",
      ),

    // Module declaration
    module_declaration: ($) =>
      seq(
        repeat($.attribute),
        optional($.visibility_modifier),
        "mod",
        field("name", $.identifier),
        choice(";", seq("{", repeat($._item), "}")),
      ),

    // Use declaration
    use_declaration: ($) => seq(optional($.visibility_modifier), "use", $.use_tree, ";"),

    use_tree: ($) =>
      choice(
        $.use_wildcard,
        $.use_list,
        $.use_as_clause,
        $.scoped_use_list,
        $.scoped_identifier,
        $.identifier,
      ),

    use_wildcard: ($) =>
      seq(
        optional(seq(choice($.identifier, $.scoped_identifier, "crate", "super", "self"), "::")),
        "*",
      ),

    use_list: ($) => seq("{", comma_list($.use_tree), "}"),

    scoped_use_list: ($) =>
      seq(choice($.identifier, $.scoped_identifier, "crate", "super", "self"), "::", $.use_list),

    use_as_clause: ($) => seq(choice($.identifier, $.scoped_identifier), "as", $.identifier),

    // Global declaration
    global_declaration: ($) =>
      seq(
        repeat($.attribute),
        optional($.visibility_modifier),
        optional("comptime"),
        "global",
        field("name", $.identifier),
        optional(seq(":", field("type", $._type))),
        "=",
        field("value", $._expression),
        ";",
      ),

    // Type parameters
    type_parameters: ($) => seq("<", comma_list1($.type_parameter), ">"),

    type_parameter: ($) =>
      seq(
        field("name", choice($.type_identifier, $.const_parameter)),
        optional(seq(":", $.trait_bounds)),
      ),

    const_parameter: ($) => seq("let", $.identifier, ":", $._type),

    trait_bounds: ($) => seq($._type, repeat(seq("+", $._type))),

    where_clause: ($) => seq("where", comma_list1($.where_predicate)),

    where_predicate: ($) => seq($._type, ":", $.trait_bounds),

    // Types
    _type: ($) =>
      choice(
        $.primitive_type,
        $.type_identifier,
        $.generic_type,
        $.scoped_type_identifier,
        $.reference_type,
        $.mutable_reference_type,
        $.array_type,
        $.slice_type,
        $.tuple_type,
        $.function_type,
        $.unit_type,
        $.parenthesized_type,
      ),

    primitive_type: (_) =>
      choice(
        "Field",
        "bool",
        "u1",
        "u8",
        "u16",
        "u32",
        "u64",
        "u128",
        "i8",
        "i16",
        "i32",
        "i64",
        "i128",
        "str",
        "fmtstr",
      ),

    type_identifier: (_) => /[A-Z][a-zA-Z0-9_]*/,

    generic_type: ($) => seq(choice($.type_identifier, $.scoped_type_identifier), $.type_arguments),

    type_arguments: ($) => seq("<", comma_list1($._type_argument), ">"),

    _type_argument: ($) => choice($._type, $._expression),

    scoped_type_identifier: ($) =>
      seq(
        choice($.identifier, $.scoped_identifier, "crate", "super", "self"),
        "::",
        $.type_identifier,
      ),

    reference_type: ($) => seq("&", $._type),

    mutable_reference_type: ($) => seq("&", "mut", $._type),

    array_type: ($) =>
      seq(
        "[",
        field("element", $._type),
        ";",
        field("length", choice($._expression, $.type_identifier)),
        "]",
      ),

    slice_type: ($) => seq("[", $._type, "]"),

    // Tuple requires at least 2 elements (single element would be parenthesized_type)
    tuple_type: ($) => seq("(", $._type, ",", comma_list($._type), ")"),

    function_type: ($) => seq("fn", "(", comma_list($._type), ")", optional(seq("->", $._type))),

    unit_type: (_) => seq("(", ")"),

    parenthesized_type: ($) => seq("(", $._type, ")"),

    // Patterns
    pattern: ($) =>
      choice(
        $.identifier,
        $.tuple_pattern,
        $.struct_pattern,
        $.wildcard_pattern,
        $.mut_pattern,
        $.reference_pattern,
      ),

    tuple_pattern: ($) => seq("(", comma_list($.pattern), ")"),

    struct_pattern: ($) =>
      seq(
        choice($.type_identifier, $.scoped_type_identifier),
        "{",
        comma_list($.field_pattern),
        "}",
      ),

    field_pattern: ($) => choice(seq($.identifier, ":", $.pattern), $.identifier, ".."),

    wildcard_pattern: (_) => "_",

    mut_pattern: ($) => seq("mut", $.pattern),

    reference_pattern: ($) => seq("&", optional("mut"), $.pattern),

    // Statements
    block: ($) => seq("{", repeat($._statement), optional($._expression), "}"),

    _statement: ($) =>
      choice(
        $.let_statement,
        $.expression_statement,
        $.for_statement,
        $.loop_statement,
        $.while_statement,
        $.return_statement,
        $.break_statement,
        $.continue_statement,
        $.assert_statement,
        $.constrain_statement,
        $.if_expression,
        $.match_expression,
        $._item,
      ),

    let_statement: ($) =>
      seq(
        optional("comptime"),
        "let",
        optional("mut"),
        field("pattern", $.pattern),
        optional(seq(":", field("type", $._type))),
        optional(seq("=", field("value", $._expression))),
        ";",
      ),

    expression_statement: ($) => seq($._expression, ";"),

    for_statement: ($) =>
      seq(
        "for",
        field("pattern", $.pattern),
        "in",
        field("iterator", $._expression),
        field("body", $.block),
      ),

    loop_statement: ($) => seq("loop", $.block),

    while_statement: ($) => seq("while", field("condition", $._expression), field("body", $.block)),

    return_statement: ($) => seq("return", optional($._expression), ";"),

    break_statement: (_) => seq("break", ";"),

    continue_statement: (_) => seq("continue", ";"),

    assert_statement: ($) =>
      seq(
        choice("assert", "assert_eq"),
        "(",
        $._expression,
        repeat(seq(",", $._expression)),
        optional(","),
        ")",
        ";",
      ),

    constrain_statement: ($) => seq("constrain", $._expression, ";"),

    // Expressions
    _expression: ($) =>
      choice(
        $.identifier,
        $.scoped_identifier,
        $.self_expression,
        $._literal,
        $.unary_expression,
        $.binary_expression,
        $.call_expression,
        $.method_call_expression,
        $.field_expression,
        $.index_expression,
        $.array_expression,
        $.tuple_expression,
        $.struct_expression,
        $.if_expression,
        $.match_expression,
        $.closure_expression,
        $.block,
        $.parenthesized_expression,
        $.cast_expression,
        $.reference_expression,
        $.dereference_expression,
        $.range_expression,
        $.unit_expression,
        $.generic_function,
        $.comptime_expression,
        $.unsafe_expression,
        $.quote_expression,
      ),

    self_expression: (_) => "self",

    identifier: (_) => /[a-zA-Z_][a-zA-Z0-9_]*/,

    scoped_identifier: ($) =>
      seq(
        choice($.identifier, $.scoped_identifier, "crate", "super", "self", "Self"),
        "::",
        $.identifier,
      ),

    _literal: ($) =>
      choice($.integer_literal, $.string_literal, $.format_string_literal, $.boolean_literal),

    integer_literal: (_) =>
      token(choice(/0x[0-9a-fA-F_]+/, /0b[01_]+/, /0o[0-7_]+/, /[0-9][0-9_]*/)),

    string_literal: ($) => seq('"', repeat(choice($.escape_sequence, /[^"\\]+/)), '"'),

    format_string_literal: ($) =>
      seq("f", '"', repeat(choice($.escape_sequence, $.interpolation, /[^"\\{]+/)), '"'),

    interpolation: ($) => seq("{", $._expression, "}"),

    escape_sequence: (_) =>
      token.immediate(seq("\\", choice(/[\\'"nrt0]/, /x[0-9a-fA-F]{2}/, /u\{[0-9a-fA-F]+\}/))),

    boolean_literal: (_) => choice("true", "false"),

    unary_expression: ($) =>
      prec(PREC.unary, seq(choice("-", "!", "&", "&mut", "*"), $._expression)),

    binary_expression: ($) =>
      choice(
        .../** @type {[string, number][]} */ ([
          ["+", PREC.additive],
          ["-", PREC.additive],
          ["*", PREC.multiplicative],
          ["/", PREC.multiplicative],
          ["%", PREC.multiplicative],
          ["==", PREC.comparative],
          ["!=", PREC.comparative],
          ["<", PREC.comparative],
          [">", PREC.comparative],
          ["<=", PREC.comparative],
          [">=", PREC.comparative],
          ["&&", PREC.and],
          ["||", PREC.or],
          ["&", PREC.bitand],
          ["|", PREC.bitor],
          ["^", PREC.bitxor],
          ["<<", PREC.shift],
          [">>", PREC.shift],
          ["=", PREC.assign],
          ["+=", PREC.assign],
          ["-=", PREC.assign],
          ["*=", PREC.assign],
          ["/=", PREC.assign],
          ["%=", PREC.assign],
          ["&=", PREC.assign],
          ["|=", PREC.assign],
          ["^=", PREC.assign],
          ["<<=", PREC.assign],
          [">>=", PREC.assign],
        ]).map(([operator, precedence]) =>
          prec.left(
            precedence,
            seq(
              field("left", $._expression),
              field("operator", operator),
              field("right", choice($._expression, $.type_identifier)),
            ),
          ),
        ),
      ),

    call_expression: ($) =>
      prec(PREC.call, seq(field("function", $._expression), "(", comma_list($._expression), ")")),

    method_call_expression: ($) =>
      prec(
        PREC.call,
        seq(
          field("receiver", $._expression),
          ".",
          field("method", $.identifier),
          optional($.turbofish),
          "(",
          comma_list($._expression),
          ")",
        ),
      ),

    // Turbofish syntax for explicit type arguments: ::<T>
    turbofish: ($) => seq("::", $.type_arguments),

    field_expression: ($) =>
      prec(
        PREC.field,
        seq(
          field("value", $._expression),
          ".",
          field("field", choice($.identifier, $.integer_literal)),
        ),
      ),

    index_expression: ($) =>
      prec(PREC.call, seq(field("value", $._expression), "[", field("index", $._expression), "]")),

    array_expression: ($) =>
      seq(
        "[",
        choice(
          comma_list1($._expression),
          seq($._expression, ";", choice($._expression, $.type_identifier)),
        ),
        "]",
      ),

    // Tuple requires at least 2 elements (single element would be parenthesized_expression)
    tuple_expression: ($) => seq("(", $._expression, ",", comma_list($._expression), ")"),

    unit_expression: (_) => seq("(", ")"),

    struct_expression: ($) =>
      seq(
        field("name", choice($.type_identifier, $.scoped_type_identifier, $.generic_type)),
        "{",
        comma_list($.field_initializer),
        "}",
      ),

    field_initializer: ($) => choice(seq($.identifier, ":", $._expression), $.identifier),

    if_expression: ($) =>
      seq(
        "if",
        field("condition", $._expression),
        field("consequence", $.block),
        optional(seq("else", field("alternative", choice($.block, $.if_expression)))),
      ),

    match_expression: ($) =>
      seq("match", field("value", $._expression), "{", repeat($.match_arm), "}"),

    match_arm: ($) =>
      seq(
        field("pattern", $.match_pattern),
        "=>",
        field("value", choice($._expression, seq($._expression, ","))),
      ),

    match_pattern: ($) =>
      choice($.pattern, $._literal, prec.left(seq($.match_pattern, "|", $.match_pattern))),

    closure_expression: ($) =>
      prec.left(
        PREC.call,
        seq(
          "|",
          comma_list($.closure_parameter),
          "|",
          optional(seq("->", $._type)),
          choice($.block, $._expression),
        ),
      ),

    closure_parameter: ($) => seq(optional("mut"), $.pattern, optional(seq(":", $._type))),

    parenthesized_expression: ($) => seq("(", $._expression, ")"),

    cast_expression: ($) => prec(PREC.cast, seq($._expression, "as", $._type)),

    reference_expression: ($) => prec(PREC.unary, seq("&", optional("mut"), $._expression)),

    dereference_expression: ($) => prec(PREC.unary, seq("*", $._expression)),

    range_expression: ($) =>
      prec.left(
        PREC.range,
        choice(
          seq($._expression, "..", $._expression),
          seq($._expression, ".."),
          seq("..", $._expression),
          "..",
        ),
      ),

    generic_function: ($) =>
      prec(PREC.call, seq(choice($.identifier, $.scoped_identifier), "::", $.type_arguments)),

    comptime_expression: ($) => seq("comptime", $.block),

    unsafe_expression: ($) => seq("unsafe", $.block),

    quote_expression: ($) => seq("quote", $.block),

    // Comments
    line_comment: (_) => token(seq("//", /[^\n]*/)),

    block_comment: (_) => token(seq("/*", /[^*]*\*+([^/*][^*]*\*+)*/, "/")),
  },
});
