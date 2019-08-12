module Problems exposing (Problem(..), asString, splitResultList)

-- problem idea comes from rtfeldman sp-application talk youtube

import Http


type Problem
    = WrongExpositionUrl
    | CannotLoadMedia String
    | NoMediaWithNameOrId String
    | CannotSave
    | CannotUpdateMedia
    | CannotFindMediaFieldInJson
    | CannotImportFile Http.Error
    | UnkownUploadFileType String
    | MediaUploadFailed Http.Error


splitResultList : List (Result Problem a) -> ( List Problem, List a )
splitResultList results =
    splitResultListAcc results [] []


splitResultListAcc : List (Result Problem a) -> List Problem -> List a -> ( List Problem, List a )
splitResultListAcc results problems oks =
    case results of
        [] ->
            ( problems, oks )

        (Ok a) :: rest ->
            splitResultListAcc rest problems (a :: oks)

        (Err p) :: rest ->
            splitResultListAcc rest (p :: problems) oks


asString : Problem -> String
asString problem =
    case problem of
        WrongExpositionUrl ->
            "unknown exposition url"

        CannotLoadMedia name ->
            "cannot load media " ++ name

        NoMediaWithNameOrId name ->
            "media \"" ++ name ++ "\" cannot be found"

        CannotSave ->
            "saving error"

        CannotUpdateMedia ->
            "problem updaing media"

        CannotFindMediaFieldInJson ->
            "unkown media field in the json"

        CannotImportFile _ ->
            "import http error"

        UnkownUploadFileType s ->
            "unkown upload file type: " ++ s

        MediaUploadFailed e ->
            "media upload failed with an http error, because of " ++ httpErrorString e


httpErrorString : Http.Error -> String
httpErrorString err =
    case err of
        Http.BadUrl url ->
            "bad url: " ++ url

        Http.Timeout ->
            "timeout"

        Http.NetworkError ->
            "a networkerror"

        Http.BadStatus status ->
            "bad status: " ++ String.fromInt status

        Http.BadBody body ->
            "bad body:" ++ body
