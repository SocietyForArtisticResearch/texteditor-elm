module RCAPI exposing (getMediaList)

import Http
import Json.Decode as D


getMediaList id msg dec =
    Http.get
        { url = "/text-editor/simple-media-list?research=" ++ String.fromInt id
        , expect = Http.expectJson msg dec
        }


getExposition id weave msg dec =
    Http.get
        { url = " text-editor/load?research=" ++ String.fromInt id ++ "&weave=" ++ String.fromInt weave
        , expect = Http.expectJson msg dec
        }
