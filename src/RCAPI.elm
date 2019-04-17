module RCAPI exposing (getExposition, getMediaList)

import Dict
import Http
import Json.Decode as D


getMediaList id msg =
    Http.get
        { url = "/text-editor/simple-media-list?research=" ++ String.fromInt id
        , expect = Http.expectJson msg (D.dict D.string)
        }


getExposition : Int -> Int -> (Result Http.Error (Dict.Dict String String) -> msg) -> Cmd msg
getExposition researchId weave msg =
    Http.get
        { url = " text-editor/load?research=" ++ String.fromInt researchId ++ "&weave=" ++ String.fromInt weave
        , expect = Http.expectJson msg (D.dict D.string)
        }
