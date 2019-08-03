module Util exposing (find, fst, snd)


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
