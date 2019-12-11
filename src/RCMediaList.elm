module RCMediaList exposing
    ( Model
    , Msg(..)
    , PickerConfig
    , TableEditConfig
    , TableMessage(..)
    , empty
    , mediaListView
    , mediaPickerView
    , update
    , view
    )

import Bootstrap.Alert as Alert
import Bootstrap.Button as Button
import Bootstrap.Modal as Modal
import Bootstrap.Table as BTable
import Bootstrap.Utilities.Spacing as Spacing
import Exposition exposing (RCMediaObject)
import Html exposing (Html, audio, div, img, input, source, span, text, video)
import Html.Attributes exposing (autoplay, class, controls, id, loop, placeholder, src, style, title, type_)
import Html.Events exposing (onClick, onDoubleClick, onInput)
import RCMediaPreview exposing (PreviewSize(..), viewTableThumbnail, viewThumbnail)
import Reader exposing (Reader, andThen, ask, reader, run)
import Table exposing (defaultCustomizations)
import View exposing (defaultButton, mkButton)


type alias TableEditConfig msg =
    { editObject : String -> msg
    , deleteObject : RCMediaObject -> msg
    , insertObject : RCMediaObject -> msg
    , uploadButtonHtml : Html msg
    }


type alias PickerConfig msg =
    { insertObject : RCMediaObject -> msg
    , closeModal : msg
    , uploadButtonHtml : Html msg
    }


type Msg msg
    = SortableTableMessage TableMessage
    | MainMessage msg


type alias PreviewedMediaId =
    Maybe Int


type alias Model =
    { query : String
    , state : Table.State
    , previewedMediaId : PreviewedMediaId
    }


type TableMessage
    = SetQuery String
    | SetTableState Table.State
    | SetPreviewMediaId Int


makeTableMsg : Table.State -> Msg msg
makeTableMsg =
    SortableTableMessage << SetTableState


type alias ObjectAndActions msg =
    { actions : TableEditConfig msg
    , object : RCMediaObject
    }


type TableType
    = PickerTable
    | MediaTable


empty : Model
empty =
    { query = ""
    , state = Table.initialSort "ID"
    , previewedMediaId = Nothing
    }


configMediaList : PreviewedMediaId -> TableEditConfig msg -> Table.Config RCMediaObject (Msg msg)
configMediaList previewedMediaId messages =
    let
        buttons =
            mediaListButtons messages

        doubleClickAction =
            MainMessage << messages.editObject << String.fromInt << .id
    in
    Table.customConfig
        { toId = String.fromInt << .id
        , toMsg = makeTableMsg
        , columns =
            [ thumbnailColumn previewedMediaId
            , Table.stringColumn "ID" (String.fromInt << .id)
            , Table.stringColumn "Name" .name
            , buttons
            ]
        , customizations =
            { defaultCustomizations
                | tableAttrs = [ class "rc-media-table", class "mt-1" ]
                , rowAttrs = \object -> [ class "rc-media-table-row", onDoubleClick (doubleClickAction object) ]
            }
        }


configMediaPicker : PreviewedMediaId -> PickerConfig msg -> Table.Config RCMediaObject (Msg msg)
configMediaPicker previewedMediaId messages =
    let
        buttons =
            pickerButton messages

        doubleClickAction =
            MainMessage << messages.insertObject
    in
    Table.customConfig
        { toId = String.fromInt << .id
        , toMsg = makeTableMsg
        , columns =
            [ thumbnailColumn previewedMediaId
            , Table.stringColumn "ID" (String.fromInt << .id)
            , Table.stringColumn "Name" .name
            , buttons
            ]
        , customizations =
            { defaultCustomizations
                | tableAttrs = [ class "rc-media-table", class "rc-media-picker", class "mt-1" ]
                , rowAttrs = \object -> [ class "rc-media-table-row", onDoubleClick (doubleClickAction object) ]
            }
        }


mediaListView : Model -> List RCMediaObject -> TableEditConfig msg -> Html (Msg msg)
mediaListView model objects messages =
    let
        uploadBtn =
            Html.map MainMessage messages.uploadButtonHtml
    in
    view uploadBtn MediaTable model (configMediaList model.previewedMediaId messages) objects


thumbnailColumn : PreviewedMediaId -> Table.Column RCMediaObject (Msg msg)
thumbnailColumn previewedMediaId =
    Table.veryCustomColumn
        { name = "Preview"
        , viewData =
            \rcObject ->
                let
                    action =
                        SortableTableMessage <| SetPreviewMediaId rcObject.id

                    size =
                        case previewedMediaId of
                            Just id ->
                                if id == rcObject.id then
                                    PreviewPlayer

                                else
                                    PreviewSmall

                            Nothing ->
                                PreviewSmall
                in
                Table.HtmlDetails [] [ viewTableThumbnail rcObject size action ]
        , sorter = Table.unsortable
        }


editButton : TableEditConfig msg -> RCMediaObject -> Html (Msg msg)
editButton messages object =
    let
        makeEditMessage =
            MainMessage << messages.editObject << String.fromInt << .id
    in
    Button.button
        [ Button.small
        , Button.outlineInfo
        , Button.attrs [ Spacing.ml1, onClick <| makeEditMessage object ]
        ]
        [ text "Edit" ]


deleteButton : TableEditConfig msg -> RCMediaObject -> Html (Msg msg)
deleteButton messages object =
    let
        makeDeleteMessage =
            MainMessage << messages.deleteObject
    in
    Button.button
        [ Button.small
        , Button.outlineDanger
        , Button.attrs [ Spacing.ml1, onClick <| makeDeleteMessage object ]
        ]
        [ text "Delete" ]


pickerButton : PickerConfig msg -> Table.Column RCMediaObject (Msg msg)
pickerButton messages =
    Table.veryCustomColumn
        { name = "Edit"
        , viewData = insertButton messages
        , sorter = Table.unsortable
        }


insertButton : PickerConfig msg -> RCMediaObject -> Table.HtmlDetails (Msg msg)
insertButton messages object =
    let
        makeInsertMessage =
            MainMessage << messages.insertObject
    in
    Table.HtmlDetails []
        [ Button.button
            [ Button.small
            , Button.outlineSuccess
            , Button.attrs [ onClick <| makeInsertMessage object ]
            ]
            [ text "Insert" ]
        ]


mediaListButtons : TableEditConfig msg -> Table.Column RCMediaObject (Msg msg)
mediaListButtons messages =
    Table.veryCustomColumn
        { name = "Action"
        , viewData = editObjectButtons messages
        , sorter = Table.unsortable
        }


editObjectButtons : TableEditConfig msg -> RCMediaObject -> Table.HtmlDetails (Msg msg)
editObjectButtons messages object =
    Table.HtmlDetails []
        [ editButton messages object
        , deleteButton messages object
        ]


update : TableMessage -> Model -> Model
update message model =
    case message of
        SetQuery string ->
            { model | query = string }

        SetTableState state ->
            { model | state = state }

        SetPreviewMediaId id ->
            { model | previewedMediaId = Just id }


filterObjectsByName : String -> List RCMediaObject -> List RCMediaObject
filterObjectsByName query lst =
    case query of
        "" ->
            lst

        q ->
            let
                lowerQuery =
                    String.toLower q
            in
            List.filter (String.contains lowerQuery << String.toLower << .name) lst


view : Html (Msg msg) -> TableType -> Model -> Table.Config RCMediaObject (Msg msg) -> List RCMediaObject -> Html (Msg msg)
view upload tableType { query, state } tableConfig objectList =
    let
        domIdAndStyle : List (Html.Attribute (Msg msg))
        domIdAndStyle =
            case tableType of
                PickerTable ->
                    [ id "media-picker", style "display" "initial" ]

                MediaTable ->
                    [ id "media-list", style "display" "hidden" ]

        searchBox : Html (Msg msg)
        searchBox =
            input
                [ class "rc-media-table-searchbox"
                , placeholder "Search by name"
                , onInput (SortableTableMessage << SetQuery)
                ]
                []

        tableControls =
            div [ class "mt-1" ]
                [ upload, searchBox ]
    in
    case objectList of
        [] ->
            div domIdAndStyle
                [ Alert.simpleInfo [] [ text "Media list is empty. Hint: add a file by using the \"upload media\" button." ]
                ]

        nonEmptyObjectList ->
            let
                searchedObjects =
                    filterObjectsByName query nonEmptyObjectList
            in
            case searchedObjects of
                [] ->
                    div
                        domIdAndStyle
                        [ tableControls
                        , Alert.simpleInfo [] [ text <| "Cannot find any media named \"" ++ query ++ "\"" ]
                        ]

                results ->
                    div domIdAndStyle
                        [ tableControls
                        , Table.view tableConfig state results
                        ]


uploadButton : msg -> Html (Msg msg)
uploadButton uploadMessage =
    let
        aButton =
            defaultButton (MainMessage uploadMessage)
    in
    mkButton
        { aButton
            | icon = View.UploadCloud
            , offset = False
            , title = "Add video, audio, pdf or images files"
            , text = "Upload Media"
            , primary = False
            , otherAttrs = [ class "mr-1" ]
        }


mediaPickerView : ( Model, Modal.Visibility ) -> List RCMediaObject -> PickerConfig msg -> Html (Msg msg)
mediaPickerView ( model, visibility ) objectList messages =
    let
        tableConfig =
            configMediaPicker model.previewedMediaId messages

        uploadBtn =
            Html.map MainMessage messages.uploadButtonHtml

        tableList =
            view uploadBtn PickerTable model tableConfig objectList
    in
    Modal.config (MainMessage messages.closeModal)
        |> Modal.scrollableBody True
        |> Modal.large
        |> Modal.hideOnBackdropClick True
        |> Modal.h1 [] [ text "Insert media object" ]
        |> Modal.body []
            [ tableList
            ]
        |> Modal.footer []
            [ Button.button
                [ Button.secondary, Button.attrs [ onClick <| MainMessage messages.closeModal ] ]
                [ text "Cancel" ]
            ]
        |> Modal.attrs [ class "rc-media-picker" ]
        |> Modal.view visibility



{--
viewModalMediaPickerOld : Modal.Visibility -> List RCMediaObject -> PickerConfig msg -> Html msg
viewModalMediaPickerOld visibility objectList messages =
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
--}
