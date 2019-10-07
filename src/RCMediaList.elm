module RCMediaList exposing (PickerMessages, TableMessages, view, viewModalMediaPicker)

import Bootstrap.Alert as Alert
import Bootstrap.Button as Button
import Bootstrap.Modal as Modal
import Bootstrap.Table as Table
import Bootstrap.Utilities.Spacing as Spacing
import Exposition exposing (RCMediaObject)
import Html exposing (Html, audio, div, img, source, span, text, video)
import Html.Attributes exposing (autoplay, class, controls, id, loop, src, style, title, type_)
import Html.Events exposing (onClick, onDoubleClick)
import View exposing (defaultButton, mkButton)


type alias TableMessages msg =
    { editObject : String -> msg
    , deleteObject : RCMediaObject -> msg
    , insertObject : RCMediaObject -> msg
    }


type alias PickerMessages msg =
    { insertObject : RCMediaObject -> msg
    , closeModal : msg
    , uploadMediaFileSelect : msg
    }



-- integer is object ID


view : List RCMediaObject -> TableMessages msg -> Html msg
view objectList messages =
    case objectList of
        [] ->
            div [ id "media-list", style "display" "none" ]
                [ Alert.simpleInfo [] [ text "There are no objects yet. Hint: add a file by using the \"upload media\" button." ]
                ]

        _ ->
            let
                head =
                    Table.simpleThead
                        [ Table.th [] [ text "Preview" ]
                        , Table.th [] [ text "Id" ]
                        , Table.th [] [ text "Name" ]
                        , Table.th
                            [ Table.cellAttr <| class "edit-button-column"
                            ]
                            [ text "Edit" ]
                        ]

                rowFromRCObject : RCMediaObject -> Table.Row msg
                rowFromRCObject object =
                    let
                        editButton =
                            Button.button
                                [ Button.small
                                , Button.outlineSecondary
                                , Button.attrs [ Spacing.ml1, onClick <| messages.editObject (String.fromInt object.id) ]
                                ]
                                [ text "edit" ]

                        -- insertButton =
                        --     Button.button
                        --         [ Button.small
                        --         , Button.outlineSuccess
                        --         , Button.attrs [ Spacing.ml1, onClick <| messages.insertObject object ]
                        --         ]
                        --         [ text "insert" ]
                        removeButton =
                            Button.button
                                [ Button.small
                                , Button.outlineDanger
                                , Button.attrs [ Spacing.ml1, onClick <| messages.deleteObject object ]
                                ]
                                [ text "Delete" ]
                    in
                    Table.tr []
                        [ Table.td [] [ viewThumbnail object ]
                        , Table.td [] [ text <| String.fromInt object.id ]
                        , Table.td [] [ text object.name ]
                        , Table.td [] [ editButton, removeButton ]
                        ]

                rows =
                    List.map rowFromRCObject objectList
            in
            div [ id "media-list", style "display" "none" ]
                [ Table.table
                    { options = [ Table.hover, Table.striped, Table.small ]
                    , thead = head
                    , tbody =
                        Table.tbody [] rows
                    }
                ]


viewModalMediaPicker : Modal.Visibility -> List RCMediaObject -> PickerMessages msg -> Html msg
viewModalMediaPicker visibility objectList messages =
    let
        tableList =
            case objectList of
                [] ->
                    Alert.simpleInfo [] [ text "There are no objects yet, add by using the \"upload media\" button." ]

                _ ->
                    let
                        head =
                            Table.simpleThead
                                [ Table.th [] [ text "Preview" ]
                                , Table.th [] [ text "Id" ]
                                , Table.th [] [ text "Name" ]
                                , Table.th [] [ text "Insert" ]
                                ]

                        rowFromRCObject : RCMediaObject -> Table.Row msg
                        rowFromRCObject object =
                            let
                                insertButton =
                                    Button.button
                                        [ Button.small
                                        , Button.outlineSuccess
                                        , Button.attrs [ Spacing.ml1, onClick <| messages.insertObject object ]
                                        ]
                                        [ text "Insert" ]
                            in
                            Table.tr [ Table.rowAttr <| onDoubleClick <| messages.insertObject object ]
                                [ Table.td [] [ viewThumbnail object ]
                                , Table.td [] [ text <| String.fromInt object.id ]
                                , Table.td [] [ text object.name ]
                                , Table.td [] [ insertButton ]
                                ]

                        rows =
                            List.map rowFromRCObject objectList

                        uploadButton =
                            defaultButton messages.uploadMediaFileSelect
                    in
                    div []
                        [ mkButton
                            { uploadButton
                                | icon = View.UploadCloud
                                , offset = False
                                , title = "upload media"
                                , text = "upload media"
                                , primary = False
                            }
                        , Table.table
                            { options = [ Table.hover, Table.striped, Table.small ]
                            , thead = head
                            , tbody =
                                Table.tbody [] rows
                            }
                        ]
    in
    Modal.config messages.closeModal
        |> Modal.large
        |> Modal.hideOnBackdropClick True
        |> Modal.h1 [] [ text "Select a media object to insert." ]
        |> Modal.body [] [ tableList ]
        |> Modal.footer []
            [ Button.button
                [ Button.secondary, Button.attrs [ onClick messages.closeModal ] ]
                [ text "Cancel" ]
            ]
        |> Modal.view visibility


viewThumbnail : RCMediaObject -> Html msg
viewThumbnail object =
    case object.mediaType of
        Exposition.RCImage ->
            let
                thumburl =
                    Exposition.customThumbUrl 120 object

                -- double for high-res screens
            in
            img
                [ src thumburl
                , style "object-fit" "cover"
                , style "width" "60px"
                , style "height" "60px"
                ]
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
                [ title "Preview"
                , controls True
                , loop settings.loop
                , autoplay settings.autoplay
                , class "video-preview"
                ]
                [ source [ src videoUrl, type_ "video/mp4" ] [] ]

        _ ->
            span [] [ text "No preview" ]
