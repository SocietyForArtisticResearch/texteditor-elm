module Exposition exposing (RCMediaObject(..), RCObjectData, objectDiv)

import Html as Html
import Html.Attributes as Attr


type alias OptionalDimensions =
    Maybe ( Int, Int )


type alias RCObjectData =
    { userClass : String
    , dimensions : OptionalDimensions
    , id : Int
    , htmlId : String
    , url : String
    , thumb : String
    , expositionId : String
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


mediaUrlFromId : Int -> Int -> String
mediaUrlFromId id expositionId =
    "${Backend.rcBaseAddress}text-editor/simple-media-resource?research="
        ++ String.fromInt expositionId
        ++ "&simple-media="
        ++ String.fromInt id


thumbUrlFromId : Int -> Int -> String
thumbUrlFromId id expositionId =
    "${Backend.rcBaseAddress}text-editor/simple-media-thumb?research="
        ++ String.fromInt expositionId
        ++ "&simple-media="
        ++ String.fromInt id
        ++ "&width=132&height=132"


addDimensions : OptionalDimensions -> List (Html.Attribute msg) -> List (Html.Attribute msg)
addDimensions dims attributes =
    case dims of
        Nothing ->
            attributes

        Just ( h, w ) ->
            attributes ++ [ Attr.height h, Attr.width w ]


objectDiv : RCObjectData -> Html.Html msg -> Html.Html msg
objectDiv objdata child =
    Html.div
        [ Attr.id (String.fromInt objdata.id)
        , Attr.classList
            [ ( "rcobject", True )
            , ( objdata.userClass, objdata.userClass /= "" )
            ]
        ]
        [ child ]


mediaHtml : RCMediaObject -> Html.Html msg
mediaHtml media =
    case media of
        RCImage data ->
            objectDiv data <|
                Html.figure []
                    [ Html.img (addDimensions data.dimensions [ Attr.src data.url, Attr.alt data.name ]) []
                    , Html.figcaption [] [ Html.text data.caption ]
                    ]

        RCPdf data ->
            objectDiv data <|
                Html.figure []
                    [ Html.object
                        (addDimensions data.dimensions
                            [ Attr.attribute "data" data.url
                            , Attr.attribute "type" "application/pdf"
                            , Attr.attribute "title" data.name
                            ]
                        )
                        []
                    , Html.figcaption [] [ Html.text data.caption ]
                    ]

        RCSvg data ->
            objectDiv data <|
                Html.figure []
                    [ Html.object
                        (addDimensions data.dimensions
                            [ Attr.attribute "data" data.url
                            , Attr.attribute "type" "application/svg+xml"
                            , Attr.attribute "title" data.name
                            ]
                        )
                        []
                    , Html.figcaption [] [ Html.text data.caption ]
                    ]

        RCAudio data playerSettings ->
            objectDiv data <|
                Html.figure []
                    [ Html.audio
                        (addDimensions data.dimensions
                            [ Attr.controls True
                            , Attr.preload (preloadToString playerSettings.preload)
                            , Attr.autoplay playerSettings.autoplay
                            , Attr.loop playerSettings.loop
                            ]
                        )
                        [ Html.source [ Attr.src data.url ] []
                        ]
                    , Html.figcaption [] [ Html.text data.caption ]
                    ]

        RCVideo data playerSettings ->
            objectDiv data <|
                Html.figure []
                    [ Html.video
                        (addDimensions data.dimensions
                            [ Attr.controls True
                            , Attr.preload (preloadToString playerSettings.preload)
                            , Attr.autoplay playerSettings.autoplay
                            , Attr.loop playerSettings.loop
                            ]
                        )
                        [ Html.source [ Attr.src data.url, Attr.attribute "type" "video/mp4" ] []
                        ]
                    , Html.figcaption [] [ Html.text data.caption ]
                    ]
