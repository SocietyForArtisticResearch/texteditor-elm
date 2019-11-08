module FootnoteHelper exposing (Footnote(..), footnoteSnippet, mdNextFootnoteNum, parseAll, testString)

import Browser
import Html exposing (Html, button, div, text)
import Html.Events exposing (onClick)
import Parser exposing ((|.), (|=), Parser, Step(..), andThen, chompIf, chompUntil, chompUntilEndOr, chompWhile, end, getChompedString, int, keyword, loop, map, oneOf, succeed, symbol)


testString : String
testString =
    "Markdown text # hallo header [^1] en er is [^4] meer [^2] en meer [^3] [^44] [^57] [^29] "


type Footnote
    = NumberedNote Int
    | NamedNote String
    | Content
    | NoteContent


type Sortable lst
    = Sorted lst
    | Unsorted lst


getRank : Footnote -> Int
getRank f =
    case f of
        NumberedNote num ->
            num

        NamedNote name ->
            -1

        Content ->
            -1

        NoteContent ->
            -1


dummy : Footnote
dummy =
    NumberedNote -1


sortNotes : Sortable (List Footnote) -> Sortable (List Footnote)
sortNotes list =
    case list of
        Sorted lst ->
            Sorted lst

        Unsorted lst ->
            Sorted <| List.sortBy getRank lst


footNote : Parser Footnote
footNote =
    succeed identity
        |. symbol "[^"
        |= strictNote



-- if it is the fncontent


strictNote : Parser Footnote
strictNote =
    chompWhile (\char -> char /= '[' && char /= ']')
        |> getChompedString
        |> andThen
            (\str ->
                case String.toInt str of
                    Just int ->
                        succeed <| NumberedNote int

                    Nothing ->
                        succeed <| NamedNote str
            )




ignoreText : Parser ()
ignoreText =
    succeed ()
        |. chompWhile isUninteresting


parseName : Parser String
parseName =
    getChompedString <|
        succeed ()
            |. chompIf Char.isLower
            |. chompWhile (\c -> Char.isAlphaNum c || c == '_')



content : Parser Footnote
content =
    succeed Content
        |. symbol "["
        |. chompIf (\char -> char /= '[')


isUninteresting : Char -> Bool
isUninteresting char =
    char /= '['


parseAll : Parser (List Footnote)
parseAll =
    loop [] footnotesHelp


footnotesHelp : List Footnote -> Parser (Step (List Footnote) (List Footnote))
footnotesHelp footnotes =
    oneOf
        [ end
            |> map (\_ -> Done (List.reverse footnotes))
        , succeed (\footnote -> Loop (footnote :: footnotes))
            |= footNote
        , succeed (\footnote -> Loop (footnote :: footnotes))
            |= content
        , chompWhile isUninteresting
            |> getChompedString
            |> map (\chunk -> Loop (Content :: footnotes))
        ]


mdNextFootnoteNum : String -> Result String Int
mdNextFootnoteNum md =
    let
        parsedNotes =
            Parser.run parseAll md
    in
    case parsedNotes of
        Ok n ->
            let
                sorted = Sorted <| List.sortBy getRank n
            in
                Ok <| nextNote sorted 

        Err errors ->
             Err <| "parser error"


nextNote : Sortable (List Footnote) -> Int
nextNote =
    let
        unpack sortable =
            case sortable of
                Sorted x ->
                    x

                Unsorted x ->
                    []

        replaceZero x =
            if x == 0 then
                1

            else
                x
    in
    unpack >> List.reverse >> List.head >> Maybe.withDefault dummy >> getRank >> (+) 1 >> replaceZero



-- check if list is correct, if there are gaps or doubles


type FootnoteValidation
    = ValidNumbering
    | InvalidNumbering (List String)



-- checking gaps, probably added later.


testCount : Sortable (List Footnote) -> Bool
testCount list =
    let
        sorted =
            case sortNotes list of
                Sorted s ->
                    s

                _ ->
                    []

        -- check if any distance bigger than 1
        checkGaps lst =
            case lst of
                x :: xs ->
                    if x == -1 then
                        checkGaps xs

                    else
                        case List.head xs of
                            Just headxs ->
                                if headxs - x /= 1 then
                                    False

                                else
                                    checkGaps xs

                            Nothing ->
                                True

                _ ->
                    True
    in
    checkGaps <| List.map getRank sorted


footnoteSnippet : Int -> ( String, String )
footnoteSnippet num =
    let
        numstr =
            String.fromInt num
    in
    ( "[^" ++ numstr ++ "]"
    , "[^" ++ numstr ++ "]: footnote-text"
    )
