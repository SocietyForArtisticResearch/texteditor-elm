module Snippets exposing (Snippet(..), snippet)


type Snippet
    = Bold
    | Italic
    | H1
    | H2
    | H3
    | H4
    | Bullet
    | Numbered
    | Quote
    | Link


snippet : Snippet -> ( String, Int )
snippet s =
    case s of
        Bold ->
            ( "****", -2 )

        Italic ->
            ( "__", -1 )

        H1 ->
            ( "# ", 0 )

        H2 ->
            ( "## ", 0 )

        H3 ->
            ( "### ", 0 )

        H4 ->
            ( "#### ", 0 )

        Bullet ->
            ( "* ", 0 )

        Numbered ->
            ( "1. ", 0 )

        Quote ->
            ( "> ", 0 )

        Link ->
            ( "[](http://)", -10 )
