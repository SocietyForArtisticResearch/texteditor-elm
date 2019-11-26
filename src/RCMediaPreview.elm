module RCMediaPreview exposing
    ( PreviewSize(..)
    , viewTableThumbnail
    , viewThumbnail
    )

import Exposition exposing (RCMediaObject)
import Html exposing (..)
import Html.Attributes exposing (..)


type PreviewSize
    = PreviewBig
    | PreviewSmall


getStyle : PreviewSize -> List (Html.Attribute msg)
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


viewTableThumbnail : RCMediaObject -> PreviewSize -> Html msg
viewTableThumbnail object size =
    case object.mediaType of
        Exposition.RCImage ->
            renderAsMini object size

        Exposition.RCSvg ->
            renderAsMini object size

        Exposition.RCAudio settings ->
            renderMediaAsHyperlink "Audio" object

        Exposition.RCVideo settings ->
            renderMediaAsHyperlink "Video" object

        Exposition.RCPdf ->
            renderMediaAsHyperlink "PDF" object


renderAsMini : RCMediaObject -> PreviewSize -> Html msg
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
        , a [ href <| Exposition.mediaUrl object, title "open preview" ] [ text "preview" ]
        ]


viewThumbnail : RCMediaObject -> PreviewSize -> Html msg
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
                 ]
                    ++ getStyle size
                )
                [ source [ src videoUrl, type_ "video/mp4" ] [] ]

        _ ->
            span [] [ text "No preview" ]
