module Licenses exposing (License(..), allLicenses, asString, fromString, getDescription, defaultLicense)

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


allLicenses : List License
allLicenses =
    List.map (\( license, _ ) -> license) licensesDict


asString : License -> String
asString l =
    Maybe.withDefault "all-rights-reserved" <| Maybe.map Util.snd <| Util.find (\( lic, _ ) -> lic == l) licensesDict


fromString : String -> License
fromString s =
    Maybe.withDefault defaultLicense <| Maybe.map Util.fst <| Util.find (\( _, str ) -> str == s) licensesDict


defaultLicense : License
defaultLicense =
    CCBYNCND


getDescription : License -> String
getDescription license =
    case license of
        AllRightsReserved ->
            "All rights reserved"

        CCBY ->
            "CC BY"

        CCBYSA ->
            "CC BY SA"

        CCBYNC ->
            "CC BY NC"

        CCBYNCSA ->
            "CC BY NC SA"

        CCBYNCND ->
            "CC BY NC ND"

        PublicDomain ->
            "Public Domain"
