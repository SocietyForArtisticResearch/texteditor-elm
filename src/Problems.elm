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
    | FootnoteError String
    | ExportFailed


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
            "Unknown exposition url"

        CannotLoadMedia name ->
            "cannot load media " ++ name

        NoMediaWithNameOrId name ->
            "Media object \"" ++ name ++ "\" cannot be found"

        CannotSave ->
            "Saving error"

        CannotUpdateMedia ->
            "Problem updating media"

        CannotFindMediaFieldInJson ->
            "Unkown media field in the json"

        CannotImportFile _ ->
            "Import http error"

        UnkownUploadFileType s ->
            "Unkown upload file type: " ++ s

        MediaUploadFailed e ->
            "Media upload failed with an http error, because of " ++ httpErrorString e

        FootnoteError e ->
            "Problem with footnotes: " ++ e

        ExportFailed ->
            "Exposition export failed "


httpErrorString : Http.Error -> String
httpErrorString err =
    case err of
        Http.BadUrl url ->
            "Bad url: " ++ url

        Http.Timeout ->
            "Timeout"

        Http.NetworkError ->
            "A network error"

        Http.BadStatus status ->
            "Bad status: " ++ String.fromInt status

        Http.BadBody body ->
            "Bad body:" ++ body
