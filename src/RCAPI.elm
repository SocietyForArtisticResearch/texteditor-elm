module RCAPI exposing (APIExposition, APIMedia, getExposition, getMediaList)

import Dict
import Http
import Json.Decode exposing (..)


type alias APIExposition =
    { html : String, markdown : String, metadata : String, style : String, title : String }


type alias APIMedia =
    { id : Int, mediaType : String, description : String, copyright : String, name : String }


apiExposition : Decoder APIExposition
apiExposition =
    map5 APIExposition
        (at [ "html" ] string)
        (at [ "markdown" ] string)
        (at [ "metadata" ] string)
        (at [ "style" ] string)
        (at [ "title" ] string)


apiMedia : Decoder APIMedia
apiMedia =
    map5 APIMedia
        (at [ "id" ] int)
        (at [ "type" ] string)
        (at [ "description" ] string)
        (at [ "copyright" ] string)
        (at [ "name" ] string)


getMediaList id msg =
    Http.get
        { url = "/text-editor/simple-media-list?research=" ++ String.fromInt id
        , expect = Http.expectJson msg (list apiMedia)
        }


getExposition : Int -> Int -> (Result Http.Error APIExposition -> msg) -> Cmd msg
getExposition researchId weave msg =
    Http.get
        { url = " text-editor/load?research=" ++ String.fromInt researchId ++ "&weave=" ++ String.fromInt weave
        , expect = Http.expectJson msg apiExposition
        }
