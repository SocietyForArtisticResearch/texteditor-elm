module Problems exposing (Problem(..), splitResultList, asString)

-- problem idea comes from rtfeldman sp-application talk youtube

import Http


type Problem
    = WrongExpositionUrl
    | CannotLoadMedia String
    | NoMediaWithNameOrId
    | CannotSave
    | CannotUpdateMedia
    | CannotFindMediaFieldInJson
    | CannotImportFile Http.Error


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

        NoMediaWithNameOrId ->
            "media doesn't exist"

        CannotSave ->
            "saving error"

        CannotUpdateMedia ->
            "problem updaing media"

        CannotFindMediaFieldInJson ->
            "unkown media field in the json"

        CannotImportFile _  ->
            "import http error"

 
               
