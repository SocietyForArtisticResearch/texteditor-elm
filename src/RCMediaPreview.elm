module RCMediaPreview exposing
    ( PreviewSize(..)
    , viewTableThumbnail
    , viewThumbnail
    )

import Exposition exposing (RCMediaObject)
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (onClick)
import View


type PreviewSize msg
    = PreviewBig
    | PreviewSmall
    | PreviewPlayer
    | PreviewLink
    | PreviewButton msg


getStyle : PreviewSize msg -> List (Html.Attribute msg)
getStyle size =
    case size of
        PreviewBig ->
            [ style "width" "100%"
            , style "height" "250px"
            , style "object-fit" "cover"
            ]

        PreviewSmall ->
            [ style "width" "60px"
            , style "hieght" "60px"
            , style "object-fit" "cover"
            ]

        _ ->
            []


viewTableThumbnail : RCMediaObject -> PreviewSize msg -> Html msg
viewTableThumbnail object size =
    case object.mediaType of
        Exposition.RCImage ->
            renderAsMini object size

        Exposition.RCSvg ->
            renderAsMini object size

        Exposition.RCAudio settings ->
            case size of
                PreviewLink ->
                    renderAsIconHyperlink View.SpeakerIcon object

                PreviewPlayer ->
                    viewThumbnail object size

                PreviewButton msg ->
                    button [ onClick msg ] [ text "preview" ]

                _ ->
                    span [] []

        Exposition.RCVideo settings ->
            case size of
                PreviewLink ->
                    renderAsIconHyperlink View.CameraIcon object

                PreviewPlayer ->
                    viewThumbnail object size

                PreviewButton msg ->
                    button [ onClick msg ] [ text "preview" ]

                _ ->
                    span [] []

        Exposition.RCPdf ->
            renderMediaAsHyperlink "PDF" object


renderAsMini : RCMediaObject -> PreviewSize msg -> Html msg
renderAsMini object size =
    let
        reso =
            case size of
                PreviewBig ->
                    500

                _ ->
                    120

        thumburl =
            Exposition.customThumbUrl reso object
    in
    img
        ([ src thumburl ]
            ++ getStyle size
        )
        []


renderMediaAsHyperlink : String -> RCMediaObject -> Html msg
renderMediaAsHyperlink typeString object =
    span [ class "rc-media-preview" ]
        [ text <| typeString ++ " "
        , a
            [ href <| Exposition.mediaUrl object
            , target "_blank"
            , title "open preview"
            ]
            [ View.renderIcon View.TriangleRight ]
        ]


renderAsIconHyperlink : View.Icon -> RCMediaObject -> Html msg
renderAsIconHyperlink icon object =
    a
        [ href <| Exposition.mediaUrl object
        , target "_blank"
        , title <| "preview audio " ++ object.name
        ]
        [ View.renderIcon icon ]


viewThumbnail : RCMediaObject -> PreviewSize msg -> Html msg
viewThumbnail object size =
    case object.mediaType of
        Exposition.RCImage ->
            let
                reso =
                    case size of
                        PreviewBig ->
                            500

                        _ ->
                            120

                thumburl =
                    Exposition.customThumbUrl reso object

                -- double for high-res screens
            in
            img
                ([ src thumburl ]
                    ++ getStyle size
                )
                []

        Exposition.RCAudio settings ->
            let
                audioUrl =
                    Exposition.mediaUrl object
            in
            audio
                [ title "Preview"
                , controls True
                , loop settings.loop
                , autoplay settings.autoplay
                , class "audio-preview"
                , preload "none"
                , style "width" "200px"
                , style "position" "absolute"
                ]
                [ source [ src audioUrl, type_ "audio/mpeg" ] [] ]

        Exposition.RCVideo settings ->
            let
                videoUrl =
                    Exposition.mediaUrl object
            in
            video
                ([ title "Preview"
                 , controls True
                 , loop settings.loop
                 , autoplay settings.autoplay
                 , class "video-preview"
                 , preload "none"
                 , style "width" "200px"
                 , style "position" "absolute"
                 ]
                    ++ getStyle size
                )
                [ source [ src videoUrl, type_ "video/mp4" ] [] ]

        _ ->
            span [] [ text "No preview" ]
