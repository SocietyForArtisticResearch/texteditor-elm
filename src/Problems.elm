module Problems exposing (Problem(..), splitResultList)


type Problem
    = CannotFindServer
    | WrongExpositionUrl
    | CannotLoadMedia String
    | CannotLoadExposition


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
