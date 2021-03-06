module Util exposing (classListFromString, find, fst, snd, wordCount, liftA2)

import Html
import Html.Attributes


classListFromString : String -> List (Html.Attribute msg)
classListFromString =
    List.map (\str -> Html.Attributes.class str) << String.split " "


find : (a -> Bool) -> List a -> Maybe a
find predicate list =
    case list of
        [] ->
            Nothing

        first :: rest ->
            if predicate first then
                Just first

            else
                find predicate rest


fst : ( a, b ) -> a
fst ( a, b ) =
    a


snd : ( a, b ) -> b
snd ( a, b ) =
    b


-- applicative of functions: a <$> b <*> c
liftA2 : (a -> b -> c) -> (d -> a)  -> (d -> b) -> d -> c
liftA2 operator a b arg =
    operator (a arg) (b arg) 

-- This tries to intelligently split sentences according to spaces or characters.


wordCount : String -> Int
wordCount str =
    let
        splitChars =
            String.toList " .,!?()"

        splitter : Char -> List String -> List String
        splitter char z =
            List.concatMap (String.split (String.fromChar char)) z

        -- f z xs
        -- f is the splitter, z is the list of splitted strings, xs are the splitChars
        splitted =
            List.foldr splitter [ str ] splitChars

        filterEmpty =
            List.filter (not << String.isEmpty) splitted
    in
    List.length filterEmpty
