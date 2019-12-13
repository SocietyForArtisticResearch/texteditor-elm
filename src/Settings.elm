module Settings exposing (Snippet(..), baseDomain, baseUrl, editorVersion, iconUrl, snippet)


editorVersion : String
editorVersion =
    "2.1.0"


baseUrl : String
baseUrl =
    "elm-editor/"


baseDomain : String
baseDomain =
    "https://www.researchcatalogue.net"


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
