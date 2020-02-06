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
import Settings exposing (BuildType)
import Table exposing (defaultCustomizations)
import View exposing (defaultButton, mkButton)


type alias TableEditConfig msg =
    { editObject : String -> msg
    , deleteObject : RCMediaObject -> msg
    , insertObject : RCMediaObject -> msg
    , insertObjectAsLink : RCMediaObject -> msg
    , uploadButtonHtml : Html msg -- includes upload percentage, so it is controlled from Main.elm
    }


type alias PickerConfig msg =
    { insertObject : RCMediaObject -> msg
    , insertObjectAsLink : RCMediaObject -> msg
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
    | SetPreviewMediaId Int -- this selects which audio or video tool should show a tiny preview player. It is only loaded when the user clicks for better performance.


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


configMediaList : BuildType -> PreviewedMediaId -> TableEditConfig msg -> Table.Config RCMediaObject (Msg msg)
configMediaList buildType previewedMediaId messages =
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
            [ thumbnailColumn buildType previewedMediaId
            , Table.stringColumn "ID" (String.fromInt << .id)
            , Table.stringColumn "Name" .name
            , buttons
            ]
        , customizations =
            { defaultCustomizations
                | tableAttrs = [ class "rc-media-table" ]
                , rowAttrs = \object -> [ class "rc-media-table-row", onDoubleClick (doubleClickAction object) ]
            }
        }


configMediaPicker : BuildType -> PreviewedMediaId -> PickerConfig msg -> Table.Config RCMediaObject (Msg msg)
configMediaPicker buildType previewedMediaId messages =
    let
        buttons =
            pickerButtons messages

        doubleClickAction =
            MainMessage << messages.insertObject
    in
    Table.customConfig
        { toId = String.fromInt << .id
        , toMsg = makeTableMsg
        , columns =
            [ thumbnailColumn buildType previewedMediaId
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


mediaListView : BuildType -> Model -> List RCMediaObject -> TableEditConfig msg -> Html (Msg msg)
mediaListView buildType model objects messages =
    let
        uploadBtn =
            Html.map MainMessage messages.uploadButtonHtml
    in
    view uploadBtn MediaTable model (configMediaList buildType model.previewedMediaId messages) objects


thumbnailColumn : BuildType -> PreviewedMediaId -> Table.Column RCMediaObject (Msg msg)
thumbnailColumn buildType previewedMediaId =
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
                Table.HtmlDetails []
                    [ viewTableThumbnail buildType rcObject size action
                    ]
        , sorter = Table.increasingOrDecreasingBy <| Exposition.getMediaTypeString
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


pickerButtons : PickerConfig msg -> Table.Column RCMediaObject (Msg msg)
pickerButtons messages =
    Table.veryCustomColumn
        { name = "Edit"
        , viewData = (\object -> Table.HtmlDetails
                          []
                          [ insertButton  messages object
                          , insertAsLinkButton messages object ])
        , sorter = Table.unsortable
        }



makeInsertButton : Bool -> Bool -> String -> (RCMediaObject -> (Msg msg)) -> RCMediaObject -> Html (Msg msg)
makeInsertButton outline hasLeftMargin buttonText objectAction object =
    Button.button
        [ Button.small
        , if outline then Button.outlineSuccess else Button.success
        , Button.attrs <|
            [ onClick <| objectAction object ] ++ if hasLeftMargin then [class "ml-1"] else []
        ] 
        [ text buttonText ]

insertButton : PickerConfig msg -> RCMediaObject -> Html (Msg msg)
insertButton messages object =
    makeInsertButton False False "Insert media" (MainMessage << messages.insertObject) object


insertAsLinkButton : PickerConfig msg -> RCMediaObject -> Html (Msg msg)
insertAsLinkButton messages object =
    makeInsertButton True True "Insert link" (MainMessage << messages.insertObjectAsLink) object


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
            let
                newId =
                    case model.previewedMediaId of
                        Just currentId ->
                            if id == currentId then
                                Nothing

                            else
                                Just id

                        Nothing ->
                            Just id
            in
            { model | previewedMediaId = newId }


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
            div [ ]
                [ upload, searchBox ]
    in
    case objectList of
        [] ->
            div domIdAndStyle
                [ tableControls, Alert.simpleInfo [] [ text "Media list is empty. Hint: add a file by using the \"upload media\" button." ]
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


uploadButton : BuildType -> msg -> Html (Msg msg)
uploadButton buildType uploadMessage =
    let
        aButton =
            defaultButton (MainMessage uploadMessage)
    in
    mkButton buildType
        { aButton
            | icon = View.UploadCloud
            , offset = False
            , title = "Add video, audio, pdf or images files"
            , text = "Upload Media"
            , primary = False
            , otherAttrs = [ class "mr-1" ]
        }


mediaPickerView : BuildType -> ( Model, Modal.Visibility ) -> List RCMediaObject -> PickerConfig msg -> Html (Msg msg)
mediaPickerView buildType ( model, visibility ) objectList messages =
    let
        tableConfig =
            configMediaPicker buildType model.previewedMediaId messages

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
