module FileTypes exposing (Media(..), fromFile, fromString, strings, toString)

import Dict exposing (Dict)
import File exposing (File)


type Media
    = Audio
    | Video
    | Image
    | Pdf
    | Svg


toString : Media -> String
toString t =
    case t of
        Audio ->
            "audio"

        Video ->
            "video"

        Image ->
            "image"

        Pdf ->
            "pdf"

        Svg ->
            "image"


dict : Dict String Media
dict =
    Dict.fromList
        [ ( "image/jpeg", Image )
        , ( "image/jpg", Image )
        , ( "image/png", Image )
        , ( "image/gif", Image )
        , ( "image/tiff", Image )
        , ( "image/svg+xml", Svg )
        , ( "audio/mp3", Audio )
        , ( "audio/mpeg", Audio )
        , ( "audio/wav", Audio )
        , ( "audio/x-wav", Audio )
        , ( "audio/aiff", Audio )
        , ( "audio/x-aiff", Audio )
        , ( "audio/aac", Audio )
        , ( "application/pdf", Pdf )
        , ( "audio/ogg", Audio )
        , ( "audio/aif", Audio )
        , ( "video/mp4", Video )
        , ( "video/mpeg", Video )
        , ( "video/ogv", Video )
        , ( "video/quicktime", Video )
        , ( "audio/x-m4a", Audio )
        ]


strings : List String
strings =
    Dict.keys dict


fromString : String -> Maybe Media
fromString mime =
    Dict.get mime dict


fromFile : File -> Maybe Media
fromFile =
    fromString << File.mime
