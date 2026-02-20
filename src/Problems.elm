module Problems exposing (Problem(..), Problemized, addProblem, addProblems, asString, splitResultList)

-- problem idea comes from rtfeldman sp-application talk youtube

import Bootstrap.Alert as Alert
import Http
import Json.Decode as Decode


type Problem
    = WrongExpositionUrl String
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
    | UnsupportedImportType String


type alias Problemized model =
    { model
        | problems : List Problem
        , alertVisibility : Alert.Visibility
    }


addProblem : Problemized m -> Problem -> Problemized m
addProblem model problem =
    { model | problems = problem :: model.problems, alertVisibility = Alert.shown }


addProblems : Problemized m -> List Problem -> Problemized m
addProblems model problems =
    { model | problems = problems ++ model.problems, alertVisibility = Alert.shown }


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
        WrongExpositionUrl str ->
            "unknown exposition url:" ++ str

        CannotLoadMedia e ->
            "cannot load media " ++ httpErrorString e

        NoMediaWithNameOrId name ->
            "media object \"" ++ name ++ "\" cannot be found"

        CannotLoadExposition e ->
            "cannot load, http error: " ++ httpErrorString e

        CannotSave ->
            "saving error, please check your connection."

        CannotUpdateMedia e ->
            "problem updating media :" ++ httpErrorString e

        CannotFindMediaFieldInJson ->
            "unknown media field in the json"

        CannotImportFile e ->
            "import http error: " ++ httpErrorString e

        UnkownUploadFileType s ->
            "unknown upload file type: " ++ s

        MediaUploadFailed e ->
            "media upload failed with an http error, because of " ++ httpErrorString e

        FootnoteError e ->
            "problem with footnotes: " ++ e

        ExportFailed ->
            "exposition export failed "

        DecodingJsonError e ->
            "json decode problem "

        UnknownType s ->
            s

        FootnoteHelperError s ->
            "Cannot number footnotes " ++ s

        MediaUserClassesProblem ->
            "User classes couldn't be retrieved"

        UnsupportedMessage s ->
            "Message error: " ++ s

        UnsupportedImportType mime ->
            case mime of
                "application/pdf" ->
                    "Sorry, we cannot extract the text from a PDF. You can import and insert the PDF as a media file, using [ upload media ] or try importing the source text (txt/docx)."

                other ->
                    "Sorry, import cannot convert from format "
                        ++ other
                        ++ ". You could try to upload your content as (plain) text (.txt), Word (.docx), html, LaTeX , Open/LibreOffice (.odt)"


jsonErrorString : Decode.Error -> String
jsonErrorString err =
    Decode.errorToString err


httpErrorString : Http.Error -> String
httpErrorString err =
    case err of
        Http.BadUrl url ->
            "bad url: " ++ url

        Http.Timeout ->
            "timeout"

        Http.NetworkError ->
            "a network error"

        Http.BadStatus status ->
            "bad status: " ++ String.fromInt status

        Http.BadBody body ->
            "bad body:" ++ body
