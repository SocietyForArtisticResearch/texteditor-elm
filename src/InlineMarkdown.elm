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
        , end
        , getChompedString
        , loop
        , map
        , oneOf
        , succeed
        , symbol
        )


isSpace : Char -> Bool
isSpace c =
    c == ' ' || c == '\t' || c == '\n' || c == '\u{000D}'


type State
    = State (List String)


id x =
    x


oneOrMore : (Char -> Bool) -> Parser String
oneOrMore isOk =
    succeed ()
        |. chompIf isOk
        |. chompWhile isOk
        |> getChompedString



{-

   ** fish
   ??


   ** fish **
   ==========

   **fish**
   ..====..

   *fish*
   .====.

   /*
   .=


-}


parseSymbol : String -> Parser String
parseSymbol sym =
    symbol sym
        |> getChompedString


problem =
    Parser.problem


inlineSymbols : Parser String
inlineSymbols =
    oneOf
        [ parseSymbol "**"
        , parseSymbol "__"
        , parseSymbol "*"
        , parseSymbol "_"
        , problem "expected inline"
        ]


finish : List String -> () -> Step state String
finish str _ =
    Done (str |> List.reverse |> String.concat)


escaped : Parser String
escaped =
    oneOf
        [ symbol "/*" |> map (\_ -> "/*")
        , symbol "/_" |> map (\_ -> "/_")
        , problem "expected escaped"
        ]


parseSpan : Parser String
parseSpan =
    let
        helper : State -> Parser (Step State String)
        helper (State lst) =
            oneOf
                [ end |> map (finish lst)
                , escaped |> map (\esc -> Loop (State (esc :: lst)))
                , inlineSymbols
                    -- we found a markdown symbol !
                    |> andThen
                        (\symb ->
                            oneOf
                                -- It is only valid syntax, if it is not the end, or a space
                                [ end |> map (finish lst)
                                , oneOrMore isSpace |> map (\spaces -> Loop (State (spaces :: symb :: lst))) -- a space, so it is a literal symb
                                , succeed (Loop (State lst)) -- the symb is not included
                                ]
                        )

                -- now continue, until you find a new markdown symbol or space
                , oneOrMore (\c -> c /= '*' && c /= '_') |> getChompedString |> map (\str -> Loop (State (str :: lst)))
                ]

        start : State
        start =
            State []
    in
    Parser.loop start helper

clean : String -> String
clean input =
    let
        result =
            Parser.run parseSpan input
    in
    case result of
        Ok str ->
            str

        Err e ->
            input
