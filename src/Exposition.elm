module Exposition exposing (OptionalDimensions, Preload(..), RCExposition, RCMediaObject, RCMediaObjectValidation, RCMediaObjectViewState, RCMediaType(..), TOC, TOCEntry, addMediaUserClasses, addOrReplaceObject, asHtml, asMarkdown, defaultPlayerSettings, empty, incContentVersion, insertToolHtml, isValid, mediaUrl, mkMediaName, objectByNameOrId, replaceObject, replaceToolsWithImages, thumbUrl, validateMediaObject, withCSS, withHtml, withMd)

import Dict
import Html.String as Html
import Html.String.Attributes as Attr
import Parser exposing ((|.), (|=))
import Regex
import Settings


type alias RCExposition =
    { css : String
    , title : String
    , authors : List String
    , id : Int
    , currentWeave : Int
    , renderedHtml : String
    , markdownInput : String
    , media : List RCMediaObject
    , editorVersion : String
    , contentVersion : Int
    }


empty : RCExposition
empty =
    { css = ""
    , title = ""
    , authors = []
    , id = 0
    , currentWeave = 0
    , renderedHtml = ""
    , markdownInput = ""
    , media = []
    , editorVersion = Settings.editorVersion
    , contentVersion = 0
    }


incContentVersion : RCExposition -> RCExposition
incContentVersion exp =
    { exp | contentVersion = exp.contentVersion + 1 }


addMediaUserClasses : RCExposition -> Dict.Dict Int String -> RCExposition
addMediaUserClasses expo classesDict =
    let
        mediaWithClasses =
            List.map
                (\m ->
                    case Dict.get m.id classesDict of
                        Nothing ->
                            m

                        Just class ->
                            { m | userClass = class }
                )
                expo.media
    in
    { expo | media = mediaWithClasses }


withMd : RCExposition -> String -> RCExposition
withMd exp content =
    { exp | markdownInput = content }


withHtml : RCExposition -> String -> RCExposition
withHtml exp content =
    { exp | renderedHtml = content }


withCSS : RCExposition -> String -> RCExposition
withCSS exp content =
    { exp | css = content }


mkMediaName : RCExposition -> String
mkMediaName exp =
    let
        imageNames =
            List.map
                (Parser.run
                    (Parser.succeed identity
                        |. Parser.symbol "media"
                        |= Parser.int
                    )
                )
                (List.map .name exp.media)

        maxImage =
            List.foldr
                (\res maxI ->
                    case res of
                        Ok i ->
                            max maxI i

                        Err _ ->
                            maxI
                )
                0
                imageNames
    in
    "media" ++ String.fromInt (maxImage + 1)


type alias OptionalDimensions =
    Maybe ( Int, Int )


type alias PlaySettings =
    { autoplay : Bool
    , loop : Bool
    , preload : Preload
    }


defaultPlayerSettings : PlaySettings
defaultPlayerSettings =
    { autoplay = False, loop = False, preload = Auto }


type RCMediaType
    = RCVideo PlaySettings
    | RCAudio PlaySettings
    | RCSvg
    | RCPdf
    | RCImage


type alias RCMediaObject =
    { userClass : String
    , dimensions : OptionalDimensions
    , id : Int
    , htmlId : String
    , expositionId : Int
    , name : String
    , description : String
    , copyright : String
    , caption : String
    , version : Int
    , mediaType : RCMediaType
    }


type Preload
    = Auto
    | Metadata
    | None


type alias TOCEntry =
    { level : Int
    , title : String
    , id : String
    }


type alias TOC =
    List TOCEntry


preloadToString : Preload -> String
preloadToString p =
    case p of
        Auto ->
            "auto"

        Metadata ->
            "metadata"

        None ->
            "none"


objectByNameOrId : String -> RCExposition -> Maybe RCMediaObject
objectByNameOrId nameOrId exp =
    case String.toInt nameOrId of
        Just id ->
            let
                idLst =
                    List.filter (\m -> m.id == id) exp.media
            in
            List.head idLst

        Nothing ->
            let
                nameLst =
                    List.filter (\m -> m.name == nameOrId) exp.media
            in
            List.head nameLst


removeObjectWithID : Int -> RCExposition -> RCExposition
removeObjectWithID id exp =
    { exp | media = List.filter (\m -> m.id /= id) exp.media }


replaceObject : RCMediaObject -> RCExposition -> RCExposition
replaceObject obj exp =
    { exp
        | media =
            List.map
                (\m ->
                    if m.id == obj.id then
                        obj

                    else
                        m
                )
                exp.media
    }


addObject : RCMediaObject -> RCExposition -> RCExposition
addObject obj exp =
    { exp | media = obj :: exp.media }


addOrReplaceObject : RCMediaObject -> RCExposition -> RCExposition
addOrReplaceObject obj exp =
    if List.any (\m -> m.id == obj.id) exp.media then
        replaceObject obj exp

    else
        addObject obj exp


mediaUrl : RCMediaObject -> String
mediaUrl data =
    "/text-editor/simple-media-resource?research="
        ++ String.fromInt data.expositionId
        ++ "&simple-media="
        ++ String.fromInt data.id


thumbUrl : RCMediaObject -> String
thumbUrl data =
    "/text-editor/simple-media-thumb?research="
        ++ String.fromInt data.expositionId
        ++ "&simple-media="
        ++ String.fromInt data.id
        ++ "&width=132&height=132"


versionString : RCMediaObject -> String
versionString data =
    "&t=" ++ String.fromInt data.version


withPrefix : Maybe String -> String -> String
withPrefix prefix str =
    case prefix of
        Nothing ->
            str

        Just pre ->
            pre ++ str


addDimensions : OptionalDimensions -> List (Html.Attribute msg) -> List (Html.Attribute msg)
addDimensions dims attributes =
    case dims of
        Nothing ->
            attributes

        Just ( w, h ) ->
            attributes ++ [ Attr.height h, Attr.width w ]



-- VALIDATION


validateName : RCExposition -> RCMediaObject -> String -> Result String String
validateName exp obj newName =
    if String.length newName < 4 then
        Err "Name is too short"

    else
        let
            mediaNames =
                List.map (\m -> m.name) exp.media

            objName =
                obj.name
        in
        if (obj.name == newName) || not (List.member newName mediaNames) then
            Ok newName

        else
            Err "Another media object already has this name"


type alias RCMediaObjectValidation =
    { name : Result String String
    , description : Result String String
    , copyright : Result String String
    , userClass : Result String String
    }


type alias RCMediaObjectViewState =
    { validation : RCMediaObjectValidation
    , thumbUrl : String
    , id : Int
    }


validateMediaObject : RCExposition -> RCMediaObject -> RCMediaObject -> RCMediaObjectViewState
validateMediaObject exp objInModel objInEdit =
    let
        validation =
            { name = validateName exp objInModel objInEdit.name
            , description = Ok objInEdit.description
            , copyright = Ok objInEdit.copyright
            , userClass = Ok objInEdit.userClass
            }
    in
    { validation = validation
    , thumbUrl = thumbUrl objInModel
    , id = objInModel.id
    }


isValid : RCMediaObjectValidation -> Bool
isValid st =
    case ( ( st.name, st.description ), ( st.copyright, st.userClass ) ) of
        ( ( Ok _, Ok _ ), ( Ok _, Ok _ ) ) ->
            True

        _ ->
            False



-- MARKDOWN and HTML rendering


objectDiv : RCMediaObject -> Html.Html msg -> Html.Html msg
objectDiv obj child =
    Html.div
        [ Attr.id (String.fromInt obj.id)
        , Attr.classList
            [ ( "rcobject", True )
            , ( obj.userClass, obj.userClass /= "" )
            ]
        ]
        [ child ]


asMarkdown : RCMediaObject -> String
asMarkdown media =
    "![" ++ media.name ++ "](" ++ mediaUrl media ++ ")"


asHtml : RCMediaObject -> Html.Html msg
asHtml media =
    case ( media.mediaType, media ) of
        ( RCImage, data ) ->
            objectDiv data <|
                Html.figure [ Attr.class "rcimage" ]
                    [ Html.img (addDimensions data.dimensions [ Attr.src (mediaUrl data), Attr.alt data.name ]) []
                    , Html.figcaption [] [ Html.text data.caption ]
                    ]

        ( RCPdf, data ) ->
            objectDiv data <|
                Html.figure []
                    [ Html.object
                        (addDimensions data.dimensions
                            [ Attr.attribute "data" (mediaUrl data)
                            , Attr.attribute "type" "application/pdf"
                            , Attr.attribute "title" data.name
                            ]
                        )
                        []
                    , Html.figcaption [] [ Html.text data.caption ]
                    ]

        ( RCSvg, data ) ->
            objectDiv data <|
                Html.figure [ Attr.class "rcimage" ]
                    [ Html.object
                        (addDimensions data.dimensions
                            [ Attr.attribute "data" (mediaUrl data)
                            , Attr.attribute "type" "application/svg+xml"
                            , Attr.attribute "title" data.name
                            ]
                        )
                        []
                    , Html.figcaption [] [ Html.text data.caption ]
                    ]

        ( RCAudio playerData, data ) ->
            objectDiv data <|
                Html.figure []
                    [ Html.audio
                        (addDimensions data.dimensions
                            [ Attr.controls True
                            , Attr.preload (preloadToString playerData.preload)
                            , Attr.autoplay playerData.autoplay
                            , Attr.loop playerData.loop
                            , Attr.class "rcaudio"
                            ]
                        )
                        [ Html.source [ Attr.src (mediaUrl data) ] []
                        ]
                    , Html.figcaption [] [ Html.text data.caption ]
                    ]

        ( RCVideo playerData, data ) ->
            objectDiv data <|
                Html.figure []
                    [ Html.video
                        (addDimensions data.dimensions
                            [ Attr.controls True
                            , Attr.preload (preloadToString playerData.preload)
                            , Attr.autoplay playerData.autoplay
                            , Attr.loop playerData.loop
                            , Attr.class "rcvideo"
                            ]
                        )
                        [ Html.source [ Attr.src (mediaUrl data), Attr.attribute "type" "video/mp4" ] []
                        ]
                    , Html.figcaption [] [ Html.text data.caption ]
                    ]


htmlForMediaString : RCExposition -> String -> Html.Html msg
htmlForMediaString expo mediaString =
    case objectByNameOrId mediaString expo of
        Nothing ->
            Html.div [] []

        Just o ->
            asHtml o



-- render : RCExposition msg -> RCExposition msg
-- render exp =
--     { exp | renderedHtml = RCMD.rcToHtml (htmlForMediaString exp) exp.markdownInput }
-- withRenderedHtmlString : RCExposition msg -> String -> RCExposition msg
-- withRenderedHtmlString exp htmlString =
--     { exp | renderedHtmlString = htmlString }


insertToolHtml : String -> RCExposition -> String
insertToolHtml md exp =
    let
        r =
            Regex.fromString "!{([^}]*)}"
    in
    case r of
        Nothing ->
            md

        Just reg ->
            Regex.replace reg
                (\m ->
                    case m.submatches of
                        (Just sub) :: _ ->
                            Maybe.withDefault "" <|
                                Maybe.map
                                    (\o ->
                                        Html.toString 0 (asHtml o)
                                    )
                                    (objectByNameOrId sub exp)

                        _ ->
                            ""
                )
                md


replaceToolsWithImages : RCExposition -> Maybe String -> String
replaceToolsWithImages exp urlPrefix =
    let
        md =
            exp.markdownInput

        r =
            Regex.fromString "!{([^}]*)}"
    in
    case r of
        Nothing ->
            md

        Just reg ->
            Regex.replace reg
                (\m ->
                    case m.submatches of
                        (Just sub) :: _ ->
                            Maybe.withDefault "" <|
                                Maybe.map
                                    (\s ->
                                        "!["
                                            ++ s.name
                                            ++ "]("
                                            ++ withPrefix urlPrefix (mediaUrl s)
                                            ++ ")"
                                    )
                                    (objectByNameOrId sub exp)

                        _ ->
                            ""
                )
                md



-- toc : RCExposition -> List TOCEntry
-- toc exp =
--     List.map
--         (\( level, title, id ) ->
--             { level = level
--             , title = title
--             , id = id
--             }
--         )
--         (RCMD.toc exp.markdownInput)
-- TODO
-- toc
