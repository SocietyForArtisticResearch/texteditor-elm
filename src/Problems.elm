module Problems exposing (Problem(..), asString, splitResultList)

-- problem idea comes from rtfeldman sp-application talk youtube

import Http
import Json.Decode as Decode


type Problem
    = WrongExpositionUrl
    | CannotLoadMedia Http.Error
    | NoMediaWithNameOrId String
    | CannotSave
    | CannotUpdateMedia Http.Error
    | CannotFindMediaFieldInJson
    | CannotImportFile Http.Error
    | UnkownUploadFileType String
    | MediaUploadFailed Http.Error
    | FootnoteError String
    | ExportFailed
    | DecodingJsonError Decode.Error
    | CannotLoadExposition Http.Error
    | UnknownType String
    | FootnoteHelperError String
    | MediaUserClassesProblem
    | UnsupportedMessage String


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

        CannotLoadMedia e ->
            "cannot load media " ++ httpErrorString e

        NoMediaWithNameOrId name ->
            "Media object \"" ++ name ++ "\" cannot be found"

        CannotLoadExposition e ->
            "Cannot load, http error: " ++ httpErrorString e

        CannotSave ->
            "Saving error, are you connected?"

        CannotUpdateMedia e ->
            "Problem updating media :" ++ httpErrorString e

        CannotFindMediaFieldInJson ->
            "Unkown media field in the json"

        CannotImportFile e ->
            "Import http error: " ++ httpErrorString e

        UnkownUploadFileType s ->
            "Unkown upload file type: " ++ s

        MediaUploadFailed e ->
            "Media upload failed with an http error, because of " ++ httpErrorString e

        FootnoteError e ->
            "Problem with footnotes: " ++ e

        ExportFailed ->
            "Exposition export failed "

        DecodingJsonError e ->
            "Json decode problem "

        UnknownType s ->
            s

        FootnoteHelperError s ->
            "Cannot number footnotes " ++ s

        MediaUserClassesProblem ->
            "User classes couldn't be retrieved"

        UnsupportedMessage s ->
            "Message error: " ++ s


jsonErrorString : Decode.Error -> String
jsonErrorString err =
    Decode.errorToString err


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
