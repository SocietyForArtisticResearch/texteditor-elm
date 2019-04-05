module Exposition exposing (OptionalDimensions, Preload(..), RCExposition, RCMediaObject(..), RCObjectData, RCPlayerSettings, TOC, TOCEntry, asHtml, asMarkdown, mediaUrl, objectByNameOrId, replaceToolsWithImages, thumbUrl)

import Html as H
import Html.String as HStr
import Html.String.Attributes as Attr
import Regex


type alias RCExposition msg =
    { css : String
    , title : String
    , authors : List String
    , id : Int
    , currentWeave : Int
    , renderedHtml : HStr.Html msg
    , markdownInput : String
    , media : List RCMediaObject
    }


type alias OptionalDimensions =
    Maybe ( Int, Int )


type alias RCObjectData =
    { userClass : String
    , dimensions : OptionalDimensions
    , id : Int
    , htmlId : String
    , thumb : String
    , expositionId : Int
    , name : String
    , description : String
    , copyright : String
    , caption : String
    , version : Int
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


type alias RCPlayerSettings =
    { autoplay : Bool
    , loop : Bool
    , preload : Preload
    }


type RCMediaObject
    = RCVideo RCObjectData RCPlayerSettings
    | RCAudio RCObjectData RCPlayerSettings
    | RCSvg RCObjectData
    | RCPdf RCObjectData
    | RCImage RCObjectData


objData : RCMediaObject -> RCObjectData
objData media =
    case media of
        RCVideo d _ ->
            d

        RCAudio d _ ->
            d

        RCSvg d ->
            d

        RCPdf d ->
            d

        RCImage d ->
            d


objectByNameOrId : String -> RCExposition msg -> Maybe RCMediaObject
objectByNameOrId nameOrId exp =
    case String.toInt nameOrId of
        Just id ->
            let
                idLst =
                    List.filter (\m -> (objData m).id == id) exp.media
            in
            List.head idLst

        Nothing ->
            let
                nameLst =
                    List.filter (\m -> (objData m).name == nameOrId) exp.media
            in
            List.head nameLst


mediaUrl : RCObjectData -> String
mediaUrl data =
    "/text-editor/simple-media-resource?research="
        ++ String.fromInt data.expositionId
        ++ "&simple-media="
        ++ String.fromInt data.id


thumbUrl : RCObjectData -> String
thumbUrl data =
    "/text-editor/simple-media-thumb?research="
        ++ String.fromInt data.expositionId
        ++ "&simple-media="
        ++ String.fromInt data.id
        ++ "&width=132&height=132"


versionString : RCObjectData -> String
versionString data =
    "&t=" ++ String.fromInt data.version


withPrefix : Maybe String -> String -> String
withPrefix prefix str =
    case prefix of
        Nothing ->
            str

        Just pre ->
            pre ++ str


addDimensions : OptionalDimensions -> List (HStr.Attribute msg) -> List (HStr.Attribute msg)
addDimensions dims attributes =
    case dims of
        Nothing ->
            attributes

        Just ( h, w ) ->
            attributes ++ [ Attr.height h, Attr.width w ]


objectDiv : RCObjectData -> HStr.Html msg -> HStr.Html msg
objectDiv objdata child =
    HStr.div
        [ Attr.id (String.fromInt objdata.id)
        , Attr.classList
            [ ( "rcobject", True )
            , ( objdata.userClass, objdata.userClass /= "" )
            ]
        ]
        [ child ]


asMarkdown : RCMediaObject -> String
asMarkdown media =
    let
        dataobject =
            objData media
    in
    "![" ++ dataobject.name ++ "](" ++ mediaUrl dataobject ++ ")"


asHtml : RCMediaObject -> HStr.Html msg
asHtml media =
    case media of
        RCImage data ->
            objectDiv data <|
                HStr.figure []
                    [ HStr.img (addDimensions data.dimensions [ Attr.src (mediaUrl data), Attr.alt data.name ]) []
                    , HStr.figcaption [] [ HStr.text data.caption ]
                    ]

        RCPdf data ->
            objectDiv data <|
                HStr.figure []
                    [ HStr.object
                        (addDimensions data.dimensions
                            [ Attr.attribute "data" (mediaUrl data)
                            , Attr.attribute "type" "application/pdf"
                            , Attr.attribute "title" data.name
                            ]
                        )
                        []
                    , HStr.figcaption [] [ HStr.text data.caption ]
                    ]

        RCSvg data ->
            objectDiv data <|
                HStr.figure []
                    [ HStr.object
                        (addDimensions data.dimensions
                            [ Attr.attribute "data" (mediaUrl data)
                            , Attr.attribute "type" "application/svg+xml"
                            , Attr.attribute "title" data.name
                            ]
                        )
                        []
                    , HStr.figcaption [] [ HStr.text data.caption ]
                    ]

        RCAudio data playerSettings ->
            objectDiv data <|
                HStr.figure []
                    [ HStr.audio
                        (addDimensions data.dimensions
                            [ Attr.controls True
                            , Attr.preload (preloadToString playerSettings.preload)
                            , Attr.autoplay playerSettings.autoplay
                            , Attr.loop playerSettings.loop
                            ]
                        )
                        [ HStr.source [ Attr.src (mediaUrl data) ] []
                        ]
                    , HStr.figcaption [] [ HStr.text data.caption ]
                    ]

        RCVideo data playerSettings ->
            objectDiv data <|
                HStr.figure []
                    [ HStr.video
                        (addDimensions data.dimensions
                            [ Attr.controls True
                            , Attr.preload (preloadToString playerSettings.preload)
                            , Attr.autoplay playerSettings.autoplay
                            , Attr.loop playerSettings.loop
                            ]
                        )
                        [ HStr.source [ Attr.src (mediaUrl data), Attr.attribute "type" "video/mp4" ] []
                        ]
                    , HStr.figcaption [] [ HStr.text data.caption ]
                    ]


replaceToolsWithImages : RCExposition msg -> Maybe String -> String
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
                                        let
                                            d =
                                                objData s
                                        in
                                        "!["
                                            ++ d.name
                                            ++ "]("
                                            ++ withPrefix urlPrefix (mediaUrl d)
                                            ++ ")"
                                    )
                                    (objectByNameOrId sub exp)

                        _ ->
                            ""
                )
                md



-- getoc, h1,h2
-- removeObjectWithID
-- addObject
-- replaceObjectWithID
-- updateOrCreateObject
-- integrateMediaList
-- integrateSerializedMediaInfo
