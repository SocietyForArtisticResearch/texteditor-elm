module RCMediaList exposing (PickerMessages, TableEditMessages, view, viewModalMediaPicker)

import Bootstrap.Alert as Alert
import Bootstrap.Button as Button
import Bootstrap.Modal as Modal
import Bootstrap.Table as BTable
import Bootstrap.Utilities.Spacing as Spacing
import Exposition exposing (RCMediaObject)
import Html exposing (Html, audio, div, img, source, span, text, video)
import Html.Attributes exposing (autoplay, class, controls, id, loop, src, style, title, type_)
import Html.Events exposing (onClick, onDoubleClick)
import RCMediaPreview exposing (PreviewSize(..), viewThumbnail)
import Table 
import View exposing (defaultButton, mkButton)


type alias TableEditMessages msg =
    { editObject : String -> msg
    , deleteObject : RCMediaObject -> msg
    , insertObject : RCMediaObject -> msg
    }


type alias PickerMessages msg =
    { insertObject : RCMediaObject -> msg
    , closeModal : msg
    , uploadMediaFileSelect : msg
    }


type MediaListMsg msg
    = SortableTableMessage Msg
    | EditMediaMessage msg


type Msg
    = SetQuery String
    | SetTableState Table.State


type alias Model msg =
    { query : String
    , state : Table.State
    }

init : Model
init messages =
    { query = ""
    , state = Table.initialSort "ID"
    }


config : TableEditMessages msg -> TableTable.Config RCMediaObject MediaListMessage msg
config messages =
    Table.config
        { toId = .id
        , toMsg = SetTableState
        , columns =
            [ thumbnailCel
            , stringColumn "ID" (String.fromInt << .id)
            , stringColumn "Name" .name
            , buttonColumn messages
            ]
        }

thumbnailcolumn : Table.Column RCMediaObject Msg
thumbnailcolumn =
    Table.veryCustomColumn
        { name = ""
        , viewData = (\rcObject -> viewThumbnail rcObject PreviewSmall)
        , sorter = Table.unsortable
        }

buttonColumn : TableEditMessages msg -> RCMediaObject -> Table.HtmlDetails msg

-- integer is object ID


update : Msg -> Model -> Model
update message model =
    case message of
        SetQuery string ->
            { model | query = string }

        SetTableState state ->
            { model | state = state }

 

view : Model -> List RCMediaObject -> TableMessages msg -> Html (MediaListMsg msg)
view { query, tableState } objectList messages =
    div []
        [ Input [ placeholder "Search by name", onInput SetQuery ]
        , Table.view config tableState objectList ]
            
    
    

view : Model -> List RCMediaObject -> TableMessages msg -> Html (MediaListMsg msg)
view objectList messages =
    case objectList of
        [] ->
            div [ class "media-list", style "display" "none" ]
                [ Alert.simpleInfo [] [ text "There are no objects yet. Hint: add a file by using the \"upload media\" button." ]
                ]

        _ ->
            let
                head =
                    BTable.simpleThead
                        [ BTable.th [] [ text "Preview" ]
                        , BTable.th [] [ text "Id" ]
                        , BTable.th [] [ text "Name" ]
                        , BTable.th
                            [ BTable.cellAttr <| class "edit-button-column"
                            ]
                            [ text "Edit" ]
                        ]

                rowFromRCObject : RCMediaObject -> BTable.Row msg
                rowFromRCObject object =
                    let
                        editButton =
                            Button.button
                                [ Button.small
                                , Button.outlineSecondary
                                , Button.attrs [ Spacing.ml1, onClick <| messages.editObject (String.fromInt object.id) ]
                                ]
                                [ text "Edit" ]

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
                    BTable.tr [ BTable.rowAttr <| onDoubleClick <| messages.editObject (String.fromInt object.id) ]
                        [ BTable.td [] [ viewThumbnail object PreviewSmall ]
                        , BTable.td [] [ text <| String.fromInt object.id ]
                        , BTable.td [] [ text object.name ]
                        , BTable.td [] [ editButton, removeButton ]
                        ]

                rows =
                    List.map rowFromRCObject objectList
            in
            div [ id "media-list", style "display" "none" ]
                [ BTable.table
                    { options = [ BTable.hover, BTable.striped, BTable.small ]
                    , thead = head
                    , tbody =
                        BTable.tbody [] rows
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
                            BTable.simpleThead
                                [ BTable.th [] [ text "Preview" ]
                                , BTable.th [] [ text "Id" ]
                                , BTable.th [] [ text "Name" ]
                                , BTable.th [] [ text "Insert" ]
                                ]

                        rowFromRCObject : RCMediaObject -> BTable.Row msg
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
                            BTable.tr [ BTable.rowAttr <| onDoubleClick <| messages.insertObject object ]
                                [ BTable.td [] [ viewThumbnail object PreviewSmall ]
                                , BTable.td [] [ text <| String.fromInt object.id ]
                                , BTable.td [] [ text object.name ]
                                , BTable.td [] [ insertButton ]
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
                                , title = "Add video, audio, pdf or images files"
                                , text = "Upload Media"
                                , primary = False
                            }
                        , BTable.table
                            { options = [ BTable.hover, BTable.striped, BTable.small ]
                            , thead = head
                            , tbody =
                                BTable.tbody [] rows
                            }
                        ]
    in
    Modal.config messages.closeModal
        |> Modal.scrollableBody True
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
