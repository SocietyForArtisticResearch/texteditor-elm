module Licenses exposing (License(..), asString, fromString)

import Util


type License
    = AllRightsReserved
    | CCBY
    | CCBYSA
    | CCBYNC
    | CCBYNCSA
    | CCBYNCND
    | PublicDomain


licensesDict : List ( License, String )
licensesDict =
    [ ( AllRightsReserved, "all-rights-reserved" )
    , ( CCBY, "cc-by" )
    , ( CCBYSA, "cc-by-sa" )
    , ( CCBYNC, "cc-by-nc" )
    , ( CCBYNCSA, "cc-by-nc-sa" )
    , ( CCBYNCND, "cc-by-nc-nd" )
    , ( PublicDomain, "public-domain" )
    ]


asString : License -> String
asString l =
    Maybe.withDefault "all-rights-reserved" <| Maybe.map Util.snd <| Util.find (\( lic, _ ) -> lic == l) licensesDict


fromString : String -> License
fromString s =
    Maybe.withDefault AllRightsReserved <| Maybe.map Util.fst <| Util.find (\( _, str ) -> str == s) licensesDict
