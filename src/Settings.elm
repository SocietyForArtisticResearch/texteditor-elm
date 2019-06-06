module Settings exposing (Snippet(..), baseUrl, editorVersion, iconUrl, snippet)


editorVersion : String
editorVersion =
    "2.0.0"


baseUrl : String
baseUrl =
    "elm-editor/"


iconUrl : String
iconUrl =
    baseUrl ++ "lib/icons/"


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
            ( "# Header 1", 0 )

        H2 ->
            ( "## Header 2", 0 )

        H3 ->
            ( "### Header 3", 0 )

        H4 ->
            ( "#### Header 4", 0 )

        Bullet ->
            ( "* ", 0 )

        Numbered ->
            ( "1. ", 0 )

        Quote ->
            ( "> ", 0 )

        Link ->
            ( "[Link text](http://)", -1 )
