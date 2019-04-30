module RCAPI exposing (APIExposition, APIMedia, APIMediaEntry, getExposition, getMediaList, toRCExposition)

import Dict
import Exposition exposing (RCExposition)
import Html exposing (Html, span)
import Http
import Json.Decode exposing (..)


toRCExposition : APIExposition -> Int -> Int -> RCExposition msg
toRCExposition apiExpo id weave =
    { css = apiExpo.style
    , title = apiExpo.title
    , authors = []
    , id = id
    , currentWeave = weave
    , renderedHtml = span [] [] -- we don't actually use the html in the saved object
    , markdownInput = apiExpo.markdown
    , media = []
    }


type alias APIExposition =
    { html : String, markdown : String, metadata : String, style : String, title : String }


type alias APIMediaEntry =
    { id : Int, media : APIMedia, description : String, copyright : String, name : String }


type alias APIMedia =
    { mediaType : String, status : String, width : Int, height : Int }


apiExposition : Decoder APIExposition
apiExposition =
    map5 APIExposition
        (at [ "html" ] string)
        (at [ "markdown" ] string)
        (at [ "metadata" ] string)
        (at [ "style" ] string)
        (at [ "title" ] string)


apiMediaEntry : Decoder APIMediaEntry
apiMediaEntry =
    map5 APIMediaEntry
        (at [ "id" ] int)
        (at [ "media" ] apiMedia)
        (at [ "description" ] string)
        (at [ "copyright" ] string)
        (at [ "name" ] string)


apiMedia : Decoder APIMedia
apiMedia =
    map4 APIMedia
        (at [ "type" ] string)
        (at [ "status" ] string)
        (at [ "width" ] int)
        (at [ "height" ] int)


getMediaList id msg =
    Http.get
        { url = "/text-editor/simple-media-list?research=" ++ String.fromInt id
        , expect = Http.expectJson msg (list apiMediaEntry)
        }


getExposition : Int -> Int -> (Result Http.Error APIExposition -> msg) -> Cmd msg
getExposition researchId weave msg =
    Http.get
        { url = " text-editor/load?research=" ++ String.fromInt researchId ++ "&weave=" ++ String.fromInt weave
        , expect = Http.expectJson msg apiExposition
        }
