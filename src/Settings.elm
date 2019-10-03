module Settings exposing (Snippet(..), baseDomain, baseUrl, editorVersion, footnoteSnippet, iconUrl, missingMediaPlaceholder, snippet)


editorVersion : String
editorVersion =
    "2.0.0"


baseUrl : String
baseUrl =
    "elm-editor/"


baseDomain : String
baseDomain =
    "https://dev.researchcatalogue.net"


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


footnoteSnippet : Int -> ( String, String )
footnoteSnippet num =
    let
        numstr =
            String.fromInt num
    in
    ( "[^" ++ numstr ++ "]"
    , "[^" ++ numstr ++ "]: footnote-text"
    )


missingMediaPlaceholder : String -> String
missingMediaPlaceholder mediaName =
    "<label title=\"you can add a file by using add media button\" style=\"padding: 10px; border: 1px dashed rgb(119, 119, 119); background-color: rgb(255, 183, 183); font-size:0.8em;\">[ problem: media with name \"" ++ mediaName ++ "\" does not exist in media ]</label>"
