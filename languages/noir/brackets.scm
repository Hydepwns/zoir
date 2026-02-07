; Bracket pairs
("{" @open "}" @close)
("[" @open "]" @close)
("(" @open ")" @close)

; Generic angle brackets
(type_arguments
  "<" @open
  ">" @close)

(type_parameters
  "<" @open
  ">" @close)
