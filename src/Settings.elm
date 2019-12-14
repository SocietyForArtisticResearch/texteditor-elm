module Settings exposing (BuildType, baseDomain, baseUrl, buildTypeFromString, defaultBuildType, editorVersion, iconUrl, select)


editorVersion : String
editorVersion =
    "2.1.1"



-- buildTarget =
--     Local


type BuildType
    = Dev
    | Release
    | Local


defaultBuildType =
    Release


buildTypeFromString : String -> BuildType
buildTypeFromString s =
    case s of
        "Dev" ->
            Dev

        "Release" ->
            Release

        "Local" ->
            Local

        _ ->
            defaultBuildType


type alias BuildSetting =
    { release : String
    , dev : String
    , local : String
    }


select : BuildType -> BuildSetting -> String
select t =
    case t of
        Dev ->
            .dev

        Release ->
            .release

        Local ->
            .local


baseUrl : BuildType -> String
baseUrl buildTarget =
    select buildTarget <|
        BuildSetting
            "elm-editor/"
            "elm-editor/"
            ""


baseDomain : BuildType -> String
baseDomain buildTarget =
    select buildTarget <|
        BuildSetting
            "https://www.researchcatalogue.net"
            "https://dev.researchcatalogue.net"
            ""


iconUrl : BuildType -> String
iconUrl buildTarget =
    baseUrl buildTarget ++ "lib/icons/"
