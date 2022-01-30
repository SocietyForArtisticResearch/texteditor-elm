module InlineMarkdown exposing (clean)

import Parser
    exposing
        ( (|.)
        , (|=)
        , Parser
        , Step(..)
        , andThen
        , chompIf
        , chompWhile
        , getChompedString
        , loop
        , map
        , oneOf
        , succeed
        , symbol
        )


type InlineMarkdown
    = Italic String
    | Bold String
    | Word String


markdown : Parser InlineMarkdown
markdown =
    oneOf
        [ oneOrMoreSpaces
        , escaped
        , bold_or_italic Star
        , bold_or_italic Underscore
        , word
        ]


const : a -> b -> a
const x =
    \_ -> x

isSpace : Char -> Bool
isSpace c =
    c == ' ' || c == '\t' || c == '\n' || c == '\u{000D}'

oneOrMoreSpaces : Parser InlineMarkdown
oneOrMoreSpaces =
    succeed (\one more -> Word (one ++ more))
        |= (chompIf isSpace |> map (const " "))
        |= (chompWhile isSpace |> getChompedString)


toString : InlineMarkdown -> String
toString md =
    case md of
        Italic str ->
            str

        Bold b ->
            b

        Word s ->
            s


line : Parser String
line =
    let
        helper state =
            oneOf
                [ markdown |> map (\md -> Loop (md :: state))
                , succeed () |> map (\_ -> Done (List.reverse state |> List.map toString |> String.concat))
                ]
    in
    loop [] helper


clean : String -> String
clean input =
    case Parser.run line input of
        Ok result ->
            result

        Err _ ->
            input

isStarOrUnderscore : Char -> Bool
isStarOrUnderscore c =
    c == '*' || c == '_'

word : Parser InlineMarkdown
word =
    succeed (\first rest -> Word (first ++ rest))
        |= (chompIf (\c -> (not (isSpace c)) && (not (isStarOrUnderscore c))) |> getChompedString)
        |= (chompWhile (\c -> (not (isSpace c)) && (not (isStarOrUnderscore c))) |> getChompedString)


escaped : Parser InlineMarkdown
escaped =
    oneOf
        [ symbol "\\_" |> map (\_ -> Word "_")
        , symbol "\\*" |> map (\_ -> Word "*")
        ]


type MarkSymbol
    = Underscore
    | Star

type Amount
    = Singular
    | Double

bold_or_italic : MarkSymbol -> Parser InlineMarkdown
bold_or_italic mark_symbol =
    let
        single_char =
            case mark_symbol of
                Underscore ->
                    '_'

                Star ->
                    '*'

        double =
            case mark_symbol of
                Underscore ->
                    "__"

                Star ->
                    "**"

        single =
            case mark_symbol of
               Underscore -> "_"

               Star -> "*"
    
    in
    succeed (\amount hasSpace str ->
        if hasSpace then
            Word str
        else
            case amount of
               Singular -> Italic str
               
               Double -> Bold str) 
        |= (oneOf 
           [ symbol double |> map (const Double) 
           , symbol single |> map (const Singular)
           ])
        |= (oneOf 
            [ chompIf isSpace |> map (const True) -- if a space follows markup, it is escaped
            , succeed (False) -- ok is really markup
            ]) 
        |= (chompWhile (\c -> c /= single_char) |> getChompedString)
        |> andThen
            (\res ->
                case res of
                    Word _ ->
                        succeed res -- it is important that we never fail

                    Bold _ ->
                        oneOf
                            [ symbol double |> map (const res)
                            , succeed res
                            ]

                    Italic _ ->
                        oneOf
                            [ symbol single |> map (const res)
                            , succeed res
                            ]
            )