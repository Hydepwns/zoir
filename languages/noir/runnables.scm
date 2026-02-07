; Noir test function
; Matches functions with #[test] attribute
(
    (function_definition
        (attribute
            (attribute_item
                (identifier) @_attribute
                (#eq? @_attribute "test")
            )
        )
        name: (identifier) @run
    )
    (#set! tag noir-test)
)

; Noir main function
(
    (function_definition
        name: (identifier) @run
        (#eq? @run "main")
    )
    (#set! tag noir-main)
)
